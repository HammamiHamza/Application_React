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
      throw new Error(`Failed to create post: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Create post response:', result);

    if (!result || !result.name) {
      throw new Error('Invalid response format from server');
    }

    const formattedPost = {
      id: result.name.split('/').pop(),
      title: result.fields?.title?.stringValue || '',
      content: result.fields?.content?.stringValue || '',
      userId: result.fields?.userId?.stringValue || '',
      authorName: result.fields?.authorName?.stringValue || 'Anonymous',
      authorPhoto: result.fields?.authorPhoto?.stringValue || '',
      createdAt: result.fields?.createdAt?.timestampValue || new Date().toISOString(),
      likes: [],
      comments: []
    };

    console.log('Formatted post:', formattedPost);
    return formattedPost;

  } catch (error) {
    console.error('Error in createPost service:', error);
    throw error;
  }
};

export const getPosts = async (forHomePage = false) => {
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
    if (!data.documents) {
      return [];
    }

    // Get the list of followed users (including current user)
    const followedUsers = forHomePage ? 
      [...(user.following || []), user.localId] : 
      null;

    return data.documents
      .map(doc => {
        try {
          const postUserId = doc.fields?.userId?.stringValue;
          
          // If we're on the home page and the post is not from a followed user, skip it
          if (forHomePage && !followedUsers.includes(postUserId)) {
            return null;
          }

          return {
            id: doc.name.split('/').pop(),
            title: doc.fields?.title?.stringValue || '',
            content: doc.fields?.content?.stringValue || '',
            userId: postUserId,
            authorName: doc.fields?.authorName?.stringValue || 'Anonymous',
            authorPhoto: doc.fields?.authorPhoto?.stringValue || '',
            createdAt: doc.fields?.createdAt?.timestampValue || new Date().toISOString(),
            likes: doc.fields?.likes?.arrayValue?.values?.map(v => v.stringValue) || [],
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
      })
      .filter(post => post !== null)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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

export const addComment = async (postId, commentText) => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.token) {
      throw new Error('User not authenticated');
    }

    // Get the current post first to append to existing comments
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
    const existingComments = postData.fields?.comments?.arrayValue?.values || [];

    // Create new comment with content instead of text
    const newComment = {
      content: commentText,  // Changed from text to content
      authorId: user.localId,
      authorName: user.displayName || `${user.firstName} ${user.lastName}`,
      authorPhoto: user.photoUrl || '',
      createdAt: new Date().toISOString()
    };

    // Update the fields structure
    const updatedComments = [
      ...existingComments,
      {
        mapValue: {
          fields: {
            content: { stringValue: newComment.content },  // Changed from text to content
            authorId: { stringValue: newComment.authorId },
            authorName: { stringValue: newComment.authorName },
            authorPhoto: { stringValue: newComment.authorPhoto },
            createdAt: { timestampValue: newComment.createdAt }
          }
        }
      }
    ];

    // Update the post with new comments
    const response = await fetch(
      `${FIRESTORE_URL}/projects/reactproject-59e80/databases/(default)/documents/posts/${postId}?updateMask.fieldPaths=comments`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          fields: {
            comments: {
              arrayValue: {
                values: updatedComments
              }
            }
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error('Failed to add comment');
    }

    const result = await response.json();
    return {
      ...result,
      id: postId
    };
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
}; 