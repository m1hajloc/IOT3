import asyncio
import json
from nats.aio.client import Client as NATS
from nats.aio.errors import ErrConnectionClosed, ErrTimeout, ErrNoServers
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS

# Konfiguracija za NATS i InfluxDB
NATS_SERVERS = ["nats://localhost:4222"]  # Adresa NATS servera
INFLUXDB_URL = "http://localhost:8086"  # URL za InfluxDB
INFLUXDB_TOKEN = "80YVaKd0tZVzsbP6ZTM81QPlApH-oSI6_NyODQe3Jfddv115lxJDVXH5F9enjWmLZ8S9xTaLoZ7ltfwxhq7dSw=="  # Token za pristup InfluxDB
INFLUXDB_ORG = "admin-org"  # Organizacija u InfluxDB
INFLUXDB_BUCKET = "admin-bucket"  # Bucket u InfluxDB


async def run():
    nc = NATS()

    try:
        await nc.connect(
            servers=NATS_SERVERS,
            connect_timeout=10
        )
        print("Connected to NATS server")
    except ErrNoServers:
        print("No NATS servers available for connection.")
        return
    except ErrTimeout:
        print("Connection timeout.")
        return
    except Exception as e:
        print(f"Encountered error: {e}")
        return

    async def message_handler(msg):
        subject = msg.subject
        data = msg.data.decode()
        message = json.loads(data)
        average = message.get('average')
        currentTime = message.get('currentTime')
        print(f"Received a message on '{subject}': Average={average}, Time={currentTime}")

        # Povezivanje sa InfluxDB
        influx_client = InfluxDBClient(url=INFLUXDB_URL, token=INFLUXDB_TOKEN, org=INFLUXDB_ORG)

        # Priprema podataka za unos u InfluxDB
        write_api = influx_client.write_api(write_options=SYNCHRONOUS)
        point = Point("sensor_data").tag("sensor", "average").field("value", average).time(currentTime)
        #point = Point("sensor_data").tag("sensor", "average").time(currentTime)

        try:
            write_api.write(INFLUXDB_BUCKET, INFLUXDB_ORG, point)
            print("Data successfully written to InfluxDB")
        except Exception as e:
            print(f"Failed to write data to InfluxDB: {e}")
        finally:
            influx_client.close()

    await nc.subscribe("sensor/average", cb=message_handler)
    print("Subscribed to 'sensor/average'")

    try:
        while True:
            await asyncio.sleep(1)
    except KeyboardInterrupt:
        await nc.close()
        print("Disconnected from NATS server")


if __name__ == '__main__':
    asyncio.run(run())
