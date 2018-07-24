const express = require('express')
const bodyParser = require('body-parser')
const fs = require('fs')
const util = require('util')
const path = require('path')
const router = express.Router();
const app = express()

const writeFile = util.promisify(fs.writeFile)
const readFile = util.promisify(fs.readFile)

const scores = require('./scores.json')
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

app.listen(3000, () => {
    console.log("Listening on port 3000")
})

app.use('/scores', (req, res) => {
    scores.sort((a, b) => {
        return b.score - a.score
    })
    res.send(scores)
})

app.post('/post-scores', (req, res, next) => {
    readFile(filePath, 'utf8')
    .then(JSON.parse)
    .then(scores => {
        scores.push({
            name: req.body.name,
            score: req.body.score,
            speed: req.body.speed
        })

    const content = JSON.stringify(scores, null, 2)
    console.log(content)
    return writeFile(filePath, content, 'utf8')
    })
    .then(() => res.end('OK'))
    .catch(next)
})