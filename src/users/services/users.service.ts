import {
  Injectable,
  NotFoundException,
  ConflictException,
  NotAcceptableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from '../entities/user.entity';
import { Customer } from '../entities/customer.entity';
import { CreateUserDto, UpdateUserDto } from '../dtos/user.dto';
import { ProductsService } from './../../products/services/products.service';

@Injectable()
export class UsersService {
  constructor(
    private productsService: ProductsService,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Customer) private customerRepo: Repository<Customer>,
    private dataSource: DataSource,
  ) {}

  async findAll() {
    const users = await this.userRepo.find({
      relations: {
        customer: true,
      },
    });
    users.sort((a, b) => {
      return a.id - b.id;
    });
    return users;
  }

  async findOne(id: number) {
    const user = await this.userRepo.findOne({
      where: {
        id,
      },
      relations: {
        customer: true,
      },
    });
    if (!user) {
      throw new NotFoundException(`User id: ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string) {
    const user = this.userRepo.findOne({
      where: { email },
      relations: { customer: true },
    });
    if (!user) {
      throw new NotFoundException(`User ${email} not found`);
    }
    return user;
  }

  async getOrderByUser(id: number) {
    const user = this.findOne(id);
    return {
      date: new Date(),
      user,
      products: await this.productsService.findAll(),
    };
  }

  async create(payload: CreateUserDto) {
    const existingUser = await this.userRepo.findOneBy({
      email: payload.email,
    });
    if (existingUser) {
      throw new NotAcceptableException(
        `User '${existingUser.email}' already exist with id: ${existingUser.id}`,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    const newUser = queryRunner.manager.create(User, payload);

    const hashPassword = await bcrypt.hash(newUser.password, 10);
    newUser.password = hashPassword;

    if (payload.customerId) {
      const customer = await this.customerRepo.findOneBy({
        id: payload.customerId,
      });
      if (!customer) {
        throw new NotFoundException(
          `Customer id: ${payload.customerId} not found`,
        );
      }
      newUser.customer = customer;
    }

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.save(User, newUser);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(error);
    } finally {
      await queryRunner.release();
    }

    return newUser;
  }

  async update(id: number, changes: UpdateUserDto) {
    const user = await this.findOne(id);

    if (changes.customerId) {
      const customer = await this.customerRepo.findOne({
        where: {
          id: changes.customerId,
        },
        relations: {
          user: true,
        },
      });
      user.customer = customer;
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const editedUser = queryRunner.manager.merge(User, user, changes);
      await queryRunner.manager.save(User, editedUser);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(error);
    } finally {
      await queryRunner.release();
    }

    return await this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.delete(User, id);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(error);
    } finally {
      await queryRunner.release();
    }

    return {
      messaje: `User ${id} deleted`,
    };
  }
}
