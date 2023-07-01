require('dotenv').config();

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const PORT = process.env.PORT || 7000;

const multer = require('multer');

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    let extension = `.${file.originalname.split('.')[1]}`;

    let local = file.fieldname + '-' + uniqueSuffix + extension;
    let production = 'index.txt';

    let fileName = process.env.NODE_ENV === 'development' ? local : production;
    cb(null, fileName);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/zip') {
      return cb(new Error('File Format not supported'), false);
    }

    cb(null, true);
  },
});

const multerRouter = upload.single('zip');

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

app.post('/upload', (req, res) => {
  multerRouter(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      res.send({ message: 'Multer Error', err: err.message });
    } else if (err) {
      // An unknown error occurred when uploading.
      res.send({ message: 'Multer upload Error', err: err.message });
    }

    console.log(req.file);
    res.send({ message: 'Success' });
  });
});

app.get('/file', async (req, res) => {
  res.sendFile(path.join(__dirname, 'uploads', 'index.txt'));
});

// app.get("/test", apiLimiter, (req, res) => {
//     console.log("Req: is working")
//     res.send("Hi")
// })
