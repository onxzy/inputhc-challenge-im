"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountVerificationTemplate = void 0;
exports.accountVerificationTemplate = {
    subject: () => 'Bienvenue sur onxzy.dev !',
    body: (name, link) => (`

<h1>Bienvenue ${name} !</h1>

Merci de vérifier ton adresse mail en cliquant ici : <a href=${link}>${link}</a>

`)
};
