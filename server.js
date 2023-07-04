require('dotenv').config();
const PORT = process.env.PORT || 7000;
const app = require('./src/app');

const DB = require('./src/config/db')((error) => {
  if (error) {
    return console.log('Database error: ', error);
  }
  console.log('....Connected to DB....');
  app.listen(PORT, () => console.log(`....Server started....`));
});
