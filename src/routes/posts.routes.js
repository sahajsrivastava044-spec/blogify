const express=require('express');
const postController=require("../controllers/posts.controller");
const router=express.Router();
router.get("/",postController.getAllPosts);

router.get("/:id",postController.getPostById)

router.get("/:id",postController.getPostWithAuthor);

router.post('/test-body',(req,res)=>{
    console.log('Received body:',req.body);
    res.status(200).json({status: 'success', received: req.body});
});

module.exports=router;