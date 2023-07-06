const path = require('path');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const convertapi = require('convertapi')(process.env.CONVERT_API_SECRET);
const multer = require('multer');

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

exports.hashpassword = async (string) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const compare = await bcrypt.hash(string, salt);
    return compare;
  } catch (error) {
    throw new Error(error);
  }
};

exports.comparePassword = async (string, encrypted) => {
  try {
    const compare = await bcrypt.compare(string, encrypted);
    return compare;
  } catch (error) {
    throw new Error(error);
  }
};

exports.signAccessToken = (payload) => {
  return new Promise((resolve, reject) => {
    const { _id, email, role } = payload;
    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret)
      throw new Error('Access Token Secret Env Variable is required');

    const options = {
      expiresIn: '15m',
      issuer: 'localhost',
      audience: 'users',
    };

    jwt.sign({ id: _id, email, role }, secret, options, (err, token) => {
      if (err) {
        console.log(err.message);
        resolve(false);
      }

      return resolve(token);
    });
  });
};

exports.verifyAccessToken = (token) => {
  return new Promise((resolve, reject) => {
    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret)
      throw new Error('Access Token Secret Env Variable is required');

    jwt.verify(token, secret, (err, token) => {
      if (err) {
        console.log(err.message);
        resolve(false);
      }
      //   if (err instanceof jwt.JsonWebTokenError) {
      //     resolve(false);
      //   }
      //   if (err instanceof jwt.NotBeforeError) {
      //     resolve(false);
      //   }
      //   if (err instanceof jwt.TokenExpiredError) {
      //     resolve(false);
      //   }

      return resolve(token);
    });
  });
};

exports.signRefreshToken = (payload) => {
  return new Promise((resolve, reject) => {
    const { _id, email, role } = payload;
    const secret = process.env.REFRESH_TOKEN_SECRET;
    if (!secret)
      throw new Error('Refresh Token Secret Env Variable is required');

    const options = {
      expiresIn: '30m',
      issuer: 'localhost',
      audience: 'users',
    };

    jwt.sign({ id: _id, email, role }, secret, options, (err, token) => {
      if (err) {
        console.log(err.message);
        resolve(false);
      }

      return resolve(token);
    });
  });
};

exports.verifyRefreshToken = (token) => {
  return new Promise((resolve, reject) => {
    const secret = process.env.REFRESH_TOKEN_SECRET;
    if (!secret)
      throw new Error('Refresh Token Secret Env Variable is required');

    jwt.verify(token, secret, (err, token) => {
      if (err) {
        console.log(err.message);
        resolve(false);
      }
      //   if (err instanceof jwt.JsonWebTokenError) {
      //     resolve(false);
      //   }
      //   if (err instanceof jwt.NotBeforeError) {
      //     resolve(false);
      //   }
      //   if (err instanceof jwt.TokenExpiredError) {
      //     resolve(false);
      //   }

      return resolve(token);
    });
  });
};

exports.sanitizeRequest = async (payload, schema) => {
  try {
    let options = {
      abortEarly: false,
    };

    const check = await schema.validateAsync(payload, options);

    return [null, check];
  } catch (error) {
    return [error.details.map((error) => error.message)];
  }
};

exports.convertFile = async (fileName, archivePassword) => {
  try {
    const publicFolder = path.join(__dirname, '..', '..', 'public');
    const uniqueFileId = uuidv4();

    const result = await Promise.resolve(
      convertapi.convert(
        'zip',
        {
          Files: [`${publicFolder}/${fileName}`],
          FileName: uniqueFileId,
          Password: archivePassword,
        },
        'any',
      ),
    );

    process.env.NODE_ENV === 'development'
      ? await Promise.resolve(result.saveFiles(`${publicFolder}/temp`))
      : null;

    const archiveDownloadUrl = result.file.url;
    return [null, archiveDownloadUrl];
  } catch (error) {
    console.error(error.toString());
    return [error];
  }
};
