export const accountVerificationTemplate = {
  subject: () => 'Bienvenue sur onxzy.dev !',
  body: (name: string, link: string) => (`

<h1>Bienvenue ${name} !</h1>

Merci de vérifier ton adresse mail en cliquant ici : <a href=${link}>${link}</a>

`)};
