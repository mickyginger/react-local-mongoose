import React from 'react';
import ReactDOM from 'react-dom';

import 'font-awesome/css/font-awesome.css';
import './scss/style.scss';

import { BrowserRouter as Router } from 'react-router-dom';

import Navbar from './components/utility/Navbar';
import Routes from './components/utility/Routes';

class App extends React.Component {
  render() {
    return (
      <Router>
        <div>
          <Navbar />
          <Routes />
        </div>
      </Router>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
