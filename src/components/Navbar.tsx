import './Navbar.css';

// Reference: https://www.sitepoint.com/creating-a-navbar-in-react/

const Navbar = () => {
  function toggleUserMenu() {
	var x = document.getElementById("dropdown-element");
	if (x.className === "dropdown-content") {
      x.className += " show";
	} else {
      x.className = "dropdown-content";
	}
  }

  return (
	<nav className="navbar">
	  <div className="navbar-left">
		<a href="/" className="logo">
		  <img className="logo-img" src="/src/assets/bch-logo.svg" alt="BCH Logo"></img>
		</a>
	  </div>
	  <div className="navbar-right">
		<a href="/help" className="help-icon">
		  <div>
		    <img className="help-img" src="/src/assets/help-icon.svg" alt="Help icon"></img>
		  </div>
		</a>
		<a href="/contact" className="contact-icon">
		  <div>
		    <img className="phone-img" src="/src/assets/phone-icon.svg" alt="Contact icon"></img>
		  </div>
		</a>
		  <div className="user-icon" onClick={toggleUserMenu}>
			<img className="user-img" src="/src/assets/user-icon.svg" alt="Login icon"></img>
		  </div>
		  <div class="dropdown-content" id="dropdown-element">
			<a href="/">Personal information</a>
			<a href="/">Change password</a>
			<a href="/">View your outage reports</a>
			<a href="/login">Log out</a>
		  </div>
	  </div>
	</nav>
  );
};

export default Navbar;
