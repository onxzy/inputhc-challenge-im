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
        data: {date: new Date(req.body.date), capacity: parseInt(req.body.capacity)}
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
          lte: req.query.date_end ? new Date(String(req.query.date_end)) : undefined,
          gte: req.query.date_start ? new Date(String(req.query.date_start)) : undefined,
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

router.get('/available',
  // #swagger.tags = ['Night']
  // #swagger.path = '/night/available'
  // #swagger.parameters['date_start'] = {required: true, type: 'string', description: 'yyyy-mm-dd'}
  // #swagger.parameters['date_end'] = {required: true, type: 'string', description: 'yyyy-mm-dd'}

  nightValidation.date(query('date_start')),
  nightValidation.date(query('date_end')),
  validation,

  async (req, res, next) => {
    try {
      const nights = await prisma.night.findMany({where: {
        date: {
          lte: req.query.date_end ? new Date(String(req.query.date_end)) : undefined,
          gte: req.query.date_start ? new Date(String(req.query.date_start)) : undefined,
        },
      }});

      const bookings = await prisma.booking.findMany({where: {
        date_op: {
          lte: req.query.date_end ? new Date(String(req.query.date_end)) : undefined,
          gte: req.query.date_start ? new Date(String(req.query.date_start)) : undefined,
        },
      }});

      bookings.forEach((book) => {
        const nights_count = book.nigths_real ? book.nigths_real : book.nights_plan;
        const date_night_min = book.date_night;
        const date_night_max = new Date(book.date_night);
        date_night_max.setDate(date_night_max.getDate() + nights_count - 1);

        nights.forEach((n) => {
          if (date_night_min <= n.date && n.date <= date_night_max) {
            n.capacity -= 1;
          }
        })
      })

      const availability: number[] = [];

      let nb_of_days = 0;
      for (var d = new Date(String(req.query.date_start)); d <= new Date(String(req.query.date_end)); d.setDate(d.getDate() + 1)) {
        let nightAtDate = false; 
        for (let i = 0; i < nights.length; i++) {
          const n = nights[i];
          if (n.date.getTime() == d.getTime()) {
            availability.push(n.capacity);
            nightAtDate = true;
            break;
          }
        }

        if (!nightAtDate) availability.push(0);
        nb_of_days++;
      }

      res.json(availability);
    } catch (error) {
      next(error);
    }
  })

export default router;
