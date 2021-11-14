const dotenv = require('dotenv')
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' })
const app = require('./app')

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
}).then(con => console.log('DB connection successfully'))



console.log(process.env.NODE_ENV);

const port = process.env.PORT || 8000
app.listen(port, () => {
  console.log('Server is running on 8000');
})