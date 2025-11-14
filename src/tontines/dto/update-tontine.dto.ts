
export class UpdateTontineDto {
  name?: string;
  type?: string;
  contributionAmount?: number;
  contributionFrequency?: string; // this maps to frequency in schema
  durationMonths?: number;
  maxMembers?: number;
  status?: string;
}
