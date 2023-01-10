export const passwordResetTemplate = {
  subject: () => 'Réinitialisation du mot de passe',
  body: (name: string, link: string) => (`

<h1>Bonjour ${name} !</h1>

Pour réinitialiser votre mot de passe cliquez ici : <a href=${link}>${link}</a>

`)};
