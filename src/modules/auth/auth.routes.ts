import { Router } from 'express';
import { signup, signin, refreshToken, signout } from './auth.controller';

const router = Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/refresh', refreshToken);
router.post('/signout', signout);

export default router;
