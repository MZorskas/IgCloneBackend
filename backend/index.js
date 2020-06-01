const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const router = require('./routes/routes');

mongoose.connect('mongodb://localhost:27017/my_database5', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const app = express();

const corsOptions = {
  exposedHeaders: ['x-auth-IG'],
};

app.use('/uploads', express.static('uploads'));
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use('/v1', router);

app.listen(3000);
