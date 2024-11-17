// import React, { useState } from 'react';
// import axios from 'axios';

// const API_URL = 'http://localhost:3000'; // Replace with your backend API

// function Post() {
//   const [content, setContent] = useState('');
//   const [posts, setPosts] = useState([]);

//   const handlePost = async () => {
//     const token = localStorage.getItem('token');
//     const response = await axios.post(`${API_URL}/posts`, { content }, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     setPosts([...posts, response.data]);
//   };

//   return (
//     <div>
//       <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write a post..."></textarea>
//       <button onClick={handlePost}>Post</button>

//       <div>
//         {posts.map((post) => (
//           <div key={post._id}>
//             <p>{post.content}</p>
//             <Comment postId={post._id} />
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// function Comment({ postId }) {
//   const [comment, setComment] = useState('');

//   const handleComment = async () => {
//     const token = localStorage.getItem('token');
//     await axios.post(`${API_URL}/comments`, { comment, postId }, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
//   };

//   return (
//     <div>
//       <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment..."></textarea>
//       <button onClick={handleComment}>Comment</button>
//     </div>
//   );
// }

// export default Post;
import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // Import Firebase configuration
import { collection, addDoc, updateDoc, doc, serverTimestamp, onSnapshot, query, orderBy } from 'firebase/firestore'; // Firestore functions

function Posts() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [postId, setPostId] = useState(null); // Store ID of post being edited, if any
  const [commentContent, setCommentContent] = useState(''); // For new comment input
  const [comments, setComments] = useState([]); // Store comments for the post

  // Function to create a new post
  const handleCreatePost = async () => {
    try {
      const docRef = await addDoc(collection(db, 'posts'), {
        title,
        content,
        createdAt: serverTimestamp(),
      });
      console.log('Document written with ID: ', docRef.id);
      // Clear fields after creation
      setTitle('');
      setContent('');
      setPostId(docRef.id); // Set postId to the newly created post to manage comments
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  };

  // Function to update an existing post
  const handleUpdatePost = async () => {
    if (!postId) return; // Ensure there's a post to update

    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        title,
        content,
        updatedAt: serverTimestamp(),
      });
      console.log('Document updated with ID: ', postId);
      // Clear fields after update
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
      setCommentContent(''); // Clear comment input after adding
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

      return () => unsubscribe(); // Cleanup on unmount
    }
  }, [postId]);

  return (
    <div>
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
    </div>
  );
}

export default Posts;
