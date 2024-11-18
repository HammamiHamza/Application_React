
import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // Import Firebase configuration
import { collection, addDoc, updateDoc, doc, serverTimestamp, onSnapshot, query, orderBy, increment,where, getDocs } from 'firebase/firestore'; // Firestore functions
import { FaThumbsUp, FaShare } from 'react-icons/fa'; // Import icons for like and share
function Posts() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [postId, setPostId] = useState(null); // Store ID of post being edited, if any
  const [commentContent, setCommentContent] = useState(''); // For new comment input
  const [comments, setComments] = useState([]); // Store comments for the post
  const [likes, setLikes] = useState(0); // Track number of likes
  const [posts, setPosts] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');


  // Function to create a new post
  const handleCreatePost = async () => {
    try {
      const docRef = await addDoc(collection(db, 'posts'), {
        title,
        content,
        createdAt: serverTimestamp(),
        likes: 0, // Initialize likes to 0 for a new post
      });
      console.log('Document written with ID: ', docRef.id);
      setTitle('');
      setContent('');
      setPostId(docRef.id); // Set postId to the newly created post to manage comments
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  };

  // Function to update an existing post
  const handleUpdatePost = async () => {
    if (!postId) return;

    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        title,
        content,
        updatedAt: serverTimestamp(),
      });
      console.log('Document updated with ID: ', postId);
      setTitle('');
      setContent('');
      setPostId(null);
    } catch (error) {
      console.error('Error updating document: ', error);
    }
  };

  // Function to add a comment
  const handleAddComment = async () => {
    if (!postId || !commentContent) return;

    try {
      const commentsRef = collection(db, 'posts', postId, 'comments');
      await addDoc(commentsRef, {
        userId: 'exampleUserId', // Replace with the actual user ID
        content: commentContent,
        createdAt: serverTimestamp(),
        userName: 'Example User', // Replace with actual user name
      });
      console.log('Comment added successfully');
      setCommentContent('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // Fetch comments for the post
  useEffect(() => {
    if (postId) {
      const commentsRef = collection(db, 'posts', postId, 'comments');
      const q = query(commentsRef, orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        setComments(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      });

      return () => unsubscribe();
    }
  }, [postId]);

  // Like functionality
  const handleLikePost = async () => {
    if (!postId) return;

    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, { likes: increment(1) });
      setLikes(likes + 1); // Update local likes state
    } catch (error) {
      console.error('Error updating likes:', error);
    }
  };

  // Share functionality
  const handleSharePost = () => {
    navigator.clipboard.writeText(window.location.href); // Copy current page URL
    alert('Post URL copied to clipboard!');
  };

  //search 

  // Fetch posts based on search query
  const handleSearch = async () => {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, where('title', '>=', searchQuery), where('title', '<=', searchQuery + '\uf8ff'));

    const snapshot = await getDocs(q);
    setPosts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  // Update posts list on search query change
  useEffect(() => {
    handleSearch();
  }, [searchQuery]);

  useEffect(() => {
    handleSearch();
  }, [searchQuery]);

  return (
    <div className="container mt-5">
      <h2>{postId ? 'Edit Post' : 'Create Post'}</h2>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button onClick={postId ? handleUpdatePost : handleCreatePost}>
        {postId ? 'Update Post' : 'Create Post'}
      </button>

      {/* Like and Share Section */}
      <div className="post-actions">
        <button onClick={handleLikePost} className="like-button">
          <FaThumbsUp /> Like {likes}
        </button>
        <button onClick={handleSharePost} className="share-button">
          <FaShare /> Share
        </button>
      </div>

      {/* Comment Section */}
      <div>
        <h3>Comments</h3>
        {comments.map((comment) => (
          <div key={comment.id}>
            <p><strong>{comment.userName}</strong>: {comment.content}</p>
          </div>
        ))}
        <textarea
          placeholder="Add a comment..."
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
        />
        <button onClick={handleAddComment}>Add Comment</button>
      </div>

      {/*Research user*/ }
      <div>
      <h2>Search Posts</h2>
      <input
        type="text"
        placeholder="Search by title..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <div>
        {posts.map((post) => (
          <div key={post.id}>
            <h3>{post.title}</h3>
            <p>{post.content}</p>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
}

export default Posts;
