const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const app = express();
const storeListRouter = require('./router/storeListRouter');

app.use(express.json());

app.use('/', storeListRouter);

module.exports = app;