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
  // #swagger.parameters['date_start'] = {description: 'yyyy-mm-dd' }
  // #swagger.parameters['date_end'] = {description: 'yyyy-mm-dd' }
  // #swagger.parameters['simple_array'] = {description: 'default = false' }

  nightValidation.date(query('date_start')).optional(),
  nightValidation.date(query('date_end')).optional(),
  validation,

  async (req, res, next) => {
    try {
      const nights = await prisma.night.findMany({
        where: {
          date: {
            lte: req.query.date_end ? new Date(String(req.query.date_end)) : undefined,
            gte: req.query.date_start ? new Date(String(req.query.date_start)) : undefined,
          }
        },
        orderBy: {date: 'asc'}
      });
      if (req.query.simple_array) {
        
        const date_start = req.query.date_start ? new Date(String(req.query.date_start)) : nights[0].date;
        const date_end = req.query.date_end ? new Date(String(req.query.date_end)) : nights[-1].date;
        const days = Math.ceil((date_end.getTime() - date_start.getTime()) / (1000 * 3600 * 24)) + 1;

        const simple_array : number[] = new Array(days).fill(0);

        let i = 0;
        for (var d = new Date(date_start); d <= date_end; d.setDate(d.getDate() + 1)) {

          for (let j = 0; j < nights.length; j++) {
            const n = nights[j];
            if (n.date.getTime() == d.getTime()) {
              simple_array[i] = n.capacity;
              break;
            }
          }
          i++;
        } 
        return res.json(simple_array);
      } else return res.json(nights);  
    } catch (error) {
      return next(error)
    }  
  });

router.patch('/date/:date',
  // #swagger.tags = ['Night']
  // #swagger.path = '/night/date/{date}'

  nightValidation.date(param('date')),
  nightValidation.capacity(body('capacity')),
  validation,

  async (req, res, next) => {
    try {
      const night = await prisma.night.upsert({
        where: {
          date: new Date(req.params.date),
        },
        update: {
          capacity: parseInt(req.body.capacity),
        },
        create : {
          date: new Date(req.params.date),
          capacity: parseInt(req.body.capacity),
        }});
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
          lte: new Date(String(req.query.date_end)),
          gte: new Date(String(req.query.date_start)),
        },
      }});

      const bookings = await prisma.booking.findMany({where: {
        date_op: {
          lte: new Date(String(req.query.date_end)),
          gte: new Date(String(req.query.date_start)),
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
        let nightAtDate = false; // True if there is a Night capacity at that Date
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

      return res.json(availability);
    } catch (error) {
      return next(error);
    }
  })

router.get('/usage/:mode',
  // #swagger.tags = ['Night']
  // #swagger.path = '/night/usage/{mode}'
  // #swagger.parameters['mode'] = {required: true, type: 'string', description: 'plan/real'}
  // #swagger.parameters['date_start'] = {required: true, type: 'string', description: 'yyyy-mm-dd'}
  // #swagger.parameters['date_end'] = {required: true, type: 'string', description: 'yyyy-mm-dd'}

  param('mode').isIn(['plan', 'real']),
  nightValidation.date(query('date_start')),
  nightValidation.date(query('date_end')),
  validation,

  async (req, res, next) => {
    try {
      const date_start = new Date(String(req.query.date_start));
      const date_end = new Date(String(req.query.date_end));

      const bookings = await prisma.booking.findMany({where: {
        date_op: {
          lte: date_end,
          gte: date_start,
        },
      }});

      const days = Math.ceil((date_end.getTime() - date_start.getTime()) / (1000 * 3600 * 24)) + 1;

      const usage : number[] = new Array(days).fill(0);

      bookings.forEach((book) => {
        // If mode == 'plan' --> use nights planned
        // Else use real nights count unless it's null --> use nights planned again
        const nights_count = (req.query.mode == 'plan' || book.nigths_real == null) ? book.nights_plan : book.nigths_real;
        const date_night_min = book.date_night;
        const date_night_max = new Date(book.date_night); 
        date_night_max.setDate(date_night_max.getDate() + nights_count - 1);

        let i = 0;
        for (var d = new Date(String(req.query.date_start)); d <= new Date(String(req.query.date_end)); d.setDate(d.getDate() + 1)) {
          if (d.getTime() == date_night_min.getTime()) {
            for (let j = 0; j < nights_count; j++) {
              usage[i+j] += 1;
            }
            break;
          }
          i++;
        } 
      });
      return res.json(usage);
    } catch (error) {
      return next(error);
    }
  })

export default router;
