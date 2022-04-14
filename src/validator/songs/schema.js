const Joi = require('joi');

const currentYear = new Date().getFullYear();

const SongPayloadSchema = Joi.object({
    title: Joi.string().required(),
    genre: Joi.string().required(),
    performer: Joi.string().required(),
    albumId: Joi.string(),
    year: Joi.number().integer().min(1900).max(currentYear).required(),
    duration: Joi.number(),    
});

module.exports = SongPayloadSchema;