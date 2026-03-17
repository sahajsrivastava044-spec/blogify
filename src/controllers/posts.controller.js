const {validationResult}=require('express-validator');
const Post = require('../models/post.model.js');
const postService=require('../service/posts.service.js')



const getAllPosts=async (req,res)=>{
    let posts=await postService.getAllPosts(req.query);
    // if(sortBy==='date'){
    //     posts.sort((a,b)=>new Date(a.date) - new Date(b.date));
    //     console.log('Sorting posts by date...');
    // }
    res.status(200).json({
        message: 'Posts handled successfully',
        data: posts
    });
}

const getPostById = async (req,res)=>{
    const id = req.params.id;
    const post = await postService.PostsById(id);

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
const createPost = async (req, res, next) => {
  try {
    const newPost = await Post.create(req.body); 
    res.status(201).json({ success: true, data: newPost });
  } catch (error) {
    next(error);
  }
};

const updatePost=async()=>{
    const id = req.params.id;
    const data=req.body
    const postUpdate=postService.updateData(id,data);
    
}
module.exports={
    getAllPosts, 
    getPostById,
    createPost
}