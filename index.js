const express = require("express")
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")
const app = express()

// JSON Web Token passwored used to validate your token
const jwtpassword = "mistymazhigoodgirlpuppy"

//MongoDB url used to connect to MongoDB
const mongoDbUrl = "mongodb+srv://qathatcodes:iCRNCQjNdfUlcqcL@master-db.imskikq.mongodb.net/user-registration"

//Creating a schema for users in MongoDB
const User = mongoose.model("users",{
    name: String,
    username: String,
    password: String,
    token: String
})

app.use(express.json())


// In memory database
const ALL_USERS = [{
    username: "rohit@sharma.com",
    password: "hitman",
    name: "Rohit Sharma"
},
{
    username: "virat@kohli.com",
    password: "king",
    name: "Virat Kohli"
},{
    username: "jaspreet@bhumrah.com",
    password: "boom",
    name: "Jaspreet Bhumrah"
}]

// Function to validate if user exists in the in memory database
function validateUser(username, password){
    let userExists = false
    ALL_USERS.forEach(element => {
        if(element.username === username && element.password === password){
            userExists = true
        }
    });
    return userExists;
}

// Function to authtnticate the user returned from validation of JWT Token
function authenticateUser(decodedObj){
    let authenticated = false
    ALL_USERS.forEach(element => {
        if(element.username === decodedObj.username){
            authenticated = true
        }
    });
    return authenticated
}

// GET endpoint to validate a user based on JWT token. (Params required - Header - Autorization passed with a token)
app.get('/authenticate',function(req, res){
    const token = req.headers.authorization

    const decoded = jwt.decode(token,jwtpassword)

    if(!(decoded == null)){
        if(!(authenticateUser(decoded))){
            return res.status(403).json({
                "msg": "User does not exist"
            })
        }else{
            return res.json({
                "msg": "User Authenticated!!"
            })
        }
    } else {
        return res.status(403).json({
            "msg": "Invalid Token"
        })
    }    
})

// POST end point to generate a JWT based on username and password passed as part of request body
app.post('/signin', function(req,res){
    const username = req.body.username
    const password = req.body.password

    if(!(validateUser(username,password))){
        return res.status(403).json({
            "msg": "User does not exist"
        })
    }

    var token = jwt.sign({username: username}, jwtpassword);

    return res.json({
        token,
    })
})

// function to connect to MongoDB instance
function connectMongo(){
    mongoose.connect(mongoDbUrl)
}

//POST call to create a new user and save the details in MongoDB
app.post('/signup', async function(req,res){
    const name = req.body.name
    const username = req.body.username
    const password = req.body.password

    mongoose.connect(mongoDbUrl)
    
    const user_exists = await User.findOne({username: username,})

    if(user_exists){
        return res.status(403).json({
            "msg": "User already Exists"
        })
    }

    const user = new User({
        name: name,
        username: username,
        password: password
    })

    user.save()
    return res.json({
        "msg": "User Created"
    })
})

app.listen(8080)