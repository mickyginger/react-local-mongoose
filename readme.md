# React Local Mongoose

## A mongoose-esque wrapper for localStorage

> NB: This package is not affiliated with Mongoose in any way. It is simply an attempt to match their API.

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
  pathName: { type[, required[, unique ] ] }
};

const model = new LocalDb(schema, collectionName);
```

#### Arguments

- **schema** _Object_: Contains path names with settings _Required_
  - **pathName** _Object_: settings for each path
    - **type** _Constructor_: data type for path (eg `String`, `Number`, `Boolean` etc) _Required_
    - **required** _(Boolean|String)_: indicates whether field is required. If string is provided, it will be used as an error message
    - **unique** _(Boolean|String)_: indicates whether field should be unique. If string is provided, it will be used as an error message
- **collectionName**: String used to set collection in `localStorage` (eg: 'User', 'Post', 'Cheese' etc). _Required_

#### Return value

A new instance of `LocalDb` which behaves like a mongoose model

#### Example

```js
import LocalDB from 'react-local-mongoose';

const cheeseSchema = {
  name: { type: String, required: 'This field is required', unique: 'That name is already taken' },
  origin: { type: String, required: true },
  strength: { type: Number, required: true },
  tastingNotes: { type: String },
  image: { type: String }
};

const Cheese = new LocalDB(cheeseSchema, 'Cheese');

export default Cheese;
```

### Querying Methods

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

A promise which resolves with the found document or null.

#### Examples

```js
// `Cheese` is a model created using the example above

Cheese.find({ origin: 'Italy' })
  .then(records => console.log(records)); // returns an array of all records that have an origin of 'Italy'

Cheese.findOne({ origin: 'France' })
  .then(record => console.log(record)); // returns the first record with the origin of 'France'

Cheese.findById('5a36be1b15301600007f38f7')
  .then(record => console.log(record)); // returns the record with the id of '5a36be1b15301600007f38f7'
```

---

#### `create`

```js
Cheese.create(data)
```

#### Arguments

- **data** _(Object|Array)_: An object containing the data to stored, or an array containing objects to be stored. Data will be validated before saving to localStorage.

#### Return value

A promise which resolves with the stored documents, and rejects with an error containing validation error messages.

#### Example

```js
Cheese.create({ name: 'Gorgonzola', strength: 4 })
  .catch(err => console.log(err.errors)); // { name: 'That name is already taken', origin: 'Path `origin` is required' }

Cheese.create([
  { name: 'Gorgonzola', origin: 'Italy', strength: 4 },
  { name: 'Edam', origin: 'Netherlands', strength: 2 }
])
  .then(records => console.log(records));
/*
  [
    { _id: '5a36be1b15301600007f38f7', 'name: 'Gorgonzola', origin: 'Italy', strength: 4 },
    { _id: '5a36be1b15301600007f38f8', name: 'Edam', origin: 'Netherlands', strength: 2 }
  ]
*/
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

#### `removeById`

```js
Cheese.remove(id)
```

#### Arguments

- **id** _String_: The id of the document to remove.

#### Return value

A promise which resolves with `null`.

#### Example

```js
Cheese.removeById('5a36be1b15301600007f38f7')
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
