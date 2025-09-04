document.addEventListener('DOMContentLoaded', () => {
    const apiUrl = 'http://localhost:3000/api/lines';
    const lineForm = document.getElementById('line-form');
    const lineNameInput = document.getElementById('lineName');
    const stationsInput = document.getElementById('stations');
    const linesList = document.getElementById('lines-list');

    // Function to fetch lines and display them
    const fetchAndDisplayLines = async () => {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const lines = await response.json();

            // Clear current list
            linesList.innerHTML = '';

            // Render each line
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
            linesList.innerHTML = '<li>Error loading lines. Check the console for details.</li>';
        }
    };

    // Function to handle form submission
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
            alert('Stations data is not valid JSON. Please check the format.');
            return;
        }

        const newLine = {
            lineName,
            stations
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newLine),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Clear form and refresh list
            lineForm.reset();
            await fetchAndDisplayLines();

        } catch (error) {
            console.error('Failed to add line:', error);
            alert('Error adding line. Check the console for details.');
        }
    });

    // Initial load of lines
    fetchAndDisplayLines();
});
