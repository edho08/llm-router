import { AIBackendRepository } from '../repositories/AIBackendRepository';
import { AIBackend } from '../entities/AIBackend';
import { AIProvider } from '../entities/AIProvider';
import { AppDataSource } from '../database';

export class AIBackendService {
  private repo = new AIBackendRepository();

  async getBackendsByProvider(providerId: number) {
    return this.repo.findByProvider(providerId);
  }

  async getBackendById(id: number) {
    const backend = await this.repo.findById(id);
    if (!backend) throw new Error('Backend model not found');
    return backend;
  }

  async createBackend(providerId: number, data: Partial<AIBackend>) {
    const provider = await AppDataSource.getRepository(AIProvider).findOneBy({ id: providerId });
    if (!provider) throw new Error('Provider not found');
    return this.repo.create({ ...data, provider });
  }

  async updateBackend(id: number, data: Partial<AIBackend>) {
    return this.repo.update(id, data);
  }

  async deleteBackend(id: number) {
    return this.repo.delete(id);
  }
}
