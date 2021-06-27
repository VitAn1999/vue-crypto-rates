<template>
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
    <add-button-icon @click="add" type="button" />
  </section>
</template>

<script>
import AddButtonIcon from '@/components/AddButtonIcon.vue';
export default {
  components: { AddButtonIcon },

  data() {
    return {
      ticker: '',
      tickersList: [],
      activeTickers: []
    };
  },

  props: {
    fetchTickersList: {
      type: Array,
      require: true
    }
  },

  // Во Vue3 emits можно расписывать как пропсы, только в виде функции
  emits: {
    'add-ticker': value => typeof value === String && value !== ''
  },

  methods: {
    add() {
      if (this.ticker === '') {
        return;
      }
      const ticker = this.ticker;
      this.$emit('add-ticker', ticker);
      this.activeTickers.push(ticker);
      this.ticker = '';
    },

    addFromSelect(ticker) {
      this.ticker = ticker;
      if (
        this.activeTickers.findIndex(ticker => ticker === this.ticker) === -1
      ) {
        this.add();
      }
    },

    inputTicker() {
      let inputArr = this.fetchTickersList.filter(t =>
        t.startsWith(this.ticker.toUpperCase())
      );
      if (inputArr.length !== this.fetchTickersList.length) {
        this.tickersList = inputArr.slice(0, 4);
      }
      return this.tickersList;
    }
  },

  computed: {
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

    isRepeat() {
      if (
        this.activeTickers.findIndex(ticker => ticker === this.ticker) === -1
      ) {
        return false;
      }
      return true;
    }
  }
};
</script>
