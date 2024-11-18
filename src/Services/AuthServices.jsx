// src/Services/AuthServices.jsx
const API_KEY = 'AIzaSyA748K_vC-v9DbEXuXfSG0l7gtqfN-aNQ4';
const BUCKET_NAME = 'reactproject-59e80.appspot.com';
const FIRESTORE_URL = 'https://firestore.googleapis.com/v1';

// Fonction utilitaire pour compresser l'image
const compressImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Compression quality (0.5 = 50% quality)
        resolve(canvas.toDataURL('image/jpeg', 0.5));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
};

export const loginWithEmailPassword = async (email, password) => {
  try {
    // 1. Authentification avec Firebase
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true
        })
      }
    );

    const userData = await response.json();
    if (userData.error) {
      throw new Error(userData.error.message);
    }

    // 2. Récupérer le profil utilisateur depuis Firestore
    const firestoreResponse = await fetch(
      `${FIRESTORE_URL}/projects/reactproject-59e80/databases/(default)/documents/users/${userData.localId}`,
      {
        headers: {
          'Authorization': `Bearer ${userData.idToken}`
        }
      }
    );

    if (!firestoreResponse.ok) {
      throw new Error('Failed to fetch user profile');
    }

    const userDoc = await firestoreResponse.json();

    // 3. Sauvegarder les données dans localStorage
    const userProfile = {
      token: userData.idToken,
      localId: userData.localId,
      email: userDoc.fields?.email?.stringValue || '',
      firstName: userDoc.fields?.firstName?.stringValue || '',
      lastName: userDoc.fields?.lastName?.stringValue || '',
      photoUrl: userDoc.fields?.photoUrl?.stringValue || '',
      displayName: `${userDoc.fields?.firstName?.stringValue || ''} ${userDoc.fields?.lastName?.stringValue || ''}`
    };

    localStorage.setItem('user', JSON.stringify(userProfile));

    return userProfile;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const loginWithGoogle = async (idToken) => {
  try {
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        postBody: `id_token=${idToken}&providerId=google.com`,
        requestUri: window.location.href,
        returnSecureToken: true
      })
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message);
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const register = async (formData) => {
  try {
    // 1. Authentification avec Firebase
    const registerResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.get('email'),
          password: formData.get('password'),
          returnSecureToken: true,
        }),
      }
    );

    const userData = await registerResponse.json();
    if (userData.error) {
      throw new Error(userData.error.message);
    }

    // 2. Compresser la photo si elle existe
    let photoBase64 = '';
    const photoFile = formData.get('photo');
    if (photoFile) {
      photoBase64 = await compressImage(photoFile);
    }

    // 3. Créer le document utilisateur dans Firestore
    const userDocResponse = await fetch(
      `${FIRESTORE_URL}/projects/reactproject-59e80/databases/(default)/documents/users/${userData.localId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userData.idToken}`
        },
        body: JSON.stringify({
          fields: {
            email: { stringValue: formData.get('email') },
            firstName: { stringValue: formData.get('firstName') },
            lastName: { stringValue: formData.get('lastName') },
            photoUrl: { stringValue: photoBase64 },
            createdAt: { timestampValue: new Date().toISOString() }
          }
        })
      }
    );

    if (!userDocResponse.ok) {
      throw new Error('Failed to create user document');
    }

    return await userDocResponse.json();
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('user');
};

