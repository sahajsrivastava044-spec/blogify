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
    const postData = { 
        ...req.body, 
        author: req.user.id 
    };
    const newPost = await Post.create(postData); 
    res.status(201).json({ success: true, data: newPost });
  } catch (error) {
    next(error);
  }
};

const updatePost = async(req, res, next) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const currentId = req.user.id;
        
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }
        if (post.author.toString() !== currentId) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to update this post'
            });
        }

        const postUpdate = await postService.updateData(id, data);
        res.status(200).json({ success: true, data: postUpdate });
    } catch (error) {
        next(error);
    }
}

const deletePost = async(req,res,next)=>{
    try{
        const postId=req.params.id;
        const currentId = req.user.id;
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }
        if (post.author.toString() !== currentId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this post'
        });
        }

        await post.deleteOne();

        res.status(200).json({
        success: true,
        message: 'Post deleted successfully'
        });
    }catch(error){
        next(error);
    }
}
module.exports={
    getAllPosts, 
    getPostById,
    updatePost,
    createPost,
    deletePost
}