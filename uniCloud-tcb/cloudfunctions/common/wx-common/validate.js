const Joi = require('joi')
const validations = require('./validations')

exports.validations = validations

exports.validate = function (schema, params) {
  const {value, error} = Joi.compile(schema).validate(params)

  if (error) throw error

  return value
}
