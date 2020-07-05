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

    const params = {}        // edit here

    let order = await exchange.fetchClosedOrders (symbol, undefined, undefined)
    console.log (order)
}) ()