
<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>

<p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
<a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
</p>

## Description

This project is built with [NestJS](https://nestjs.com/) framework using TypeScript and PostgreSQL. It includes user authentication, transactions, payment methods, support tickets, and other core modules for a full backend system.

---

## Kongossa Backend Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd kongossa-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory based on `.env.example` and update the following:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
JWT_SECRET=your_jwt_secret
MAIL_HOST=your_mail_host
MAIL_PORT=your_mail_port
MAIL_USER=your_mail_user
MAIL_PASSWORD=your_mail_password
```

Make sure your PostgreSQL database is running and accessible with the credentials above.

### 4. Run Prisma migrations

```bash
npx prisma migrate dev
```

This will create all necessary tables in your database.

### 5. Start the server

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

The server should now be running at [http://localhost:3000](http://localhost:3000).

---

## API Endpoints

Some key endpoints:

- `POST /auth/register` — Register a new user  
- `POST /auth/login` — Login user  
- `GET /auth/me` — Get current user info  
- `GET /payment-methods` — List payment methods  
- `GET /transactions` — List transactions  

> Most endpoints require a valid JWT token in the `Authorization` header.

---

## Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

---

## Deployment

When you're ready to deploy your NestJS application to production, refer to the [NestJS deployment documentation](https://docs.nestjs.com/deployment).

For cloud deployment, you can use [NestJS Mau](https://mau.nestjs.com) for quick deployment on AWS:

```bash
npm install -g @nestjs/mau
mau deploy
```

---

## Resources

- [NestJS Documentation](https://docs.nestjs.com)  
- [Discord Support Channel](https://discord.gg/G7Qnnhy)  
- [NestJS Courses](https://courses.nestjs.com/)  
- [NestJS Devtools](https://devtools.nestjs.com)  
- [Enterprise Support](https://enterprise.nestjs.com)  
- Follow NestJS: [X](https://x.com/nestframework) | [LinkedIn](https://linkedin.com/company/nestjs)  

---

## Support

NestJS is MIT licensed. It can grow thanks to its sponsors and backers. Learn more [here](https://docs.nestjs.com/support).

---

## Stay in touch

- Author: [Kamil Myśliwiec](https://twitter.com/kammysliwiec)  
- Website: [https://nestjs.com](https://nestjs.com/)  
- Twitter: [@nestframework](https://twitter.com/nestframework)

---

## License

NestJS is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
