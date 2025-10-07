import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller() // Root controller, handles requests to "/"
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get() // GET request for "/"
  getHello(): string {
    // Return a simple "Hello World" message
    return this.appService.getHello();
  }
}
