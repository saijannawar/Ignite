import { db, storage } from '../config/firebase';
import { collection, addDoc, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const CATEGORY_COLLECTION = "categories";

// 1. Upload Category Image
export const uploadCategoryImage = async (file) => {
  if (!file) return null;
  const storageRef = ref(storage, `categories/${Date.now()}-${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
};

// 2. Add Category
export const addCategory = async (categoryData) => {
  try {
    await addDoc(collection(db, CATEGORY_COLLECTION), {
      ...categoryData,
      createdAt: new Date()
    });
  } catch (error) {
    throw error;
  }
};

// 3. Get All Categories
export const getCategories = async () => {
  const snapshot = await getDocs(collection(db, CATEGORY_COLLECTION));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// 4. Delete Category
export const deleteCategory = async (id) => {
  await deleteDoc(doc(db, CATEGORY_COLLECTION, id));
};