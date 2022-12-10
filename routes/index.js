var express = require('express');
var router = express.Router();

/* GET home page. */

const { MongoClient } = require('mongodb');
const uri="mongodb+srv://jayaramskumar:just4marry@cluster0.gguofay.mongodb.net/matrimony?retryWrites=true&w=majority"
const client = new MongoClient(uri);



router.get('/',async function(req, res, next) {
  let data =  await client.db().collection('userinfo').findOne({name:'akhil U Nair'})
  res.render('index', { title: 'Express' ,data:data});
});

module.exports = router;
