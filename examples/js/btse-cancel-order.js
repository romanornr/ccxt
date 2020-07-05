"use strict";

const ccxt      = require ('../../ccxt.js')
const asTable   = require ('as-table')
const log       = require ('ololog').configure ({ locate: false })

(async function() {
    const exchange = new ccxt.btse ({
        'apiKey': 'NmU5NjBkODk4ZmNjNDE0MDlhMGM1MmU3OWIxYTY2YjU=',
        'secret': 'OWU2ZGUwZTI1OGE0NGI4',
    });

    const symbol = 'BTCUSD'; // edit here
    const id = 'bd0d81d7-1c3d-4580-9632-e833196c7e29' // edit here

    const params = {}        // edit here

    //let order = await exchange.cancelOrder(id, symbol, params)
    //let order = await exchange.cancelAllOrders(symbol)
    console.log(await exchange.cancelAllOrders(symbol))
    //console.log (order)
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