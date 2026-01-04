import { db } from '../config/firebase';
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';

// Ensure this matches your Firestore collection name exactly
const SUB_CAT_COLLECTION = "subcategories"; 

// 1. Add Sub Category
export const addSubCategory = async (data) => {
  await addDoc(collection(db, SUB_CAT_COLLECTION), {
    name: data.name,
    parentCategoryId: data.parentCategoryId,
    parentCategoryName: data.parentCategoryName || '', 
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

// 4. ✅ NEW: Update Sub Category (Required for Edit)
export const updateSubCategory = async (id, data) => {
  const subCatRef = doc(db, SUB_CAT_COLLECTION, id);
  await updateDoc(subCatRef, {
    ...data,
    updatedAt: new Date()
  });
};

// 5. ✅ NEW: Get Single Sub Category by ID (Required for Edit Page Load)
export const getSubCategoryById = async (id) => {
  const docRef = doc(db, SUB_CAT_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    return null;
  }
};