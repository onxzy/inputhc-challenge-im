// EXPRESS
import { Router } from 'express';
import handleError = require('express-async-handler');
const router = Router();

// MODULES
import { body, param, query } from 'express-validator';
import prisma from '../../modules/prisma';

// IMPORTS
import { validation, diseaseValidation, bookingValidation, surgeryValidation } from '../../middlewares/validation';

import { spawn } from 'child_process';


router.post('/ask',
  // #swagger.tags = ['Booking']
  // #swagger.path = '/booking/ask'
  // #swagger.description = 'Insert the reservation at the most optimal time'

  bookingValidation.name(body('firstName')).optional(),
  bookingValidation.name(body('lastName')).optional(),
  bookingValidation.email(body('email')).optional(),
  diseaseValidation.name(body('disease')),
  body('real_nights').isInt({min: 0, max: 999}).optional(),
  body('acte').isString().isLength({min:6, max:8}),
  validation,

  (req, res, next) => {
    // Lancer l'analyse
    const date_end = new Date(req.body.date_start);
    date_end.setDate(date_end.getDate() + parseInt(req.body.max_days) - 1);

    let stdout = '';
    let stderr = '';
    const script = spawn(
      `python3`,
      [`${__dirname}/../../../../scripts/main.py`, req.body.age, req.body.sex, req.body.disease, req.body.acte, req.body.date_start, date_end.toISOString().split('T')[0], req.body.max_days],
      {cwd: `${__dirname}/../../../../scripts/`})

    script.on('error', (err) => {
      console.log('error')
      console.error(err.toString())
      res.status(500).json(err.toString()) 
    });

    script.stdout.on('data', (data) => {
      console.log('stdout')
      console.log(data.toString())
      stdout += data.toString(); 
    });

    script.stderr.on('data', (msg) => {
      console.log('stderr')
      console.error(msg.toString())
      stderr += msg.toString();
    });

    script.on('close', async () => {
      if (stderr) return res.status(500).send(stderr);
      if (!stdout) return res.status(500).send();

      const scriptReturn = JSON.parse(stdout);
      console.log(scriptReturn);

      if (scriptReturn.err) return res.status(500).json(scriptReturn);

      const date_night = new Date(req.body.date_start);
      date_night.setDate(date_night.getDate() + scriptReturn.booking);
      const date_op = new Date(date_night);
      date_op.setDate(date_op.getDate() + 1);

      try {
        const surgery = await prisma.surgery.findUnique({where: {
          date_diseaseName : {
            date: date_op,
            diseaseName:  String(req.body.disease),
          }
        }}); 
  
        if (!surgery) return res.status(500).json({
          err: 'no surgery',
          date_night, date_op, nights_plan: scriptReturn.nights,
        })
  
        const booking = await prisma.booking.create({
          data: {
            date_night,
            date_op,
            nights_plan: scriptReturn.nights,
            nigths_real: req.body.real_nights ? req.body.real_nights : null,
            surgery: {
              connect: {id: surgery.id}
            }
          },
          include: {
            surgery: true
          }
        });
        return res.json(booking);

      } catch (error) {
        return next(error)
      }
    })

    // Indiquer quand ça a été placé
  })

router.post('/new',
  // #swagger.tags = ['Booking']
  // #swagger.path = '/booking/new'

  bookingValidation.name(body('firstName')),
  bookingValidation.name(body('lastName')),
  bookingValidation.email(body('email')),
  bookingValidation.date(body('date_night')),
  bookingValidation.date(body('date_op')),
  bookingValidation.nights(body('nights_plan')),
  surgeryValidation.id(body('surgery')),
  validation,

  async (req, res, next) => {
    try {
      const booking = await prisma.booking.create({
        data: {
          firstName: String(req.body.firstName),
          lastName: String(req.body.lastName),
          email: String(req.body.email),
          date_night: new Date(req.body.date_night),
          date_op: new Date(req.body.date_op),
          nights_plan: parseInt(req.body.nights_plan),
          surgery: {
            connect: {id: req.body.surgery}
          }
        },
        include: {
          surgery: true
        }
      });
      return res.json(booking);
    } catch (error: any) {
      if (error.code == 'P2002') return res.sendStatus(409);
      return next(error);
    }
  });

router.get('/id/:id',
  // #swagger.tags = ['Booking']
  // #swagger.path = '/booking/id/{id}'

  bookingValidation.id(param('id')),
  validation,

  handleError(async (req, res, next) => {
      const booking = await prisma.booking.findUnique({where: {id: req.params.id}});
      if (!booking) return void res.sendStatus(404);
      return void res.json(booking);
  }));

router.get('/find',
  // #swagger.tags = ['Booking']
  // #swagger.path = '/booking/find'
  // #swagger.parameters['firstName'] = {type: 'string'}
  // #swagger.parameters['lastName'] = {type: 'string'}
  // #swagger.parameters['email'] = {type: 'string'}
  // #swagger.parameters['date_start'] = {type: 'string', description: 'yyyy-mm-dd'}
  // #swagger.parameters['date_end'] = {type: 'string', description: 'yyyy-mm-dd'}
  // #swagger.parameters['surgery'] = {type: 'int'}

  bookingValidation.name(query('firstName')).optional(), 
  bookingValidation.name(query('lastName')).optional(),
  bookingValidation.email(query('email')).optional(),
  bookingValidation.date(query('date_start')).optional(),
  bookingValidation.date(query('date_end')).optional(),
  surgeryValidation.id(query('surgery')).optional(),
  validation,

  async (req, res, next) => {
    try {
      const bookings = await prisma.booking.findMany({where: {
        firstName: req.query.firstName ? String(req.query.firstName) : undefined,
        lastName: req.query.lastName ? String(req.query.lastName) : undefined,
        email: req.query.email ? String(req.query.email) : undefined,
        surgeryId: req.query.surgeryId ? parseInt(String(req.query.surgery)) : undefined,
        date_op: {
          lte: req.query.date_end ? new Date(String(req.query.date_end)) : undefined,
          gte: req.query.date_start ? new Date(String(req.query.date_start)) : undefined,
        },
      }});
      return res.json(bookings);  
    } catch (error) {
      next(error)
    }  
  });

router.patch('/id/:id',
  // #swagger.tags = ['Booking']
  // #swagger.path = '/booking/id/{id}'

  bookingValidation.id(param('id')),
  bookingValidation.date(body('date_night')),
  bookingValidation.date(body('date_op')),
  validation,

  async (req, res, next) => {
    try {
      const night = await prisma.booking.update({
        where: {id: String(req.params.id)},
        data: {
          date_night: new Date(req.body.date_night),
          date_op: new Date(req.body.date_op)
        }});
      return res.json(night);
    } catch (error: any) {
      if (error.code == 'P2025') return res.sendStatus(404);
      return next(error);
    }
  });

router.delete('/id/:id',
  // #swagger.tags = ['Booking']
  // #swagger.path = '/booking/id/{id}'

  bookingValidation.id(param('id')),
  validation,

  async (req, res, next) => {
    try {
      const booking = await prisma.booking.delete({where: {id: req.params.id}});
      return res.send();

    } catch (error: any) { 
      if (error.code == 'P2025') return res.sendStatus(404);
      return next(error);
    }
  });

router.delete('/all',
  // #swagger.tags = ['Booking']
  // #swagger.path = '/booking/all'

  async (req, res, next) => {
    try {
      const booking = await prisma.booking.deleteMany({});
      return res.send();

    } catch (error: any) { 
      if (error.code == 'P2025') return res.sendStatus(404);
      return next(error);
    }
  })

export default router;
