const secrets = require('../secrets')
const { json } = require('express')
const express = require('express')
const app = express()
const port = process.env.PORT_ONE || 8050
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const amqp = require('amqplib')
const Product = require('./models/Product')
const isAuthenticated = require('../isAuthenticated')

app.use(express.json())

let channel, connection

mongoose.connect('mongodb://localhost/product-service',{
    useNewUrlParser:true,
    useUnifiedTopology:true
},()=>{
    console.log('Product-service DB Connected');
})

async function connect(){
    const amqpServer = secrets.rabbitmq.url
    connection = await amqp.connect(amqpServer)
    channel = await connection.createChannel()
    await channel.assertQueue('PRODUCT')
}

connect()

app.post('/product/create',isAuthenticated, async (req,res) => {
    const {name,description,price} = req.body
    const newProduct = new Product({
        name,
        description,
        price
    })
    return res.json(newProduct)
})

app.get('/', (req, res) => res.send('Hello World!'))
app.listen(port, () => console.log(`Example app listening on port ${port}!`))