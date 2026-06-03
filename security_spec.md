# Zero-Trust Security Specification for FoodLink

This security specification profiles structural data invariants, profiles the "Dirty Dozen" hostile payloads, and outlines defensive test architectures to lock down our sub-collections against identity spoofing and privilege escalation.

## 1. Core Data Invariants

1. **Self-Contained Profile Guard**: No user can write, update, or claim an identity record utilizing a UID value distinct from their active `request.auth.uid`.
2. **Admin-Only Approve Guard**: Non-admin users can write profiles, but are strictly blocked from editing or self-assigning their own security `verified` flag during account creation or update.
3. **Immutability of Donor Reference**: Once listed, a surplus food item's `donorId` cannot be updated, and must match the creator's UID.
4. **Transition-Phase Synchronization**: When an NGO requests to pick up a listing, they can only request food entries with status `available`.
5. **No Blind Global Reads (Blanket Reads Blocked)**_**: Blanket unconstrained reads on user emails, phones, and addresses are strictly prohibited. Non-owners are denied direct access to other partners' profiles except when coordinating active, approved pickups.

---

## 2. The "Dirty Dozen" Attack Vectors

Here are 12 specific JSON payloads engineered to breach system invariants:

### Identity & Privilege Escalation (PII)

#### 1. Self-Assigned Administrative Privilege
* **Description**: A malicious donor registers with a payload setting their auth profile as verified: true.
* **Payload**: `users/malicious_user1`
```json
{
  "uid": "malicious_user1",
  "name": "Malicious Attacker",
  "email": "attacker@gmail.com",
  "role": "donor",
  "address": "JP Nagar, Bengaluru",
  "phoneNumber": "+91 90000 00000",
  "verified": true
}
```
* **Mitigation**: Security rules must mandate `verified == false` unless written by an admin look up on `admins` database collection.

#### 2. Identity Spoofing (Owner Forgery)
* **Description**: Authenticated user `victim_1` is spoofed by `attacker_1` attempting to update `victim_1`'s profile metadata.
* **Payload**: `users/victim_1`
```json
{
  "name": "Victim Clean Name Edited by Attacker"
}
```
* **Mitigation**: Allow write ONLY if `request.auth.uid == userId`.

#### 3. Shadow Field Injection (Junk Data Pollution)
* **Description**: Trying to insert obsolete billing credentials or system flags to corrupt user profiles.
* **Payload**: `users/attacker_1`
```json
{
  "uid": "attacker_1",
  "name": "Attacker",
  "email": "attacker@email.com",
  "role": "ngo",
  "address": "Koramangala",
  "phoneNumber": "+91 92222 22222",
  "verified": false,
  "creditCoins": 999999,
  "systemBypass": true
}
```
* **Mitigation**: Enforce rigid keys matching checking via `keys().hasAll()` and strict size enforcement.

---

### Surplus Listings & Fraudulent Uploads

#### 4. Orphaned Record Forgery
* **Description**: Authenticated donor posts surplus listing referencing an un-registered or fictitious restaurant owner.
* **Payload**: `donations/don_fake`
```json
{
  "donorId": "non_existent_zombie_uid",
  "donorName": "Zombie Kitchen",
  "foodName": "Veg Noodles",
  "quantity": "25 Meals",
  "category": "veg",
  "pickupLocation": "Indiranagar",
  "preparedTime": "2026-05-25T10:00:00Z",
  "expiryTime": "2026-05-25T18:00:00Z",
  "status": "available",
  "createdAt": "2026-05-25T10:00:00Z"
}
```
* **Mitigation**: Verify `incoming().donorId == request.auth.uid`.

#### 5. Expiry Time Poisoning
* **Description**: Attacker tries to post pre-expired food values to DOS the NGO browsing panels.
* **Payload**: `donations/don_toxic`
```json
{
  "donorId": "attacker_uid",
  "donorName": "Attacker Café",
  "foodName": "Expired Rice",
  "quantity": "50 meals",
  "category": "veg",
  "pickupLocation": "Bengaluru",
  "preparedTime": "2025-05-25T10:00:00Z",
  "expiryTime": "2025-05-25T11:00:00Z",
  "status": "available",
  "createdAt": "2026-05-25T12:00:00Z"
}
```
* **Mitigation**: Expiry time must exceed the creation time.

