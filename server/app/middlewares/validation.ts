import { RequestHandler } from "express";

// MODULES
import { validationResult, ValidationChain } from 'express-validator';
import errorMsg from '../config/errorMsg';
import { Provider, Role } from '@prisma/client';

const validation: RequestHandler = (req, res, next) => {
  const validationR = validationResult(req);
  if (!validationR.isEmpty()) {
    return res.status(400).json({err: errorMsg.validation, details: validationR.array()});
  }
  next();
};

const diseaseValidation = {
  id(location: ValidationChain) {
    return location.isUUID();
  },
  name(location: ValidationChain) {
    return location.isString().isLength({min: 7, max: 7});
  }
}

const nightValidation = {
  id(location: ValidationChain) {
    return location.isInt().toInt();
  },
  date(location: ValidationChain) {
    return location.isISO8601();
  },
  capacity(location: ValidationChain) {
    return location.isInt({min: 0, max: 1000}).toInt();
  }
}

const authValidation = {
  email(location: ValidationChain) {
    return location.isEmail().normalizeEmail();
  },
  firstname(location: ValidationChain) {
    return location
      .isAlpha('fr-FR', {ignore: ' \''}).withMessage(errorMsg.validation_details.not_alpha)
      .rtrim(' ')
      .isLength({min: 2, max: 100}).withMessage(errorMsg.validation_details.bad_length);
  },
  lastname(location: ValidationChain) {
    return location.isAlpha('fr-FR', {ignore: ' \''}).withMessage(errorMsg.validation_details.not_alpha)
      .rtrim(' ')
      .isLength({min: 2, max: 100}).withMessage(errorMsg.validation_details.bad_length);
  },
  password(location: ValidationChain) {
    return location
      .isString().withMessage(errorMsg.validation_details.not_string)
      .isLength({min: 8, max: 256}).withMessage(errorMsg.validation_details.bad_length);
  },
  provider(location: ValidationChain) {
    return location.
      isIn(Object.values(Provider));
  },
  role(location: ValidationChain) {
    return location.
      isIn(Object.values(Role));
  },
};

// EXPORTS
export {validation, authValidation, diseaseValidation, nightValidation};

