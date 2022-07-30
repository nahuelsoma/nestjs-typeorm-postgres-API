import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { Order } from './../entities/order.entity';
import { OrderItem } from './../entities/order-item.entity';
import { Product } from './../../products/entities/product.entity';
import { CreateOrderItemDto, UpdateOrderItemDto } from '../dtos/order-item.dto';

@Injectable()
export class OrderItemService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private itemRepo: Repository<OrderItem>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    private dataSource: DataSource,
  ) {}

  async create(data: CreateOrderItemDto) {
    const order = await this.orderRepo.findOne({
      where: {
        id: data.orderId,
      },
    });
    if (!order) {
      throw new NotFoundException(`Order ${data.orderId} not found`);
    }

    const product = await this.productRepo.findOne({
      where: {
        id: data.productId,
      },
    });
    if (!product) {
      throw new NotFoundException(`Product ${data.productId} not found`);
    }

    const item = new OrderItem();
    item.order = order;
    item.product = product;
    item.quantity = data.quantity;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.save(OrderItem, item);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(error);
    } finally {
      await queryRunner.release();
    }

    return item;
  }

  async update(id: number, changes: UpdateOrderItemDto) {
    const item = await this.itemRepo.findOneBy({ id });
    if (!item) {
      throw new NotFoundException(`OrderItem ${id} not found`);
    }

    if (changes.orderId) {
      const order = await this.orderRepo.findOneBy({ id: changes.orderId });
      if (!order) {
        throw new NotFoundException(`Order ${changes.orderId} not found`);
      }
      item.order = order;
    }
    if (changes.productId) {
      const product = await this.productRepo.findOneBy({
        id: changes.productId,
      });
      if (!product) {
        throw new NotFoundException(`Product ${changes.productId} not found`);
      }
      item.product = product;
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const editedOrderItem = queryRunner.manager.merge(
        OrderItem,
        item,
        changes,
      );
      await queryRunner.manager.save(OrderItem, editedOrderItem);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(error);
    } finally {
      await queryRunner.release();
    }

    return await this.itemRepo.find({ where: { id: item.id } });
  }

  async remove(id: number) {
    const item = await this.itemRepo.findOneBy({ id });
    if (!item) {
      throw new NotFoundException(`OrderItem ${id} not found`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.delete(OrderItem, id);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(error);
    } finally {
      await queryRunner.release();
    }

    return {
      messaje: `OrderItem ${id} deleted`,
    };
  }
}
