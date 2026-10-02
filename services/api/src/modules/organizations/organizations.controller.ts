import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Organizations')
@Controller({ path: 'organizations', version: '1' })
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new organization' })
  create(@Body() createOrganizationDto: CreateOrganizationDto) {
    // Note: Once auth is implemented, extract userId from req.user
    const mockUserId = undefined; 
    return this.organizationsService.create(createOrganizationDto, mockUserId);
  }

  @Get()
  @ApiOperation({ summary: 'List organizations with pagination, search, sorting' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.organizationsService.findMany(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific organization by ID' })
  findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id, { settings: true });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an organization' })
  update(@Param('id') id: string, @Body() updateOrganizationDto: UpdateOrganizationDto) {
    const mockUserId = undefined;
    return this.organizationsService.update(id, updateOrganizationDto, mockUserId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete an organization' })
  remove(@Param('id') id: string) {
    const mockUserId = undefined;
    return this.organizationsService.softDelete(id, mockUserId);
  }
}
