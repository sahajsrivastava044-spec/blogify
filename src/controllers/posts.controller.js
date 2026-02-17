const {validationResult}=require('express-validator');



const getAllPosts=(req,res)=>{
    const {sortBy}=req.query;
    const posts = [
        {id:2,title:'Controller Post 2',date:'2026-4-26'},
        {id:1,title:'Controller Post 1',date:'2024-7-05'}
    ];
    if(sortBy==='date'){
        posts.sort((a,b)=>new Date(a.date) - new Date(b.date));
        console.log('Sorting posts by date...');
    }
    console.log(posts)
    res.status(200).json({
        message: 'Posts handled successfully',
        data: posts
    });
}

const getPostById = (req,res)=>{
    const {id}=req.params;
    const posts=[
        {id:2,title:'Controller Post 2', date: '2026-4-26'},
        {id:1,title:'Controller Post 1', date: '2024-7-05'}
    ];

    const post = posts.find(p=>p.id===parseInt(id));

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

const createPost = (req, res) => {
  // The developer is trying to get the title from the request body.
  const errors = validationResult(req); 
  
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array()});
  }

  const {title,content}=req.body

  // (Imagine database logic to save the post would go here)

  res.status(201).json({ message: `Post created` });
};
module.exports={
    getAllPosts, 
    getPostById,
    createPost
}