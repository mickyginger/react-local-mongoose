import React from 'react';

import Cheese from '../../models/Cheese';
import CheesesForm from './CheesesForm';

class CheesesNew extends React.Component {
  state = {
    cheese: {
      name: '',
      origin: '',
      strength: '',
      image: '',
      tastingNotes: ''
    },
    errors: {}
  }

  handleChange = ({ target: { name, value }}) => {
    const cheese = Object.assign({}, this.state.cheese, { [name]: value });
    this.setState({ cheese });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    Cheese.create(this.state.cheese)
      .then(() => this.props.history.replace('/'))
      .catch(err => this.setState({ errors: err.errors}));
  }

  render() {
    return (
      <CheesesForm
        handleChange={this.handleChange}
        handleSubmit={this.handleSubmit}
        cheese={this.state.cheese}
        errors={this.state.errors}
      />
    );
  }
}

export default CheesesNew;
