import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  UseGuards,
  UseFilters,
} from '@nestjs/common';

import { HttpExceptionFilter } from '../common/filters/http-exception.filter';
import { UpdateUserDto } from './dtos/update-user.dto';
import { TokenUserDto } from './dtos/token-user.dto';
import { ChargeAmountDto } from './dtos/charge-amount.dto';
import { UsersService } from './users.service';
import { JwtAccessTokenAuthGuard } from '../auth/guards/jwt-access-auth.guard';
import { SerializeUser } from './interceptors/serialize-user.interceptor';
import { SerializeAccount } from './interceptors/serialize-account.interceptor';
import { User } from './decorators/user-param.decorator';

@Controller('users')
@UseFilters(new HttpExceptionFilter())
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('self')
  @UseGuards(JwtAccessTokenAuthGuard)
  @SerializeUser()
  find(@User() user: TokenUserDto) {
    return user;
    // return this.usersService.find(user.id);
  }

  @Put('self')
  @UseGuards(JwtAccessTokenAuthGuard)
  @SerializeUser()
  update(@User() user: TokenUserDto, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(user.id, updateUserDto);
  }

  @Delete('self')
  @UseGuards(JwtAccessTokenAuthGuard)
  @SerializeUser()
  remove(@User() user: TokenUserDto) {
    return this.usersService.remove(user.id);
  }

  @Put('self/charge')
  @UseGuards(JwtAccessTokenAuthGuard)
  @SerializeAccount()
  charge(@User() user: TokenUserDto, @Body() chargeAmountDto: ChargeAmountDto) {
    const amount = chargeAmountDto.amount;
    return this.usersService.charge(user.id, amount);
  }
}
