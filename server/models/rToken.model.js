const mongoose = require('mongoose');
const RereshToken = mongoose.Schema({
    token:{type:String,required:true}
},{collection:'refresh-token'})

const model = mongoose.model('Refresh-Token',RereshToken);
module.exports = model; 