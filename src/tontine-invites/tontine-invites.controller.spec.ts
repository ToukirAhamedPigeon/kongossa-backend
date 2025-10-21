import { Test, TestingModule } from '@nestjs/testing';
import { TontineInvitesController } from './tontine-invites.controller';

describe('TontineInvitesController', () => {
  let controller: TontineInvitesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TontineInvitesController],
    }).compile();

    controller = module.get<TontineInvitesController>(TontineInvitesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
