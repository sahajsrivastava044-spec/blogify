const express=require('express');
const postController=require("../controllers/posts.controller");
const router=express.Router();
const {body} = require('express-validator');
const protect = require('../middleware/auth.middleware');

const registrationRules=[
    body('title').notEmpty().withMessage('Title is required'),

    body('content').notEmpty().withMessage('Content is required')
]


router.get("/",protect,postController.getAllPosts);

router.get("/:id",protect,postController.getPostById)

router.post('/',registrationRules,protect,postController.createPost);

router.delete('/:id',protect,postController.deletePost);
router.post('/test-body',(req,res)=>{
    console.log('Received body:',req.body);
    res.status(200).json({status: 'success', received: req.body});
});

module.exports=router;