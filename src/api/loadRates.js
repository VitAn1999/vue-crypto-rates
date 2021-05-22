const API_KEY =
  '39149bbaadcf44d2a07bf89388b77c90d10090763f617e635d62cda10bb16c04';

const tickersHandler = new Map();

// Подключаем webSocket
const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);

const AGGREGATE_INDEX = '5';
const INVALID_SUB = '500';

socket.addEventListener('message', message => {
  const {
    TYPE: type,
    FROMSYMBOL: tickerName,
    PRICE: rate,
    PARAMETER: param
  } = JSON.parse(message.data);

  if (type === AGGREGATE_INDEX && rate !== undefined) {
    const handlers = tickersHandler.get(tickerName) || [];
    handlers.forEach(cb => cb(rate));
  }

  if (type === INVALID_SUB) {
    const invalidTicker = param.split('~')[2];
    const newMessage = JSON.stringify({
      action: 'SubAdd',
      subs: [`5~CCCAGG~${invalidTicker}~BTC`]
    });
    socket.send(newMessage);
    socket.addEventListener('message', newMessage => {
      const {
        TYPE: type,
        FROMSYMBOL: tickerName,
        PRICE: btcRate,
        PARAMETER: param
      } = JSON.parse(newMessage.data);
      if (
        type === AGGREGATE_INDEX &&
        btcRate !== undefined &&
        tickersHandler.has(invalidTicker)
      ) {
        const btcRequest = JSON.stringify({
          action: 'SubAdd',
          subs: [`5~CCCAGG~BTC~USD`]
        });
        socket.send(btcRequest);
        socket.addEventListener('message', btcRequest => {
          const { TYPE: type, PRICE: btcUsdRate } = JSON.parse(btcRequest.data);
          if (!tickersHandler.has(tickerName)) {
            const btcUnsubscribe = JSON.stringify({
              action: 'SubRemove',
              subs: [`5~CCCAGG~BTC~USD`]
            });
            socket.send(btcUnsubscribe);
          } else if (type === AGGREGATE_INDEX && btcUsdRate !== undefined) {
            let crossRate = btcUsdRate * btcRate;
            const handlers = tickersHandler.get(tickerName) || [];
            handlers.forEach(cb => cb(crossRate));
          } else {
            return;
          }
        });
      }
      if (type === INVALID_SUB) {
        const invalidTicker = param.split('~')[2];
        if (!tickersHandler.has(invalidTicker)) {
          const newUnsubscribeMessage = JSON.stringify({
            action: 'SubRemove',
            subs: [`5~CCCAGG~${invalidTicker}~BTC`]
          });
          socket.send(newUnsubscribeMessage);
        } else {
          const handlers = tickersHandler.get(invalidTicker) || [];
          handlers.forEach(cb => cb(null));
        }
      }
      return;
    });
  }

  return;
});

// export const loadRates = () => {
//   if (tickersHandler.size === 0) {
//     return;
//   }
//   fetch(
//     `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${Array.from(
//       tickersHandler.keys()
//     ).join(',')}&tsyms=USD&api_key=${API_KEY}`
//   )
//     .then(response => response.json())
//     .then(loadData => {
//       // в updateRates помещаем объект из ключа Наименование криптовалюты и
//       // значения Курс криптовалюты {'BTC': 51250.52}
//       const updatedRates = Object.fromEntries(
//         Object.entries(loadData).map(([key, value]) => [key, value.USD])
//       );
//       // Превращаем updateRates в массив ['BTC', 51250.52]
//       Object.entries(updatedRates).forEach(([tickerName, rate]) => {
//         // в массив handlers помещаем callback-функции по ключу tickerName
//         const handlers = tickersHandler.get(tickerName) || [];
//         // перебираем все колбэки и в качестве аргумента помещаем туда
//         // актуальные курсы
//         console.log(tickerName, rate);
//         handlers.forEach(cb => cb(rate));
//       });
//     });
// };

function sendToWebSocket(message) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(message);
    return;
  }
  // если не открыт, открываем сокер и отправляем сообщение
  socket.addEventListener(
    'open',
    () => {
      socket.send(message);
    },
    { once: true }
  );
}

function subscribeToTickerWithWS(ticker) {
  // сообщение с подпиской отправляемое на сервер
  const message = JSON.stringify({
    action: 'SubAdd',
    subs: [`5~CCCAGG~${ticker}~USD`]
  });
  sendToWebSocket(message);
}

function unsubscribeFromTickerWithWS(ticker) {
  // сообщение с отпиской отправляемое на сервер
  const message = JSON.stringify({
    action: 'SubRemove',
    subs: [`5~CCCAGG~${ticker}~USD`]
  });
  sendToWebSocket(message);
}

// функция подписка на тикер, добавляет в мапу tickersHandler по ключу тикера
// колбэк-функцию {'BTC': callback()}
export const subscribeToTicker = (ticker, cb) => {
  const subscriber = tickersHandler.get(ticker) || [];
  tickersHandler.set(ticker, [...subscriber, cb]);
  console.log(tickersHandler);
  subscribeToTickerWithWS(ticker);
};

export const unsubscribeFromTicker = ticker => {
  tickersHandler.delete(ticker);
  console.log(tickersHandler);
  unsubscribeFromTickerWithWS(ticker);
};

window.tickers = tickersHandler;
