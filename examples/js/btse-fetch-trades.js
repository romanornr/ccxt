"use strict";

const ccxt      = require ('../../ccxt.js')
const asTable   = require ('as-table')
const log       = require ('ololog').configure ({ locate: false })

(async function() {
    const exchange = new ccxt.btse ({
        'apiKey': 'NjhjYTliNzg1NjU1NDg2ZDk2OTBkM2U0ZjIzNjczYjI=',
        'secret': 'YTM2ZDFkM2FjZTg1NDU5',
    });

    const symbol = 'BTCUSD'; // edit here

    const params = {}        // edit here

    let orders = await exchange.fetchTrades(symbol)
    // let orders = await exchange.fetchOpenOrders(symbol, orderId)
    console.log (orders)

}) ()