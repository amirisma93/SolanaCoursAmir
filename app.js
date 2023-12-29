// Create an array to store trade data for the chart
const chartData = [];

// Create WebSocket connection
const ws = new WebSocket('wss://stream.binance.com:9443/ws/solusdt@trade');

// Get references to chart canvas and 2D context
const chartCanvas = document.getElementById('priceChart');
const ctx = chartCanvas.getContext('2d');

// Initialize the initial price
let initialPrice;

// Initialize the maximum price
let maxPrice = 0;

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
            pointRadius: 0,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: true
        }]
    },
    options: {
        scales: {
            x: [{
                type: 'linear',
                position: 'bottom',
                ticks: {
                    callback: (value, index, values) => {
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
                    color: 'rgba(255, 255, 255, 0.2)'
                }
            }]
        }
    }
});

// Last update timestamp
let lastUpdateTimestamp = 0;

// Function to update the maximum price
const updateMaxPrice = (currentPrice) => {
    if (currentPrice > maxPrice) {
        maxPrice = currentPrice;
        document.getElementById('maxPrice').innerText = `Max: ${maxPrice.toFixed(2)} $`;
    }
};

// WebSocket event handler
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    const timestamp = parseFloat(data.T);

    if (!initialPrice) {
        initialPrice = parseFloat(data.p).toFixed(2);
        priceChart.data.labels.push('');
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

        document.getElementById('trade').innerText = `Solana : ${formattedPrice} $`;

        chartData.push({ x: formattedTime, y: parseFloat(formattedPrice) });

        if (chartData.length > 1500) {
            chartData.shift();
        }
33
        priceChart.data.labels = chartData.map(point => point.x);
        priceChart.data.datasets[0].data = chartData.map(point => point.y);

        // Update the maximum price
        const currentPrice = parseFloat(formattedPrice);
        updateMaxPrice(currentPrice);

        priceChart.update();
    }
};
