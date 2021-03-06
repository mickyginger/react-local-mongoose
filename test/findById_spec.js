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

describe('#findById tests', () => {
  let id;
  beforeEach(done => {
    Model.drop();
    Model.create(seedData)
      .then(records => {
        id = records[0]._id;
        done();
      });
  });

  it('should return a promise', done => {
    expect(Model.findById(id).constructor.name).to.eq('Promise');
    done();
  });

  it('should resolve with an object', done => {
    Model.findById(id)
      .then(record => {
        expect(record).to.be.an('object');
        done();
      });
  });

  it('should return the correct fields', done => {
    Model.findById(id)
      .then(record => {
        expect(record).to.have.all.keys(['_id', 'string', 'number', 'date']);
        done();
      });
  });

  it('should return the correct values', done => {
    Model.findById(id)
      .then(record => {
        expect(record._id).to.be.eq(id);
        expect(record.string).to.eq(seedData[0].string);
        expect(record.number).to.eq(seedData[0].number);
        expect(record.date).to.eq((new Date(seedData[0].date)).toISOString());
        done();
      });
  });
});
