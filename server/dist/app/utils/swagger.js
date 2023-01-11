"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({
    path: `${__dirname}/../../../.env`
});
const swagger_autogen_1 = __importDefault(require("swagger-autogen"));
const doc = {
    info: {
        version: '0.1',
        title: 'Express BP',
        description: 'Boilerplate for Node.js Backend',
    },
    host: process.env.API_URL ? process.env.API_URL.replace('https://', '').replace('http://', '') : 'localhost:5000',
    basePath: process.env.API_PATH ? process.env.API_PATH : '/api/',
    schemes: ['https'], // by default: ['http']
    // consumes: [],  // by default: ['application/json']
    // produces: [],  // by default: ['application/json']
    // tags: [        // by default: empty Array
    //   {
    //     name: '',         // Tag name
    //     description: '',  // Tag description
    //   },
    //   // { ... }
    // ],
    // securityDefinitions: {},  // by default: empty object
    // definitions: {},          // by default: empty object (Swagger 2.0)
    // components: {}            // by default: empty object (OpenAPI 3.x)
};
const outputFile = `${__dirname}/../../../dist/swagger.json`;
const endpointsFiles = [
    // `${__dirname}/../routes/api/auth.js`, `${__dirname}/../routes/api/user.js`, `${__dirname}/../routes/api.js`,
    `${__dirname}/../routes/api/disease.js`, `${__dirname}/../routes/api/night.js`, `${__dirname}/../routes/api/surgery.js`,
    `${__dirname}/../routes/api/booking.js`
];
/* NOTE: if you use the express Router, you must pass in the
   'endpointsFiles' only the root file where the route starts,
   such as: index.js, app.js, routes.js, ... */
(0, swagger_autogen_1.default)()(outputFile, endpointsFiles, doc);
