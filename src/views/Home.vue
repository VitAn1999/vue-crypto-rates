<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <div class="container">
      <div class="w-full my-4"></div>
      <section>
        <div class="flex">
          <div class="max-w-xs">
            <label for="wallet" class="block text-sm font-medium text-gray-700"
              >Тикер</label
            >
            <div class="mt-1 relative rounded-md shadow-md">
              <input
                v-model="ticker"
                @input="inputTicker"
                @keydown.enter="add"
                type="text"
                name="wallet"
                id="wallet"
                class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
                placeholder="Например DOGE"
              />
            </div>
            <div
              v-show="isInclude"
              class="flex bg-white shadow-md p-1 rounded-md flex-wrap"
            >
              <span
                v-for="t in tickersList"
                :key="t"
                @click="addFromSelect(t)"
                class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
              >
                {{ t }}
              </span>
            </div>
            <div v-if="isRepeat" class="text-sm text-red-600">
              Такой тикер уже добавлен
            </div>
          </div>
        </div>
        <button
          @click="add"
          type="button"
          class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          <!-- Heroicon name: solid/mail -->
          <svg
            class="-ml-0.5 mr-2 h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="#ffffff"
          >
            <path
              d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
            ></path>
          </svg>
          Добавить
        </button>
      </section>
      <hr class="w-full border-t border-gray-600 my-4" />
      <template v-if="tickers.length">
        <template class="mt-1 max-w-xs flex justify-between">
          <div class="relative rounded-md shadow-md">
            <input
              v-model="filter"
              @input="page = 1"
              type="text"
              name="filter"
              id="filter"
              class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
              placeholder="Фильтр..."
            />
          </div>
          <nav
            class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
            aria-label="Pagination"
          >
            <button
              @click="page = page - 1"
              :disabled="page < 2"
              class="disabled:opacity-20 relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <span class="sr-only">Previous</span>
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>

            <button
              @click="page = page + 1"
              :disabled="hasNextPage"
              class="disabled:opacity-20 relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <span class="sr-only">Next</span>
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </nav>
        </template>
        <hr class="w-full border-t border-gray-600 my-4" />
        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div
            v-for="(t, inx) in paginatedTickers"
            :key="inx"
            @click="checkTicker(t)"
            :class="{
              'border-4': t === selectedTicker,
              'bg-white': t.rate !== '-',
              'bg-red-100': t.rate === '-'
            }"
            class="overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer"
          >
            <div class="px-4 py-5 sm:p-6 text-center">
              <dt class="text-sm font-medium text-gray-500 truncate">
                {{ t.name.toUpperCase() }} - USD
              </dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">
                {{ formattedRate(t.rate) }}
              </dd>
            </div>
            <div class="w-full border-t border-gray-200"></div>
            <button
              @click.stop="handleDelete(t)"
              class="flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 hover:opacity-20 transition-all focus:outline-none"
            >
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="#718096"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                ></path></svg
              >Удалить
            </button>
          </div>
        </dl>
        <hr class="w-full border-t border-gray-600 my-4" />
      </template>
      <section class="relative" v-if="selectedTicker">
        <h3 class="text-lg leading-6 font-medium text-gray-900 my-8">
          {{ selectedTicker.name }} - USD
        </h3>
        <div class="flex items-end border-gray-600 border-b border-l h-64">
          <div
            v-for="(bar, idx) in normalizeGraph"
            :key="idx"
            :style="{ height: `${bar}%` }"
            class="bg-purple-800 border w-10"
          ></div>
        </div>
        <button
          @click="selectedTicker = null"
          type="button"
          class="absolute top-0 right-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            xmlns:svgjs="http://svgjs.com/svgjs"
            version="1.1"
            width="30"
            height="30"
            x="0"
            y="0"
            viewBox="0 0 511.76 511.76"
            style="enable-background:new 0 0 512 512"
            xml:space="preserve"
          >
            <g>
              <path
                d="M436.896,74.869c-99.84-99.819-262.208-99.819-362.048,0c-99.797,99.819-99.797,262.229,0,362.048    c49.92,49.899,115.477,74.837,181.035,74.837s131.093-24.939,181.013-74.837C536.715,337.099,536.715,174.688,436.896,74.869z     M361.461,331.317c8.341,8.341,8.341,21.824,0,30.165c-4.16,4.16-9.621,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    l-75.413-75.435l-75.392,75.413c-4.181,4.16-9.643,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    c-8.341-8.341-8.341-21.845,0-30.165l75.392-75.413l-75.413-75.413c-8.341-8.341-8.341-21.845,0-30.165    c8.32-8.341,21.824-8.341,30.165,0l75.413,75.413l75.413-75.413c8.341-8.341,21.824-8.341,30.165,0    c8.341,8.32,8.341,21.824,0,30.165l-75.413,75.413L361.461,331.317z"
                fill="#718096"
                data-original="#000000"
              ></path>
            </g>
          </svg>
        </button>
      </section>
    </div>
  </div>
</template>

