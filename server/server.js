const express = require('express');
const session = require('express-session'); // Add this line
const mysql = require('mysql');
const bodyParser = require('body-parser');
const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs'); // Add this require for reading the config file
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const app = express();
const port = config.server.port;
const path = require('path');
const upload = multer({ dest: 'uploads/' });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

const connection = mysql.createConnection({
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    database: config.database.databaseName,
    waitForConnections: true, // This is important to prevent timeouts
    connectionLimit: 10, // Adjust the limit based on your requirements
    queueLimit: 0, // No limit on the number of queued connections
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');
});

app.get('/', (req, res) => {
    const loginPath = path.join(__dirname, '..', 'public', 'login.html');
    res.sendFile(loginPath);
});

app.use(express.static('public/', { extensions: ['html', 'htm', 'js', 'css'] }));

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

app.use(express.json());

app.post('/insert', (req, res) => {
    const { name, MobilePhone } = req.body;
    
    if (!name || !MobilePhone) {
        return res.status(400).json({ success: false, error: 'Invalid data' });
    }

    const sql = 'INSERT INTO Customers (Name, MobilePhone, DateOfEntry) VALUES (?, ?, NOW())';
    const values = [name, MobilePhone];

    connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ success: false, error: 'Failed to insert data' });
        } else {
            return res.json({ success: true });
        }
    });
});

app.get('/getCustomers', (req, res) => {
    const sortOrder = req.query.sort; // Get the sort order from the query parameter

    let sql = 'SELECT * FROM Customers';

    // Add an ORDER BY clause to the SQL query based on sortOrder
    if (sortOrder === 'asc') {
        sql += ' ORDER BY ID ASC'; // Sort names in ascending order
    } else if (sortOrder === 'desc') {
        sql += ' ORDER BY ID DESC'; // Sort names in descending order
    }

    connection.query(sql, (err, result) => {
        if (err) {
            console.error('Error fetching customer data:', err);
            res.json({ success: false, error: 'Failed to fetch data' });
        } else {
            res.json({ success: true, data: result });
        }
    });
});

app.get("/getCustomerByID", (req, res) => {
    const customerID = req.query.id; // Retrieve the customer ID from the query parameter

    // Query the database to fetch customer data by ID
    const query = "SELECT * FROM Customers WHERE ID = ?"; // Adjust your SQL query accordingly
    connection.query(query, [customerID], (err, results) => {
        if (err) {
            console.error("Error fetching customer data:", err);
            res.json({ success: false });
        } else {
            if (results.length > 0) {
                const customerData = results[0]; // Assuming you get a single customer record
                res.json({ success: true, data: customerData });
            } else {
                res.json({ success: false });
            }
        }
    });
});

app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const filePath = req.file.path;

    try {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        const insertData = (entry) => {
            const numericDate = entry.DateOfEntry;
            const date = new Date((numericDate - 25569) * 86400 * 1000);
            const formattedDate = date.toISOString().split('T')[0];

            const sql = 'INSERT INTO Customers (Name, DateOfEntry, Description) VALUES (?, ?, ?)';
            const values = [entry.Name, formattedDate, entry.Description];

            connection.query(sql, values, (err, results) => {
                if (err) {
                    console.error('Error inserting data:', err);
                } else {
                    fetchAndSendData(res);
                }
            });
        };

        for (const entry of data) {
            insertData(entry);
        }
    } catch (error) {
        console.error('Error processing XLSX file:', error);
        res.status(500).json({ success: false, message: 'Error processing the file.' });
    }
});

app.post(`/update-customer`, upload.none(), (req, res) => {
    const customerID = req.query.id; // Retrieve the customer ID from the query parameter
    const fieldsToUpdate = [
        { requestField: "Name", dbColumn: "Name" },
        { requestField: "Description", dbColumn: "Description" },
        { requestField: "Adress", dbColumn: "Address" },
        { requestField: "Floor", dbColumn: "Floor" },
        { requestField: "MobilePhone", dbColumn: "MobilePhone" },
        { requestField: "Phone", dbColumn: "Phone" },
        { requestField: "Email", dbColumn: "Email" },
    ];

    // Construct the SQL query dynamically based on which fields are provided
    let sql = `UPDATE Customers SET `;
    const values = [];

    fieldsToUpdate.forEach((field) => {
        const requestValue = req.body[field.requestField];
        if (requestValue !== undefined) {
            // Add the field to the SET clause and its corresponding value
            sql += `${field.dbColumn} = ?, `;
            values.push(requestValue);
        }
    });

    // Remove the trailing comma and space
    sql = sql.slice(0, -2);

    // Add the WHERE clause for the specific customer ID
    sql += ` WHERE ID = ?`;
    values.push(customerID);

    // Execute the SQL query to update customer data
    connection.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error updating customer data:", err);
            return res.status(500).json({ success: false, error: "Failed to update customer data" });
        }

        return res.json({ success: true });
    });
});

const fetchAndSendData = (res) => {
    const sql = 'SELECT * FROM Customers';
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            res.status(500).json({ success: false, message: 'Error fetching data from the database.' });
        } else {
            const data = results;
            res.json({ success: true, data });
        }
    });
};

