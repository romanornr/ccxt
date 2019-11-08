"use strict";

const ccxt      = require ('../../ccxt.js')
const asTable   = require ('as-table')
const log       = require ('ololog').configure ({ locate: false })

// (async function(){
//     const btse = new ccxt.btse ()
//
//     console.log(await btse.fetchMarkets ())
// }) ()

(async function(){
    const btse = new ccxt.btse ();
    const symbol = 'XMR/USD';
    await btse.fetchTicker(symbol)
}) ()