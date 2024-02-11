require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('./models/user.model');
const RefreshToken = require('./models/rToken.model')
const AccessToken = require('./models/aToken.model')
const cors = require('cors');
const bcrypt = require('bcrypt');
const app = express();  
// const secret = process.env.ACCESS_TOKEN_SECRET
// console.log(secret);
//middlewares
app.use(cors());
app.use(express.json());

//mongo db connection 
mongoose.connect("mongodb://0.0.0.0:27017/Auth").then(()=>{
    console.log('DB Connected');
    app.listen(4100,()=>{
        console.log("server listening to the port:4100");
    })
})
.catch(e=>console.log(e));


app.post('/api/login',async (req,res)=>{
    const user = {
        email:req.body.email,
        password:req.body.password,
      }  
      console.log(user);
    try{
        const validUser =  await User.findOne({email:user.email});
            console.log(validUser)
        if(validUser){
            const validCredential =await bcrypt.compare(user.password,validUser.password)
            console.log(validCredential);
            if(validCredential){
              const accessToken = jwt.sign({email:validUser.email},process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1m'})
              const refreshToken = jwt.sign({email:validUser.email},process.env.REFRESH_TOKEN_SECRET)
              try{
                   await AccessToken.create({
                        token:accessToken
                    })
                   await RefreshToken.create({
                        token:refreshToken
                    })
              } catch{
                res.status(500).json({satus:"unexpexted error occured"})
              }
              res.status(200).json({status:"Login successfuly",accessToken,refreshToken});
            }else res.status(400).json({status:"password is wrong"})
        }else res.status(400).json({status:"email is wrong or please register!"})
    } catch(err){
      res.status(500).json({satus:"unexpexted error occured"})
    } 
})

app.post('/api/token',async (req,res)=>{
    
    const refreshToken = req.body.refreshToken;
    console.log(refreshToken)
    if(refreshToken==null)res.status(400).json({satus:"invalid token"})
    try{
            const rtoken = await RefreshToken.findOne({token:refreshToken});
            console.log(rtoken); 
            if(rtoken){
                deleteRtoken(rtoken._id);

                jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET,(err,user)=>{
                    if(user){
                        const accessToken = jwt.sign({email:user.email},process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1m'})
                        const refreshToken = jwt.sign({email:user.email},process.env.REFRESH_TOKEN_SECRET);
                        createToken(accessToken,refreshToken);
                        res.status(200).json({accessToken,refreshToken})
                       
                    }else res.status(500).json({satus:"Request forbidden"})
                })
            }else{
                 res.status(500).json({satus:"Request forbidden please login"}) 
            }
 

    } catch(err){
      res.status(500).json({satus:"unexpexted error occured"})
    } 
})

async function createToken(accessToken,refreshToken){
    try{
        await AccessToken.create({
             token:accessToken
         })
        await RefreshToken.create({
             token:refreshToken
         })
   } catch{
     res.status(500).json({satus:"unexpexted error occured"})
   }
}

async function deleteRtoken(refreshTokenId){
    try{
      const response =  await RefreshToken.deleteOne({
             _id:refreshTokenId
         })
         console.log(response);
   } catch{
     res.status(500).json({satus:"unexpexted error occured"})
   }
}