export const getUserProfile = async (userId) => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.token) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(
      `${FIRESTORE_URL}/projects/reactproject-59e80/databases/(default)/documents/users/${userId}`,
      {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    const data = await response.json();
    
    return {
      userId: userId,
      firstName: data.fields?.firstName?.stringValue || '',
      lastName: data.fields?.lastName?.stringValue || '',
      photoUrl: data.fields?.photoUrl?.stringValue || '',
      github: data.fields?.github?.stringValue || '',
      linkedin: data.fields?.linkedin?.stringValue || '',
      skills: data.fields?.skills?.arrayValue?.values?.map(v => v.stringValue) || [],
      followers: data.fields?.followers?.arrayValue?.values?.map(v => v.stringValue) || [],
      following: data.fields?.following?.arrayValue?.values?.map(v => v.stringValue) || [],
      bio: data.fields?.bio?.stringValue || ''
    };
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

export const updateProfilePhoto = async (photoFile) => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.token) {
      throw new Error('User not authenticated');
    }

    // 1. Compresser l'image
    const compressedPhoto = await compressImage(photoFile);
    
    // 2. Mettre à jour le document Firestore
    const firestoreResponse = await fetch(
      `${FIRESTORE_URL}/projects/reactproject-59e80/databases/(default)/documents/users/${user.localId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          fields: {
            photoUrl: { stringValue: compressedPhoto }
          }
        })
      }
    );

    if (!firestoreResponse.ok) {
      throw new Error('Failed to update photo URL');
    }

    // 3. Mettre à jour le localStorage
    user.photoUrl = compressedPhoto;
    localStorage.setItem('user', JSON.stringify(user));

    return compressedPhoto;
  } catch (error) {
    console.error('Error updating profile photo:', error);
    throw error;
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.token) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(
      `${FIRESTORE_URL}/projects/reactproject-59e80/databases/(default)/documents/users/${user.localId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          fields: {
            firstName: { stringValue: profileData.firstName || '' },
            lastName: { stringValue: profileData.lastName || '' },
            bio: { stringValue: profileData.bio || '' },
            skills: { arrayValue: { values: (profileData.skills || []).map(skill => ({ stringValue: skill })) } },
            github: { stringValue: profileData.github || '' },
            linkedin: { stringValue: profileData.linkedin || '' }
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.token) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(
      `${FIRESTORE_URL}/projects/reactproject-59e80/databases/(default)/documents/users`,
      {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    const data = await response.json();
    console.log('Raw Firestore data:', data); // Debug log

    return data.documents.map(doc => {
      const userId = doc.name.split('/').pop();
      return {
        id: userId,
        firstName: doc.fields?.firstName?.stringValue || '',
        lastName: doc.fields?.lastName?.stringValue || '',
        photoUrl: doc.fields?.photoUrl?.stringValue || '',
        followers: doc.fields?.followers?.arrayValue?.values?.map(f => f.stringValue) || [],
        following: doc.fields?.following?.arrayValue?.values?.map(f => f.stringValue) || [],
        isFollowing: doc.fields?.followers?.arrayValue?.values?.some(
          f => f.stringValue === user.localId
        ) || false,
        email: doc.fields?.email?.stringValue || '',
        displayName: `${doc.fields?.firstName?.stringValue || ''} ${doc.fields?.lastName?.stringValue || ''}`.trim() || 'Utilisateur'
      };
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const followUser = async (userId) => {
  try {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (!currentUser || !currentUser.token) {
      throw new Error('User not authenticated');
    }

    // Initialize following array if it doesn't exist
    const following = Array.isArray(currentUser.following) ? [...currentUser.following] : [];
    
    // Add the new userId if not already following
    if (!following.includes(userId)) {
      following.push(userId);
    }

    // 1. Update current user's following list using updateMask
    const currentUserResponse = await fetch(
      `${FIRESTORE_URL}/projects/reactproject-59e80/databases/(default)/documents/users/${currentUser.localId}?updateMask.fieldPaths=following`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({
          fields: {
            following: {
              arrayValue: {
                values: following.map(id => ({ stringValue: id }))
              }
            }
          }
        })
      }
    );

    if (!currentUserResponse.ok) {
      throw new Error('Failed to update following list');
    }

    // 2. Get target user's current data
    const targetUserResponse = await fetch(
      `${FIRESTORE_URL}/projects/reactproject-59e80/databases/(default)/documents/users/${userId}`,
      {
        headers: {
          'Authorization': `Bearer ${currentUser.token}`
        }
      }
    );

    const targetUserData = await targetUserResponse.json();
    const currentFollowers = targetUserData.fields?.followers?.arrayValue?.values?.map(v => v.stringValue) || [];
    
    if (!currentFollowers.includes(currentUser.localId)) {
      currentFollowers.push(currentUser.localId);
    }

    // 3. Update only the followers field using updateMask
    const updateFollowersResponse = await fetch(
      `${FIRESTORE_URL}/projects/reactproject-59e80/databases/(default)/documents/users/${userId}?updateMask.fieldPaths=followers`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({
          fields: {
            followers: {
              arrayValue: {
                values: currentFollowers.map(id => ({ stringValue: id }))
              }
            }
          }
        })
      }
    );

    if (!updateFollowersResponse.ok) {
      throw new Error('Failed to update followers list');
    }

    // Update localStorage
    localStorage.setItem('user', JSON.stringify({
      ...currentUser,
      following
    }));

    return true;
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
};

export const unfollowUser = async (userId) => {
  try {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (!currentUser || !currentUser.token) {
      throw new Error('User not authenticated');
    }

    // Remove user from following list
    const following = (currentUser.following || []).filter(id => id !== userId);
    
    // 1. Update current user's following list
    const currentUserResponse = await fetch(
      `${FIRESTORE_URL}/projects/reactproject-59e80/databases/(default)/documents/users/${currentUser.localId}?updateMask.fieldPaths=following`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({
          fields: {
            following: {
              arrayValue: {
                values: following.map(id => ({ stringValue: id }))
              }
            }
          }
        })
      }
    );

    if (!currentUserResponse.ok) {
      throw new Error('Failed to update following list');
    }

    // 2. Update target user's followers list
    const targetUserResponse = await fetch(
      `${FIRESTORE_URL}/projects/reactproject-59e80/databases/(default)/documents/users/${userId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`
        }
      }
    );

    const targetUserData = await targetUserResponse.json();
    const currentFollowers = targetUserData.fields?.followers?.arrayValue?.values?.map(v => v.stringValue) || [];
    const updatedFollowers = currentFollowers.filter(id => id !== currentUser.localId);

    await fetch(
      `${FIRESTORE_URL}/projects/reactproject-59e80/databases/(default)/documents/users/${userId}?updateMask.fieldPaths=followers`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({
          fields: {
            followers: {
              arrayValue: {
                values: updatedFollowers.map(id => ({ stringValue: id }))
              }
            }
          }
        })
      }
    );

    // Update localStorage
    localStorage.setItem('user', JSON.stringify({
      ...currentUser,
      following
    }));

    return true;
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
};

export const getUserNames = async (userIds) => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.token) {
      throw new Error('User not authenticated');
    }

    const promises = userIds.map(async (userId) => {
      const response = await fetch(
        `${FIRESTORE_URL}/projects/reactproject-59e80/databases/(default)/documents/users/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      return {
        id: userId,
        firstName: data.fields?.firstName?.stringValue || '',
        lastName: data.fields?.lastName?.stringValue || '',
        displayName: `${data.fields?.firstName?.stringValue || ''} ${data.fields?.lastName?.stringValue || ''}`.trim() || 'Utilisateur'
      };
    });

    return await Promise.all(promises);
  } catch (error) {
    console.error('Error fetching user names:', error);
    throw error;
  }
};