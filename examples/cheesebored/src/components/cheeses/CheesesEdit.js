import React from 'react';

import Cheese from '../../models/Cheese';
import CheesesForm from './CheesesForm';

class CheesesNew extends React.Component {
  state = {
    cheese: null,
    errors: {}
  }

  componentDidMount() {
    Cheese.findById(this.props.match.params.id)
      .then(cheese => this.setState({ cheese }));
  }

  handleChange = ({ target: { name, value }}) => {
    const cheese = Object.assign({}, this.state.cheese, { [name]: value });
    this.setState({ cheese });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { id } = this.props.match.params;
    Cheese.findByIdAndUpdate(id, this.state.cheese)
      .then(() => this.props.history.push('/'))
      .catch(err => this.setState({ errors: err.errors }));
  }

  render() {
    if(!this.state.cheese) return null;
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
