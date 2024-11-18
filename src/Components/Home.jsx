import React, { useState, useEffect } from 'react';
import { getPosts } from '../Services/PostService';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaComment } from 'react-icons/fa';

function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchPosts();
    
    const handleStorageChange = () => {
      const updatedUser = JSON.parse(localStorage.getItem('user'));
      if (updatedUser?.following !== currentUser?.following) {
        fetchPosts();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const allPosts = await getPosts();
      const currentUser = JSON.parse(localStorage.getItem('user'));
      
      const filteredPosts = allPosts.filter(post => {
        const postUserId = post.userId;
        return (
          (currentUser?.following && currentUser.following.includes(postUserId)) ||
          postUserId === currentUser?.localId
        );
      });

      const sortedPosts = filteredPosts.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      setPosts(sortedPosts);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      {posts.length === 0 ? (
        <div className="text-center">
          <h3>Aucun post à afficher</h3>
          <p>Suivez d'autres utilisateurs pour voir leurs publications ici.</p>
          <Link to="/users" className="btn btn-primary">
            Trouver des utilisateurs à suivre
          </Link>
        </div>
      ) : (
        <div className="row">
          {posts.map(post => (
            <div key={post.name} className="col-12 mb-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    {post?.fields?.authorPhoto?.stringValue ? (
                      <img
                        src={post.fields.authorPhoto.stringValue}
                        alt={post.fields?.authorName?.stringValue || 'User'}
                        className="rounded-circle me-2"
                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="rounded-circle bg-secondary me-2 d-flex align-items-center justify-content-center"
                           style={{ width: '40px', height: '40px' }}>
                        <i className="bi bi-person-fill text-white"></i>
                      </div>
                    )}
                    <div>
                      <h5 className="card-title mb-0">
                        {post?.fields?.authorName?.stringValue || 'Anonymous'}
                      </h5>
                      <small className="text-muted">
                        {new Date(post?.fields?.createdAt?.timestampValue || Date.now()).toLocaleDateString()}
                      </small>
                    </div>
                  </div>
                  <h6 className="card-subtitle mb-2">
                    {post?.fields?.title?.stringValue || ''}
                  </h6>
                  <p className="card-text">
                    {post?.fields?.content?.stringValue || ''}
                  </p>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <button className="btn btn-link text-decoration-none">
                        <FaHeart className="text-danger" />
                        <span className="ms-1">
                          {post?.fields?.likes?.arrayValue?.values?.length || 0}
                        </span>
                      </button>
                      <button className="btn btn-link text-decoration-none ms-2">
                        <FaComment />
                        <span className="ms-1">
                          {post?.fields?.comments?.arrayValue?.values?.length || 0}
                        </span>
                      </button>
                    </div>
                  </div>
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