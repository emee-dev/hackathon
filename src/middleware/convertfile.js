const convertapi = require('convertapi')(process.env.CONVERT_API_SECRET);
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

exports.convertFile = async (fileName, password) => {
  try {
    const publicFolder = path.join(__dirname, '..', '..', 'public');
    const uniqueFileId = uuidv4();

    //   const result = await Promise.resolve(convertapi.convert('zip', {
    //     Files: [`${publicFolder}/${fileName}`],
    //     FileName: uniqueFileId,
    //     Password: 'SNCNKNS',
    //   }, 'any'));

    await Promise.resolve(result.saveFiles(`${publicFolder}/temp`));

    //   const downloadUrl = result.file.url;
    const downloadUrl = `Folder ${publicFolder} - ${uniqueFileId}`;
    return [null, downloadUrl];
  } catch (error) {
    console.error(error.toString());
    return [error];
  }
};

// exports.createLicense = async (payload) => {
//   return new Promise((resolve, reject) => {
//     const { email, domain, archiveName } = payload;
//     const secret = process.env.ACCESS_TOKEN_SECRET;
    
//     const options = {
//       expiresIn: '1096 days', // approx 3 years
//       issuer: 'localhost',
//     };

//     jwt.sign(payload, secret, options, (err, token) => {
//       if (err) {
//         console.log(err.message);
//         reject();
//       }

//       return resolve(token);
//     });
//   });
// };
