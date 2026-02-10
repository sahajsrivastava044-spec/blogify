const express = require('express');
const app = express();
app.use(express.json());
// app.use(getPostWithAuthor)
const PORT=3001;
const postsRouter = require('./routes/posts.routes');
const { getPostWithAuthor } = require('./controllers/posts.controller');
app.use('/api/v1/posts', postsRouter);

app.listen(PORT,()=>{
    console.log(`server is running on http://localhost:${PORT}`);
})