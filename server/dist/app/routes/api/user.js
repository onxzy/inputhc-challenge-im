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
const passport_1 = require("../../middlewares/passport");
const auth_1 = require("../../services/auth");
const client_1 = require("@prisma/client");
const authPermissions_1 = require("../../config/authPermissions");
router.post('/new', 
// #swagger.tags = ['User']
// #swagger.path = '/user/new'
(0, passport_1.authNZ)(authPermissions_1.AuthPermissions.routes_user_new), validation_1.authValidation.email((0, express_validator_1.body)('email')), validation_1.authValidation.firstname((0, express_validator_1.body)('firstname')), validation_1.authValidation.lastname((0, express_validator_1.body)('lastname')), validation_1.authValidation.password((0, express_validator_1.body)('password')), validation_1.authValidation.role((0, express_validator_1.body)('role')), validation_1.validation, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield (0, auth_1.newUser)(client_1.Provider.email, req.body.firstname, req.body.lastname, req.body.email, req.body.role, req.body.password);
        return res.json(user);
    }
    catch (error) {
        if (error.code == 'P2002')
            return res.sendStatus(409);
        return next(error);
    }
}));
router.get('/email/:email', 
// #swagger.tags = ['User']
// #swagger.path = '/user/email/{email}'
(0, passport_1.authNZ)(authPermissions_1.AuthPermissions.routes_user_get), validation_1.authValidation.email((0, express_validator_1.param)('email')), validation_1.validation, handleError((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({ where: { email: req.params.email } });
    if (!user)
        return void res.sendStatus(404);
    res.json(user);
})));
router.get('/id/:id', 
// #swagger.tags = ['User']
// #swagger.path = '/user/id/{id}'
(0, passport_1.authNZ)(authPermissions_1.AuthPermissions.routes_user_get), (0, express_validator_1.param)('id').isUUID(), validation_1.validation, handleError((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({ where: { id: req.params.id } });
    if (!user)
        return void res.sendStatus(404);
    return void res.json(user);
})));
router.get('/find', 
// #swagger.tags = ['User']
// #swagger.path = '/user/find'
(0, passport_1.authNZ)(authPermissions_1.AuthPermissions.routes_user_get), validation_1.authValidation.firstname((0, express_validator_1.query)('firstname')).optional(), validation_1.authValidation.lastname((0, express_validator_1.query)('lastname')).optional(), validation_1.authValidation.role((0, express_validator_1.query)('role')).optional(), validation_1.authValidation.provider((0, express_validator_1.query)('provider')).optional(), validation_1.validation, handleError((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield prisma_1.default.user.findMany({ where: {
            role: req.query.role ? client_1.Role[req.query.role] : undefined,
            provider: req.query.provider ? client_1.Provider[req.query.provider] : undefined,
            firstname: req.query.firstname ? String(req.query.firstname) : undefined,
            lastname: req.query.lastname ? String(req.query.lastname) : undefined,
        } });
    return void res.json(users);
})));
router.delete('/id/:id', 
// #swagger.tags = ['User']
// #swagger.path = '/user/id/{id}'
(0, passport_1.authNZ)(authPermissions_1.AuthPermissions.routes_user_delete), (0, express_validator_1.param)('id').isUUID(), validation_1.validation, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prisma_1.default.user.delete({ where: { id: req.params.id } });
        return res.send();
    }
    catch (error) {
        if (error.code == 'P2025')
            return res.sendStatus(404);
        return next(error);
    }
}));
router.patch('/id/:id', 
// #swagger.tags = ['User']
// #swagger.path = '/user/id/{id}'
(0, passport_1.authNZ)(authPermissions_1.AuthPermissions.routes_user_update), (0, express_validator_1.param)('id').isUUID(), validation_1.authValidation.firstname((0, express_validator_1.body)('firstname')).optional(), validation_1.authValidation.lastname((0, express_validator_1.body)('lastname')).optional(), validation_1.authValidation.role((0, express_validator_1.body)('role')).optional(), validation_1.validation, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield (0, auth_1.patchUser)({
            role: req.body.role,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
        }, req.params.id);
        return res.json(user);
    }
    catch (error) {
        if (error.code == 'P2025')
            return res.sendStatus(404);
        return next(error);
    }
}));
exports.default = router;
