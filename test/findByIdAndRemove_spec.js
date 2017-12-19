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

describe('#findByIdAndRemove tests', () => {
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
    expect(Model.findByIdAndRemove(id).constructor.name).to.eq('Promise');
    done();
  });

  it('should return null', done => {
    Model.findByIdAndRemove(id)
      .then(response => {
        expect(response).to.be.null;
        done();
      });
  });

  it('should have removed the record', done => {
    Model.findByIdAndRemove(id)
      .then(() => Model.find())
      .then(records => {
        expect(records.length).to.eq(1);
        expect(records[0].string).to.eq('def');
        done();
      });
  });
});
