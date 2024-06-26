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

        // ----------sad LAb------------------------------------------------------------
        const demoCourses = client.db("sadLab").collection("demoCourses");
        const formCourses = client.db("sadLab").collection("formCourses");
        const users = client.db("sadLab").collection("users");
        const courseRequest = client.db("sadLab").collection("courseRequest");
        const communityPost = client.db("sadLab").collection("community");
        const bookmarks = client.db("sadLab").collection("bookmarks");
        const cartCollection = client.db("sadLab").collection("carts");

        // -----------end sad LAb-----------------------------------------------------------

        // search text
        const collection = client.db('carToys').collection('addedToys');

        // Create an index
        collection.createIndex({ toy_name: 1 }, (err, result) => {
            if (err) {
                console.error('Error creating index:', err);
                return;
            }

            console.log('Index created successfully:', result);

            client.close();
        });

        // search data
        app.get("/search/:text", async (req, res) => {
            const searchText = req.params.text;

            if (req.params.text == "all") {
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

        app.get('/carToysTabs/:id', async (req, res) => {
            // const cursor = carsCollection.find();
            const allToy = carsCollection.find({ id: req.params.id });
            const result = await allToy.toArray();
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


        app.get('/toyDetail/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }

            const options = {
                projection: { seller_name: 1, seller_email: 1, toy_name: 1, image: 1, subCategory: 1, price: 1, rating: 1, quantity: 1, description: 1 },
            };

            const result = await allToyCollection.findOne(query, options);
            res.send(result);
        })



        // userToys insert

        app.post('/addedToys', async (req, res) => {
            const body = req.body;
            console.log(body);
            const result = await allToyCollection.insertOne(body);
            res.send(result);
        });




        // email filtering

        app.get("/myToys/:email", async (req, res) => {
            console.log(req.params.email);
            const allToy = allToyCollection.find({ seller_email: req.params.email });
            const result = await allToy.toArray();
            res.send(result);
        })


        // update

        app.put("/updateToy/:id", async (req, res) => {
            const id = req.params.id;
            const body = req.body;
            const filter = { _id: new ObjectId(id) };
            const updateToy = {
                $set: {
                    price: body.price,
                    quantity: body.quantity,
                    description: body.description,
                },
            };
            const result = await allToyCollection.updateOne(filter, updateToy);
            res.send(result);
        });

        // delete

        app.delete('/delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await allToyCollection.deleteOne(query);
            res.send(result);
        })



        // ----------sad LAb------------------------------------------------------------
        // Demo course .....api
        app.get('/demoCourses', async (req, res) => {
            const result = await demoCourses.find().toArray();
            res.send(result);
        })

        // formCourses courses that are posted by instructors ....api
        app.get('/formCourses', async (req, res) => {
            const result = await formCourses.find().toArray();
            res.send(result);
        })

        // insert courses to database from instructor
        app.post('/formCourses', async (req, res) => {
            const newFormCourses = req.body;
            // console.log(newFormCourses);
            const result = await formCourses.insertOne(newFormCourses);
            res.send(result);
        })

        // insert users to database from instructor
        app.post('/users', async (req, res) => {
            const newUser = req.body;
            const query = { email: newUser.email }
            const existingUser = await users.findOne(query);

            if (existingUser) {
                return res.send({ message: 'user already exists' })
            }
            // console.log(newFormCourses);
            const result = await users.insertOne(newUser);
            res.send(result);
        })
        // insert bookmarks to database from instructor
        app.post('/bookmarks', async (req, res) => {
            const newBookmark = req.body;
            console.log(newBookmark);
            const query = { idEmail: newBookmark.idEmail }
            const existingBookmark = await bookmarks.findOne(query);

            if (existingBookmark) {
                return res.send({ message: 'bookmark already exists' })
            }
            // console.log(newFormCourses);
            else {
                const result = await bookmarks.insertOne(newBookmark);
                res.send(result);
            }
        })

        // get bookmarks
        app.get('/bookmarks/:email', async (req, res) => {
            const email = req.params.email;
            const result = await bookmarks.find({ email: email }).toArray();
            res.send(result);
        });

        // insert course request to database from instructor
        app.post('/courseRequest', async (req, res) => {
            const newCourse = req.body;
            const result = await courseRequest.insertOne(newCourse);
            res.send(result);
        })

        // courseRequest 
        app.get('/courseRequest', async (req, res) => {
            const result = await courseRequest.find().toArray();
            res.send(result);
        })


        // insert communityPost to database from instructor
        app.post('/communityPost', async (req, res) => {
            const newPost = req.body;
            const result = await communityPost.insertOne(newPost);
            res.send(result);
        })

        // communityPost 
        app.get('/communityPost', async (req, res) => {
            const result = await communityPost.find().toArray();
            res.send(result);
        })

        // get users ....api
        app.get('/users', async (req, res) => {
            const result = await users.find().toArray();
            res.send(result);
        })

        // only one user api
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const result = await users.find({ email: email }).toArray();
            res.send(result);
        });

        // only one instructor class
        app.get('/formCourses/:email', async (req, res) => {
            const email = req.params.email;
            const result = await formCourses.find({ email: email }).toArray();
            res.send(result);
        });

        // only one user api BY ID
        app.get('/users/:id', async (req, res) => {
            const id = req.params.id;
            const result = await users.find({ _id: id }).toArray();
            res.send(result);
        });
        // only one user api BY EMAIL
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const result = await users.find({ email: email }).toArray();
            // const result = await users.find({ email: email })
            res.send(result);
        });

        //    make instructor 
        app.put("/users/:email", async (req, res) => {
            const email = req.params.email;
            const body = 'instructor';
            console.log(email, body);
            const filter = { email: email };
            const updateUser = {
                $set: {
                    role: body,
                },
            };
            const result = await users.updateOne(filter, updateUser);
            // console.log(result)
            res.send(result);
        });

        // cart collection apis
        // app.get('/carts', async (req, res) => {
        //     const email = req.query.email;

        //     if (!email) {
        //         res.send([]);
        //     }

        //     const decodedEmail = req.decoded.email;
        //     if (email !== decodedEmail) {
        //         return res.status(403).send({ error: true, message: 'forbidden access' })
        //     }

        //     const query = { email: email };
        //     const result = await cartCollection.find(query).toArray();
        //     res.send(result);
        // });


        // app.post('/carts', async (req, res) => {
        //     const item = req.body;
        //     const result = await cartCollection.insertOne(item);
        //     res.send(result);
        // })

        // it will be change for better functionality
        app.post('/carts', async (req, res) => {
            const newCart = req.body;
            console.log(newCart);
            const query = { idEmail: newCart.idEmail }
            const existingCart = await cartCollection.findOne(query);

            if (existingCart) {
                return res.send({ message: 'Cart already exists' })
            }
            // console.log(newFormCourses);
            else {
                const result = await cartCollection.insertOne(newCart);
                res.send(result);
            }
        })

        app.get('/carts/:email', async (req, res) => {
            const email = req.params.email;
            const result = await cartCollection.find({ email: email }).toArray();
            res.send(result);
        });



        // -----------end sad LAb-----------------------------------------------------------


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

