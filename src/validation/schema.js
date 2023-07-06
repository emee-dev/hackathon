const Joi = require('joi');

exports.RegistrationSchema = Joi.object({
  firstname: Joi.string().min(3).max(30).required().messages({
    'string.base': 'Firstname must be a string.',
    'string.min': 'Firstname must be at least 3 characters long.',
    'string.max': 'Firstname cannot exceed 30 characters.',
    'any.required': 'Firstname is required.',
  }),
  lastname: Joi.string().min(3).max(30).required().messages({
    'string.base': 'Lastname must be a string.',
    'string.min': 'Lastname must be at least 3 characters long.',
    'string.max': 'Lastname cannot exceed 30 characters.',
    'any.required': 'Lastname is required.',
  }),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ['com', 'net'] },
    })
    .max(30)
    .required()
    .messages({
      'string.base': 'Email must be a string.',
      'string.email': 'Invalid email format.',
      'any.required': 'Email is required.',
    }),
  password: Joi.string()
    .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
    .max(30)
    .required()
    .messages({
      'string.base': 'Password must be a string.',
      'string.pattern.base':
        'Password should contain only alphanumeric characters (letters and digits).',
      'string.max': 'Password cannot exceed 30 characters.',
      'any.required': 'Password is required.',
    }),
  role: Joi.string().optional().allow(null).messages({
    'string.base': 'Role must be a string.',
  }),
});

exports.LoginSchema = Joi.object({
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ['com', 'net'] },
    })
    .max(30)
    .required()
    .messages({
      'string.base': 'Email must be a string.',
      'string.email': 'Invalid email format.',
      'any.required': 'Email is required.',
    }),
  password: Joi.string()
    .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
    .max(30)
    .required()
    .messages({
      'string.base': 'Password must be a string.',
      'string.pattern.base':
        'Password should contain only alphanumeric characters (letters and digits).',
      'string.max': 'Password cannot exceed 30 characters.',
      'any.required': 'Password is required.',
    }),
});

exports.ObjectIdSchema = Joi.string()
  .regex(/^[0-9a-fA-F]{24}$/)
  .message('Invalid ID format. It must be a valid Mongoose ObjectId.');

exports.PaginationSchema = Joi.object({
  page: Joi.number().required().messages({
    'number.base': 'Page number must be a valid number.',
    'any.required': 'Page number is required.',
  }),
  limit: Joi.number().required().messages({
    'number.base': 'Limit must be a valid number.',
    'any.required': 'Limit is required.',
  }),
});

exports.PaystackReferenceSchema = Joi.object({
  payment_reference: Joi.number().required().messages({
    'number.base': 'payment_reference number must be a valid number.',
    'any.required': 'payment_reference is required.',
  }),
});
