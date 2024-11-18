import React, { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile, updateProfilePhoto, followUser, unfollowUser, getUserNames } from '../Services/AuthServices';
import { Link, useParams } from 'react-router-dom';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(null);
  const [newSkill, setNewSkill] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerDetails, setFollowerDetails] = useState([]);
  const { userId } = useParams();
  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const loadData = async () => {
      await fetchProfile();
      if (profile?.followers?.length > 0) {
        await fetchFollowerDetails(profile.followers);
      }
    };
    loadData();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.token) {
        throw new Error('User not authenticated');
      }

      const targetUserId = userId || user.localId;
      const profileData = await getUserProfile(targetUserId);
      
      setProfile(profileData);
      setEditedProfile(profileData);
      
      if (currentUser?.following?.includes(targetUserId)) {
        setIsFollowing(true);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile(profile);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateUserProfile({
        ...editedProfile,
        firstName: editedProfile.firstName,
        lastName: editedProfile.lastName
      });
      setProfile(editedProfile);
      setIsEditing(false);
      
      const currentUser = JSON.parse(localStorage.getItem('user'));
      localStorage.setItem('user', JSON.stringify({
        ...currentUser,
        firstName: editedProfile.firstName,
        lastName: editedProfile.lastName,
        displayName: `${editedProfile.firstName} ${editedProfile.lastName}`
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      setEditedProfile(prev => ({
        ...prev,
        skills: [...(prev.skills || []), newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setEditedProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const photoUrl = await updateProfilePhoto(file);
      setProfile(prev => ({ ...prev, photoUrl }));
      setEditedProfile(prev => ({ ...prev, photoUrl }));
    } catch (err) {
      console.error('Error updating photo:', err);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFollow = async () => {
    try {
      await followUser(userId);
      setIsFollowing(true);
      await fetchProfile();
      if (profile?.followers?.length > 0) {
        await fetchFollowerDetails(profile.followers);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUnfollow = async () => {
    try {
      await unfollowUser(userId);
      setIsFollowing(false);
      await fetchProfile();
      if (profile?.followers?.length > 0) {
        await fetchFollowerDetails(profile.followers);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchFollowerDetails = async (followerIds) => {
    try {
      const details = await getUserNames(followerIds);
      setFollowerDetails(details);
    } catch (err) {
      console.error('Error fetching follower details:', err);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-body">
              {/* Photo de profil avec bouton d'upload */}
              <div className="text-center mb-4 position-relative">
                <div className="position-relative d-inline-block">
                  {profile?.photoUrl ? (
                    <img
                      src={profile.photoUrl}
                      alt="Profile"
                      className="rounded-circle"
                      style={{ 
                        width: '150px', 
                        height: '150px', 
                        objectFit: 'cover',
                        border: '2px solid #dee2e6'
                      }}
                    />
                  ) : (
                    <div 
                      className="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto"
                      style={{ 
                        width: '150px', 
                        height: '150px',
                        border: '2px solid #dee2e6'
                      }}
                    >
                      <i className="bi bi-person-fill fs-1"></i>
                    </div>
                  )}
                  
                  {/* Bouton d'upload */}
                  <div className="position-absolute bottom-0 end-0">
                    <label 
                      htmlFor="photo-upload" 
                      className="btn btn-light btn-sm rounded-circle shadow-sm"
                      style={{ cursor: 'pointer' }}
                    >
                      {uploading ? (
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      ) : (
                        <i className="bi bi-camera-fill"></i>
                      )}
                    </label>
                    <input
                      type="file"
                      id="photo-upload"
                      className="d-none"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      disabled={uploading}
                    />
                  </div>
                </div>
              </div>

              {/* Informations de base */}
              <div className="mb-4">
                {isEditing ? (
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Prénom</label>
                      <input
                        type="text"
                        className="form-control"
                        name="firstName"
                        value={editedProfile?.firstName || ''}
                        onChange={handleChange}
                        placeholder="Prénom"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Nom</label>
                      <input
                        type="text"
                        className="form-control"
                        name="lastName"
                        value={editedProfile?.lastName || ''}
                        onChange={handleChange}
                        placeholder="Nom"
                      />
                    </div>
                  </div>
                ) : (
                  <h2 className="text-center">
                    {profile?.firstName} {profile?.lastName}
                  </h2>
                )}
              </div>

              {/* Bio */}
              <div className="mb-4">
                <h4><i className="bi bi-person-lines-fill me-2"></i>Bio</h4>
                {isEditing ? (
                  <textarea
                    className="form-control"
                    name="bio"
                    value={editedProfile?.bio || ''}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Parlez-nous de vous..."
                  />
                ) : (
                  <p>{profile?.bio || 'Aucune bio renseignée'}</p>
                )}
              </div>

              {/* Compétences techniques */}
              <div className="mb-4">
                <h4><i className="bi bi-tools me-2"></i>Compétences techniques</h4>
                {isEditing ? (
                  <div>
                    <div className="input-group mb-3">
                      <input
                        type="text"
                        className="form-control"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Nouvelle compétence"
                      />
                      <button 
                        className="btn btn-outline-primary" 
                        type="button"
                        onClick={handleAddSkill}
                      >
                        Ajouter
                      </button>
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      {editedProfile?.skills?.map((skill, index) => (
                        <span key={index} className="badge bg-primary d-flex align-items-center">
                          {skill}
                          <button
                            type="button"
                            className="btn-close btn-close-white ms-2"
                            onClick={() => handleRemoveSkill(skill)}
                          />
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="d-flex flex-wrap gap-2">
                    {profile?.skills?.map((skill, index) => (
                      <span key={index} className="badge bg-primary">{skill}</span>
                    )) || 'Aucune compétence renseignée'}
                  </div>
                )}
              </div>

              {/* Liens sociaux */}
              <div className="mb-4">
                <h4><i className="bi bi-link-45deg me-2"></i>Liens professionnels</h4>
                {isEditing ? (
                  <div>
                    <div className="mb-3">
                      <label className="form-label">
                        <i className="bi bi-github me-2"></i>GitHub
                      </label>
                      <input
                        type="url"
                        className="form-control"
                        name="github"
                        value={editedProfile?.github || ''}
                        onChange={handleChange}
                        placeholder="GitHub"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="d-flex flex-wrap gap-2">
                    {profile?.github ? (
                      <a href={profile.github} target="_blank" rel="noopener noreferrer" className="badge bg-secondary">
                        GitHub
                      </a>
                    ) : 'Aucun lien GitHub renseigné'}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="d-flex justify-content-center mt-4">
                {isEditing ? (
                  <div>
                    <button 
                      className="btn btn-outline-secondary me-2" 
                      type="button"
                      onClick={handleCancel}
                    >
                      Annuler
                    </button>
                    <button 
                      className="btn btn-primary" 
                      type="button"
                      onClick={handleSave}
                    >
                      Enregistrer
                    </button>
                  </div>
                ) : (
                  <div>
                    <button 
                      className="btn btn-primary" 
                      type="button"
                      onClick={handleEdit}
                    >
                      Modifier
                    </button>
                  
                  </div>
                )}
              </div>

              {/* Followers */}
              <div className="mb-4">
                <h4 className="mb-3">
                  <i className="bi bi-people-fill me-2"></i>
                  Followers ({profile?.followers?.length || 0})
                </h4>
                <div className="d-flex flex-wrap gap-2">
                  {followerDetails.length > 0 ? (
                    followerDetails.map((follower) => (
                      <Link 
                        key={follower.id}
                        to={`/profile/${follower.id}`}
                        className="badge bg-primary text-decoration-none"
                      >
                        {follower.displayName}
                      </Link>
                    ))
                  ) : (
                    <p className="text-muted mb-0">Aucun follower pour le moment</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;