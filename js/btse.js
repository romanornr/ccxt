'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { TICK_SIZE } = require ('./base/functions/number');
// const { } = require ('./base/errors');

module.exports = class btse extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'btse',
            'name': 'BTSE',
            'countries': ['UAE'],
            'userAgent': undefined,
            'rateLimit': 3000,
            'has': {
                'CORS': true,
                'editOrder': true,
                'fetchOrder': true,
                'fetchOrders': false,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchMyTrades': true,
                'fetchTickers': false,
            },
            'urls': {
                'test': 'https://testnet.btse.io',
                'logo': '',
                'api': {
                    'web': 'https://www.btse.com',
                    'api': 'https://api.btse.com',
                    'spotv2': 'https://api.btse.com/spot/v2',
                    'futuresv1': 'https://api.btse.com/futures/api/v1',
                    'testnet': 'https://testapi.btse.io',
                },
                'www': 'https://www.btse.com',
                'doc': [
                    'https://www.btse.com/apiexplorer/futures/',
                    'https://www.btse.com/apiexplorer/spot/',
                ],
                'fees': 'https://support.btse.com/en/support/solutions/articles/43000064283-what-are-the-btse-trading-fees-',
                'referral': 'https://www.btse.com/ref?c=0Ze7BK',
            },
            'api': {
                'spotv2': {
                    'get': [
                        'time',
                        'markets',
                        'ticker/{id}/',
                        'orderbook/{id}',
                        'trades/{id}',
                    ],
                },
                'private': {
                    'get': [],
                    'post': [],
                },
            },
            'exceptions': {},
            'precisionMode': TICK_SIZE,
            'options': {
                'timeDifference': 0,
                'fetchTickerQuotes': true,
            },
        });
    }

    nonce () {
        return this.milliseconds () - this.options['timeDifference'];
    }

    async loadTimeDifference () {
        const response = await this.spotv2GetTime ();
        const after = this.milliseconds ();
        const serverTime = parseInt (response['unix_time'] * 1000);
        this.options['timeDifference'] = parseInt (after - serverTime);
        return this.options['timeDifference'];
    }

    async fetchMarkets (params = {}) {
        const response = await this.spotv2GetMarkets ();
        const results = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i]
            const baseId = this.safeString (market, 'base_currency');
            const quoteId = this.safeString (market, 'quote_currency');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const active = this.safeValue (market, 'status');
            const symbol = base + '/' + quote;
            const id = this.safeValue (market, 'symbol').replace (/-/g, '').toLowerCase ();
            const precision = {
                'amount': 8,
                'price': 8,
            };
            results.push ({
                'id': id, // needs fix
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'precision': precision,
                'info': market,
                'limits': {
                    'amount': {
                        'min': this.safeFloat (market, 'base_min_size'),
                        'max': this.safeFloat (market, 'base_max_size'),
                    },
                    'price': {
                        'min': this.safeFloat (market, 'base_min_price'),
                        'max': this.safeFloat (market, undefined),
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'spot': true,
                },
            });
        }
        return results;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol)
        const request = {
            'id': symbol.replace ('/', '-'),
        };
        const response = await this.spotv2GetTickerId (this.extend (request, params));
        return this.parseTicker (response, market);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': symbol.replace ('/', '-'),
        };
        const response = await this.spotv2GetOrderbookId (this.extend (request, params));
        const timestamp = this.safeInteger (response, 'timestamp');
        const orderbook = this.parseOrderBook (response, timestamp, 'buyQuote', 'sellQuote', 'price', 'size');
        return orderbook;
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'id': symbol.replace ('/', '-'),
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        } else {
            request['limit'] = 10000;
        }
        const response = await this.spotv2GetTradesId (this.extend (request, params));
        let result2 = [];
        for (let i = 0; i < response.length; i++) {
            response[i].timestamp = new Date (response[i].time).getTime ()
            result2.push (response[i]);
        }
        console.log (result2)
        return this.parseTrades (result2, market, since, limit);
    }

    parseTicker (ticker, market = undefined) {
        const symbol = this.findSymbol (this.safeString (ticker, 'symbol'), market);
        return {
            'symbol': symbol,
            'timestamp': undefined, //fixme
            'high': undefined,
            'low': undefined,
            'bid': this.safeFloat (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'last': this.safeFloat (ticker, 'price'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': this.safeFloat (ticker, 'volume'),
            'info': ticker,
        };
    }

    sign (path, api = 'api', method = 'GET', params = {}, headers = {}, body = undefined) {
        const url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
