document.addEventListener('DOMContentLoaded', function() {
    // State
    let loggedIn = false;
    let userName = "Guest";
    const appointments = [];

    // UI Elements
    const modals = document.querySelectorAll('.modal');
    const sections = document.querySelectorAll('.section');
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');
    const userDropdown = document.getElementById('userDropdown');
    const userNameSpan = document.getElementById('userName');
    const dashboardUserNameSpan = document.getElementById('dashboardUserName');
    
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const bookingForm = document.getElementById('bookingForm');

    // --- Core Functions ---
    
    window.openModal = (modalId) => {
        if (!loggedIn && (modalId === 'bookingModal' || modalId === 'videoCallModal')) {
            alert('Please log in or register to book an appointment.');
            openModal('loginModal');
            return;
        }
        document.getElementById(modalId).classList.add('active');
    };

    window.closeModal = (modalId) => {
        document.getElementById(modalId).classList.remove('active');
    };

    window.showSection = (sectionId) => {
        if (!loggedIn && (sectionId === 'appointments' || sectionId === 'dashboard')) {
            alert('Please log in to view this page.');
            openModal('loginModal');
            return;
        }

        sections.forEach(section => {
            section.classList.toggle('active', section.id === sectionId);
        });
        userDropdown.classList.remove('active');
    };

    const updateUIForLogin = () => {
        loggedIn = true;
        authButtons.style.display = 'none';
        userMenu.classList.add('active');
        userNameSpan.textContent = userName;
        dashboardUserNameSpan.textContent = userName;
        closeAllModals();
        updateDashboard();
        updateAppointmentsList();
        showSection('dashboard');
    };

    const updateUIForLogout = () => {
        loggedIn = false;
        userName = "Guest";
        authButtons.style.display = 'flex';
        userMenu.classList.remove('active');
        userDropdown.classList.remove('active');
        appointments.length = 0; // Clear appointments on logout
        showSection('home');
    };
    
    // --- Event Handlers ---
    
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('loginEmail').value.split('@')[0];
        userName = name.charAt(0).toUpperCase() + name.slice(1);
        updateUIForLogin();
    });

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        userName = document.getElementById('registerName').value;
        if(userName.trim() === '') {
            userName = 'User';
        }
        updateUIForLogin();
    });
    
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newAppointment = {
            doctor: document.getElementById('bookingDoctor').value,
            date: document.getElementById('bookingDate').value,
            time: document.getElementById('bookingTime').value,
            reason: document.getElementById('bookingReason').value,
            status: 'upcoming'
        };
        appointments.push(newAppointment);
        alert('Appointment booked successfully!');
        updateDashboard();
        updateAppointmentsList();
        closeModal('bookingModal');
        showSection('appointments');
    });
    
    window.logout = () => {
        updateUIForLogout();
    };

    window.bookWithDoctor = (doctorName) => {
        if (!loggedIn) {
            openModal('loginModal');
            return;
        }
        // This finds the option that contains the doctor's name and selects it
        const doctorSelect = document.getElementById('bookingDoctor');
        for (let i = 0; i < doctorSelect.options.length; i++) {
            if (doctorSelect.options[i].text.includes(doctorName)) {
                doctorSelect.selectedIndex = i;
                break;
            }
        }
        openModal('bookingModal');
    };
    
    window.joinCall = (index) => {
        openModal('videoCallModal');
        // In a real app, this would initiate a WebRTC connection
        // For simulation, we'll mark the appointment as completed after a delay
        setTimeout(() => {
            if (appointments[index]) {
                appointments[index].status = 'completed';
                updateDashboard();
                updateAppointmentsList();
            }
        }, 10000); // Mark as completed after 10 seconds
    };

    window.toggleUserDropdown = () => {
        userDropdown.classList.toggle('active');
    };

    // --- Helper Functions ---
    
    const closeAllModals = () => {
        modals.forEach(modal => modal.classList.remove('active'));
    };

    const updateDashboard = () => {
        const upcoming = appointments.filter(a => a.status === 'upcoming').length;
        const completed = appointments.filter(a => a.status === 'completed').length;
        
        document.getElementById('totalAppointments').textContent = appointments.length;
        document.getElementById('upcomingAppointments').textContent = upcoming;
        document.getElementById('completedAppointments').textContent = completed;

        if (appointments.length > 0) {
             document.getElementById('recentActivity').innerHTML = `<i class="fas fa-check-circle" style="color: green;"></i> Last activity: Booked appointment with ${appointments[appointments.length-1].doctor}.`;
        } else {
             document.getElementById('recentActivity').textContent = 'No recent activity.';
        }
    };
    
    const updateAppointmentsList = () => {
        const listEl = document.getElementById('appointmentList');
        if (appointments.length === 0) {
            listEl.innerHTML = `<p>You have no appointments. <a href="#" onclick="showSection('doctors')">Book one now!</a></p>`;
            return;
        }

        listEl.innerHTML = ''; // Clear list
        appointments.forEach((app, index) => {
            const item = document.createElement('div');
            item.className = 'appointment-item';
            
            let actionButton = '';
            if (app.status === 'upcoming') {
                actionButton = `<button class="btn btn-primary" onclick="joinCall(${index})"><i class="fas fa-video"></i> Join Call</button>`;
            } else {
                actionButton = `<button class="btn btn-secondary" disabled><i class="fas fa-check-circle"></i> Completed</button>`;
            }

            item.innerHTML = `
                <div>
                    <h4>${app.doctor}</h4>
                    <p>${app.reason || 'General Consultation'}</p>
                    <p><i class="fas fa-calendar"></i> ${app.date} at ${app.time}</p>
                </div>
                <div>
                    ${actionButton}
                </div>
            `;
            listEl.appendChild(item);
        });
    };

    // Close modals and dropdown if clicked outside
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            closeAllModals();
        }
        if (!event.target.closest('.user-menu')) {
            userDropdown.classList.remove('active');
        }
    });

    // Initial state
    updateUIForLogout(); // Start in logged-out state
    showSection('home');
});
      
