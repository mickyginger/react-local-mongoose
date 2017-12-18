import LocalDB from 'react-local-mongoose';

const cheeseSchema = {
  name: { type: String, required: true, unique: true },
  origin: { type: String, required: true },
  strength: { type: Number, required: true },
  tastingNotes: { type: String },
  image: { type: String }
};

const Cheese = new LocalDB(cheeseSchema, 'Cheese');

export default Cheese;
