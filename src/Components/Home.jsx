import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaHeart, FaRegHeart, FaComment } from 'react-icons/fa';
import { fetchPostsStart, fetchPostsSuccess, fetchPostsFailure, updatePost as updatePostAction } from '../store/slices/postSlice';
import { getPosts, likePost, addComment as addCommentService } from '../Services/PostService';
import Comments from './Comments';

function Home() {
  const dispatch = useDispatch();
  const posts = useSelector(state => state.posts.posts);
  const loading = useSelector(state => state.posts.loading);
  const [expandedPost, setExpandedPost] = React.useState(null);
  const [likingPosts, setLikingPosts] = React.useState(new Set());
  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchPosts();
  }, [dispatch]);

  const fetchPosts = async () => {
    try {
      dispatch(fetchPostsStart());
      const allPosts = await getPosts();
      
      // Filter posts to only show those from followed users and current user
      const filteredPosts = allPosts.filter(post => 
        currentUser?.following?.includes(post.userId) || 
        post.userId === currentUser?.localId
      );
      
      console.log('Fetched followed posts:', filteredPosts);
      dispatch(fetchPostsSuccess(filteredPosts));
    } catch (error) {
      console.error('Error fetching posts:', error);
      dispatch(fetchPostsFailure('Failed to fetch posts'));
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
      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="row">
          {Array.isArray(posts) && posts.map(post => post && (
            <div key={post?.id || Math.random()} className="col-12 mb-4">
              <div className="card shadow-sm">
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
                    <div className="mt-3">
                      <Comments
                        postId={post.id}
                        comments={post.comments || []}
                        onAddComment={handleAddComment}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home; 