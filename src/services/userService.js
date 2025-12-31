import { db } from '../config/firebase';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';

const USER_COLLECTION = "users";

// 1. Get All Users
export const getAllUsers = async () => {
  try {
    const snapshot = await getDocs(collection(db, USER_COLLECTION));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

// 2. Delete User
export const deleteUser = async (id) => {
  try {
    await deleteDoc(doc(db, USER_COLLECTION, id));
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};