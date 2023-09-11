require('dotenv')
const cors = require('cors')
const express = require('express');
const sendSasi = require('./src/service.js')
const app = express();
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
app.use(express.limit('1gb'))

app.get('/', (req, res) => {
    res.status(200).send({ msg: "Funcionando!!!" })
})

app.post("/send-sasi", async (req, res) => {
    const { user_images, body_data, title, anonymous, test, channelId } = req.body;
    const { authorization } = req.headers;

    const data_send = {
        images: user_images,
        data: body_data,
        token: authorization,
        title,
        anonymous,
        test,
        channel: channelId
    }

    console.log("user_images: ")
    console.log(data_send)

    const result = await sendSasi(data_send)

    res.send({ sasi_id: result.id })
})

app.listen(port)