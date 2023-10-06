// Function to hide or show elements based on authentication status
function toggleElements(isLoggedIn) {
    const elementsToShow = document.querySelectorAll('.show-when-logged-in');
    const elementsToHide = document.querySelectorAll('.hide-when-logged-in');

    elementsToShow.forEach((element) => {
        element.style.display = isLoggedIn ? 'block' : 'none';
    });

    elementsToHide.forEach((element) => {
        element.style.display = isLoggedIn ? 'none' : 'block';
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const customerID = params.get("id"); // Retrieve the customer ID from URL parameter

    // Make an HTTP request to the server to fetch customer data by ID
    fetch(`/getCustomerByID?id=${customerID}`)
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                const customer = data.data; // Assuming the server returns customer data as an object

                // Format the DateOfEntry
                const dateOfEntry = new Date(customer.DateOfEntry);
                const options = { day: 'numeric', month: 'long', year: 'numeric' };
                const formattedDate = dateOfEntry.toLocaleDateString('el-GR', options);

                // Format and populate the HTML elements with customer data
                document.getElementById("customerName").textContent = customer.Name;
                document.getElementById("customerDate").textContent = formattedDate;
                document.getElementById("customerDescription").textContent = customer.Description;
                document.getElementById("customerAddress").textContent = customer.Address;
                document.getElementById("customerFloor").textContent = customer.Floor;
                document.getElementById("customerMobilePhone").textContent = customer.MobilePhone;
                document.getElementById("customerPhone").textContent = customer.Phone;
                document.getElementById("customerEmail").textContent = customer.Email;

                // Add additional fields as needed
            } else {
                console.error("Error fetching customer data");
            }
        })
        .catch((error) => {
            console.error("Error fetching data:", error);
        });
});

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const customerID = params.get("id"); // Retrieve the customer ID from URL parameter

    // Make an HTTP request to fetch job data from the server for the specific customerID
    fetch(`/getJobsData?customerID=${customerID}`)
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                const jobsData = data.data;

                // Create an empty string to store the formatted job data
                let formattedJobs = "";

                // Iterate through the jobsData array and format each job
                for (const job of jobsData) {
                    // Format the job and add it to the formattedJobs string
                    const formattedJob = `${job.jobName}: ${formatDate(job.jobDate)}`;
                    formattedJobs += formattedJob + "<br><br>"; // Add line break for each job
                }

                // Populate the "Jobs" field with the formatted job data
                const jobsField = document.getElementById("customerJobs");
                jobsField.innerHTML = formattedJobs;
            } else {
                console.error('Error fetching job data');
            }
        })
        .catch((error) => {
            console.error('Error fetching data:', error);
        });
});

// Function to format a date in the format dd-mm-yyyy
function formatDate(dateString) {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const date = new Date(dateString);
    return date.toLocaleDateString('el-GR', options);
}

