import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(express.urlencoded({ extended: false }))
// extended: true or false? -> https://stackoverflow.com/questions/29960764/what-does-extended-mean-in-express-4-0
app.use(express.json())

// Routes
app.get('/', (req, res) => { res.send(`🚀 Syndemic explorer API is up and running!`) })

let port = process.env.PORT || 8080
app.listen(port, () => {
    console.log(`🚀 API running on port ${port}.`)
})

export default app
