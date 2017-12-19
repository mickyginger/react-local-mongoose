/* global describe, it, beforeEach */

import { expect } from 'chai';
import LocalDb, { ObjectID } from '../src';

const adultSchema = {
  name: { type: String, required: true, unique: true },
  children: [{ type: ObjectID, ref: 'Child' }]
};

const childSchema = {
  name: { type: String, required: true, unique: true },
  adult: { type: ObjectID, ref: 'Adult' }
};

const Adult = new LocalDb(adultSchema, 'Adult');
const Child = new LocalDb(childSchema, 'Child');

describe('population tests', () => {
  beforeEach(done => {
    Adult.drop();
    Child.drop();

    const adultId = ObjectID().toString();
    const childIds = [ObjectID().toString(), ObjectID().toString()];
    const adultData = {
      _id: adultId,
      name: 'Tom',
      children: childIds
    };

    const childData = [{
      _id: childIds[0],
      name: 'Steph',
      adult: adultId
    }, {
      _id: childIds[1],
      name: 'Kevin',
      adult: adultId
    }];

    Adult.create(adultData)
      .then(() => Child.create(childData))
      .then(() => done());
  });

  it('should populate references on find', done => {
    Adult.findOne({})
      .then(adult => {
        expect(adult.children[0]).to.be.an('object').and.have.all.keys(['_id', 'name', 'adult']);
        expect(adult.children[1]).to.be.an('object').and.have.all.keys(['_id', 'name', 'adult']);
        return Child.findOne({});
      })
      .then(child => {
        expect(child.adult).to.be.an('object').and.have.all.keys(['_id', 'name', 'children']);
        done();
      });
  });
});
