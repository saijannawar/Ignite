import { db, storage } from '../config/firebase';
import { 
  collection, addDoc, getDocs, deleteDoc, doc, query, orderBy 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const CAT_COLLECTION = "blog_categories";

// 1. Upload Category Image (✅ NEW)
export const uploadCategoryImage = async (file) => {
  if (!file) return null;
  const storageRef = ref(storage, `blog_categories/${Date.now()}-${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
};

// 2. Add Category (✅ UPDATED to accept imageUrl)
export const addBlogCategory = async (name, imageUrl) => {
  try {
    await addDoc(collection(db, CAT_COLLECTION), {
      name: name,
      imageUrl: imageUrl || '', // Save the image link
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error adding category:", error);
    throw error;
  }
};

// 3. Get All Categories
export const getBlogCategories = async () => {
  try {
    const q = query(collection(db, CAT_COLLECTION), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    const snapshot = await getDocs(collection(db, CAT_COLLECTION));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};

// 4. Delete Category
export const deleteBlogCategory = async (id) => {
  await deleteDoc(doc(db, CAT_COLLECTION, id));
};