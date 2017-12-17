import { ObjectID } from 'bson';
import sift from 'sift';
import Promise from 'bluebird';

class ReactLocalMongoose {
  constructor(schema, name) {
    this.tableName = name.toLowerCase();
    this.schema = schema;
    localStorage[this.tableName] = localStorage[this.tableName] || '[]';
  }

  getCollection() {
    return JSON.parse(localStorage[this.tableName]);
  }

  setCollection(collection) {
    localStorage[this.tableName] = JSON.stringify(collection);
  }

  validate(data) {
    const collection = this.getCollection();
    return new Promise((resolve, reject) => {
      // check for required keys
      const errors = {};
      for(const key in this.schema) {
        const Type = this.schema[key].type;

        // check for required keys
        if(this.schema[key].required && !data[key]) {
          errors[key] = typeof this.schema[key].required === 'string' ? this.schema[key].required : `Path \`${key}\` is required`;
        }

        // check for data type
        if(data[key] && data[key].constructor !== Type) {
          errors[key] = `Path ${key} is of type ${typeof data[key]} but should be ${Type.name.toLowerCase()}`;
        }

        // check for unique keys
        if(data[key] && this.schema[key].unique && sift({ [key]: data[key] }, collection).length > 0) {
          errors[key] = typeof this.schema[key].unique === 'string' ? this.schema[key].unique : `Path \`${key}\` must be unique`;
        }
      }

      for(const key in data) {
        // remove data not present in schema
        if(key !== '_id' && !this.schema[key]) delete data[key];
      }

      if(Object.keys(errors).length) {
        const err = new Error('Validation Failed');
        err.errors = errors;
        return reject(err);
      } else {
        return resolve(data);
      }
    });
  }

  create(data) {
    const collection = this.getCollection();

    if(data.constructor !== Array) data = [data];

    const validations = data.map(data => {
      data._id = data._id || ObjectID().toString();
      return this.validate(data);
    });

    return Promise.all(validations)
      .then(data => this.setCollection(collection.concat(data)));
  }

  find(params) {
    return new Promise(resolve => {
      const collection = this.getCollection();
      if(!params) return resolve(collection);
      return resolve(sift(params, collection));
    });
  }

  findOne(params) {
    return this.find(params)
      .then(records => records.length ? records[0] : null);
  }

  findById(id) {
    return this.findOne({ _id: id });
  }

  remove(params) {
    const collection = this.getCollection();

    return new Promise((resolve) => {
      const records = sift(params, collection);

      records.forEach(record => {
        const index = collection.indexOf(record);
        collection.splice(index, 1);
      });

      this.setCollection(collection);
      return resolve(null);
    });
  }

  removeById(id) {
    return this.remove({ _id: id });
  }

  drop() {
    this.setCollection([]);
    return true;
  }

}

export default ReactLocalMongoose;
