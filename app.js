ws = new WebSocket('wss://stream.binance.com:9443/ws/solusdt@trade');

ws.onmessage = (event) => {
    data = JSON.parse(event.data);
    
    // Utiliser toFixed pour limiter le nombre de décimales à 3
    const formattedPrice = parseFloat(data.p).toFixed(2);

    // Concaténer le texte "Solana: " avec le prix formaté
    trade.innerText = "Solana: " + formattedPrice + " $";
}
