const Joi = require("joi");

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.string().allow("", null),
        bedrooms: Joi.number().min(0).allow(null, ""),
        bathrooms: Joi.number().min(0).allow(null, ""),
        area: Joi.number().min(0).allow(null, ""),
        type: Joi.string().valid("buy", "rent").allow(null, ""),
        propertyCategory: Joi.string().allow(null, ""),
        amenities: Joi.alternatives().try(
            Joi.array().items(Joi.string()),
            Joi.string()
        ).allow(null, ""),
    }).required(),
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required(),
    }).required(),
});