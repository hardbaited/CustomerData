// Get references to HTML elements
const addCustomerForm = document.getElementById("addCustomerForm");
const nameInput = document.getElementById("name");
const customerMobilePhoneInput = document.getElementById("customerMobilePhone");
const messageElement = document.getElementById("message");
const tableBody = document.getElementById("customerTableBody");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const searchContainer = document.querySelector(".search-container");
let originalCustomerData = []; // Add this global variable
let sortOrder = "asc"; // Default sorting order is ascending (A to Z)

const itemsPerPage = 15;
let currentPage = 1;
let totalEntries = 0;

// Function to insert customer data
function insertData() {
    const name = nameInput.value.trim();
    const MobilePhone = customerMobilePhoneInput.value;

    if (!name || !MobilePhone) {
        messageElement.innerText = "Please fill in all fields.";
        messageElement.style.color = "red";
        return;
    }

    const data = {
        name,
        MobilePhone,
    };

    fetch('/insert', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then((response) => response.json())
    .then((result) => {
        nameInput.value = "";
        customerMobilePhoneInput.value = "";

        if (result.success) {
            messageElement.innerText = "Customer added successfully!";
            messageElement.style.color = "green";
        } else {
            messageElement.innerText = "Error adding customer.";
            messageElement.style.color = "red";
        }
    })
    .catch((error) => {
        console.error("Error:", error);
    });
}

function fetchCustomerData() {
    const url = `/getCustomers?sort=${sortOrder}`;

    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                originalCustomerData = data.data; // Store the original data
                customerData = [...originalCustomerData]; // Create a copy for sorting
                totalEntries = customerData.length;
                sortAndDisplayData(currentPage);
            } else {
                console.error("Error fetching customer data");
            }
        })
        .catch((error) => {
            console.error("Error fetching data:", error);
        });
}

function sortAndDisplayData(page) {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalEntries);

    const tbody = tableBody;
    tbody.innerHTML = "";

    for (let i = startIndex; i < endIndex; i++) {
        const customer = customerData[i];
        const newRow = tbody.insertRow();

        // Add the ID column (cell)
        const cell0 = newRow.insertCell(0); // This is the ID column

        // The rest of the columns (cells)
        const cell1 = newRow.insertCell(1); // Name
        const cell2 = newRow.insertCell(2); // Phone Number

        // Populate the cells with data
        cell0.innerHTML = customer.ID; // ID
        cell1.innerHTML = customer.Name; // Name

        // Check if both MobilePhone and Phone exist
        if (customer.MobilePhone && customer.Phone) {
            cell2.innerHTML = `${customer.MobilePhone} - ${customer.Phone}`; // MobilePhone - Phone
        } else if (customer.MobilePhone) {
            cell2.innerHTML = customer.MobilePhone; // Only MobilePhone
        } else if (customer.Phone) {
            cell2.innerHTML = customer.Phone; // Only Phone
        }
    }

    // Update the pagination controls
    updatePagination();
}

// Function to filter and display matching rows in the table
function searchCustomer() {
    const searchInputValue = document.getElementById("searchInput").value.toLowerCase().trim();

    // Filter the original data based on the search input
    customerData = originalCustomerData.filter((customer) => {
        const nameLowerCase = customer.Name.toLowerCase();
        const mobilePhone = customer.MobilePhone;
        const phone = customer.Phone;

        // Check if either name, mobile phone, or phone matches the search input
        return (
            nameLowerCase.includes(searchInputValue) ||
            (mobilePhone && mobilePhone.toLowerCase().includes(searchInputValue)) ||
            (phone && phone.toLowerCase().includes(searchInputValue))
        );
    });

    totalEntries = customerData.length;

    // Sort and display the filtered data based on the current page
    sortAndDisplayData(currentPage);
}

function displayPage(pageNumber, data) {
    const rows = tableBody.getElementsByTagName("tr");

    for (let i = 0; i < rows.length; i++) {
        const dataIndex = i + (pageNumber - 1) * itemsPerPage;
        const rowData = data[dataIndex];

        if (rowData) {
            // Display the row and populate it with data from the server response
            rows[i].style.display = "";
            const cells = rows[i].getElementsByTagName("td");
            cells[0].textContent = rowData.ID;
            cells[1].textContent = rowData.Name;
            cells[2].textContent = rowData.MobilePhone;
        } else {
            // Hide the row if there's no data for that row
            rows[i].style.display = "none";
        }
    }
}

