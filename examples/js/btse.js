"use strict";

const ccxt      = require ('../../ccxt.js')
const asTable   = require ('as-table')
const log       = require ('ololog').configure ({ locate: false })

// (async function test () {
//     const ccxt = require ('ccxt')
//     const exchange = new ccxt.btse ()
//     const limit = 5
//     const orders = await exchange.fetchMarkets({})
//
//         // this parameter is exchange-specific, all extra params have unique names per exchange
//     })
// }) ()

(async function(){
    const btse = new ccxt.btse ()

    console.log(await btse.fetchMarkets ())
}) ()