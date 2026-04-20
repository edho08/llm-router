import { AppDataSource } from '../database';
import { AIBackend } from '../entities/AIBackend';

export class AIBackendRepository {
  private repo = AppDataSource.getRepository(AIBackend);

  async findByProvider(providerId: number) {
    return this.repo.find({ where: { provider: { id: providerId } } });
  }

  async findById(id: number) {
    return this.repo.findOne({ where: { id }, relations: ['provider'] });
  }

  async create(data: Partial<AIBackend>) {
    const backend = this.repo.create(data);
    return this.repo.save(backend);
  }

  async update(id: number, data: Partial<AIBackend>) {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async delete(id: number) {
    return this.repo.delete(id);
  }
}
