import {Router} from 'express';
const router = Router();

import * as transformationController from '../controllers/hootsuite-controller';
// import authenticationMiddleware from '../middlewares/authentication';


// api/hootsuite/
router.get('/openOauth', transformationController.getOauth);
router.get('/callback', transformationController.callback);
router.get('/token', transformationController.getToken);
router.get('/tokenRefresh', transformationController.refreshToken);
router.get('/me', transformationController.getUser);
router.get('/socialProfiles', transformationController.getSocials);


export default router;
