// EXPRESS
import express, { NextFunction, Request, Response } from 'express';
const app = express();

// MODULES
import { config as dotenv } from 'dotenv';
dotenv();
import helmet from 'helmet';
import bodyParser from 'body-parser';
import session from 'express-session';
import passport from 'passport';
import swaggerUi from 'swagger-ui-express';

// SECURITE
app.use(helmet());

// MIDLEWARES
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// IMPORTS
import errorMsg from './config/errorMsg';
import {initRoutes} from './utils/struct-to-route';

// INITS
app.use(session({
  secret: process.env.SESSION_SECRET || 'session-secret',
  resave: false,
  saveUninitialized: false,
  // cookie: {secure: true},
}));
require('./middlewares/passport');
app.use(passport.session());

const swaggerDocument = require('../swagger.json');
app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ROUTES
initRoutes(app, 'routes');
app.use('/', (req, res) => res.status(404).send());
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  if (err instanceof SyntaxError) {
    res.status(400).json({err: errorMsg.body_parser_invalid_syntax});
  } else {
    console.error(err);
    if (process.env.NODE_ENV == 'production') res.sendStatus(500);
    else res.status(500).send(err.message);
  }
});

// EXPORTS
export default app;
