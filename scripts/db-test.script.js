const bcrypt = require('bcrypt');
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017";

const dbname = "auth_jwt_test";

const client = new MongoClient(url, {
    useUnifiedTopology: true
});

client.connect(function(err) {
    if (err) {
        throw err;
    }
    const db = client.db(dbname);
    db.collection('users').deleteMany({}).then(() => {
        const hash = bcrypt.hashSync('admin1', 2);
        db.collection('users').insertOne({
            username: 'admin1',
            password: hash,
            isAdmin: true
        }).then(() => {
            client.close();
            console.log("DB scripts ran successfully");
        }).catch(err => {
            throw err;
        });
    }).catch(err => {
        throw err;
    });
});