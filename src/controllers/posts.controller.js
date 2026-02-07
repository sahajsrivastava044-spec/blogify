
const getAllPosts=(req,res)=>{
    const posts = [
        {id:1,title:'Controller Post 1'},
        {id:2,title:'Controller Post 2'}
    ];

    res.status(200).json({
        message: 'Route handles by postController.getAllPosts',
        data: posts
    });
}
module.exports={
    getAllPosts,
    Msg
}