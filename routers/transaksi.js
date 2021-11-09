const { response } = require("express")
const express = require("express")
const app = express()
app.use(express.json())

//call model
const models = require("../models/index")
const transaksi = models.transaksi
const detail_transaksi = models.detail_transaksi

//endpoint get transaksi
app.get("/", async(request, response)=>{
    let dataTransaksi = await transaksi.findAll({
        include: [
            {model : models.member, as:"member" },
            {model : models.users, as:"user" },
            {
                model : models.detail_transaksi, 
                as:"detail_transaksi",
                include: [
                    {model: models.paket, as:"paket"}
                ]
            }
        ]
    })
    return response.json(dataTransaksi)
})

//endpoint new transaksi
app.post("/", (request, response)=>{
    let newTransaksi = {
        id_member: request.body.id_member,
        tgl: request.body.tgl,
        batas_waktu : request.body.batas_waktu,
        tgl_bayar : request.body.tgl_bayar,
        status: 1,
        dibayar: request.body.dibayar,
        id_user: request.body.id_user
    }

    transaksi.create(newTransaksi)
    .then( result => {
        //jika inserts transaksi berhasil, lanjut 
        //insert data detail transaksinya
        let newIDTransaksi = result.id_transaksi

        let detail = request.body.detail_transaksi
        for(let i = 0; i < detail.length; i++){
            //sebelumnya
            //nilai detail index[i] hanya punya key id_paket 
            //dan qty saja
            detail[i].id_transaksi = newIDTransaksi
        }
        //proses insert detail_transaksi
        detail_transaksi.bulkCreate(detail)
        .then(result => {
            return response.json({
                message: 'Data transaksi berhasil ditambahkan'
            })
        })
        .catch(error => {
            return response.json({
                message: error.message
            })
        })
    })
    .catch(error => {
        return response.json({
            message : error.message
        })
    })
})

app.put("/:id_transaksi", async(request,response)=>{
    // tampung data utk insert ke tbl transaksi
    let dataTransaksi ={
            id_member: request.body.id_member,
            tgl: request.body.tgl,
            batas_waktu: request.body.batas_waktu,
            tgl_bayar: request.body.tgl_bayar,
            status: 1,
            dibayar: request.body.dibayar,
            id_user: request.body.id_user
    }
    // tampung parameter id_transaksi
    let parameter ={
        id_transaksi: request.params.id_transaksi
    }
    // setelah berhasil update ke table transaksi, data detail transaksi yg lama dihapus semua berdasarkan id transaksinya
     transaksi.update(dataTransaksi,{where: parameter})
     .then(async(result) => {
        //  hapus data di detail
        await detail_transaksi.destroy({where: parameter})
        // masukkan data detail terbaru
        let detail = request.body.detail_transaksi
        // proses menyisipkan transaksi_id
        for (let i = 0; i< detail.length; i++) {
               //sebelumnya nilai detail[i] hanya mempunyai id_paket dan qty, maka untuk menambahkan id_transaksi
                //menggunakan for untuk menambah id_transaksi disetiap objek pada array
                detail[i].id_transaksi = request.params.id_transaksi
        }
    //  setelah dihapus, dimasukkan lagi menggunakan bulkCreate.
    detail_transaksi.bulkCreate(detail)
    .then(result =>{
     return response.json({
         message:"data berhasil di update"
     })
    })
    .catch(error => {
     return  response.json({
            message: error.message
        })
    })
     })
         .catch(error => {
             return response.json ({
                 message: error.message
             })
         })
    
    })

app.delete("/:id_transaksi", (request, response)=>{
    let parameter ={
        id_transaksi: request.params.id_transaksi
    }
    detail_transaksi.destroy({where: parameter})
    .then(result => {
        //hapus data transaksi
        transaksi.destroy({where: parameter})
        .then(hasil =>{
            return response.json({
                message:'Data berhasil dihapus'
            })
        })
        .catch(error=>{
            return response.json({
                message: error.message
            })
        }) 
    })
    .catch(error=>{
        return response.json({
            message: error.message
        })
    }) 
})

//endpoint untuk mengubah status transaksi
app.post("/status/:id_transaksi", (request, response)=>{
    //kita tamoung nlai status 
    let data = {
        status : request.body.status
    }

    //kita tampung parameternya
    let parameter ={
        id_transaksi : request.params.id_transaksi
    }

    //proses update status transaksi
    transaksi.update(data, {where: parameter})
    .then(result =>{
        return response.json({
            message: 'Data status berhasil diubah'
        })
    })
    .catch(error =>{
        return response.json({
            message: error.message
        })
    })
})

//endpoint untuk mengubah status pembayaran
app.get("/bayar/:id_transaksi", (request, response)=>{
    let parameter = {
        id_transaksi:  request.params.id_transaksi
    }

    let data = {
        //mendapatkan tanggal yang saat ini berjalan
        tgl_bayar: new Date().toISOString().split("T")[0],
        dibayar : true
    }

    //proses transaksi
    transaksi.update(data,{ where: parameter})
    .then(result => {
        return response.json({
            message:'Transaksi telah dibayar'
        })
    })
    .catch(error => {
        return response.json({
            message: error.message
        })
    })
})
module.exports = app
