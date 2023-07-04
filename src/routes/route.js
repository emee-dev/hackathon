const router = require('express').Router();
const multer = require('multer');
const { multerRouter } = require('../middleware/multer');
const { convertFile } = require('../middleware/convertfile');
const { v4: uuidv4 } = require('uuid');
const User = require('../model/index');
const Product = require('../model/product');

const {
  hashpassword,
  signAccessToken,
  validateSchema,
} = require('../helper/index');

const {
  RegistrationSchema,
  LoginSchema,
  ObjectIdSchema,
  PaginationSchema,
} = require('../validation/schema');

// register a new entity
router.post('/register', async (req, res) => {
  try {
    let [error, value] = await validateSchema(req.body, RegistrationSchema);

    if (error) {
      // TODO make a better schema validation res message
      return console.log(error);
    }

    const { firstname, lastname, email, password } = value;

    const isRegistered = await User.findOne({ email });

    if (isRegistered) {
      return res.status(401).json({
        status: false,
        message: 'Unauthorized, login to continue',
        data: null,
      });
    }

    // hash password
    const hashedPassword = await hashpassword(password);

    const newRecord = new User({
      firstname,
      lastname,
      email,
      password: hashedPassword,
    });

    await newRecord.save();

    res
      .status(200)
      .json({ status: true, message: 'registration success', data: null });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ status: false, message: 'Internal server error', data: null });
  }
});

// issue a secure httponly cookie in a jwt only access token
router.post('/login', async (req, res) => {
  try {
    let [error, value] = await validateSchema(req.body, LoginSchema);

    if (error) {
      // TODO make a better schema validation res message
      return console.log(error);
    }
    const { email } = value;
    const doesUserExist = await User.findOne({ email });

    if (!doesUserExist) {
      return res
        .status(401)
        .json({ status: false, message: 'Unauthorized, register to continue' });
    }

    // res.setHeader("Authorization", `Bearer ${access_token}`)

    res.status(200).json({
      access_token: 'Access',
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ status: false, message: 'Internal server error', data: null });
  }
});

// issue a refresh token here require access token and login info to issue a refresh token
router.post('/refresh');

// allow only admin to upload only zip files
router.post('/upload', (req, res) => {
  multerRouter(req, res, async (err) => {
    try {
      const AdminId = req.userId;

      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        console.log(err.message);
        return res
          .status(400)
          .send({ status: false, message: 'File Multer Error', data: null });
      } else if (err) {
        // An unknown error occurred when uploading.
        console.log(err.message);
        return res
          .status(400)
          .send({ status: false, message: 'File upload Error', data: null });
      }

      const { destination, filename } = req.file;

      // save to database
      const newFile = new Product({
        userId: AdminId,
        fileName: filename,
        destination,
      });

      await newFile.save();

      res
        .status(200)
        .send({ status: true, message: 'file upload success', data: null });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ status: false, message: 'Internal server error', data: null });
    }
  });
});

// download a file
router.post('/products/:id', async (req, res) => {
  try {
    const productId = req.params.productId;
    const [notValid, value] = await validateSchema(productId, ObjectIdSchema);

    if (notValid) {
      return res
        .status(400)
        .json({ status: false, message: 'Invalid object id', data: null });
    }

    const sourceFile = await Product.findOne({
      _id: value,
    });

    if (!sourceFile) {
      return res
        .status(400)
        .json({ status: false, message: 'No product was found', data: null });
    }

    let archiveName = sourceFile?.fileName;
    let archivePassword = uuidv4();

    const [error, fileUrl] = await convertFile(archiveName, archivePassword);

    if (error) {
      return res
        .status(500)
        .json({ status: false, message: 'Error downloading file', data: null });
    }

    let response = {
      tempUrl: fileUrl,
      message: 'File be deleted in 3 hours',
      password: archivePassword,
    };

    res
      .status(200)
      .json({ status: true, message: 'Download url ready', data: response });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ status: false, message: 'Internal server error', data: null });
  }
});

// list all uploaded files available for download
router.post('/products', async (req, res) => {
  try {
    const RequestQuery = req.query;
    const [notValid, value] = validateSchema(RequestQuery, PaginationSchema);

    if (notValid) {
      return res
        .status(400)
        .json({ status: false, message: 'Invalid object id', data: null });
    }

    const { page, limit } = value;
    const skip = (page - 1) * limit;

    const productCount = (await Product.estimatedDocumentCount()) / limit;
    const products = await Product.find({}).skip(skip).limit(limit);

    if (!products) {
      return res
        .status(400)
        .json({ status: true, message: 'No product found', data: null });
    }

    res
      .status(200)
      .json({ status: true, message: 'All products returned', data: products });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ status: false, message: 'Internal server error', data: null });
  }
});

// paystack callback endpoint to recieve success or failed payment
router.post('/paystack');

// endpoint to validate source code license key jwt validity or expire and domain info
router.post('/validate');

// JWT Hash as License Key
// {
//     userId: "12992020222",
//     domain: "http://localhost:3000",
// }

module.exports = router;
