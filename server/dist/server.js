"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_js_1 = __importDefault(require("./app/app.js"));
const httpServer = http_1.default.createServer(app_js_1.default);
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.info(`Serveur started using port ${PORT}`);
});
