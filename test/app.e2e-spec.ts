import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as async from 'async';

import { AppModule } from './../src/app.module';
import { TestData } from '../src/interfaces/TestData';
import { User } from '../src/interfaces/User';
import { UserResponse } from '../src/interfaces/UserResponse';
import { ClientResponse } from 'src/interfaces/ClientResponse';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let testData: TestData;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    testData = global["testData"] as TestData;
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('POST /login', () => {
    it('if standard user', async () => {
      let user: User = testData.verifiedUsers.standard[0];
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: user.username,
          password: user.username
        })
        .then((res: request.Response) => {
          expect(res.status).toBe(200);
          let response = res.body as UserResponse;
          expect(response.token).toBeTruthy();
          expect(response.status).toBe(true);
        });
    });

    it('if admin user', async () => {
      let user: User = testData.verifiedUsers.admin[0];
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: user.username,
          password: user.username
        })
        .then((res: request.Response) => {
          expect(res.status).toBe(200);
          let response = res.body as UserResponse;
          expect(response.token).toBeTruthy();
          expect(response.status).toBe(true);
        });
    });
  });

  describe('GET /verifyToken', () => {
    it('if standard user', async () => {
      let user: User = testData.verifiedUsers.standard[0];

        await async.compose(
          (v, cb) => {
            request(app.getHttpServer())
            .get('/auth/verifyToken')
            .set('Authorization', `Bearer ${v}`)
            .send()
            .then((res: request.Response) => {
              expect(res.status).toBe(200);
              let cliRes = res.body as ClientResponse;
              expect(cliRes.status).toBe(true);
              cb();
            })
          },
          (v, cb) => {
            request(app.getHttpServer())
            .post('/auth/login')
            .send({
              username: user.username,
              password: user.username
            })
            .then((res: request.Response) => {
              expect(res.status).toBe(200);
              let response = res.body as UserResponse;
              expect(response.token).toBeTruthy();
              expect(response.status).toBe(true);
              cb(null, response.token);
            })
            .catch(err => {
              cb(err);
            });
          }
        )("dummy");
    });
  });

  describe('GET /confirm', () => {
    it('if standard user', async () => {
      let user: User = testData.nonVerifiedUsers.standard[2];

      await request(app.getHttpServer())
        .get('/auth/confirm')
        .query({
          username: user.username,
          confirmCode: user.confirmCode
        })
        .send()
        .then((res: request.Response) => {
          expect(res.status).toBe(200);
          let response = res.body as ClientResponse;
          expect(response.status).toBe(true);
        });
    });

    it('if admin user', async () => {
      let user: User = testData.nonVerifiedUsers.admin[2];

      await request(app.getHttpServer())
        .get('/auth/confirm')
        .query({
          username: user.username,
          confirmCode: user.confirmCode
        })
        .send()
        .then((res: request.Response) => {
          expect(res.status).toBe(200);
          let response = res.body as ClientResponse;
          expect(response.status).toBe(true);
        });
    });
  });

  describe('POST /save', () => {
    it('admin user can save new user', async () => {
      let user: User = testData.verifiedUsers.admin[0];
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({username: user.username, password: user.username})
        .then(async (res: request.Response) => {
          expect(res.status).toBe(200);
          let response = res.body as UserResponse;
          expect(response.token).toBeTruthy();
          expect(response.authResponse.isVerified).toBe(true);
          expect(response.authResponse.isAdmin).toBe(true);
          expect(response.authResponse.isAuthorized).toBe(true);
          await request(app.getHttpServer())
            .post('/auth/save')
            .set('Authorization', `Bearer ${response.token}`)
            .send({username: "qerty", password: "qerty"})
            .then((res: request.Response) => {
              expect(res.status).toBe(200);
              let response = res.body as ClientResponse;
              expect(response.status).toBe(true);
            });
        });
    });
  });

  describe('POST /confirmCode', () => {
    it('if valid user', async () => {
      let user: User = testData.nonVerifiedUsers.standard[3];
      await request(app.getHttpServer())
        .post('/auth/confirmCode')
        .send({username: user.username, password: user.username})
        .then((res: request.Response) => {
          expect(res.status).toBe(200);
          let response = res.body as ClientResponse;
          expect(response.status).toBe(true);
          expect(response.data.confirmCode).toBe(user.confirmCode);
        });
    });
  });

  describe('POST /save', () => {
    it('standard user cannot save new user', async () => {
      let user: User = testData.verifiedUsers.standard[0];
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({username: user.username, password: user.username})
        .then(async (res: request.Response) => {
          expect(res.status).toBe(200);
          let response = res.body as UserResponse;
          expect(response.token).toBeTruthy();
          expect(response.authResponse.isVerified).toBe(true);
          expect(response.authResponse.isAdmin).toBe(false);
          expect(response.authResponse.isAuthorized).toBe(true);
          await request(app.getHttpServer())
            .post('/auth/save')
            .set('Authorization', `Bearer ${response.token}`)
            .send({username: "qerty", password: "qerty"})
            .then((res: request.Response) => {
              expect(res.status).toBe(200);
              let response = res.body as ClientResponse;
              expect(response.status).toBe(false);
            });
        });
    });
  });

  describe('POST /login', () => {
    it('un registered user can\'t login', async () => {
      let user: User = { username: "qwert", password: "qwert" };
      await request(app.getHttpServer())
        .post('/auth/login')
        .send(user)
        .then((res: request.Response) => {
          debugger;
          expect(res.status).toBe(200)
          let response = res.body as UserResponse;
          expect(response.status).toBe(false);
        });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
