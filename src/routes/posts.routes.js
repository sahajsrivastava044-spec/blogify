const express=require('express');
const postController=require("../controllers/posts.controller");
const router=express.Router();
const {body} = require('express-validator')

const registrationRules=[
    body('title').notEmpty().withMessage('Title is required'),

    body('content').notEmpty().withMessage('Content is required')
]

router.get("/",postController.getAllPosts);

router.get("/:id",postController.getPostById)

router.post('/',registrationRules,postController.createPost);


router.post('/test-body',(req,res)=>{
    console.log('Received body:',req.body);
    res.status(200).json({status: 'success', received: req.body});
});

module.exports=router;