const express = require('express') 
const router = express.Router();
const app = express() 

const scores = require('./scores.json')
console.log(scores)

app.listen(3000, () => {
    console.log("Listening on port 3000")
})

app.use('/scores', (req, res) => {
    res.send(scores)
})