// Create an array to store trade data for the chart
const chartData = [];

// Create WebSocket connection
const ws = new WebSocket('wss://stream.binance.com:9443/ws/solusdt@trade');

// Get references to chart canvas and 2D context
const chartCanvas = document.getElementById('priceChart');
const ctx = chartCanvas.getContext('2d');

// Initialize the initial price
let initialPrice;

// Create the Chart.js chart
const priceChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Solana Price',
            data: [],
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
            fill: false
        }]
    },
    options: {
        scales: {
            x: [{
                type: 'linear',
                position: 'bottom',
                ticks: {
                    callback: (value, index, values) => {
                        // Display only every 3rd label
                        return index % 3 === 0 ? value : '';
                    }
                }
            }],
            y: [{
                ticks: {
                    callback: (value) => {
                        if (value === initialPrice) {
                            return value + ' $ (Initial Price)';
                        }
                        return value;
                    },
                },
                gridLines: {
                    color: 'rgba(255, 255, 255, 0.2)' // Couleur de la grille en blanc avec une opacité réduite
                }
            }]
        }
    }
});

// Last update timestamp
let lastUpdateTimestamp = 0;

// WebSocket event handler
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    const timestamp = parseFloat(data.T); // Ensure data.T is in milliseconds

    if (!initialPrice) {
        // Set initial price on the first data received
        initialPrice = parseFloat(data.p).toFixed(2);

        // Draw the initial price line on the chart
        priceChart.data.labels.push(''); // Add an empty label to align with the tick
        priceChart.data.datasets[0].data.push(initialPrice);
        priceChart.update();
    }

    if (timestamp - lastUpdateTimestamp >= 500) {
        lastUpdateTimestamp = timestamp;

        const date = new Date(timestamp);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');

        const formattedTime = `${hours}:${minutes}:${seconds}`;
        const formattedPrice = parseFloat(data.p).toFixed(2);

        // Update the trade element
        document.getElementById('trade').innerText = `Solana : ${formattedPrice} $`;

        // Update the chart data
        chartData.push({ x: formattedTime, y: parseFloat(formattedPrice) });

        // Limit the chart data to a certain number of points (e.g., 50)
        if (chartData.length > 1500) {
            chartData.shift(); // Remove the oldest data point
        }

        // Update the Chart.js chart
        priceChart.data.labels = chartData.map(point => point.x);
        priceChart.data.datasets[0].data = chartData.map(point => point.y);
        priceChart.update();
    }
};
