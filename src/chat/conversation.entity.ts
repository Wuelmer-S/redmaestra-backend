import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Message } from './message.entity';

export type ConversationStatus = 'active' | 'closed';

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  clienteId: string;

  @Column()
  maestroId: string;

  @Column()
  createdById: string;

  @Column({ default: 'active' })
  status: ConversationStatus;

  @Column({ default: false })
  clienteRated: boolean;

  @Column({ default: false })
  maestroRated: boolean;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'clienteId' })
  cliente: User;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'maestroId' })
  maestro: User;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
