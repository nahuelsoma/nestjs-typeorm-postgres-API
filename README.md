## Create new Nest.js app

Doc: https://docs.nestjs.com/cli/usages

```
nest new nest-typeorm-postgres
```

## Create modules

```
nest g mo database
nest g mo products
nest g mo users
```

## Create controllers files

```
nest g co products/controllers/products --flat
nest g co products/controllers/brands --flat
nest g co products/controllers/categories --flat
nest g co users/controllers/users --flat
nest g co users/controllers/customers --flat
nest g co users/controllers/orders --flat
nest g co users/controllers/order-item --flat
```

## Create services files

```
nest g s products/services/products --flat
nest g s products/services/brands --flat
nest g s products/services/categories --flat
nest g s users/services/users --flat
nest g s users/services/customers --flat
nest g s users/services/orders --flat
nest g s users/services/order-item --flat
```

## Create entities files

Manually create files:

- src/products/entities/product.entity.ts
- src/products/entities/brand.entity.ts
- src/products/entities/categorie.entity.ts
- src/users/entities/user.entity.ts
- src/users/entities/customer.entity.ts
- src/users/entities/order.entity.ts
- src/users/entities/order-item.entity.ts

## Create dtos files

Manually create files:

- src/products/dtos/product.dto.ts
- src/products/dtos/brand.dto.ts
- src/products/dtos/categorie.dto.ts
- src/users/dtos/user.dto.ts
- src/users/dtos/customer.dto.ts
- src/users/dtos/order.dto.ts
- src/users/dtos/order-item.dto.ts

## Create pipes files

```
nest g pipe common/parse-int
```

## Install @nestjs/config module

```
npm i --save @nestjs/config
```

## Create .env files

```
.env
.stag.env
.prod.env
```

Add .env files to .gitignore file

## Create environmets.ts file

Manually create file:

- src/environmets.ts

## Create config.ts file

Manually create file:

- src/config.ts

## Install joi package

```
npm install --save joi
```

## Install swagger package

```
npm install --save @nestjs/swagger swagger-ui-express
```

## Create docker-compose.yml file

Manually create file:

- docker-compose.yml

## Container up

```
docker-compose up -d
```

Check status

```
docker-compose ps
```

## Login pgAdmin in browser

pgAdmin: http://127.0.0.1:5050

## Create server and database

Object > Register > Server

- Name: my_db

- Hostname/Adress: postgres

- Username: root

- Password: 123456

## Install Postgres packages

```
npm i pg
npm i @types/pg -D
```

## Install TypeORM packages

```
npm install --save @nestjs/typeorm typeorm
```

## Complete parse-int.pipe.ts

## Complete database.module.ts

## Complete main.ts

## Install class-transformer package

```
npm install --save class-transformer
```

## Complete entities

- src/products/entities/product.entity.ts
- src/products/entities/brand.entity.ts
- src/products/entities/categorie.entity.ts
- src/users/entities/user.entity.ts
- src/users/entities/customer.entity.ts
- src/users/entities/order.entity.ts
- src/users/entities/order-item.entity.ts

## Install class-validator package

```
npm install --save class-validator
```

## Complete dtos

- src/products/dtos/product.dto.ts
- src/products/dtos/brand.dto.ts
- src/products/dtos/category.dto.ts
- src/users/dtos/user.dto.ts
- src/users/dtos/customer.dto.ts
- src/users/dtos/order.dto.ts
- src/users/dtos/order-item.dto.ts

## Complete services

- src/products/services/products.service.ts
- src/products/services/brands.service.ts
- src/products/services/categories.service.ts
- src/users/services/users.service.ts
- src/users/services/customers.service.ts
- src/users/services/orders.service.ts
- src/users/services/order-item.service.ts

## Complete controllers

- src/products/controllers/products.controller.ts
- src/products/controllers/brands.controller.ts
- src/products/controllers/categories.controller.ts
- src/users/controllers/users.controller.ts
- src/users/controllers/customers.controller.ts
- src/users/controllers/orders.controller.ts
- src/users/controllers/order-item.controller.ts

## Complete app.module.ts

## Complete users.module.ts

## Complete products.module.ts
