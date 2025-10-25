// src/public-invite/dto/public-invite-response.dto.ts
import { TontineInvite, Tontine } from '@prisma/client';

export class PublicInviteResponseDto {
  invitation: TontineInvite & { tontine: Tontine };
  token: string;
  hasEmail: boolean;
}
