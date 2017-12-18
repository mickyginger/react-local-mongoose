import { ObjectID } from 'bson';
import sift from 'sift';
import Promise from 'bluebird';

export { ObjectID };

class ReactLocalMongoose {
  constructor(schema, name) {
    this.tableName = name.toLowerCase();
    this.schema = schema;
    localStorage[this.tableName] = localStorage[this.tableName] || '[]';
  }

  getCollection(tableName=this.tableName) {
    return JSON.parse(localStorage[tableName]);
  }

  setCollection(collection) {
    localStorage[this.tableName] = JSON.stringify(collection);
    return collection;
  }

  populate(records) {
    const paths = Object.keys(this.schema).filter(path => {
      if(this.schema[path].constructor === Array) return this.schema[path][0].type === ObjectID;
      else return this.schema[path].type === ObjectID;
    });

    if(!paths.length) return records; // nothing to populate
    if(records.constructor !== Array) records = [records];

    paths.forEach(path => {
      const collection = this.getCollection(this.schema[path].ref.toLowerCase());
      records = records.map(record => {
        let foreignRecords;
        if(record[path].constructor === Array) {
          foreignRecords = sift({ _id: { $in: record[path] } }, collection);
        } else {
          foreignRecords = sift({ _id: record[path] }, collection);
          foreignRecords = foreignRecords.length ? foreignRecords[0] : null;
        }

        record[path] = foreignRecords;
        return record;
      });
    });

    return records;
  }

  validate(data) {
    const collection = this.getCollection();
    return new Promise((resolve, reject) => {
      // check for required keys
      const errors = {};

      // remove data not present in schema
      for(const key in data) {
        if(key !== '_id' && !this.schema[key]) delete data[key];
      }

      for(const key in this.schema) {
        const Type = this.schema[key].type;

        // check for required keys
        if(this.schema[key].required && !data[key]) {
          errors[key] = typeof this.schema[key].required === 'string' ? this.schema[key].required : `Path \`${key}\` is required`;
        }

        // check for data type
        if(data[key] && Type !== ObjectID && data[key].constructor !== Type) {
          try {
            data[key] = Type(data[key]);
          } catch(e) {
            errors[key] = `Cannot convert ${typeof data[key]} to ${Type.name.toLowerCase()}`;
          }
        }

        // check for unique keys
        if(data[key] && this.schema[key].unique) {
          const dupe = sift({ [key]: data[key] }, collection);
          if(dupe.length && data._id !== dupe[0]._id) {
            errors[key] = typeof this.schema[key].unique === 'string' ? this.schema[key].unique : `Path \`${key}\` must be unique`;
          }
        }

        // convert referenced documents to ids
        if(data[key] && Type === ObjectID) {
          data[key] = data[key]._id || data[key];
        }

        if(data[key] && Type === Array && this.schema[key][0].type === ObjectID) {
          data[key] = data[key].map(record => record._id || record);
        }
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
      if(!params) return resolve(this.populate(collection));
      const records = sift(params, collection);;
      return resolve(this.populate(records));
    });
  }

  findOne(params) {
    return this.find(params)
      .then(records => records.length ? records[0] : null);
  }

  findById(id) {
    return this.findOne({ _id: id });
  }

  update(params, data) {
    const collection = this.getCollection();

    return this.validate(data)
      .then(data => {
        delete data._id;
        const records = sift(params, collection);

        records.forEach(record => {
          Object.assign(record, data);
        });

        this.setCollection(collection);
        return records;
      });
  }

  findByIdAndUpdate(id, data) {
    return this.update({ _id: id }, data)
      .then(records => records.length ? records[0] : null);
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

  findByIdAndRemove(id) {
    return this.remove({ _id: id });
  }

  drop() {
    this.setCollection([]);
    return true;
  }

}

export default ReactLocalMongoose;
