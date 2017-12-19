# React Local Mongoose

[![Travis Build Status](https://travis-ci.org/mickyginger/react-local-mongoose.svg?branch=1.1.1)](https://travis-ci.org/mickyginger/react-local-mongoose)
[![npm version](https://badge.fury.io/js/react-local-mongoose.svg)](https://badge.fury.io/js/react-local-mongoose)

## A mongoose-esque wrapper for localStorage

> NB: This package is not affiliated with Mongoose in any way. It is simply an attempt to match their API.

This package has been heavily influenced by [LocalDB](https://github.com/kucukkanat/LocalDB) by [kucukkanat](https://github.com/kucukkanat).

### Installation

Install with `npm` or `yarn`:

```sh
npm i --save react-local-mongoose

yarn add react-local-mongoose
```

### Defining a model

```js
import LocalDb from 'react-local-mongoose';

const schema = {
  pathName: { type[, required[, unique[, ref ]  ] ] }
};

const model = new LocalDb(schema, collectionName);
```

#### Arguments

- **schema** _Object_: Contains path names with settings. _Required_
  - **pathName** _(Object|Array)_: settings for each path. Can only be an array of references at this time.
    - **type** _Constructor_: data type for path (eg `ObjectID`, `String`, `Number`, `Boolean` etc). _Required_
    - **required** _(Boolean|String)_: indicates whether field is required. If string is provided, it will be used as an error message.
    - **unique** _(Boolean|String)_: indicates whether field should be unique. If string is provided, it will be used as an error message.
    - **ref** _String_: indicates the name of the referenced model.
- **collectionName**: String used to set collection in `localStorage` (eg: 'User', 'Post', 'Cheese' etc). _Required_

#### Return value

A new instance of `LocalDb` which behaves like a mongoose model

#### Example

```js
import LocalDB, { ObjectID } from 'react-local-mongoose';

const cheeseSchema = {
  name: { type: String, required: 'This field is required', unique: 'That name is already taken' },
  origin: { type: ObjectID, ref: 'Country', required: true }, // reference to Country model
  strength: { type: Number, required: true },
  tastingNotes: { type: String },
  image: { type: String }
};

const Cheese = new LocalDB(cheeseSchema, 'Cheese');

export default Cheese;
```

---

### Querying Methods

> **NB**: In all examples `Cheese` is a model created using the example above

#### `find`

```js
Cheese.find(query)
```

#### Arguments

- **query** _Object_: An object defining search params. Uses [sift](https://github.com/crcn/sift.js) for mongodb-esque queries

#### Return value

A promise which resolves all documents that match the query.

---

#### `findOne`

```js
Cheese.findOne(query)
```

#### Arguments

- **query** _Object_: An object defining search params. Uses [sift](https://github.com/crcn/sift.js) for mongodb-esque queries

#### Return value

A promise which resolves with the first document that matches the query.

---

#### `findById`

```js
Cheese.findById(id)
```

#### Arguments

- **id** _String_: The id of the document to find.

#### Return value

A promise which resolves with the found document or null. If the document contains references, they will be populated.

#### Examples

```js
Cheese.find({ strength: 4 })
  .then(records => console.log(records)); // returns an array of all records that have a strength of 4

Cheese.findOne({ name: 'Gorgonzola' })
  .then(record => console.log(record)); // returns the first record with the name of 'Gorgonzola'

Cheese.findById('5a36be1b15301600007f38f7')
  .then(record => console.log(record)); // returns the record with the id of '5a36be1b15301600007f38f7'
```

---

#### `create`

```js
Cheese.create(data)
```

#### Arguments

- **data** _(Object|Array)_: An object containing the data to be stored, or an array containing objects to be stored. Data will be validated before saving to localStorage.

#### Return value

A promise which resolves with the stored documents, and rejects with an error containing validation error messages.

#### Example

```js
Cheese.create({ name: 'Gorgonzola', strength: 4 })
  .catch(err => console.log(err.errors)); // { name: 'That name is already taken', origin: 'Path `origin` is required' }

Country.find({ $or: [{ name: 'Italy' }, { name: 'Netherlands'} ] })
  .then(countries => {
    return Cheese.create([
      { name: 'Gorgonzola', origin: countries[0], strength: 4 },
      { name: 'Edam', origin: countries[1], strength: 2 }
    ])
  })

  .then(records => console.log(records));
/*
  [
    { _id: '5a36be1b15301600007f38f7', 'name: 'Gorgonzola', origin: '5a37d33656e4ce00008a9b31', strength: 4 },
    { _id: '5a36be1b15301600007f38f8', name: 'Edam', origin: '5a37d33656e4ce00008a9b26', strength: 2 }
  ]
*/
```

---

#### `update`

```js
Cheese.update(query, data)
```

#### Arguments

- **query** _Object_: An object defining search params. Uses [sift](https://github.com/crcn/sift.js) for mongodb-esque queries
- **data** _(Object|Array)_: An object containing the data to be updated.

#### Return value

A promise which resolves with the updated documents, and rejects with an error containing validation error messages.

#### Example

```js
Cheese.update({ name: 'Gorgonzola' }, { strength: 2 })
  .then(records => console.log(records))); // [{ name: 'Gorgonzola', origin: '5a37d33656e4ce00008a9b31', strength: 2 }]
```

---

#### `findByIdAndUpdate`

```js
Cheese.findByIdAndUpdate(id, data)
```

#### Arguments

- **id** _String_: The id of the document to find.
- **data** _(Object|Array)_: An object containing the data to be updated.

#### Return value

A promise which resolves with the updated document, and rejects with an error containing validation error messages.

#### Example

```js
Cheese.findByIdAndUpdate('5a36be1b15301600007f38f7', { strength: 2 })
  .then(records => console.log(records))); // { name: 'Gorgonzola', origin: '5a37d33656e4ce00008a9b31', strength: 2 }
```

---

#### `remove`

```js
Cheese.remove(query)
```

#### Arguments

- **query** _Object_: An object defining search params. Uses [sift](https://github.com/crcn/sift.js) for mongodb-esque queries

#### Return value

A promise which resolves with `null`.

#### Example

```js
Cheese.remove({ name: 'Gorgonzola' })
  .then(() => console.log('Record removed'));
```

---

#### `findByIdAndRemove`

```js
Cheese.findByIdAndRemove(id)
```

#### Arguments

- **id** _String_: The id of the document to remove.

#### Return value

A promise which resolves with `null`.

#### Example

```js
Cheese.findByIdAndRemove('5a36be1b15301600007f38f7')
  .then(() => console.log('Record removed'));
```

---

#### `drop`

```js
Cheese.drop()
```

#### Return value

`drop` always returns `true`.

#### Example

```js
Cheese.drop(); // true
```
---

## Limitations

### Storage capacity

The amount of data that can be stored is depended on device and browser. For more info check out these resources:

- [Test of localStorage limits/quota](https://arty.name/localstorage.html)
- [Working with quota on mobile browsers](https://www.html5rocks.com/en/tutorials/offline/quota-research/)
- [How much data can a browser save in localStorage](https://stackoverflow.com/questions/10654148/how-much-data-can-a-browser-save-in-localstorage)

### Embedded / Referenced Data

Mongoose and Mongo allow for embedded schemas and references to other collections, with population functionality. This is not and will never be a full implementation of mongodb or mongoose on the client-side. Complex data structures are better persisted to an actual database.

I have added the ability to set references to models, however their use is limited. References can be set by passing an id or array of ids, or a record or an array of records. (see the examples above).

All find methods will populate records accordingly.

Embedded records are not supported at this time. It requires recursively validating the data, and populating. Again I may add it in the future.

### Document methods, virtuals and other advanced Mongoose features

Again, if you need mongoose's advanced feature set, best use mongoose in conjunction with an API, and make requests via AJAX.

## Contributing

Contributions are very welcome.

- Fork the repository
- `yarn install` or `npm i` to install the dependencies
- `yarn link` or `npm link` to make your local fork available to other local projects
- `yarn link react-local-mongoose` or `npm link react-local-mongoose` in a local React project to test your updates
- When you're happy make a PR!

### To do

- ~~Write tests~~
- Add embedded / ~~referenced~~ functionality
- Cross-browser compatibility testing
- Mobile device testing
