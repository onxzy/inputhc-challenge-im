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
exports.sendPasswordResetEmail = exports.sendVerificationEmail = exports.sendWelcomeEmail = exports.patchUser = exports.newUser = void 0;
const prisma_1 = __importDefault(require("../modules/prisma"));
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const general_1 = __importDefault(require("../config/general"));
const nodemailer_1 = require("../modules/nodemailer");
const accountVerification_1 = require("../config/mails/accountVerification");
const passwordReset_1 = require("../config/mails/passwordReset");
const welcome_1 = require("../config/mails/welcome");
function newUser(provider, firstname, lastname, email, role, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const passwordHash = password ? bcrypt_1.default.hashSync(password, 10) : null;
        let isVerified = false;
        if (provider != client_1.Provider.email)
            isVerified = true;
        const user = yield prisma_1.default.user.create({
            data: {
                provider, isVerified,
                firstname, lastname, email,
                role,
                password: passwordHash,
            }
        });
        if (provider == client_1.Provider.email)
            yield sendVerificationEmail(user);
        else
            yield sendWelcomeEmail(user);
        return user;
    });
}
exports.newUser = newUser;
function patchUser(data, userId) {
    return prisma_1.default.user.update({
        where: { id: userId },
        data: {
            role: data.role || undefined,
            provider: data.provider || undefined,
            firstname: data.firstname || undefined,
            lastname: data.lastname || undefined,
            password: data.password ? bcrypt_1.default.hashSync(data.password, 10) : undefined,
        }
    });
}
exports.patchUser = patchUser;
function sendWelcomeEmail(user) {
    return __awaiter(this, void 0, void 0, function* () {
        const infos = yield nodemailer_1.mailTransporter.sendMail({
            from: '"onxzy.dev" <noreply@onxzy.dev>',
            to: user.email,
            subject: welcome_1.welcomeTemplate.subject(),
            html: welcome_1.welcomeTemplate.body(user.firstname),
        });
        return {
            emailId: infos.messageId,
        };
    });
}
exports.sendWelcomeEmail = sendWelcomeEmail;
function sendVerificationEmail(user) {
    return __awaiter(this, void 0, void 0, function* () {
        const expiration = new Date();
        expiration.setSeconds(expiration.getSeconds() + general_1.default.auth.verificationTokenExpiration);
        const token = yield prisma_1.default.user_Tokens.create({ data: { userId: user.id, expiration, type: 'verification' } });
        const infos = yield nodemailer_1.mailTransporter.sendMail({
            from: '"onxzy.dev" <noreply@onxzy.dev>',
            to: user.email,
            subject: accountVerification_1.accountVerificationTemplate.subject(),
            html: accountVerification_1.accountVerificationTemplate.body(user.firstname, `${process.env.API_URL}/auth/verify/${token.id}`),
        });
        return {
            emailId: infos.messageId,
            expiration,
        };
    });
}
exports.sendVerificationEmail = sendVerificationEmail;
function sendPasswordResetEmail(user) {
    return __awaiter(this, void 0, void 0, function* () {
        const expiration = new Date();
        expiration.setSeconds(expiration.getSeconds() + general_1.default.auth.recoverTokenExpiration);
        const token = yield prisma_1.default.user_Tokens.create({ data: { userId: user.id, expiration, type: 'passwordReset' } });
        const infos = yield nodemailer_1.mailTransporter.sendMail({
            from: '"onxzy.dev" <noreply@onxzy.dev>',
            to: user.email,
            subject: passwordReset_1.passwordResetTemplate.subject(),
            html: passwordReset_1.passwordResetTemplate.body(user.firstname, `${process.env.CLIENT_URL}${general_1.default.auth.recoverFormPath}#token=${token.id}`),
        });
        return {
            emailId: infos.messageId,
            expiration,
        };
    });
}
exports.sendPasswordResetEmail = sendPasswordResetEmail;
