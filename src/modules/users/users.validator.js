const joi = require("joi");

const addUserValidator = joi.object({
    name: joi.string().required().trim().min(3).max(40),
    email: joi.string().required().trim().min(5).email({minDomainSegments: 2,
    tlds: { allow: ['com', 'net', 'biz', 'org'] }}),
    phoneNumber: joi.string().required().trim().min(11).max(11),
    password: joi.string().required().trim().min(5).pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),

});

module.exports = { addUserValidator };