import { Router } from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUserProfile,
  updateUserAvatar,
  login,
  getCurrentUser
} from '../controllers/users';

const router = Router();

router.get('/users', getUsers);
router.get('/users/:userId', getUserById);
// router.post('/users', createUser);
router.patch('/users/me', updateUserProfile);
router.patch('/users/me/avatar', updateUserAvatar);
router.post('/signin', login);
router.post('/signup', createUser);
router.get('/users/me', getCurrentUser);

export default router;
