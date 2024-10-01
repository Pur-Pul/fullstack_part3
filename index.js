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

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body
    const person = new Person({
        name: body.name,
        number: body.number
    })
    person.save()
        .then(result => {
            console.log(`Added ${result.name} number ${result.number} to phonebook`)
            response.json(result)
        })
        .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    Person.findById(id)
        .then(person => {
            if (person) {
                response.json(person)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))   
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
    Person.findByIdAndUpdate(id, person, { new: true, runValidators: true, context: 'query' })
        .then(result => {
            response.json(result)
        })
        .catch(error => next(error))
    
})

app.get('/info', (request, response, next) => {
    const date = new Date()
    Person.countDocuments({}, { hint: "_id_"})
        .then(result => {
            response.send(
                `<div>
                    <p>Phonebook has info for ${result} people</p>
                    <p>${date.toDateString()} ${date.toTimeString()}</p>
                </div>`
            )
        })
        .catch(error => next(error))
    
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    } else if (error.name === 'DuplicateKeyError') {
        return response.status(400).json({ error: error.message })
    }
  
    next(error)
}
  
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
