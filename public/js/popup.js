// Get references to HTML elements
const openFormButton = document.getElementById("openFormButton");
const popupContainer = document.getElementById("popupContainer");
const closeFormButton = document.getElementById("closeFormButton");

// Function to open the pop-up
openFormButton.addEventListener("click", () => {
    popupContainer.style.display = "block";
});

// Function to close the pop-up
closeFormButton.addEventListener("click", () => {
    popupContainer.style.display = "none";
});

// Close the pop-up if the user clicks outside of it
window.addEventListener("click", (event) => {
    if (event.target === popupContainer) {
        popupContainer.style.display = "none";
    }
});