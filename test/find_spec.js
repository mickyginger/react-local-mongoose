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

describe('#find tests', () => {

  beforeEach(done => {
    Model.drop();
    Model.create(seedData)
      .then(() => done());
  });

  it('should return a promise', done => {
    expect(Model.find().constructor.name).to.eq('Promise');
    done();
  });

  it('should resolve with an array', done => {
    Model.find()
      .then(records => {
        expect(records).to.be.an('array');
        done();
      });
  });

  it('should return the correct number of records', done => {
    Model.find()
      .then(records => {
        expect(records.length).to.eq(2);
        done();
      });
  });

  it('should return the correct fields', done => {
    Model.find()
      .then(records => {
        expect(records[0]).to.have.all.keys(['_id', 'string', 'number', 'date']);
        expect(records[1]).to.have.all.keys(['_id', 'string', 'number', 'date']);
        done();
      });
  });

  it('should return the correct values', done => {
    Model.find()
      .then(records => {
        expect(records[0]._id).to.be.a('string');
        expect(records[0].string).to.eq(seedData[0].string);
        expect(records[0].number).to.eq(seedData[0].number);
        expect(records[0].date).to.eq((new Date(seedData[0].date)).toISOString());
        expect(records[1]._id).to.be.a('string');
        expect(records[1].string).to.eq(seedData[1].string);
        expect(records[1].number).to.eq(seedData[1].number);
        expect(records[1].date).to.eq((new Date(seedData[1].date)).toISOString());
        done();
      });
  });
});
