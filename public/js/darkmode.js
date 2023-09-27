const themeToggle = document.getElementById("themeToggle");
const body = document.body;
let isDarkMode = false;

// Function to toggle between dark and light mode
function toggleTheme() {
    // Your code to toggle the theme here

    // Check the current theme and set the icon and tooltip accordingly
    if (isDarkMode) {
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        themeToggle.title = "Dark Mode";
        body.classList.remove("dark-theme");
    } else {
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        themeToggle.title = "Light Mode";
        body.classList.add("dark-theme");
    }
    isDarkMode = !isDarkMode; // Toggle the theme state
}

// Add a click event listener to toggle the theme and update the icon and tooltip
themeToggle.addEventListener("click", () => {
    toggleTheme();
});

// Initialize the icon and tooltip based on the initial theme state
toggleTheme();