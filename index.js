const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

 




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7vvjepm.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// middlewares
const logger = async (req, res, next) => {
  console.log('called:', req.host, req.originalUrl)
  next();
}

const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
      return res.status(401).send({ message: 'unauthorized access' })
  }
  jwt.verify(token, secret, (err, decoded) => {
      if (err) {
          return res.status(401).send({ message: 'unauthorized access' })
      }
      req.user = decoded;
      console.log("decoded-data",decoded);
      next();
  })
}


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const serviceCollection = client.db("skillHub").collection("services");
    const addserviceCollection = client
      .db("skillHub")
      .collection("addservices");

    app.post("/services", async (req, res) => {
      const newService = req.body;

      const result = await serviceCollection.insertOne(newService);
      console.log(result);
      res.send(result);
    });
    app.post("/addservices", async (req, res) => {
      const newService = req.body;

      const result = await addserviceCollection.insertOne(newService);
      console.log(result);
      res.send(result);
    });

    app.get("/addservices", async (req, res) => {
      const cursor = addserviceCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.put("/services/:_id", async (req, res) => {
      const id = req.params._id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateData = req.body;

      const phone = {
        $set: {
          serviceName: updateData.serviceName,
          servicephotoURL: updateData.servicephotoURL,
          description: updateData.description,
          price: updateData.price,
          serviceArea: updateData.serviceArea,
          providerName: updateData.providerName,
          email: updateData.email,
          serviceProviderPhoto: updateData.serviceProviderPhoto,
        },
      };

      const result = await serviceCollection.updateOne(filter, phone, options);

      res.send(result);
    });

    // app.get("/addservices",async (req, res) => {

    //   const result = await addserviceCollection.find().toArray();
    //   res.send(result);
    // });

    app.get("/services", async (req, res) => {
      const cursor = serviceCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/services/:_id", async (req, res) => {
      const id = req.params._id;
      const query = { _id: new ObjectId(id) };
      const result = await serviceCollection.findOne(query);
      res.send(result);
    });

    //jwt post
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      console.log("access-token", user);
      const token = jwt.sign(user, secret, { expiresIn: "10h" });

      res
        .cookie("token", token, {
          httpOnly: true,
          secure: false,
        })
        .send({ success: true });
    });

    // app.get("/services/:_id", async (req, res) => {
    //   const id = req.params._id;

    //   const options ={

    // sort: {"imdb.rating": -1},

    // projection: {  title: 1, imdb: 1}
    // }

    //   const query = { _id: new ObjectId(id) };
    //   const result = await serviceCollection.findOne(query);
    //   res.send(result);
    // });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send(`SkillHub`);
});

app.listen(port, () => {
  console.log(`Server: ${port}`);
});
