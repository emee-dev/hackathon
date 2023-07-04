const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

let prodStorage = multer.memoryStorage();

const localStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', '..', 'public'));
  },
  filename: function (req, file, cb) {
    const uniqueId = `${uuidv4()}.zip`;
    cb(null, uniqueId);
  },
});

const upload = multer({
  storage: process.env.NODE_ENV === 'development' ? localStorage : prodStorage,
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['zip'];
    const fileExtension = file.originalname.split('.')[1].toLowerCase();
    const fileMimeType = file.mimetype.split('/')[1];

    if (!allowedExtensions.includes(fileExtension) || fileMimeType !== 'zip') {
      return cb(new Error('Only ZIP files are allowed'), false);
    }

    cb(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB file size limit
  },
});

exports.multerRouter = upload.single('zip');
