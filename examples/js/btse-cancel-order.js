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
    const id = '5582f868-643f-45af-8541-6218ee9be1a4' // edit here

    const params = {}        // edit here

    let order = await exchange.cancelOrder(id, symbol, params)
    console.log (order)
}) ()