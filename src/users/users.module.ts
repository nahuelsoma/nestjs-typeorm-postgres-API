import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { CustomersController } from './controllers/customers.controller';
import { OrdersController } from './controllers/orders.controller';
import { OrderItemController } from './controllers/order-item.controller';
import { UsersService } from './services/users.service';
import { CustomersService } from './services/customers.service';
import { OrdersService } from './services/orders.service';
import { OrderItemService } from './services/order-item.service';

@Module({
  controllers: [UsersController, CustomersController, OrdersController, OrderItemController],
  providers: [UsersService, CustomersService, OrdersService, OrderItemService]
})
export class UsersModule {}
