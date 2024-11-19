const db = require('../config/db');
const fs = require('fs');
const PDFDocument = require('pdfkit');

// List of common stop words to exclude from comparison
const stopWords = new Set([
    'is', 'a', 'are', 'they', 'for', 'to', 'the', 'and', 'in', 'of', 'on', 
    'at', 'this', 'that', 'there','it', 'by', 'with', 'here','as', 'an', 'from', 'but', 
    'or', 'not', 'if', 'be', 'we', 'do', 'my', 'what', 'where', 'who', 
    'when', 'which', 'you', 'he', 'she', 'but', 'them', 'his', 'her', 'our', 
    'their'
]);

// Function to check if two descriptions have at least 2 or 3 similar words
const hasSimilarWords = (desc1, desc2, minCommonWords = 2) => {
    const words1 = desc1.toLowerCase().split(/\s+/).filter(word => !stopWords.has(word)); // Split and filter stop words
    const words2 = desc2.toLowerCase().split(/\s+/).filter(word => !stopWords.has(word));

    // Find common words between two descriptions
    const commonWords = words1.filter(word => words2.includes(word));

    // Return true if the number of common words is >= minCommonWords
    return commonWords.length >= minCommonWords;
};

const reportIssue = async (req, res) => {
    const { location, description, issueCategory } = req.body;
    const image = req.file;
    const imagePath = image ? `/uploads/${image.filename}` : null;

    const residentID = req.user.id; // Get the user ID from the authenticated token

    // Validate inputs
    if (!location || !description || !issueCategory) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Fetch issues from the same location and category
        const [existingIssues] = await db.query(
            `SELECT * FROM issue WHERE location = ? AND issueCategory = ?`,
            [location, issueCategory]
        );

        // Check for duplicate by comparing descriptions with at least 2 similar words
        const isDuplicate = existingIssues.some(issue => hasSimilarWords(issue.description, description));

        if (isDuplicate) {
            return res.status(409).json({ message: 'Duplicate issue detected: A similar issue has already been reported in this location.' });
        }

        // Proceed with inserting the new issue into the database
        await db.query(
            'INSERT INTO issue (residentID, location, description, status, dateReported, issueCategory, issue_image_path) VALUES (?, ?, ?, ?, NOW(), ?, ?)',
            [residentID, location, description, 'Pending', issueCategory, imagePath]
        );

        res.status(201).json({ message: 'Issue reported successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getIssuesByResidentID = async (req, res) => {
    const residentID = req.user.id; // Get the user ID from the authenticated token

    try {
        // Select issues based on the residentID
        const [issues] = await db.query(
            'SELECT * FROM issue WHERE residentID = ? ORDER BY dateReported DESC',
            [residentID]
        );

        // No need to return 404 if no issues are found; instead, return an empty array
        res.status(200).json(issues);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getIssuesByDeptID = async (req, res) => {
    const deptID = req.user.departmentID; // Assuming the departmentID is stored in the user's token

    try {
        let issues;

        if (deptID) {
            // Retrieve the department name based on the departmentID
            const [dept] = await db.query(
                'SELECT dept_name FROM department WHERE deptID = ?',
                [deptID]
            );

            let deptName = dept.length > 0 ? dept[0].dept_name.toLowerCase() : null;

            // Select issues where the issueCategory matches the department name or is "Other"
            [issues] = await db.query(
                `SELECT * FROM issue WHERE (issueCategory = ? OR issueCategory = ?) ORDER BY dateReported DESC`,
                [deptName, 'Other']
            );
        } else {
            return res.status(400).json({ message: 'Department ID is missing' });
        }

        if (issues.length === 0) {
            return res.status(404).json({ message: 'No issues found for this department' });
        }
        res.status(200).json(issues);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getAllIssues = async (req, res) => {
    try {
        // Retrieve all issues from the database, ordered by the date reported
        const [issues] = await db.query('SELECT * FROM issue ORDER BY dateReported DESC');

        // Return the issues in the response
        res.status(200).json(issues);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getIssueReporter = async (req, res) => {
    const reporterID = req.params.id;

    try{
        const [user] = await db.query('SELECT name AS name, surname AS surname FROM users WHERE id = ?', [reporterID]);

        res.status(200).json(user[0]);
    }catch(error){
        console.log(error);
        res.status(500).json({message: 'Internal server error'})
    }
}

const getIssueCountPerMonth = async (req, res) => {
    try {
        const [counts] = await db.query(
            `SELECT YEAR(dateReported) AS year, 
                    MONTH(dateReported) AS month, 
                    COUNT(issueID) AS issues_reported 
             FROM issue 
             GROUP BY YEAR(dateReported), MONTH(dateReported) 
             ORDER BY YEAR(dateReported), MONTH(dateReported)`
        );

        res.json(counts);  // Return the entire array
    } catch (error) {
        console.log(error.message);  // Fix the error logging
        res.status(500).json({ message: 'Internal Server error' });
    }
};

const getIssuesForReport = async (req, res) => {
    const { startDate, endDate } = req.query;

    try {
        // Retrieve issues filtered by date range
        const [issues] = await db.query(
            'SELECT * FROM issue WHERE dateReported BETWEEN ? AND ? ORDER BY dateReported DESC',
            [new Date(startDate), new Date(endDate)]
        );

        // Count total and pending issues
        const totalIssues = issues.length;
        const pendingIssues = issues.filter(issue => issue.status === 'Pending').length;

        // Create the PDF document
        const doc = new PDFDocument();
        const pdfPath = 'issues_report.pdf';
        const writeStream = fs.createWriteStream(pdfPath);
        doc.pipe(writeStream);

        // Add Title
        doc.fontSize(16).text('Issue Report', { align: 'center' });
        doc.moveDown();

        // Add Summary
        doc.fontSize(12).text(`Total Issues Reported: ${totalIssues}`);
        doc.text(`Pending Issues: ${pendingIssues}`);
        doc.moveDown();

        // Add Details of Each Issue
        issues.forEach((issue, index) => {
            doc.fontSize(10).text(`Issue #${index + 1}`);
            doc.text(`Issue ID: ${issue.issueID}`);
            doc.text(`Resident ID: ${issue.residentID}`);
            doc.text(`Description: ${issue.description}`);
            doc.text(`Status: ${issue.status}`);
            doc.text(`Date Reported: ${new Date(issue.dateReported).toLocaleString()}`);
            doc.text(`Location: ${issue.location}`);
            doc.text(`Issue Category: ${issue.issueCategory}`);
            if (issue.issue_image_path) {
                doc.text(`Image Path: ${issue.issue_image_path}`);
            }
            doc.moveDown();
        });

        // Finalize the PDF and end the stream
        doc.end();

        writeStream.on('finish', () => {
            // Return the file as a response
            res.download(pdfPath, 'issues_report.pdf', (err) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({ message: 'Error downloading the PDF file.' });
                } else {
                    // Optionally, delete the PDF after download to free up space
                    fs.unlink(pdfPath, (unlinkErr) => {
                        if (unlinkErr) console.error('Error deleting the PDF file after download:', unlinkErr);
                    });
                }
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    getIssuesForReport,
    getIssueCountPerMonth,
    getIssueReporter,
    reportIssue,
    getIssuesByResidentID,
    getIssuesByDeptID,
    getAllIssues
};
