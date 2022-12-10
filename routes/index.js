var express = require('express');
var router = express.Router();

/* GET home page. */

const { MongoClient } = require('mongodb');
const uri="mongodb+srv://jayaramskumar:just4marry@cluster0.gguofay.mongodb.net/matrimony?retryWrites=true&w=majority"
const client = new MongoClient(uri);

const verifylogin = (req,res,next)=>{
  if(req.session.loggedin){
    next()
  }else{
    res.render('layouts/signin')
  }
}

/* GET home page. */
router.get('/', function(req,res){
  res.render('layouts/signin')
});          

router.get('/signin',verifylogin,(req,res)=>{
  res.render('layouts/signin')
})

router.get('/signup',(req,res)=>{
  //Dont put /layouts here
  if(req.session.loggedin){
    res.redirect('/')
  }else{
    res.render("layouts/signup")
  }
})

  
router.post('/signup',(req,res)=>{
  client.db().collection('logininfo').insertOne(req.body)
  res.redirect('/signin')
  
})   

router.post('/signin',async(req,res)=>{
  var pass = req.body.password
  let user = await client.db().collection('logininfo').findOne({name:req.body.name})  
  if(user){
    if(user.password==pass){
      console.log("user loged in")
      req.session.username=user.name
      req.session.loggedin=true
      req.session.loginid=user._id
     
      res.redirect('/home')

    }else{
      console.log("incorrect password")
      res.render('layouts/signin',{passErr:"incorrect password"})
    }
  }else{
    console.log("incorrect username")
    res.render('layouts/signin',{nameErr:"incorrect username"})
  }

})


router.get('/home',verifylogin,async(req,res)=>{
  let ifprofile = await client.db().collection('userinfo').findOne({
    loginid:req.session.loginid.toString()
  })
  if(ifprofile){
       let allusers =await client.db().collection("userinfo").find({
        loginid:{
           $nin:[req.session.loginid]
        }
        }).toArray()

        let currdata = await client.db().collection('userinfo').findOne({
            loginid:req.session.loginid
        })
        
      
 
        let curr_user_id=''
        if(currdata){
          curr_user_id = currdata._id 
        }

        req.session.curr_user_id=curr_user_id

       

    res.render('layouts/home',{
      loginid:req.session.loginid,
      loggedin:req.session.loggedin,
      username:req.session.username,
      allusers:allusers,
      curr_user_id:curr_user_id,
      })
  }else{
    res.redirect('/myaccount')
  }
})

module.exports = router;
