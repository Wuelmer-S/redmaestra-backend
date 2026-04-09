import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: 'cliente' })
  role: string;

  @Column({ nullable: true })
  nombre: string;

  @Column({ nullable: true })
  especialidad: string;

  @Column({ type: 'float', default: 0 })
  calificacion: number;

  @Column({ default: true })
  disponible: boolean;

  @Column({ type: 'float', nullable: true })
  latitud: number;

  @Column({ type: 'float', nullable: true })
  longitud: number;

  @CreateDateColumn()
  createdAt: Date;
}