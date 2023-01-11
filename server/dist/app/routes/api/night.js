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
// #swagger.tags = ['Night']
// #swagger.path = '/night/new'
validation_1.nightValidation.date((0, express_validator_1.body)('date')), validation_1.nightValidation.capacity((0, express_validator_1.body)('capacity')), validation_1.validation, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const nigth = yield prisma_1.default.night.create({
            data: { date: new Date(req.body.date), capacity: parseInt(req.body.capacity) }
        });
        return res.json(nigth);
    }
    catch (error) {
        if (error.code == 'P2002')
            return res.sendStatus(409);
        return next(error);
    }
}));
router.get('/id/:id', 
// #swagger.tags = ['Night']
// #swagger.path = '/night/id/{id}'
validation_1.nightValidation.id((0, express_validator_1.param)('id')), validation_1.validation, handleError((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const night = yield prisma_1.default.night.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!night)
        return void res.sendStatus(404);
    return void res.json(night);
})));
router.get('/find', 
// #swagger.tags = ['Night']
// #swagger.path = '/night/find'
// #swagger.parameters['date_start'] = {required: true }
// #swagger.parameters['date_end'] = {required: true } 
validation_1.nightValidation.date((0, express_validator_1.query)('date_start')).optional(), validation_1.nightValidation.date((0, express_validator_1.query)('date_end')).optional(), validation_1.validation, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const nights = yield prisma_1.default.night.findMany({ where: {
                date: {
                    lte: req.query.date_end ? new Date(String(req.query.date_end)) : undefined,
                    gte: req.query.date_start ? new Date(String(req.query.date_start)) : undefined,
                },
            } });
        return res.json(nights);
    }
    catch (error) {
        next(error);
    }
}));
router.patch('/id/:id', 
// #swagger.tags = ['Night']
// #swagger.path = '/night/id/{id}'
validation_1.nightValidation.id((0, express_validator_1.param)('id')), validation_1.nightValidation.capacity((0, express_validator_1.body)('capacity')), validation_1.validation, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const night = yield prisma_1.default.night.update({
            where: { id: parseInt(req.params.id) },
            data: { capacity: parseInt(req.body.capacity) }
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
// #swagger.tags = ['Night']
// #swagger.path = '/night/id/{id}'
validation_1.nightValidation.id((0, express_validator_1.param)('id')), validation_1.validation, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const nigth = yield prisma_1.default.night.delete({ where: { id: parseInt(req.params.id) } });
        return res.send();
    }
    catch (error) {
        if (error.code == 'P2025')
            return res.sendStatus(404);
        return next(error);
    }
}));
router.get('/available', 
// #swagger.tags = ['Night']
// #swagger.path = '/night/available'
// #swagger.parameters['date_start'] = {required: true, type: 'string', description: 'yyyy-mm-dd'}
// #swagger.parameters['date_end'] = {required: true, type: 'string', description: 'yyyy-mm-dd'}
validation_1.nightValidation.date((0, express_validator_1.query)('date_start')), validation_1.nightValidation.date((0, express_validator_1.query)('date_end')), validation_1.validation, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const nights = yield prisma_1.default.night.findMany({ where: {
                date: {
                    lte: req.query.date_end ? new Date(String(req.query.date_end)) : undefined,
                    gte: req.query.date_start ? new Date(String(req.query.date_start)) : undefined,
                },
            } });
        const bookings = yield prisma_1.default.booking.findMany({ where: {
                date_op: {
                    lte: req.query.date_end ? new Date(String(req.query.date_end)) : undefined,
                    gte: req.query.date_start ? new Date(String(req.query.date_start)) : undefined,
                },
            } });
        bookings.forEach((book) => {
            const nights_count = book.nigths_real ? book.nigths_real : book.nights_plan;
            const date_night_min = book.date_night;
            const date_night_max = new Date(book.date_night);
            date_night_max.setDate(date_night_max.getDate() + nights_count - 1);
            nights.forEach((n) => {
                if (date_night_min <= n.date && n.date <= date_night_max) {
                    n.capacity -= 1;
                }
            });
        });
        const availability = [];
        let nb_of_days = 0;
        for (var d = new Date(String(req.query.date_start)); d <= new Date(String(req.query.date_end)); d.setDate(d.getDate() + 1)) {
            let nightAtDate = false;
            for (let i = 0; i < nights.length; i++) {
                const n = nights[i];
                if (n.date.getTime() == d.getTime()) {
                    availability.push(n.capacity);
                    nightAtDate = true;
                    break;
                }
            }
            if (!nightAtDate)
                availability.push(0);
            nb_of_days++;
        }
        res.json(availability);
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
