require('dotenv')
const cors = require('cors')
const express = require('express');
const sendSasi = require('./src/service.js')
const app = express();
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.status(200).send({ msg: "Funcionando!!!" })
})

app.post("/send-sasi", async (req, res) => {
    const images = req.body.user_images
    const data = req.body.body_data
    const token = req.headers.authorization
    const title = req.body.title
    const anonymous = req.body.anonymous
    const test = req.body.test
    const channel = req.body.channelId

    const data_send = {
        images,
        data,
        token,
        title,
        anonymous,
        test,
        channel
    }

    console.log("user_images: ")
    console.log(data_send)

    const result = await sendSasi(data_send)

    res.send({ sasi_id: result.id })
})

app.listen(port)