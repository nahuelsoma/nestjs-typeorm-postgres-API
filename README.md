## 1. Create new Nest.js app

Doc: https://docs.nestjs.com/cli/usages

```
nest new nest-typeorm-postgres
```

## 2. Create modules

```
nest g mo database
nest g mo products
nest g mo users
```

## 3. Create controllers files

```
nest g co products/controllers/products --flat
nest g co products/controllers/brands --flat
nest g co products/controllers/categories --flat
nest g co users/controllers/users --flat
nest g co users/controllers/customers --flat
nest g co users/controllers/orders --flat
nest g co users/controllers/order-item --flat
```

## 4. Create services files

```
nest g s products/services/products --flat
nest g s products/services/brands --flat
nest g s products/services/categories --flat
nest g s users/services/users --flat
nest g s users/services/customers --flat
nest g s users/services/orders --flat
nest g s users/services/order-item --flat
```

## 5. Create entities files

Manually create files:

- src/products/entities/product.entity.ts
- src/products/entities/brand.entity.ts
- src/products/entities/categorie.entity.ts
- src/users/entities/user.entity.ts
- src/users/entities/customer.entity.ts
- src/users/entities/order.entity.ts
- src/users/entities/order-item.entity.ts

## 6. Create dtos files

Manually create files:

- src/products/dtos/product.dto.ts
- src/products/dtos/brand.dto.ts
- src/products/dtos/categorie.dto.ts
- src/users/dtos/user.dto.ts
- src/users/dtos/customer.dto.ts
- src/users/dtos/order.dto.ts
- src/users/dtos/order-item.dto.ts

## 6. Create pipes files

```
nest g pipe common/parse-int
```

## 7. Install @nestjs/config module

```
npm i --save @nestjs/config
```

## 7. Create .env files

```
.env
.stag.env
.prod.env
```

Add .env files to .gitignore file

## 8. Create environmets.ts file

Manually create file:

- src/environmets.ts

## Create config.ts file

Manually create file:

- src/config.ts

## 7. Install joi package

```
npm install --save joi
```

## 7. Install swagger package

```
npm install --save @nestjs/swagger swagger-ui-express
```
