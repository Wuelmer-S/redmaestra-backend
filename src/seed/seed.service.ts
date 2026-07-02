import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(private usersService: UsersService) {}

  async onApplicationBootstrap() {
    const count = await this.usersService.count();
    if (count > 0) return;

    console.log('Ejecutando seed de datos...');

    await this.usersService.createUser('admin@redmaestra.com', 'Admin1234', 'admin', { nombre: 'Administrador' });
    await this.usersService.createUser('gasfiter@redmaestra.com', 'Maestro1234', 'maestro', { 
      nombre: 'Carlos Pérez', especialidad: 'Gasfitería', calificacion: 4.8, disponible: true, latitud: -33.4569, longitud: -70.6483, 
      run: '12.345.678-9', isSecCertified: true, kycData: { certifiedAt: new Date().toISOString() } as any
    });
    await this.usersService.createUser('electricista@redmaestra.com', 'Maestro1234', 'maestro', { 
      nombre: 'Juan Rodríguez', especialidad: 'Electricidad', calificacion: 4.5, disponible: true, latitud: -33.4489, longitud: -70.6693,
      run: '19.876.543-2', isSecCertified: true, kycData: { certifiedAt: new Date().toISOString() } as any
    });
    await this.usersService.createUser('pintor@redmaestra.com', 'Maestro1234', 'maestro', { 
      nombre: 'Miguel Torres', especialidad: 'Pintura', calificacion: 4.2, disponible: false, latitud: -33.4689, longitud: -70.6283,
      run: '15.654.321-0', isSecCertified: false
    });
    await this.usersService.createUser('cliente1@redmaestra.com', 'Cliente1234', 'cliente', { nombre: 'Ana González', run: '17.111.222-3' });
    await this.usersService.createUser('cliente2@redmaestra.com', 'Cliente1234', 'cliente', { nombre: 'Pedro Soto', run: '18.333.444-5' });

    console.log('Seed completado');
  }
}