import React from 'react';

import Cheese from '../../models/Cheese';
import { Link } from 'react-router-dom';
import { Card, Title, SubTitle } from 'reactbulma';
import _ from 'lodash';

import SearchBar from './SearchBar';

class CheesesIndex extends React.Component {
  state = {
    cheeses: [],
    countries: [],
    query: '',
    selectedCountry: 'all',
    sortBy: 'name',
    sortDirection: 'asc'
  }

  componentDidMount() {
    Cheese.find()
      .then(cheeses => {
        const countries = _.uniq(cheeses.map(cheese => cheese.origin)).sort();
        this.setState({ cheeses, countries });
      });
  }

  handleSearch = (e) => {
    this.setState({ query: e.target.value });
  }

  handleFilterByCountry = (e) => {
    this.setState({ selectedCountry: e.target.value });
  }

  handleSort = (e) => {
    const [sortBy, sortDirection] = e.target.value.split('|');
    this.setState({ sortBy, sortDirection });
  }

  getCheeses = () => {
    const { cheeses, query, selectedCountry, sortBy, sortDirection } = this.state;
    const regex = new RegExp(query, 'i');
    const selectedCheeses = _.filter(cheeses, cheese => cheese.origin === selectedCountry || selectedCountry === 'all');
    const filteredCheeses = _.filter(selectedCheeses, cheese => regex.test(cheese.name));
    return _.orderBy(filteredCheeses, [sortBy], [sortDirection]);
  }

  render() {
    const cheeses = this.getCheeses();
    return (
      <div>
        <SearchBar
          countries={this.state.countries}
          handleSearch={this.handleSearch}
          handleFilterByCountry={this.handleFilterByCountry}
          handleSort={this.handleSort}
        />
        <div className="columns is-multiline">
          {cheeses.map(cheese => <div className="column is-one-third" key={cheese._id}>
            <Card>
              <Link to={`/cheeses/${cheese._id}`}>
                <Card.Image src={cheese.image} />
                <Card.Content>
                  <Title is="4">{cheese.name}</Title>
                  <SubTitle is="6">{cheese.origin}</SubTitle>
                  <p>Strength: {cheese.strength}</p>
                </Card.Content>
              </Link>
            </Card>
          </div>)}
        </div>
      </div>
    );
  }
}

export default CheesesIndex;
