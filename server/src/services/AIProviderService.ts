import { AIProviderRepository } from '../repositories/AIProviderRepository';
import { AIProvider } from '../entities/AIProvider';

export class AIProviderService {
  private repo = new AIProviderRepository();

  async getAllProviders() {
    return this.repo.findAll();
  }

  async getProviderById(id: number) {
    const provider = await this.repo.findById(id);
    if (!provider) throw new Error('Provider not found');
    return provider;
  }

  async createProvider(data: Partial<AIProvider>) {
    return this.repo.create(data);
  }

  async updateProvider(id: number, data: Partial<AIProvider>) {
    return this.repo.update(id, data);
  }

  async deleteProvider(id: number) {
    return this.repo.delete(id);
  }
}
