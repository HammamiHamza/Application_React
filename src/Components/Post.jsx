import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000'; // Replace with your backend API

function Post() {
  const [content, setContent] = useState('');
  const [posts, setPosts] = useState([]);

  const handlePost = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/posts`, { content }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setPosts([...posts, response.data]);
  };

  return (
    <div>
      <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write a post..."></textarea>
      <button onClick={handlePost}>Post</button>

      <div>
        {posts.map((post) => (
          <div key={post._id}>
            <p>{post.content}</p>
            <Comment postId={post._id} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Comment({ postId }) {
  const [comment, setComment] = useState('');

  const handleComment = async () => {
    const token = localStorage.getItem('token');
    await axios.post(`${API_URL}/comments`, { comment, postId }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  return (
    <div>
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment..."></textarea>
      <button onClick={handleComment}>Comment</button>
    </div>
  );
}

export default Post;
