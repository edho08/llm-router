import { Request, Response } from 'express';
import { AIBackendService } from '../services/AIBackendService';
import { RoutingService } from '../services/routing/RoutingService';
import { AppDataSource } from '../database';
import { AIProvider } from '../entities/AIProvider';

export class AIBackendController {
  private service = new AIBackendService();
  private routingService = new RoutingService();

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

  async test(req: Request, res: Response) {
    try {
      const providerId = parseInt(req.params.id as string);
      const backendId = parseInt(req.params.backendId as string);

      const backend = await this.service.getBackendById(backendId);
      if (!backend) return res.status(404).json({ error: 'Backend model not found' });

      const provider = await AppDataSource.getRepository(AIProvider).findOne({
        where: { id: providerId },
      });
      if (!provider) return res.status(404).json({ error: 'Provider not found' });

      const target = await this.routingService.resolveTarget(`free-router-model:${provider.label}:${backend.modelName}`);

      const response = await fetch(`${target.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${target.apiKey}`,
        },
        body: JSON.stringify({
          model: target.modelName,
          messages: [{ role: 'user', content: 'hello' }],
        }),
      });

      const data = await response.text();
      let parsedData;
      try {
        parsedData = JSON.parse(data);
      } catch {
        parsedData = data;
      }

      if (!response.ok) {
        return res.status(response.status).json({
          status: 'error',
          code: response.status,
          data: parsedData,
        });
      }

      res.json({
        status: 'success',
        data: parsedData,
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }
}
