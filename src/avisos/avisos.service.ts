import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Aviso } from './aviso.entity';

@Injectable()
export class AvisosService {
  constructor(
    @InjectRepository(Aviso)
    private avisosRepository: Repository<Aviso>,
  ) {}

  async findAll() {
    return this.avisosRepository.find({ order: { createdAt: 'DESC' } });
  }

  async create(data: Partial<Aviso>) {
    const aviso = this.avisosRepository.create(data);
    return this.avisosRepository.save(aviso);
  }
}
