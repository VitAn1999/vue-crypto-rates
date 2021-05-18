const API_KEY =
  '39149bbaadcf44d2a07bf89388b77c90d10090763f617e635d62cda10bb16c04';

const tickersHandler = new Map();

export const loadRates = () => {
  if (tickersHandler.size === 0) {
    return;
  }
  fetch(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${Array.from(
      tickersHandler.keys()
    ).join(',')}&tsyms=USD&api_key=${API_KEY}`
  )
    .then(response => response.json())
    .then(loadData => {
      // в updateRates помещаем объект из ключа Наименование криптовалюты и
      // значения Курс криптовалюты {'BTC': 51250.52}
      const updatedRates = Object.fromEntries(
        Object.entries(loadData).map(([key, value]) => [key, value.USD])
      );
      // Превращаем updateRates в массив ['BTC', 51250.52]
      Object.entries(updatedRates).forEach(([tickerName, rate]) => {
        // в массив handlers помещаем callback-функции по ключу tickerName
        const handlers = tickersHandler.get(tickerName) || [];
        // перебираем все колбэки и в качестве аргумента помещаем туда
        // актуальные курсы
        console.log(tickerName, rate);
        handlers.forEach(cb => cb(rate));
      });
    });
};

// функция подписка на тикер, добавляет в мапу tickersHandler по ключу тикера
// колбэк-функцию {'BTC': callback()}
export const subscribeToTicker = (ticker, cb) => {
  const subscriber = tickersHandler.get(ticker) || [];
  tickersHandler.set(ticker, [...subscriber, cb]);
};

export const unsubscribeFromTicker = ticker => {
  tickersHandler.delete(ticker);
};

setInterval(loadRates, 5000);

window.tickers = tickersHandler;
