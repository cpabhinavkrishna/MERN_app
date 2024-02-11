const mongoose = require('mongoose');
const AccessToken = mongoose.Schema({
    token:{type:String,required:true}
},{collection:'access-token'})

const model = mongoose.model('Access-Token',AccessToken);
module.exports = model;