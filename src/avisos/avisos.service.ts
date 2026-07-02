import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Aviso } from './aviso.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class AvisosService {
  constructor(
    @InjectRepository(Aviso)
    private avisosRepository: Repository<Aviso>,
    private usersService: UsersService,
  ) {}

  async findAll() {
    const avisos = await this.avisosRepository.find({ order: { createdAt: 'DESC' } });
    for (const aviso of avisos) {
      const user = await this.usersService.findById(aviso.userId);
      if (user) {
        aviso.userName = user.nombre || user.email;
      }
    }
    return avisos;
  }

  async create(data: Partial<Aviso>) {
    const user = await this.usersService.findById(data.userId);
    if (user) {
      data.userName = user.nombre || user.email;
    }
    const aviso = this.avisosRepository.create(data);
    return this.avisosRepository.save(aviso);
  }

  async delete(id: string, userId: string) {
    const aviso = await this.avisosRepository.findOne({ where: { id } });
    if (!aviso) throw new Error('Aviso no encontrado');
    if (aviso.userId !== userId) throw new Error('No tienes permiso para borrar este aviso');
    return this.avisosRepository.remove(aviso);
  }
}
