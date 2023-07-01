const mongoose = require("mongoose")

let mongodbAtlas = `mongodb+srv://${process.env.ACCOUNT_USERNAME}:${process.env.DB_PASSWORD}@cluster0.gwvtatj.mongodb.net/${process.env.DB_NAME}`;
let localConnection = `mongodb://0.0.0.0:27017/${process.env.DB_NAME}`;

const connectionUrl = process.env.NODE_ENV === "development" ? localConnection : mongodbAtlas

const connectDb = async (cb) => {
    try {
        mongoose.set('strictQuery', true);
        mongoose.connect(connectionUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        return cb()
    } catch (error) {
        return cb(error)
    }

}

module.exports = connectDb