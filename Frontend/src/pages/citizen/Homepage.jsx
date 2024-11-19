import React, { useState, useEffect } from 'react';
import '../../scss/homepage.scss'; 
import logo from '../../assets/reportlogo.jpeg';
import ProfilePicture from '../../assets/profile_picture.png';
import img2 from '../../assets/road_potholes.webp';
import img3 from '../../assets/water.jpg';
import img4 from '../../assets/pothole2.jpg';
import img5 from '../../assets/road1.jpg';
import img6 from '../../assets/pothole1.jpg';
import img7 from '../../assets/Live-wires-from-electricity-thieves1.jpg';
import img8 from '../../assets/pipe3.jpg';
import img9 from '../../assets/infrastructure.jpg';
import img10 from '../../assets/elect2.jpg';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faPeopleGroup, faQuestionCircle, faComments, faRightFromBracket, faUser, faChartBar } from '@fortawesome/free-solid-svg-icons';

const images = [
    img2, img3, img4, img5, img6, img7, img8, img9, img10
];

// Mockup announcement data
const announcementsData = [
    {
        id: 1,
        text: "pplies will be provided, and participants will receive community service hours and refreshments. We encourage all residents, families, and local organizations to join us for this rewarding event. Together, we can make a difference!"
    },
    {
        id: 2,
        text: "Important Notice: The city has scheduled new road repairs starting next week in various neighborhoods. These repairs are essential to ensure the safety and efficiency of our infrastructure. Please be mindful of detours and plan your routes accordingly. Updates will be posted on the city’s website and social media channels. Thank you for your patience and understanding as we work to improve our roads!"
    },
    {
        id: 3,
        text: "Don't forget to report any infrastructure issues you may encounter in your area! Whether it's potholes, broken streetlights, or water leaks, your reports help us address problems quickly. Use our online platform or mobile app to submit reports easily. Your participation is crucial in maintaining our city's safety and quality of life!"
    },
    {
        id: 4,
        text: "Join us for a virtual Town Hall meeting this Thursday at 6 PM. This is an excellent opportunity for residents to engage with city officials, ask questions, and share your concerns. The meeting will be streamed live on the city’s official YouTube channel. Your voice matters, and we want to hear from you!"
    },
];

const Homepage = ({ handleLogout }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [profilePic, setProfilePic] = useState(ProfilePicture);
    const [announcementIndex, setAnnouncementIndex] = useState(0);
    const [isSlideshowPaused, setIsSlideshowPaused] = useState(false);

    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (user && user.profilePic) {
            setProfilePic(`http://localhost:5000${user.profilePic}`);
        }
    }, [user]);

    useEffect(() => {
        const imageInterval = setInterval(() => {
            if (!isSlideshowPaused) {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
            }
        }, 7000); // Change image every 7 seconds
        
        const announcementInterval = setInterval(() => {
            if (!isSlideshowPaused) {
                setAnnouncementIndex((prevIndex) => (prevIndex + 1) % announcementsData.length);
            }
        }, 5000); // Change announcement every 5 seconds

        return () => {
            clearInterval(imageInterval);
            clearInterval(announcementInterval);
        };
    }, [isSlideshowPaused]);

    const handlePreviousAnnouncement = () => {
        setIsSlideshowPaused(true); // Pause the slideshow
        setAnnouncementIndex((prevIndex) => (prevIndex - 1 + announcementsData.length) % announcementsData.length);
    };

    const handleNextAnnouncement = () => {
        setIsSlideshowPaused(true); // Pause the slideshow
        setAnnouncementIndex((prevIndex) => (prevIndex + 1) % announcementsData.length);
    };

    return (
        <div className="citizen-dashboard">
            <aside className="sidebar">
                <img src={profilePic} className="profile-pic" alt="Profile" />
                <h2>{user.name} {user.surname}</h2>
                <div className="links-container">
                    <Link to='/profile'><p className="links"><FontAwesomeIcon icon={faUser} className="dash-icon" /> Profile</p></Link>
                    <Link to='/status'><p className="links"><FontAwesomeIcon icon={faChartBar} className="dash-icon" /> View Issue Status</p></Link>
                    <Link to='/newsfeed'><p className="links"><FontAwesomeIcon icon={faComments} className="dash-icon" /> Issues Newsfeed</p></Link>
                    <Link to='/about'><p className="links"><FontAwesomeIcon icon={faPeopleGroup} className="dash-icon" /> About Us</p></Link>
                    <Link to='/help'><p className="links"><FontAwesomeIcon icon={faQuestionCircle} className="dash-icon" /> Help</p></Link>
                    <Link to='/logoutpage'><p className="links" onClick={handleLogout}><FontAwesomeIcon icon={faRightFromBracket} className="dash-icon" /> Sign out</p></Link>
                </div>
            </aside>
        
            <main className="content">
                {/* Slideshow Container */}
                <div className="slideshow-container">
                    {/* Announcements Section Over Slideshow */}
                    <div className="announcements">
                        {/* Navigation Links positioned at the top of the announcements */}
                        <div className="announcement-navigation">
                            <span onClick={handlePreviousAnnouncement} className="nav-link">&laquo;Previous</span>
                            <span onClick={handleNextAnnouncement} className="nav-link">Next&raquo;</span>
                        </div>
                        <h2>Notice!</h2>
                        <p>{announcementsData[announcementIndex].text}</p> {/* Display current announcement */}
                    </div>
                </div>

                <div className="welcome-message">
                    <h1 className='heading'>Hey {user.name}, And Welcome Back</h1>
                    <p>We're glad to have you back on our platform!</p>
                </div>
                <div className="report-prompt">
                    <p>Do you have an Issue to Report?</p>
                    <img src={logo} alt="Report Icon" className="report-icon" />
                    <Link to='/reportissue'><button className="report-button">Click Here</button></Link>
                </div>
            </main>

            <footer className="footer">
                Copyright© @2024
            </footer>
        </div>
    );
};

export default Homepage;
