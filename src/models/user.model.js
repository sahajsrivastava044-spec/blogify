const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    firstName:String,
    lastName:String,
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    slug:String
  },
  {
    timestamps: true,
  }
);


userSchema.virtual('fullName').get(function(){
  // return `${this.}`
  if (!this.fistName){
    return this.lastName
  }
  else if(!this.lastName){
    return this.firstName
  }
   return `${this.fistName} ${this.lastName}`
})


userSchema.pre('save',async function(){
  console.log("mongoose pre middleware",this.email);
  // next();
});

// Generate slug before saving
userSchema.pre('save', async function() {
  // Only generate slug if name is new or modified
  if (!this.isModified('username')) {
    return ;
  }
  
  // Convert name to slug
  // "Gaming Laptop Pro" -> "gaming-laptop-pro"
  this.slug = this.username
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')  // Remove special chars
    .replace(/\s+/g, '-')       // Replace spaces with hyphens
    .replace(/-+/g, '-');       // Replace multiple hyphens with single
  
  // next();
});



const User = mongoose.model('User', userSchema);

module.exports = User;