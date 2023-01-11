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
const router = (0, express_1.Router)();
// MODULES
const express_validator_1 = require("express-validator");
const prisma_1 = __importDefault(require("../../modules/prisma"));
// IMPORTS
const validation_1 = require("../../middlewares/validation");
const passport_1 = require("../../middlewares/passport");
const permissions_1 = __importDefault(require("../../config/permissions"));
const auth_1 = require("../../services/auth");
router.post('/new', (0, passport_1.authNZ)(permissions_1.default.routes.user.new), validation_1.authValidation.email((0, express_validator_1.body)('email')), validation_1.authValidation.firstname((0, express_validator_1.body)('firstname')), validation_1.authValidation.lastname((0, express_validator_1.body)('lastname')), validation_1.authValidation.password((0, express_validator_1.body)('password')), validation_1.authValidation.role((0, express_validator_1.body)('role')), validation_1.validation, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let user;
    try {
        user = yield (0, auth_1.newUser)(Provider.email, req.body.firstname, req.body.lastname, req.body.email, req.body.role, req.body.password);
    }
    catch (err) {
        if (err.code == 'P2002')
            return res.sendStatus(409);
        return next(err);
    }
    return res.json(user);
}));
router.get('/email/:email', (0, passport_1.authNZ)(permissions_1.default.routes.user.get), validation_1.authValidation.email((0, express_validator_1.param)('email')), validation_1.validation, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({ where: { email: req.params.email } })
        .catch((e) => {
        next(e);
        return;
    });
    if (!user)
        return res.sendStatus(404);
    return res.json(user);
}));
router.get('/id/:id', (0, passport_1.authNZ)(permissions_1.default.routes.user.get), (0, express_validator_1.param)('id').isUUID(), validation_1.validation, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({ where: { id: req.params.id } })
        .catch((e) => {
        next(e);
        return;
    });
    if (!user)
        return res.sendStatus(404);
    return res.json(user);
}));
router.get('/find', (0, passport_1.authNZ)(permissions_1.default.routes.user.get), validation_1.authValidation.firstname((0, express_validator_1.query)('firstname')).optional(), validation_1.authValidation.lastname((0, express_validator_1.query)('lastname')).optional(), validation_1.authValidation.role((0, express_validator_1.query)('role')).optional(), validation_1.authValidation.provider((0, express_validator_1.query)('provider')).optional(), validation_1.validation, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield prisma_1.default.user.findMany({ where: {
            role: req.query.role || undefined,
            provider: req.query.provider || undefined,
            firstname: req.query.firstname || undefined,
            lastname: req.query.lastname || undefined,
        } })
        .catch((e) => {
        next(e);
        return;
    });
    res.json(users);
}));
router.delete('/id/:id', (0, passport_1.authNZ)(permissions_1.default.routes.user.delete), (0, express_validator_1.param)('id').isUUID(), validation_1.validation, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.delete({ where: { id: req.params.id } })
        .catch((err) => {
        if (err.code == 'P2025')
            res.sendStatus(404);
        else
            next(err);
        return;
    });
    if (user)
        return res.send();
}));
router.patch('/id/:id', (0, passport_1.authNZ)(permissions_1.default.routes.user.update), validation_1.authValidation.firstname((0, express_validator_1.body)('firstname')).optional(), validation_1.authValidation.lastname((0, express_validator_1.body)('lastname')).optional(), validation_1.authValidation.role((0, express_validator_1.body)('role')).optional(), validation_1.validation, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield (0, auth_1.patchUser)({
        role: req.body.role,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
    }, req.user.id);
    if (!user)
        return;
    res.json(user);
}));
module.exports = router;
