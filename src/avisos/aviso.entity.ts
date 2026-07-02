import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('avisos')
export class Aviso {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  userName: string;

  @Column()
  userRole: string; // 'cliente' (busca) o 'maestro' (ofrece)

  @Column()
  tipoServicio: string;

  @Column({ length: 70 })
  descripcion: string;

  @CreateDateColumn()
  createdAt: Date;
}
