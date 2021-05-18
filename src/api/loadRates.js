const API_KEY =
  '39149bbaadcf44d2a07bf89388b77c90d10090763f617e635d62cda10bb16c04';

const tickersHandler = new Map();

export const loadRates = () =>
  fetch(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${Array.from(
      tickersHandler.key()
    ).join(',')}&tsyms=USD&api_key=${API_KEY}`
  )
    .then(response => response.json())
    .then(loadData =>
      Object.fromEntries(
        Object.entries(loadData).map(([key, value]) => [key, value.USD])
      )
    );

export const subscribeToTicker = (ticker, cb) => {
  const subscriber = tickersHandler.get(ticker) || [];
  tickersHandler.set(ticker, [...subscriber, cb]);
};

export const unsubscribeFromTicker = (ticker, cb) => {
  const subscriber = tickersHandler.get(ticker) || [];
  tickersHandler.set(
    ticker,
    subscriber.filter(fn => fn !== cb)
  );
};

window.tickers = tickersHandler;
