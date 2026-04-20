import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { AIProvider } from './AIProvider';

@Entity()
export class AIBackend {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  modelName!: string;

  @Column({ type: 'float', default: 1.0 })
  weight!: number;

  @Column({ default: true })
  isEnabled!: boolean;

  @ManyToOne(() => AIProvider, (provider) => provider.backends)
  provider!: AIProvider;
}
