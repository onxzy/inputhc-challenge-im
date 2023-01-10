import prisma from '../modules/prisma';
import { Provider, Role, User } from '@prisma/client';

import bcrypt from 'bcrypt';
import config from '../config/general';

import { mailTransporter } from '../modules/nodemailer';
import {accountVerificationTemplate} from '../config/mails/accountVerification';
import {passwordResetTemplate} from '../config/mails/passwordReset';
import {welcomeTemplate} from '../config/mails/welcome';


async function newUser(provider: Provider, firstname: string, lastname: string, email: string, role: Role, password?: string) {
  const passwordHash = password ? bcrypt.hashSync(password, 10) : null;
  let isVerified = false;
  if (provider != Provider.email) isVerified = true;
  const user = await prisma.user.create({
    data: {
      provider, isVerified,
      firstname, lastname, email,
      role,
      password: passwordHash,
    }});

  if (provider == Provider.email) await sendVerificationEmail(user);
  else await sendWelcomeEmail(user);

  return user;
}

function patchUser(data : {
  role? : Role,
  provider? : Provider,
  firstname? : string,
  lastname? : string,
  password? : string,
}, userId: string) {
  return prisma.user.update({
    where: {id: userId},
    data: {
      role: data.role || undefined,
      provider: data.provider || undefined,
      firstname: data.firstname || undefined,
      lastname: data.lastname || undefined,
      password: data.password ? bcrypt.hashSync(data.password, 10) : undefined,
    }});
}

async function sendWelcomeEmail(user: User) {
  const infos = await mailTransporter.sendMail({
    from: '"onxzy.dev" <noreply@onxzy.dev>',
    to: user.email,
    subject: welcomeTemplate.subject(),
    html: welcomeTemplate.body(user.firstname),
  });

  return {
    emailId: infos.messageId,
  };
}

async function sendVerificationEmail(user: User) {
  const expiration = new Date();
  expiration.setSeconds(expiration.getSeconds() + config.auth.verificationTokenExpiration);
  const token = await prisma.user_Tokens.create({data: {userId: user.id, expiration, type: 'verification'}});

  const infos = await mailTransporter.sendMail({
    from: '"onxzy.dev" <noreply@onxzy.dev>',
    to: user.email,
    subject: accountVerificationTemplate.subject(),
    html: accountVerificationTemplate.body(user.firstname, `${process.env.API_URL}/auth/verify/${token.id}`),
  });

  return {
    emailId: infos.messageId,
    expiration,
  };
}

async function sendPasswordResetEmail(user: User) {
  const expiration = new Date();
  expiration.setSeconds(expiration.getSeconds() + config.auth.recoverTokenExpiration);
  const token = await prisma.user_Tokens.create({data: {userId: user.id, expiration, type: 'passwordReset'}});

  const infos = await mailTransporter.sendMail({
    from: '"onxzy.dev" <noreply@onxzy.dev>',
    to: user.email,
    subject: passwordResetTemplate.subject(),
    html: passwordResetTemplate.body(user.firstname, `${process.env.CLIENT_URL}${config.auth.recoverFormPath}#token=${token.id}`),
  });

  return {
    emailId: infos.messageId,
    expiration,
  };
}

export {
  newUser, patchUser,
  sendWelcomeEmail, sendVerificationEmail, sendPasswordResetEmail,
};
