import { db, storage } from '../config/firebase';
import { collection, addDoc, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const BANNER_COLLECTION = "home_banners";

// 1. Upload Image
export const uploadBannerImage = async (file) => {
  if (!file) return null;
  const storageRef = ref(storage, `banners/${Date.now()}-${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
};

// 2. Add Banner to Database
export const addBanner = async (bannerData) => {
  await addDoc(collection(db, BANNER_COLLECTION), {
    ...bannerData,
    createdAt: new Date()
  });
};

// 3. Get All Banners
export const getBanners = async () => {
  const snapshot = await getDocs(collection(db, BANNER_COLLECTION));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// 4. Delete Banner
export const deleteBanner = async (id) => {
  await deleteDoc(doc(db, BANNER_COLLECTION, id));
};