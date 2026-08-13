import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return API health from root', () => {
      expect(appController.root()).toEqual({
        ok: true,
        service: 'median-api',
      });
    });

    it('should return API health from health endpoint', () => {
      expect(appController.health()).toEqual({
        ok: true,
        service: 'median-api',
      });
    });
  });
});
