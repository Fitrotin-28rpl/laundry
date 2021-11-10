const express = require("express")
const app = express()
const md5 = require("md5")

app.use(express.json())

const models = require("../models/index")
const { request } = require("./paket")
const users = models.users
const {auth} = require("./login")

//fungsi auth dijadikan middleware
app.use(auth)

app.get("/", async (request, response) => {
    let dataUser = await users.findAll()

    return response.json(dataUser)
})
app.post("/", (request, response)=> {
    let newUser = {
        nama : request.body.nama,
        username: request.body.username,
        password : md5(request.body.password),
        role : request.body.role
    }
    users.create(newUser)
    .then(result => {
        return response.json({
            message: 'Data berhasil ditambahkan',
            data : result 
        })
    })
    .catch(error => {
        response.json({
            message: error.message
        })
    })
})

//endpoint update data user
//endpoint update paket
app.put("/:id_user", (request,response)=>{
    //menampung data yang akan diubah
    let data ={
        nama: request.body.nama,
        username: request.body.username,
        role: request.body.role
    }
    
    if (request.body.password){
        data.password = md5(request.body.password)
    }

    let parameter = {
        id_user: request.params.id_user
    }
    
    //proses update
    users.update(data,{where: parameter})
    .then(result => {
        return response.json({
            message: `Data Users berhasil diubah!`,
            data:result
        })
    })
    .catch(error =>{
        return response.json({
            message: error.message
        })
    })
})
//endpoint hapus  data user
//endpoint delete users
app.delete("/:id_user", (request,response)=>{
    let parameter = {
        id_user: request.params.id_user
    }
    users.destroy({where: parameter})
    .then(result => {
        return response.json({
            message: `Data berhasil dihapus`,
            data: result
        })
    })
    .catch(error => {
        return response.json({
            message: error.message
        })
    })  
})


module.exports = app

