import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createPost, getPosts, deletePost as deletePostService, likePost, updatePost as updatePostService, addComment as addCommentService } from '../Services/PostService';
import { FaHeart, FaRegHeart, FaEdit, FaTrash, FaComment } from 'react-icons/fa';
import Comments from './Comments';
import {
  fetchPostsStart,
  fetchPostsSuccess,
  fetchPostsFailure,
  addPost,
  updatePost as updatePostAction,
  deletePost as deletePostAction
} from '../store/slices/postSlice';

const Posts = () => {
  const dispatch = useDispatch();
  const postsState = useSelector(state => state.posts);
  console.log('Posts State:', postsState);

  const { posts = [], loading, error } = postsState;
  const { user } = useSelector(state => state.auth);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [expandedPost, setExpandedPost] = useState(null);
  const [likingPosts, setLikingPosts] = useState(new Set());

  useEffect(() => {
    console.log('Fetching posts...');
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      dispatch(fetchPostsStart());
      const postsData = await getPosts();
      console.log('Fetched posts:', postsData);
      dispatch(fetchPostsSuccess(postsData));
    } catch (error) {
      console.error('Error fetching posts:', error);
      dispatch(fetchPostsFailure('Failed to fetch posts'));
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      dispatch(fetchPostsStart());
      const newPost = await createPost({
        title,
        content
      });
      
      console.log('New post response:', newPost);
      
      if (!newPost) {
        throw new Error('Failed to create post - no response received');
      }

      dispatch(addPost(newPost));
      setTitle('');
      setContent('');
    } catch (error) {
      dispatch(fetchPostsFailure(error.message));
      console.error('Error creating post:', error);
    }
  };

  const handleUpdatePost = async (postId, updatedData) => {
    try {
      const updatedPost = await updatePostService(postId, updatedData);
      dispatch(updatePostAction(updatedPost));
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await deletePostService(postId);
      dispatch(deletePostAction(postId));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleLikePost = async (postId) => {
    if (likingPosts.has(postId)) return;
    
    try {
      setLikingPosts(prev => new Set([...prev, postId]));
      const updatedPost = await likePost(postId);
      dispatch(updatePostAction(updatedPost));
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

  const handleAddComment = async (postId, commentText) => {
    try {
      const updatedPost = await addCommentService(postId, commentText);
      dispatch(updatePostAction(updatedPost));
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <div className="container mt-5">
      {error && <div className="alert alert-danger">{error}</div>}
      
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

      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="row">
          {Array.isArray(posts) && posts.map(post => post && (
            <div key={post?.id || Math.random()} className="card shadow-sm mb-4">
              <div className="card-body">
                {/* Post Header */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center">
                    {post?.authorPhoto ? (
                      <img 
                        src={post.authorPhoto} 
                        alt={post.authorName || 'Anonymous'}
                        className="rounded-circle me-2"
                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="rounded-circle bg-secondary me-2 d-flex align-items-center justify-content-center"
                           style={{ width: '40px', height: '40px' }}>
                        <span className="text-white">
                          {(post.authorName || 'A')[0]}
                        </span>
                      </div>
                    )}
                    <div>
                      <h6 className="mb-0">{post.authorName || 'Anonymous'}</h6>
                      <small className="text-muted">
                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Unknown date'}
                      </small>
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <h5 className="card-title">{post.title || 'Untitled'}</h5>
                <p className="card-text">{post.content || 'No content'}</p>

                {/* Post Actions */}
                <div className="d-flex justify-content-between align-items-center">
                  <button 
                    className={`btn btn-outline-danger btn-sm ${
                      post.likes?.includes(JSON.parse(localStorage.getItem('user'))?.localId) ? 'active' : ''
                    }`}
                    onClick={() => handleLikePost(post.id)}
                    disabled={likingPosts.has(post.id)}
                  >
                    {likingPosts.has(post.id) ? (
                      <span className="spinner-border spinner-border-sm me-1" />
                    ) : post.likes?.includes(JSON.parse(localStorage.getItem('user'))?.localId) ? (
                      <><FaHeart className="me-1" /> {post.likes?.length || 0}</>
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
    </div>
  );
};

export default Posts;