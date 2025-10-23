import { Router } from 'express';
import {
  getUsers, getUserById, getCurrentUser, updateUser, updateAvatar,
} from '../controllers/users';
import {
  validateUserId, validateUpdateUser, validateUpdateAvatar,
} from '../middlewares/validation';

const router = Router();

router.get('/', getUsers);
router.get('/me', getCurrentUser);
router.get('/:userId', validateUserId, getUserById);
router.patch('/me', validateUpdateUser, updateUser);
router.patch('/me/avatar', validateUpdateAvatar, updateAvatar);

export default router;
