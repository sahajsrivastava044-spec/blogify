const express=require('express');
const postrouter=require('./posts.routes')
const authrouter=require('./auth.routes')
const router=express.Router();


router.use("/",authrouter)
router.use("/",postrouter)

module.exports=router;