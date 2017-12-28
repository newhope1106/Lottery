import Vue from 'vue'
import VueRouter from 'vue-router'

import App from './App'
import routes from './routes'

Vue.config.productionTip = false

Vue.use(VueRouter)

const router = new VueRouter({
  routes//这里名字不要写错了，不然不会渲染
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  template: '<App/>',
  components: { App },
  router
})
