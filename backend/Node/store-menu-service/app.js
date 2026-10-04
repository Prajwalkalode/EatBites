const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const menuRouter = require('./router/menuRouter');

const app = express();

app.use(express.json());
app.use('/menu', menuRouter);

module.exports = app;