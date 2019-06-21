import Vue from 'vue'
import App from './App.vue'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faFileAlt, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

/*import { Navbar } from 'bootstrap-vue/es/components';
import { FormSelect } from 'bootstrap-vue/es/components';
import { Badge } from 'bootstrap-vue/es/components';
import { ListGroup } from 'bootstrap-vue/es/components';
import { Form } from 'bootstrap-vue/es/components';
import { Card } from 'bootstrap-vue/es/components';
import { Table } from 'bootstrap-vue/es/components';
import { Layout } from 'bootstrap-vue/es/components';
import { Nav } from 'bootstrap-vue/es/components';
import { FormInput } from 'bootstrap-vue/es/components';
import { Button } from 'bootstrap-vue/es/components';

Vue.use(Button);
Vue.use(FormInput);
Vue.use(Nav);
Vue.use(Layout);
Vue.use(Table);
Vue.use(Card);
Vue.use(Form);
Vue.use(ListGroup);
Vue.use(Badge);
Vue.use(FormSelect);
Vue.use(Navbar);*/


library.add(faFileAlt, faPlus, faMinus)

Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.use(BootstrapVue)

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
