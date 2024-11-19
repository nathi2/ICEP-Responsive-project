import React, { useEffect, useState } from 'react'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser, faEnvelope, faLocationDot, faLock, faPhone, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import img1 from '../../assets/emalahleni.png';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import Axios
import '../../scss/signup.scss';

function Signup() {
  const navigate = useNavigate();
  const [address, setAddress] = useState('');

  useEffect(() => {
    const getLocation = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const fullAddress = response.data.display_name.split(', ').slice(-5).join(', '); // Get last 5 parts
            setAddress(fullAddress); // Set the address in state
          } catch (error) {
            console.error('Failed to fetch location:', error);
          }
        });
      }
    };

    getLocation();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register/resident', data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 201) { // Updated status code for successful creation
        alert('Registration successful! Please login.');
        navigate('/'); // Redirect to login or homepage
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      if (error.response) {
        alert(error.response.data.message);
      } else {
        console.error('Error:', error.message);
        alert('An error occurred. Please try again');
      }
    }
  };

  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  };

  return (
    <div className='signup-home'>
      <FontAwesomeIcon
        icon={faArrowLeft}
        className='back-button'
        onClick={handleBack}
      />
      <div className='signup-section'>
        <div className='form-heading'>
          <img src={img1} alt="Signup" />
          <h1>Create Account</h1>
          <p>Sign up to get started</p>
          <p>Already have an account?<Link to='/login' className='login-link'>Login</Link></p>
        </div>
        <br />
        <form onSubmit={handleSubmit}>
          <div className='details-div'>
            <span className='signup-icon'><FontAwesomeIcon icon={faCircleUser} /></span>
            <input type='text' name='name' placeholder='Name' required />
          </div>

          <div className='details-div'>
            <span className='signup-icon'><FontAwesomeIcon icon={faCircleUser} /></span>
            <input type='text' name='surname' placeholder='Surname' required />
          </div>

          <div className='details-div'>
            <span className='signup-icon'  id='locate' ><FontAwesomeIcon icon={faLocationDot} /></span>
            <input 
              type='text' 
              name='address' 
              placeholder='Address' 
              required 
            />
          </div>

          <div className='details-div'>
            <span className='signup-icon'><FontAwesomeIcon icon={faEnvelope} /></span>
            <input type='email' name='email' placeholder='Email Address' required />
          </div>

          <div className='details-div'>
            <span className='signup-icon'><FontAwesomeIcon icon={faPhone} /></span>
            <input type='text' name='contact' placeholder='Contact details' required />
          </div>

          <div className='details-div'>
            <span className='signup-icon'><FontAwesomeIcon icon={faLock} /></span>
            <input type='password' name='password' placeholder='Password' required />
          </div>

          <button type='submit' className='btn btn-block'>Sign Up</button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
