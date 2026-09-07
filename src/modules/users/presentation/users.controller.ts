import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';
import { RolesGuard } from '../../../core/auth/roles.guard';
import { Roles } from '../../../core/auth/roles.decorator';
import { CurrentUser } from '../../../core/auth/current-user.decorator';
import type { Paginated } from '../../../core/common/pagination';
import type { User } from '../domain/user';
import { ListUsersUseCase } from '../application/list-users.usecase';
import { GetUserByIdUseCase } from '../application/get-user-by-id.usecase';
import { CreateUserUseCase } from '../application/create-user.usecase';
import { UpdateUserUseCase } from '../application/update-user.usecase';
import { DeleteUserUseCase } from '../application/delete-user.usecase';
import { UpdateMeUseCase } from '../application/update-me.usecase';
import { FindUsersQueryDto } from './dto/find-users-query.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateMeDto } from './dto/update-me.dto';

// TASK 02 — presentation do Users Module (CRUD).
// Controller fino: valida DTOs e Guards, delega para 1 usecase por rota.
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly listUsers: ListUsersUseCase,
    private readonly getUserById: GetUserByIdUseCase,
    private readonly createUser: CreateUserUseCase,
    private readonly updateUser: UpdateUserUseCase,
    private readonly deleteUser: DeleteUserUseCase,
    private readonly updateMeUseCase: UpdateMeUseCase,
  ) {}

  @Get()
  findMany(@Query() query: FindUsersQueryDto): Promise<Paginated<User>> {
    return this.listUsers.execute(query);
  }

  @Get('me')
  getMe(@CurrentUser('id') userId: string): Promise<User> {
    return this.getUserById.execute(userId);
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<User> {
    return this.getUserById.execute(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  create(@Body() dto: CreateUserDto): Promise<User> {
    return this.createUser.execute(dto);
  }

  @Patch('me')
  updateMe(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateMeDto,
  ): Promise<User> {
    return this.updateMeUseCase.execute(userId, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto): Promise<User> {
    return this.updateUser.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async delete(@Param('id') id: string): Promise<void> {
    await this.deleteUser.execute(id);
  }
}
