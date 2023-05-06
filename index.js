var express = require('express');
const {MongoClient} = require('mongodb');
var app = express();
app.use(express.static('src'));
app.use(express.static('../SNAP-Contracts/build/contracts'));


async function connect(){
  const client = new MongoClient("mongodb+srv://vrashri:vrashi123@cluster0.awdeeok.mongodb.net/?retryWrites=true&w=majority");
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    const db =  client.db("admin");
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    // const users  = db.collections("Customers.Customers");
    // const data =  (await users).find();
    // console.log(data)
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
app.get('/', function (req, res) {
  res.render('index.html');
});
app.listen(process.env.PORT || 3000, function () {
  console.log('Example app listening on port 3000!');
  connect();
});