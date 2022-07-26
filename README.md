## Initial config

This course starts with an API already working. The authentication is going to be configurated on an already working endpoint.

## Protection with Guards

### Introduction to Guards

📖 https://docs.nestjs.com/guards

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

```
npm i bcrypt
npm i -D @types/bcrypt
```

Edit _user.service.ts_ to include bcrypt function

```
import * as bcrypt from 'bcrypt';
```

Edit create funtion

```
const hashPassword = await bcrypt.hash(newUser.password, 10);
newUser.password = hashPassword;
```

### Authentication with Passport.js

📖 https://docs.nestjs.com/security/authentication

Passport is the most popular node.js authentication library, well-known by the community and successfully used in many production applications. It's straightforward to integrate this library with a Nest application using the **@nestjs/passport** module. At a high level, Passport executes a series of steps to:

- Authenticate a user by verifying their "credentials" (such as username/password, JSON Web Token (JWT), or identity token from an Identity Provider)
- Manage authenticated state (by issuing a portable token, such as a JWT, or creating an Express session)
- Attach information about the authenticated user to the Request object for further use in route handlers

Install passport package

```
npm install --save @nestjs/passport passport passport-local
npm install --save-dev @types/passport-local
```

Generate new service in auth module

```
nest g s auth/services/auth --flat
```

Create new functionality in auth service called _validateUser_ to copare user password and encrypted string in database.

Create new folder

```
/src/auth/strategies
```

Create new file

```
/src/auth/strategies/local.strategy.ts
```

_This strategy is like a service. It can be created with nest cli._

### Login path

Create new controller

```
nest g co auth/controllers/auth --flat
```

_passport-local wiull recieve two parameters by default: username and password_

Create a new endpoin to authenticate users with local strategy

```
  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@Req() req: Request) {
    return req.user;
  }
```

## Authentication with JSON Web Tokens

### Connecting Passport with JWT

📖 https://docs.nestjs.com/security/authentication#jwt-functionality

JWT functionality:

- Allow users to authenticate with username/password, returning a JWT for use in subsequent calls to protected API endpoints. We're well on our way to meeting this requirement. To complete it, we'll need to write the code that issues a JWT.
- Create API routes which are protected based on the presence of a valid JWT as a bearer token
- We'll need to install a couple more packages to support our JWT requirements:

```
npm install --save @nestjs/jwt passport-jwt
npm install --save-dev @types/passport-jwt
```

Add functionality to generate new token at login in _auth.service.ts_ file.

Create new folder

```
/src/auth/models
```

Create new file fot payload token model

```
/src/auth/models/token.model.ts
```

### Secret from environment variables

Import JwtModule in _auth.module.ts_.

Create new environment variable: _JWT_SECRET_.

Add new environment variable into _config.ts_ and _app.module.ts_ file.

Add generateJWT method on _auth.controller.ts_ file.

### Implementing JWT Guard

Create a new strategy for token validation

```
/src/auth/strategies/jwt.strategy.ts
```

Import new authguard into _products.controller.ts_

```
@UseGuards(AuthGuard('jwt'))
@ApiTags('products')
...
```

### Extending JWT Guard

Create a new guard

```
nest g gu auth/guards/jwt-auth --flat
```

This guard extends from jwt guard

```
JwtAuthGuard extends AuthGuard('jwt') {}
```

### Role control in NestJS

📖 https://docs.nestjs.com/security/authorization

Create a new model for roles

```
/src/auth/models/roles.model.ts
```

Create a new decorator for role assignation

```
/src/auth/decorators/roles.decorator.ts
```

Assign roles into controllers

Create new guard for role delimitation

```
nest g gu auth/guards/roles
```

Introduce role guard into controller

### Obtaining profile commands

Create a new controller for users profiles

```
nest g co users/controllers/profile --flat
```

Create new method to obtain orders by customer id in _orders.service.ts_.

## Deploying

### Configuring Mongo Atlas

### Deploying Mongo on Heroku

### Configuring PostgreSQL on Heroku

### Deploying Postgres on Heroku

### Running Postgres migrations on Heroku
