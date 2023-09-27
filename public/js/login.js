document.getElementById("loginButton").addEventListener("click", () => {
    event.preventDefault(); // Prevent form submission
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Send a POST request to the server to perform login
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                // Handle success
                // Redirect to customer.html after successful login
                window.location.href = '/customer';
            } else {
                // Handle failure
                alert(data.message);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });   
});