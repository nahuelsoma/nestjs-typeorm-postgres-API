import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Customer } from './../entities/customer.entity';
import { Order } from './../entities/order.entity';
import { User } from './../entities/user.entity';
import { CreateOrderDto, UpdateOrderDto } from '../dtos/order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Customer) private customerRepo: Repository<Customer>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(User) private userRepo: Repository<User>,
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
    return orders.sort(function (a, b) {
      return a.id - b.id;
    });
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
      throw new NotFoundException(`Order ${id} not found`);
    }

    return order;
  }

  async ordersByCustomer(customerId: number) {
    const customerOrders = await this.orderRepo.find({
      where: {
        customer: { id: customerId },
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

  async create(data: CreateOrderDto) {
    const order = new Order();
    if (data.customerId) {
      const customer = await this.customerRepo.findOne({
        where: {
          id: data.customerId,
        },
      });
      if (!customer) {
        throw new NotFoundException(`Customer ${data.customerId} not found`);
      }
      order.customer = customer;
    }
    return this.orderRepo.save(order);
  }

  async update(id: number, changes: UpdateOrderDto) {
    const order = await this.orderRepo.findOneBy({ id });
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

    return this.orderRepo.save(order);
  }

  remove(id: number) {
    return this.orderRepo.delete(id);
  }
}
