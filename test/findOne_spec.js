/* global describe, it, beforeEach */

import { expect } from 'chai';
import LocalDb from '../src';

const schema = {
  string: { type: String, required: true, unique: true },
  number: { type: Number, required: true, unique: true },
  date: { type: Date, required: true, unique: true }
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

describe('#findOne tests', () => {

  beforeEach(done => {
    Model.drop();
    Model.create(seedData)
      .then(() => done());
  });

  it('should return a promise', done => {
    expect(Model.findOne().constructor.name).to.eq('Promise');
    done();
  });

  it('should resolve with an object', done => {
    Model.findOne({ string: 'abc' })
      .then(record => {
        expect(record).to.be.an('object');
        done();
      });
  });

  it('should return the correct fields', done => {
    Model.findOne({ string: 'abc' })
      .then(record => {
        expect(record).to.have.all.keys(['_id', 'string', 'number', 'date']);
        done();
      });
  });

  it('should return the correct values', done => {
    Model.findOne({ string: 'abc' })
      .then(record => {
        expect(record._id).to.be.a('string');
        expect(record.string).to.eq(seedData[0].string);
        expect(record.number).to.eq(seedData[0].number);
        expect(record.date).to.eq((new Date(seedData[0].date)).toISOString());
        done();
      });
  });
});
