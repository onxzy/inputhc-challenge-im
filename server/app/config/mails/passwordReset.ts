export const passwordResetTemplate = {
  subject: () => 'RĂ©initialisation du mot de passe',
  body: (name: string, link: string) => (`

<h1>Bonjour ${name} !</h1>

Pour rĂ©initialiser votre mot de passe cliquez ici : <a href=${link}>${link}</a>

`)};
