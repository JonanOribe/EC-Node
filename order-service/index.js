const secrets = require("../secrets");
const { json } = require("express");
const express = require("express");
const app = express();
const port = process.env.PORT_ONE || 9090;
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const amqp = require("amqplib");
const Order = require("./models/Order");
const isAuthenticated = require("../isAuthenticated");

app.use(express.json());

let channel, connection;

mongoose.connect(
  "mongodb://localhost/order-service",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  () => {
    console.log("Order-service DB Connected");
  }
);

async function connect() {
  const amqpServer = secrets.rabbitmq.url;
  connection = await amqp.connect(amqpServer);
  channel = await connection.createChannel();
  await channel.assertQueue("ORDER");
}

function createOrder(products, userEmail) {
  let total = 0;
  for (let t = 0; t < products.length; t++) {
    total += products[t].price;
  }

  const newOrder = new Order({
    products,
    user: userEmail,
    total_price: total,
  });
  newOrder.save();
  return newOrder
}

connect().then(() => {
  channel.consume("ORDER", (data) => {
    const { products, userEmail } = JSON.parse(data.content);
    const newOrder = createOrder(products, userEmail);
    console.log("Consuming ORDER queue");
    console.log(products);
    channel.ack(data)
    channel.sendToQueue('PRODUCT',Buffer.from(JSON.stringify(newOrder)))
  });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
