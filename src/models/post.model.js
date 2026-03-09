const mongoose =require('mongoose')

    const SchemaData=new mongoose.Schema({
        name:{
            type:String,
            required:true
        },
        age:{
            type:Number,
            required:true
        }
    })
const chck=mongoose.model('chck',SchemaData)
module.exports=chck