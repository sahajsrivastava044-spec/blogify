const express=require('express');
const postrouter=require('./posts.routes')
const router=express.Router();

router.use("/",postrouter)

module.exports=router;