"use strict";

const ccxt = require ('../../ccxt.js')

// ----------------------------------------------------------------------------

const tryToCreateOrder = async function (exchange, symbol, type, side, amount, price, params) {

    try {

        const order = await exchange.createOrder (symbol, type, side, amount, price, params)
        return order

    } catch (e) {

        console.log (e.constructor.name, e.message)

        if (e instanceof ccxt.NetworkError) {

            // retry on networking errors
            return false

        } else {

            throw e // break on all other exceptions
        }
    }
}

// ----------------------------------------------------------------------------

// const exchange = new ccxt.btse ({
//     'apiKey': 'MjIyOGU1NDAyOWVkNDI4Njg1ZWVjMzMwY2E1YzZhOTQ=',
//     'secret': 'M2I5NTMzZGE4MGViNDIy'
// })

const exchange = new ccxt.btse ({
    'apiKey': 'NmU5NjBkODk4ZmNjNDE0MDlhMGM1MmU3OWIxYTY2YjU=',
    'secret': 'OWU2ZGUwZTI1OGE0NGI4',
});

const symbol = 'BTC-USD'; // edit here
const type = 'LIMIT';     // edit here
const side = 'BUY';       // edit here
const amount = '0.002';         // edit here
const price = '1000';       // edit here
const params = {}        // edit here

;(async () => {
    let order = await tryToCreateOrder (exchange, symbol, type, side, amount, price, params)
    console.log (order)
}) ()
