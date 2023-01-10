import http from 'http';
import app from './app/app.js';

const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.info(`Serveur started using port ${PORT}`);
});
