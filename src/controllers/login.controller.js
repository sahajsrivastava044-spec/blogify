require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const bcrypt=require('bcrypt')

const registerUser=async(req,res,next)=>{
  const {username,email,password}=req.body;
  const user=await User.findOne({email});

  if(user){
    return res.status(400).json({message:"User already registered"});
  }
  let hashedPassword=await bcrypt.hash(password,10);
  let newUser=await User.create({username,email,password:hashedPassword})

  res.status(201).json({message:"user created",data:newUser});
}
// const practiceTokenGeneration = (req, res) => {

//   const mockUser = {
//     _id: '654a5b8f1c3d4e5f6a7b8c9d',
//     username: 'testuser',
//     role: 'user'
//   };


//   const payload = {
//     id: mockUser._id,
//     username: mockUser.username
//   };


//   const secretKey = process.env.JWT_SECRET;
  

//   const options = {
//     expiresIn: '1h'
//   };


//   const token = jwt.sign(payload, secretKey, options);


//   res.status(200).json({
//     message: "Token generated for practice!",
//     token: token
//   });
// };

const loginUser=async(req,res,next)=>{
  try {
    const {email,password}=req.body;
    if(!email || !password){
      return res.status(400).json({
        success:false,
        message:"Please provide both email and password!!"
      })
    }

    const user=await User.findOne({email});

    if(!user){
      return res.status(404).json({
        success:false,
        message:"User not found"
      });
    };
    const isPassword=await bcrypt.compare(password,user.password)
    if (!isPassword){
      return res.status(401).json({
        success:false,
        message:"Invalid credentials!"
      })
    }
    let payload={
      id:user._id,
      user:user.username
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

    const options = {
      expires: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
      httpOnly: true, // Prevent XSS: JS cannot read this
      secure: process.env.NODE_ENV === 'production', // Encrypted connection only (HTTPS)
      // sameSite: 'strict' // Optional: Protects against CSRF
    };

     res.status(200)
     .cookie('token', token, options)
     .json({
      success: true,
      data: {
        token: token
      }
    });
  } catch (error) {
    next(error)
  }
}



module.exports = {
 loginUser,registerUser
};
// require('dotenv').config();

// const payload={
//     id:user_id_123,
//     role:'user'
// };

// const secretKey=process.env.JWT_SECRET;

// const options={
//     expiresIn:'1h'
// };

// const token=jwt.sign(payload,secretKey,options);

// console.log(token);