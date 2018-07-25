const express = require('express')
const bodyParser = require('body-parser')
const fs = require('fs')
const util = require('util')
const path = require('path')
const router = express.Router();
const app = express()

const port = process.env.PORT || 3000

const writeFile = util.promisify(fs.writeFile)
const readFile = util.promisify(fs.readFile)

// const scores = require('./scores.json')
const filePath = path.join(__dirname, './scores.json')


// Autorisation
app.use((request, response, next) => {
    response.header('Access-Control-Allow-Origin', request.headers.origin)
    response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    response.header('Access-Control-Allow-Credentials', 'true') // important
    next()
})

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//Erreur
app.use((err, req, res, next) => {
    if (err) {
        res.json({ message: err.message })
        console.error(err)
    }
    next(err)
})

app.listen(port, () => {
    console.log("Listening on port", port)
})

app.post('/post-scores', (req, res, next) => {
    readFile(filePath, 'utf8')
        .then(JSON.parse)
        .then(scores => {
            scores.push({
                name: req.body.name || "",
                score: req.body.score,
                speed: req.body.speed
            })
            scores.sort((a, b) => {
                return b.score - a.score
            }).splice(10, scores.length)
            const content = JSON.stringify(scores, null, 2)
            console.log(content);
            return writeFile(filePath, content, 'utf8')
        })
        .catch(next)
})

app.get('/scores', (req, res) => {
    readFile(filePath, 'utf8')
        .then(JSON.parse)
        .then(scores => res.send(scores))
})