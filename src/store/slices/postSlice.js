import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  posts: [],
  loading: false,
  error: null
};

const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    fetchPostsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchPostsSuccess: (state, action) => {
      state.loading = false;
      state.posts = action.payload;
      state.error = null;
    },
    fetchPostsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.posts = [];
    },
    addPost: (state, action) => {
      console.log('Adding post to state:', action.payload);
      state.loading = false;
      state.posts = [action.payload, ...state.posts];
    },
    updatePost: (state, action) => {
      const index = state.posts.findIndex(post => post.id === action.payload.id);
      if (index !== -1) {
        state.posts[index] = action.payload;
      }
    },
    deletePost: (state, action) => {
      state.posts = state.posts.filter(post => post.id !== action.payload);
    }
  }
});

export const {
  fetchPostsStart,
  fetchPostsSuccess,
  fetchPostsFailure,
  addPost,
  updatePost,
  deletePost
} = postSlice.actions;

export default postSlice.reducer; 