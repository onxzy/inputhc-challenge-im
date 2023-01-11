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
const passport_1 = __importDefault(require("passport"));
// IMPORTS
const validation_1 = require("../../middlewares/validation");
const prisma_1 = __importDefault(require("../../modules/prisma"));
const passport_2 = require("../../middlewares/passport");
const auth_1 = require("../../services/auth");
const client_1 = require("@prisma/client");
router.post('/register', 
// #swagger.tags = ['Auth']
// #swagger.path = '/auth/register'
passport_2.notAuthN, validation_1.authValidation.email((0, express_validator_1.body)('email')), validation_1.authValidation.firstname((0, express_validator_1.body)('firstname')), validation_1.authValidation.lastname((0, express_validator_1.body)('lastname')), validation_1.authValidation.password((0, express_validator_1.body)('password')), validation_1.validation, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield (0, auth_1.newUser)(client_1.Provider.email, req.body.firstname, req.body.lastname, req.body.email, client_1.Role.USER, req.body.password);
        return res.json(user);
    }
    catch (error) {
        if (error.code == 'P2002')
            return res.sendStatus(409);
        return next(error);
    }
}));
router.post('/verify/:type', 
// #swagger.tags = ['Auth']
// #swagger.path = '/auth/verify/{type}'
passport_2.authN, (0, express_validator_1.param)('type').isIn(['email']), validation_1.validation, handleError((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.user.isVerified)
        return void res.sendStatus(409);
    if (req.params.type != 'email')
        return void res.sendStatus(400);
    const verificationEmail = yield (0, auth_1.sendVerificationEmail)(req.user);
    return void res.json(verificationEmail);
})));
router.get('/verify/:token', 
// #swagger.tags = ['Auth']
// #swagger.path = '/auth/verify/{token}'
(0, express_validator_1.param)('token').isUUID(), validation_1.validation, handleError((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = yield prisma_1.default.user_Tokens.findUnique({
        where: { id: req.params.token },
        include: { user: true },
    });
    if (!token)
        return void res.sendStatus(404); // TODO: Change to redirection to client
    if (token.type == 'verification') {
        if (token.user.isVerified)
            return void res.sendStatus(409); // TODO: Change to redirection to client
        const expiration = new Date(token.expiration);
        if (expiration < new Date())
            return void res.sendStatus(410); // TODO: Change to redirection to client
        yield prisma_1.default.user.update({
            where: { id: token.userId },
            data: { isVerified: true }
        });
        yield prisma_1.default.user_Tokens.delete({ where: { id: req.params.token } });
        return void res.send();
    }
    return void res.sendStatus(500);
})));
router.post('/recover/:email', 
// #swagger.tags = ['Auth']
// #swagger.path = '/auth/recover/{email}'
passport_2.notAuthN, validation_1.authValidation.email((0, express_validator_1.param)('email')), validation_1.validation, handleError((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({ where: { email: req.params.email } });
    if (!user)
        return void res.sendStatus(404);
    if (user.provider != client_1.Provider.email)
        return void res.sendStatus(403);
    const passwordResetEmail = yield (0, auth_1.sendPasswordResetEmail)(user);
    return void res.json(passwordResetEmail);
})));
router.patch('/user/password/:token', 
// #swagger.tags = ['Auth']
// #swagger.path = '/auth/user/password/{token}'
passport_2.notAuthN, (0, express_validator_1.param)('token').isUUID(), validation_1.authValidation.password((0, express_validator_1.body)('password')), validation_1.validation, handleError((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = yield prisma_1.default.user_Tokens.findUnique({
        where: { id: req.params.token },
        include: { user: true },
    });
    if (!token)
        return void res.sendStatus(404);
    if (token.type == 'passwordReset') {
        const expiration = new Date(token.expiration);
        if (expiration < new Date())
            return void res.sendStatus(410);
        yield (0, auth_1.patchUser)({ password: req.body.password }, token.userId);
        yield prisma_1.default.user_Tokens.delete({ where: { id: req.params.token } });
        return void res.send();
    }
    return void res.sendStatus(500);
})));
router.patch('/user', 
// #swagger.tags = ['Auth']
// #swagger.path = '/auth/user'
passport_2.authN, validation_1.authValidation.email((0, express_validator_1.body)('firstname')).optional(), validation_1.authValidation.email((0, express_validator_1.body)('lastname')).optional(), validation_1.authValidation.email((0, express_validator_1.body)('password')).optional(), validation_1.validation, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.user.provider != client_1.Provider.email)
        req.body.password = null;
    let user;
    try {
        user = yield (0, auth_1.patchUser)({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            password: req.body.password,
        }, req.user.id);
    }
    catch (error) {
        if (error.code == 'P2025')
            return res.sendStatus(404);
        else
            return next(error);
    }
    return res.json(user);
}));
router.post('/login', 
// #swagger.tags = ['Auth']
// #swagger.path = '/auth/login'
// #swagger.parameters['username'] = { required: true }
// #swagger.parameters['password'] = { required: true } 
passport_2.notAuthN, passport_1.default.authenticate('local'), (req, res) => {
    return res.json(req.user);
});
router.use('/login/google', 
// #swagger.tags = ['Auth']
// #swagger.path = '/auth/login/google' 
passport_2.notAuthN, passport_1.default.authenticate('google', {
    scope: ['email', 'profile'],
}));
router.get('/callback/google', 
// #swagger.tags = ['Auth']
// #swagger.path = '/auth/callback/{google}'
passport_2.notAuthN, passport_1.default.authenticate('google', { failureMessage: true }), (req, res) => {
    return res.json(req.user);
});
router.get('/get', 
// #swagger.tags = ['Auth']
// #swagger.path = '/auth/get'
passport_2.authN, (req, res) => {
    return res.json(req.user);
});
router.delete('/logout', 
// #swagger.tags = ['Auth']
// #swagger.path = '/auth/logout'
passport_2.authN, (req, res, next) => {
    req.logout((error) => {
        if (error)
            return next(error);
        return res.send();
    });
});
exports.default = router;
