import request from 'supertest';
import app from '../../../app';

jest.mock('../../../middleware/logging');
jest.mock('../../../middleware/auth');

describe('PATCH /fragments', () => {
  const testEndpoint = `/fragments`;

  describe('success', () => {
    it('should return 204', done => {
      request(app)
        .patch(testEndpoint)
        .send({
          transferComplete: true
        })
        .expect(204)
        .end(done);
    });
  });

  describe('validation for transferComplete', () => {
    it('should return 422 if transferComplete is not provided in body', done => {
      request(app)
        .patch(testEndpoint)
        .send()
        .expect(422)
        .end(done);
    });

    it('should return error message if transferComplete is not provided in body', done => {
      request(app)
        .patch(testEndpoint)
        .send()
        .expect(res => {
          expect(res.body).toEqual({
            errors: expect.arrayContaining([{ transferComplete: 'Invalid value' }])
          });
        })
        .end(done);
    });
  });
});
