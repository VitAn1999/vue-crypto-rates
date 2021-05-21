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
  if (type === INVALID_SUB && tickersHandler.size !== 0) {
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
        PRICE: rate,
        PARAMETER: param
      } = JSON.parse(newMessage.data);
      if (type === INVALID_SUB) {
        const invalidTicker = param.split('~')[2];
        console.log(invalidTicker);
        const handlers = tickersHandler.get(invalidTicker) || [];
        handlers.forEach(cb => cb(null));
      }
      if (type !== AGGREGATE_INDEX || rate === undefined) {
        return;
      }
      // const btcRequest = JSON.stringify({
      //   action: 'SubAdd',
      //   subs: [`5~CCCAGG~BTC~USD`]
      // });
      // socket.send(btcRequest);
      // let btcRate;
      // socket.addEventListener('message', btcRequest => {
      //   const { TYPE: type, PRICE: rate } = JSON.parse(btcRequest.data);
      //   if (type !== AGGREGATE_INDEX || rate === undefined) {
      //     return;
      //   }
      //   btcRate = rate;
      // });
      // console.log(btcRate);
      // let crossRate = btcRate * rate;
      // console.log(crossRate);
      const handlers = tickersHandler.get(tickerName) || [];
      handlers.forEach(cb => cb(rate));
    });
  }
  if (type !== AGGREGATE_INDEX || rate === undefined) {
    return;
  }

  const handlers = tickersHandler.get(tickerName) || [];
  handlers.forEach(cb => cb(rate));
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

  const newMessage = JSON.stringify({
    action: 'SubRemove',
    subs: [`5~CCCAGG~${ticker}~BTC`]
  });
  sendToWebSocket(newMessage);
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
