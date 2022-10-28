import WebSocket from "ws";

const host = process.env.HOST || '127.0.0.1';
const ws = new WebSocket(`ws://${host}/ws`);

ws.on('open', () => {
  const payload = {
    type: 'identify',
    entity: 'bag',
    id: '001122'
  };

  ws.send(JSON.stringify(payload));
});

let timestamp = 0;
let sample_rate = 50;

const sendRandomMeasurement = () => {
  const randomMeasurement = (amplitude) => amplitude * Math.random() - amplitude / 2;

  const payload = {
    type: 'measurement',
    top: {
      x: randomMeasurement(200),
      y: randomMeasurement(200),
      z: randomMeasurement(200)
    },
    bottom: {
      x: randomMeasurement(800),
      y: randomMeasurement(800),
      z: randomMeasurement(800)
    },
    timestamp
  };

  console.log('send');
  timestamp += sample_rate;
  ws.send(JSON.stringify(payload));
};

let measurementInterval;

ws.on('message', dataString => {
  const data = JSON.parse(dataString);

  console.log('message', data);

  const { type } = data;

  if(type === 'start-session') {
    measurementInterval = setInterval(sendRandomMeasurement, sample_rate);
  } else if(type === 'end-session') {
    clearInterval(measurementInterval);
    timestamp = 0;
  }
});
