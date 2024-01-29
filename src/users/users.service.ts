import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(
    email: string,
    password: string,
    name: string,
    age: number,
  ): Promise<void> {
    const user = this.usersRepository.create({
      email,
      password,
      name,
      age,
    });
    await this.usersRepository.save(user);
  }

  async find(id: number) {
    if (!id) return null;
    return this.usersRepository.findOneBy({ id });
  }

  async update(id: number, info: Partial<User>) {
    const user = await this.find(id);
    if (!user) return null;
    Object.assign(user, info);
    return this.usersRepository.save(user);
  }

  async remove(id: number) {
    const user = await this.find(id);
    if (!user) return null;
    return this.usersRepository.remove(user);
  }
}
