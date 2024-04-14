import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { Account } from './models/account.entity';
import { Wallet } from './models/wallet';
import { Cron } from '@nestjs/schedule';

const AMOUNT_TYPE = { BALANCE: 'balance', POINT: 'point' };

@Injectable()
export class AccountsService {
  private accountCache: object = {};

  constructor(
    @InjectRepository(Account) private accountRepository: Repository<Account>,
    private dataSource: DataSource,
  ) {}

  @Cron(new Date(Date.now() + 1000))
  async storeAllAccounts() {
    const accounts = await this.findAll();
    accounts.forEach((account) => {
      const { id, balance, point } = account;
      this.accountCache[id] = { balance, point };
    });
    console.info('all accounts stored in cache');
  }

  async create(queryRunner: QueryRunner) {
    const account = queryRunner.manager.create(Account);
    const storedAccount = await queryRunner.manager.save(Account, account);
    this.accountCache[storedAccount.id] = { balance: 0, point: 0 };
    return storedAccount;
  }

  async findAll() {
    return this.accountRepository.find();
  }

  async find(
    { id }: { id: string },
    queryRunner?: QueryRunner,
  ): Promise<Account> {
    return queryRunner
      ? queryRunner.manager.findOneBy(Account, { id })
      : this.accountRepository.findOneBy({ id });
  }

  private async incrementBalance(
    { id, change }: { id: string; change: number },
    queryRunner: QueryRunner,
  ) {
    return queryRunner.manager.increment(
      Account,
      { id },
      AMOUNT_TYPE.BALANCE,
      change,
    );
  }

  private async incrementPoint(
    { id, change }: { id: string; change: number },
    queryRunner: QueryRunner,
  ) {
    return queryRunner.manager.increment(
      Account,
      { id },
      AMOUNT_TYPE.POINT,
      change,
    );
  }

  async update({ id, wallet }: { id: string; wallet: Wallet }) {
    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    try {
      await this.incrementBalance({ id, change: wallet.value.money }, runner);
      await this.incrementPoint({ id, change: wallet.value.point }, runner);
      await runner.commitTransaction();
      this.accountCache[id].balance += wallet.value.money;
      this.accountCache[id].point += wallet.value.point;
    } catch (e) {
      console.error(e);
      await runner.rollbackTransaction();
    } finally {
      await runner.release();
    }
    return { id, ...this.accountCache[id] };
  }

  async remove({ id }: { id: string }, queryRunner: QueryRunner) {
    const account = await this.find({ id }, queryRunner);
    if (!account) throw new NotFoundException('account not found');
    delete this.accountCache[id];
    return queryRunner.manager.remove(Account, account);
  }
}
