// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import Vuex from 'vuex'
import axios from 'axios'

import iView from 'iview';
import 'iview/dist/styles/iview.css';

import infiniteScroll from 'vue-infinite-scroll'

// used for mock data
// require('./../mock/mock.js');

Vue.config.productionTip = false;

Vue.use(Vuex);
Vue.use(iView);
Vue.use(infiniteScroll);

const store = new Vuex.Store({
  state: {
    nickName: '',
    drawerState: false,
    cartList: []
  },
  mutations: {
    updateUserInfo(state, nickName) {
      state.nickName = nickName;
    },

    updateDrawerState(state, drawerState) {
      state.drawerState = drawerState;
    },
    updateCartList(state, cartList) {
      state.cartList = cartList;
    },
    updateCartListOne(state, tem) {
      state.cartList[tem.index].productNum = tem.newValue;
    }
  }
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  components: { App },
  template: '<App/>',
});


