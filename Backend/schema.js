const Joi = require("joi");

const optionalNumber = Joi.number().min(0).allow(null);

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().trim().max(120).required(),
        description: Joi.string().trim().max(5000).required(),
        location: Joi.string().trim().max(200).required(),
        country: Joi.string().trim().max(80).allow("", null),
        price: Joi.number().min(0).required(),
        bedrooms: optionalNumber,
        bathrooms: optionalNumber,
        area: optionalNumber,
        type: Joi.string().valid("buy", "rent").allow(null),
        propertyCategory: Joi.string().max(60).allow("", null),
        amenities: Joi.array().items(Joi.string().max(60)).max(40),
        deposit: optionalNumber,
        furnishing: Joi.string().valid("unfurnished", "semi-furnished", "fully-furnished").allow(null),
        availableFrom: Joi.date().allow(null),
        preferredTenants: Joi.string().valid("any", "family", "bachelors", "students", "company").allow(null),
        petsAllowed: Joi.boolean().allow(null),
        keepImages: Joi.array().items(Joi.string().uri()).max(8),
    }).required(),
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().integer().required().min(1).max(5),
        comment: Joi.string().trim().min(3).max(1000).required(),
    }).required(),
});

module.exports.signupSchema = Joi.object({
    firstName: Joi.string().trim().min(1).max(50).required(),
    lastName: Joi.string().trim().min(1).max(50).required(),
    email: Joi.string().trim().email().max(200).required(),
    password: Joi.string().min(8).max(128).required().messages({
        "string.min": "Password must be at least 8 characters long",
    }),
});

module.exports.enquirySchema = Joi.object({
    name: Joi.string().trim().min(1).max(100).required(),
    email: Joi.string().trim().email().max(200).required(),
    phone: Joi.string().trim().pattern(/^[+\d\s()-]{6,20}$/).allow("", null).messages({
        "string.pattern.base": "Please enter a valid phone number",
    }),
    message: Joi.string().trim().min(5).max(2000).required(),
    visitDate: Joi.date().min("now").allow("", null).messages({
        "date.min": "Visit date must be in the future",
    }),
});

module.exports.contactSchema = Joi.object({
    firstName: Joi.string().trim().min(1).max(100).required(),
    lastName: Joi.string().trim().max(100).allow("", null),
    email: Joi.string().trim().email().max(200).required(),
    phone: Joi.string().trim().pattern(/^[+\d\s()-]{6,20}$/).allow("", null).messages({
        "string.pattern.base": "Please enter a valid phone number",
    }),
    message: Joi.string().trim().min(5).max(2000).required(),
});
