document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                // If login is successful, redirect to the admin page
                window.location.href = '/admin.html';
            } else {
                errorMessage.textContent = '用户名或密码错误。';
            }
        } catch (error) {
            console.error('Login request failed:', error);
            errorMessage.textContent = '登录请求失败，请检查网络或联系管理员。';
        }
    });
});
