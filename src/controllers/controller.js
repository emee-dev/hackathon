const {
  hashpassword,
  signAccessToken,
  sanitizeRequest,
  signRefreshToken,
  verifyRefreshToken,
} = require('../helper/index');
const { multerRouter } = require('../middleware/middleware');

const User = require('../model/index');
const Product = require('../model/product');

const {
  RegistrationSchema,
  LoginSchema,
  ObjectIdSchema,
  PaginationSchema,
} = require('../validation/schema');

exports.registerController = async (req, res) => {
  try {
    let [notValid, value] = await sanitizeRequest(req.body, RegistrationSchema);

    if (notValid) {
      return res
        .status(400)
        .json({ status: false, message: notValid, data: null });
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
    if (!hashedPassword) {
      throw new Error('Error hashing password');
    }

    const newRecord = new User({
      firstname,
      lastname,
      email,
      password: hashedPassword,
    });

    await newRecord.save();

    res
      .status(200)
      .json({ success: true, message: 'Registration success', data: null });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: 'Internal server error', data: null });
  }
};

exports.loginController = async (req, res) => {
  try {
    let [notValid, value] = await sanitizeRequest(req.body, LoginSchema);

    if (notValid) {
      return res
        .status(400)
        .json({ status: false, message: notValid, data: null });
    }
    const { email, password } = value;
    const userAccount = await User.findOne({ email });

    if (!userAccount) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized, register to continue',
        data: null,
      });
    }

    const comparePassword = await comparePassword(
      password,
      userAccount.password,
    );

    const accessToken = await signAccessToken(userAccount);
    if (!accessToken) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        data: null,
      });
    }

    const refreshToken = await signRefreshToken(userAccount);
    if (!refreshToken) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        data: null,
      });
    }

    res.setHeader('Authorization', `Bearer ${accessToken}`);
    res.status(200).json({
      success: true,
      message: 'Login auth success',
      accessToken,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: 'Internal server error', data: null });
  }
};

exports.refreshTokenController = async (req, res) => {
  const header = req.headers['Authorization'] || req.headers['authorization'];

  if (!header) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized - Missing Authorization header',
      data: null,
    });
  }

  const refreshToken = signRefreshToken();
};

exports.productUploadController = (req, res) => {
  multerRouter(req, res, async (err) => {
    try {
      const AdminId = req.user.id;

      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        console.log(err.message);
        return res
          .status(400)
          .send({ success: false, message: 'File Multer Error', data: null });
      } else if (err) {
        // An unknown error occurred when uploading.
        console.log(err.message);
        return res
          .status(400)
          .send({ success: false, message: 'File upload Error', data: null });
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
        .send({ success: true, message: 'file upload success', data: null });
    } catch (error) {
      console.log(error);
      res
        .status(500)
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
        .json({ status: false, message: 'No product was found', data: null });
    }

    let archiveName = sourceFile?.fileName;
    let archivePassword = uuidv4();

    const [error, archiveUrl] = await convertFile(archiveName, archivePassword);

    if (error) {
      return res
        .status(500)
        .json({ status: false, message: 'Error generating file', data: null });
    }

    let response = {
      tempDownloadUrl: archiveUrl,
      message: 'File be deleted in 3 hours',
      password: archivePassword,
    };

    res.status(200).json({
      status: true,
      message: 'Archive if ready for download',
      data: response,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
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
        .json({ status: false, message: notValid, data: null });
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

    const response = {
      products,
      pageCount: productCount,
    };

    res.status(200).json({
      status: true,
      message: 'Paginated list of products',
      data: response,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ status: false, message: 'Internal server error', data: null });
  }
};
