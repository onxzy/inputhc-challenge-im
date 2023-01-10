import { Router } from 'express';
const router = Router();

router.get('/', (_, res) => {
  // #swagger.tags = ['Default']
  // #swagger.path = '/api/hello'

  res.send('Hello world !');
});

export default router;
