<template>
  <Drawer :width="drawerWidth" v-model="drawerState" @on-visible-change="openCart">
    <Divider orientation="left">Cart List</Divider>
    <Table ref="selection" :columns="cartTitle" :data="cartList" @on-select-cancel="cancelOne"
           @on-select="selectOne" @on-select-all="selectAll" @on-selection-change="cancelAll"></Table>
    <Divider/>
    <div class="checkoutConfirm">
      <span>TOTAL:</span>
      <span class="price">{{totalMoney | currency}}</span>
      <Button type="primary" ghost :disabled="totalMoney === 0?true:false" @click="checkout">CHECKOUT</Button>
    </div>
  </Drawer>
</template>

<script>
  import axios from 'axios';
  import {currency} from './../utils/currency';

  export default {
    data() {
      return {
        drawerWidth: '480',
        cart: [],
        cartTitle: [
          {
            type: 'selection',
            width: 50,
            align: 'center',
          },
//          {
//            title: 'IMAGES',
//            key: 'productImage',
//            render: (h, params) => {
//              // console.log(params);
//              return h('img', {
//                attrs: {
//                  src: '/static/images/' + params.row.productImage,
//                  height: '50px'
//                }
//              });
//            }
//          },
          {
            title: 'ITEMS',
            key: 'productName'
          },
          {
            title: 'PRICE',
            key: 'salePrice',
            render: (h, params) => {
              return h('span', {}, '$' + params.row.salePrice);
            }
          },
          {
            title: 'QUANTITY',
            key: 'productNum',
            align: 'center',
//          <InputNumber v-model="value3" size="small"></InputNumber>
            render: (h, params) => {
              let self = this;
              return h('InputNumber', {
                props: {
                  size: 'small',
                  value: params.row.productNum,
                  min: 1
                },
                style: {
                  width: '50px'
                },
                on: {
                  'on-change': function (newValue) {
//                    console.log(newValue);
                    axios.post('/users/cartEdit', {
                      productId: params.row.productId,
                      productNum: newValue,
                      checked: params.row.checked
                    }).then((res) => {
                      let data = res.data;
                      if (data.status === '0') {
                        self.init();
                      }
                      else {
                        self.init();
                        this.$Message.error('Modify fail');
                      }
                    });
                  }
                }
              });
            }
          },
//          {
//            title: 'SUBTOTAL',
//            key: 'subtotal',
//            render: (h, params) => {
//              return h('span', {}, '$' + params.row.salePrice * params.row.productNum);
//            }
//          },
          {
            title: 'ACTIONS',
            key: 'action',
            align: 'center',
            dashed: true,
            render: (h, params) => {
              return (
                h('Button', {
                  props: {
                    type: 'error',
                    size: 'small',
                    shape: 'circle',
                    icon: 'ios-trash-outline',
                    ghost: true
                  },
                  on: {
                    click: () => {
                      this.$Modal.confirm({
                        title: 'REMOVE FROM CART',
                        content: `Remove ${params.row.productName} from cart?`,
                        okText: 'OK',
                        cancelText: 'Cancel',
                        onOk: () => {
                          console.log('ok');
                          this.delCart(params.row.productId);
                        }
                      });
                    }
                  }
                })
              )
            }
          }
        ],
        tableList: []
      }
    },
    computed: {
      drawerState: {
        get() {
          return this.$store.state.drawerState;
        },
        set(drawerState) {
          this.$store.commit("updateDrawerState", drawerState);
        }
      },
      cartList() {
        let data = this.cart;
        data.forEach((tem) => {
          if (tem.checked === '1') {
            tem['_checked'] = true;
          }
        });
        return data;
      },
      totalMoney() {
        let tempMoney = 0;
        this.cart.forEach((temp) => {
          if (temp.checked === '1') {
            tempMoney += (temp.productNum * parseInt(temp.salePrice));
          }
        });
        return tempMoney;
      }
    },
    mounted() {
      let screen = window.matchMedia("(max-width: 768px)");
      if (screen.matches) { // If media query matches
        this.drawerWidth = '100%';
      } else {
        this.drawerWidth = '480';
      }

      this.init();
    },
    filters: {
      currency: currency
    },
    methods: {
      init() {
        axios.get('/users/cartList').then((res) => {
          let data = res.data;
          if (data.status === '0') {
            this.cart = data.result;
          }
        });
      },
      delCart(id) {
        axios.post('goods/delCart', {
          productId: id
        }).then((res) => {
          let data = res.data;
          if (data.status === '0') {
            this.init();
            this.$Message.success('Delete success');
          }
          else {
            this.$Message.error('Delete fail');
          }
        });
      },
      cancelOne(List, row) {
        axios.post('/users/cartEdit', {
          productId: row.productId,
          productNum: row.productNum,
          checked: '0'
        }).then((res) => {
          let data = res.data;
          if (data.status === '0') {
            this.init();
          }
          else {
            this.$Message.error('Handle Fail');
          }
        });
      },
      selectOne(List, row) {
        axios.post('/users/cartEdit', {
          productId: row.productId,
          productNum: row.productNum,
          checked: '1'
        }).then((res) => {
          let data = res.data;
          if (data.status === '0') {
            this.init();
          }
          else {
            this.$Message.error('Handle fail');
          }
        });
      },
      selectAll(row) {
        this.modifyAll(true);
      },
      cancelAll(row) {
        if (row.length === 0) {
          this.modifyAll(false);
        }
      },
      modifyAll(temp) {
        axios.post('/users/editCheckAll', {
          checkAll: temp ? '1' : '0'
        }).then((res) => {
          let data = res.data;
          if (data.status === '0') {
            this.init();
          }
          else {
            this.$Message.error('Handle fail');
          }
        })
      },
      openCart(state) {
        if (state === true) {
          this.init();
        }
      },
      checkout() {
        if(this.totalMoney > 0) {
          this.$router.push({
            path: '/address'
          });

          this.$store.commit('updateDrawerState', false);
        }
      }
    }
  }
</script>

<style scoped>
  table img {
    width: 100%;
  }

  .checkoutConfirm {
    float: right;
  }

  .checkoutConfirm .price {
    font-size: 16px;
    padding-right: 10px;
  }
</style>


