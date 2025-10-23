import { Router } from 'express';
import userRoutes from './userRoutes';
import cardRoutes from './cardRoutes';

const router = Router();

router.use('/users', userRoutes);
router.use('/cards', cardRoutes);

export default router;
