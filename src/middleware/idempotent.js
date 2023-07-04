const NodeCache = require('node-cache');
const cache = new NodeCache();

// Idempotent File Upload Middleware
exports.idempotentFileUpload = async (req, res, next) => {
  try {
    const file = req.file;
    if (file) {
      const key = file.filename; // Use the filename as the cache key

      const cachedFilePath = cache.get(key);
      if (!cachedFilePath) {
        // Cache the file path for 5 minutes (adjust the ttl as needed)
        cache.set(key, file.destination + file.filename, 300);

        // File uploaded and saved to the database
        res.setHeader('x-idempotence-status', 'Uploaded');
        return res.status(200).send({
          success: true,
          message: 'File upload success',
          data: null,
        });
      }

      console.log(`Serving cached file for: ${key}`);
      res.setHeader('x-idempotence-status', 'Cached');
      return res.status(200).send({
        success: true,
        message: 'File upload success (cached)',
        data: null,
      });
    }

    // Call next() to proceed to the next middleware or route handler
    next();
  } catch (error) {
    next(error);
  }
};

// Idempotent file Middleware
exports.idempotentArchiveDownload = async (req, res, next) => {
  try {
    const idempotentKey = req.header['x-idempontent-key'];
    const productId = req.params?.productId;

    if (!idempotentKey) {
      return res
        .status(400)
        .json({ error: 'Missing x-idempotent-key header.' });
    }

    const cachedData = cache.get(idempotentKey);
    if (cachedData) {
      return res.status(304).send({
        success: true,
        message: 'File download success',
        data: null,
      });
    }

    cache.set(idempotentKey, idempotentKey, 300);
    res.setHeader('x-idempotence-status', 'Cached');
    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: 'Internal server error', data: null });
  }
};
