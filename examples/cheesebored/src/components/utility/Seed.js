import React from 'react';

import seedData from '../../models/cheeseData';
import Cheese from '../../models/Cheese';

class Seed extends React.Component {
  componentWillMount() {
    Cheese.drop();
    Cheese.create(seedData)
      .then(() => this.props.history.replace('/cheeses'));
  }

  render() {
    return null;
  }
}

export default Seed;
