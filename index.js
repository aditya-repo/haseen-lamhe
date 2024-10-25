const express = require("express")
const app = express()
const cors = require("cors")
const database = require("./models")
require("dotenv").config()

// Constant Strings
const MONGO_URI = process.env.MONGO_URI
const PORT = process.env.PORT

// Database connection
database(MONGO_URI)

// Exported Router

// Middlewares
app.use(cors())
app.use(express.urlencoded({extended: true}))
app.use(express.json())

app.get('/', ()=>{
    res.json("hello buddy!")
})

app.listen(PORT, ()=>{
    return console.log(`Server started at PORT : ${PORT}`);
})