document.addEventListener('DOMContentLoaded', () => {
    const userNameLink = document.getElementById('userName');
    const logoutButton = document.getElementById('logoutButton');

    // Send a GET request to the server to check if the user is logged in
    fetch('/check-auth', {
        method: 'GET',
    })
    .then((response) => response.json())
    .then((data) => {
        if (data.isLoggedIn) {
            // User is logged in, update the user's name in the link
            userNameLink.textContent = `Welcome, ${data.username}`;

            // Add a click event listener to the user's name to toggle the logout button
            userNameLink.addEventListener('click', () => {
                logoutButton.style.display = logoutButton.style.display === 'block' ? 'none' : 'block';
            });
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });

    // Add a click event listener to the "Logout" option
    logoutButton.addEventListener('click', () => {
        // Send a POST request to the server to perform logout
        fetch('/logout', {
            method: 'POST',
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                // Handle successful logout (e.g., redirect to login page)
                window.location.href = '/login.html';
            } else {
                // Handle logout failure
                console.error('Logout failed:', data.message);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    });
});

function sendDataToServer(data) {
    // Use fetch or another method to send the JSON data to the server
    fetch('/insertJob', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then((response) => response.json())
    .then((result) => {
        if (result.success) {
            // Handle success
            console.log('Data inserted successfully');
        } else {
            // Handle failure
            console.error('Data insertion failed');
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const params = new URLSearchParams(window.location.search);
    const customerForm = document.getElementById('customerForm'); // Get the form
    const customerID = params.get("id"); // Retrieve the customer ID from the URL parameter

    // Define a variable to store the selected job name
    let selectedJobName = null;

    // Make an HTTP request to fetch job data from the server
    fetch(`/getJobsData?customerID=${customerID}`)
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                jobsData = data.data;

                // Add click event listener to dropdown links
                const dropdownLinks = document.querySelectorAll('.dropdown-link');
                dropdownLinks.forEach((link) => {
                    const jobName = link.getAttribute('data-job');

                    // Create a new row element
                    const newRow = document.createElement('div');
                    newRow.className = 'editCustomerFormJobs'; // Add appropriate class name
                    newRow.style.display = 'none'; // Initially hide the row

                    // Create a paragraph element for displaying the name
                    const nameParagraph = document.createElement('p');
                    nameParagraph.textContent = jobName;
                    newRow.appendChild(nameParagraph);

                    // Create a text input element
                    const newInput = document.createElement('input');
                    newInput.type = 'date';
                    newInput.id = `jobDate-${jobName}`; // Set a unique id for the input element

                    // Find the matching job data if it exists
                    const matchingJob = jobsData.find((job) => job.jobName === jobName);
                    if (matchingJob) {
                        newInput.value = matchingJob.jobDate; // Set the input value if data exists
                    }

                    // Append the new input to the new row
                    newRow.appendChild(newInput);

                    // Append the new row to the customerForm
                    customerForm.appendChild(newRow);

                    // Add a click event listener to the dropdown link
                    link.addEventListener('click', function (e) {
                        e.preventDefault();

                        // Remove the "active" class from all dropdown links
                        dropdownLinks.forEach((otherLink) => {
                            otherLink.classList.remove('active');
                        });

                        // Add the "active" class to the clicked dropdown link
                        link.classList.add('active');

                        // Update the selectedJobName variable
                        selectedJobName = jobName;

                        // Hide all editCustomerForm rows
                        const allEditCustomerForms = document.querySelectorAll('.editCustomerFormJobs');
                        allEditCustomerForms.forEach((form) => {
                            form.style.display = 'none';
                        });

                        // Show the corresponding editCustomerForm row
                        newRow.style.display = 'block';
                    });
                });
            } else {
                console.error('Error fetching job data');
            }
        })
        .catch((error) => {
            console.error('Error fetching data:', error);
        });

        customerForm.addEventListener('submit', function (e) {
            e.preventDefault();
    
            // Get the selected job name from the clicked dropdown link
            const activeLink = document.querySelector('.dropdown-link.active');
    
            if (activeLink) {
                const selectedJob = activeLink.textContent;
                const jobDateInput = document.getElementById(`jobDate-${selectedJob}`);
                const jobDate = jobDateInput.value;
    
                // Create a JSON object with the collected data
                const jobData = {
                    customerID: customerID,
                    jobName: selectedJob,
                    JobDate: jobDate,
                };
                
                // Make an HTTP POST request to update the server-side data
                fetch('/updateJobsData', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(jobData), // Send the JSON data to the server
                })
                .then((response) => response.json())
                .then((result) => {
                    if (result.success) {
                        // Handle success
                        window.location.reload();
                    } else {
                        // Log the error response for debugging
                        console.error('Data update on the server failed:', result.error);
                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
            } else {
                // Handle the case when no active dropdown link is found
                console.error('No active dropdown link found.');
            }
        });    
});

// Check if the user is logged in by examining session data
fetch('/check-auth') // Create a server route to check authentication status
    .then((response) => response.json())
    .then((data) => {
        const isLoggedIn = data.isLoggedIn; // Modify this based on your server response
        toggleElements(isLoggedIn);
    })
    .catch((error) => {
        console.error('Error checking authentication status:', error);
});

// Get all edit buttons and modals
const editButtons = document.querySelectorAll(".editButton");
const modals = document.querySelectorAll(".modal");

// Add a click event listener to each edit button
editButtons.forEach((editButton) => {
    editButton.addEventListener("click", async () => {
        // Find the associated modal using the data attribute
        const modalId = editButton.getAttribute("data-edit-form");
        const modal = document.getElementById(modalId);

        // Show the modal
        modal.style.display = "block";


        const params = new URLSearchParams(window.location.search);
        const customerID = params.get("id"); // Retrieve the customer ID from URL parameter

        // Find the associated edit form
        const editForm = modal.querySelector(".editCustomerForm");

        try {
            // Fetch the old data for the customer from the server
            const oldDataResponse = await fetch(`/getCustomerByID?id=${customerID}`);
            if (!oldDataResponse.ok) {
                throw new Error(`HTTP error! Status: ${oldDataResponse.status}`);
            }
            const oldData = await oldDataResponse.json();
            // Populate the form fields with the old data
            editForm.querySelectorAll('input').forEach((input) => {
            const fieldName = input.getAttribute('name');
            input.value = oldData.data[fieldName];
            });
        } catch (error) {
            console.error("Error fetching customer data:", error);
            // Handle the error (e.g., show an error message)
        }
    });
});

// Add click event listeners to each close button
const closeButtons = document.querySelectorAll(".close");
closeButtons.forEach((closeButton) => {
    closeButton.addEventListener("click", () => {
        // Find the associated modal using the data attribute
        const modalId = closeButton.getAttribute("data-close-modal");
        const modal = document.getElementById(modalId);

        // Hide the modal
        modal.style.display = "none";
    });
});

// Add a click event listener to each modal to close it when clicking outside
modals.forEach((modal) => {
    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
});

const editForms = document.querySelectorAll(".editCustomerForm");
editForms.forEach((editForm) => {
    editForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const params = new URLSearchParams(window.location.search);
        const customerID = params.get("id"); // Retrieve the customer ID from URL parameter

        // Find the associated modal using the data attribute
        const modalId = editForm.getAttribute("data-edit-form");
        const modal = document.getElementById(modalId);

        // Create an object to hold the fields you want to send
        const formData = {};

        // Iterate through the form elements
        editForm.querySelectorAll('input').forEach((input) => {
            // Get the field name from the input's name attribute
            const fieldName = input.getAttribute('name');

            // Get the value of the input field, handling null case
            const fieldValue = input.value || '';

            // Add the field to formData
            formData[fieldName] = fieldValue;
        });

        try {
            const response = await fetch(`/update-customer?id=${customerID}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json", // Set the content type to JSON
                },
                body: JSON.stringify(formData), // Convert the data to a JSON string
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            // Handle the response data (e.g., show a success message)

            // Close the associated modal when done
            modal.style.display = "none";

            // Reload the page to reflect the updated data
            location.reload();
        } catch (error) {
            console.error("Error updating customer data:", error);
            // Handle the error (e.g., show an error message)
        }
    });
});
