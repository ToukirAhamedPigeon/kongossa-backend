import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TransactionsModule } from './transactions/transactions.module';
import { RolesModule } from './roles/roles.module';
import { PrismaModule } from './prisma/prisma.module';
import { AppConfigModule  } from './config/config.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    AppConfigModule,       // Loads environment variables
    PrismaModule,       // Provides database access (PrismaService)
    AuthModule,         // Authentication & authorization
    UsersModule,        // User management
    TransactionsModule, // Transactions management
    RolesModule,        // Role & permissions management
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
