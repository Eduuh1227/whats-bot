require('dotenv').config()
const express = require('express')
const axios = require('axios')

const app = express()
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Servidor funcionando 🚀')
})

const TOKEN = process.env.WHATSAPP_TOKEN
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID

// Verificação do webhook
app.get('/webhook', (req, res) => {
  const verify_token = "meu_token_verificacao"

  const mode = req.query['hub.mode']
  const token = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']

  if (mode && token === verify_token) {
    res.status(200).send(challenge)
  } else {
    res.sendStatus(403)
  }
})

// Receber mensagens
app.post('/webhook', async (req, res) => {
  const body = req.body

  if (body.entry) {
    const message = body.entry[0].changes[0].value.messages?.[0]
    
    if (message) {
      const from = message.from
      const text = message.text?.body

      await axios.post(
        `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: "whatsapp",
          to: from,
          text: { body: `Você disse: ${text}` }
        },
        {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      )
    }
  }

  res.sendStatus(200)
})

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000")
})