const dotenv = require('dotenv')
const express = require('express');
const mongoose = require('mongoose');
const Tour = require('../models/tourModel');
const fs = require('fs')

dotenv.config({ path: './config.env' })

const app = express();

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
}).then(con => console.log('DB connection successfully'))

// READ JSON FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tour-sample.json`, 'utf-8'));

// IMPORT DATA INTO DB
const importData = async() => {
  try{
    await Tour.create(tours);
    console.log('Data Loaded Successfully');
  } catch(err) {
    console.log(err);
  }
  process.exit();
}

// DELETE ALL DATA 
const deleteData = async() => {
  try{
    await Tour.deleteMany({})
    console.log('Data deleted successfully');
  }catch(err) {
    console.log(err.message);
  }
  process.exit();
}


// console.log(process.argv);
if(process.argv[2] === '--import'){
  importData()
} else if(process.argv[2] === '--delete') {
  deleteData();
}

const port = 9000
app.listen(port, () => {
  console.log('Server is running on 9000');
})