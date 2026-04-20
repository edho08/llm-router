import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { AIProvider } from './AIProvider';

@Entity()
export class AIProviderAPIKey {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  label!: string;

  @Column()
  apiKey!: string;

  @Column({ type: 'float', default: 1.0 })
  weight!: number;

  @Column({ default: true })
  isEnabled!: boolean;

  @ManyToOne(() => AIProvider, (provider) => provider.apiKeys)
  provider!: AIProvider;
}
