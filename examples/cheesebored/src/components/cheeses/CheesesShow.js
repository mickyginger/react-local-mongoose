import React from 'react';

import Cheese from '../../models/Cheese';
import { Link } from 'react-router-dom';
import { Image, Title, SubTitle, Icon } from 'reactbulma';

class CheesesShow extends React.Component {
  state = {
    cheese: null
  }

  componentDidMount() {
    Cheese.findById(this.props.match.params.id)
      .then(cheese => this.setState({ cheese }));
  }

  handleDelete = () => {
    const { id } = this.props.match.params;
    Cheese.findByIdAndRemove(id)
      .then(() => this.props.history.replace('/'));
  }

  render() {
    const { cheese } = this.state;
    if(!cheese) return null;
    return (
      <div className="columns">
        <div className="column">
          <Image src={cheese.image} />
        </div>
        <div className="column">
          <Title>{cheese.name}</Title>
          <SubTitle>{cheese.origin}</SubTitle>
          <Icon>
            <i className="fa fa-pencil"></i>
          </Icon>
          <p>{cheese.tastingNotes}</p>
          <Link to={`/cheeses/${cheese._id}/edit`} className="button is-primary">Edit</Link>
          {' '}
          <button className="button is-danger" onClick={this.handleDelete}>Delete</button>
        </div>
      </div>
    );
  }
}

export default CheesesShow;
