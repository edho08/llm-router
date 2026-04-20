import { AppDataSource } from '../database';
import { AIProvider } from '../entities/AIProvider';

export class AIProviderRepository {
  private repo = AppDataSource.getRepository(AIProvider);

  async findAll() {
    return this.repo.find({ relations: ['apiKeys', 'backends'] });
  }

  async findById(id: number) {
    return this.repo.findOne({ where: { id }, relations: ['apiKeys', 'backends'] });
  }

  async create(data: Partial<AIProvider>) {
    const provider = this.repo.create(data);
    return this.repo.save(provider);
  }

  async update(id: number, data: Partial<AIProvider>) {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async delete(id: number) {
    return this.repo.delete(id);
  }
}