<script>
import {
  loadAllCurrencies,
  subscribeToTicker,
  unsubscribeFromTicker
} from '../api/loadRates';
export default {
  name: 'Home',
  data() {
    return {
      ticker: '',
      filter: '',
      tickers: [],
      selectedTicker: null,
      graph: [],
      fetchTickersList: [],
      tickersList: [],
      page: 1
    };
  },

  computed: {
    startIndex() {
      return (this.page - 1) * 6;
    },

    endIndex() {
      return this.page * 6;
    },

    filteredTickers() {
      return this.tickers.filter(ticker =>
        ticker.name.includes(this.filter.toUpperCase())
      );
    },

    paginatedTickers() {
      return this.filteredTickers.slice(this.startIndex, this.endIndex);
    },

    hasNextPage() {
      return this.filteredTickers.length <= this.endIndex;
    },

    isRepeat() {
      if (
        this.tickers.findIndex(ticker => ticker.name === this.ticker) === -1
      ) {
        return false;
      }
      return true;
    },

    isInclude() {
      if (
        this.ticker &&
        this.fetchTickersList.filter(t =>
          t.startsWith(this.ticker.toUpperCase())
        ).length
      ) {
        return true;
      }
      return false;
    },

    normalizeGraph() {
      const maxValue = Math.max(...this.graph);
      const minValue = Math.min(...this.graph);

      if (minValue === maxValue) {
        return this.graph.map(() => 20);
      }

      return this.graph.map(rate => {
        let bar = 20 + ((rate - minValue) * 80) / (maxValue - minValue);
        return bar;
      });
    }
  },

  methods: {
    updateTickers(tickerName, rate) {
      this.tickers
        .filter(t => t.name === tickerName)
        .forEach(t => {
          if (t === this.selectedTicker) {
            this.graph.push(rate);
          }
          t.rate = rate;
        });
    },

    formattedRate(rate) {
      if (rate === '-') {
        return rate;
      }
      window.rate = rate;
      return rate > 1 ? +rate.toFixed(2) : +rate.toPrecision(3);
    },

    add() {
      const currentTicker = {
        name: this.ticker.toUpperCase(),
        rate: '-'
      };
      if (
        this.tickers.findIndex(
          ticker => ticker.name.toUpperCase() === currentTicker.name
        ) ===
        -1 /*&&
        this.fetchTickersList.includes(this.ticker.toUpperCase())*/
      ) {
        this.tickers = [...this.tickers, currentTicker];
        this.ticker = '';
        subscribeToTicker(currentTicker.name, rate => {
          this.updateTickers(currentTicker.name, rate);
        });
      }
    },

    addFromSelect(ticker) {
      this.ticker = ticker;
      this.add();
    },

    handleDelete(inputTick) {
      this.tickers = this.tickers.filter(ticker => ticker !== inputTick);
      if (this.selectedTicker === inputTick) {
        this.selectedTicker = null;
      }
      unsubscribeFromTicker(inputTick.name);
    },

    checkTicker(ticker) {
      this.selectedTicker = ticker;
    },

    inputTicker() {
      let inputArr = this.fetchTickersList.filter(t =>
        t.startsWith(this.ticker.toUpperCase())
      );
      if (inputArr.length !== this.fetchTickersList.length) {
        this.tickersList = inputArr.slice(0, 4);
      }
      return this.tickersList;
    },

    saveUrlInHistory() {
      // Используем встроенный метод history.pushState() для сохранения query-параметров
      history.pushState(
        null,
        document.title,
        `${window.location.pathname}?filter=${this.filter}&page=${this.page}`
      );
    }
  },

  watch: {
    tickers() {
      localStorage.setItem('activeTickers', JSON.stringify(this.tickers));
      this.updateTickers();
    },

    selectedTicker() {
      this.graph = [];
    },

    filter() {
      this.saveUrlInHistory();
    },

    page() {
      this.saveUrlInHistory();
    },

    // При перезагрузке страницы вызывается watch и отлистывает ее на одну назад
    paginatedTickers() {
      if (this.paginatedTickers.length === 0 && this.page > 1) {
        this.page = this.page - 1;
      }
    }
  },

  async created() {
    // загружаем history с query-параметрами и записываем их в объект с ключами filter и page
    const windowData = Object.fromEntries(
      new URL(window.location).searchParams.entries()
    );
    if (windowData.filter) {
      this.filter = windowData.filter;
    }
    if (windowData.page) {
      this.page = +windowData.page;
    }
    this.fetchTickersList = await loadAllCurrencies();
    console.log(this.fetchTickersList);
    // const fetchData = await fetch(
    //   'https://min-api.cryptocompare.com/data/all/coinlist?summary=true'
    // );
    // const fetchDataJson = await fetchData.json();
    // Object.values(fetchDataJson.Data).forEach(t => {
    //   this.fetchTickersList.push(t.Symbol);
    // });
    if (localStorage.getItem('activeTickers')) {
      this.tickers = JSON.parse(localStorage.getItem('activeTickers'));
      this.tickers.forEach(ticker => {
        subscribeToTicker(ticker.name, rate =>
          this.updateTickers(ticker.name, rate)
        );
      });
    }
  }
};
</script>
