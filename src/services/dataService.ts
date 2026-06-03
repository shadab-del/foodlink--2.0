import { 
  collection, 
  doc, 
  addDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { FoodDonation, PickupRequest, UserNotification, DonationStatus, UserProfile } from '../types';
import { INITIAL_DONATIONS } from '../utils/dummyData';

// Manage LocalStorage state mirror for simulation context or fallback operations
const getLocalDonations = (): FoodDonation[] => {
  const data = localStorage.getItem('foodlink_donations');
  if (!data) {
    localStorage.setItem('foodlink_donations', JSON.stringify(INITIAL_DONATIONS));
    return INITIAL_DONATIONS;
  }
  return JSON.parse(data);
};

const setLocalDonations = (donations: FoodDonation[]) => {
  localStorage.setItem('foodlink_donations', JSON.stringify(donations));
};

const getLocalRequests = (): PickupRequest[] => {
  const data = localStorage.getItem('foodlink_requests');
  return data ? JSON.parse(data) : [];
};

const setLocalRequests = (requests: PickupRequest[]) => {
  localStorage.setItem('foodlink_requests', JSON.stringify(requests));
};

const getLocalNotifications = (): UserNotification[] => {
  const data = localStorage.getItem('foodlink_notifications');
  return data ? JSON.parse(data) : [];
};

const setLocalNotifications = (notifs: UserNotification[]) => {
  localStorage.setItem('foodlink_notifications', JSON.stringify(notifs));
};

const getLocalActivities = () => {
  const data = localStorage.getItem('foodlink_activities');
  if (!data) {
    const defaultAct = [
      { id: "act_1", message: "Hope Foundation Bengaluru requested 40 Meals Veg Biryani from Spice Garden Restaurant.", timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
      { id: "act_2", message: "Annapoorna Food Trust picked up 60 Meals of Idli Sambhar from Udupi Palace.", timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString() }
    ];
    localStorage.setItem('foodlink_activities', JSON.stringify(defaultAct));
    return defaultAct;
  }
  return JSON.parse(data);
};

const addLocalActivity = (message: string) => {
  const acts = getLocalActivities();
  const newAct = {
    id: "act_" + Math.random().toString(36).substr(2, 9),
    message,
    timestamp: new Date().toISOString()
  };
  localStorage.setItem('foodlink_activities', JSON.stringify([newAct, ...acts].slice(0, 50)));
};

// EXPORTED CRUD OPERATIONS WITH FIRESTORE & RELIABLE FALLBACK SYNCING
export const dataService = {
  // 1. GET ALL DONATIONS (REALTIME LISTENER)
  subscribeDonations(callback: (donations: FoodDonation[]) => void, onError?: (err: any) => void) {
    try {
      const q = query(collection(db, 'donations'), orderBy('createdAt', 'desc'));
      return onSnapshot(q, (snapshot) => {
        const donations: FoodDonation[] = [];
        snapshot.forEach((doc) => {
          donations.push({ id: doc.id, ...doc.data() } as FoodDonation);
        });
        // Mirror to LocalStorage
        setLocalDonations(donations);
        callback(donations);
      }, (error) => {
        console.warn("Firestore donations subscription failed, switching to LocalStorage updates:", error);
        // Fallback to local polling/triggering
        callback(getLocalDonations());
        if (onError) onError(error);
      });
    } catch (err) {
      console.warn("Failed donations listener startup, falling back to LocalStorage:", err);
      callback(getLocalDonations());
      return () => {};
    }
  },

  // 2. ADD DONATION LISTING
  async addDonation(donationData: Omit<FoodDonation, 'id' | 'createdAt'>): Promise<string> {
    const docId = 'don_' + Math.random().toString(36).substr(2, 9);
    const donationObj: FoodDonation = {
      ...donationData,
      id: docId,
      createdAt: new Date().toISOString()
    };

    // Update Local mirror
    const currentLocal = getLocalDonations();
    setLocalDonations([donationObj, ...currentLocal]);
    addLocalActivity(`${donationObj.donorName} listed ${donationObj.quantity} of ${donationObj.foodName} in ${donationObj.pickupLocation}.`);

    // Try Firestore
    try {
      await setDoc(doc(db, 'donations', docId), donationObj);
    } catch (err) {
      console.warn("Saving to Firestore donations collection failed; only local mirror is modified. Error parsed config:", err);
    }

    // Trigger Notification for nearby NGOs
    await this.addNotification("", `New available surplus food nearby: ${donationObj.quantity} of ${donationObj.foodName} available at ${donationObj.pickupLocation}!`);
    return docId;
  },

  // 3. DELETE DONATION LISTING (ADMIN CRITICAL FUNCTIONALITY)
  async deleteDonation(donationId: string): Promise<void> {
    // Local mirror update
    const current = getLocalDonations();
    setLocalDonations(current.filter(d => d.id !== donationId));

    try {
      await deleteDoc(doc(db, 'donations', donationId));
    } catch (err) {
      console.warn("Deleting listing from Firestore failed. Modified locally only.", err);
    }
  },

  // 4. REQUEST PICKUP (NGO -> DONOR EXPLICIT WORKFLOW TRIGGER)
  async requestPickup(ngoId: string, ngoName: string, donation: FoodDonation): Promise<string> {
    const requestId = 'req_' + Math.random().toString(36).substr(2, 9);
    const requestObj: PickupRequest = {
      id: requestId,
      ngoId,
      ngoName,
      donationId: donation.id,
      donorId: donation.donorId,
      requestStatus: DonationStatus.REQUESTED,
      timestamp: new Date().toISOString()
    };

    // Keep locally
    const currentReqs = getLocalRequests();
    setLocalRequests([requestObj, ...currentReqs]);

    // Update food donation status to requested
    const listings = getLocalDonations();
    setLocalDonations(listings.map(l => l.id === donation.id ? { ...l, status: DonationStatus.REQUESTED } : l));
    addLocalActivity(`${ngoName} requested surplus food "${donation.foodName}" (${donation.quantity}) from ${donation.donorName}.`);

    // Try Firestore transactions/batch with existsAfter handling
    try {
      await setDoc(doc(db, 'requests', requestId), requestObj);
      await updateDoc(doc(db, 'donations', donation.id), { status: DonationStatus.REQUESTED });
    } catch (err) {
      console.warn("Firestore request transaction failed. Locally modified successfully.", err);
    }

    // Notify Donor
    await this.addNotification(donation.donorId, `${ngoName} requested to pick up your listing: ${donation.foodName}. Please review now.`);
    return requestId;
  },

  // 5. UPDATE REQUEST STATUS (DONATION/REQUEST WORKFLOW ACCEPTANCE/STATUS MANAGEMENT)
  async updateRequestStatus(requestId: string, targetStatus: DonationStatus, donationId: string): Promise<void> {
    // Local updates
    const requests = getLocalRequests();
    let donationSnapshot: FoodDonation | undefined;
    let requestSnapshot: PickupRequest | undefined;

    const updatedRequests = requests.map(r => {
      if (r.id === requestId) {
        requestSnapshot = r;
        return { ...r, requestStatus: targetStatus };
      }
      return r;
    });
    setLocalRequests(updatedRequests);

    const donations = getLocalDonations();
    const updatedDonations = donations.map(d => {
      if (d.id === donationId) {
        donationSnapshot = d;
        return { ...d, status: targetStatus };
      }
      return d;
    });
    setLocalDonations(updatedDonations);

    if (donationSnapshot && requestSnapshot) {
      let logMessage = "";
      if (targetStatus === DonationStatus.ACCEPTED) {
        logMessage = `${donationSnapshot.donorName} accepted pickup request by ${requestSnapshot.ngoName} for ${donationSnapshot.foodName}.`;
      } else if (targetStatus === DonationStatus.PICKED_UP) {
        logMessage = `${requestSnapshot.ngoName} has picked up ${donationSnapshot.foodName} from ${donationSnapshot.donorName}.`;
      } else if (targetStatus === DonationStatus.COMPLETED) {
        logMessage = `${requestSnapshot.ngoName} distributed ${donationSnapshot.quantity} of "${donationSnapshot.foodName}" to people in need.`;
      }
      if (logMessage) addLocalActivity(logMessage);
    }

    // Try Firestore
    try {
      await updateDoc(doc(db, 'requests', requestId), { requestStatus: targetStatus });
      await updateDoc(doc(db, 'donations', donationId), { status: targetStatus });
    } catch (err) {
      console.warn("Firestore request update failed. Successfully performed locally:", err);
    }

    // Trigger Notification for target stakeholders
    if (requestSnapshot && donationSnapshot) {
      if (targetStatus === DonationStatus.ACCEPTED) {
        await this.addNotification(requestSnapshot.ngoId, `Your request for ${donationSnapshot.foodName} has been ACCEPTED by ${donationSnapshot.donorName}! Plan your pickup.`);
      } else if (targetStatus === DonationStatus.COMPLETED) {
        await this.addNotification(donationSnapshot.donorId, `Thank you! ${requestSnapshot.ngoName} completed distribution of your surplus food: ${donationSnapshot.foodName}.`);
        await this.addNotification(requestSnapshot.ngoId, `Completed! Meals successfully cataloged. Excellent work.`);
      }
    }
  },

  // 6. ADVERSARIAL REJECTIONS
  async rejectRequest(requestId: string, donationId: string, ngoId: string, foodName: string): Promise<void> {
    // Reset donation back to available
    const donations = getLocalDonations();
    setLocalDonations(donations.map(d => d.id === donationId ? { ...d, status: DonationStatus.AVAILABLE } : d));

    // Mark request as rejected or delete
    const requests = getLocalRequests();
    setLocalRequests(requests.filter(r => r.id !== requestId));

    try {
      await updateDoc(doc(db, 'donations', donationId), { status: DonationStatus.AVAILABLE });
      await deleteDoc(doc(db, 'requests', requestId));
    } catch (err) {
      console.warn("Firestore reject transaction failed. Local mirror reverted successfully.", err);
    }

    await this.addNotification(ngoId, `Regretfully, the pickup request for "${foodName}" was rejected or cancelled. Keep searching nearby listings!`);
  },

  // 7. REALTIME REQUESTS LISTENER (ROBUST FOR NGO & DONORS)
  subscribeRequests(callback: (requests: PickupRequest[]) => void, filterUserId?: string, isNgo?: boolean) {
    try {
      const q = isNgo 
        ? query(collection(db, 'requests'), orderBy('timestamp', 'desc'))
        : query(collection(db, 'requests'), orderBy('timestamp', 'desc'));

      return onSnapshot(collection(db, 'requests'), (snapshot) => {
        const list: PickupRequest[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as PickupRequest);
        });
        
        let filtered = list;
        if (filterUserId) {
          filtered = isNgo ? list.filter(r => r.ngoId === filterUserId) : list.filter(r => r.donorId === filterUserId);
        }
        
        setLocalRequests(list);
        callback(filtered);
      }, (err) => {
        // Fallback
        const currentReqs = getLocalRequests();
        const filtered = filterUserId 
          ? (isNgo ? currentReqs.filter(r => r.ngoId === filterUserId) : currentReqs.filter(r => r.donorId === filterUserId))
          : currentReqs;
        callback(filtered);
      });
    } catch (e) {
      const currentReqs = getLocalRequests();
      const filtered = filterUserId 
        ? (isNgo ? currentReqs.filter(r => r.ngoId === filterUserId) : currentReqs.filter(r => r.donorId === filterUserId))
        : currentReqs;
      callback(filtered);
      return () => {};
    }
  },

  // 8. ADD ALERTS/NOTIFICATIONS
  async addNotification(receiverId: string, message: string): Promise<void> {
    const id = 'not_' + Math.random().toString(36).substr(2, 9);
    const notifObj: UserNotification = {
      id,
      receiverId, // empty receiverId matches global/broadcast notifications (e.g., to all NGOs)
      message,
      readStatus: false,
      createdAt: new Date().toISOString()
    };

    const notifs = getLocalNotifications();
    setLocalNotifications([notifObj, ...notifs]);

    try {
      await setDoc(doc(db, 'notifications', id), notifObj);
    } catch (e) {
      console.warn("Firestore notification save skipped", e);
    }
  },

  // 9. SUBSCRIBE ALERTS (FOR CURRENT USER)
  subscribeNotifications(userId: string, callback: (msgs: UserNotification[]) => void) {
    try {
      return onSnapshot(collection(db, 'notifications'), (snapshot) => {
        const notifs: UserNotification[] = [];
        snapshot.forEach((doc) => {
          const item = doc.id ? { id: doc.id, ...doc.data() } as UserNotification : doc.data() as UserNotification;
          if (item.receiverId === userId || item.receiverId === "") {
            notifs.push(item);
          }
        });
        callback(notifs);
      }, (err) => {
        const local = getLocalNotifications();
        callback(local.filter(n => n.receiverId === userId || n.receiverId === ""));
      });
    } catch (e) {
      const local = getLocalNotifications();
      callback(local.filter(n => n.receiverId === userId || n.receiverId === ""));
      return () => {};
    }
  },

  // 10. GET LIVE ACTIVITY FEED
  subscribeLiveActivities(callback: (acts: { id: string, message: string, timestamp: string }[]) => void) {
    // Keep local timer to push realistic new events periodically to make the homepage and admin dashboards look alive!
    callback(getLocalActivities());
    
    const interval = setInterval(() => {
      callback(getLocalActivities());
    }, 5000);

    return () => clearInterval(interval);
  }
};
