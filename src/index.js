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

  // get collection from localStorage and convert from JSON
  getCollection(tableName=this.tableName) {
    return JSON.parse(localStorage[tableName]);
  }

  // convert collection to JSON and set in localStorage
  setCollection(collection) {
    localStorage[this.tableName] = JSON.stringify(collection);
    return collection;
  }

  // populate references
  populate(records) {
    // locate paths that need populating by checking the schema
    const paths = Object.keys(this.schema).filter(path => {
      if(this.schema[path].constructor === Array) return this.schema[path][0].type === ObjectID;
      else return this.schema[path].type === ObjectID;
    });

    // if no paths have type ObjectID, then there is nothing to do here, return records as they are
    if(!paths.length) return records;

    // if we are populating a single record, put it into an array to normalize the following functionality
    if(records.constructor !== Array) records = [records];

    // for each path that needs to be populated
    paths.forEach(path => {
      // get the foriegn collection name from the schema
      const collectionName = (this.schema[path].constructor === Array ? this.schema[path][0].ref : this.schema[path].ref).toLowerCase();
      // get the foreign collection from localStorage
      const collection = this.getCollection(collectionName);
      // map over the records to be populated
      records = records.map(record => {
        let foreignRecords;
        if(!record[path]) {
          // if there is no data set for this path for this record, do nothing
          return record;
        } else if(record[path].constructor === Array) {
          // if we are populating an array, find all the records in the array of ids
          foreignRecords = sift({ _id: { $in: record[path] } }, collection);
        } else {
          // if we are populating a single object, sift will still return an array, select the first element in the array
          foreignRecords = sift({ _id: record[path] }, collection);
          foreignRecords = foreignRecords.length ? foreignRecords[0] : null;
        }

        // overwrite the existing path with the foreignRecords found
        record[path] = foreignRecords;
        return record;
      });
    });

    return records;
  }

  // validate required
  checkRequired(key, data, errors) {
    if(
        // if the data is an array, check that there are no `null` values
        (
          this.schema[key].constructor === Array &&
          this.schema[key][0].required &&
          data[key] &&
          data[key].constructor === Array &&
          data[key].some(data => data === null)
        ) ||
        // if not, check that there is data present
        (
          this.schema[key].required && !data[key]
        )
    ) {
      errors[key] = typeof this.schema[key].required === 'string' ? this.schema[key].required : `Path \`${key}\` is required`;
    }
  }

  // attempt to coerce the data to the specified data type
  // NB: this will not throw an error, so objects may be converted to `[object Object]` etc.
  checkDataType(key, data, errors) {
    const isArray = this.schema[key].constructor === Array;
    const Type = isArray ? this.schema[key][0].type : this.schema[key].type;
    if(isArray) {
      data[key] = data[key].map(data => {
        return Type !== ObjectID ? Type(data) : data;
      });
    } else {
      data[key] = Type !== ObjectID ? Type(data[key]) : data[key];
    }
  }

  // check whether the value has already been used in the collection
  // NB: if the data is an array, do not check for uniqueness
  checkUnique(key, data, errors, collection) {
    const isArray = this.schema[key].constructor === Array;

    if(data[key] && !isArray && this.schema[key].unique) {
      const dupe = sift({ [key]: data[key] }, collection);
      if(dupe.length && data._id !== dupe[0]._id) {
        errors[key] = typeof this.schema[key].unique === 'string' ? this.schema[key].unique : `Path \`${key}\` must be unique`;
      }
    }
  }

  // convert embedded documents to ids, this allows users send an entire document to the database, but only the id will be stored
  convertDocsToIds(key, data) {
    if(data[key] && this.schema[key].constructor === Array && this.schema[key][0].type === ObjectID) {
      data[key] = data[key].map(record => record._id || record);
    }

    if(data[key] && this.schema[key].type === ObjectID) {
      data[key] = data[key]._id || data[key];
    }

  }

  // validate the data
  validate(data) {

    return new Promise((resolve, reject) => {
      const errors = {};
      const collection = this.getCollection();

      // remove data not present in schema
      for(const key in data) {
        if(key !== '_id' && !this.schema[key]) delete data[key];
      }

      // loop through the schema, checking each path for validity
      for(const key in this.schema) {
        this.checkRequired(key, data, errors);
        this.checkDataType(key, data, errors);
        this.checkUnique(key, data, errors, collection);
        this.convertDocsToIds(key, data);
      }

      // if the errors object has keys, then the data is invalid
      if(Object.keys(errors).length) {
        // return an error object
        const err = new Error('Validation Failed');
        err.errors = errors;
        return reject(err);
      } else {
        // return the verified data
        return resolve(data);
      }
    });
  }

  // create records
  create(data) {
    const collection = this.getCollection();

    // if the data is not an array, put it in an array to normalize the following functionality
    if(data.constructor !== Array) data = [data];

    // create an array of validation promises for the array of data
    const validations = data.map(data => {
      // create an id for each record
      data._id = data._id || ObjectID().toString();
      return this.validate(data);
    });

    // once the validations have passed, store the data in localStorage
    return Promise.all(validations)
      .then(data => this.setCollection(collection.concat(data)));
  }

  // find a record
  find(query) {
    return new Promise(resolve => {
      // get all the records
      const collection = this.getCollection();
      // if there is no query, return the whole collection, after population
      if(!query) return resolve(this.populate(collection));
      // otherwise use sift to find the matched records
      const records = sift(query, collection);;
      // return the populated records
      return resolve(this.populate(records));
    });
  }

  // find a single record
  findOne(query) {
    return this.find(query)
      .then(records => records.length ? records[0] : null);
  }

  // find a record by id
  findById(id) {
    return this.findOne({ _id: id });
  }

  // update records
  update(query, data) {
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
  findByIdAndUpdate(id, data) {
    return this.update({ _id: id }, data)
      .then(records => records.length ? records[0] : null);
  }

  // remove records
  remove(query) {
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

  // remove a record by id
  findByIdAndRemove(id) {
    return this.remove({ _id: id });
  }

  // re-set the collection to an empty array
  drop() {
    this.setCollection([]);
    return true;
  }

}

export default ReactLocalMongoose;
