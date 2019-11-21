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

const exchange = new ccxt.btse ({
    'apiKey': 'MjIyOGU1NDAyOWVkNDI4Njg1ZWVjMzMwY2E1YzZhOTQ=',
    'secret': 'M2I5NTMzZGE4MGViNDIy'
})

const symbol = 'XMR/USD' // edit here
const type = 'limit'     // edit here
const side = 'buy'       // edit here
const amount = 0.00012         // edit here
const price = 3       // edit here
const params = {}        // edit here

;(async () => {
    let order = await tryToCreateOrder (exchange, symbol, type, side, amount, price, params)
    console.log (order)
}) ()
