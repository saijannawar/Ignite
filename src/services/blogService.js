import { db } from '../config/firebase'; 
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc, 
  setDoc, // ✅ THIS WAS MISSING
  query, 
  increment,
  orderBy, 
  where 
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const BLOG_COLLECTION = "blogs";

// --- EXISTING BLOG FUNCTIONS ---

export const getBlogs = async () => {
  try {
    const q = query(collection(db, BLOG_COLLECTION), orderBy("createdAt", "desc"));
    const data = await getDocs(q);
    return data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return [];
  }
};

export const getBlogById = async (id) => {
  try {
    const docRef = doc(db, BLOG_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching blog:", error);
    return null;
  }
};

export const addBlog = async (blogData) => {
  try {
    await addDoc(collection(db, BLOG_COLLECTION), {
      ...blogData,
      createdAt: new Date().toISOString(),
      views: 0,
      comments: 0
    });
  } catch (error) {
    console.error("Error adding blog:", error);
    throw error;
  }
};

export const updateBlog = async (id, updatedData) => {
  try {
    const blogDoc = doc(db, BLOG_COLLECTION, id);
    await updateDoc(blogDoc, updatedData);
  } catch (error) {
    console.error("Error updating blog:", error);
    throw error;
  }
};

export const deleteBlog = async (id) => {
  try {
    const blogDoc = doc(db, BLOG_COLLECTION, id);
    await deleteDoc(blogDoc);
  } catch (error) {
    console.error("Error deleting blog:", error);
    throw error;
  }
};

export const uploadBlogImage = async (file) => {
  if (!file) return null;
  const storage = getStorage();
  const storageRef = ref(storage, `blog_images/${file.name + Date.now()}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};

// --- ✅ NEW BOOKMARK FUNCTIONS ---

// 1. Toggle Bookmark (Save/Unsave)
export const toggleBookmark = async (userId, blogId) => {
  try {
    // Reference: users/{userId}/bookmarks/{blogId}
    const bookmarkRef = doc(db, 'users', userId, 'bookmarks', blogId);
    const docSnap = await getDoc(bookmarkRef);

    if (docSnap.exists()) {
      // If already bookmarked, remove it (Unsave)
      await deleteDoc(bookmarkRef);
      return false; // Return false indicating "not saved"
    } else {
      // If not bookmarked, save it
      await setDoc(bookmarkRef, { 
        blogId, 
        savedAt: new Date().toISOString() 
      });
      return true; // Return true indicating "saved"
    }
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    throw error;
  }
};

// 2. Get User's Bookmarked Blog IDs
export const getUserBookmarks = async (userId) => {
  try {
    const bookmarksRef = collection(db, 'users', userId, 'bookmarks');
    const querySnapshot = await getDocs(bookmarksRef);
    // Return an array of just the blog IDs
    return querySnapshot.docs.map(doc => doc.id);
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return [];
  }
};


// --- COMMENT FUNCTIONS ---

// 1. Add Comment
export const addComment = async (blogId, user, text) => {
  try {
    await addDoc(collection(db, 'blog_comments'), {
      blogId,
      userId: user.uid,
      userName: user.displayName || user.email.split('@')[0], // Fallback name
      userAvatar: user.photoURL || null,
      text,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
};

// 2. Get Comments for a Blog
export const getCommentsByBlogId = async (blogId) => {
  try {
    const q = query(
      collection(db, 'blog_comments'), 
      where("blogId", "==", blogId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
};

// ✅ NEW FUNCTION: Increment View Count
export const incrementBlogView = async (blogId) => {
  try {
    const blogRef = doc(db, "blogs", blogId);
    await updateDoc(blogRef, {
      views: increment(1) // This will now work
    });
  } catch (error) {
    console.error("Error incrementing view:", error);
  }
};

// ... existing imports ...

// ✅ 1. Update a Comment
export const updateComment = async (commentId, newText) => {
  try {
    const commentRef = doc(db, "blog_comments", commentId);
    await updateDoc(commentRef, { 
        text: newText,
        updatedAt: new Date().toISOString() // Optional: track edits
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    throw error;
  }
};

// ✅ 2. Delete a Comment
export const deleteComment = async (commentId) => {
  try {
    const commentRef = doc(db, "blog_comments", commentId);
    await deleteDoc(commentRef);
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
};