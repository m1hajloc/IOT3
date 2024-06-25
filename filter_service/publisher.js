const mqtt = require('mqtt');

const MQTT_BROKER = 'mqtt://mqtt_broker';
const MQTT_TOPIC = 'sensor/data';

const mqttClient = mqtt.connect(MQTT_BROKER);

mqttClient.on('connect', () => {
    console.log('Connected to MQTT broker');
    
    // Publikuje test podatke svakih 3 sekunde
    setInterval(() => {
        const data = {
            value: (Math.random() * 43).toFixed(2),
            timestamp: new Date().toISOString()
        };
        mqttClient.publish(MQTT_TOPIC, JSON.stringify(data));
        console.log('Published data:', data);
    }, 3000);
});

mqttClient.on('error', (error) => {
    console.error('MQTT Connection Error:', error);
});
