import { ObjectID } from 'bson';
import sift from 'sift';
import Promise from 'bluebird';

export { ObjectID };

class ReactLocalMongoose {
  constructor(schema, tableName) {
    this.tableName = tableName;
    this.schema = schema;
    localStorage[this.tableName.toLowerCase()] = localStorage[this.tableName.toLowerCase()] || '[]';
    this.data = this.getCollection();
  }

  // get collection from localStorage and convert from JSON
  getCollection(tableName=this.tableName) {
    return JSON.parse(localStorage[tableName.toLowerCase()]);
  }

  // convert collection to JSON and set in localStorage
  setCollection(collection) {
    localStorage[this.tableName.toLowerCase()] = JSON.stringify(collection);
    return collection;
  }

  // populate references
  populate(records) {
    const isArray = records instanceof Array
    // if records is not an array, put it in an array to normalize the following functionality
    records = isArray ? records : [records];

    // grab the collection that we'll be needing for populaton
    const foreignCollections = {};
    for(const path in this.schema) {
      const { ref } = this.schema[path] instanceof Array ? this.schema[path][0] : this.schema[path];
      if(ref) foreignCollections[path] = this.getCollection(ref);
    }

    // replace the references with records
    records = records.map(record => {
      for(const path in foreignCollections) {
        if(this.schema[path] instanceof Array) {
          // if the path is an array in the schema, return an array of all matching foreign records
          record[path] = foreignCollections[path].filter(foreignRecord => record[path].includes(foreignRecord._id));
        } else {
          // otherwise just match by _id
          record[path] = foreignCollections[path].find(foreignRecord => foreignRecord._id === record[path]);
        }
      }
      return record;
    });

    return isArray ? records : records[0];
  }

  // convert embedded documents to ids
  // this allows users send an entire document to the database, but only the id will be stored
  convertDocsToRefs(data) {
    for(const path in this.schema) {
      // if the data is an object, replace it with object._id
      if(this.schema[path].type === ObjectID) {
        if(data[path]) data[path] = data[path]._id || data[path];
        else delete data[path];
      }

      // if the data is an array, create an array of object._id and remove falsey values
      if(this.schema[path] instanceof Array && this.schema[path][0].type === ObjectID) {
        data[path] = data[path].map(record => record._id || record).filter(id => !!id);
      }
    }

    return data;
  }

  // validate the data
  validate(data) {
    data = this.convertDocsToRefs(data);
    const errors = {};

    // remove data not in schema
    for(const path in data) if(!this.schema[path] && path !== '_id') delete data[path];

    for(const path in this.schema) {
      const {
        ref,
        type,
        required,
        unique,
        enum: _enum,
        pattern,
        max,
        min,
        maxlength,
        minlength
      } = this.schema[path] instanceof Array ? this.schema[path][0] : this.schema[path];
      const value = data[path];

      // required
      if(required && !value) {
        const message = typeof required === 'string' ? required : `Path \`${path}\` is required.`;
        errors[path] = Object.assign(errors[path] || {}, { required: message });
      }

      // unique
      if(unique && value) {
        const message = typeof required === 'string' ? unique : `Path \`${path}\` must be unique.`;
        const dupes = sift({ [path]: value }, this.getCollection());
        if(dupes.length && dupes[0]._id !== data._id) errors[path] = Object.assign(errors[path] || {}, { unique: message });
      }

      // enum
      if(_enum && value && _enum instanceof Array && !_enum.includes(value)) {
        errors[path] = Object.assign(errors[path] || {}, { enum: `Path \`${path}\` is invalid` });
      }

      // pattern
      if(pattern && value && pattern instanceof RegExp && !pattern.test(value)) {
        errors[path] = Object.assign(errors[path] || {}, { pattern: `Path \`${path}\` is invalid` });
      }

      // max
      if(max && value && typeof value === 'number' && value > max) {
        errors[path] = Object.assign(errors[path] || {}, { max: `Path \`${path}\` is too large` });
      }

      // min
      if(min && value && typeof value === 'number' && value < min) {
        errors[path] = Object.assign(errors[path] || {}, { min: `Path \`${path}\` is too small` });
      }

      // maxlength
      if(maxlength && value && typeof value === 'string' && value.length > maxlength) {
        errors[path] = Object.assign(errors[path] || {}, { maxlength: `Path \`${path}\` is too long` });
      }

      // minlength
      if(minlength && value && typeof value === 'string' && value.length < minlength) {
        errors[path] = Object.assign(errors[path] || {}, { minlength: `Path \`${path}\` is too short` });
      }

      // coerce the data to the type specified in the schema
      if(type === Date) {
        // attempt to convert the date to an ISO string
        try {
          data[path] = (new Date(value)).toISOString();
        } catch(e) {
          // if the date is invalid, update the errors
          Object.assign({}, errors, { [path]: { type: 'Invalid date' } });
        }
      } else if (type !== ObjectID) {
        // `type` is a constructor fuction set in the schema (String, Number etc.)
        data[path] = type(value);
      }
    }

    return new Promise((resolve, reject) => {
      // if the validations have failed reject the promise with an error
      if(Object.keys(errors).length) {
        const err = new Error('Validation Failed');
        err.errors = errors;
        return reject(err);
      }

      // otherwise resolve with the data
      return resolve(data);
    });
  }

