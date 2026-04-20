import { AIProviderAPIKeyRepository } from '../repositories/AIProviderAPIKeyRepository';
import { AIProviderAPIKey } from '../entities/AIProviderAPIKey';
import { AIProvider } from '../entities/AIProvider';
import { AppDataSource } from '../database';

export class AIProviderAPIKeyService {
  private repo = new AIProviderAPIKeyRepository();

  async getKeysByProvider(providerId: number) {
    return this.repo.findByProvider(providerId);
  }

  async getKeyById(id: number) {
    const key = await this.repo.findById(id);
    if (!key) throw new Error('API Key not found');
    return key;
  }

  async createKey(providerId: number, data: Partial<AIProviderAPIKey>) {
    const provider = await AppDataSource.getRepository(AIProvider).findOneBy({ id: providerId });
    if (!provider) throw new Error('Provider not found');
    return this.repo.create({ ...data, provider });
  }

  async updateKey(id: number, data: Partial<AIProviderAPIKey>) {
    return this.repo.update(id, data);
  }

  async deleteKey(id: number) {
    return this.repo.delete(id);
  }
}
