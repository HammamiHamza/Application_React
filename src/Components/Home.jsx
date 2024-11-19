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
        const postAuthorId = post.userId;
        return (
          (currentUser?.following && currentUser.following.includes(postAuthorId)) ||
          postAuthorId === currentUser?.localId
        );
      });

      const sortedPosts = filteredPosts.sort((a, b) => {
        const dateA = new Date(b.createdAt);
        const dateB = new Date(a.createdAt);
        return dateA - dateB;
      });

      setPosts(sortedPosts);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center">
          <p className="mb-3">Suivez d'autres utilisateurs pour voir leurs publications ici.</p>
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
                        <i className="bi bi-person-fill text-white"></i>
                      </div>
                    )}
                    <div>
                      <h5 className="card-title mb-0">{post.authorName}</h5>
                      <small className="text-muted">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                  </div>
                  <h6 className="card-subtitle mb-2">{post.title}</h6>
                  <p className="card-text">{post.content}</p>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <button className="btn btn-link text-decoration-none">
                        <FaHeart className="text-danger" />
                        <span className="ms-1">{post.likes?.length || 0}</span>
                      </button>
                      <button className="btn btn-link text-decoration-none ms-2">
                        <FaComment />
                        <span className="ms-1">{post.comments?.length || 0}</span>
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