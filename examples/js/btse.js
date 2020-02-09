"use strict";

const ccxt      = require ('../../ccxt.js')
const asTable   = require ('as-table')
const log       = require ('ololog').configure ({ locate: false })

// (async function(){
//     const btse = new ccxt.btse ()
//
//     console.log(await btse.fetchMarkets ())
// }) ()
//
(async function(){
    const btse = new ccxt.btse ();
    const symbol = 'XMR-USD';
    console.log (await btse.fetchTicker(symbol))
}) ()

// (async function(){
//     const btse = new ccxt.btse ();
//     const symbol = 'XMR/USD';
//     console.log (await btse.fetchOrderBook(symbol))
// }) ()

// (async function(){
//     const btse = new ccxt.btse ();
//     const symbol = 'BTC/USD';
//     console.log (await btse.fetchTrades(symbol))
// }) ()

// (async function() {
//     const exchange = new ccxt.btse ({
//         'apiKey': 'MjIyOGU1NDAyOWVkNDI4Njg1ZWVjMzMwY2E1YzZhOTQ=',
//         'secret': 'M2I5NTMzZGE4MGViNDIy',
//     });
//
//     await exchange.fetchBalance();
//
//     console.log (await exchange.fetchBalance() )
//
// })();