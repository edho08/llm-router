import { AppDataSource } from '../database';
import { AIProviderAPIKey } from '../entities/AIProviderAPIKey';

export class AIProviderAPIKeyRepository {
  private repo = AppDataSource.getRepository(AIProviderAPIKey);

  async findByProvider(providerId: number) {
    return this.repo.find({ where: { provider: { id: providerId } } });
  }

  async findById(id: number) {
    return this.repo.findOne({ where: { id }, relations: ['provider'] });
  }

  async create(data: Partial<AIProviderAPIKey>) {
    const apiKey = this.repo.create(data);
    return this.repo.save(apiKey);
  }

  async update(id: number, data: Partial<AIProviderAPIKey>) {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async delete(id: number) {
    return this.repo.delete(id);
  }
}
