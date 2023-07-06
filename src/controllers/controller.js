const {
  hashpassword,
  comparePassword,
  signAccessToken,
  sanitizeRequest,
  signRefreshToken,
  verifyRefreshToken,
  multerRouter
} = require('../helper/index');
const multer = require('multer');

const User = require('../model/index');
const Product = require('../model/product');


const {
  RegistrationSchema,
  LoginSchema,
  PaginationSchema,
} = require('../validation/schema');

exports.registerController = async (req, res) => {
  try {
    let [notValid, value] = await sanitizeRequest(req.body, RegistrationSchema);

    if (notValid) {
      return res
        .status(400)
        .header('Content-Type', 'application/json')
        .json({ status: false, message: notValid, data: null });
    }

    const { firstname, lastname, email, password } = value;
    const role = value?.role;

    const isRegistered = await User.findOne({ email });

    if (isRegistered) {
      return res.status(401).header('Content-Type', 'application/json').json({
        status: false,
        message: 'Unauthorized, login to continue',
        data: null,
      });
    }

    // hash password
    const hashedPassword = await hashpassword(password);
    if (!hashedPassword) {
      throw new Error('Error hashing password');
    }

    const userData = {
      firstname,
      lastname,
      email,
      password: hashedPassword,
    };

    if (role) {
      userData.role = role;
    }

    const newRecord = new User(userData);
    await newRecord.save();

    res
      .status(200)
      .header('Content-Type', 'application/json')
      .json({ success: true, message: 'Registration success', data: null });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .header('Content-Type', 'application/json')
      .json({ success: false, message: 'Internal server error', data: null });
  }
};

exports.loginController = async (req, res) => {
  try {
    let [notValid, value] = await sanitizeRequest(req.body, LoginSchema);

    if (notValid) {
      return res
        .status(400)
        .header('Content-Type', 'application/json')
        .json({ status: false, message: notValid, data: null });
    }
    const { email, password } = value;
    const userAccount = await User.findOne({ email });

    if (!userAccount) {
      return res.status(401).header('Content-Type', 'application/json').json({
        success: false,
        message: 'Unauthorized, register to continue',
        data: null,
      });
    }

    const compare = await comparePassword(password, userAccount.password);

    if (!compare) {
      return res.status(400).header('Content-Type', 'application/json').json({
        success: false,
        message: 'Invalid email or password',
        data: null,
      });
    }

    const accessToken = await signAccessToken(userAccount);
    if (!accessToken) {
      return res.status(500).header('Content-Type', 'application/json').json({
        success: false,
        message: 'Internal server error',
        data: null,
      });
    }

    const refreshToken = await signRefreshToken(userAccount);
    if (!refreshToken) {
      return res.status(500).header('Content-Type', 'application/json').json({
        success: false,
        message: 'Internal server error',
        data: null,
      });
    }

    await User.updateOne(
      {
        _id: userAccount._id,
      },
      {
        $set: {
          refreshToken,
        },
      },
    );

    return res.status(200).header('Content-Type', 'application/json').json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .header('Content-Type', 'application/json')
      .json({ success: false, message: 'Internal server error', data: null });
  }
};

exports.refreshTokenController = async (req, res) => {
  try {
    const headers =
      req.headers['Authorization'] || req.headers['authorization'];

    if (!headers) {
      return res.status(401).header('Content-Type', 'application/json').json({
        success: false,
        message: 'Unauthorized - Missing Authorization header',
        data: null,
      });
    }

    const [bearer, token] = headers.split(' ');

    if (bearer.toLowerCase() !== 'bearer' || !token) {
      return res.status(401).header('Content-Type', 'application/json').json({
        success: false,
        message: 'Unauthorized - Invalid or Missing Bearer Token',
        data: null,
      });
    }

    const doesUserExist = await User.findOne({ refreshToken: token });
    if (!doesUserExist) {
      return res.status(401).header('Content-Type', 'application/json').json({
        success: false,
        message: 'Unauthorized - Invalid Refresh Token',
        data: null,
      });
    }

    const decoded = await verifyRefreshToken(token);
    if (!decoded) {
      return res.status(403).header('Content-Type', 'application/json').json({
        success: false,
        message: 'Forbidden - Invalid or Expired Refresh token',
        data: null,
      });
    }

    // Generate a new access token
    const accessToken = await signAccessToken(doesUserExist);

    // Generate a new refresh token
    const newRefreshToken = await signRefreshToken(doesUserExist);

    // Update the user's refresh token in the database
    doesUserExist.refreshToken = newRefreshToken;
    await doesUserExist.save();

    // Send the response with roles and the new access token
    return res
      .status(200)
      .header('Content-Type', 'application/json')
      .json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: accessToken,
          refreshToken: newRefreshToken,
        },
      });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .header('Content-Type', 'application/json')
      .json({ success: false, message: 'Internal server error', data: null });
  }
};

exports.productUploadController = (req, res) => {
  multerRouter(req, res, async (err) => {
    try {
      const AdminId = req.user.id;

      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        console.log(err.message);
        return res.status(422).json({
          success: false,
          message: 'Unprocessable Entity - File Upload Error',
          data: null,
        });
      } else if (err) {
        // An unknown error occurred when uploading.
        console.log(err.message);
        return res.status(500).json({
          success: false,
          message: 'Internal Server Error - File Upload Error',
          data: null,
        });
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
        .header('Content-Type', 'application/json')
        .send({ success: true, message: 'file upload success', data: null });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .header('Content-Type', 'application/json')
        .json({ success: false, message: 'Internal server error', data: null });
    }
  });
};

exports.archiveDownloadController = async (req, res) => {
  try {
    const productId = req.params.id;

    const sourceFile = await Product.findOne({
      _id: productId,
    });

    if (!sourceFile) {
      return res
        .status(400)
        .header('Content-Type', 'application/json')
        .json({ status: false, message: 'No product was found', data: null });
    }

    let archiveName = sourceFile?.fileName;
    let archivePassword = uuidv4();

    const [error, archiveUrl] = await convertFile(archiveName, archivePassword);

    if (error) {
      return res
        .status(500)
        .header('Content-Type', 'application/json')
        .json({ status: false, message: 'Error generating file', data: null });
    }

    let response = {
      tempDownloadUrl: archiveUrl,
      message: 'File be deleted in 3 hours',
      password: archivePassword,
    };

    res.status(200).header('Content-Type', 'application/json').json({
      status: true,
      message: 'Archive is ready for download',
      data: response,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .header('Content-Type', 'application/json')
      .json({ status: false, message: 'Internal server error', data: null });
  }
};

exports.paginatedProductListController = async (req, res) => {
  try {
    const RequestQuery = req.query;
    const [notValid, value] = sanitizeRequest(RequestQuery, PaginationSchema);

    if (notValid) {
      return res
        .status(400)
        .header('Content-Type', 'application/json')
        .json({ status: false, message: notValid, data: null });
    }

    const { page, limit } = value;
    const skip = (page - 1) * limit;

    const productCount = (await Product.estimatedDocumentCount()) / limit;
    const products = await Product.find({}).skip(skip).limit(limit);

    if (!products) {
      return res
        .status(400)
        .header('Content-Type', 'application/json')
        .json({ status: true, message: 'No product found', data: null });
    }

    const response = {
      products,
      pageCount: productCount,
    };

    res.status(200).header('Content-Type', 'application/json').json({
      status: true,
      message: 'Paginated list of products',
      data: response,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .header('Content-Type', 'application/json')
      .json({ status: false, message: 'Internal server error', data: null });
  }
};
