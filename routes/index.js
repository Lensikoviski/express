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



router.get('/logout',(req,res)=>{
  req.session = null
  res.redirect('/')
})
  
router.get('/myaccount',async(req,res)=>{
      //console.log(req.session)
      let data =await client.db().collection('userinfo').findOne({loginid:req.session.loginid})   
      if(data){
        res.render("layouts/myprofile",{loggedin:req.session.loggedin,username:req.session.username,userdata:data,imagename:data._id.toString()})  
      }else{
      res.render('layouts/create_user',{loginid:req.session.loginid,loggedin:req.session.loggedin,username:req.session.username})
      }
  
})  


 
router.post('/createuser',(req,res)=>{
    
  console.log("createing user")
  if(req.body.name=='' || req.body.age=='' || req.body.fathersname=='' ||
  req.body.mothersname=='' || req.body.Education=='' || req.body.familytype==''
  || req.body.familystatus=='' || req.body.livingin=='' || 
  req.body.height=='' || req.body.bodytype=='' || req.body.complexion==''||
  req.body.about=='' || req.body.sex=='' || req.body.martialstatus=='' ||
  req.body.religion=='' || req.body.occupation=='' || req.body.income=='' ||
  req.body.height=='' || req.body.weight=='' || req.body.phone=='' ||
  req.body.address==''){
  
  res.render('layouts/create_user',{loginid:req.session.loginid,loggedin:req.session.loggedin,username:req.session.username,Error:'Please fill all the fields',partial_data:req.body})

  }else{
    client.db().collection('userinfo').insertOne(req.body).then((data)=>{
      let imagename = data.insertedId
      if(req.files){
        let image = req.files.Image
        image.mv("./public/userimages/"+imagename+".jpg",(err,done)=>{
        if(!err){
          console.log("image inserted")
        }else{
          throw err   
        }
      }) 
      }
    })
    client.db().collection('userinfo').updateOne(
      {loginid:req.body.loginid},
      {
        $set:{
          intrested:[],
          myintrests:[]
        }
      }
    )
    req.session.acc_created=true
    res.redirect('/myaccount') 
    console.log(req.session) 
  }
 
})

router.get("/edit/:id",async (req,res)=>{
    let data =await client.db().collection('userinfo').findOne({_id:ObjectId(req.params.id)})   
    res.render('layouts/edit_user',
    {currdata:data,
      imagename:data._id.toString(),
      loggedin:req.session.loggedin,
      username:req.session.username,
      loginid:req.session.loginid})
  
})



module.exports = router;
