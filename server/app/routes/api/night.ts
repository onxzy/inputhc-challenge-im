// EXPRESS
import { Router } from 'express';
import handleError = require('express-async-handler');
const router = Router();

// MODULES
import { body, param, query } from 'express-validator';
import prisma from '../../modules/prisma';

// IMPORTS
import { validation, authValidation, diseaseValidation, nightValidation } from '../../middlewares/validation';
import { authNZ } from '../../middlewares/passport';

import { patchUser, newUser } from '../../services/auth';
import { Provider, Role } from '@prisma/client';
import { AuthPermissions } from '../../config/authPermissions';


router.post('/new',
  // #swagger.tags = ['Night']
  // #swagger.path = '/night/new'

  nightValidation.date(body('date')),
  nightValidation.capacity(body('capacity')),
  validation,

  async (req, res, next) => {
    try {
      const nigth = await prisma.night.create({
        data: {date: req.body.date, capacity: parseInt(req.body.capacity)}
      });
      return res.json(nigth);
    } catch (error: any) {
      if (error.code == 'P2002') return res.sendStatus(409);
      return next(error);
    }
  });

router.get('/id/:id',
  // #swagger.tags = ['Night']
  // #swagger.path = '/night/id/{id}'

  nightValidation.id(param('id')),
  validation,

  handleError(async (req, res, next) => {
      const night = await prisma.night.findUnique({where: {id: parseInt(req.params.id)}});
      if (!night) return void res.sendStatus(404);
      return void res.json(night);
  }));

router.get('/find',
  // #swagger.tags = ['Night']
  // #swagger.path = '/night/find'
  // #swagger.parameters['date_start'] = {required: true }
  // #swagger.parameters['date_end'] = {required: true } 

  nightValidation.date(query('date_start')).optional(),
  nightValidation.date(query('date_end')).optional(),
  validation,

  async (req, res, next) => {
    try {
      const nights = await prisma.night.findMany({where: {
        date: {
          lte: new Date(String(req.query.date_end)),
          gte: new Date(String(req.query.date_start)),
        },
      }});
      return res.json(nights);  
    } catch (error) {
      next(error)
    }  
  });

router.patch('/id/:id',
  // #swagger.tags = ['Night']
  // #swagger.path = '/night/id/{id}'

  nightValidation.id(param('id')),
  nightValidation.capacity(body('capacity')),
  validation,

  async (req, res, next) => {
    try {
      const night = await prisma.night.update({
        where: {id: parseInt(req.params.id)},
        data: {capacity: parseInt(req.body.capacity)}});
      return res.json(night);
    } catch (error: any) {
      if (error.code == 'P2025') return res.sendStatus(404);
      return next(error);
    }
  });

router.delete('/id/:id',
  // #swagger.tags = ['Night']
  // #swagger.path = '/night/id/{id}'

  nightValidation.id(param('id')),
  validation,

  async (req, res, next) => {
    try {
      const nigth = await prisma.night.delete({where: {id: parseInt(req.params.id)}});
      return res.send();

    } catch (error: any) { 
      if (error.code == 'P2025') return res.sendStatus(404);
      return next(error);
    }
  });

export default router;
