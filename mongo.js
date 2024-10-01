const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]
let name = undefined
let number = undefined

if (process.argv.length == 5) {
    name = process.argv[3]
    number = process.argv[4]
}



const url = `mongodb+srv://axbergsamuel:${password}@phonebook.fmxfz.mongodb.net/phonebookApp?retryWrites=true&w=majority&appName=phonebook`

mongoose.set('strictQuery',false)

mongoose.connect(url)

const phonebookSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', phonebookSchema)

if (name != null && number != null) {
    const person = new Person({
        name: name,
        number: number
    })
    person.save().then(result => {
        console.log(`Added ${name} number ${number} to phonebook`)
        mongoose.connection.close()
    })
} else {
    Person.find({}).then(result => {
        console.log('phonebook:')
        result.forEach(person => {
          console.log(`${person.name} ${person.number}`)
        })
        mongoose.connection.close()
    })
}
