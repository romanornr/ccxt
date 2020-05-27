"use strict";

const ccxt      = require ('../../ccxt.js')
const asTable   = require ('as-table')
const log       = require ('ololog').configure ({ locate: false })

(async function() {
    const exchange = new ccxt.btse ({
        'apiKey': 'MjIyOGU1NDAyOWVkNDI4Njg1ZWVjMzMwY2E1YzZhOTQ=',
        'secret': 'M2I5NTMzZGE4MGViNDIy',
    });

    const symbol = 'BTC/USD'; // edit here
    const orderId = 'cc742899-2587-4dcf-95b7-8f6d1259d6c8';

    const params = {}        // edit here

    let orders = await exchange.fetchOpenOrders(symbol)
    // let orders = await exchange.fetchOpenOrders(symbol, orderId)
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