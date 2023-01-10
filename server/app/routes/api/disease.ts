// EXPRESS
import { Router } from 'express';
import handleError = require('express-async-handler');
const router = Router();

// MODULES
import { body, param, query } from 'express-validator';
import prisma from '../../modules/prisma';

// IMPORTS
import { validation, authValidation, diseaseValidation } from '../../middlewares/validation';
import { authNZ } from '../../middlewares/passport';

import { patchUser, newUser } from '../../services/auth';
import { Provider, Role } from '@prisma/client';
import { AuthPermissions } from '../../config/authPermissions';


router.post('/new',
  // #swagger.tags = ['Disease']
  // #swagger.path = '/disease/new'

  diseaseValidation.name(body('name')),
  validation,

  async (req, res, next) => {
    try {
      const disease = await prisma.disease.create({
        data: {name: req.body.name}
      });
      return res.json(disease);
    } catch (error: any) {
      if (error.code == 'P2002') return res.sendStatus(409);
      return next(error);
    }
  });

router.get('/id/:id',
  // #swagger.tags = ['Disease']
  // #swagger.path = '/disease/id/{id}'

  diseaseValidation.id(param('id')),
  validation,

  handleError(async (req, res, next) => {
      const disease = await prisma.disease.findUnique({where: {id: req.params.id}});
      if (!disease) return void res.sendStatus(404);
      return void res.json(disease);
  }));

router.get('/find',
  // #swagger.tags = ['Disease']
  // #swagger.path = '/disease/find'

  diseaseValidation.name(query('name')).optional(),
  validation,

  async (req, res, next) => {
    try {
      const diseases = await prisma.disease.findMany({where: {
        name: req.query.name ? String(req.query.name) : undefined,
      }});
      return res.json(diseases);  
    } catch (error) {
      next(error)
    }  
  });

router.delete('/id/:id',
  // #swagger.tags = ['Disease']
  // #swagger.path = '/disease/id/{id}'

  diseaseValidation.id(param('id')),
  validation,

  async (req, res, next) => {
    try {
      const disease = await prisma.disease.delete({where: {id: req.params.id}});
      return res.send();

    } catch (error: any) { 
      if (error.code == 'P2025') return res.sendStatus(404);
      return next(error);
    }
  });

export default router;
