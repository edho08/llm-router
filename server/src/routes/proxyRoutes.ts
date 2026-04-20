import { Router } from 'express';
import { ProxyController } from '../controllers/proxy/ProxyController';

const router = Router();
const proxyCtrl = new ProxyController();

// Catch-all for everything under /v1
router.use((req, res, next) => proxyCtrl.handleProxy(req, res));

export default router;
