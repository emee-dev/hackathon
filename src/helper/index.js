const bcrypt = require("bcrypt")
const User = require("../model/index")
const rateLimit = require('express-rate-limit')


const is_required = (req, res, next) => {
    const cookie = req.cookies?.['jwt']
    try {
        if (!cookie) {
            // return res.status(400).send({ message: "permission denied login to continue" })
            return res.redirect("/login")
        }
        req.userId = cookie
        next()
    } catch (error) {
        throw new Error(error)
    }
}

exports.hashpassword = async (payload) => {
    try {
        const salt = await bcrypt.genSalt(10)
        const compare = await bcrypt.hash(payload, salt)
        return compare
    } catch (error) {
        throw new Error(error)
    }
}


exports.comparePassword = async (payload, encrypted) => {
    try {
        const compare = await bcrypt.compare(payload, encrypted)
        return compare
    } catch (error) {
        throw new Error(error)
    }
}


// exports.sensitiveRateLimiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 50, // Limit each IP to 50 requests per `window` (here, per 15 minutes)
//     message: 'Too requests from this IP, please try again after 15 minutes',
//     standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
//     legacyHeaders: false, // Disable the `X-RateLimit-*` headers
// })

// exports.generalRateLimiter = rateLimit({
//     windowMs: 60 * 60 * 1000, // 1 hr
//     max: 100, // Limit each IP to 100 requests per `window` (here, per 1 hour)
//     message: 'Too many requests from this IP, please try again after an hour',
//     standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
//     legacyHeaders: false, // Disable the `X-RateLimit-*` headers
// })
