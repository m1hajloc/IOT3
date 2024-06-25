const mqtt = require('mqtt');
const { connect } = require('nats');

const MQTT_BROKER = 'mqtt://mqtt_broker';
const MQTT_TOPIC = 'sensor/data';
const NATS_SERVER = 'nats://nats_server:4222';
const NATS_TOPIC = 'sensor/average';

let count = 0;
let sum = 0;
let time = 0;

const mqttClient = mqtt.connect(MQTT_BROKER);

mqttClient.on('connect', () => {
    console.log('Connected to MQTT broker');
    mqttClient.subscribe(MQTT_TOPIC, (err) => {
        if (err) {
            console.error('Failed to subscribe to MQTT topic:', err);
        }
    });
});

mqttClient.on('message', async (topic, message) => {
    const { value, timestamp } = JSON.parse(message.toString());
    if (time === 0) {
        time = Date.parse(timestamp) + 20000;
    }
    const data = parseFloat(value);
    count++;
    sum += data;
    const average = sum / count;
    console.log(`Received data: ${data}`);

    if (time < Date.parse(timestamp)) {
        const currentTime = new Date().toISOString();
        await sendToNats({ average, currentTime });
        sum = data;
        count = 1;
        time = Date.parse(timestamp) + 20000;
    }
});

let nc = null;

async function connectNats() {
    try {
        nc = await connect({ servers: NATS_SERVER });
        console.log('Connected to NATS server');
    } catch (err) {
        console.error('Failed to connect to NATS:', err);
    }
}

async function sendToNats(data) {
    if (!nc) {
        await connectNats();
    }
    if (nc) {
        try {
            nc.publish(NATS_TOPIC, JSON.stringify(data));
            console.log('Sent average value to NATS:', data);
        } catch (err) {
            console.error('Error publishing to NATS:', err);
        }
    } else {
        console.error('NATS connection is not established.');
    }
}

// Ensure we connect to NATS at the start
connectNats();
