let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
let Goods = require('../models/goods');
let Users = require('../models/users');

// connect mongodb
mongoose.connect('mongodb://127.0.0.1:27017/vmall1', {useNewUrlParser: true});

let db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log("MongoDB connected success.");
});

// search goods data
router.get("/list", (req, res, next) => {
  let page = parseInt(req.query.page);
  let pageSize = parseInt(req.query.pageSize);
  let sortFlag = parseInt(req.query.sortFlag);
  let sortWay = parseInt(req.query.sortWay);

  let priceLevel = req.query.priceLevel;
  let priceGt = '', priceLte = '';
  let params = {};
  // 0 means all
  if (priceLevel !== '0') {
    switch (priceLevel) {
      case '1':
        priceGt = 0;
        priceLte = 100;
        break;
      case '2':
        priceGt = 100;
        priceLte = 500;
        break;
      case '3':
        priceGt = 500;
        priceLte = 1000;
        break;
      case '4':
        priceGt = 1000;
        priceLte = 5000;
        break;
    }
    params = {
      salePrice: {
        $gt: priceGt,
        $lte: priceLte
      }
    }
  }

  let skip = (page - 1) * pageSize;
  let goodsModel = Goods.find(params).skip(skip).limit(pageSize);

  // sort by price
  if (sortWay === 1) {
    goodsModel.sort({'salePrice': sortFlag});
  }

  goodsModel.exec((err, doc) => {
    if (err) {
      res.json({
        status: '1',
        msg: err.message
      });
    }
    else {
      res.json({
        status: '0',
        msg: '',
        result: {
          count: doc.length,
          list: doc
        }
      });
    }
  })
});

// add to cart
router.post('/addCart', (req, res, next) => {
  let userId = '100000077';
  Users.findOne({userId: userId}, (err, userInfo) => {
    if (err) {
      res.json({
        status: "1",
        msg: err.message
      })
    }
    else {
      let productId = req.body.productId;
      // console.log(`userDoc:${userInfo}`);
      // check whether the goods already exists in the cart
      if (userInfo) {
        let goodsItem = '';
        userInfo.cartList.forEach(function (item) {
          if (item.productId === productId) {
            goodsItem = item;
            item.productNum++;
          }
        });
        // exists
        if (goodsItem) {
          userInfo.save((err2, doc2) => {
            if (err2) {
              res.json({
                status: '1',
                msg: err2.message
              })
            }
            else {
              res.json({
                status: '0',
                msg: '',
                result: 'suc'
              });
              // console.log('success')
            }
          });
        }
        else {
          Goods.findOne({productId: productId}, (err1, doc1) => {
            if (err1) {
              res.json({
                status: '1',
                msg: err1.message
              })
            }
            else {
              // console.log(doc1);
              if (doc1) {
                // console.log(doc1);
                doc1.productNum = 1;
                doc1.checked = 1;
                userInfo.cartList.push(doc1);
                userInfo.save((err2, doc2) => {
                  if (err2) {
                    res.json({
                      status: '1',
                      msg: err2.message
                    })
                  }
                  else {
                    res.json({
                      status: '0',
                      msg: '',
                      result: 'suc'
                    });
                    // console.log('success')
                  }
                });
              }
            }
          });
        }
      }
    }
  })
});

// del from cart
router.post('/delCart', (req, res, next) => {
  let userId = req.cookies.userId;
  let productId = req.body.productId;

  Users.update({userId: userId},
    {
      $pull: {
        'cartList': {
          'productId': productId
        }
      }
    }, function(err, doc) {
      if(err) {
        res.json({
          status: '1',
          msg: err.message,
          result: ''
        });
      }
      else {
        res.json({
          status: '0',
          msg: '',
          result: 'suc'
        });
      }
    });
});

module.exports = router;