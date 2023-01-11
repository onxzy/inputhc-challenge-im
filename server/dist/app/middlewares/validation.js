"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingValidation = exports.surgeryValidation = exports.nightValidation = exports.diseaseValidation = exports.authValidation = exports.validation = void 0;
// MODULES
const express_validator_1 = require("express-validator");
const errorMsg_1 = __importDefault(require("../config/errorMsg"));
const client_1 = require("@prisma/client");
const validation = (req, res, next) => {
    const validationR = (0, express_validator_1.validationResult)(req);
    if (!validationR.isEmpty()) {
        return res.status(400).json({ err: errorMsg_1.default.validation, details: validationR.array() });
    }
    next();
};
exports.validation = validation;
const diseaseValidation = {
    id(location) {
        return location.isUUID();
    },
    name(location) {
        return location.isString().isLength({ min: 7, max: 7 });
    }
};
exports.diseaseValidation = diseaseValidation;
const nightValidation = {
    id(location) {
        return location.isInt().toInt();
    },
    date(location) {
        return location.isISO8601();
    },
    capacity(location) {
        return location.isInt({ min: 0, max: 1000 }).toInt();
    }
};
exports.nightValidation = nightValidation;
const surgeryValidation = {
    id(location) {
        return location.isInt().toInt();
    },
    date(location) {
        return location.isISO8601();
    },
    capacity(location) {
        return location.isInt({ min: 0, max: 1000 }).toInt();
    }
};
exports.surgeryValidation = surgeryValidation;
const bookingValidation = {
    id(location) {
        return location.isUUID();
    },
    name(location) {
        return location.isString().isLength({ min: 2, max: 64 });
    },
    email(location) {
        return location.isEmail().normalizeEmail();
    },
    date(location) {
        return location.isISO8601();
    },
    nights(location) {
        return location.isInt().toInt();
    },
};
exports.bookingValidation = bookingValidation;
const authValidation = {
    email(location) {
        return location.isEmail().normalizeEmail();
    },
    firstname(location) {
        return location
            .isAlpha('fr-FR', { ignore: ' \'' }).withMessage(errorMsg_1.default.validation_details.not_alpha)
            .rtrim(' ')
            .isLength({ min: 2, max: 100 }).withMessage(errorMsg_1.default.validation_details.bad_length);
    },
    lastname(location) {
        return location.isAlpha('fr-FR', { ignore: ' \'' }).withMessage(errorMsg_1.default.validation_details.not_alpha)
            .rtrim(' ')
            .isLength({ min: 2, max: 100 }).withMessage(errorMsg_1.default.validation_details.bad_length);
    },
    password(location) {
        return location
            .isString().withMessage(errorMsg_1.default.validation_details.not_string)
            .isLength({ min: 8, max: 256 }).withMessage(errorMsg_1.default.validation_details.bad_length);
    },
    provider(location) {
        return location.
            isIn(Object.values(client_1.Provider));
    },
    role(location) {
        return location.
            isIn(Object.values(client_1.Role));
    },
};
exports.authValidation = authValidation;
