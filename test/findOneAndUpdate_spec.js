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

describe('#findOneAndUpdate tests', () => {

  beforeEach(done => {
    Model.drop();
    Model.create(seedData)
      .then(() => done());
  });

  it('should return a promise', done => {
    expect(Model.findOneAndUpdate().constructor.name).to.eq('Promise');
    done();
  });

  it('should return a single record', done => {
    Model.findOneAndUpdate({ string: { $exists: true } }, seedData[1])
      .then(record => {
        expect(record).to.be.an('object');
        done();
      });
  });

  it('should return the correct fields', done => {
    Model.findOneAndUpdate({ string: { $exists: true } }, seedData[1])
      .then(record => {
        expect(record).to.have.all.keys(['_id', 'string', 'number', 'date']);
        done();
      });
  });

  it('should return the correct values', done => {
    Model.findOneAndUpdate({ string: { $exists: true } }, seedData[1])
      .then(record => {
        expect(record.string).to.eq(seedData[1].string);
        expect(record.number).to.eq(seedData[1].number);
        expect(record.date).to.eq((new Date(seedData[1].date)).toISOString());
        done();
      });
  });

  it('should return the correct data types', done => {
    Model.findOneAndUpdate({ string: { $exists: true } }, seedData[1])
      .then(record => {
        expect(record._id).to.be.a('string');
        expect(record.string).to.be.a('string');
        expect(record.number).to.be.a('number');
        expect(record.date).be.a('string');
        done();
      });
  });
});
