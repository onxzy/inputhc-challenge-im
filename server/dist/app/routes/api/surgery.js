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
const errorMsg_1 = __importDefault(require("../../config/errorMsg"));
router.post('/new', 
// #swagger.tags = ['Surgery']
// #swagger.path = '/surgery/new'
validation_1.surgeryValidation.date((0, express_validator_1.body)('date')), validation_1.surgeryValidation.capacity((0, express_validator_1.body)('capacity')), validation_1.diseaseValidation.id((0, express_validator_1.body)('disease')), validation_1.validation, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const surgery = yield prisma_1.default.surgery.create({
            data: {
                date: new Date(req.body.date),
                capacity: parseInt(req.body.capacity),
                disease: {
                    connect: { id: req.body.disease }
                }
            },
            include: {
                disease: true,
            }
        });
        return res.json(surgery);
    }
    catch (error) {
        if (error.code == 'P2002')
            return res.sendStatus(409);
        return next(error);
    }
}));
router.get('/id/:id', 
// #swagger.tags = ['Surgery']
// #swagger.path = '/surgery/id/{id}'
validation_1.surgeryValidation.id((0, express_validator_1.param)('id')), validation_1.validation, handleError((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const surgery = yield prisma_1.default.surgery.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!surgery)
        return void res.sendStatus(404);
    return void res.json(surgery);
})));
router.get('/find', 
// #swagger.tags = ['Surgery']
// #swagger.path = '/surgery/find'
// #swagger.parameters['date_start'] = {required: true }
// #swagger.parameters['date_end'] = {required: true } 
validation_1.surgeryValidation.date((0, express_validator_1.query)('date_start')).optional(), validation_1.surgeryValidation.date((0, express_validator_1.query)('date_end')).optional(), validation_1.validation, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const surgeries = yield prisma_1.default.surgery.findMany({ where: {
                date: {
                    lte: req.query.date_end ? new Date(String(req.query.date_end)) : undefined,
                    gte: req.query.date_start ? new Date(String(req.query.date_start)) : undefined,
                },
            } });
        return res.json(surgeries);
    }
    catch (error) {
        next(error);
    }
}));
router.patch('/id/:id', 
// #swagger.tags = ['Surgery']
// #swagger.path = '/surgery/id/{id}'
validation_1.surgeryValidation.id((0, express_validator_1.param)('id')), validation_1.surgeryValidation.capacity((0, express_validator_1.body)('capacity')), validation_1.diseaseValidation.id((0, express_validator_1.body)('disease')), validation_1.validation, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const disease = yield prisma_1.default.disease.findUnique({ where: { id: req.params.id } });
        if (!disease)
            return void res.status(404).json({ err: errorMsg_1.default.disease.unknown });
        const surgery = yield prisma_1.default.surgery.update({
            where: { id: parseInt(req.params.id) },
            data: {
                capacity: parseInt(req.body.capacity),
                disease: {
                    connect: { id: req.body.disease }
                }
            }
        });
        return res.json(surgery);
    }
    catch (error) {
        if (error.code == 'P2025')
            return res.sendStatus(404);
        return next(error);
    }
}));
router.delete('/id/:id', 
// #swagger.tags = ['Surgery']
// #swagger.path = '/surgery/id/{id}'
validation_1.surgeryValidation.id((0, express_validator_1.param)('id')), validation_1.validation, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const surgery = yield prisma_1.default.surgery.delete({ where: { id: parseInt(req.params.id) } });
        return res.send();
    }
    catch (error) {
        if (error.code == 'P2025')
            return res.sendStatus(404);
        return next(error);
    }
}));
router.get('/available', 
// #swagger.tags = ['Surgery']
// #swagger.path = '/surgery/available'
// #swagger.parameters['date_start'] = {required: true, type: 'string', description: 'yyyy-mm-dd'}
// #swagger.parameters['date_end'] = {required: true, type: 'string', description: 'yyyy-mm-dd'}
validation_1.surgeryValidation.date((0, express_validator_1.query)('date_start')), validation_1.surgeryValidation.date((0, express_validator_1.query)('date_end')), validation_1.diseaseValidation.id((0, express_validator_1.query)('disease')), validation_1.validation, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const surgery = yield prisma_1.default.surgery.findMany({ where: {
                diseaseId: String(req.query.disease),
                date: {
                    lte: new Date(String(req.query.date_end)),
                    gte: new Date(String(req.query.date_start)),
                },
            } });
        const bookings = yield prisma_1.default.booking.findMany({ where: {
                date_op: {
                    lte: new Date(String(req.query.date_end)),
                    gte: new Date(String(req.query.date_start)),
                },
            } });
        bookings.forEach((book) => {
            const nights_count = book.nigths_real ? book.nigths_real : book.nights_plan;
            const date_night_min = book.date_night;
            const date_night_max = new Date(book.date_night);
            date_night_max.setDate(date_night_max.getDate() + nights_count - 1);
            surgery.forEach((s) => {
                if (date_night_min <= s.date && s.date <= date_night_max) {
                    s.capacity -= 1;
                }
            });
        });
        const availability = [];
        let nb_of_days = 0;
        for (var d = new Date(String(req.query.date_start)); d <= new Date(String(req.query.date_end)); d.setDate(d.getDate() + 1)) {
            let nightAtDate = false;
            for (let i = 0; i < surgery.length; i++) {
                const s = surgery[i];
                if (s.date.getTime() == d.getTime()) {
                    availability.push(s.capacity);
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
