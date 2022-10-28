import WebSocket from "ws";
import prompts from 'prompts';

const host = process.env.HOST || '127.0.0.1';
const ws = new WebSocket(`ws://${host}/ws`);

const promptRequest = async (prompt, request) => {
  await prompts({
    type: 'confirm',
    message: prompt
  });

  ws.send(JSON.stringify(request));
}; 

ws.on('open', async () => {
  let payload = {
    type: 'identify',
    entity: 'user',
    id: '0'
  };
  await promptRequest('send identify request', payload);

  const idRequest = await prompts({
    type: 'text',
    name: 'value',
    message: 'Enter the bag id'
  });

  payload = {
    type: 'pair',
    id: idRequest.value
  };
  await promptRequest('Send pair request', payload);

  payload = {
    type: 'start-session'
  };
  await promptRequest('Send start-session request', payload);

  payload = {
    type: 'end-session'
  };
  await promptRequest('Send end-session request', payload);

  ws.close();
});

ws.on('message', data => {
  console.log('%s', data);
});
