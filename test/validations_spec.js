/* global describe, it, before */

import { expect } from 'chai';
import LocalDb from '../src';

const schema = {
  string: { type: String, required: 'This field is required', unique: 'That string has already been used' },
  number: { type: Number, required: true, unique: true }
};

const Model = new LocalDb(schema, 'Model');

const seedData = [{
  string: 'abc',
  number: 123,
  date: '2015-01-10'
}, {
  string: 'def',
  number: 456,
  date: '1981-06-01'
}];

describe('validations tests', () => {
  before(done => {
    Model.drop();
    Model.create(seedData)
      .then(() => done());
  });

  it('should reject with errors object', done => {
    Model.create({})
      .catch(err => {
        expect(err.errors).to.be.an('object');
        done();
      });
  });

  it('should validate for required fields', done => {
    Model.create({})
      .catch(err => {
        expect(err.errors.string.required).to.be.eq('This field is required');
        done();
      });
  });

  it('should validate for unique fields', done => {
    Model.create({
      string: 'abc',
      number: 123,
      date: '2015-01-10'
    })
      .catch(err => {
        expect(err.errors.string.unique).to.be.eq('That string has already been used');
        done();
      });
  });

  it('should return a custom error messages if supplied', done => {
    Model.create({})
      .catch(err => {
        expect(err.errors.string.required).to.be.eq('This field is required');
        done();
      });
  });

  it('should return a generic message if not', done => {
    Model.create({})
      .catch(err => {
        expect(err.errors.number.required).to.be.eq('Path `number` is required.');
        done();
      });
  });

});
