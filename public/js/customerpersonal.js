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

                // Populate the HTML elements with customer data
                document.getElementById("customerName").textContent = customer.Name;
                document.getElementById("customerDate").textContent = formattedDate;
                document.getElementById("customerDescription").textContent = customer.Description;
                document.getElementById("customerAddress").textContent = customer.Address;
                document.getElementById("customerFloor").textContent = customer.Floor;
                document.getElementById("customerMobilePhone").textContent = customer.MobilePhone;
                document.getElementById("customerPhone").textContent = customer.Phone;
                document.getElementById("customerEmail").textContent = customer.Email;
                document.getElementById("customerJobs").textContent = customer.Jobs;
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
    editButton.addEventListener("click", () => {
        // Find the associated modal using the data attribute
        const modalId = editButton.getAttribute("data-edit-form");
        const modal = document.getElementById(modalId);

        // Show the modal
        modal.style.display = "block";
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
            console.log(data);

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
