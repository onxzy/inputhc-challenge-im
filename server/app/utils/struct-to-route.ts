import fs from 'fs';
import { Express } from 'express';

function getFileList(startdir: string, dir = '') {
  let files: string[] = [];
  const items = (dir)
      ? fs.readdirSync(`${__dirname}/../${startdir}${dir}`, {withFileTypes: true})
      : fs.readdirSync(`${__dirname}/../${startdir}`, {withFileTypes: true});

  for (const item of items) {
    if (item.isDirectory()) {
      files = [...files, ...getFileList(startdir, `${dir}/${item.name}`)];
    } else {
      files.push(`${dir}/${item.name}`);
    }
  }

  return files
      .map((f) => {
        return f.replace(/\.[^/.]+$/, '');
      });
}

export function initRoutes(app: Express, routesDir: string) {
  const files = getFileList(routesDir);
  files.forEach((f) => {
    app.use(f, require(`../${routesDir}${f}`).default);
  });
};
