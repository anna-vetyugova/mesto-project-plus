import { Router } from 'express';
import { Joi, celebrate } from 'celebrate';
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
router.get('/users/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().length(24).hex().required(),
  }),
}), getUserById);

router.patch('/users/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).required(),
    about: Joi.string().min(2).max(200).required(),
  }),
}), updateUserProfile);
router.patch('/users/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().uri().required(),
  }),
}), updateUserAvatar);

export default router;
