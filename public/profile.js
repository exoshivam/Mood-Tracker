// Load saved data from localStorage
function loadProfileData() {
  const savedData = localStorage.getItem("profileData");
  if (savedData) {
    const data = JSON.parse(savedData);

    if (data.profilePhoto) {
      const avatar = document.getElementById("avatar-container");
      avatar.classList.add("has-image");
      document.getElementById("profile-photo").src = data.profilePhoto;
    }

    document.getElementById("user-name-display").innerText =
      data.name || "User";
    document.getElementById("email").value = data.email || "";
    document.getElementById("dob").value = data.dob || "";
    document.getElementById("bio").value = data.bio || "";
  }
}

// Initialize form when page loads
document.addEventListener("DOMContentLoaded", function () {
  loadProfileData();

  document
    .getElementById("nameInput")
    .addEventListener("keypress", function (e) {
      if (e.key === "Enter") saveName();
    });
});

// Change profile photo
document
  .getElementById("photo-upload")
  .addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File size should be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = function (e) {
        const avatar = document.getElementById("avatar-container");
        avatar.classList.add("has-image");
        const photoSrc = e.target.result;
        document.getElementById("profile-photo").src = photoSrc;

        const savedData = localStorage.getItem("profileData") || "{}";
        const data = JSON.parse(savedData);
        data.profilePhoto = photoSrc;
        localStorage.setItem("profileData", JSON.stringify(data));
      };
      reader.readAsDataURL(file);
    }
  });

// Name modal functions
function openNameModal() {
  const currentName = document.getElementById("user-name-display").innerText;
  document.getElementById("nameInput").value = currentName;
  document.getElementById("nameEditModal").style.display = "flex";
  document.getElementById("nameInput").focus();
}

function closeNameModal() {
  document.getElementById("nameEditModal").style.display = "none";
}

function saveName() {
  const newName = document.getElementById("nameInput").value.trim();
  if (newName) {
    document.getElementById("user-name-display").innerText = newName;

    const savedData = localStorage.getItem("profileData") || "{}";
    const data = JSON.parse(savedData);
    data.name = newName;
    localStorage.setItem("profileData", JSON.stringify(data));
  }
  closeNameModal();
}

// Reset data functions
function openResetModal() {
  document.getElementById("resetModal").style.display = "flex";
}

function closeResetModal() {
  document.getElementById("resetModal").style.display = "none";
}

function confirmReset() {
  // Clear all saved data
  localStorage.removeItem("profileData");

  // Reset form fields
  document.getElementById("avatar-container").classList.remove("has-image");
  document.getElementById("profile-photo").src = "";
  document.getElementById("user-name-display").innerText = "User";
  document.getElementById("email").value = "";
  document.getElementById("dob").value = "";
  document.getElementById("bio").value = "";
  document.getElementById("old-password").value = "";
  document.getElementById("new-password").value = "";

  closeResetModal();
  alert("All data has been reset successfully!");
}

// Toggle password visibility
function togglePassword(fieldId) {
  const passwordField = document.getElementById(fieldId);
  const toggleButton = passwordField.nextElementSibling;

  if (passwordField.type === "password") {
    passwordField.type = "text";
    toggleButton.textContent = "Hide";
  } else {
    passwordField.type = "password";
    toggleButton.textContent = "Show";
  }
}

// Save profile changes
function saveProfileChanges(event) {
  event.preventDefault();

  const name = document.getElementById("user-name-display").innerText;
  const email = document.getElementById("email").value;
  const dob = document.getElementById("dob").value;
  const bio = document.getElementById("bio").value;
  const newPassword = document.getElementById("new-password").value;

  if (newPassword && newPassword.length < 6) {
    alert("New password must be at least 6 characters long");
    return false;
  }

  const profileData = {
    name,
    email,
    dob,
    bio,
    profilePhoto: document.getElementById("profile-photo").src || "",
  };

  localStorage.setItem("profileData", JSON.stringify(profileData));
  alert("Changes saved successfully!");
  return false;
}

// Logout function
function logout() {
  if (confirm("Are you sure you want to log out?")) {
    alert("You have been logged out");
    window.location.href = "login.html";
  }
}
