## Initial config

This course starts with an API already working. The authentication is going to be configurated on an already working endpoint.

## Protection with Guards

### Introduction to Guards

Guards have a single responsibility. They determine whether a given request will be handled by the route handler or not, depending on certain conditions (like permissions, roles, ACLs, etc.) present at run-time. This is often referred to as authorization.

Create new module:

```
nest g mo auth
```

Create new guard:

```
nest g gu auth/guards/apiKey --flat
```

Use the guardian to protect an endpoint through the controller

- import the guardian

```
    import { ApiKeyGuard } from './auth/guards/api-key.guard';
```

- use the guardian decorator

```
    @UseGuards(ApiKeyGuard)
    @Get()
    ...
```

The guard can be used to protect a single endpoint or an entirely controller.

### Using a decorator

To unprotect an andpoint inside a protected controller, @SetMetadata can be used

```
import { SetMetadata } from '@nestjs/common'
```

Create decorators folder into auth folder

Create a new decorator file

```
nest g d auth/decorators/public --flat
```

Define isPublic into _api-key_guard.ts_

Import the new decorator into the corresponding controller

```
import { Public } from './auth/decorators/public.decorator';
```

Use new decorator

```
  @Get()
  @Public()
  ...
```

### Guard with environment variables

Inject environment variables into _api-key_guard.ts_

```
@Inject(config.KEY) private configService: ConfigType<typeof config>
```

To perform the authorization throug ENV variables, run project with:

```
NODE_ENV=dev npm run start:dev
```

To perform the authorization throug staging ENV variables, run project with:

```
NODE_ENV=stag npm run start:dev
```

## Authentication with Passport

### Password hashing in TypeORM

### Password hashing in MongoDB

### Authentication with Passport.js

### Login path

## Authentication with JSON Web Tokens

### Connecting Passport with JWT

### Secret from environment variables

### Implementing JWT Guard

### Extending JWT Guard

### Role control in NestJS

### Obtaining profile commands

## Deploying

### Configuring Mongo Atlas

### Deploying Mongo on Heroku

### Configuring PostgreSQL on Heroku

### Deploying Postgres on Heroku

### Running Postgres migrations on Heroku
