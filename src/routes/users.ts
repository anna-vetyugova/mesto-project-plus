import { Router } from 'express';
import {
  getUsers,
  getUserById,
  updateUserProfile,
  updateUserAvatar,
  getUserCurrent,
} from '../controllers/users';

const router = Router();

router.get('/users', getUsers);
router.get('/users/me', getUserCurrent);
router.get('/users/:userId', getUserById);

router.patch('/users/me', updateUserProfile);
router.patch('/users/me/avatar', updateUserAvatar);

export default router;
