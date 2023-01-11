"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
const errorMsg_1 = __importDefault(require("../config/errorMsg"));
router.get('/get_error_msg', (_, res) => {
    // #swagger.tags = ['Config']
    // #swagger.path = '/get_error_msg'
    res.json(errorMsg_1.default);
});
exports.default = router;
