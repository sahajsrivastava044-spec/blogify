
const getAllPosts=(req,res)=>{
    const {sortBy}=req.query;
    const posts = [
        {id:2,title:'Controller Post 2',date:'2026-4-26'},
        {id:1,title:'Controller Post 1',date:'2024-7-05'}
    ];
    if(sortBy==='date'){
        posts.sort((a,b)=>new Date(a.date) - new Date(b.date));
        console.log('Sorting posts by date...');
    }
    console.log(posts)
    res.status(200).json({
        message: 'Posts handled successfully',
        data: posts
    });
}

const getPostById = (req,res)=>{
    const {id}=req.params;
    const posts=[
        {id:2,title:'Controller Post 2', date: '2026-4-26'},
        {id:1,title:'Controller Post 1', date: '2024-7-05'}
    ];

    const post = posts.find(p=>p.id===parseInt(id));

    if(post){
        console.log(`Found post with id ${id}`);
        res.status(200).json({
            message: 'Post found successfully',
            data: post
        });
    }else{
        console.log(`No post found with id ${id}`);
        res.status(404).json({
            message: 'Post not found'
        })
    }
}

const getPostWithAuthor = async (req, res, next) => {
  try {
    // This function is supposed to get the post
    const post = await db.getPostById(req.params.postId); 

    // This function is supposed to get the author
    const author = await db.getUserById(post.authorId); // Let's assume post.authorId is correct

    // This is a bug! The developer forgot to get the user data.
    const authorName = user.name; // 'user' is undefined!

    res.status(200).json({ post, authorName });
  } catch (error) {
    next(error);
  }
};

module.exports={
    getAllPosts, 
    getPostById,
    getPostWithAuthor
}