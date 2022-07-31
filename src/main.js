import Vue from 'vue'
import App from './App.vue'
import store from './store'
import router from './router'
import vuetify from './plugins/vuetify'
import vueAwesomeCountdown from 'vue-awesome-countdown'
import { Datetime } from 'vue-datetime'
// You need a specific loader for CSS files
import 'vue-datetime/dist/vue-datetime.css'
import Particles from "particles.vue";

Vue.use(Particles);
Vue.use(Datetime)
 
Vue.component('datetime', Datetime);
Vue.config.productionTip = false



Vue.use(vueAwesomeCountdown, 'vac') 
new Vue({
  store,
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')