  // create records
  create(data={}) {
    const collection = this.getCollection();

    // if the data is not an array, put it in an array to normalize the following functionality
    if(!(data instanceof Array)) data = [data];

    // create an array of validation promises for the array of data
    const validations = data.map(data => {
      // create an id for each record
      data._id = data._id || ObjectID().toString();
      return this.validate(data);
    });

    // once the validations have passed, store the data in localStorage
    return Promise.all(validations)
      .then(data => {
        this.setCollection(collection.concat(data));
        return data.length === 1 ? data[0] : data;
      });
  }

  makeQuery(query) {
    // get all the records
    const collection = this.getCollection();
    // if there is a query, use sift to find the matched records, otherwise return the entire collection
    return query ? sift(query, collection) : collection;
  }

  // find a record
  find(query={}) {
    const records = this.populate(this.makeQuery(query));
    return Promise.resolve(records);
  }

  // find a single record
  findOne(query={}) {
    const record = this.populate(this.makeQuery(query)[0]);
    return Promise.resolve(record);
  }

  // find a record by id
  findById(id) {
    if(!id) throw new Error('ID required');
    return this.findOne({ _id: id });
  }

  // update records
  update(query={}, data) {
    // get the collection and find the matching records using sift
    const collection = this.getCollection();
    const records = sift(query, collection);

    // update the records with the new data, then validate
    const promises = records.map(record => {
      Object.assign(record, data);
      return this.validate(record);
    });

    // once updated data is validated, persist to localStorage and return the updated records
    return Promise.all(promises)
      .then(() => {
        this.setCollection(collection);
        return records;
      });
  }

  // update a single record by id
  findOneAndUpdate(query={}, data) {
    // get the collection and find the matching records using sift
    const collection = this.getCollection();
    const record = sift(query, collection)[0];
    // update the records with the new data, then validate
    Object.assign(record, data);
    return this.validate(record)
      .then(() => {
        // once updated data is validated, persist to localStorage and return the updated records
        this.setCollection(collection);
        return record;
      });
  }

  // update a single record by id
  findByIdAndUpdate(id, data) {
    if(!id) throw new Error('ID required');
    return this.findOneAndUpdate({ _id: id }, data);
  }

  // remove records
  remove(query={}) {
    // et the collection and find the matching records using sift
    const collection = this.getCollection();
    const records = sift(query, collection);

    // remove each matching record from the collection
    records.forEach(record => {
      const index = collection.indexOf(record);
      collection.splice(index, 1);
    });

    // persist the updated collection to localStorage
    return new Promise((resolve) => {
      this.setCollection(collection);
      return resolve(null);
    });
  }


  findOneAndRemove(query={}) {
    // et the collection and find the matching records using sift
    const collection = this.getCollection();
    const record = sift(query, collection)[0];

    // remove each matching record from the collection
    const index = collection.indexOf(record);
    collection.splice(index, 1);

    // persist the updated collection to localStorage
    return new Promise((resolve) => {
      this.setCollection(collection);
      return resolve(null);
    });
  }

  // remove a record by id
  findByIdAndRemove(id) {
    if(!id) throw new Error('ID required');
    return this.remove({ _id: id });
  }

  // re-set the collection to an empty array
  drop() {
    this.setCollection([]);
    return true;
  }

}

export default ReactLocalMongoose;
