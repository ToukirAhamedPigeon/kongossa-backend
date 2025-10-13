export class CreateTontineContributionDto {
  tontineId: number;
  userId: number;
  amount: number;
  currency?: string;
  contributionDate?: Date;
  roundNumber: number;
  paymentMethod?: string;
  status?: string;
  transactionId?: string;
}
