import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)

import Pagination from '@/pages/pagination/index.vue'
const RouterOpt = {
    routes: [{
        path: '/pagination',
        component: Pagination
    }]
}

export default new Router(RouterOpt)