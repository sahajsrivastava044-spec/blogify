const {validationResult}=require('express-validator');
const Post = require('../models/post.model.js');
const postService=require('../service/posts.service.js')



const getAllPosts=async (req,res)=>{
    let posts=await postService.getAllPosts();
    // if(sortBy==='date'){
    //     posts.sort((a,b)=>new Date(a.date) - new Date(b.date));
    //     console.log('Sorting posts by date...');
    // }
    console.log(posts,"HH")
    res.status(200).json({
        message: 'Posts handled successfully',
        data: posts
    });
}

const getPostById = (req,res)=>{
    let allPosts

    if(post){
        console.log(`Found post with id ${id}`);
        res.status(200).json({
            message: 'Post found successfully',
            data: post
        });
    }else{
        console.log(`No post found with id ${id}`);
        res.status(404).json({
            message: 'Post not found'
        })
    }
}

// This is the code in your posts.controller.js file


const createPost = async (req, res, next) => {
  try {
    const newPost = await Post.create(req.body); 
    res.status(201).json({ success: true, data: newPost });
  } catch (error) {
    next(error);
  }
};
module.exports={
    getAllPosts, 
    getPostById,
    createPost
}