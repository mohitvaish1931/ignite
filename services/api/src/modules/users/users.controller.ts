import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Users')
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user directly (Non-auth flow)' })
  create(@Body() createUserDto: CreateUserDto) {
    const mockUserId = undefined; 
    return this.usersService.create(createUserDto, mockUserId);
  }

  @Get()
  @ApiOperation({ summary: 'List users with pagination, search, sorting' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.usersService.findMany(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific user by ID' })
  findOne(@Param('id') id: string) {
    // Hide password hash in output usually, handled via serialization or projection.
    // For now, including profile relations.
    return this.usersService.findOne(id, { profile: true });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const mockUserId = undefined;
    return this.usersService.update(id, updateUserDto, mockUserId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a user' })
  remove(@Param('id') id: string) {
    const mockUserId = undefined;
    return this.usersService.softDelete(id, mockUserId);
  }
}
