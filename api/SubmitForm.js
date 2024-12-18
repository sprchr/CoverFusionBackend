import express from 'express'
import {User}  from "../firebaseConfig.js";
import { addDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
const router = express.Router();

// Middleware to parse JSON request bodies

// API endpoint to handle form submission
router.post("/submitForm", async (req, res) => {
  try {
    const { userId, ...formData } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required." });
    }

    // Save the data in Firestore under the userId
    const userDocRef = doc(User, userId); // Use userId as document reference
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      // If data exists, merge the new data with the existing document
      const existingData = userDocSnap.data(); // Get current data
      console.log("Existing Data:", existingData);
      console.log("New Data:", formData);
    
      // Merge the new fields with the existing fields
      const updatedData = {};
      for (const key in formData) {
        if (formData[key] !== undefined) {
          updatedData[key] = formData[key]; // Add only new/updated fields
        }
      }
    
      console.log("Updated Data:", updatedData);
    
      // Update only the necessary fields in Firestore
      await updateDoc(userDocRef, updatedData);
    } else {
      // Create a new document if it doesn't exist
      await setDoc(userDocRef, formData); // No nesting under `formData`
    }

    res.status(200).json({
      message: "Form submitted successfully to Firestore!",
      userId,
    });
  } catch (error) {
    console.error("Error saving form data to Firestore:", error);
    res.status(500).json({ error: "Failed to save form data to Firestore" });
  }
});


export default router