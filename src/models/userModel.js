  /*import { db } from "../config/firebaseConfig.js";

  export class UserModel {
    constructor() {
      this.collection = db.collection("Users");
    }

    // Assuming this is in your RideModel.js or a similar service module
    // Assuming this is in your RideModel.js or a similar service module
    async createUser(userData) {
      try {
        // Add the user data to Firestore collection
        const docRef = await this.collection.add(userData);

        // Retrieve the created document's data
        const newUser = await docRef.get();

        // Check if the document exists
        if (!newUser.exists) {
          throw new Error("Failed to retrieve the created user.");
        }

        // Return the document data along with the generated document ID
        return { id: docRef.id, ...newUser.data() };
      } catch (error) {
        console.error("Error creating user:", error);
        throw new Error(
          "The backend did not return a valid object or missing ID for the created user."
        );
      }
    }


    async getUserByEmail(emailuser) {
      try {
        if (!emailuser) {
          throw new Error("Email is required");
        }
    
        const querySnapshot = await this.collection
          .where("email", "==", emailuser)
          .limit(1) // 🔒 On limite à un seul résultat par sécurité
          .get();
    
        if (querySnapshot.empty) {
          throw new Error(`User with email "${emailuser}" not found`);
        }
    
        const userDoc = querySnapshot.docs[0];
        return { id: userDoc.id, ...userDoc.data() };
      } catch (error) {
        console.error("Error fetching user by email:", error.message);
        throw error;
      }
    }

    async getUserById(userId) {
      try {
        // Query Firestore where the 'id' field matches the userId
        const querySnapshot = await this.collection
          .where("id", "==", userId)
          .get();

        // Check if any document matches the query
        if (querySnapshot.empty) {
          throw new Error("User not found");
        }

        // Assuming that there should only be one matching document
        const userDoc = querySnapshot.docs[0];

        // Return the data along with the Firestore document ID
        return { id: userDoc.id, ...userDoc.data() };
      } catch (error) {
        console.error("Error fetching user by attribute 'id':", error);
        throw error;
      }
    }

    async getAllUsers() {
      const snapshot = await this.collection.get();
      const users = [];
      snapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });
      return users;
    }
  }

  export default new UserModel();
*/