import { Request, Response } from 'express';
import { AIBackendService } from '../services/AIBackendService';

export class AIBackendController {
  private service = new AIBackendService();

  async getByProvider(req: Request, res: Response) {
    try {
      const backends = await this.service.getBackendsByProvider(parseInt(req.params.id as string));
      res.json(backends);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const backend = await this.service.createBackend(parseInt(req.params.id as string), req.body);
      res.status(201).json(backend);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const backend = await this.service.updateBackend(parseInt(req.params.backendId as string), req.body);
      res.json(backend);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await this.service.deleteBackend(parseInt(req.params.backendId as string));
      res.status(204).send();
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  }
}
