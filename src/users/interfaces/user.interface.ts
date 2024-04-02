import { IAccount } from '../../accounts/interfaces/account.interface';
import { IUserType } from './user-type.interface';

export interface IUser {
  id: number;
  type: IUserType;
  email: string;
  name: string;
  refreshToken: string;
  account: IAccount;
}
