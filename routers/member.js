const { response, request } = require("express")
const express = require ("express")
const app = express()

//membaca request dari body dengan tipe json
app.use(express.json()) //digunakan untuk mmebaca data dari json

//panggil models
const models = require("../models/index")

//panggil model "member"
const member = models.member

//panggil fungsi auth -> validasi akun

const {auth} = require("./login")

//fungsi auth dijadikan middleware
app.use(auth)

//endpoint for get all member
app.get("/", async (request, response)=>{ //asycn digunakan saat menggunakan await
    let dataMember = await member.findAll() //await digunakan untuk memanggil sebuah promise (sebuah hasil gagal atau berhasil)

    return response.json(dataMember)
})

// endpoint add new member
app.post("/", (request, response)=>{
    let newMember = {
        nama: request.body.nama,
        alamat: request.body.alamat,
        jenis_kelamin: request.body.jenis_kelamin,
        telepon: request.body.telepon
    }

    member.create(newMember)
    .then(result =>{
        response.json({
            message:'Data berhasil ditambahkan'
        })
    })
    .catch(error => {
        response.json({
            message: error.message
        })
    })
})

//endpoint update data member
app.put("/:id_member", (request, response)=> {
    //tampung data yang akan diubah
    let data = {
        nama : request.body.nama,
        alamat : request.body.alamat ,
        telepon: request.body.telepon,
        jenis_kelamin: request.body.jenis_kelamin
    }
    let parameter = {
        id_member: request.params.id_member
    }

    //proses update
    member.update(data, {where:parameter})
    .then(result => {
        return response.json ({
            message: 'Data berhasil diubah',
            data : result
        })
    })
    .catch(error => {
        return response.json({
            message: error.message
        })
    })
})

//endpoint hapus  data member
app.delete("/:id_member", (request, response) => {
    // tampung data yg akan dihapus
    let parameter = {
        id_member: request.params.id_member
    }
    // proses hapus
    member.destroy({
            where: parameter
        })
        .then(result => {
            return response.json({
                message: `Data berhasil Dihapus`
            })
        })
        .catch(error => {
            return response.json({
                message: error.message
            })
        })
})


module.exports = app