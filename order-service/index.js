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

connect();

app.post("/order/create", isAuthenticated, async (req, res) => {
  const { name, description, price } = req.body;
  const newOrder = new Order({
    name,
    description,
    price,
  });
  return res.json(newOrder);
});

app.post("/order/buy", isAuthenticated, async (req, res) => {
  const { ids } = req.body;
  const orders = await Order.find({ _id: { $in: ids } });
});

app.get("/", (req, res) => res.send("Hello World!"));
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