function updatePagination() {
    const totalPages = Math.ceil(totalEntries / itemsPerPage);
    const paginationControls = document.getElementById("paginationControls");
    paginationControls.innerHTML = "";

    const maxVisiblePages = 5; // Maximum number of pages to show at once
    const halfMaxVisiblePages = Math.floor(maxVisiblePages / 2);

    const startPage = Math.max(currentPage - halfMaxVisiblePages, 1);
    const endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

    // Create a button for the first page only if it's not already on display
    if (startPage > 1) {
        const firstPageButton = createPageButton(1);
        paginationControls.appendChild(firstPageButton);
    }

    // If the startPage is greater than 2, add an ellipsis
    if (startPage > 2) {
        const ellipsis1 = createEllipsis();
        paginationControls.appendChild(ellipsis1);
    }

    // Create buttons for the pages within the range [startPage, endPage]
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = createPageButton(i);
        paginationControls.appendChild(pageButton);
    }

    // If the endPage is less than totalPages - 1, add an ellipsis
    if (endPage < totalPages - 1) {
        const ellipsis2 = createEllipsis();
        paginationControls.appendChild(ellipsis2);
    }

    // Create a button for the last page only if it's not already on display
    if (endPage < totalPages) {
        const lastPageButton = createPageButton(totalPages);
        paginationControls.appendChild(lastPageButton);
    }
}

function createPageButton(pageNumber) {
    const pageLink = document.createElement("a");
    pageLink.href = "#";
    pageLink.textContent = pageNumber;

    if (pageNumber === currentPage) {
        pageLink.style.color = "red"; // Change the color of the current page
    }

    pageLink.addEventListener("click", () => {
        currentPage = pageNumber;
        displayPage(currentPage);
    });

    return pageLink;
}

function createEllipsis() {
    const ellipsis = document.createElement("span");
    ellipsis.textContent = "...";
    return ellipsis;
}

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

// Add an event listener to the table
tableBody.addEventListener("click", (event) => {
    // Check if the clicked element is a TD element within the table
    if (event.target.tagName === "TD" && event.target.cellIndex === 1) { // Assuming Name is in the second column (cellIndex 1)
        // Get the row that was clicked
        const clickedRow = event.target.parentElement;

        // Get the customer ID and customer Name from the clicked row
        const customerID = clickedRow.cells[0].textContent;
        const customerName = clickedRow.cells[1].textContent;

        // Encode the data as query parameters
        const queryParams = `?id=${encodeURIComponent(customerID)}&name=${encodeURIComponent(customerName)}`;

        // Construct the URL for customerpersonal.html with query parameters
        const url = `customerpersonal.html${queryParams}`;

        // Redirect to the customerpersonal.html page with the data
        window.location.href = url;
    }
});

// Modify the event listener for sorting
document.getElementById("idHeader").addEventListener("click", () => {
    // Toggle the sorting order between "asc" and "desc"
    sortOrder = sortOrder === "asc" ? "desc" : "asc";
    
    // Update the content of the #nameHeader element with arrows
    const idHeader = document.getElementById("idHeader");
    idHeader.innerHTML = `ID ${sortOrder === "asc" ? "▲" : "▼"}`;
    
    fetchCustomerData(sortOrder); // Fetch customer data with the new sorting order
});


document.getElementById("uploadButton").addEventListener("click", () => {
    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];

    if (file) {
        const formData = new FormData();
        formData.append("file", file);

        fetch("/upload", {
            method: "POST",
            body: formData,
        })
        .then((response) => response.json())
        .then((result) => {
            if (result.success) {
                alert("File uploaded successfully!");
                fetchCustomerData();
            } else {
                alert("Error uploading file.");
            }
        })
        .catch((error) => {
            console.error("Error:", error);
        });
    }
});

searchInput.addEventListener("input", () => {
    searchCustomer(); // Filter the data
    displayPage(1); // Display the first page of filtered results
    updatePagination(); // Update pagination controls
});

document.addEventListener("DOMContentLoaded", () => {
    fetchCustomerData();
});

document.getElementById("paginationControls").addEventListener("click", (event) => {
    if (event.target.tagName === "A") {
        currentPage = parseInt(event.target.textContent);
        sortAndDisplayData(currentPage);
    }
});


document.getElementById("addCustomerButton").addEventListener("click", () => {
    insertData();
    fetchCustomerData();
    displayPage(currentPage);
    updatePagination();
});

searchButton.addEventListener("click", () => {
    searchContainer.classList.toggle("expanded");
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