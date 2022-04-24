const Joi = require('joi');

const currentYear = new Date().getFullYear();

const SongPayloadSchema = Joi.object({
    title: Joi.string().max(100).required(),
    genre: Joi.string().max(50).required(),
    performer: Joi.string().max(100).required(),
    albumId: Joi.string(),
    year: Joi.number().integer().min(1900).max(currentYear).required(),
    duration: Joi.number(),    
});

module.exports = SongPayloadSchema;