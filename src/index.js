const express = require('express');
const app = express();
const cors=require('cors');
app.use(express.json());
app.use(cors())
// app.use(getPostWithAuthor)
const PORT=3001;
const postsRouter = require('./routes/posts.routes');
const { getPostWithAuthor } = require('./controllers/posts.controller');
const router = require('./routes');
app.use('/api/v1/posts', router);

app.listen(PORT,()=>{
    console.log(`server is running on http://localhost:${PORT}`);
})