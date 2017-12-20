/* global describe, it, before */

import { expect } from 'chai';
import LocalDb, { ObjectID } from '../src';

const schema = {
  string: {
    type: String,
    required: 'This field is required',
    unique: 'That string has already been used',
    maxlength: 5,
    minlength: 4,
    enum: ['Mork', 'Mindy'],
    pattern: /M[a-z]{3,4}/
  },
  number: {
    type: Number,
    required: true,
    unique: true,
    max: 10,
    min: 5
  },
  date: {
    type: Date,
    required: true
  },
  embedded: {
    string: { type: String, required: true },
    reference: { type: ObjectID, ref: 'Other' },
    embedded: {
      string: { type: String, required: true },
      reference: { type: ObjectID, ref: 'Other' },
      embedded: {
        string: { type: String },
        reference: { type: ObjectID, ref: 'Other' }
      }
    }
  },
  embeddedArray: [{
    string: { type: String, required: true },
    reference: { type: ObjectID, ref: 'Other' },
    embeddedArray: [{
      string: { type: String, required: true },
      reference: { type: ObjectID, ref: 'Other' }
    }]
  }]
};

const Model = new LocalDb(schema, 'Model');

const seedData = [{
  string: 'Mork',
  number: 5,
  date: '2015-01-10'
}, {
  string: 'Mindy',
  number: 10,
  date: '1981-06-01'
}];

describe('validations tests', () => {
  before(done => {
    Model.drop();
    Model.create(seedData)
      .then(() => done())
      .catch(done);
  });

  it('should reject with errors object', done => {
    Model.create()
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
      string: 'Mork'
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

  it('should validate for min minlength enum and pattern', done => {
    Model.create({
      number: 1,
      string: 'abc'
    })
      .catch(err => {
        expect(err.errors.number.min).to.eq('Path `number` is too small');
        expect(err.errors.string.minlength).to.eq('Path `string` is too short');
        expect(err.errors.string.enum).to.eq('Path `string` is invalid');
        expect(err.errors.string.pattern).to.eq('Path `string` is invalid');
        done();
      });
  });

  it('should validate for maxlength max', done => {
    Model.create({
      number: 100000,
      string: 'abcdefghijklmnopqrstuvwxyz'
    })
      .catch(err => {
        expect(err.errors.number.max).to.eq('Path `number` is too large');
        expect(err.errors.string.maxlength).to.eq('Path `string` is too long');
        done();
      });
  });

  it('should validated embedded objects', done => {
    Model.create({
      embedded: {
        embedded: {
          embedded: {}
        }
      }
    })
      .catch(err => {
        expect(err.errors.embedded.string.required).to.eq('Path `string` is required.');
        expect(err.errors.embedded.embedded.string.required).to.eq('Path `string` is required.');
        done();
      });
  });

});
