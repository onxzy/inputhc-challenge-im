// EXPRESS
import { Router } from 'express';
import handleError = require('express-async-handler');
const router = Router();

// MODULES
import { body, param } from 'express-validator';
import passport from 'passport';

// IMPORTS
import { validation, authValidation } from '../../middlewares/validation';
import prisma from '../../modules/prisma';

import { authN, notAuthN } from '../../middlewares/passport';
import { sendVerificationEmail, sendPasswordResetEmail, patchUser, newUser } from '../../services/auth';
import { Role, Provider, User } from '@prisma/client';

router.post('/register',
  // #swagger.tags = ['Auth']
  // #swagger.path = '/auth/register'

  notAuthN,

  authValidation.email(body('email')),
  authValidation.firstname(body('firstname')),
  authValidation.lastname(body('lastname')),
  authValidation.password(body('password')),
  validation,

  async (req, res, next) => {
    try {
      const user = await newUser(Provider.email, req.body.firstname, req.body.lastname, req.body.email, Role.USER, req.body.password);
      return res.json(user);
    } catch (error: any) {
      if (error.code == 'P2002') return res.sendStatus(409);
      return next(error);
    }
  });

router.post('/verify/:type',
  // #swagger.tags = ['Auth']
  // #swagger.path = '/auth/verify/{type}'

  authN,

  param('type').isIn(['email']),
  validation,

  handleError(async (req, res, next) => {
    if (req.user!.isVerified) return void res.sendStatus(409);

    if (req.params.type != 'email') return void res.sendStatus(400);
    
    const verificationEmail = await sendVerificationEmail(req.user!);
    
    return void res.json(verificationEmail);
  }));

router.get('/verify/:token',
  // #swagger.tags = ['Auth']
  // #swagger.path = '/auth/verify/{token}'

  param('token').isUUID(),
  validation,

  handleError(async (req, res, next) => {
    const token = await prisma.user_Tokens.findUnique({
      where: {id: req.params.token},
      include: {user: true},
    });
    if (!token) return void res.sendStatus(404); // TODO: Change to redirection to client

    if (token.type == 'verification') {
      if (token.user.isVerified) return void res.sendStatus(409); // TODO: Change to redirection to client

      const expiration = new Date(token.expiration);
      if (expiration < new Date()) return void res.sendStatus(410); // TODO: Change to redirection to client

      await prisma.user.update({
        where: {id: token.userId},
        data: {isVerified: true}});

      await prisma.user_Tokens.delete({where: {id: req.params.token}});

      return void res.send();
    }

    return void res.sendStatus(500);
  }));

router.post('/recover/:email',
  // #swagger.tags = ['Auth']
  // #swagger.path = '/auth/recover/{email}'

  notAuthN,

  authValidation.email(param('email')),
  validation,

  handleError(async (req, res, next) => {
    const user = await prisma.user.findUnique({where: {email: req.params.email}});
    if (!user) return void res.sendStatus(404);

    if (user.provider != Provider.email) return void res.sendStatus(403);

    const passwordResetEmail = await sendPasswordResetEmail(user);
    return void res.json(passwordResetEmail);
  }));

router.patch('/user/password/:token',
  // #swagger.tags = ['Auth']
  // #swagger.path = '/auth/user/password/{token}'

  notAuthN,

  param('token').isUUID(),
  authValidation.password(body('password')),
  validation,

  handleError(async (req, res, next) => {
    const token = await prisma.user_Tokens.findUnique({
      where: {id: req.params.token},
      include: {user: true},
    });
    if (!token) return void res.sendStatus(404);

    if (token.type == 'passwordReset') {
      const expiration = new Date(token.expiration);
      if (expiration < new Date()) return void res.sendStatus(410);

      await patchUser({password: req.body.password}, token.userId);

      await prisma.user_Tokens.delete({where: {id: req.params.token}});

      return void res.send();
    }

    return void res.sendStatus(500);
  }));

router.patch('/user',
  // #swagger.tags = ['Auth']
  // #swagger.path = '/auth/user'

  authN,

  authValidation.email(body('firstname')).optional(),
  authValidation.email(body('lastname')).optional(),
  authValidation.email(body('password')).optional(),
  validation,

  async (req, res, next) => {
    if (req.user!.provider != Provider.email) req.body.password = null;

    let user: User;
    try {
      user = await patchUser({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        password: req.body.password,
      }, req.user!.id);
    } catch (error: any) {
      if (error.code == 'P2025') return res.sendStatus(404);
      else return next(error);
    }

    return res.json(user);
  });

router.post('/login',
  // #swagger.tags = ['Auth']
  // #swagger.path = '/auth/login'
  // #swagger.parameters['username'] = { required: true }
  // #swagger.parameters['password'] = { required: true } 

  notAuthN,
  passport.authenticate('local'),
  (req, res) => {
    return res.json(req.user);
  });

router.use('/login/google',
  // #swagger.tags = ['Auth']
  // #swagger.path = '/auth/login/google' 

  notAuthN,
  passport.authenticate('google', {
    scope: ['email', 'profile'],
  }));

router.get('/callback/google',
  // #swagger.tags = ['Auth']
  // #swagger.path = '/auth/callback/{google}'

  notAuthN,
  passport.authenticate('google', {failureMessage: true}),
  (req, res) => {
    return res.json(req.user);
  });

router.get('/get',
  // #swagger.tags = ['Auth']
  // #swagger.path = '/auth/get'

  authN,
  (req, res) => {
    return res.json(req.user);
  });

router.delete('/logout',
  // #swagger.tags = ['Auth']
  // #swagger.path = '/auth/logout'

  authN,
  (req, res, next) => {
    req.logout((error) => {
      if (error) return next(error);
      return res.send();
    });
  });

export default router;
