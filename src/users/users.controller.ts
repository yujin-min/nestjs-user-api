import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Session,
  UseGuards,
  UseFilters,
} from '@nestjs/common';

import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { SignInUserDto } from './dtos/sign-in-user.dto';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { SerializeUser } from './interceptors/serialize-user.interceptor';
import { AuthGuard } from './guards/auth.guard';
import { HttpExceptionFilter } from '../filters/http-exception.filter';

@Controller('users')
@UseFilters(new HttpExceptionFilter())
export class UsersController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  @Post('/signup')
  @SerializeUser()
  async create(
    @Body() body: CreateUserDto,
    @Session() session: Record<string, any>,
  ) {
    const { email, password, name, age } = body;
    const user = await this.authService.signup({ email, password, name, age });
    session.userId = user.id;
    return user;
  }

  @Post('/signin')
  @SerializeUser()
  async signin(
    @Body() body: SignInUserDto,
    @Session() session: Record<string, any>,
  ) {
    const { email, password } = body;
    const user = await this.authService.signin({ email, password });
    session.userId = user.id;
    return user;
  }

  @Post('/signout')
  signOut(@Session() session: Record<string, any>) {
    session.userId = null;
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @SerializeUser()
  find(@Param('id') id: string) {
    return this.usersService.find(parseInt(id));
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @SerializeUser()
  update(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.usersService.update(parseInt(id), body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @SerializeUser()
  remove(@Param('id') id: string) {
    return this.usersService.remove(parseInt(id));
  }
}
