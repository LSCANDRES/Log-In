import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { Roles } from '../common/decorators';
import { RolesGuard, JwtAuthGuard } from '../common/guards';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.usersService.findAll(page, limit);
  }

  @Get('stats')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get user statistics (Admin only)' })
  async getStats() {
    return this.usersService.getStats();
  }

  @Get('login-history')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get login history (Admin only)' })
  async getLoginHistory(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.usersService.getLoginHistory(page, limit);
  }

  @Get(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id/role')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Change user role (Admin only)' })
  async changeRole(
    @Param('id') id: string,
    @Query('role') role: 'ADMIN' | 'USER',
  ) {
    return this.usersService.changeRole(id, role);
  }

  @Patch(':id/toggle-active')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Toggle user active status (Admin only)' })
  async toggleActive(@Param('id') id: string) {
    return this.usersService.toggleActive(id);
  }
}
