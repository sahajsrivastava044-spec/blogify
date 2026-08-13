import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function Home({ userId }) {
  const [posts, setPosts] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingPostId, setEditingPostId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/api/v1/posts/', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data.data) {
        setPosts(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch posts');
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:3001/api/v1/posts/',
        { title, content, author: userId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (response.data.success) {
        toast.success('Post created!');
        setTitle('');
        setContent('');
        setIsCreating(false);
        fetchPosts(); // Refresh list
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create post');
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3001/api/v1/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      toast.success('Post deleted successfully');
      setPosts(posts.filter((post) => post._id !== postId));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete post');
    }
  };

  const handleEditClick = (post) => {
    setEditingPostId(post._id);
    setEditTitle(post.title);
    setEditContent(post.content);
  };

  const handleUpdatePost = async (e, postId) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:3001/api/v1/posts/${postId}`,
        { title: editTitle, content: editContent },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (response.data.success) {
        toast.success('Post updated!');
        setEditingPostId(null);
        fetchPosts(); // Refresh list
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update post');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '3rem', color: 'var(--color-navy)' }}>Recent Publications 📜</h1>
        <button onClick={() => setIsCreating(!isCreating)} className="premium-btn premium-btn-primary">
          {isCreating ? 'Cancel' : 'Create Post ✍️'}
        </button>
      </div>

      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
            animate={{ height: 'auto', opacity: 1, marginBottom: '2rem' }}
            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <form onSubmit={handleCreatePost} className="premium-card" style={{ background: '#fff' }}>
              <h2 style={{ marginBottom: '1rem', color: 'var(--color-burgundy)' }}>Write a New Masterpiece</h2>
              <input
                type="text"
                placeholder="Title"
                className="premium-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <textarea
                placeholder="Content"
                className="premium-input"
                style={{ minHeight: '150px', resize: 'vertical' }}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              ></textarea>
              <button type="submit" className="premium-btn premium-btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                Publish
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {posts.map((post) => (
          <motion.div
            key={post._id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="premium-card"
          >
            {editingPostId === post._id ? (
              <form onSubmit={(e) => handleUpdatePost(e, post._id)}>
                <input
                  type="text"
                  className="premium-input"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                />
                <textarea
                  className="premium-input"
                  style={{ minHeight: '100px', resize: 'vertical' }}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  required
                ></textarea>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="submit" className="premium-btn premium-btn-primary">Save</button>
                  <button type="button" onClick={() => setEditingPostId(null)} className="premium-btn">Cancel</button>
                </div>
              </form>
            ) : (
              <>
                <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--text-color)' }}>{post.title}</h2>
                <p style={{ color: '#555', marginBottom: '1rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{post.content}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                  <span style={{ fontSize: '0.9rem', color: '#888' }}>
                    Posted on {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                  {/* If author object exists and matches userId, or author string matches userId */}
                  {((post.author?._id === userId) || (post.author === userId)) && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleEditClick(post)}
                        className="premium-btn"
                        style={{ fontSize: '1rem', padding: '0.3rem 1rem' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(post._id)}
                        className="premium-btn"
                        style={{ background: 'var(--color-burgundy)', color: 'white', fontSize: '1rem', padding: '0.3rem 1rem', border: 'none' }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        ))}
        {posts.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '3rem', color: '#888' }}>
            <h3 style={{ fontSize: '2rem' }}>No posts found. Be the first to publish! ✒️</h3>
          </div>
        )}
      </div>
    </div>
  );
}
