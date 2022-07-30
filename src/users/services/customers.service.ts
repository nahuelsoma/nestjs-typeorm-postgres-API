import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { Customer } from '../entities/customer.entity';
import { CreateCustomerDto, UpdateCustomerDto } from '../dtos/customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer) private customersRepo: Repository<Customer>,
    private dataSource: DataSource,
  ) {}

  async findAll() {
    const customers = await this.customersRepo.find({
      relations: {
        user: true,
      },
    });
    customers.sort((a, b) => {
      return a.id - b.id;
    });
    return customers;
  }

  async findOne(id: number) {
    const customer = await this.customersRepo.findOne({
      where: {
        id,
      },
      relations: {
        user: true,
      },
    });
    if (!customer) {
      throw new NotFoundException(`Customer id: ${id} not found`);
    }
    return customer;
  }

  async create(payload: CreateCustomerDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const newCustomer = queryRunner.manager.create(Customer, payload);
      await queryRunner.manager.save(Customer, newCustomer);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(error);
    } finally {
      await queryRunner.release();
    }

    return payload;
  }

  async update(id: number, changes: UpdateCustomerDto) {
    const customer = await this.findOne(id);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const editedCustomer = queryRunner.manager.merge(
        Customer,
        customer,
        changes,
      );
      await queryRunner.manager.save(Customer, editedCustomer);
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
      await queryRunner.manager.delete(Customer, id);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(error);
    } finally {
      await queryRunner.release();
    }

    return {
      messaje: `Customer ${id} deleted`,
    };
  }
}
