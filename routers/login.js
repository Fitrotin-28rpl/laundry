const { response, request } = require("express")
const express = require ("express")
const md5 = require("md5")
const login = express()
login.use(express.json())
const jwt = require("jsonwebtoken")
const secretKey = "underpresser"

const models = require('./../models/index')
const users = models.users;

login.post('/', async (request, response)=>{
    let newLogin = {
        username : request.body.username,
        password : md5(request.body.password)
    }
    let dataUser = await users.findOne({
        where : newLogin
    });
    if(dataUser){
        // let token = md5(newLogin)
        // response.send({token})
        let payload = JSON.stringify(dataUser)
        let token = jwt.sign(payload, secretKey)
        return response.json({
            logged: true,
            token: token
        })
    }else{
        // response.send('Username atau Password salah')
        return response.json({
            logged: false,
            message: 'Invalid username or password'
        })
    }
})

//fungsi auth untuk verif token yang dikirimkan

const auth =( request, response, next)=>{
    //kita dapatkan data authorizationnya
    let header = request.headers.authorization

    //kita dapatkkan nilai tokennya
    let token = header && header.split(" ")[1]

    if(token == null){
        //jika tokennya kosong
        return response.status(401).json({

            message: 'Unauthorized'
        })
    }else{
        let jwtHeader = {
            algorithm : "HS256"
    }
    //verifikasi token yang diberikan
    jwt.verify(token, secretKey, jwtHeader, error => {
        if (error){
            return response.status(401).json({
                message: `Invalid Token`
            })
        } else {
            next()
        }
    })
}
}

module.exports = {login, auth}