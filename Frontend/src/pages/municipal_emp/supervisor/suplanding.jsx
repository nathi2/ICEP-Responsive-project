import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import "../../../scss/Supervisor/supervisor.scss";
import "../../../scss/Supervisor/IssuesComponent.scss";
import person from "../../../assets/person.jpg";
import bin from "../../../assets/deleteAnnounbin.png";
import NotificationBell from "../../../assets/NotificationBell.png";

const Suplanding = () => {
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [issueCounts, setIssueCounts] = useState({
    submitted: 0,
    inProgress: 0,
    completed: 0,
    complicated: 0,
  });
  const navigate = useNavigate();

  // Load the user object from localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  const togglePopup = () => {
    setPopupVisible(!isPopupVisible);
  };

  const closePopup = () => {
    setPopupVisible(false);
  };

  const handleCardClick = (index) => {
    const updatedNotifications = notifications.map((notification, idx) => {
      if (idx === index) {
        return { ...notification, read: true };
      }
      return notification;
    });

    setNotifications(updatedNotifications);
    navigate("/issueupdate");
  };

  const handleDelete = async (id, event) => {
    event.stopPropagation();
    const confirmDelete = window.confirm("Are you sure you want to delete this notification?");
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:5000/api/notifications/${user.id}`);
        setNotifications(notifications.filter(notification => notification.id !== id));
      } catch (error) {
        console.error("Error deleting notification:", error);
      }
    }
  };

  
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/notifications/${user.id}`);
        setNotifications(response.data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

   

    const fetchIssues = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/supervisor/assigned-issues");
        const issues = response.data;
        const counts = issues.reduce((acc, issue) => {
          switch (issue.status) {
            case "Pending":
              acc.submitted += 1;
              break;
            case "In Progress":
              acc.inProgress += 1;
              break;
            case "Completed":
              acc.completed += 1;
              break;
            case "Complicated":
              acc.complicated += 1;
              break;
            default:
              break;
          }
          return acc;
        }, { submitted: 0, inProgress: 0, completed: 0, complicated: 0 });

        setIssueCounts(counts);
      } catch (error) {
        console.error("Error fetching issues:", error);
      }
    };

    fetchNotifications();
    fetchIssues();
  }, []);

  return (
    <div className="dashboard">
      <aside className="supervisor-sidebar">
        <img src={person} className="profile-pic" alt="Profile" />
        <div className="oneline">
          <div className="textse">
            <h2>{user.name} {user.surname}</h2>
            <p className="email">{user.email}</p>
          </div>
          <div className="image-container" onClick={togglePopup}>
            <div className="notification-bell-container">
              <img src={NotificationBell} className="bell" alt="NotificationBell" />
              {notifications.filter(notification => !notification.read).length > 0 && (
                <span className="notification-badge">
                  {notifications.filter(notification => !notification.read).length}
                </span>
              )}
            </div>
            {isPopupVisible && (
              <>
                <div className="overlay" onClick={closePopup}></div>
                <div className="notificationpopup">
                  <button className="close-popup-button" onClick={closePopup}>&times;</button>
                  <h3>Notifications</h3>
                  {notifications.map((notification, index) => (
                    <div
                      key={notification.id}
                      className={`notification-card ${notification.read ? "read" : "unread"}`}
                      onClick={() => handleCardClick(index)}
                    >
                      <div className="notification-message">{notification.message}</div>
                      <div className="Assigner">{notification.assigner}</div>
                      <div className="notification-date">{notification.date}</div>
                      <img
                        src={bin}
                        className="bin-pic"
                        alt="delete-announcement"
                        onClick={(e) => handleDelete(notification.id, e)}
                      />
                    </div>
                  ))}
                  <button className="closenotification-button" onClick={closePopup}>Close</button>
                </div>
              </>
            )}
          </div>
        </div>
        <Link to="/issueupdate"><p className="links">View Assigned Issues</p></Link>
        <Link to="/writereport"><p className="links">Write Report</p></Link>
        <Link to="/help"><p className="links">Help</p></Link>
        <Link to="/logoutpage"><p className="links">Sign out</p></Link>
      </aside>

      <main className="content">
        <div className="supervisor-header">
          <FontAwesomeIcon icon={faBell} className="notification-icon" onClick={togglePopup} />
        </div>
        <div className="dashboard-summary">
          <h1>Issue Summary</h1>
          <div className="summary-cards">
            <div className="summary-card"><h2>Total Issues</h2><p>{issueCounts.submitted + issueCounts.inProgress + issueCounts.completed + issueCounts.complicated}</p></div>
            <div className="summary-card"><h2>In Progress</h2><p>{issueCounts.inProgress}</p></div>
            <div className="summary-card"><h2>Completed</h2><p>{issueCounts.completed}</p></div>
            <div className="summary-card"><h2>Complicated</h2><p>{issueCounts.complicated}</p></div>
          </div>
        </div>
      </main>

      <footer className="supervisor-footer">Copyright ©</footer>
    </div>
  );
};

export default Suplanding;
