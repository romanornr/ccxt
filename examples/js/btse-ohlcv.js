"use strict";

const ccxt       = require ('../../ccxt.js')
const asciichart = require ('asciichart')
const asTable    = require ('as-table')
const log        = require ('ololog').configure ({ locate: false })

require ('ansicolor').nice

//-----------------------------------------------------------------------------

;(async function main () {

    const index = 4 // [ timestamp, open, high, low, close, volume ]


    const ohlcv = await new ccxt.btse ().fetchOHLCV ('BTC/USD', '1m')


    const lastPrice = ohlcv[ohlcv.length - 1][index] // closing price
    const series = ohlcv.slice (-80).map (x => x[index])         // closing price
    const bitcoinRate = ('₿ = $' + lastPrice).green
    const chart = asciichart.plot (series, { height: 15, padding: '            ' })
    log.yellow ("\n" + chart, lastPrice, "\n")
    process.exit ()

}) ()