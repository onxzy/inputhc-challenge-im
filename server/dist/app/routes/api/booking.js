"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// EXPRESS
const express_1 = require("express");
const handleError = require("express-async-handler");
const router = (0, express_1.Router)();
// MODULES
const express_validator_1 = require("express-validator");
const prisma_1 = __importDefault(require("../../modules/prisma"));
// IMPORTS
const validation_1 = require("../../middlewares/validation");
router.post('/new', 
// #swagger.tags = ['Booking']
// #swagger.path = '/booking/new'
validation_1.bookingValidation.name((0, express_validator_1.body)('firstName')), validation_1.bookingValidation.name((0, express_validator_1.body)('lastName')), validation_1.bookingValidation.email((0, express_validator_1.body)('email')), validation_1.bookingValidation.date((0, express_validator_1.body)('date_night')), validation_1.bookingValidation.date((0, express_validator_1.body)('date_op')), validation_1.bookingValidation.nights((0, express_validator_1.body)('nights_plan')), validation_1.surgeryValidation.id((0, express_validator_1.body)('surgery')), validation_1.validation, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const booking = yield prisma_1.default.booking.create({
            data: {
                firstName: String(req.body.firstName),
                lastName: String(req.body.lastName),
                email: String(req.body.email),
                date_night: new Date(req.body.date_night),
                date_op: new Date(req.body.date_op),
                nights_plan: parseInt(req.body.nights_plan),
                surgery: {
                    connect: { id: req.body.surgery }
                }
            }
        });
        return res.json(booking);
    }
    catch (error) {
        if (error.code == 'P2002')
            return res.sendStatus(409);
        return next(error);
    }
}));
router.get('/id/:id', 
// #swagger.tags = ['Booking']
// #swagger.path = '/booking/id/{id}'
validation_1.bookingValidation.id((0, express_validator_1.param)('id')), validation_1.validation, handleError((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const booking = yield prisma_1.default.booking.findUnique({ where: { id: req.params.id } });
    if (!booking)
        return void res.sendStatus(404);
    return void res.json(booking);
})));
router.get('/find', 
// #swagger.tags = ['Booking']
// #swagger.path = '/booking/find'
// #swagger.parameters['firstName'] = {type: 'string'}
// #swagger.parameters['lastName'] = {type: 'string'}
// #swagger.parameters['email'] = {type: 'string'}
// #swagger.parameters['date_start'] = {type: 'string', description: 'yyyy-mm-dd'}
// #swagger.parameters['date_end'] = {type: 'string', description: 'yyyy-mm-dd'}
// #swagger.parameters['surgery'] = {type: 'int'}
validation_1.bookingValidation.name((0, express_validator_1.query)('firstName')).optional(), validation_1.bookingValidation.name((0, express_validator_1.query)('lastName')).optional(), validation_1.bookingValidation.email((0, express_validator_1.query)('email')).optional(), validation_1.bookingValidation.date((0, express_validator_1.query)('date_start')).optional(), validation_1.bookingValidation.date((0, express_validator_1.query)('date_end')).optional(), validation_1.surgeryValidation.id((0, express_validator_1.query)('surgery')).optional(), validation_1.validation, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookings = yield prisma_1.default.booking.findMany({ where: {
                firstName: req.query.firstName ? String(req.query.firstName) : undefined,
                lastName: req.query.lastName ? String(req.query.lastName) : undefined,
                email: req.query.email ? String(req.query.email) : undefined,
                surgeryId: req.query.surgeryId ? parseInt(String(req.query.surgery)) : undefined,
                date_op: {
                    lte: req.query.date_end ? new Date(String(req.query.date_end)) : undefined,
                    gte: req.query.date_start ? new Date(String(req.query.date_start)) : undefined,
                },
            } });
        return res.json(bookings);
    }
    catch (error) {
        next(error);
    }
}));
router.patch('/id/:id', 
// #swagger.tags = ['Booking']
// #swagger.path = '/booking/id/{id}'
validation_1.bookingValidation.id((0, express_validator_1.param)('id')), validation_1.bookingValidation.date((0, express_validator_1.body)('date_night')), validation_1.bookingValidation.date((0, express_validator_1.body)('date_op')), validation_1.validation, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const night = yield prisma_1.default.booking.update({
            where: { id: String(req.params.id) },
            data: {
                date_night: new Date(req.body.date_night),
                date_op: new Date(req.body.date_op)
            }
        });
        return res.json(night);
    }
    catch (error) {
        if (error.code == 'P2025')
            return res.sendStatus(404);
        return next(error);
    }
}));
router.delete('/id/:id', 
// #swagger.tags = ['Booking']
// #swagger.path = '/booking/id/{id}'
validation_1.bookingValidation.id((0, express_validator_1.param)('id')), validation_1.validation, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const booking = yield prisma_1.default.booking.delete({ where: { id: req.params.id } });
        return res.send();
    }
    catch (error) {
        if (error.code == 'P2025')
            return res.sendStatus(404);
        return next(error);
    }
}));
exports.default = router;
