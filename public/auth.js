// Function to show login modal
function showmodel() {
    const container = document.querySelector('.container.forms');
    const loginForm = document.querySelector('.form.login');
    const signupForm = document.querySelector('.form.signup');
    const resetForm = document.querySelector('.form.reset');
    
    // Hide all forms initially
    loginForm.style.display = 'none';
    signupForm.style.display = 'none';
    resetForm.style.display = 'none';
    
    // Show container and login form
    container.style.display = 'flex';
    loginForm.style.display = 'block';
    
    // Add event listener to close button
    const closeBtns = document.querySelectorAll('.cancel');
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            container.style.display = 'none';
            loginForm.style.display = 'none';
            signupForm.style.display = 'none';
            resetForm.style.display = 'none';
        });
    });
    
    // Add event listener to signup link
    const signupLink = document.querySelector('.signup-link');
    if (signupLink) {
        signupLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.style.display = 'none';
            signupForm.style.display = 'block';
            resetForm.style.display = 'none';
        });
    }
    
    // Add event listener to login link
    const loginLink = document.querySelector('.login-link');
    if (loginLink) {
        loginLink.addEventListener('click', (e) => {
            e.preventDefault();
            signupForm.style.display = 'none';
            loginForm.style.display = 'block';
            resetForm.style.display = 'none';
        });
    }

    // Add event listener to forgot password link
    const forgotPassLink = document.querySelector('.forgot-pass');
    if (forgotPassLink) {
        forgotPassLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.style.display = 'none';
            signupForm.style.display = 'none';
            resetForm.style.display = 'block';
        });
    }

    // Add click outside to close
    container.addEventListener('click', (e) => {
        if (e.target === container) {
            container.style.display = 'none';
            loginForm.style.display = 'none';
            signupForm.style.display = 'none';
            resetForm.style.display = 'none';
        }
    });
}

// Function to toggle password visibility
function togglePasswordVisibility(inputField, eyeIcon) {
    if (inputField.type === 'password') {
        inputField.type = 'text';
        eyeIcon.classList.remove('bx-hide');
        eyeIcon.classList.add('bx-show');
    } else {
        inputField.type = 'password';
        eyeIcon.classList.remove('bx-show');
        eyeIcon.classList.add('bx-hide');
    }
}

// Function to handle form submissions
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('.form.login form');
    const signupForm = document.querySelector('.form.signup form');
    const resetForm = document.querySelector('.form.reset form');
    
    // Add password toggle functionality
    const passwordFields = document.querySelectorAll('.password');
    passwordFields.forEach(field => {
        const eyeIcon = field.nextElementSibling;
        if (eyeIcon) {
            eyeIcon.addEventListener('click', () => {
                togglePasswordVisibility(field, eyeIcon);
            });
        }
    });
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const email = this.querySelector('input[name="email"]').value.trim();
            const password = this.querySelector('input[name="password"]').value.trim();
            
            console.log('Login form values:', { email, password }); // Debug log
            
            // Validate form data
            if (!email || !password) {
                alert('All fields are required');
                return;
            }
            
            // Create request data
            const requestData = {
                email: email,
                password: password
            };
            
            console.log('Sending login data:', requestData); // Debug log
            
            fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            })
            .then(response => {
                console.log('Login response status:', response.status); // Debug log
                return response.json();
            })
            .then(data => {
                console.log('Login response data:', data); // Debug log
                if (data.error) {
                    alert(data.error);
                } else if (data.success) {
                    // Update UI with user data
                    updateUIAfterLogin(data.user);
                    // Close the login modal
                    const container = document.querySelector('.container.forms');
                    container.style.display = 'none';
                }
            })
            .catch(error => {
                console.error('Login error:', error);
                alert('An error occurred during login');
            });
        });
    }
    
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const email = this.querySelector('input[name="email"]').value.trim();
            const password = this.querySelector('input[name="password"]').value.trim();
            const confirmPassword = this.querySelector('input[name="confirmPassword"]').value.trim();
            
            console.log('Form values:', { email, password, confirmPassword }); // Debug log
            
            // Validate form data
            if (!email || !password || !confirmPassword) {
                alert('All fields are required');
                return;
            }
            
            // Create request data
            const requestData = {
                email: email,
                password: password,
                confirmPassword: confirmPassword
            };
            
            console.log('Sending data:', requestData); // Debug log
            
            fetch('/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            })
            .then(response => {
                console.log('Response status:', response.status); // Debug log
                return response.json();
            })
            .then(data => {
                console.log('Response data:', data); // Debug log
                if (data.error) {
                    alert(data.error);
                } else if (data.success) {
                    // Update UI with user data
                    updateUIAfterLogin(data.user);
                    // Close the signup modal
                    const container = document.querySelector('.container.forms');
                    container.style.display = 'none';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred during signup');
            });
        });
    }

    if (resetForm) {
        resetForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            
            fetch('/reset', {
                method: 'POST',
                body: formData
            })
            .then(response => response.text())
            .then(data => {
                if (data.includes('error')) {
                    alert(data);
                } else {
                    alert('Password reset instructions have been sent to your email');
                    // Show login form after successful reset request
                    const container = document.querySelector('.container.forms');
                    const loginForm = document.querySelector('.form.login');
                    const resetForm = document.querySelector('.form.reset');
                    resetForm.style.display = 'none';
                    loginForm.style.display = 'block';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred during password reset');
            });
        });
    }
});

// Function to toggle profile menu
function toggleProfileMenu() {
    const profileMenu = document.getElementById('profileMenu');
    profileMenu.classList.toggle('active');
    
    // Close menu when clicking outside
    document.addEventListener('click', function closeMenu(e) {
        if (!e.target.closest('.profile-dropdown')) {
            profileMenu.classList.remove('active');
            document.removeEventListener('click', closeMenu);
        }
    });
}

// Function to update UI after successful login
function updateUIAfterLogin(userData) {
    const loginButtonContainer = document.getElementById('loginButtonContainer');
    const profileContainer = document.getElementById('profileContainer');
    const userEmail = document.getElementById('userEmail');
    
    // Hide login button and show profile
    loginButtonContainer.style.display = 'none';
    profileContainer.style.display = 'block';
    
    // Set user email
    userEmail.textContent = userData.email;
}

// Function to handle logout
function logout() {
    console.log('Attempting logout...'); // Debug log
    
    fetch('/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        console.log('Logout response status:', response.status); // Debug log
        return response.json();
    })
    .then(data => {
        console.log('Logout response:', data); // Debug log
        if (data.success) {
            // Reset UI
            const loginButtonContainer = document.getElementById('loginButtonContainer');
            const profileContainer = document.getElementById('profileContainer');
            
            if (loginButtonContainer) loginButtonContainer.style.display = 'block';
            if (profileContainer) profileContainer.style.display = 'none';
            
            // Redirect to home page
            window.location.href = '/';
        } else {
            console.error('Logout failed:', data.error);
            alert('Error during logout. Please try again.');
        }
    })
    .catch(error => {
        console.error('Logout error:', error);
        alert('An error occurred during logout. Please try again.');
    });
}

// Check if user is already logged in on page load
document.addEventListener('DOMContentLoaded', function() {
    fetch('/check-auth')
    .then(response => {
        console.log('Auth check response status:', response.status); // Debug log
        return response.json();
    })
    .then(data => {
        console.log('Auth check data:', data); // Debug log
        if (data.authenticated) {
            updateUIAfterLogin(data.user);
        }
    })
    .catch(error => {
        console.error('Auth check error:', error);
    });
}); 