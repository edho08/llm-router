import { AppDataSource } from '../../database';
import { AIProvider } from '../../entities/AIProvider';
import { AIProviderAPIKey } from '../../entities/AIProviderAPIKey';
import { AIBackend } from '../../entities/AIBackend';
import { weightedRandom } from '../../utils/weightedRandom';

export interface TargetConfig {
  baseUrl: string;
  apiKey: string;
  apiKeyLabel: string;
  modelName: string;
}

export class RoutingService {
  async resolveTarget(): Promise<TargetConfig> {
    const providerRepo = AppDataSource.getRepository(AIProvider);
    const providers = await providerRepo.find();
    
    const provider = weightedRandom(providers);
    if (!provider) throw new Error('No enabled AI providers found');

    const apiKeyRepo = AppDataSource.getRepository(AIProviderAPIKey);
    const keys = await apiKeyRepo.find({ where: { provider: { id: provider.id } } });
    
    const apiKey = weightedRandom(keys);
    if (!apiKey) throw new Error(`No enabled API keys found for provider ${provider.label}`);

    const backendRepo = AppDataSource.getRepository(AIBackend);
    const backends = await backendRepo.find({ where: { provider: { id: provider.id } } });
    
    const backend = weightedRandom(backends);
    if (!backend) throw new Error(`No enabled backend models found for provider ${provider.label}`);

    return {
      baseUrl: provider.baseUrl,
      apiKey: apiKey.apiKey,
      apiKeyLabel: apiKey.label,
      modelName: backend.modelName,
    };
  }
}
