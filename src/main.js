import Vue from 'vue'
import App from './App.vue'
import { BootstrapVue, BIcon, BIconPlus, BIconDash, BIconFileEarmarkText } from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.use(BootstrapVue)
Vue.component('BIcon', BIcon)
Vue.component('BIconPlus', BIconPlus)
Vue.component('BIconDash', BIconDash)
Vue.component('BIconFileEarmarkText', BIconFileEarmarkText)

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
