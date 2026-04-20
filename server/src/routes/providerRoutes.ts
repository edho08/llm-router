import { Router } from 'express';
import { AIProviderController } from '../controllers/AIProviderController';
import { AIProviderAPIKeyController } from '../controllers/AIProviderAPIKeyController';
import { AIBackendController } from '../controllers/AIBackendController';

const router = Router();
const providerCtrl = new AIProviderController();
const keyCtrl = new AIProviderAPIKeyController();
const backendCtrl = new AIBackendController();

// Providers
router.get('/providers', (req, res) => providerCtrl.getAll(req, res));
router.get('/providers/:id', (req, res) => providerCtrl.getById(req, res));
router.post('/providers', (req, res) => providerCtrl.create(req, res));
router.put('/providers/:id', (req, res) => providerCtrl.update(req, res));
router.delete('/providers/:id', (req, res) => providerCtrl.delete(req, res));
router.post('/providers/:id/test', (req, res) => providerCtrl.test(req, res));

// API Keys
router.get('/providers/:id/keys', (req, res) => keyCtrl.getByProvider(req, res));
router.post('/providers/:id/keys', (req, res) => keyCtrl.create(req, res));
router.put('/providers/:id/keys/:keyId', (req, res) => keyCtrl.update(req, res));
router.delete('/providers/:id/keys/:keyId', (req, res) => keyCtrl.delete(req, res));

// Backends
router.get('/providers/:id/backends', (req, res) => backendCtrl.getByProvider(req, res));
router.post('/providers/:id/backends', (req, res) => backendCtrl.create(req, res));
router.put('/providers/:id/backends/:backendId', (req, res) => backendCtrl.update(req, res));
router.delete('/providers/:id/backends/:backendId', (req, res) => backendCtrl.delete(req, res));
router.post('/providers/:id/backends/:backendId/test', (req, res) => backendCtrl.test(req, res));

export default router;
