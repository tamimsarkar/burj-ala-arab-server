
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const port = 4000
const admin = require("firebase-admin");
require('dotenv').config()

const MongoClient = require('mongodb').MongoClient;
console.log(process.env.DB_PASS)
const app = express()
app.use(cors());
app.use(bodyParser.json())

var serviceAccount = require("./configs/burj-al-arab-6accb-firebase-adminsdk-bh793-208a00f035.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIRE_DB
});
app.get('/', (req, res) => {
    res.send('Welcome to the node JS World!!!')
})

// mongoDB 


var uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.iwehv.mongodb.net:27017,cluster0-shard-00-01.iwehv.mongodb.net:27017,cluster0-shard-00-02.iwehv.mongodb.net:27017/burjAlArab?ssl=true&replicaSet=atlas-w82rim-shard-0&authSource=admin&retryWrites=true&w=majority`;
MongoClient.connect(uri, function (err, client) {
    const collection = client.db("burjAlArab").collection("booking");
    app.post('/addBooking', (req, res) => {
        const newBooking = req.body;
        collection.insertOne(newBooking)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    app.get('/booking', (req, res) => {
        const bearer = req.headers.authorization;
        if(bearer && bearer.startsWith('Bearer ')){
            const idToken = bearer.split(' ')[1]
           
        admin.auth().verifyIdToken(idToken)
            .then(function (decodedToken) {
                const tokenEmail = decodedToken.email;
                const queryEmail = req.query.email;
                if(tokenEmail == queryEmail){

                    collection.find({ email : queryEmail})
                    .toArray((err, documents) => {
                        res.status(200).send(documents)
                    })
                }else{
                    res.status(401).send("un Authorized")
                }
                // ...
            }).catch(function (error) {
                // Handle error
                res.status(401).send("un Authorized...")
            });
        }
        else{
            res.status(401).send("un Authorized")
        }
    })

});
app.listen(port)