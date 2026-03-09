// src/services/posts.service.js

const Post = require('../models/post.model.js'); // The service interacts with the model

/**
 * @description Create a new post in the database
 * @param {object} postData - The data for the new post
 * @returns {Promise<Document>} The newly created Mongoose document
 */
const createPost = async (postData) => {
  // This is pure business logic. It knows nothing about req or res.
  // It simply takes data and interacts with the database.
  const newPost = await Post.create(postData);
  return newPost;
};

const getAllPosts=async()=>{
    const allPosts=await Post.find({})
    console.log(allPosts)
    return allPosts
}

module.exports = {
  createPost,
  getAllPosts
};