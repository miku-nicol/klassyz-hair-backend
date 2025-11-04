const mongoose = require("mongoose");
const Schema = mongoose.Schema

const userSchema = new Schema ({
  name: { 
    type: String,
     required: true,
     trim: true,
     min: 3,
     max: 15
    },
  email: {
     type: String, 
     required: true, 
     unique: true,
     trim: true
    },
    phoneNumber: {
        type: String,
        max: 11,
        require: true,
        unique: true,
        trim: true
    },
  password: { 
    type: String, 
    required: true
 },
  isAdmin: {  
    type: Boolean, 
    default: false
 },
 profileImage: {
      type: String, // optional, can store Cloudinary URL
    },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
