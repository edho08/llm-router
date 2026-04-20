import { Request, Response } from 'express';
import { AIProviderAPIKeyService } from '../services/AIProviderAPIKeyService';

export class AIProviderAPIKeyController {
  private service = new AIProviderAPIKeyService();

  async getByProvider(req: Request, res: Response) {
    try {
      const keys = await this.service.getKeysByProvider(parseInt(req.params.id as string));
      res.json(keys);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const key = await this.service.createKey(parseInt(req.params.id as string), req.body);
      res.status(201).json(key);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const key = await this.service.updateKey(parseInt(req.params.keyId as string), req.body);
      res.json(key);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await this.service.deleteKey(parseInt(req.params.keyId as string));
      res.status(204).send();
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  }
}
