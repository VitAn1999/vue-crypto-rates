let connected = false;
self.addEventListener(
  'connect',
  e => {
    e.source.addEventListener(
      'message',
      ev => {
        if (ev.data === 'start') {
          if (connected === false) {
            e.source.postMessage('worker init');
            connected = true;
          } else {
            e.source.postMessage('worker already inited');
          }
        }
      },
      false
    );
    e.source.start();
  },
  false
);
