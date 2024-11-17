import React, { useState, useEffect } from 'react';
import { getAllUsers, followUser, unfollowUser } from '../Services/AuthServices';
import { Link } from 'react-router-dom';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersData = await getAllUsers();
      setUsers(usersData.filter(user => user.id !== currentUser?.localId));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId) => {
    try {
      await followUser(userId);
      fetchUsers(); // Refresh the list
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      await unfollowUser(userId);
      fetchUsers(); // Refresh the list
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="text-center mt-5">Chargement...</div>;
  if (error) return <div className="alert alert-danger mt-5">{error}</div>;

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Utilisateurs</h2>
      <div className="row">
        {users.map(user => (
          <div key={user.id} className="col-md-4 mb-4">
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  {user.photoUrl ? (
                    <img
                      src={user.photoUrl}
                      alt={user.firstName}
                      className="rounded-circle me-3"
                      style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="rounded-circle bg-light me-3 d-flex align-items-center justify-content-center"
                         style={{ width: '50px', height: '50px' }}>
                      <i className="bi bi-person-fill"></i>
                    </div>
                  )}
                  <div>
                    <h5 className="card-title mb-0">
                      <Link to={`/profile/${user.id}`}>
                        {user.firstName} {user.lastName}
                      </Link>
                    </h5>
                    <small className="text-muted">{user.followers?.length || 0} followers</small>
                  </div>
                </div>
                
                {user.isFollowing ? (
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => handleUnfollow(user.id)}
                  >
                    Ne plus suivre
                  </button>
                ) : (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleFollow(user.id)}
                  >
                    Suivre
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Users; 