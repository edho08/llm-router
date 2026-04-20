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
  async resolveTarget(modelOverride?: string): Promise<TargetConfig> {
    const providerRepo = AppDataSource.getRepository(AIProvider);
    const apiKeyRepo = AppDataSource.getRepository(AIProviderAPIKey);
    const backendRepo = AppDataSource.getRepository(AIBackend);

    let provider: AIProvider | null = null;
    let backend: AIBackend | null = null;

    if (modelOverride) {
      const parts = modelOverride.split(':');
      if (parts[0] !== 'free-router-model') {
        throw new Error('Invalid model format. Must start with "free-router-model"');
      }

      if (parts.length === 2) {
        // free-router-model:provider_name
        const providerName = parts[1];
        provider = await providerRepo.findOne({ where: { label: providerName, isEnabled: true } });
        if (!provider) throw new Error(`Provider not found: ${providerName}`);
      } else if (parts.length === 3) {
        // free-router-model:provider_name:model_name
        const providerName = parts[1];
        const modelName = parts[2];
        provider = await providerRepo.findOne({ where: { label: providerName, isEnabled: true } });
        if (!provider) throw new Error(`Provider not found: ${providerName}`);

        backend = await backendRepo.findOne({
          where: {
            provider: { id: provider.id },
            modelName: modelName,
            isEnabled: true,
          },
        });
        if (!backend) throw new Error(`Model not found: ${modelName} for provider ${providerName}`);
      } else if (parts.length === 1) {
        // free-router-model
        // do nothing, fall through to weighted selection
      } else {
        throw new Error('Invalid model format. Too many segments');
      }
    }

    // If provider wasn't explicitly selected, use weighted selection
    if (!provider) {
      const providers = await providerRepo.find({ where: { isEnabled: true } });
      provider = weightedRandom(providers);
      if (!provider) throw new Error('No enabled AI providers found');
    }

    // Select API Key (always weighted within the chosen provider)
    const keys = await apiKeyRepo.find({ where: { provider: { id: provider.id }, isEnabled: true } });
    const apiKey = weightedRandom(keys);
    if (!apiKey) throw new Error(`No enabled API keys found for provider ${provider.label}`);

    // Select Backend (if not already selected, use weighted selection)
    if (!backend) {
      const backends = await backendRepo.find({ where: { provider: { id: provider.id }, isEnabled: true } });
      backend = weightedRandom(backends);
      if (!backend) throw new Error(`No enabled backend models found for provider ${provider.label}`);
    }

    return {
      baseUrl: provider.baseUrl,
      apiKey: apiKey.apiKey,
      apiKeyLabel: apiKey.label,
      modelName: backend.modelName,
    };
  }
}
