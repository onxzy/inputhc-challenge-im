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
// #swagger.tags = ['Nights']
// #swagger.path = '/nights/new'
validation_1.nightsValidation.date((0, express_validator_1.body)('date')), validation_1.nightsValidation.capacity((0, express_validator_1.body)('capacity')), validation_1.validation, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const disease = yield prisma_1.default.nights.create({
            data: { date: req.body.date, capacity: req.body.capacity }
        });
        return res.json(disease);
    }
    catch (error) {
        if (error.code == 'P2002')
            return res.sendStatus(409);
        return next(error);
    }
}));
router.get('/id/:id', 
// #swagger.tags = ['Disease']
// #swagger.path = '/disease/id/{id}'
validation_1.diseaseValidation.id((0, express_validator_1.param)('id')), validation_1.validation, handleError((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const disease = yield prisma_1.default.disease.findUnique({ where: { id: req.params.id } });
    if (!disease)
        return void res.sendStatus(404);
    return void res.json(disease);
})));
router.get('/find', 
// #swagger.tags = ['Disease']
// #swagger.path = '/disease/find'
validation_1.diseaseValidation.name((0, express_validator_1.query)('name')), validation_1.validation, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const diseases = yield prisma_1.default.disease.findMany({ where: {
                name: String(req.query.name),
            } });
        return res.json(diseases);
    }
    catch (error) {
        next(error);
    }
}));
router.delete('/id/:id', 
// #swagger.tags = ['Disease']
// #swagger.path = '/disease/id/{id}'
validation_1.diseaseValidation.id((0, express_validator_1.param)('id')), validation_1.validation, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const disease = yield prisma_1.default.disease.delete({ where: { id: req.params.id } });
        return res.send();
    }
    catch (error) {
        if (error.code == 'P2025')
            return res.sendStatus(404);
        return next(error);
    }
}));
exports.default = router;
