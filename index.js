require('dotenv').config();

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const PORT = process.env.PORT || 7000;

const multer = require('multer');
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    console.log('Val', file);
  },
});

// Routes
// const api_route = require("./src/routes/route")

const DB = require('./src/config/db')((error) => {
  if (error) return console.log(error);
  console.log('....Connected to DB....');
  app.listen(PORT, () => console.log(`....Server started....`));
});

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser());

app.get('/', (req, res) => {
  res.send({ message: 'This is working' });
});

app.post('/upload', upload.single('zip'), async (req, res) => {
  console.log(req.file);
  res.send({ message: 'Success' });
});

// app.get("/test", apiLimiter, (req, res) => {
//     console.log("Req: is working")
//     res.send("Hi")
// })
