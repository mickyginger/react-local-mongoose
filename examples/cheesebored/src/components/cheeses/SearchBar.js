import React from 'react';
import { Control, Input, Icon } from 'reactbulma';

const SearchBar = ({ handleSearch, handleFilterByCountry, handleSort, countries }) => {
  return (
    <div className="columns">
      <div className="column">
        <Control hasIconsLeft>
          <Input placeholder="Search by name" onChange={handleSearch} />
          <Icon left>
            <i className="fa fa-search" />
          </Icon>
        </Control>
      </div>
      <div className="column">
        <Control hasIconsLeft>
          <div className="select is-fullwidth">
            <select onChange={handleFilterByCountry}>
              <option value="all">All Countries</option>
              {countries.map(country => <option key={country}>{country}</option>)}
            </select>
          </div>
          <Icon left>
            <i className="fa fa-globe" />
          </Icon>
        </Control>
      </div>
      <div className="column">
        <Control hasIconsLeft>
          <div className="select is-fullwidth">
            <select onChange={handleSort}>
              <option value="name|asc">Name A - Z</option>
              <option value="name|desc">Name Z - A</option>
              <option value="strength|asc">Strength Low - High</option>
              <option value="strength|desc">Strength High - Low</option>
            </select>
          </div>
          <Icon left>
            <i className="fa fa-sort" />
          </Icon>
        </Control>
      </div>
    </div>
  );
};

export default SearchBar;
