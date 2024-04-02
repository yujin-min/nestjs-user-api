import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './models/user.entity';
import { AccountsService } from '../accounts/accounts.service';
import { Account } from '../accounts/models/account.entity';
import { IUser } from './interfaces/user.interface';
import { ChargeAmountStrategy } from '../accounts/strategies/charge-amount.strategy';

const TEST_ACCOUNT = {
  id: 'testAccountId',
  balance: 0,
  point: 0,
};
const TEST_PERSONAL_USER: IUser = {
  id: 1,
  type: 'personal',
  email: 'hello@nestjs.com',
  name: 'hello',
  refreshToken: 'testToken',
  account: TEST_ACCOUNT,
};

const dataSourceMockFactory = jest.fn(() => ({
  createQueryRunner: jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    startTransaction: jest.fn(),
    release: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    manager: {
      create: jest.fn(),
      findOneBy: jest.fn(() => {
        return Promise.resolve(TEST_ACCOUNT);
      }),
      remove: jest.fn(),
      increment: jest.fn(),
      save: jest.fn(() => {
        return Promise.resolve(TEST_PERSONAL_USER);
      }),
    },
  })),
}));

describe('UsersService', () => {
  let usersService: UsersService;
  let userRepository: Repository<User>;

  const userRepositoryToken = getRepositoryToken(User);
  const accountRepositoryToken = getRepositoryToken(Account);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        AccountsService,
        {
          provide: userRepositoryToken,
          useClass: Repository,
        },
        {
          provide: accountRepositoryToken,
          useClass: Repository,
        },
        {
          provide: DataSource,
          useFactory: dataSourceMockFactory,
        },
        { provide: 'chargeAmountStrategy', useClass: ChargeAmountStrategy },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(userRepositoryToken);
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
  });

  it('create => should create a new user', async () => {
    const result = await usersService.create(TEST_PERSONAL_USER);
    expect(result).toBe(TEST_PERSONAL_USER);
  });

  it('find => should find a user by id', async () => {
    jest
      .spyOn(userRepository, 'findOneBy')
      .mockImplementation(() => Promise.resolve(TEST_PERSONAL_USER));

    const result = await usersService.find(TEST_PERSONAL_USER.id);
    expect(result).toBe(TEST_PERSONAL_USER);
    expect(userRepository.findOneBy).toHaveBeenCalled();
  });

  it('findByEmail => should find a user by email', async () => {
    jest
      .spyOn(userRepository, 'findOneBy')
      .mockImplementation(() => Promise.resolve(TEST_PERSONAL_USER));

    const result = await usersService.findByEmail(TEST_PERSONAL_USER.email);
    expect(result).toBe(TEST_PERSONAL_USER);
    expect(userRepository.findOneBy).toHaveBeenCalled();
  });

  it('findByRefreshToken => should find a user by refreshToken', async () => {
    jest
      .spyOn(userRepository, 'findOneBy')
      .mockImplementation(() => Promise.resolve(TEST_PERSONAL_USER));

    const result = await usersService.findByRefreshToken(
      TEST_PERSONAL_USER.refreshToken,
    );
    expect(result).toBe(TEST_PERSONAL_USER);
    expect(userRepository.findOneBy).toHaveBeenCalled();
  });

  it('findOrCreate => should find a user with email', async () => {
    jest
      .spyOn(userRepository, 'findOneBy')
      .mockImplementation(() => Promise.resolve(TEST_PERSONAL_USER));

    const result = await usersService.findOrCreate(TEST_PERSONAL_USER);
    expect(result).toBe(TEST_PERSONAL_USER);
    expect(userRepository.findOneBy).toHaveBeenCalled();
  });

  it('findOrCreate => should not find a user so create a new user', async () => {
    jest
      .spyOn(userRepository, 'findOneBy')
      .mockImplementation(() => Promise.resolve(null));

    const result = await usersService.findOrCreate(TEST_PERSONAL_USER);
    expect(result).toBe(TEST_PERSONAL_USER);
    expect(userRepository.findOneBy).toHaveBeenCalled();
  });

  it('update => should update a user with a new name', async () => {
    const name = 'nestjs';

    jest
      .spyOn(userRepository, 'findOneBy')
      .mockImplementation(() => Promise.resolve(TEST_PERSONAL_USER));
    jest
      .spyOn(userRepository, 'save')
      .mockImplementation(() =>
        Promise.resolve({ ...TEST_PERSONAL_USER, name }),
      );

    const result = await usersService.update(TEST_PERSONAL_USER.id, { name });
    expect(result.name).toBe(name);
    expect(userRepository.findOneBy).toHaveBeenCalled();
    expect(userRepository.save).toHaveBeenCalled();
  });

  it('remove => remove a user', async () => {
    jest
      .spyOn(userRepository, 'findOneBy')
      .mockImplementation(() => Promise.resolve(TEST_PERSONAL_USER));

    await usersService.remove(TEST_PERSONAL_USER.id);
    expect(userRepository.findOneBy).toHaveBeenCalled();
  });
});
