import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

 async findMaestros(): Promise<Partial<User>[]> {
  return this.usersRepository.find({
    where: { role: 'maestro' },
    select: ['id', 'nombre', 'email', 'especialidad', 'calificacion', 'disponible', 'latitud', 'longitud', 'descripcion'],
    });
  }

  async findMaestrosCercanos(
    lat: number,
    lng: number,
    radioKm: number,
  ): Promise<User[]> {
    const maestros = await this.usersRepository.find({
      where: { role: 'maestro', disponible: true },
      select: ['id', 'nombre', 'email', 'especialidad', 'calificacion', 'disponible', 'latitud', 'longitud', 'descripcion'],
    });

    return maestros.filter((m) => {
      if (!m.latitud || !m.longitud) return false;
      const distancia = this.calcularDistancia(lat, lng, m.latitud, m.longitud);
      return distancia <= radioKm;
    });
  }

  private calcularDistancia(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  async updateUbicacion(
    id: string,
    latitud: number,
    longitud: number,
    disponible?: boolean,
  ): Promise<User> {
    const data: Partial<User> = { latitud, longitud };
    if (disponible !== undefined) data.disponible = disponible;
    await this.usersRepository.update(id, data);
    return this.findById(id) as Promise<User>;
  }

  async updateProfile(id: string, data: Partial<User>): Promise<User> {
    await this.usersRepository.update(id, data);
    return this.findById(id) as Promise<User>;
  }

  async createUser(
    email: string,
    password: string,
    role: string,
    extra?: Partial<User>,
  ): Promise<User> {
    const hashed = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({
      email,
      password: hashed,
      role,
      ...extra,
    });
    return this.usersRepository.save(user);
  }

  async findByRun(run: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { run } });
  }

  async updateKYC(id: string, run: string, kycData: any): Promise<void> {
    await this.usersRepository.update(id, {
      run,
      kycStatus: 'verified',
      kycData,
    });
  }

  async count(): Promise<number> {
    return this.usersRepository.count();
  }

  // 🐴 ponytail: EMA (Exponential Moving Average) to avoid creating a new ratings table
  async addRating(id: string, score: number): Promise<User | null> {
    const user = await this.findById(id);
    if (!user) return null;
    
    const current = user.calificacion || 0;
    const newRating = current === 0 ? score : (current * 4 + score) / 5;
    
    await this.usersRepository.update(id, { calificacion: Math.round(newRating * 10) / 10 });
    return this.findById(id);
  }
}
