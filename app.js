const express = require('express');
const app = express();
const fs = require('fs')

const{uid} = require('uid')
const bodyParser = require('body-parser')
app.use(bodyParser.json())

// app.get('/users',getUsersHandler);
// app.get('/userById'.getUserByIdHandler);

// app.post('/registration', registrationHandler);
// app.post('/authorization', authorizationHandler);

// app.post('/delete',deleteUserByIdHandler)

// app.put('/update/:password',updateUserPassword)

const registrationHandler = function(req, res) {
    let users = dbRead();
    const body = req.body
    let {login, password,try_password} = body;
    
    for(const user of users) if(user.login === login) return res.json({message: 'This login is already taken', status: 'Error', payload: body})
        
    if(login.length < 8 || login.length > 128) return res.json({message: 'login Must be at least 8 characters', status: 'Error', payload: body});

    console.log(users);

    if(password.length < 10 || password.length > 256) return res.json({message: 'Password must be at least 10 characters', status: 'Error', payload: body});

    if(password !== try_password) return res.json({message: 'Password is not confirmed', status: 'Error', payload: body});
    dbCreate(login,password)
    
    console.log(users);
    return res.json(body)   
}
const authorizationHandler = function(req,res){
    let users = dbRead();
    const body = req.body
    let {login, password} = body;
    for(const user of users) if(user.login === login || user.password === password) return res.json({message: 'Authorization success', status: 'OK', payload: {user,isAuth:true}})
    
}
const deleteUserByIdHandler = function(req,res){
    let users = dbRead();
    const body = req.body
    let {id} =body;
    // console.log(id);
    dbDelete(id);
    console.log(users);
    return res.json({message: 'User has been deleted successfully', status: 'Done', payload: body})
}
const getUsersHandler = function(req,res){
    let users = dbRead();
    return res.json({message: 'Users', status: 'Done', payload: users})

    
}
const getUserByIdHandler =function(req,res){
    let users = dbRead();
    // const body = req.body;
    // let{id} = body;
    let {id}= req.params;   
    for(const user of users)if(user.id === id) return res.json({message: 'User by ID has found', status: 'OK', payload: user})
}
const updateUserPassword = function(req,res){
    let users = dbRead();
    const body = req.body
    let{id} = body
    let {password}= req.params
    dbUpdate(id,password)
    for(const user of users)if(user.id === id) return res.json({message: 'User password updated', status: 'OK', payload: user})
}

function dbRead(){
    const users = JSON.parse(Buffer.from(fs.readFileSync(`db.json`)).toString())
    return users;
}
function dbCreate(login,password){
    let users = dbRead();
    const newUser = {
        id: uid(8),
        login,
        password
    }
    users.push(newUser)
    fs.writeFileSync(`./db.json`, JSON.stringify(users))
}



function dbUpdate(id,password){
    let users = dbRead();
    // dbDelete(id);
    let index = 0;
    for(const user of users){
        index++
        if(user.id === id){
            break;
        }
    }
    users[index-1]["password"] = password;
    // dbCreate(login,password)

    fs.writeFileSync(`./db.json`,JSON.stringify(users))
}

function dbDelete(id){
    let users = dbRead();
    let index = 0;
    for(const user of users){
        index++
        // console.log(user.id, id, user.id === id);
        if(user.id === id){
            break;
        }
    }
    // console.log(index);
    users.splice(index-1,1)
    fs.writeFileSync(`./db.json`,JSON.stringify(users))
}

app.get('/userById/:id',getUserByIdHandler)
app.get('/users',getUsersHandler)

app.post('/registration', registrationHandler);
app.post('/authorization', authorizationHandler);
app.post('/delete',deleteUserByIdHandler)

app.put('/update/:password',updateUserPassword)

app.listen(3000)
