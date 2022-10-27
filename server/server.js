import { WebSocketServer } from 'ws';

import {
   TYPE_NOT_PROVIDED_ERROR, 
   INVALID_ENTITY_FIELD_ERROR, 
   PAIR_ENTITY_NOT_USER_ERROR, 
   createBagNotAvailableError, 
   createErrorPayload,
   TRY_PAIR_AGAIN_ERROR
} from './errors.js';

import User from './User.js'
import Bag from './Bag.js';
import PunchRecognizer from './PunchRecognizer.js';

const host = process.env.HOST || '127.0.0.1';
const wss = new WebSocketServer({ port: 8080, host });

wss.on('listening', () => {
  console.log(wss.address());
});

// Associates bag ids with Bag instances
const bags = {};

// Associates user ids with User instances
const users = {};


const makeError = message => ({
  type: 'error',
  message
});

const handleIdentify = (ws, data) => {
  const { entity, id } = data;

  if(entity === 'user') {
    users[id] = new User({ id, socket: ws });
  } else if(entity === 'bag') {
    bags[id] = new Bag({ id, socket: ws });
  } else {
    ws.send(createErrorPayload(INVALID_ENTITY_FIELD_ERROR));
    return;
  }

  ws.type = entity;
  ws.id = id;
};

const handlePair = (ws, data) => {
  if(!ws.type || ws.type !== 'user') {
    const payload = makeError('Only a user can initiate a pair');
    ws.send(createErrorPayload(PAIR_ENTITY_NOT_USER_ERROR));
    return;
  }

  const { id } = data;

  if(!bags[id]) {
    const payload = createBagNotAvailableError(id);
    ws.send(payload);
    return;
  }

  const bag = bags[id];

  bag.socket.ping();
  let timedOut = false;

  const pingTimeout = setTimeout(() => {
    const payload = createBagNotAvailableError(id);
    ws.send(payload);
    timedOut = true;
  }, 1000);

  bag.socket.on('pong', () => {
    if(timedOut) {
      ws.send(createErrorPayload(TRY_PAIR_AGAIN_ERROR));
      return;
    }

    clearTimeout(pingTimeout);
    
    const user = users[ws.id];

    bag.pair(user);
    user.pair(bag);

    const payload = JSON.stringify({
      type: 'paired'
    });

    ws.send(payload);
  });
};

const handleStartSession = (ws, data) => {
  const user = users[ws.id];
  user.paired.socket.send(JSON.stringify(data));
};

const punchRecognizer = new PunchRecognizer(0.5, 400, 50);

const handleMeasurement = (ws, data) => {
  const punch = punchRecognizer.recognize(data);

  if(punch) {
    const payload = {
      type: 'punch',
      ...punch
    }
    console.log('recognized');
    const user = bags[ws.id].paired;
    user.socket.send(JSON.stringify(payload));
  }

};

const handleEndSession = (ws, data) => {
  const user = users[ws.id];
  user.paired.socket.send(JSON.stringify(data));

  user.paired.unpair();
  user.unpair();
};

const handleMessage = (ws, data) => {
  const { type } = data;

  if(!type) {
    const payload = {
      type: 'error',
      message: 'A type field must be provided in the message'
    };

    ws.send(createErrorPayload(TYPE_NOT_PROVIDED_ERROR));
    return;
  }

  if(type === 'identify')
    handleIdentify(ws, data);
  else if(data.type === 'pair')
    handlePair(ws, data);
  else if(data.type === 'start-session')
    handleStartSession(ws, data);
  else if(data.type === 'measurement')
    handleMeasurement(ws, data);
  else if(data.type == 'end-session')
    handleEndSession(ws, data);
};

const closeUser = ws => {
  const user = users[ws.id];

  if(user.paired) {
    const payload = { type: 'end-session' };
    user.paired.socket.send(JSON.stringify(payload));
  }

  delete users[ws.id];
};

const closeBag = ws => {
  const bag = bags[ws.id];

  if(bag.paired) {
    const payload = { type: 'end-session' };
    bag.paired.socket.send(JSON.stringify(payload));
  }

  delete bags[ws.id];
};

wss.on('connection', ws => {
  ws.on('message', (dataString) => {
    const data = JSON.parse(dataString);

    if(data.type !== 'measurement')
      console.log('DATA: %s', dataString)

    handleMessage(ws, data);
  });

  ws.on('close', () => {
    if(ws.type === 'user') {
      closeUser(ws);
    } else if(ws.type === 'bag') {
      closeBag(ws);
    }
  });
});