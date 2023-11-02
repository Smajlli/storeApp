const Joi = require('joi');

module.exports.validateProduct = Joi.object({
    product: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().min(1).required(),
        category: Joi.string().required(),
        description: Joi.string().required(),
        image: Joi.array().required()
    }).required()
});