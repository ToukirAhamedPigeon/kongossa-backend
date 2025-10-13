import { PartialType } from '@nestjs/mapped-types';
import { CreateQRPaymentDto } from './create-qr-payment.dto';

export class UpdateQRPaymentDto extends PartialType(CreateQRPaymentDto) {}