// Login endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Query the database to find a user with the given username
    connection.query('SELECT * FROM Users WHERE username = ?', [username], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        // Check if a user with the provided username exists
        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const user = results[0];

        // Compare the provided password with the password from the database (no hashing)
        if (password !== user.password) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Store user data in the session upon successful login
        req.session.user = user;

        // Redirect to customer.html after successful login
        res.json({ success: true, message: 'Login successful' });
    });
});

// Logout endpoint
app.post('/logout', (req, res) => {
    // Check if the user is authenticated (logged in)
    if (req.session.user) {
        // If the user is authenticated, destroy the session to log them out
        req.session.destroy((err) => {
            if (err) {
                console.error('Session destruction error:', err);
                return res.status(500).json({ success: false, message: 'Internal Server Error' });
            }
            
            // Redirect the user to the login page after successful logout
            res.json({ success: true, message: 'Logout successful' });
        });
    } else {
        // If the user is not authenticated, return an error
        res.status(401).json({ success: false, message: 'Not authenticated' });
    }
});

app.get('/check-auth', (req, res) => {
    if (req.session.user) {
        // If user data is stored in the session, the user is authenticated
        const userData = {
            isLoggedIn: true,
            username: req.session.user.username, // Include other user data as needed
            // Add more user-related data here if necessary
        };
        res.json(userData);
    } else {
        // If no user data is found in the session, the user is not authenticated
        res.json({ isLoggedIn: false });
    }
});

const jobsFilePath = path.join(__dirname, 'Jobs.json');

app.post('/insertJob', (req, res) => {
    const { jobName, jobDate, customerID } = req.body;

    if (!jobName || !jobDate || !customerID) {
        return res.status(400).json({ success: false, error: 'Invalid data' });
    }

    // Create a JavaScript object to represent the new job data
    const jobData = {
        customerID: customerID, // Include the customer ID
        jobName: jobName,
        jobDate: jobDate,
    };

    // Read the current data from the Jobs.json file
    fs.readFile(jobsFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading Jobs.json:', err);
            return res.status(500).json({ success: false, error: 'Failed to read job data' });
        }

        let jobsArray = [];

        // If the file contains data, parse it
        if (data) {
            jobsArray = JSON.parse(data);
        }

        // Add the new job data to the array
        jobsArray.push(jobData);

        // Write the updated data back to the Jobs.json file
        fs.writeFile(jobsFilePath, JSON.stringify(jobsArray), 'utf8', (err) => {
            if (err) {
                console.error('Error writing Jobs.json:', err);
                return res.status(500).json({ success: false, error: 'Failed to insert job data' });
            } else {
                return res.json({ success: true });
            }
        });
    });
});

app.get('/getJobsData', (req, res) => {
    const customerID = req.query.customerID; // Retrieve the customerID from the query parameter

    // Read the Jobs.json file and send its contents as JSON
    fs.readFile(jobsFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading Jobs.json:', err);
            return res.status(500).json({ success: false, error: 'Failed to read job data' });
        }

        // Parse the data and filter it for the specific customerID
        const jobsData = JSON.parse(data);
        const filteredJobsData = jobsData.filter((job) => job.customerID === customerID);

        res.json({ success: true, data: filteredJobsData });
    });
});

// Update the job data for the specific customer
function updateJobDataOnServer(customerID, jobName, jobDate) {
    // Load existing job data from the JSON file
    fs.readFile(jobsFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading Jobs.json:', err);
            // Handle the error and return an appropriate response
            return;
        }

        let jobsArray = [];

        // If the file contains data, parse it
        if (data) {
            jobsArray = JSON.parse(data);
        }

        // Find the matching job data if it exists
        const matchingJobIndex = jobsArray.findIndex((job) => job.customerID === customerID);

        if (matchingJobIndex !== -1) {

            // Check if the jobName and jobDate already exist for this customer
            const existingJobIndex = jobsArray.findIndex((jobData) => jobData.customerID === customerID && jobData.jobName === jobName);
            
            if (existingJobIndex !== -1) {
                // Update the existing jobName and jobDate
                
                jobsArray[existingJobIndex].jobName = jobName;
                jobsArray[existingJobIndex].jobDate = jobDate;
            } else {
                // Add a new entry for the jobName and jobDate
                jobsArray.push({ customerID, jobName, jobDate });
            }
        } else {
            // If the customer doesn't exist, create a new entry
            jobsArray.push({ customerID, jobName, jobDate });
        }

        // Write the updated data back to the JSON file
        fs.writeFile(jobsFilePath, JSON.stringify(jobsArray, null, 2), 'utf8', (err) => {
            if (err) {
                console.error('Error writing Jobs.json:', err);
                // Handle the error and return an appropriate response
                return;
            }

            // Handle success and return an appropriate response
        });
    });
}

// REST endpoint to receive updated job data
app.post('/updateJobsData', express.json(), (req, res) => {
    const { customerID, jobName, JobDate } = req.body;

    if (!customerID || !jobName || !JobDate) {
        return res.status(400).json({ success: false, error: 'Invalid data' });
    }

    // Call the function to update job data on the server
    updateJobDataOnServer(customerID, jobName, JobDate);

    return res.json({ success: true });
});