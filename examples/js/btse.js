"use strict";

const ccxt      = require ('../../ccxt.js')
const asTable   = require ('as-table')
const log       = require ('ololog').configure ({ locate: false })

const exchange = new ccxt.btse ({
    'apiKey': '236854299174d94de68ee6689d6c22e087f1b8bd825347ab92ec03c0edd9f87a',
    'secret': '6b45d9fae164b851bb2f52a658a9d0bf6a4fdc16d468f6df462554d83fa8da08',
});

// (async function(){
//     const btse = new ccxt.btse ()
//
//     console.log(await btse.fetchMarkets ())
// }) ()

// /** Ticker **/
// (async function(){
//     //const btse = new ccxt.btse ();
//     const btse = new ccxt.btse ({
//         //options: { defaultType: 'future' }
//     });
//
//     const symbol = 'BTCUSD';
//     console.log(await btse.fetchTicker(symbol))
// }) ()


// (async function(){
//     const btse = new ccxt.btse ({
//         options: { defaultType: 'spot' }
//     });

//     const symbol = 'BTC-USD';
//     console.log(await btse.fetchTicker(symbol))
// }) ()

// /** OHLCV **/
// (async function(){
//     const btse = new ccxt.btse({
//         options: { defaultType: 'spot' }
//     });
//
//     const ohlcv = await btse.fetchOHLCV ('BTCUSD', '1h')
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
//     const symbol = 'BTCUSD';
//     console.log (await btse.fetchOrderBook(symbol, 2))
// }) ()

// (async function(){
//     const btse = new ccxt.btse({
//     options: { defaultType: 'future' }
// });
// const symbol = 'BTCPFC';
// console.log (await btse.fetchOrderBook(symbol, 1))
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

// (async function() {
//     // const exchange = new ccxt.btse ({
//     //     'apiKey': 'MjIyOGU1NDAyOWVkNDI4Njg1ZWVjMzMwY2E1YzZhOTQ=',
//     //     'secret': 'M2I5NTMzZGE4MGViNDIy',
//     // });
//
//     const exchange = new ccxt.btse ({
//         'apiKey': 'NmU5NjBkODk4ZmNjNDE0MDlhMGM1MmU3OWIxYTY2YjU=',
//         'secret': 'OWU2ZGUwZTI1OGE0NGI4',
//     });
//
//     await exchange.fetchBalance();
//
//     console.log (await exchange.fetchBalance() )
//
// })();

// fetch deposit address

// (async function() {
//     const symbol = 'BTC'; // edit here
//     console.log(await exchange.fetchDepositAddress(symbol));
// })();

// (async function() {
//     const symbol = 'BTCUSD'; // edit here
//     console.log(await exchange.withdraw("BTC", 0.0010, "bc1qs2gttl2320v0kcjkd0ajpu7452nrghnrt5ppzp"))
// })();


// (async function() {
//     // const exchange = new ccxt.btse ({
//     //     'apiKey': 'MjIyOGU1NDAyOWVkNDI4Njg1ZWVjMzMwY2E1YzZhOTQ=',
//     //     'secret': 'M2I5NTMzZGE4MGViNDIy',
//     // });
//
//     const exchange = new ccxt.btse ({
//         'apiKey': 'NmU5NjBkODk4ZmNjNDE0MDlhMGM1MmU3OWIxYTY2YjU=',
//         'secret': 'OWU2ZGUwZTI1OGE0NGI4',
//     });
//         // const btse = new ccxt.btse({
//         //     //options: { defaultType: 'spot' }
//         // });
//         const symbol = 'BTCUSD';
//         console.log (await exchange.fetchMyTrades(symbol))
//     }) ()

    /** TRADES **/
    (async function(){
        const btse = new ccxt.btse({
            //options: { defaultType: 'spot' }
        });
        const symbol = 'BTC/USD';
        console.log (await exchange.fetchBalance());
    }) ()
