export class CreateTontineContributionDto {
  tontineMemberId: number; // ✅ required
  userId?: number;
  amount: number;
  contributionDate?: Date;
  status?: string;
}
