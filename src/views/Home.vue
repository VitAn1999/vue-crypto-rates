<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <div class="container">
      <div class="w-full my-4"></div>

      <add-ticker :fetchTickersList="fetchTickersList" @add-ticker="add" />

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
              'bg-white': !t.errorClass,
              'bg-red-100': t.errorClass
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

      <show-graph
        :selectedTicker="selectedTicker"
        :graph="graph"
        :maxGraphElements="maxGraphElements"
        @remove-ticker="removeTicker"
        @calculate-maxgraph-element="calculateMaxGraphElement"
      />
    </div>
  </div>
</template>

<script>
import {
  loadAllCurrencies,
  subscribeToTicker,
  unsubscribeFromTicker
} from '../api/loadRates';

import AddTicker from '@/components/AddTicker.vue';
import ShowGraph from '@/components/ShowGraph.vue';

export default {
  name: 'Home',
  components: { AddTicker, ShowGraph },
  data() {
    return {
      filter: '',
      tickers: [],
      selectedTicker: null,
      graph: [],
      fetchTickersList: [],
      page: 1,
      maxGraphElements: 1
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
    }
  },

  methods: {
    updateTickers(tickerName, rate) {
      if (rate === null) {
        this.tickers
          .filter(t => t.name === tickerName)
          .forEach(t => (t.errorClass = true));
      }
      this.tickers
        .filter(t => t.name === tickerName)
        .forEach(t => {
          if (t === this.selectedTicker) {
            this.graph.push(rate);
            while (this.graph.length > this.maxGraphElements) {
              this.graph.shift();
            }
          }
          t.rate = rate;
        });
    },

    formattedRate(rate) {
      if (rate === null || rate === '-') {
        return '-';
      } else {
        return rate > 1 ? +rate.toFixed(2) : +rate.toPrecision(3);
      }
    },

    add(ticker) {
      const currentTicker = {
        name: ticker.toUpperCase(),
        rate: '-',
        errorClass: false
      };
      if (
        this.tickers.findIndex(
          ticker => ticker.name.toUpperCase() === currentTicker.name
        ) ===
        -1 /*&&
        this.fetchTickersList.includes(this.ticker.toUpperCase())*/
      ) {
        this.tickers = [...this.tickers, currentTicker];
        subscribeToTicker(currentTicker.name, rate => {
          this.updateTickers(currentTicker.name, rate);
        });
      }
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

    saveUrlInHistory() {
      // Используем встроенный метод history.pushState() для сохранения query-параметров
      history.pushState(
        null,
        document.title,
        `${window.location.pathname}?filter=${this.filter}&page=${this.page}`
      );
    },

    removeTicker(ticker) {
      this.selectedTicker = ticker;
    },

    calculateMaxGraphElement(maxGraphElements) {
      this.maxGraphElements = maxGraphElements;
    }
  },

  watch: {
    tickers() {
      localStorage.setItem('activeTickers', JSON.stringify(this.tickers));
      this.updateTickers();
    },

    filter() {
      this.saveUrlInHistory();
    },

    page() {
      this.saveUrlInHistory();
    },

    selectedTicker() {
      this.graph = [];
      this.$nextTick().then(() => this.calculateMaxGraphElement());
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
