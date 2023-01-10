import { Router } from 'express';
const router = Router();
import errorMsg from '../config/errorMsg';

router.get('/get_error_msg', (_, res) => {
  // #swagger.tags = ['Config']
  // #swagger.path = '/get_error_msg'

  res.json(errorMsg);
});

export default router;
