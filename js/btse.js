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
                'editOrder': false,
                'fetchOrder': true,
                'fetchOrders': false,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchMyTrades': false,
                'fetchTickers': true,
            },
            'timeframes': {
                '1m': '1',
                '3m': '3',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '2h': '120',
                '4h': '240',
                '6h': '360',
                '9h': '720',
                '1d': '1440',
                '1M': '43800',
                '1w': '10080',
                '1Y': '525600',
            },
            'urls': {
                'test': 'https://testnet.btse.io',
                'logo': '',
                'api': {
                    'web': 'https://www.btse.com',
                    'api': 'https://api.btse.com',
                    'spotv2': 'https://api.btse.com/spot/v2',
                    'spotv2private': 'https://api.btse.com/spot/v2',
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
                        'account',
                        'ohlcv',
                    ],
                },
                'spotv2private': {
                    'get': [
                        'pending',
                        'account',
                    ],
                    'post': [
                        'order',
                        'deleteOrder',
                    ],
                },
                'futuresv1': {
                    'get': [
                        'ohlcv',
                    ],
                },
            },
            'exceptions': {},
            'precisionMode': TICK_SIZE,
            'options': {
                'timeDifference': 0,
                'adjustTimeDifference': true,
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
        const serverTime = parseInt (response['epoch'] * 1000);
        this.options['timeDifference'] = parseInt (after - serverTime);
        return this.options['timeDifference'];
    }

    async fetchMarkets (params = {}) {
        const response = await this.spotv2GetMarkets ();
        const results = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
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

        //console.debug(results);

        return results;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
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
        const result2 = [];
        for (let i = 0; i < response.length; i++) {
            response[i].timestamp = new Date (response[i].time).getTime ();
            result2.push (response[i]);
        }
        console.log (result2);
        return this.parseTrades (result2, market, since, limit);
    }

    parseTrade (trade, market) {
        const timestamp = this.safeValue (trade, 'timestamp');
        return {
            'id': this.safeString (trade, 'serial_id'),
            'timestamp': timestamp,
            'info': trade,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': this.safeString (trade, 'type'),
            'price': this.safeFloat (trade, 'price'),
            'amount': this.safeFloat (trade, 'amount'),

            'takerOrMarker': undefined, // private
            'cost': undefined, // private
            'fee': undefined, // private
            'orderId': undefined, // private
            'side': this.safeString (trade, 'type'),
        };
    }

    parseTicker (ticker, market = undefined) {
        const symbol = this.findSymbol (this.safeString (ticker, 'symbol'), market);
        return {
            'symbol': symbol,
            'timestamp': undefined, // fixme
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

    async fetchBalance (params = {}) {
        if (this.options['adjustTimeDifference']) {
            await this.loadTimeDifference ();
        }
        await this.loadMarkets ();
        const response = await this.spotv2privateGetAccount (params);
        const result = {
            'info': response,
        };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeFloat (balance, 'available');
            account['used'] = this.safeFloat (balance, 'total') - this.safeFloat (balance, 'available');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOHLCV (symbol, timeframe = '1h', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['symbol'].replace ('/', '-'),
            'end': this.seconds (), // TODO fix wait for BTSE to introduce a limit
            'resolution': this.timeframes[timeframe],
        };
        if (since === undefined) {
            request['start'] = this.seconds () - 86400; // default from 24 hours ago
        } else {
            request['start'] = this.truncate (since / 1000, 0);
        }
        if (limit !== undefined) {
            request['end'] = limit;
        }
        const response = await this.spotv2GetOhlcv (this.extend (request, params));
        return this.parseOHLCVs (response, market['id'].toUpperCase (), timeframe, since, limit);
    }

    // parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
    //     return [
    //         ohlcv[0],
    //         parseFloat (ohlcv[1]),
    //         parseFloat (ohlcv[2]),
    //         parseFloat (ohlcv[3]),
    //         parseFloat (ohlcv[4]),
    //         parseFloat (ohlcv[5]),
    //     ];
    // }

    // TODO figure out
    parseOrderStatus (status) {
        const statuses = {
            'open': 'open',
            'cancelled': 'canceled',
            'filled': 'closed',
        };
        return this.safeString (statuses, status, status);
    }

    // TODO figure out
    parseOrder (order, market = undefined) {

    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (this.options['adjustTimeDifference']) {
            await this.loadTimeDifference ();
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['symbol'].replace ('/', '-'),
            'side': side,
            'amount': amount,
            'type': type,
            'price': price,
            'time_in_force': 'gtc',
        };
        const response = await this.spotv2privatePostOrder (this.extend (request, params));
        const order = this.safeValue (response, 'id');
        if (order === undefined) {
            console.log ('err')
            return response;
        }
        console.log (response)
        return this.parseOrder (order);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['symbol'].replace ('/', '-'),
            'order_id': id,
        };
        const response = await this.spotv2privatePostDeleteOrder (this.extend (request, params));
        // TODO parseOrder response
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['symbol'].replace ('/', '-'),
        };
        const response = await this.spotv2privateGetPending (this.extend (request, params));
        console.log (response);

        // TODO fix 403 Forbidden

        // TODO parseOrder respose
    }

    sign (path, api = 'api', method = 'GET', params = {}, headers = {}, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        let bodyText = undefined;

        if (method === 'GET') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        }

        if (api === 'spotv2private') {
            bodyText = JSON.stringify(params);
            const signaturePath = this.cleanSignaturePath (url);
            const nonce = this.nonce ();
            const signature = (method === 'GET')
                ? this.createSignature (this.secret, nonce, signaturePath)
                : this.createSignature (this.secret, nonce, signaturePath, bodyText);
            headers['btse-nonce'] = nonce;
            headers['btse-api'] = this.apiKey;
            headers['btse-sign'] = signature;
            headers['Content-Type'] = 'application/json';
        }

        body = (method === 'GET') ? null : bodyText;

        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    createSignature (key, nonce, path, body = null) {
        const content = body == null ? this.encode ('/' + path + nonce) : this.encode ('/' + path + nonce + body);
        return this.hmac (content, key, 'sha384');
    }

    cleanSignaturePath (url) {
        return url.replace ('https://api.btse.com/', '');
    }
};
