import { Injectable } from '@nestjs/common';
import { Money } from './money';
import { Point } from './point';
import { IUserType } from '../../users/interfaces/user-type.interface';

@Injectable()
export class Wallet {
  private money: Money;
  private point: Point;

  constructor(
    amount: number,
    multiplier: { money: number; point: number },
    userType: IUserType,
  ) {
    this.money = new Money(amount * multiplier.money);
    if (userType === 'business') {
      this.point = new Point(this.money.value * multiplier.point);
    } else {
      this.point = new Point(this.money.value);
    }
  }

  get value() {
    return {
      money: this.money.value,
      point: this.point.value,
    };
  }
}
