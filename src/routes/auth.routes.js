const express=require('express');
const router=express.Router()
const authController=require('../controllers/login.controller')


router.post('/register',authController.registerUser)
// router.get('/practice-token', authController.practiceTokenGeneration);
router.post('/login',authController.loginUser);

module.exports=router;
