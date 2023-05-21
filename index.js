const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { text } = require('express');

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

        // search text
        const collection = client.db('carToys').collection('addedToys');

        // Create an index
        collection.createIndex({ toy_name: 1 }, (err, result) => {
            if (err) {
                console.error('Error creating index:', err);
                return;
            }

            console.log('Index created successfully:', result);

            // Close the MongoDB connection
            client.close();
        });

        app.get("/search/:text", async (req, res) => {
            const searchText = req.params.text;

            if (req.params.text == 'all') {
                const allToy = collection.find();
                const result = await allToy.toArray();
                return res.send(result);
            }
            const result = await collection.find({
                $or: [
                    { toy_name: { $regex: searchText, $options: "i" } },
                ],
            }).toArray();
            res.send(result);

        })

        // ...............
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
            if (req.params.toyname == "a") {
                const searchToy = allToyCollection.find({ toy_name: req.params.toyname });
                const result = await searchToy.toArray();
                // console.log(result);
                return res.send(result);
            }
            const allToy = allToyCollection.find();
            const result = await allToy.toArray();
            res.send(result);
        })

        app.get("/allToys/:email", async (req, res) => {
            console.log(req.params.seller_email);
            const allToy = allToyCollection.find({ seller_email: req.params.seller_email });
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