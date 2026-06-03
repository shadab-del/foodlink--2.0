import { FoodCategory, DonationStatus, FoodDonation, UserProfile, UserRole } from '../types';

export const INDIAN_LOCATIONS = [
  "Whitefield, Bengaluru",
  "Koramangala, Bengaluru",
  "Indiranagar, Bengaluru",
  "Electronic City, Bengaluru",
  "JP Nagar, Bengaluru",
  "Gachibowli, Hyderabad",
  "Adayar, Chennai",
  "Andheri West, Mumbai",
  "Koregaon Park, Pune"
];

export const REALISTIC_STATS = {
  mealsSaved: 24850,
  ngosConnected: 48,
  activeDonors: 112,
  foodWastedReducedTons: 12.4
};

export const HOW_IT_WORKS_STEPS = [
  {
    step: 1,
    title: "Donor Uploads Surplus",
    description: "Restaurants, hotels, or functions upload information about freshly prepared surplus food with quantity and expiry timeline."
  },
  {
    step: 2,
    title: "NGOs Discover Nearby",
    description: "Local verified NGOs receive notifications and browse outstanding available meals in their immediate urban vicinity."
  },
  {
    step: 3,
    title: "NGO Requests Pickup",
    description: "An NGO claims interest, and a request is locked instantly for coordination. Phone numbers and directions are revealed."
  },
  {
    step: 4,
    title: "Food Reaches People",
    description: "Surplus is safely picked up and distributed to elder care, street shelters, or orphanages, with photos uploading on completion."
  }
];

export const TESTIMONIALS = [
  {
    id: 1,
    quote: "FoodLink helped us distribute over 300 meals during local events this month. The local real-time notification meant no fresh food went to the dumpster.",
    author: "Ramanathan K.",
    designation: "Director",
    organization: "Hope Foundation Bengaluru"
  },
  {
    id: 2,
    quote: "As a hotel owner, disposing of excellent excess food weighed heavily on our conscience. FoodLink connects us with Seva Care within minutes.",
    author: "Manish Sharma",
    designation: "Founder",
    organization: "Biryani Junction Hyderabad"
  },
  {
    id: 3,
    quote: "Our children at the orphanage receive high-quality nutritious dinners from the city's finest restaurants. A wonderful, transparent startup platform.",
    author: "Sister Clara",
    designation: "Managing Trustee",
    organization: "Asha Orphanage Chennai"
  }
];

export const SYSTEM_ACTIVITIES = [
  {
    id: "a1",
    message: "Hope Foundation picked up 25 meals of Paneer Butter Masala from Annapurna Mess.",
    timestamp: "10 mins ago"
  },
  {
    id: "a2",
    message: "Smile Shelter Trust requested idli and sambhar from Udupi Palace.",
    timestamp: "24 mins ago"
  },
  {
    id: "a3",
    message: "Hyderabad Dum House listed 50 meals of Chicken Dum Biryani.",
    timestamp: "1 hour ago"
  },
  {
    id: "a4",
    message: "Jeevan Jyoti Shelter completed delivery of 30 food packs from Sagar Ratna Café.",
    timestamp: "2 hours ago"
  },
  {
    id: "a5",
    message: "Chai & Tiffin Corner registered as a verified Food Donor in Electronic City, Bengaluru.",
    timestamp: "4 hours ago"
  }
];

