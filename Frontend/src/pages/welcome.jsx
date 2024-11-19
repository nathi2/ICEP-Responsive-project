import { useEffect, useState } from "react";
import React from "react";
import welcomeImg from '../assets/welcome.png';
import img1 from '../assets/emalahleni.png';
import loadingImg from '../assets/esdl2.png';
import '../scss/welcomePage.scss';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faX } from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faInstagram, faXTwitter } from '@fortawesome/free-brands-svg-icons';

function Welcome() {
  const [isLoading, setIsLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <img src={loadingImg} alt="Loading..." className="loading-image" />
      </div>
    );
  }

  return (
    <>
      <div className="welcome-page container">
        {/* Header with Dropdown Navbar */}
        <div className="row welcome-header">
          <div className="col-md-6 d-flex align-items-center">
            <img src={img1} alt="" />
            <h2>Extreme Service Delivery Portal</h2>
          </div>
          
          {/* Dropdown Navbar Button */}
          <div className="dropdown-toggle-icon" onClick={toggleDropdown}>
            <FontAwesomeIcon icon={dropdownOpen ? faX : faBars} size="lg" />
          </div>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <ul className="dropdown-menu">
              <li><Link to='/' onClick={() => window.location.reload()}>Home</Link></li>
              <li><Link to='/about'>About Us</Link></li>
              <li><Link>Contact Us</Link></li>
              <li><Link to='/login'><button>Login</button></Link></li>
            </ul>
          )}
        </div>

        {/* Welcome Content Section */}
        <div className="row welcome-content">
          <div className="col-md-6 welcome-message">
            <h1 className="welcome-head">WELCOME</h1>
            <p>Welcome to the <b>Extreme Service Delivery Portal</b>, the ultimate platform designed to empower communities and enhance government responsiveness in addressing service delivery challenges...</p>
            <h3>To better your community.</h3>
          </div>

          <div className="col-md-6 welcome-img-sec">
            <img src={welcomeImg} alt="" />
            <Link to='/signup'><button className="sign-up-button">Sign Up</button></Link>
            <Link to='/login'><button>Login</button></Link>
          </div>
        </div>

       
      </div>
    </>
  );
}

export default Welcome;
