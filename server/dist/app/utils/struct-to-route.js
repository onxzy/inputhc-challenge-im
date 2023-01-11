"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initRoutes = void 0;
const fs_1 = __importDefault(require("fs"));
function getFileList(startdir, dir = '') {
    let files = [];
    const items = (dir)
        ? fs_1.default.readdirSync(`app/${startdir}${dir}`, { withFileTypes: true })
        : fs_1.default.readdirSync(`app/${startdir}`, { withFileTypes: true });
    for (const item of items) {
        if (item.isDirectory()) {
            files = [...files, ...getFileList(startdir, `${dir}/${item.name}`)];
        }
        else {
            files.push(`${dir}/${item.name}`);
        }
    }
    return files
        .map((f) => {
        return f.replace(/\.[^/.]+$/, '');
    });
}
function initRoutes(app, routesDir) {
    const files = getFileList(routesDir);
    files.forEach((f) => {
        app.use(f, require(`../${routesDir}${f}`).default);
    });
}
exports.initRoutes = initRoutes;
;
