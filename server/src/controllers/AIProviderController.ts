import { Request, Response } from 'express';
import { AIProviderService } from '../services/AIProviderService';

export class AIProviderController {
  private service = new AIProviderService();

  async getAll(req: Request, res: Response) {
    try {
      const providers = await this.service.getAllProviders();
      res.json(providers);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const provider = await this.service.getProviderById(parseInt(req.params.id as string));
      res.json(provider);
    } catch (e: any) {
      res.status(404).json({ error: e.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const provider = await this.service.createProvider(req.body);
      res.status(201).json(provider);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const provider = await this.service.updateProvider(parseInt(req.params.id as string), req.body);
      res.json(provider);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await this.service.deleteProvider(parseInt(req.params.id as string));
      res.status(204).send();
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  }
}
