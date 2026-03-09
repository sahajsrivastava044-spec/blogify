require('dotenv').config();

const express = require('express');

const app = express();

const cors=require('cors');

const connectDB=require('./Config/db');

app.use(express.json());

app.use(cors())

const PORT=3001;

const postsRouter = require('./routes/posts.routes');

const { getPostWithAuthor } = require('./controllers/posts.controller');

const router = require('./routes');

connectDB();

app.use('/api/v1/posts',authenticate, router);

function authenticate(req,res,next){
    const Secret_Key="secret";
    if(req.headers[`x-api-key`]!==Secret_Key){
        res.status(409).json({message:"Unauthorized to access this data"})
    }else{
        next();
    }
}

app.listen(PORT,()=>{
    console.log(`server is running on http://localhost:${PORT}`);
})