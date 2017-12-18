import React from 'react';
import { Link } from 'react-router-dom';

class Navbar extends React.Component {
  state = {
    navIsActive: false
  };

  toggleNav = () => {
    this.setState({ navIsActive: !this.state.navIsActive });
  }

  componentWillUpdate() {
    if(this.state.navIsActive) this.setState({ navIsActive: false });
  }

  render() {
    return (
      <nav className="navbar">
        <div className="container">
          <div className="navbar-brand">
            <Link className="navbar-item" to="/">
              <img src="http://iconbug.com/data/5e/128/0058ee991809105c510ea3bfbc923ce7.png" alt="CheeseBored" />
              &nbsp;
              CheeseBored
            </Link>
            <div className={this.state.navIsActive ? 'navbar-burger is-active' : 'navbar-burger'} onClick={this.toggleNav}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          <div className={this.state.navIsActive ? 'navbar-menu is-active' : 'navbar-menu'}>
            <div className="navbar-end">
              <Link className="navbar-item" to="/cheeses">All Cheeses</Link>
              <Link className="navbar-item" to="/cheeses/new">Add Cheese</Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }
}

export default Navbar;
