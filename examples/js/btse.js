"use strict";

const ccxt      = require ('../../ccxt.js')
const asTable   = require ('as-table')
const log       = require ('ololog').configure ({ locate: false })

// (async function(){
//     const btse = new ccxt.btse ()
//
//     console.log(await btse.fetchMarkets ())
// }) ()

/** Ticker **/
// (async function(){
//     //const btse = new ccxt.btse ();
//     const btse = new ccxt.btse ({
//         options: { defaultType: 'future' }
//     });

//     const symbol = 'ETHPFC';
//     console.log(await btse.fetchTicker(symbol))
// }) ()


// (async function(){
//     const btse = new ccxt.btse ({
//         options: { defaultType: 'spot' }
//     });

//     const symbol = 'BTC-USD';
//     console.log(await btse.fetchTicker(symbol))
// }) ()

/** OHLCV **/
// (async function(){
//     const btse = new ccxt.btse({
//         options: { defaultType: 'spot' }
//     });

//     const ohlcv = await btse.fetchOHLCV ('BTC-USD', '1h')
//     console.log(ohlcv)
// }) ()

// (async function(){
//     const btse = new ccxt.btse({
//         options: { defaultType: 'future' }
//     });


//     const ohlcv = await btse.fetchOHLCV ('BTCPFC', '1h')
//     console.log(ohlcv)
// }) ()


// /** ORDERBOOK **/
// (async function(){
//          const btse = new ccxt.btse({
//          options: { defaultType: 'spot' }
//      });
//     const symbol = 'ETH-USD';
//     console.log (await btse.fetchOrderBook(symbol, 2))
// }) ()

// (async function(){
//     const btse = new ccxt.btse({
//     options: { defaultType: 'future' }
// });
// const symbol = 'BTCPFC';
// console.log (await btse.fetchOrderBook(symbol, 1))
// }) ()

/** TRADES **/
// (async function(){
//          const btse = new ccxt.btse({
//          options: { defaultType: 'spot' }
//      });
//     const symbol = 'BTC-USD';
//     console.log (await btse.fetchTrades(symbol, 2))
// }) ()

// (async function(){
//     const btse = new ccxt.btse({
//     options: { defaultType: 'future' }
// });
// const symbol = 'BTCPFC';
// console.log (await btse.fetchTrades(symbol, 2))
// }) ()


// (async function(){
//     const btse = new ccxt.btse ();
//     const symbol = 'BTC/USD';
//     console.log (await btse.fetchTrades(symbol))
// }) ()

(async function() {
    // const exchange = new ccxt.btse ({
    //     'apiKey': 'MjIyOGU1NDAyOWVkNDI4Njg1ZWVjMzMwY2E1YzZhOTQ=',
    //     'secret': 'M2I5NTMzZGE4MGViNDIy',
    // });

    const exchange = new ccxt.btse ({
        'apiKey': 'NmU5NjBkODk4ZmNjNDE0MDlhMGM1MmU3OWIxYTY2YjU=',
        'secret': 'OWU2ZGUwZTI1OGE0NGI4',
    });

    await exchange.fetchBalance();

    console.log (await exchange.fetchBalance() )

})();