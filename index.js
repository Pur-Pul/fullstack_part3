const express = require('express')
var morgan = require('morgan')
const cors = require('cors')
const app = express()
app.use(express.json())
app.use(express.static('dist'))
app.use(cors())
app.use(
    morgan(function (tokens, req, res) {
        let log = [
            tokens.method(req, res),
            tokens.url(req, res),
            tokens.status(req, res),
            tokens.res(req, res, 'content-length'), '-',
            tokens['response-time'](req, res), 'ms'
        ]
        if (log[0] == 'POST'){
            log.push(JSON.stringify(req.body))
        }
        return log.join(' ')
    })
)

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.post('/api/persons', (request, response) => {
    const body = request.body
    if (!body.name) {
        return response.status(400).json({ 
          error: 'name missing' 
        })
    }
    if (!body.number) {
        return response.status(400).json({ 
          error: 'number missing' 
        })
    }
    if (persons.find(person => person.name === body.name)) {
        return response.status(400).json({ 
            error: 'name already exists in phonebook' 
        })
    }
    const id = Math.floor(Math.random() * 1000)
    console.log(id)
    const person = {
        id: id.toString(),
        name: body.name,
        number: body.number
    }

    persons = persons.concat(person)
    response.json(person)
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(person => person.id === id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
    
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
})



app.get('/info', (request, response) => {
    const date = new Date()
    response.send(
        `<div>
            <p>Phonebook has info for ${persons.length} people</p>
            <p>${date.toDateString()} ${date.toTimeString()}</p>
        </div>`
    )
})


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
