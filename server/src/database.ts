import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { AIProvider } from './entities/AIProvider';
import { AIProviderAPIKey } from './entities/AIProviderAPIKey';
import { AIBackend } from './entities/AIBackend';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'database.sqlite',
  synchronize: true, // Set to false in production
  logging: false,
  entities: [AIProvider, AIProviderAPIKey, AIBackend],
  migrations: [],
  subscribers: [],
});
