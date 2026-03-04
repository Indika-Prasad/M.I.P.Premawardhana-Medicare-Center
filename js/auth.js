document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMsg = document.getElementById('errorMsg');

    // Check if already logged in when on login page
    if (window.location.pathname.endsWith('login.html')) {
        if (localStorage.getItem('adminAuth') === 'true') {
            window.location.href = 'admin.html';
        }
    }

    // Check if not logged in when on admin page
    if (window.location.pathname.endsWith('admin.html')) {
        if (localStorage.getItem('adminAuth') !== 'true') {
            window.location.href = 'login.html';
        }
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            // Required credentials: INDIKA / 454454
            if (username === 'INDIKA' && password === '454454') {
                localStorage.setItem('adminAuth', 'true');
                window.location.href = 'admin.html';
            } else {
                errorMsg.classList.remove('hidden');
                setTimeout(() => {
                    errorMsg.classList.add('hidden');
                }, 3000);
            }
        });
    }

    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('adminAuth');
            window.location.href = 'login.html';
        });
    }
});
