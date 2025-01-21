import React from 'react';
import './Navbar.css';

// Reference: https://www.sitepoint.com/creating-a-navbar-in-react/

const Navbar = () => {
  return (
	<nav className="navbar">
	  <div className="navbar-left">
		<img className="logo" src="/src/assets/bch-logo.svg" alt="BCH Logo"></img>
	  </div>
	  <div className="navbar-right">
		<a href="/help" className="help-icon">
		  <p>Help</p>
		  <img className="help-img" src="/src/assets/help-icon.svg" alt="Help icon"></img>
		</a>
		<a href="/contact" className="contact-icon">
		  <p>Contact</p>
		  <img className="phone-img" src="/src/assets/phone-icon.svg" alt="Contact icon"></img>
		</a>
		<a href="/account" className="user-icon">
		  <p>Login</p>
		  <img className="user-img" src="/src/assets/user-icon.svg" alt="Login icon"></img>
		</a>
	  </div>
	</nav>
  );
};

export default Navbar;
