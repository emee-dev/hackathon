const Joi = require('joi');

exports.RegistrationSchema = Joi.object({
  firstname: Joi.string().min(3).max(30).required(),
  lastname: Joi.string().min(3).max(30).required(),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ['com', 'net'] },
    })
    .max(30)
    .required(),
  password: Joi.string()
    .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
    .max(30)
    .required(),
});

exports.LoginSchema = Joi.object({
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ['com', 'net'] },
    })
    .max(30)
    .required(),
});

exports.ObjectIdSchema = Joi.string()
  .regex(/^[0-9a-fA-F]{24}$/)
  .message('must be a valid Mongoose ObjectId');

exports.PaginationSchema = Joi.object({
  page: Joi.number().required(),
  limit: Joi.number().required(),
});
