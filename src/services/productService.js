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

const PRODUCT_COLLECTION = "products";

// 1. Upload Multiple Images
export const uploadProductImages = async (files) => {
  if (!files || files.length === 0) return [];

  const uploadPromises = files.map(async (file) => {
    const storageRef = ref(storage, `products/${Date.now()}-${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  });

  return await Promise.all(uploadPromises);
};

// 2. Upload Single Image
export const uploadProductImage = async (file) => {
  if (!file) return null;
  const storageRef = ref(storage, `products/${Date.now()}-${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
};

// 3. Add Product
export const addProduct = async (productData) => {
  try {
    await addDoc(collection(db, PRODUCT_COLLECTION), {
      ...productData,
      createdAt: new Date(),
      price: parseFloat(productData.price),
      oldPrice: parseFloat(productData.oldPrice || 0),
      stock: parseInt(productData.stock || 0),
      discount: parseInt(productData.discount || 0),
      rating: parseInt(productData.rating || 0),
      images: productData.images || [],
      imageUrl: productData.images && productData.images.length > 0 ? productData.images[0] : '',
      isBanner: productData.isBanner || false,
      bannerTitle: productData.bannerTitle || '',
      bannerImageUrl: productData.bannerImageUrl || ''
    });
  } catch (error) {
    throw error;
  }
};

// 4. Get All Products
export const getProducts = async () => {
  const snapshot = await getDocs(collection(db, PRODUCT_COLLECTION));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// 5. Delete Product
export const deleteProduct = async (id) => {
  await deleteDoc(doc(db, PRODUCT_COLLECTION, id));
};

// 6. Get Single Product By ID
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

// 7. Add Review
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

// 8. Add To Wishlist
export const addToWishlist = async (userId, product) => {
  try {
    const wishlistRef = doc(db, "users", userId, "wishlist", product.id);
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

// 9. ADD ADDRESS
export const addUserAddress = async (userId, addressData) => {
  try {
    const addressRef = collection(db, "users", userId, "addresses");
    const docRef = await addDoc(addressRef, addressData);
    return { id: docRef.id, ...addressData };
  } catch (error) {
    console.error("Error adding address:", error);
    throw error;
  }
};

// 10. GET ADDRESSES
export const getUserAddresses = async (userId) => {
  try {
    const addressRef = collection(db, "users", userId, "addresses");
    const snapshot = await getDocs(addressRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return [];
  }
};

// 11. GET USER WISHLIST
export const getUserWishlist = async (userId) => {
  try {
    const wishlistRef = collection(db, "users", userId, "wishlist");
    const snapshot = await getDocs(wishlistRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return [];
  }
};

// 12. REMOVE FROM WISHLIST
export const removeFromWishlist = async (userId, productId) => {
  try {
    const itemRef = doc(db, "users", userId, "wishlist", productId);
    await deleteDoc(itemRef);
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    throw error;
  }
};

// 13. DELETE ADDRESS
export const deleteUserAddress = async (userId, addressId) => {
  try {
    const addressRef = doc(db, "users", userId, "addresses", addressId);
    await deleteDoc(addressRef);
  } catch (error) {
    console.error("Error deleting address:", error);
    throw error;
  }
};

// 14. UPDATE ADDRESS
export const updateUserAddress = async (userId, addressId, addressData) => {
  try {
    const addressRef = doc(db, "users", userId, "addresses", addressId);
    await updateDoc(addressRef, addressData);
  } catch (error) {
    console.error("Error updating address:", error);
    throw error;
  }
};

// 15. PLACE ORDER
export const placeOrder = async (userId, orderData) => {
  try {
    const docRef = await addDoc(collection(db, "orders"), {
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

// 16. GET USER ORDERS
export const getUserOrders = async (userId) => {
  try {
    const q = query(
      collection(db, "orders"), 
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
};

// 17. GET ALL ORDERS
export const getAllOrders = async () => {
  try {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.warn("Fetching orders without sort (Index might be missing)");
    const snapshot = await getDocs(collection(db, "orders"));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};

// 18. UPDATE ORDER STATUS
export const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, { status: newStatus });
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

// 19. DELETE ORDER
export const deleteOrder = async (orderId) => {
  try {
    await deleteDoc(doc(db, "orders", orderId));
  } catch (error) {
    console.error("Error deleting order:", error);
    throw error;
  }
};

// 20. UPLOAD BANNER IMAGE
export const uploadBannerImage = async (file) => {
  if (!file) return null;
  const storageRef = ref(storage, `banners/${Date.now()}-${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
};

// 21. ADD BANNER
export const addBanner = async (bannerData) => {
  try {
    await addDoc(collection(db, "banners"), {
      ...bannerData,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error adding banner:", error);
    throw error;
  }
};

// ✅ 22. GET BANNERS (UPDATED TO SUPPORT TYPE FILTERING)
export const getBanners = async (type) => {
  try {
    let q;
    
    // If a specific type (e.g., 'home_1', 'home_2') is requested, filter by it
    if (type) {
      q = query(collection(db, "banners"), where("type", "==", type));
    } else {
      // If no type is provided, fetch all (backward compatibility)
      q = collection(db, "banners");
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching banners:", error);
    return [];
  }
};

// 23. DELETE BANNER
export const deleteBanner = async (id) => {
  try {
    await deleteDoc(doc(db, "banners", id));
  } catch (error) {
    console.error("Error deleting banner:", error);
    throw error;
  }
};

// ✅ 24. GET HOME SLIDES
export const getHomeSlides = async () => {
  try {
    // Matches "home_banners" from your Admin Panel logic
    const snapshot = await getDocs(collection(db, "home_banners")); 
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching home slides:", error);
    return [];
  }
};