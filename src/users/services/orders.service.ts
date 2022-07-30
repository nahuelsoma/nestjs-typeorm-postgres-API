import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { Customer } from './../entities/customer.entity';
import { Order } from './../entities/order.entity';
import { User } from '../entities/user.entity';
import { CreateOrderDto, UpdateOrderDto } from '../dtos/order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Customer) private customerRepo: Repository<Customer>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private dataSource: DataSource,
  ) {}

  async findAll() {
    const orders = await this.orderRepo.find({
      relations: {
        customer: true,
        items: {
          product: true,
        },
      },
    });
    orders.sort((a, b) => {
      return a.id - b.id;
    });
    return orders;
  }

  async findOne(id: number) {
    const order = await this.orderRepo.findOne({
      where: {
        id,
      },
      relations: {
        customer: true,
        items: {
          product: true,
        },
      },
    });
    if (!order) {
      throw new NotFoundException(`Order id: ${id} not found`);
    }
    return order;
  }

  async ordersByCustomer(userId: number) {
    const user = await this.userRepo.findOne({
      where: {
        id: userId,
      },
      relations: {
        customer: true,
      },
    });

    const customerOrders = await this.orderRepo.find({
      where: {
        customer: { id: user.customer.id },
      },
      relations: {
        items: {
          product: true,
        },
      },
    });

    if (customerOrders.length < 1) {
      throw new NotFoundException('You have no orders yet');
    }

    return customerOrders;
  }

  async create(payload: CreateOrderDto) {
    const order = new Order();

    if (payload.customerId) {
      const customer = await this.customerRepo.findOne({
        where: {
          id: payload.customerId,
        },
      });
      if (!customer) {
        throw new NotFoundException(`Customer ${payload.customerId} not found`);
      }
      order.customer = customer;
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.save(Order, order);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(error);
    } finally {
      await queryRunner.release();
    }

    return order;
  }

  async update(id: number, changes: UpdateOrderDto) {
    const order = await this.findOne(id);

    if (changes.customerId) {
      const customer = await this.customerRepo.findOne({
        where: {
          id: changes.customerId,
        },
      });
      if (!customer) {
        throw new NotFoundException(`Customer ${changes.customerId} not found`);
      }
      order.customer = customer;
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.save(Order, order);
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
      await queryRunner.manager.delete(Order, id);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(error);
    } finally {
      await queryRunner.release();
    }

    return {
      messaje: `Order ${id} deleted`,
    };
  }
}
