const mqtt = require('mqtt');
const WebSocket = require('ws');
const express = require('express');
const path = require('path');

const MQTT_BROKER = 'mqtt://mqtt_broker';
const MQTT_TOPIC = 'output/topic';

const mqttClient = mqtt.connect(MQTT_BROKER);

// WebSocket setup
const app = express();
const server = app.listen(4000, () => console.log('Web server listening on port 4000'));
const wss = new WebSocket.Server({ server });

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

mqttClient.on('connect', () => {
    console.log('Connected to MQTT broker');
    mqttClient.subscribe(MQTT_TOPIC, (err) => {
        if (err) {
            console.error('Failed to subscribe to MQTT topic:', err);
        } else {
            console.log(`Subscribed to topic: ${MQTT_TOPIC}`);
        }
    });
});

mqttClient.on('message', (topic, message) => {
    try {
        const data = JSON.parse(message.toString());
        console.log(`Received data: ${JSON.stringify(data)}`);

        // Broadcast the message to all connected WebSocket clients
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    value: data.value,
                    timestamp: data.receivedTimestamp // Include timestamp in the WebSocket message
                }));
            }
        });
    } catch (err) {
        console.error('Failed to process message:', err);
    }
});
