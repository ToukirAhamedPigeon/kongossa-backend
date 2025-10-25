import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TransactionsModule } from './transactions/transactions.module';
import { RolesModule } from './roles/roles.module';
import { PrismaModule } from './prisma/prisma.module';
import { AppConfigModule } from './config/config.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

// Additional Modules
import { OtpModule } from './otp/otp.module';
import { PasswordResetsModule } from './password-resets/password-resets.module';
import { RefreshTokensModule } from './refresh-tokens/refresh-tokens.module';
import { QRPaymentsModule } from './qr-payments/qr-payments.module';
import { RemittancesModule } from './remittances/remittances.module';
import { SavedContactsModule } from './saved-contacts/saved-contacts.module';
import { FloatRequestsModule } from './float-requests/float-requests.module';
import { PaymentMethodsModule } from './payment-methods/payment-methods.module';
import { SupportTicketsModule } from './support-tickets/support-tickets.module';
import { TontinesModule } from './tontines/tontines.module';
import { SystemSettingsModule } from './system-settings/system-settings.module';
import { SettingsModule } from './settings/settings.module';
import { BudgetsModule } from './budgets/budgets.module';
import { BudgetCategoriesModule } from './budget-categories/budget-categories.module';
import { ExpensesModule } from './expenses/expenses.module';
import { TontineInvitesModule } from './tontine-invites/tontine-invites.module';
import { TontineContributionsModule } from './tontine-contributions/tontine-contributions.module';
import { TontineMembersModule } from './tontine-members/tontine-members.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PublicInviteModule } from './public-invite/public-invite.module';
import { InvitationsModule } from './invitations/invitations.module';
import { StripeModule } from './stripe/stripe.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    AppConfigModule,        // Loads environment variables
    PrismaModule,           // Provides PrismaService
    AuthModule,             // Authentication & authorization
    UsersModule,            // User management
    TransactionsModule,     // Transactions management
    RolesModule,            // Role & permissions management
    OtpModule,              // OTP management
    PasswordResetsModule,   // Password resets
    RefreshTokensModule,    // Refresh tokens
    QRPaymentsModule,       // QR payments
    RemittancesModule,      // Remittances
    SavedContactsModule,    // Saved contacts
    FloatRequestsModule,    // Float requests
    PaymentMethodsModule,   // Payment methods
    SupportTicketsModule,   // Support tickets
    TontinesModule,         // Tontines
    SystemSettingsModule,
    SettingsModule,
    BudgetsModule,
    BudgetCategoriesModule,
    ExpensesModule,
    TontineInvitesModule,
    TontineContributionsModule,
    TontineMembersModule,
    DashboardModule,
    PublicInviteModule,
    InvitationsModule,
    StripeModule,   // System-wide settings
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