#### 6. Shadow State Transition (Bypassing Available status)
* **Description**: Listing food and setting status directly as `completed` without active NGO claims.
* **Payload**: `donations/don_malicious`
```json
{
  "donorId": "donor_uid",
  "foodName": "Biryani",
  "quantity": "100 Meals",
  "category": "non-veg",
  "status": "completed"
}
```
* **Mitigation**: Setup status must strictly be `available` during create operations.

---

### Pickup Theft & Hijack Claims

#### 7. NGO Theft (Double Booking)
* **Description**: A malicious NGO tries to hijack/reserve food that has already been claimed by a legitimate NGO.
* **Payload**: Update `donations/don_already_claimed`
```json
{
  "status": "requested",
  "currentClaimer": "thief_ngo_uid"
}
```
* **Mitigation**: Prevent double claim writes on status update using `affectedKeys()` constraints if previous status is not `available`.

#### 8. Claiming Food While Unverified
* **Description**: Unverified NGO bypasses client-side button block to write a claim request for food.
* **Payload**: `requests/req_unverified`
```json
{
  "ngoId": "unverified_ngo_uid",
  "ngoName": "Scam Foundation",
  "donationId": "don_active",
  "requestStatus": "requested"
}
```
* **Mitigation**: Security rules must look up `/users/$(request.auth.uid)` and verify `verified == true` before permitting writes on requests.

#### 9. Self-Approval of Pickup Requests
* **Description**: NGO self-approves their own claim by writing of choice Status `accepted`.
* **Payload**: Update `requests/req_active`
```json
{
  "requestStatus": "accepted"
}
```
* **Mitigation**: Verify that only the listing's master donor ID can transition status from `requested` to `accepted`.

---

### Malicious Inputs & Wallet Exhaustion

#### 10. String Overflow Attack (Denial of Wallet)
* **Description**: Listing a food item where the title is 2MB to blow up Firestore database storage.
* **Payload**: `donations/don_bloated`
```json
{
  "foodName": "[REPEATED AAAAA... 10000 TIMES]"
}
```
* **Mitigation**: Enforce string size constraints on all properties: `foodName.size() <= 100`.

#### 11. Obsolete Notification Injection
* **Description**: Spammer registers notifications targeting random recipient stakeholders.
* **Payload**: `notifications/not_spam`
```json
{
  "receiverId": "target_victim_donor",
  "message": "Click here to win a lottery!",
  "readStatus": false,
  "createdAt": "2026-05-25T12:00:00Z"
}
```
* **Mitigation**: System-level notify checks only authorize creation if sender matches system contexts or limits.

#### 12. Complete Deletion of Transactions
* **Description**: NGO or Donor attempts to delete requests history logs to wipe records of high wastage statistics.
* **Payload**: Call Delete on `requests/req_logged`
```json
{
  "id": "req_logged"
}
```
* **Mitigation**: Delete access strictly locked down list profiles.

---

## 3. Security Assertions Test Suite

```typescript
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";

describe("FoodLink Zero-Trust Threat Audits", () => {
  let testEnv: any;

  before(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: "foodlink-security-test",
      firestore: {
        rules: require("fs").readFileSync("firestore.rules", "utf8"),
      },
    });
  });

  after(async () => {
    await testEnv.cleanup();
  });

  it("Vector 1: Deny self-assigned verified status inside profile creations", async () => {
    const context = testEnv.authenticatedContext("donor_attacker", { email_verified: true });
    await assertFails(
      context.firestore().collection("users").doc("donor_attacker").set({
        uid: "donor_attacker",
        name: "Attacker Bistro",
        email: "attacker@gmail.com",
        role: "donor",
        address: "Koramangala, Bengaluru",
        phoneNumber: "+91 99999 99999",
        verified: true // Malicious privilege escalation
      })
    );
  });

  it("Vector 8: Block unverified NGO from claims requesting available surplus food", async () => {
    const context = testEnv.authenticatedContext("unverified_ngo_uid", { email_verified: true });
    await assertFails(
      context.firestore().collection("requests").doc("req_scam").set({
        ngoId: "unverified_ngo_uid",
        ngoName: "Scam Charity",
        donationId: "don_valid_1",
        donorId: "donor_restaurant_1",
        requestStatus: "requested",
        timestamp: new Date().toISOString()
      })
    );
  });
});
```
