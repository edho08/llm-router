import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { AIProviderAPIKey } from './AIProviderAPIKey';
import { AIBackend } from './AIBackend';

@Entity()
export class AIProvider {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  label!: string;

  @Column()
  baseUrl!: string;

  @Column({ type: 'float', default: 1.0 })
  weight!: number;

  @Column({ default: true })
  isEnabled!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => AIProviderAPIKey, (apiKey) => apiKey.provider)
  apiKeys!: AIProviderAPIKey[];

  @OneToMany(() => AIBackend, (backend) => backend.provider)
  backends!: AIBackend[];
}
