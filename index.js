const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.00oqpy6.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        

        const carsCollection = client.db('carToys').collection('carToysTabs');
        const allToyCollection = client.db('carToys').collection('addedToys');

        app.get('/carToysTabs', async (req, res) => {
            const cursor = carsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })


        app.get('/carToysTabs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }

            const options = {
                projection: { type: 1, toys: 1, service_id: 1 },
            };

            const result = await carsCollection.findOne(query, options);
            res.send(result);
        })
        

        // userToys

        app.post('/addedToys', async (req, res) => {
            const body = req.body;
            console.log(body);
            const result = await allToyCollection.insertOne(body);
            res.send(result);
        });

        app.get("/allToys/:toyname", async (req, res) => {
            console.log(req.params.toyname);
            if (req.params.toyname == "monster truck") {
                const searchToy = allToyCollection.find({ toy_name: req.params.toyname });
                const result = await searchToy.toArray();
                // console.log(result);
                return res.send(result);
            }
            const allToy = allToyCollection.find();
            const result = await allToy.toArray();
            res.send(result);
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Car Toys is running')
})

app.listen(port, () => {
    console.log(`Toys API is running on port: ${port}`)
})