import { TontineDto } from './tontine.dto';

export class InvitationDto {
  id: number;
  email: string;
  status: string;
  createdAt: Date;
  tontine: TontineDto;
}

export class InvitationsResponseDto {
  invitations: InvitationDto[];
}
