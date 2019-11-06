'use strict';

const log  = require ('ololog').configure ({ locate: false })
const ccxt = require('../../ccxt')

const btse = new ccxt['btse'] ()
const recvWindow = btse.options.recvWindow
const aheadWindow = 1000

async function test () {
    const localStartTime = Date.now ()
    const { serverTime } = await btse.spotv2GetTime ()
    // const localFinishTime = Date.now ()
    // const estimatedLandingTime = (localFinishTime + localStartTime) / 2

    // const diff = serverTime - estimatedLandingTime

    // log (`request departure time:     ${btse.iso8601 (localStartTime)}`)
    // log (`response arrival time:      ${btse.iso8601 (localFinishTime)}`)
    // log (`server time:                ${btse.iso8601 (serverTime)}`)
    // log (`request landing time (est): ${btse.iso8601 (estimatedLandingTime)}, ${Math.abs (diff)} ms ${Math.sign (diff) > 0 ? 'behind' : 'ahead of'} server`)
    // log ('\n')

    // if (diff < -aheadWindow) {
    //     log.error.red (`your request will likely be rejected if local time is ahead of the server's time for more than ${aheadWindow} ms \n`)
    // }

    // if (diff > recvWindow) {
    //     log.error.red (`your request will likely be rejected if local time is behind server time for more than ${recvWindow} ms\n`)
    // }
}

test ();