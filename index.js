require('dotenv').config();
const express = require('express')
const app = express()
app.use(express.static('dist'))
app.use(express.json())
var morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')


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

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    } 
  
    next(error)
}
  
app.use(errorHandler)

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
    Person.find({}).then(persons => {
        response.json(persons)
    })
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

    const person = new Person({
        name: body.name,
        number: body.number
    })
    person.save().then(result => {
        console.log(`Added ${result.name} number ${result.number} to phonebook`)
        persons = persons.concat(result)
        response.json(result)
    })
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

app.delete('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    Person.findByIdAndDelete(id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
    response.status(204).end()
})

app.put('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    const body = request.body
    const person = {
        name: body.name,
        number: body.number
    }
    Person.findByIdAndUpdate(id, person, { new: true })
        .then(result => {
            response.json(result)
        })
        .catch(error => next(error))
    
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


const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
