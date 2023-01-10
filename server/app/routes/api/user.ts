// EXPRESS
import { Router } from 'express';
import handleError = require('express-async-handler');
const router = Router();

// MODULES
import { body, param, query } from 'express-validator';
import prisma from '../../modules/prisma';

// IMPORTS
import { validation, authValidation } from '../../middlewares/validation';
import { authNZ } from '../../middlewares/passport';

import { patchUser, newUser } from '../../services/auth';
import { Provider, Role } from '@prisma/client';
import { AuthPermissions } from '../../config/authPermissions';


router.post('/new',
  // #swagger.tags = ['User']
  // #swagger.path = '/user/new'

  authNZ(AuthPermissions.routes_user_new),

  authValidation.email(body('email')),
  authValidation.firstname(body('firstname')),
  authValidation.lastname(body('lastname')),
  authValidation.password(body('password')),
  authValidation.role(body('role')),
  validation,

  async (req, res, next) => {
    try {
      const user = await newUser(Provider.email, req.body.firstname, req.body.lastname, req.body.email, req.body.role, req.body.password);
      return res.json(user);
    } catch (error: any) {
      if (error.code == 'P2002') return res.sendStatus(409);
      return next(error);
    }
  });

router.get('/email/:email',
  // #swagger.tags = ['User']
  // #swagger.path = '/user/email/{email}'

  authNZ(AuthPermissions.routes_user_get),

  authValidation.email(param('email')),
  validation,

  handleError(async (req, res, next) => {
    const user = await prisma.user.findUnique({where: {email: req.params.email}});
    if (!user) return void res.sendStatus(404);
    res.json(user);
  }));

router.get('/id/:id',
  // #swagger.tags = ['User']
  // #swagger.path = '/user/id/{id}'

  authNZ(AuthPermissions.routes_user_get),

  param('id').isUUID(),
  validation,

  handleError(async (req, res, next) => {
      const user = await prisma.user.findUnique({where: {id: req.params.id}});
      if (!user) return void res.sendStatus(404);
      return void res.json(user);
  }));

router.get('/find',
  // #swagger.tags = ['User']
  // #swagger.path = '/user/find'

  authNZ(AuthPermissions.routes_user_get),

  authValidation.firstname(query('firstname')).optional(),
  authValidation.lastname(query('lastname')).optional(),
  authValidation.role(query('role')).optional(),
  authValidation.provider(query('provider')).optional(),
  validation,

  handleError(async (req, res, next) => {
      const users = await prisma.user.findMany({where: {
        role: req.query.role ? Role[req.query.role as keyof typeof Role] : undefined,
        provider: req.query.provider ? Provider[req.query.provider as keyof typeof Provider] : undefined,
        firstname: req.query.firstname ? String(req.query.firstname) : undefined,
        lastname: req.query.lastname ? String(req.query.lastname) : undefined,
      }});
      return void res.json(users);
  }));

router.delete('/id/:id',
  // #swagger.tags = ['User']
  // #swagger.path = '/user/id/{id}'

  authNZ(AuthPermissions.routes_user_delete),

  param('id').isUUID(),
  validation,

  async (req, res, next) => {
    try {
      const user = await prisma.user.delete({where: {id: req.params.id}});
      return res.send();

    } catch (error: any) { 
      if (error.code == 'P2025') return res.sendStatus(404);
      return next(error);
    }
  });

router.patch('/id/:id',
  // #swagger.tags = ['User']
  // #swagger.path = '/user/id/{id}'

  authNZ(AuthPermissions.routes_user_update),

  param('id').isUUID(),
  authValidation.firstname(body('firstname')).optional(),
  authValidation.lastname(body('lastname')).optional(),
  authValidation.role(body('role')).optional(),
  validation,

  async (req, res, next) => {
    try {
      const user = await patchUser({
        role: req.body.role,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
      }, req.params.id);
      return res.json(user);

    } catch (error: any) {
      if (error.code == 'P2025') return res.sendStatus(404);
      return next(error);
    }
  });

export default router;
