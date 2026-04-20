import { Request, Response } from 'express';
import { AIProviderService } from '../services/AIProviderService';
import { RoutingService } from '../services/routing/RoutingService';

export class AIProviderController {
  private service = new AIProviderService();
  private routingService = new RoutingService();

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

  async test(req: Request, res: Response) {
    try {
      const providerId = parseInt(req.params.id as string);
      const provider = await this.service.getProviderById(providerId);

      const target = await this.routingService.resolveTarget(`free-router-model:${provider.label}`);

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
          data: parsedData
        });
      }

      res.json({
        status: 'success',
        data: parsedData
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }
}
