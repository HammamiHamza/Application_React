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
      console.log('Fetched users data:', usersData); // Debug log
      
      const filteredUsers = usersData
        .filter(user => user.id !== currentUser?.localId)
        .map(user => ({
          ...user,
          isFollowing: currentUser?.following?.includes(user.id) || false
        }));
      
      console.log('Filtered users:', filteredUsers); // Debug log
      setUsers(filteredUsers);
    } catch (err) {
      console.error('Error in fetchUsers:', err); // Debug log
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId) => {
    try {
      await followUser(userId);
      await fetchUsers(); // Refresh the list to update followers count
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      await unfollowUser(userId);
      await fetchUsers(); // Refresh the list to update followers count
    } catch (err) {
      setError(err.message);
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

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Utilisateurs</h2>
      {users.length === 0 ? (
        <div className="alert alert-info">Aucun utilisateur trouvé</div>
      ) : (
        <div className="row">
          {users.map(user => (
            <div key={user.id} className="col-md-4 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    {user?.photoUrl ? (
                      <img
                        src={user.photoUrl}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="rounded-circle me-3"
                        style={{ 
                          width: '60px', 
                          height: '60px', 
                          objectFit: 'cover',
                          border: '2px solid #dee2e6'
                        }}
                      />
                    ) : (
                      <div 
                        className="rounded-circle bg-secondary me-3 d-flex align-items-center justify-content-center"
                        style={{ 
                          width: '60px', 
                          height: '60px',
                          border: '2px solid #dee2e6'
                        }}
                      >
                        <i className="bi bi-person-fill text-white"></i>
                      </div>
                    )}
                    <div>
                      <h5 className="card-title mb-0">
                        <Link to={`/profile/${user.id}`}>
                          {user.displayName || `${user.firstName || ''} ${user.lastName || ''}`}
                        </Link>
                      </h5>
                      <small className="text-muted">
                        {Array.isArray(user.followers) ? user.followers.length : 0} followers
                      </small>
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
      )}
    </div>
  );
}

export default Users; 