const express=require('express');
const postController=require("../controllers/posts.controller");
const router=express.Router();
router.get("/",postController.getAllPosts);
router.get("/message",postController.Msg);
module.exports=router;