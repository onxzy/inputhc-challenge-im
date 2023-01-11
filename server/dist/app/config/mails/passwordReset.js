"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordResetTemplate = void 0;
exports.passwordResetTemplate = {
    subject: () => 'Réinitialisation du mot de passe',
    body: (name, link) => (`

<h1>Bonjour ${name} !</h1>

Pour réinitialiser votre mot de passe cliquez ici : <a href=${link}>${link}</a>

`)
};
