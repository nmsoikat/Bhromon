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
const server = app.listen(port, () => {
  console.log('Server is running on 8000');
})

// all promise rejection handle
process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION. shouting down...');
  // 0 for success
  // 1 for uncaught exception
  //process.exit(1);// immediately exit.

  // first close the server or close all running request then exit.
  server.close(() => {
    process.exit(1);
  })
})