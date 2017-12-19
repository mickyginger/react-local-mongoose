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

describe('#update tests', () => {

  beforeEach(done => {
    Model.drop();
    Model.create(seedData)
      .then(() => done());
  });

  it('should return a promise', done => {
    expect(Model.update().constructor.name).to.eq('Promise');
    done();
  });

  it('return an array of records', done => {
    Model.update({ string: 'abc' }, seedData[1])
      .then(records => {
        expect(records).to.be.an('array');
        done();
      });
  });

  it('should return the correct fields', done => {
    Model.update({ string: 'abc' }, seedData[1])
      .then(records => {
        expect(records[0]).to.have.all.keys(['_id', 'string', 'number', 'date']);
        done();
      });
  });

  xit('should return the correct values', done => {
    Model.update({ string: 'abc' }, seedData[1])
      .then(records => {
        expect(records[0].string).to.eq(seedData[1].string);
        expect(records[0].number).to.eq(seedData[1].number);
        expect(records[0].date).to.eq((new Date(seedData[0].date)).toISOString());
        done();
      });
  });

  xit('should return the correct data types', done => {
    Model.update({ string: 'abc' }, seedData[1])
      .then(records => {
        expect(records[0]._id).to.be.a('string');
        expect(records[0].string).to.be.a('string');
        expect(records[0].number).to.be.a('number');
        expect(records[0].date).to.be.a('string');
        done();
      });
  });
});
