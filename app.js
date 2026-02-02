const express = require('express')
const dbConnect = require("./db/dbConnect");
const app = express()
const authRoute = require('./routes/Auth');
const parentRoute= require('./routes/ParentRoute');
const userRoute= require('./routes/userRoute');
const morgan = require('morgan')
const port = 3000

dbConnect(); 


app.use(express.json());
app.use(morgan('dev'))

app.use('/api/auth', authRoute);
app.use('/api/user', userRoute);
app.use('/api/parent', parentRoute);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})