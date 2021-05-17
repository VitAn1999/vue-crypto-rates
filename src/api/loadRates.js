const API_KEY =
  '39149bbaadcf44d2a07bf89388b77c90d10090763f617e635d62cda10bb16c04';

export const loadRates = tickers =>
  fetch(
    `https://min-api.cryptocompare.com/data/price?fsym=USD&tsyms=${tickers.join(
      ','
    )}&api_key=${API_KEY}`
  ).then(response => response.json());
