import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

// Usually, you don't update passwordHash and organizationId directly via standard generic update
export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['passwordHash', 'organizationId'] as const)) {}
