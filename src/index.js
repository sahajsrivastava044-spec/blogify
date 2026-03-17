// require('dotenv').config();

const express = require('express');

const app = express();

const cors=require('cors');

const connectDB=require('./Config/db');

app.use(express.json());

app.use(cors())

const PORT=3001;

// const postsRouter = require('./routes/posts.routes');

// const { getPostWithAuthor } = require('./controllers/posts.controller');

const router = require('./routes');
const User = require('./models/user.model');

connectDB();

app.use('/api/v1/posts',router);

app.post("/api/v1/users",async(req,res,next)=>{
  try{
    const {username,email}=req.body
    let sending_data={username,email}
    const data=await User.create(sending_data) 
    res.status(201).json(data)
  }catch(err){
    next(err)
  }
})

// function authenticate(req,res,next){
//     const Secret_Key="secret";
//     if(req.headers[`x-api-key`]!==Secret_Key){
//         res.status(409).json({message:"Unauthorized to access this data"})
//     }else{
//         next();
//     }
// }
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for the developer
  console.error(err);

  
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    return res.status(404).json({ success: false, error: { message } });
  }

  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    return res.status(400).json({ success: false, error: { message } });
  }

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({ success: false, error: { message } });
  }

  res.status(500).json({
    success: false,
    error: { message: 'Internal Server Error' }
  });
};

app.use(errorHandler);


app.listen(PORT,()=>{
    console.log(`server is running on http://localhost:${PORT}`);
})