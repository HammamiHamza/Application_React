import React, { useState } from 'react';

const Comments = ({ postId, comments = [], onAddComment }) => {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(postId, newComment);
      setNewComment('');
    }
  };

  return (
    <div className="mt-3">
      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-3">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
          />
          <button type="submit" className="btn btn-primary">
            Comment
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="comments-list">
        {comments.map((comment, index) => (
          <div key={index} className="comment mb-2 p-2 border-bottom">
            <div className="d-flex align-items-center mb-1">
              {comment.authorPhoto ? (
                <img
                  src={comment.authorPhoto}
                  alt={comment.authorName}
                  className="rounded-circle me-2"
                  style={{ width: '24px', height: '24px', objectFit: 'cover' }}
                />
              ) : (
                <div
                  className="rounded-circle bg-secondary me-2 d-flex align-items-center justify-content-center"
                  style={{ width: '24px', height: '24px' }}
                >
                  <span className="text-white" style={{ fontSize: '12px' }}>
                    {comment.authorName.charAt(0)}
                  </span>
                </div>
              )}
              <strong className="me-2">{comment.authorName}</strong>
              <small className="text-muted">
                {new Date(comment.createdAt).toLocaleDateString()}
              </small>
            </div>
            <p className="mb-0 ms-4">{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Comments;
