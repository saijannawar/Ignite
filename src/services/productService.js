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

// ✅ Centralized Collection Names to prevent mismatches
const PRODUCT_COLLECTION = "products";
const BANNER_COLLECTION = "homeBanners"; // Matches your React Component fix
const ORDER_COLLECTION = "orders";
const USER_COLLECTION = "users";

// ==============================
// 1. IMAGE UPLOAD SERVICES
// ==============================

// Upload Multiple Images
export const uploadProductImages = async (files) => {
  if (!files || files.length === 0) return [];

  const uploadPromises = files.map(async (file) => {
    const storageRef = ref(storage, `products/${Date.now()}-${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  });

  return await Promise.all(uploadPromises);
};

// Upload Single Image
export const uploadProductImage = async (file) => {
  if (!file) return null;
  const storageRef = ref(storage, `products/${Date.now()}-${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
};

// Upload Banner Image
export const uploadBannerImage = async (file) => {
  if (!file) return null;
  const storageRef = ref(storage, `banners/${Date.now()}-${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
};

// ==============================
// 2. PRODUCT SERVICES
// ==============================

// Add Product (Includes Sub-Category Support)
export const addProduct = async (productData) => {
  try {
    await addDoc(collection(db, PRODUCT_COLLECTION), {
      ...productData,
      createdAt: new Date(),
      price: parseFloat(productData.price),
      originalPrice: parseFloat(productData.originalPrice || 0), // Standardized name
      stock: parseInt(productData.stock || 0),
      discount: parseInt(productData.discount || 0),
      rating: parseInt(productData.rating || 0),
      
      // Categorization
      category: productData.category,
      categoryName: productData.categoryName || '',
      subCategory: productData.subCategory || '',
      
      // Images
      images: productData.images || [],
      imageUrl: productData.imageUrl || (productData.images && productData.images.length > 0 ? productData.images[0] : ''),
    });
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
};

// Get All Products
export const getProducts = async () => {
  const snapshot = await getDocs(collection(db, PRODUCT_COLLECTION));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Delete Product
export const deleteProduct = async (id) => {
  await deleteDoc(doc(db, PRODUCT_COLLECTION, id));
};

// Get Single Product By ID
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

// Add Review
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

// Add To Wishlist
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

// Get User Wishlist
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

// Remove From Wishlist
export const removeFromWishlist = async (userId, productId) => {
  try {
    const itemRef = doc(db, USER_COLLECTION, userId, "wishlist", productId);
    await deleteDoc(itemRef);
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    throw error;
  }
};

// Add Address
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

// Get Addresses
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

// Delete Address
export const deleteUserAddress = async (userId, addressId) => {
  try {
    const addressRef = doc(db, USER_COLLECTION, userId, "addresses", addressId);
    await deleteDoc(addressRef);
  } catch (error) {
    console.error("Error deleting address:", error);
    throw error;
  }
};

// Update Address
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

// Place Order
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

// Get User Orders
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

// Get All Orders (Admin)
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

// Update Order Status
export const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const orderRef = doc(db, ORDER_COLLECTION, orderId);
    await updateDoc(orderRef, { status: newStatus });
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

// Delete Order
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

// Add Banner
export const addBanner = async (bannerData) => {
  try {
    await addDoc(collection(db, BANNER_COLLECTION), {
      ...bannerData,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error adding banner:", error);
    throw error;
  }
};

// ✅ Get Home Slides (Using 'homeBanners' collection)
export const getHomeSlides = async () => {
  try {
    const snapshot = await getDocs(collection(db, BANNER_COLLECTION)); 
    // Ensure they are sorted by order if the field exists
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return data.sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch (error) {
    console.error("Error fetching home slides:", error);
    return [];
  }
};

// ✅ Generic Get Banners (Alias for getHomeSlides or separate logic if needed)
export const getBanners = async () => {
  return await getHomeSlides();
};

// Delete Banner
export const deleteBanner = async (id) => {
  try {
    await deleteDoc(doc(db, BANNER_COLLECTION, id));
  } catch (error) {
    console.error("Error deleting banner:", error);
    throw error;
  }
};