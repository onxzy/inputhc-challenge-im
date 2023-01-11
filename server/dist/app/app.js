"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// EXPRESS
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
// MODULES
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const helmet_1 = __importDefault(require("helmet"));
const body_parser_1 = __importDefault(require("body-parser"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
// SECURITE
app.use((0, helmet_1.default)());
// MIDLEWARES
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
// IMPORTS
const errorMsg_1 = __importDefault(require("./config/errorMsg"));
const struct_to_route_1 = require("./utils/struct-to-route");
// INITS
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || 'session-secret',
    resave: false,
    saveUninitialized: false,
    // cookie: {secure: true},
}));
require('./middlewares/passport');
app.use(passport_1.default.session());
const swaggerDocument = require('../swagger.json');
app.use('/doc', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
// ROUTES
(0, struct_to_route_1.initRoutes)(app, 'routes');
app.use('/', (req, res) => res.status(404).send());
app.use((err, req, res, next) => {
    console.error(err);
    if (err instanceof SyntaxError) {
        res.status(400).json({ err: errorMsg_1.default.body_parser_invalid_syntax });
    }
    else {
        console.error(err);
        if (process.env.NODE_ENV == 'production')
            res.sendStatus(500);
        else
            res.status(500).send(err.message);
    }
});
// EXPORTS
exports.default = app;
