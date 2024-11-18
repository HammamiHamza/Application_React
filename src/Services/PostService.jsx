const API_KEY = 'AIzaSyA748K_vC-v9DbEXuXfSG0l7gtqfN-aNQ4';
const FIRESTORE_URL = 'https://firestore.googleapis.com/v1';

export const createPost = async (postData) => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.token) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(
      `${FIRESTORE_URL}/projects/reactproject-59e80/databases/(default)/documents/posts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          fields: {
            title: { stringValue: postData.title },
            content: { stringValue: postData.content },
            userId: { stringValue: user.localId },
            authorName: { stringValue: `${user.firstName} ${user.lastName}` },
            authorPhoto: { stringValue: user.photoUrl || '' },
            createdAt: { timestampValue: new Date().toISOString() },
            likes: { arrayValue: { values: [] } },
            comments: { arrayValue: { values: [] } }
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error('Failed to create post');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

export const getPosts = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.token) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(
      `${FIRESTORE_URL}/projects/reactproject-59e80/databases/(default)/documents/posts`,
      {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }

    const data = await response.json();
    
    if (!data || !data.documents) {
      console.log('No posts found:', data);
      return [];
    }

    return data.documents.map(doc => {
      try {
        return {
          id: doc.name.split('/').pop(),
          title: doc.fields?.title?.stringValue || '',
          content: doc.fields?.content?.stringValue || '',
          userId: doc.fields?.userId?.stringValue || '',
          authorName: doc.fields?.authorName?.stringValue || 'Anonymous',
          authorPhoto: doc.fields?.authorPhoto?.stringValue || '',
          createdAt: doc.fields?.createdAt?.timestampValue || new Date().toISOString(),
          likes: doc.fields?.likes?.arrayValue?.values || [],
          comments: doc.fields?.comments?.arrayValue?.values?.map(comment => ({
            content: comment.mapValue?.fields?.content?.stringValue || '',
            authorId: comment.mapValue?.fields?.authorId?.stringValue || '',
            authorName: comment.mapValue?.fields?.authorName?.stringValue || 'Anonymous',
            authorPhoto: comment.mapValue?.fields?.authorPhoto?.stringValue || '',
            createdAt: comment.mapValue?.fields?.createdAt?.timestampValue || new Date().toISOString()
          })) || []
        };
      } catch (error) {
        console.error('Error parsing post document:', doc, error);
        return null;
      }
    }).filter(post => post !== null);

  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

export const updatePost = async (postId, postData) => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.token) {
      throw new Error('User not authenticated');
    }

    // Convert comments array to Firestore format
    const comments = postData.comments?.map(comment => ({
      mapValue: {
        fields: {
          content: { stringValue: comment.content },
          authorId: { stringValue: comment.authorId },
          authorName: { stringValue: comment.authorName },
          authorPhoto: { stringValue: comment.authorPhoto },
          createdAt: { timestampValue: comment.createdAt }
        }
      }
    })) || [];

    const response = await fetch(
      `${FIRESTORE_URL}/projects/reactproject-59e80/databases/(default)/documents/posts/${postId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          fields: {
            ...postData.fields,
            comments: { arrayValue: { values: comments } }
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update post');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
};

export const deletePost = async (postId) => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.token) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(
      `${FIRESTORE_URL}/projects/reactproject-59e80/databases/(default)/documents/posts/${postId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete post');
    }

    return true;
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

export const likePost = async (postId) => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.token) {
      throw new Error('User not authenticated');
    }

    // First, get the current post data
    const getResponse = await fetch(
      `${FIRESTORE_URL}/projects/reactproject-59e80/databases/(default)/documents/posts/${postId}`,
      {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      }
    );

    if (!getResponse.ok) {
      throw new Error('Failed to fetch post');
    }

    const postData = await getResponse.json();
    // Add null checking for likes field
    const currentLikes = postData.fields?.likes?.arrayValue?.values || [];
    const userLikeIndex = currentLikes.findIndex(like => like?.stringValue === user.localId);
    
    let newLikes;
    if (userLikeIndex === -1) {
      // Add like
      newLikes = [...currentLikes, { stringValue: user.localId }];
    } else {
      // Remove like
      newLikes = currentLikes.filter(like => like.stringValue !== user.localId);
    }

    // Update the post with new likes
    const updateResponse = await fetch(
      `${FIRESTORE_URL}/projects/reactproject-59e80/databases/(default)/documents/posts/${postId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          fields: {
            // Preserve existing fields
            ...postData.fields,
            likes: { arrayValue: { values: newLikes } }
          }
        })
      }
    );

    if (!updateResponse.ok) {
      throw new Error('Failed to update likes');
    }

    return await updateResponse.json();
  } catch (error) {
    console.error('Error updating likes:', error);
    throw error;
  }
}; 