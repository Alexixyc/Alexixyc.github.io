import Vue from 'vue'
import App from './App.vue'
import router from './route'
import AxUI from 'ax-view'

Vue.use(AxUI)

new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
