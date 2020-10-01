var express= require('express');
var app=express();

let server = require('./server.js');
let middleware = require('./middleware.js');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());


const MongoClient=require('mongodb').MongoClient;
const response = require('express');


const url='mongodb://127.0.0.1:27017';
const dbName='HospitalInventory';

let db;
MongoClient.connect(url,{useUnifiedTopology : true}, (err,client) =>
{
    if(err)
        return console.log(err);
    db = client.db(dbName);
    console.log(`Connected Database: ${url}`);
    console.log(`Database : ${dbName}`);
});

// Get Hospitals 
app.get('/hospitaldetails',middleware.checkToken, function(req, res)
{
    console.log("Fetching the list of Hospitals");
    var data = db.collection('hospitals').find().toArray().then(result => res.json(result));
});

// Get Ventilators 
app.get('/ventilatordetails',middleware.checkToken, function(req, res)
{
    console.log("Fetching the list of Ventilators");
    var data = db.collection('ventilators').find().toArray().then(result => res.json(result));
});

// Search Ventilators by status and hospital name
app.get('/getventbystatusandname',middleware.checkToken,function(req,res)
{
	let hspname = req.query.name;
	let status = req.query.status;
	console.log("Fetching the list of Ventilators");
	var data = db.collection('ventilators').find({"name":new RegExp(hspname, 'i'),"status":status}).toArray().then(result => res.json(result));
});

// Search Ventilators by name
app.get('/getventbyname',middleware.checkToken,function(req, res) 
{
    var hspname = req.query.name;
    console.log("Fetching the list of Ventilators");
    var ventilatordetails = db.collection('ventilators').find({'name' : new RegExp(hspname, 'i')}).toArray().then(result => res.json(result));
});

// Search Ventilators by status
app.get('/getventbystatus',middleware.checkToken,function(req,res)
{
	let status = req.query.status;
	console.log("Fetching the list of Ventilators");
	var data = db.collection('ventilators').find({"status":status}).toArray().then(result => res.json(result));
});

// Update Ventilator Status by Ventilator Id
app.post('/updateventilator',middleware.checkToken,function(req, res)
{
    var ventId = { ventilatorId : req.body.ventilatorId};
    console.log(`Updating Status of Ventilator ${req.body.ventilatorId}`)
    var newvalues = { $set : {status : req.body.status}};
    db.collection("ventilators").updateOne(ventId, newvalues, function (err, result) 
    {
        res.json(`Status of Ventilator ${req.body.ventilatorId} set to ${req.body.status}`);
        if(err) throw err;
    });
});

// Add a new Ventilator of a particular hospital
app.put('/addventilator',middleware.checkToken,function(req,res)
{
    var hId = req.body.hId;
    var ventilatorId = req.body.ventilatorId;
    var status = req.body.status;
    var name = req.body.name;
    var item = 
    {
        hId : hId, ventilatorId : ventilatorId, status : status, name : name
    }; 
    console.log(`Adding a new Ventilator ${ventilatorId} to Hospital ${hId}`);
    db.collection('ventilators').insertOne(item, function(err, result) {
        res.json(`Ventilator ${ventilatorId} Added to ${name}`);
        if(err) throw err;
    });
}); 

app.delete('/deleteventilator',middleware.checkToken,function(req, res) 
{
    var item = req.body.ventilatorId;
    console.log(`Deleting Ventilator ${item}`);
    db.collection('ventilators').deleteOne({"ventilatorId":item}, function(err, obj)
    {
        if(err) throw err;
        res.json(`Ventilator ${item} Deleted`);
    });
});

app.listen(3000);