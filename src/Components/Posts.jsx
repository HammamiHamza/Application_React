import React, { useState, useEffect } from 'react';
import { createPost, getPosts, updatePost, deletePost, likePost } from '../Services/PostService';
import { FaHeart, FaRegHeart, FaEdit, FaTrash, FaComment } from 'react-icons/fa';
import Comments from './Comments';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [expandedPost, setExpandedPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [likingPosts, setLikingPosts] = useState(new Set());

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const postsData = await getPosts();
      setPosts(postsData.reverse()); // Show newest posts first
    } catch (error) {
      setError('Failed to fetch posts');
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault(); // Add this to prevent form submission
    try {
      if (!title.trim() || !content.trim()) {
        alert('Please fill in both title and content');
        return;
      }
      
      setLoading(true);
      await createPost({
        title,
        content
      });
      setTitle('');
      setContent('');
      fetchPosts();
    } catch (error) {
      setError('Failed to create post');
      console.error('Error creating post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (postId, commentContent) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const comment = {
        content: commentContent,
        authorId: user.localId,
        authorName: `${user.firstName} ${user.lastName}`,
        authorPhoto: user.photoUrl || '',
        createdAt: new Date().toISOString()
      };

      const post = posts.find(p => p.id === postId);
      const updatedComments = [...(post.comments || []), comment];

      await updatePost(postId, {
        ...post,
        comments: updatedComments
      });

      fetchPosts();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleLike = async (postId) => {
    try {
      setLikingPosts(prev => new Set([...prev, postId]));
      await likePost(postId);
      fetchPosts(); // Refresh posts to show updated likes
    } catch (error) {
      console.error('Error liking post:', error);
    } finally {
      setLikingPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

  return (
    <div className="container py-4">
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Create Post Form */}
     

      {/* Posts List */}
      {loading && !posts.length ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="posts-list">
          {posts.map((post) => (
            <div key={post.id} className="card shadow-sm mb-4">
              <div className="card-body">
                {/* Post Header */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center">
                    {post.authorPhoto ? (
                      <img 
                        src={post.authorPhoto} 
                        alt={post.authorName}
                        className="rounded-circle me-2"
                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="rounded-circle bg-secondary me-2 d-flex align-items-center justify-content-center"
                           style={{ width: '40px', height: '40px' }}>
                        <span className="text-white">{post.authorName[0]}</span>
                      </div>
                    )}
                    <div>
                      <h6 className="mb-0">{post.authorName}</h6>
                      <small className="text-muted">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <h5 className="card-title">{post.title}</h5>
                <p className="card-text">{post.content}</p>

                {/* Post Actions */}
                <div className="d-flex justify-content-between align-items-center">
                  <button 
                    className={`btn btn-outline-danger btn-sm ${
                      post.likes?.includes(JSON.parse(localStorage.getItem('user')).localId) ? 'active' : ''
                    }`}
                    onClick={() => handleLike(post.id)}
                    disabled={likingPosts.has(post.id)}
                  >
                    {likingPosts.has(post.id) ? (
                      <span className="spinner-border spinner-border-sm me-1" />
                    ) : post.likes?.includes(JSON.parse(localStorage.getItem('user')).localId) ? (
                      <><FaHeart className="me-1" /> {post.likes.length}</>
                    ) : (
                      <><FaRegHeart className="me-1" /> {post.likes?.length || 0}</>
                    )}
                  </button>

                  <button 
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                  >
                    <FaComment className="me-1" />
                    {post.comments?.length || 0}
                  </button>
                </div>

                {/* Comments Section */}
                {expandedPost === post.id && (
                  <Comments
                    postId={post.id}
                    comments={post.comments || []}
                    onAddComment={handleAddComment}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
       <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h4 className="card-title">Create New Post</h4>
          <form onSubmit={handleCreatePost}>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Post title"
                required
              />
            </div>
            <div className="mb-3">
              <textarea
                className="form-control"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind?"
                rows="3"
                required
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Post'}
            </button>
          </form>
        </div>
      </div>
    </div>
    
  );
};

export default Posts;