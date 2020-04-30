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
    const id = '7b62e07a-4149-4c2c-ba13-7c5ed65d0467' // edit here

    const params = {}        // edit here

    let order = await exchange.cancelOrder(id, symbol, params)
    console.log (order)
}) ()