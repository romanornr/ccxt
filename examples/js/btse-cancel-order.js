"use strict";

const ccxt      = require ('../../ccxt.js')
const asTable   = require ('as-table')
const log       = require ('ololog').configure ({ locate: false })

(async function() {
    const exchange = new ccxt.btse ({
        'apiKey': 'MjIyOGU1NDAyOWVkNDI4Njg1ZWVjMzMwY2E1YzZhOTQ=',
        'secret': 'M2I5NTMzZGE4MGViNDIy',
    });

    const symbol = 'BTC-USD'; // edit here
    const id = 'f0403eff-ecd0-4a0d-9006-1fb6761b6927' // edit here

    const params = {}        // edit here

    let order = await exchange.cancelOrder(id, symbol, params)
    console.log (order)
}) ()


// (async function() {
//     const exchange = new ccxt.btse ({
//         'apiKey': 'MjIyOGU1NDAyOWVkNDI4Njg1ZWVjMzMwY2E1YzZhOTQ=',
//         'secret': 'M2I5NTMzZGE4MGViNDIy',
//         options: { defaultType: 'future' },
//     });

//     const symbol = 'BTCPFC'; // edit here
//     const id = 'cc742899-2587-4dcf-95b7-8f6d1259d6c8' // edit here

//     const params = {}        // edit here

//     let order = await exchange.cancelOrder(id, symbol, params)
//     console.log (order)
// }) ()