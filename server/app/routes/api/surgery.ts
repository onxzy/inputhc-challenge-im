// EXPRESS
import { Router } from 'express';
import handleError = require('express-async-handler');
const router = Router();

// MODULES
import { body, param, query } from 'express-validator';
import prisma from '../../modules/prisma';

// IMPORTS
import { validation, authValidation, diseaseValidation, nightValidation, surgeryValidation } from '../../middlewares/validation';
import { authNZ } from '../../middlewares/passport';

import { patchUser, newUser } from '../../services/auth';
import { Provider, Role } from '@prisma/client';
import { AuthPermissions } from '../../config/authPermissions';
import errorMsg from '../../config/errorMsg';


router.post('/new',
  // #swagger.tags = ['Surgery']
  // #swagger.path = '/surgery/new'

  surgeryValidation.date(body('date')),
  surgeryValidation.capacity(body('capacity')),
  diseaseValidation.id(body('disease')),
  validation,

  async (req, res, next) => {
    try {
      const surgery = await prisma.surgery.create({
        data: {
          date: new Date(req.body.date),
          capacity: parseInt(req.body.capacity),
          disease: {
            connect: {id: req.body.disease}
          }
        },
        include: {
          disease: true,
        }
      })
      return res.json(surgery);
    } catch (error: any) {
      if (error.code == 'P2002') return res.sendStatus(409);
      return next(error);
    }
  });

router.get('/id/:id',
  // #swagger.tags = ['Surgery']
  // #swagger.path = '/surgery/id/{id}'

  surgeryValidation.id(param('id')),
  validation,

  handleError(async (req, res, next) => {
      const surgery = await prisma.surgery.findUnique({where: {id: parseInt(req.params.id)}});
      if (!surgery) return void res.sendStatus(404);
      return void res.json(surgery);
  }));

router.get('/find',
  // #swagger.tags = ['Surgery']
  // #swagger.path = '/surgery/find'
  // #swagger.parameters['date_start'] = {required: true }
  // #swagger.parameters['date_end'] = {required: true } 

  surgeryValidation.date(query('date_start')).optional(),
  surgeryValidation.date(query('date_end')).optional(),
  validation,

  async (req, res, next) => {
    try {
      const surgeries = await prisma.surgery.findMany({where: {
        date: {
          lte: req.query.date_end ? new Date(String(req.query.date_end)) : undefined,
          gte: req.query.date_start ? new Date(String(req.query.date_start)) : undefined,
        },
      }});
      return res.json(surgeries);  
    } catch (error) {
      next(error)
    }  
  });

router.patch('/id/:id',
  // #swagger.tags = ['Surgery']
  // #swagger.path = '/surgery/id/{id}'

  surgeryValidation.id(param('id')),
  surgeryValidation.capacity(body('capacity')),
  diseaseValidation.id(body('disease')),
  validation,

  async (req, res, next) => {
    try {
      const disease = await prisma.disease.findUnique({where: {id: req.params.id}});
      if (!disease) return void res.status(404).json({err: errorMsg.disease.unknown});

      const surgery = await prisma.surgery.update({
        where: {id: parseInt(req.params.id)},
        data: {
          capacity: parseInt(req.body.capacity),
          disease: {
            connect: {id: req.body.disease}
          }
        }});
      return res.json(surgery);
    } catch (error: any) {
      if (error.code == 'P2025') return res.sendStatus(404);
      return next(error);
    }
  });

router.delete('/id/:id',
  // #swagger.tags = ['Surgery']
  // #swagger.path = '/surgery/id/{id}'

  surgeryValidation.id(param('id')),
  validation,

  async (req, res, next) => {
    try {
      const surgery = await prisma.surgery.delete({where: {id: parseInt(req.params.id)}});
      return res.send();

    } catch (error: any) { 
      if (error.code == 'P2025') return res.sendStatus(404);
      return next(error);
    }
  });

router.get('/available',
  // #swagger.tags = ['Surgery']
  // #swagger.path = '/surgery/available'
  // #swagger.parameters['date_start'] = {required: true, type: 'string', description: 'yyyy-mm-dd'}
  // #swagger.parameters['date_end'] = {required: true, type: 'string', description: 'yyyy-mm-dd'}

  surgeryValidation.date(query('date_start')),
  surgeryValidation.date(query('date_end')),
  diseaseValidation.id(query('disease')),
  validation,

  async (req, res, next) => {
    try {
      const surgery = await prisma.surgery.findMany({where: {
        diseaseId: String(req.query.disease),
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

        surgery.forEach((s) => {
          if (date_night_min <= s.date && s.date <= date_night_max) {
            s.capacity -= 1;
          }
        })
      })

      const availability: number[] = [];

      let nb_of_days = 0;
      for (var d = new Date(String(req.query.date_start)); d <= new Date(String(req.query.date_end)); d.setDate(d.getDate() + 1)) {
        let nightAtDate = false; 
        for (let i = 0; i < surgery.length; i++) {
          const s = surgery[i];
          if (s.date.getTime() == d.getTime()) {
            availability.push(s.capacity);
            nightAtDate = true;
            break;
          }
        }

        if (!nightAtDate) availability.push(0);
        nb_of_days++;
      }

      console.log(availability.length);
      console.log(nb_of_days);
      res.json(availability);
    } catch (error) {
      next(error);
    }
  })

export default router;
