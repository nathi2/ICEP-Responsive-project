import React, { useState, useEffect } from 'react';
import '../../../scss/Supervisor/IssueUpdate.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const IssueUpdate = () => {
  const [reportedIssues, setReportedIssues] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('dateReported');
  const [showPopup, setShowPopup] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [previousStatus, setPreviousStatus] = useState('');
  const [userLocation, setUserLocation] = useState(null); // User location state

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/supervisor/assigned-issues', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        setReportedIssues(response.data);
      } catch (error) {
        console.error('Error fetching issues:', error);
      }
    };

    fetchIssues();
    getUserLocation(); // Fetch user location on mount
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
      }, (error) => {
        console.error("Error getting location: ", error);
        alert("Unable to retrieve your location.");
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleStatusChange = (issueID, newStatus) => {
    const issue = reportedIssues.find(issue => issue.issueID === issueID);
    setSelectedIssue(issue);
    setNewStatus(newStatus);
    setPreviousStatus(issue.status);
    setShowPopup(true);
  };

  const confirmStatusChange = async () => {
    setShowPopup(false);
    setReportedIssues(prevIssues =>
      prevIssues.map(issue =>
        issue.issueID === selectedIssue.issueID ? { ...issue, status: newStatus } : issue
      )
    );

    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/supervisor/update-issue-status/${selectedIssue.issueID}`, {
        status: newStatus
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Error updating issue status:', error);
    }
  };

  
  const getImageUrl = (path) => {
    return path ? `http://localhost:5000${path}` : null;
  };

  const cancelStatusChange = () => {
    setShowPopup(false);
    setReportedIssues(prevIssues =>
      prevIssues.map(issue =>
        issue.issueID === selectedIssue.issueID ? { ...issue, status: previousStatus } : issue
      )
    );
  };

  const filteredIssues = reportedIssues
    .filter(issue =>
      (issue.reporter && issue.reporter.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (issue.issue && issue.issue.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (issue.location && issue.location.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortOption === 'dateReported') {
        return new Date(b.dateReported) - new Date(a.dateReported);
      } else if (sortOption === 'reporter') {
        return (a.reporter || '').localeCompare(b.reporter || '');
      } else {
        return (a.location || '').localeCompare(b.location || '');
      }
    });

  const openMaps = (location) => {
    if (userLocation) {
      const destinationEncoded = encodeURIComponent(location);
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${destinationEncoded}`;
      window.open(mapsUrl, '_blank');
    } else {
      alert("Unable to determine your current location.");
    }
  };

  return (
    <div className="reported-issues-page">
      <FontAwesomeIcon
        icon={faArrowLeft}
        className="back-button"
        onClick={() => window.history.back()}
      />
      <h1>Reported Issues</h1>
      <div className="controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className='sortbar'
        >
          <option value="dateReported">Sort by Date</option>
          <option value="reporter">Sort by Reporter</option>
          <option value="location">Sort by Location</option>
        </select>
      </div>
      <div className="issues-list">
        {filteredIssues.map(issue => (
          <div key={issue.issueID} className="issue-card">
            <h2 className='nameOfIssue'>{issue.issue}</h2>
            {/* fOR PIC  */}
            <div><strong>Issue Image: </strong><br/>{issue.issue_image_path ? ( 
                  <img className="issue_pic" src={getImageUrl(issue.issue_image_path)} alt="issue"/>
              ) : <p>No image available</p>}</div>


            <p><strong>Issue Detail:</strong> {issue.description}</p>
            <p><strong>Reported by:</strong> {issue.reporter}</p>
            <p>
              <strong>Date Reported</strong>: {new Date(issue.dateReported).toLocaleString('en-ZA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              })}
            </p>
            <p>
              <strong>Location:</strong>
              <span 
                style={{ cursor: 'pointer', color: 'grey' }} 
                onClick={() => openMaps(issue.location)}
              >
                {issue.location}
              </span>
            </p>
            <p><strong>Status:</strong>
              <select
                value={issue.status}
                onChange={(e) => handleStatusChange(issue.issueID, e.target.value)}
                disabled={issue.status === "Completed"}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Complicated">Complicated</option>
              </select>
            </p>
          </div>
        ))}
      </div>

      {/* Popup for confirmation */}
      {showPopup && (
        <div className="popup-container">
          <div className="popup">
            <p>Do you really want to change the status from {previousStatus} to {newStatus}?</p>
            <button className="confirm" onClick={confirmStatusChange}>Yes</button>
            <button className="cancel" onClick={cancelStatusChange}>No</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueUpdate;
