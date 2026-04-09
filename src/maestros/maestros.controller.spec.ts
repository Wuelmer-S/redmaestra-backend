import { Test, TestingModule } from '@nestjs/testing';
import { MaestrosController } from './maestros.controller';

describe('MaestrosController', () => {
  let controller: MaestrosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaestrosController],
    }).compile();

    controller = module.get<MaestrosController>(MaestrosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
