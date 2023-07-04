const mongoose = require("mongoose")

const connectionUrl = process.env.NODE_ENV === "development" ? process.env.MONGODB_COMPASS_URL : process.env.MONGODB_ATLAS_URL

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