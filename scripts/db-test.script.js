require('dotenv').config();

const fs = require('fs');
const async = require('async');
let testData = JSON.parse(fs.readFileSync('./test-data/test-data.json', {encoding: 'utf-8'}));
// const { genTestData } = require('../test-data/test-data-gen');

//generating test data based on salt rounds
// if (testData.saltRounds !== +process.env.SALT_ROUNDS) {
//     console.log('GENERATING NEW DATA');
//     debugger;
//     testData = genTestData(+process.env.SALT_ROUNDS, testData);
// }

//connecting to mongo-db
const MongoClient = require('mongodb').MongoClient;
const url = process.env.DB_URL;

const client = new MongoClient(url, {
    useUnifiedTopology: true,
    useNewUrlParser: true
});

client.connect(function(err) {
    if (err) {
        throw err;
    }
    const db = client.db(process.env.DB_NAME).collection('users');
    db.deleteMany({}).then(() => {
        async.parallel([
            (cb) => {
                db.insertMany(testData.verifiedUsers.standard, (err) => {
                    if (err) {
                        return cb(err);
                    }
                    cb();
                })
            },
            (cb) => {
                db.insertMany(testData.verifiedUsers.admin, (err) => {
                    if (err) {
                        return cb(err);
                    }
                    cb();
                })
            },
            (cb) => {
                db.insertMany(testData.nonVerifiedUsers.standard, (err) => {
                    if (err) {
                        return cb(err);
                    }
                    cb();
                })
            },
            (cb) => {
                db.insertMany(testData.nonVerifiedUsers.admin, (err) => {
                    if (err) {
                        return cb(err);
                    }
                    cb();
                })
            }
        ], (err) => {
            if (err) {
                throw err;
            }
            console.log('TEST DATA SETUP SUCCESSFULLY');
            client.close();
        });
    }).catch(err => {
        throw err;
    });
});