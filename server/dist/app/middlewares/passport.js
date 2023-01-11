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
exports.authNZ = exports.authZ = exports.notAuthN = exports.authN = void 0;
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = require("passport-local");
const passport_google_oidc_1 = __importDefault(require("passport-google-oidc"));
const prisma_1 = __importDefault(require("../modules/prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const errorMsg_1 = __importDefault(require("../config/errorMsg"));
const client_1 = require("@prisma/client");
const auth_1 = require("../services/auth");
const authPermissions_1 = require("../config/authPermissions");
passport_1.default.serializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user);
    });
});
passport_1.default.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user);
    });
});
passport_1.default.use(new passport_local_1.Strategy(function verify(username, password, cb) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield prisma_1.default.user.findUnique({ where: { email: username } }).catch(cb);
        if (!user)
            return cb(null, false, { message: errorMsg_1.default.auth.not_found });
        if (user.provider != 'email' || !user.password)
            return cb(null, false);
        if (!bcrypt_1.default.compareSync(password, user.password))
            return cb(null, false, { message: errorMsg_1.default.auth.bad_password });
        return cb(null, user);
    });
}));
passport_1.default.use(new passport_google_oidc_1.default({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.API_URL}/auth/callback/google`,
}, function (_, profile, cb) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!profile || profile.emails.length == 0)
            return cb(null, false);
        let user = yield prisma_1.default.user.findUnique({ where: { email: profile.emails[0].value } }).catch(cb);
        if (user) {
            if (user.provider != 'google')
                return cb(null, false);
            return cb(null, user);
        }
        else {
            try {
                user = yield (0, auth_1.newUser)(client_1.Provider.google, profile.name.givenName, profile.name.familyName, profile.emails[0].value, client_1.Role.USER);
            }
            catch (err) {
                return cb(err);
            }
            return cb(null, auth_1.newUser);
        }
    });
}));
function _authN(checkIsAuth = true) {
    return (req, res, next) => {
        if (checkIsAuth) {
            if (!req.user)
                return res.sendStatus(401);
            return next();
        }
        else {
            if (req.user)
                return res.sendStatus(401);
            return next();
        }
    };
}
function authZ(permission) {
    return (req, res, next) => {
        if (!req.user)
            return next();
        if (!authPermissions_1.rolePermissions[req.user.role].includes(permission))
            return res.sendStatus(403);
        next();
    };
}
exports.authZ = authZ;
function authNZ(permission) {
    return (req, res, next) => {
        _authN()(req, res, () => authZ(permission)(req, res, next));
    };
}
exports.authNZ = authNZ;
exports.authN = _authN(true);
exports.notAuthN = _authN(false);
