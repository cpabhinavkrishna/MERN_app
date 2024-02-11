const mongoose = require('mongoose');

const User = new mongoose.Schema({
    userName:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true}
},{collection:'app-user'})

const model = mongoose.model('UserModel',User);
module.exports = model; 