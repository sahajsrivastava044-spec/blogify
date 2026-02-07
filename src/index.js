const express = require('express');
const app = express();
const PORT=3001;

const postsRouter = require('./routes/posts.routes');
app.use('/api/v1/posts', postsRouter);
app.use('/',postsRouter);


app.listen(PORT,()=>{
    console.log(`server is running on http://localhost:${PORT}`);
})