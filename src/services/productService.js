import { db, storage } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  deleteDoc, 
  updateDoc, 
  getDoc,
  setDoc,       
  arrayUnion,
  query,       
  where,       
  orderBy      
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// ✅ Centralized Collection Names
const PRODUCT_COLLECTION = "products";
const BANNER_COLLECTION = "homeBanners"; // Default for Slides
const ORDER_COLLECTION = "orders";
const USER_COLLECTION = "users";

// ==============================
// 1. IMAGE UPLOAD SERVICES
// ==============================

export const uploadProductImages = async (files) => {
  if (!files || files.length === 0) return [];
  const uploadPromises = files.map(async (file) => {
    const storageRef = ref(storage, `products/${Date.now()}-${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  });
  return await Promise.all(uploadPromises);
};

export const uploadProductImage = async (file) => {
  if (!file) return null;
  const storageRef = ref(storage, `products/${Date.now()}-${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
};

export const uploadBannerImage = async (file) => {
  if (!file) return null;
  const storageRef = ref(storage, `banners/${Date.now()}-${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
};

// ==============================
// 2. PRODUCT SERVICES
// ==============================

export const addProduct = async (productData) => {
  try {
    await addDoc(collection(db, PRODUCT_COLLECTION), {
      ...productData,
      createdAt: new Date(),
      price: parseFloat(productData.price),
      originalPrice: parseFloat(productData.originalPrice || 0),
      stock: parseInt(productData.stock || 0),
      discount: parseInt(productData.discount || 0),
      rating: parseInt(productData.rating || 0),
      category: productData.category,
      categoryName: productData.categoryName || '',
      subCategory: productData.subCategory || '',
      images: productData.images || [],
      imageUrl: productData.imageUrl || (productData.images && productData.images.length > 0 ? productData.images[0] : ''),
    });
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
};

export const getProducts = async () => {
  const snapshot = await getDocs(collection(db, PRODUCT_COLLECTION));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const deleteProduct = async (id) => {
  await deleteDoc(doc(db, PRODUCT_COLLECTION, id));
};

export const getProductById = async (id) => {
  try {
    const productRef = doc(db, PRODUCT_COLLECTION, id);
    const snapshot = await getDoc(productRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    } else {
      console.error("No such product found!");
      return null;
    }
  } catch (error) {
    console.error("Error getting product:", error);
    throw error;
  }
};

export const addProductReview = async (productId, reviewData) => {
  try {
    const productRef = doc(db, PRODUCT_COLLECTION, productId);
    await updateDoc(productRef, {
      reviews: arrayUnion(reviewData)
    });
  } catch (error) {
    console.error("Error adding review:", error);
    throw error;
  }
};

// ==============================
// 3. USER & WISHLIST SERVICES
// ==============================

export const addToWishlist = async (userId, product) => {
  try {
    const wishlistRef = doc(db, USER_COLLECTION, userId, "wishlist", product.id);
    await setDoc(wishlistRef, {
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.imageUrl || (product.images && product.images[0]) || '',
      addedAt: new Date()
    });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    throw error;
  }
};

export const getUserWishlist = async (userId) => {
  try {
    const wishlistRef = collection(db, USER_COLLECTION, userId, "wishlist");
    const snapshot = await getDocs(wishlistRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return [];
  }
};

export const removeFromWishlist = async (userId, productId) => {
  try {
    const itemRef = doc(db, USER_COLLECTION, userId, "wishlist", productId);
    await deleteDoc(itemRef);
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    throw error;
  }
};

export const addUserAddress = async (userId, addressData) => {
  try {
    const addressRef = collection(db, USER_COLLECTION, userId, "addresses");
    const docRef = await addDoc(addressRef, addressData);
    return { id: docRef.id, ...addressData };
  } catch (error) {
    console.error("Error adding address:", error);
    throw error;
  }
};

export const getUserAddresses = async (userId) => {
  try {
    const addressRef = collection(db, USER_COLLECTION, userId, "addresses");
    const snapshot = await getDocs(addressRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return [];
  }
};

export const deleteUserAddress = async (userId, addressId) => {
  try {
    const addressRef = doc(db, USER_COLLECTION, userId, "addresses", addressId);
    await deleteDoc(addressRef);
  } catch (error) {
    console.error("Error deleting address:", error);
    throw error;
  }
};

export const updateUserAddress = async (userId, addressId, addressData) => {
  try {
    const addressRef = doc(db, USER_COLLECTION, userId, "addresses", addressId);
    await updateDoc(addressRef, addressData);
  } catch (error) {
    console.error("Error updating address:", error);
    throw error;
  }
};

// ==============================
// 4. ORDER SERVICES
// ==============================

export const placeOrder = async (userId, orderData) => {
  try {
    const docRef = await addDoc(collection(db, ORDER_COLLECTION), {
      userId: userId,
      ...orderData,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error placing order:", error);
    throw error;
  }
};

export const getUserOrders = async (userId) => {
  try {
    const q = query(
      collection(db, ORDER_COLLECTION), 
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
};

export const getAllOrders = async () => {
  try {
    const q = query(collection(db, ORDER_COLLECTION), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.warn("Fetching orders without sort (Index might be missing)");
    const snapshot = await getDocs(collection(db, ORDER_COLLECTION));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};

export const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const orderRef = doc(db, ORDER_COLLECTION, orderId);
    await updateDoc(orderRef, { status: newStatus });
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

export const deleteOrder = async (orderId) => {
  try {
    await deleteDoc(doc(db, ORDER_COLLECTION, orderId));
  } catch (error) {
    console.error("Error deleting order:", error);
    throw error;
  }
};

// ==============================
// 5. BANNER & SLIDER SERVICES
// ==============================

export const addBanner = async (bannerData) => {
  try {
    // ✅ Add to a specific collection if provided in bannerData, else default
    const targetCollection = bannerData.collection || BANNER_COLLECTION;
    await addDoc(collection(db, targetCollection), {
      ...bannerData,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error adding banner:", error);
    throw error;
  }
};

export const getHomeSlides = async () => {
  try {
    const snapshot = await getDocs(collection(db, BANNER_COLLECTION)); 
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return data.sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch (error) {
    console.error("Error fetching home slides:", error);
    return [];
  }
};

// ✅ UPDATED: getBanners now accepts a collection name
// usage: getBanners('home_banner') or getBanners('home_banner_2')
export const getBanners = async (collectionName = BANNER_COLLECTION) => {
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return data.sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch (error) {
    console.error(`Error fetching banners from ${collectionName}:`, error);
    return [];
  }
};

export const deleteBanner = async (id, collectionName = BANNER_COLLECTION) => {
  try {
    await deleteDoc(doc(db, collectionName, id));
  } catch (error) {
    console.error("Error deleting banner:", error);
    throw error;
  }
};