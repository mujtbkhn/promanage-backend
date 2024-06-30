require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const authRoute = require('./routes/auth')
const todoRoute = require('./routes/todo')
// const pollRoute = require('./routes/poll')
// const analyticsRoute = require('./routes/analytics')

const PORT = process.env.PORT || 3000;

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/v1/auth', authRoute)
app.use('/api/v1/todo', todoRoute)
// app.use('/api/v1/poll', pollRoute)
// app.use('/api/v1/analytics', analyticsRoute)

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong!' });
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Database connected!"))
    .catch((error) => console.log("error connecting database: ", error))



app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
})