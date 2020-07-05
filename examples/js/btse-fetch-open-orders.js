"use strict";

const ccxt      = require ('../../ccxt.js')
const asTable   = require ('as-table')
const log       = require ('ololog').configure ({ locate: false })

const exchange = new ccxt.btse ({
    'apiKey': '236854299174d94de68ee6689d6c22e087f1b8bd825347ab92ec03c0edd9f87a',
    'secret': '6b45d9fae164b851bb2f52a658a9d0bf6a4fdc16d468f6df462554d83fa8da08',
});


(async function() {
    const symbol = 'BTCUSD'; // edit here
    const params = {}        // edit here

    let orders = await exchange.fetchOpenOrders(symbol)
    console.log (orders)

}) ()

// (async function() {
//     const exchange = new ccxt.btse ({
//         'apiKey': 'MjIyOGU1NDAyOWVkNDI4Njg1ZWVjMzMwY2E1YzZhOTQ=',
//         'secret': 'M2I5NTMzZGE4MGViNDIy',
//         options: { defaultType: 'future' },
//     });

//     const symbol = 'BTCPFC'; // edit here
//     const orderId = 'cc742899-2587-4dcf-95b7-8f6d1259d6c8';

//     const params = {}        // edit here

//     let orders = await exchange.fetchOpenOrders(symbol)
//     // let orders = await exchange.fetchOpenOrders(symbol, orderId)
//     console.log (orders)

// }) ()