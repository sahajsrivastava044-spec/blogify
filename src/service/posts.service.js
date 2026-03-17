
const { query } = require('express-validator');
const Post = require('../models/post.model.js'); 
const createPost = async (postData) => {
  
  const newPost = (await Post.create(postData)).populate("author");
  return newPost;
};

const getAllPosts=async(queryParams)=>{
    const {author,sortBy,limit=10,page=1}=queryParams;

    // const filter={};
    //   if(author){
    //     filter.author=author;
    //   }
      const sortOptions={};
      if(sortBy){
        const [field,order]=sortBy.split(':');
        sortOptions[field]=order==='desc'?-1:1;
      }else{
        sortOptions.createdAt=-1
      }
      // 4. Calculate pagination
      // const limitValue = parseInt(limit);
      // const skipValue = (parseInt(page) - 1) * limitValue;
      // console.log(filter)
      // // 5. Chain it all together in a single Mongoose query
      // const posts = await Post.find(filter)
      //   .sort(sortOptions)
      //   .skip(skipValue)
      //   .limit(limitValue)
      //   // .populate('author', 'username'); // We can still populate!
      //   console.log(posts)
      return posts;

      }

const PostsById=async(postId)=>{
    const onePost=await Post.findById(postId);
      return onePost
}      

const updateData=async(postId,postData)=>{
  const update = await Post.findByIdAndUpdate(postId,postData,{new:true});
  return update
}
module.exports = {
  createPost,
  getAllPosts,
  PostsById,
  updateData
};