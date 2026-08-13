import { Controller, Get, Head } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Head()
  root() {
    return this.appService.health();
  }

  @Get('health')
  @Head('health')
  health() {
    return this.appService.health();
  }
}