// Rich set of prefilled food donation items to keep the dashboards alive and kicking
export const INITIAL_DONATIONS: FoodDonation[] = [
  {
    id: "don_1",
    donorId: "uid_donor_1",
    donorName: "Spice Garden Restaurant",
    foodName: "Veg Biryani and Curry",
    quantity: "40 Meals",
    category: FoodCategory.VEG,
    pickupLocation: "Koramangala, Bengaluru",
    preparedTime: "2026-05-25T10:00:00Z",
    expiryTime: "2026-05-25T21:00:00Z",
    imageURL: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=600&auto=format&fit=crop",
    status: DonationStatus.AVAILABLE,
    createdAt: "2026-05-25T11:00:00Z"
  },
  {
    id: "don_2",
    donorId: "uid_donor_2",
    donorName: "Udupi Palace",
    foodName: "Idli, Sambhar & Coconut Chutney",
    quantity: "60 Meals",
    category: FoodCategory.VEG,
    pickupLocation: "JP Nagar, Bengaluru",
    preparedTime: "2026-05-25T08:30:00Z",
    expiryTime: "2026-05-25T15:00:00Z",
    imageURL: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=600&auto=format&fit=crop",
    status: DonationStatus.AVAILABLE,
    createdAt: "2026-05-25T09:00:00Z"
  },
  {
    id: "don_3",
    donorId: "uid_donor_3",
    donorName: "Biryani Junction",
    foodName: "Premium Chicken Dum Biryani",
    quantity: "35 Meals",
    category: FoodCategory.NON_VEG,
    pickupLocation: "Indiranagar, Bengaluru",
    preparedTime: "2026-05-25T11:30:00Z",
    expiryTime: "2026-05-25T18:00:00Z",
    imageURL: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=600&auto=format&fit=crop",
    status: DonationStatus.AVAILABLE,
    createdAt: "2026-05-25T11:45:00Z"
  },
  {
    id: "don_4",
    donorId: "uid_donor_4",
    donorName: "Green Bowl Kitchen",
    foodName: "Mixed Dal Tadka & Chapati Packets",
    quantity: "25 Meals",
    category: FoodCategory.VEG,
    pickupLocation: "Whitefield, Bengaluru",
    preparedTime: "2026-05-25T12:00:00Z",
    expiryTime: "2026-05-25T20:00:00Z",
    imageURL: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=600&auto=format&fit=crop",
    status: DonationStatus.AVAILABLE,
    createdAt: "2026-05-25T12:05:00Z"
  },
  {
    id: "don_5",
    donorId: "uid_donor_5",
    donorName: "Hyderabad Dum House",
    foodName: "Egg Masala with Malabar Parotta",
    quantity: "30 Meals",
    category: FoodCategory.NON_VEG,
    pickupLocation: "Gachibowli, Hyderabad",
    preparedTime: "2026-05-25T09:00:00Z",
    expiryTime: "2026-05-25T16:00:00Z",
    imageURL: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop",
    status: DonationStatus.AVAILABLE,
    createdAt: "2026-05-25T09:15:00Z"
  },
  {
    id: "don_6",
    donorId: "uid_donor_6",
    donorName: "Sagar Ratna Café",
    foodName: "Masala Dosa Chow-Chow Bath",
    quantity: "15 Meals",
    category: FoodCategory.VEG,
    pickupLocation: "Koramangala, Bengaluru",
    preparedTime: "2026-05-25T07:00:00Z",
    expiryTime: "2026-05-25T13:30:00Z",
    imageURL: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop",
    status: DonationStatus.COMPLETED,
    createdAt: "2026-05-25T07:15:00Z"
  }
];

export const INITIAL_USERS: UserProfile[] = [
  {
    uid: "uid_donor_1",
    name: "Spice Garden Restaurant",
    email: "spicegarden@gmail.com",
    role: UserRole.DONOR,
    address: "Koramangala 4th Block, Bengaluru",
    phoneNumber: "+91 98765 43210",
    verified: true
  },
  {
    uid: "uid_donor_2",
    name: "Udupi Palace",
    email: "udupi@gmail.com",
    role: UserRole.DONOR,
    address: "JP Nagar 2nd Phase, Bengaluru",
    phoneNumber: "+91 97765 43211",
    verified: true
  },
  {
    uid: "uid_ngo_1",
    name: "Hope Foundation Bengaluru",
    email: "hope@gmail.com",
    role: UserRole.NGO,
    address: "Indiranagar, Bengaluru",
    phoneNumber: "+91 94451 22334",
    verified: true
  },
  {
    uid: "uid_ngo_2",
    name: "Smile Shelter Trust",
    email: "smile@gmail.com",
    role: UserRole.NGO,
    address: "Whitefield, Bengaluru",
    phoneNumber: "+91 95542 33445",
    verified: true
  },
  {
    uid: "uid_admin_1",
    name: "Dr. Anirudh Sen",
    email: "admin@foodlink.org",
    role: UserRole.ADMIN,
    address: "Koramangala, Bengaluru",
    phoneNumber: "+91 99001 12233",
    verified: true
  }
];
