import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faArrowLeft,faBell,faCircleInfo,} from "@fortawesome/free-solid-svg-icons";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Card from "react-bootstrap/Card";
import "bootstrap-icons/font/bootstrap-icons.css";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PdfReport = () => {
  const [isActive, setIsActive] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [issues, setIssues] = useState([]);
  const [originalIssues, setOriginalIssues] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [sortBy, setSortBy] = useState("");
  const [filterBy, setFilterBy] = useState("");
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const [feedbackContent, setFeedbackContent] = useState("");
  const [notifications, setNotifications] = useState([]);

  const token = localStorage.getItem("token");

  const notify = () => {
    toast("Supervisor assigned successfully!", {
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      className: "manager-custom-toast",
    });
  };

  const getImageUrl = (path) => {
    return path ? `http://localhost:5000${path}` : null;
  };

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/issue/dept-issues",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setIssues(response.data);
        setOriginalIssues(response.data);
      } catch (error) {
        console.error("There was an error fetching the issues!", error);
      }
    };

    const fetchSupervisors = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/supervisor/supervisors",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setSupervisors(response.data);
      } catch (error) {
        console.error("There was an error fetching the supervisors!", error);
      }
    };

    fetchIssues();
    fetchSupervisors();
  }, [token]);

  useEffect(() => {
    let updatedIssues = [...originalIssues];

    // Apply filtering
    if (filterBy) {
      switch (filterBy) {
        case "Location":
          updatedIssues = updatedIssues.filter(
            (issue) => issue.location === "specific location"
          );
          break;
        case "Date":
          updatedIssues = updatedIssues.filter(
            (issue) => issue.dateReported === "specific date"
          );
          break;
        case "Status":
          updatedIssues = updatedIssues.filter(
            (issue) => issue.status === "specific status"
          );
          break;
        default:
          break;
      }
    }

    // Apply sorting
    if (sortBy) {
      switch (sortBy) {
        case "Location":
          updatedIssues.sort((a, b) => a.location.localeCompare(b.location));
          break;
        case "Date":
          updatedIssues.sort(
            (a, b) => new Date(a.dateReported) - new Date(b.dateReported)
          );
          break;
        case "Status":
          updatedIssues.sort((a, b) => a.status.localeCompare(b.status));
          break;
        default:
          break;
      }
    }

    setIssues(updatedIssues);
  }, [sortBy, filterBy, originalIssues]);

  const handleSort = (criteria) => {
    setSortBy(criteria);
  };

  const handleFilter = (criteria) => {
    setFilterBy(criteria);
  };

  const createNotification = (message, supervisorID) => {
    const newNotification = {
      id: notifications.length + 1,
      message,
      supervisorID,
      timestamp: new Date().toISOString(),
    };

    setNotifications((prev) => [...prev, newNotification]);
  };

  const handleAssignSupervisor = async (issueID, supervisorID) => {
    try {
        const response = await axios.post('http://localhost:5000/api/issue/assign-supervisor', {
            issueID, supervisorID
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 200) {
            notify(); // Notify user of successful assignment

            // Find the supervisor's name
            const assignedSupervisor = supervisors.find(supervisor => supervisor.id === supervisorID);
            const supervisorName = assignedSupervisor ? `${assignedSupervisor.name} ${assignedSupervisor.surname}` : 'Supervisor';

            // Create a notification for the supervisor
            createNotification(`You have been assigned to issue ID: ${issueID}`, supervisorID);

            // Show toast indicating that a notification has been sent to the supervisor
            toast(`Notification sent to supervisor: ${supervisorName}`, {
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                className: 'manager-custom-toast'
            });

            // Update the state to reflect the assigned supervisor
            setIssues((prevIssues) =>
                prevIssues.map((issue) =>
                    issue.issueID === issueID
                        ? { ...issue, assignedSupervisorID: supervisorID }
                        : issue
                )
            );
        }
    } catch (error) {
        console.log(error.message);
        alert('Failed to assign supervisor, Try again later');
    }
};


  const generatePdf = () => {
    const input = document.getElementById("pdf-content");
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save("report.pdf");
    });
  };

  const handleCancel = () => {
    setFeedbackContent(''); // Clear the textarea
    setShowFeedbackPopup(false);
};

  const handleFeedbackSubmit = async () => {
    if (!feedbackContent) {
      toast.error("Announcement cannot be empty.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/citizen/announcement",
        {
          issueID: selectedIssue.issueID,
          feedback: feedbackContent,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        toast("Announcement sent successfully!");
        setFeedbackContent("");
        setShowFeedbackPopup(false);
      }
    } catch (error) {
      console.error("Failed to send announcement", error);
      toast.error("Failed to send announcement, please try again later.");
    }
  };

  const toggleSection = (issue) => {
    setSelectedIssue(issue);
    setIsActive(!isActive);
  };

  const renderNotifications = () => {
    return notifications.map((notification) => (
      <div key={notification.id} className="notification">
        <p>{notification.message}</p>
        <span>{new Date(notification.timestamp).toLocaleTimeString()}</span>
      </div>
    ));
  };

  return (
    <>
      <div className="issues-page">
        <ToastContainer />

        <span className="overlay" onClick={toggleSection}></span>

        <header className="issues-header">
          <Link to="/landing">
            <FontAwesomeIcon icon={faArrowLeft} className="back-landing" />
          </Link>
          <h1 className="reported-header">REPORTED ISSUES</h1>
          <Button
            onClick={generatePdf}
            className="btn save-button"
            data-toggle="tooltip"
            data-placement="bottom"
            title="Download Report"
          >
            <i className="bi bi-file-earmark-arrow-down-fill"></i>
          </Button>
        </header>

        <div className="filt-sort">
          <DropdownButton title="Sort By" className="btn sorting btn-lg">
            <Dropdown.Item onClick={() => handleSort("Location")}>
              Location
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handleSort("Date")}>
              Date
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handleSort("Status")}>
              Status
            </Dropdown.Item>
          </DropdownButton>
        </div>

        <div id="pdf-content" className="sections col-md-10 mb-4">
          {issues.map((issue, index) => (
            <Card key={index} className="report-sec">
              <Card.Body>
                <Card.Text>
                  <p className="issue-paragraph">
                    <strong>Date Reported:</strong>{" "}
                    {new Date(issue.dateReported).toLocaleString("en-ZA", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </p>
                  <p className="issue-paragraph"><strong>Status:</strong> {issue.status}</p>
                  <p className="issue-paragraph"><strong>Location:</strong>{issue.location}</p>
                </Card.Text>

                {issue.assignedSupervisorID === null ? (
                  <DropdownButton title="ASSIGN" className="btn assign-btn">
                    {supervisors.map((supervisor) => (
                      <Dropdown.Item
                        key={supervisor.id}
                        onClick={() =>
                          handleAssignSupervisor(issue.issueID, supervisor.id)
                        }
                      >
                        {supervisor.name}
                      </Dropdown.Item>
                    ))}
                  </DropdownButton>
                ) : (
                  <Button
                    className="btn assigned-btn"
                    variant="secondary"
                    disabled
                  >
                    ASSIGNED
                  </Button>
                )}

                <Button
                  className="btn details-btn"
                  onClick={() => toggleSection(issue)}
                >
                  DETAILS
                </Button>
                <br />
                <br />
                <Button
                  className="btn feedback-btn"
                  onClick={() => {
                    setSelectedIssue(issue);
                    setShowFeedbackPopup(true);
                  }}
                >
                  SEND FEEDBACK
                </Button>
              </Card.Body>
            </Card>
          ))}
        </div>

        {isActive && selectedIssue && (
          <section className={`modal ${isActive ? "active" : ""}`}>
            <div className="pop-up-box">
              <FontAwesomeIcon icon={faCircleInfo} className="pop-up-icon" />
              <h2>DETAILS</h2>
              <div><strong> Issue Type: </strong>{selectedIssue.issueCategory}</div>
              <div><strong>Issue Description:</strong> {selectedIssue.description}</div>

              <div><strong>Issue Image: </strong><br/>{selectedIssue.issue_image_path ? ( 
                  <img className="issue-image-pop-up" src={getImageUrl(selectedIssue.issue_image_path)} alt="issue"/>
              ) : <p>No image available</p>}</div>

              <div className="button-sec">
                <Button
                  className="btn close-btn"
                  onClick={() => toggleSection(null)}
                >
                  Ok, Close
                </Button>
              </div>
            </div>
          </section>
        )}

        {showFeedbackPopup && (
          <section className="modal active">
            <div className="pop-up-box">
              <FontAwesomeIcon icon={faBell} className="pop-up-icon" />
              <h2 className="announcement-heading"><strong>ANNOUNCEMENT</strong></h2>
              <h2>Announcement for Issue ID: {selectedIssue?.issueID}</h2>

              <textarea
                rows = "5"
                cols="40"
                value={feedbackContent}
                onChange={(e) => setFeedbackContent(e.target.value)}
                placeholder="Your announcement here..."
              />

              <div className="announce-button-sec">
                <Button className="announce-submit-btn" onClick={handleFeedbackSubmit}>Submit</Button>
                <Button className="announce-cancel-btn" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          </section>
        )}

        <div className="notifications">{renderNotifications()}</div>
      </div>
    </>
  );
};

export default PdfReport;
