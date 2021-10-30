const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();


const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ocrjv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();
        const database = client.db('prosenjit-travell');
        const toursCollection = database.collection('tours');
        const usersCollection = database.collection('users');

        // GET API
        app.get('/tourcollection', async (req, res) => {
            const cursor = toursCollection.find({});
            const page = req.query.page;
            const size = parseInt(req.query.size);
            let tours = [];
            const count = await cursor.count();
            if (page) {
                tours = await cursor.skip(page * size).limit(size).toArray();
            }
            else {
                tours = await cursor.toArray();
            }
            res.send({
                count,
                tours
            });
        })

        app.get('/tourcollection/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const tour = await toursCollection.findOne(query);
            res.send(tour);
        })
        // POST API ******
        app.post('/tourcollection', async (req, res) => {
            const newTour = req.body;
            const result = await toursCollection.insertOne(newTour);
            res.json(result);
        })

        app.post('/users', async (req, res) => {
            const newUser = req.body;
            const result = await usersCollection.insertOne(newUser);
            res.json(result);
        })
        app.get('/users', async (req, res) => {
            const cursor = usersCollection.find({});
            users = await cursor.toArray();
            res.send(users);
        })
        // // DELETE API
        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await usersCollection.deleteOne(query);
            res.json(result);
        })

        // // UPDATE API
        app.put('/users/:id', async (req, res) => {
            const id = req.params.id;
            const updateUser = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upset: true };
            const updateDoc = {
                $set: {
                    status: updateUser.status
                },
            }
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            console.log(result);
            res.json(result);
        })
    }
    finally {

    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Prosenjit Travel Server is running successfully');
});

app.get('/test', (req, res) => {
    res.send('Prosenjit Travel Server is ok');
});

app.listen(port, () => {
    console.log('server is up and running at', port);
})