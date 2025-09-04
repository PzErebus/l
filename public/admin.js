document.addEventListener('DOMContentLoaded', async () => {
    const apiUrl = 'http://localhost:3000/api/lines';
    const authCheckUrl = 'http://localhost:3000/api/check-auth';
    const logoutUrl = 'http://localhost:3000/api/logout';

    const lineForm = document.getElementById('line-form');
    const lineNameInput = document.getElementById('lineName');
    const stationsInput = document.getElementById('stations');
    const linesList = document.getElementById('lines-list');
    const logoutButton = document.getElementById('logout-button');

    // --- Authentication Check ---
    try {
        const response = await fetch(authCheckUrl, { credentials: 'include' });
        const authStatus = await response.json();
        if (!authStatus.loggedIn) {
            window.location.href = '/login.html';
            return; // Stop executing script
        }
    } catch (error) {
        console.error('Auth check failed', error);
        window.location.href = '/login.html';
        return;
    }

    // --- Logout Button ---
    logoutButton.addEventListener('click', async () => {
        try {
            await fetch(logoutUrl, { method: 'POST', credentials: 'include' });
            window.location.href = '/login.html';
        } catch (error) {
            console.error('Logout failed', error);
            alert('Logout failed. Please try again.');
        }
    });

    // --- Page Logic ---
    const fetchAndDisplayLines = async () => {
        try {
            const response = await fetch(apiUrl, { credentials: 'include' });
            if (response.status === 401) { // If session expired or invalid
                window.location.href = '/login.html';
                return;
            }
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const lines = await response.json();
            linesList.innerHTML = ''; // Clear current list
            lines.forEach(line => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <h3>${line.lineName}</h3>
                    <p><strong>Line ID:</strong> ${line.lineId}</p>
                    <p><strong>Stations:</strong></p>
                    <pre>${JSON.stringify(line.stations, null, 2)}</pre>
                `;
                linesList.appendChild(li);
            });
        } catch (error) {
            console.error('Failed to fetch lines:', error);
            linesList.innerHTML = '<li>Error loading lines. Check console.</li>';
        }
    };

    lineForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const lineName = lineNameInput.value.trim();
        const stationsRaw = stationsInput.value.trim();

        if (!lineName || !stationsRaw) {
            alert('Please fill out all fields.');
            return;
        }

        let stations;
        try {
            stations = JSON.parse(stationsRaw);
        } catch (error) {
            alert('Stations data is not valid JSON.');
            return;
        }

        const newLine = { lineName, stations };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(newLine),
            });

            if (response.status === 401) {
                window.location.href = '/login.html';
                return;
            }
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            lineForm.reset();
            await fetchAndDisplayLines();

        } catch (error) {
            console.error('Failed to add line:', error);
            alert('Error adding line. Check console.');
        }
    });

    fetchAndDisplayLines(); // Initial load
});
