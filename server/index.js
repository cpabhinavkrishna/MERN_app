require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('./models/user.model');
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
    app.listen(3100,()=>{
        console.log("server listening to the port:3100");
    })
})
.catch(e=>console.log(e));;


//endpoints
app.post('/api/register',async (req,res)=>{
     const user = {
        userName:req.body.userName,
        email:req.body.email,
        password:req.body.password,
      }
      console.log(user);     
    try{
      const duplicateUser =  await User.findOne({
            email:user.email
        });
        console.log(duplicateUser);
        if( !duplicateUser){
            const hashedPwd = await bcrypt.hash(user.password,10);
           try{
            User.create({
                userName: user.userName,
                email:user.email,
                password:hashedPwd
               });
           }catch(err){
            res.status(500).json({status:err})
           }
            res.status(201).send("user created successfuly!")
        }else res.status(400).json({status:"user already present"});
    } catch(err){
        console.log(err);
        res.status(500).json({status:"oops something went wrong"})
    } 
})



app.get('/api/getAllUsers',authentication,async (req,res)=>{
    console.log(req.body);
    try{
   const user =  await User.find({},{
            userName:1,
            email:1
        });
        console.log(user);
        if(user){
            res.status(200).json(user);
        }else{ 
            res.status(200).json({status:"no user found"})
        }
    } catch(err){
        console.log(err);
      res.status(500).json({satus:"unexpexted error occured"})
    } 
})
app.delete('/api/deleteUser/:email',authentication,async (req,res)=>{
    console.log(req.params.email); 
    try{
   const user =  await User.findOne({email:req.params.email},{
            userName:1,
            email:1
        });
        console.log(user);
        if(user){
            const response = await User.deleteOne({email:user.email})
            res.status(200).json(response);
        }else{ 
            res.status(200).json({status:"no user found to be deleted"})
        }
    } catch(err){
        console.log(err);
      res.status(500).json({satus:"unexpexted error occured"})
    } 
})

app.patch('/api/updateUser/:email',authentication,async (req,res)=>{
    console.log(req.params.email); 
    try{
   const user =  await User.findOne({email:req.params.email},{
            userName:1,
            email:1
        });
        console.log(user);
        if(user){
            if(req.body.userName&&req.body.email){
                const response = await User.updateOne({email:user.email},{$set:{
                    userName:req.body.userName,
                    email:req.body.email
                }})
                res.status(200).json(response);
            }else res.status(400).json({status:"please give valid input"});
        }else{ 
            res.status(200).json({status:"no user found to be deleted"})
        }
    } catch(err){
        console.log(err);
      res.status(500).json({satus:"unexpexted error occured"})
    } 
})

//custom middleware function
function authentication(req,res,next){
    const authHeader = req.headers['authorization']
    const token = authHeader.split(' ')[1];
    console.log(token);
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,user)=>{
        if(!err)next();
        else res.status(500).send("Request forbidden")
    })
}

 
