import { db } from '../config/firebase';
import { collection, addDoc, getDocs, doc, deleteDoc } from 'firebase/firestore';

const SUB_CAT_COLLECTION = "subCategories";

// 1. Add Sub Category
// We store the name AND the parentCategoryId so we know who it belongs to
export const addSubCategory = async (data) => {
  await addDoc(collection(db, SUB_CAT_COLLECTION), {
    name: data.name,
    parentCategoryId: data.parentCategoryId,
    parentCategoryName: data.parentCategoryName, // Optional: helps display without extra queries
    createdAt: new Date()
  });
};

// 2. Get All Sub Categories
export const getSubCategories = async () => {
  const snapshot = await getDocs(collection(db, SUB_CAT_COLLECTION));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// 3. Delete Sub Category
export const deleteSubCategory = async (id) => {
  await deleteDoc(doc(db, SUB_CAT_COLLECTION, id));
};