import { Injectable } from '@nestjs/common';

@Injectable() // Marks this as a provider that can be injected
export class AppService {
  getHello(): string {
    // Simple hello message
    return 'Hello World!';
  }
}
