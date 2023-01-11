"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/', (_, res) => {
    // #swagger.tags = ['Default']
    // #swagger.path = '/api/hello'
    res.send('Hello world !');
});
exports.default = router;
