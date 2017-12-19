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

describe('#create tests', () => {

  beforeEach(done => {
    Model.drop();
    done();
  });

  it('should return a promise', done => {
    expect(Model.create(seedData[0]).constructor.name).to.eq('Promise');
    done();
  });

  it('should accept an object as an argument, and resolve with an object', done => {
    Model.create(seedData[0])
      .then(record => {
        expect(record).to.be.an('object');
        done();
      });
  });

  it('should accept an array as an argument, and resolve with an array the same length as the data', done => {
    Model.create(seedData)
      .then(records => {
        expect(records).to.be.an('array');
        expect(records.length).to.eq(seedData.length);
        done();
      });
  });

  it('should create a unique id for each record', done => {
    Model.create(seedData)
      .then(records => {
        expect(records[0]._id)
          .to.be.a('string')
          .and.have.lengthOf(24);

        expect(records[1]._id)
          .to.be.a('string')
          .and.have.lengthOf(24);

        expect(records[0]._id).to.not.eq(records[1]._id);
        done();
      });
  });

  it('should return the correct fields', done => {
    Model.create(seedData)
      .then(records => {
        expect(records[0]).to.have.all.keys(['_id', 'string', 'number', 'date']);
        expect(records[1]).to.have.all.keys(['_id', 'string', 'number', 'date']);
        done();
      });
  });

  it('should return the correct values', done => {
    Model.create(seedData)
      .then(records => {
        expect(records[0].string).to.eq(seedData[0].string);
        expect(records[0].number).to.eq(seedData[0].number);
        expect(records[0].date.toString()).to.eq((new Date(seedData[0].date)).toString());
        expect(records[1].string).to.eq(seedData[1].string);
        expect(records[1].number).to.eq(seedData[1].number);
        expect(records[1].date.toString()).to.eq((new Date(seedData[1].date)).toString());
        done();
      });
  });

  it('should return the correct data types', done => {
    Model.create(seedData)
      .then(records => {
        expect(records[0]._id).to.be.a('string');
        expect(records[0].string).to.be.a('string');
        expect(records[0].number).to.be.a('number');
        expect(records[0].date.constructor).be.eq(Date);
        expect(records[1]._id).to.be.a('string');
        expect(records[1].string).to.be.a('string');
        expect(records[1].number).to.be.a('number');
        expect(records[1].date.constructor).be.eq(Date);
        done();
      });
  });
});
