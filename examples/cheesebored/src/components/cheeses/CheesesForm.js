import React from 'react';

import { Field, Control, Input, Textarea } from 'reactbulma';

const CheesesForm = ({ handleChange, handleSubmit, cheese, errors }) => {
  return (
    <form onSubmit={handleSubmit}>
      <Field>
        <Control>
          <Input
            placeholder="Name"
            name="name"
            value={cheese.name}
            onChange={handleChange}
          />
        </Control>
        {errors.name && <p className="help is-danger">{errors.name}</p>}
      </Field>
      <Field>
        <Control>
          <Input
            placeholder="Origin"
            name="origin"
            value={cheese.origin}
            onChange={handleChange}
          />
        </Control>
        {errors.origin && <p className="help is-danger">{errors.origin}</p>}
      </Field>
      <Field>
        <Control>
          <Input
            type="number"
            min="1"
            max="5"
            placeholder="Strength"
            name="strength"
            value={cheese.strength}
            onChange={handleChange}
          />
        </Control>
        {errors.strength && <p className="help is-danger">{errors.strength}</p>}
      </Field>
      <Field>
        <Control>
          <Input
            placeholder="Image"
            name="image"
            value={cheese.image}
            onChange={handleChange}
          />
        </Control>
        {errors.image && <p className="help is-danger">{errors.image}</p>}
      </Field>
      <Field>
        <Control>
          <Textarea
            placeholder="Tasting Notes"
            name="tastingNotes"
            value={cheese.tastingNotes}
            onChange={handleChange}
          />
        </Control>
        {errors.tastingNotes && <p className="help is-danger">{errors.tastingNotes}</p>}
      </Field>

      <button className="button is-primary">Submit</button>
    </form>
  );
};

export default CheesesForm;
