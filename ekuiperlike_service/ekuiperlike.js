const mqtt = require('mqtt');

const MQTT_BROKER = 'mqtt://mqtt_broker';
const MQTT_TOPIC = 'sensor/data';
const OUTPUT_TOPIC = 'output/topic';

const mqttClient = mqtt.connect(MQTT_BROKER);

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
        const { value, timestamp } = JSON.parse(message.toString());
        const data = parseFloat(value);
        const currentTime = new Date().toISOString();
        console.log(`Received data: ${data}`);

        if (data > 30) {
            const payload = JSON.stringify({ value: data, receivedTimestamp: timestamp, publishedTimestamp: currentTime });
            mqttClient.publish(OUTPUT_TOPIC, payload, (err) => {
                if (err) {
                    console.error(`Failed to publish to ${OUTPUT_TOPIC}:`, err);
                } else {
                    console.log(`Published ${value} with timestamp ${currentTime} to ${OUTPUT_TOPIC}`);
                }
            });
        }
    } catch (err) {
        console.error('Failed to process message:', err);
    }
});
