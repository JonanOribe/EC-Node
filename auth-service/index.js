const { json } = require('express')
const express = require('express')
const app = express()
const port = process.env.PORT_ONE || 7070
const mongoose = require('mongoose')
const User = require('./models/User')
const jwt = require('jsonwebtoken')

mongoose.connect('mongodb://localhost/auth-service',{
    useNewUrlParser:true,
    useUnifiedTopology:true
},()=>{
    console.log('Auth-service DB Connected');
})

app.post('/auth/login', async(req,res) =>{
    const {email,password} = req.body
    const user = await User.findOne({email})

    if(!user){
        return res.json({message:"User doesn't exist"})
    }else{
        if(password!==user.password) return res.json({message:"Password incorrect"})
        const payload = {
            email, 
            name: user.name
        }
        jwt.sign(payload,"secret",(err, token)=>{
            if(err) console.log(err);
            else{
                return res.json({token:token})
            }
        })
    }
})

app.post('/auth/register', async(req,res) =>{
    const {email, password, name} = req.body
    const userExist = await User.findOne({email})
    if(userExist){
        return res.json({'User alredy exists'})
    }else{
        const newUser = new User({
            name,email,password
        })
        newUser.save()
        return res.json(newUser)
    }
})

app.use(express.json())
app.get('/', (req, res) => res.send('Hello World!'))
app.listen(port, () => console.log(`Example app listening on port ${port}!`))