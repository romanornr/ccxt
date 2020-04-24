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
                    'spotv2': 'https://api.btse.com/spot/api/v2',
                    'spotv3': 'https://api.btse.com/spot/api/v3.1',
                    'spotv3private': 'https://api.btse.com/spot/api/v3.1',
                    'futuresv2': 'https://api.btse.com/futures/api/v2.1',
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
                        'market_summary',
                        'ticker/{id}/',
                        'orderbook/{id}',
                        'trades',
                        'account',
                        'ohlcv',
                    ],
                },
                'spotv3': {
                    'get': [
                        'time',
                        'market_summary', // get all markets
                        'orderbook/L2',
                        'trades',
                        'account',
                        'ohlcv',
                    ],
                    'post': [
                        'order',
                        'deleteOrder',
                        'fills',
                    ],
                },
                'spotv3private': {
                    'get': [
                        'pending',
                        'user/wallet',
                    ],
                    'post': [
                        'order',
                        'deleteOrder',
                        'fills',
                    ],
                },
                'futuresv2': {
                    'get': [
                        'time',
                        'market_summary',
                        'orderbook/L2',
                        'ohlcv',
                        'trades',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': 0.060,
                    'maker': 0.0,
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
        const type = this.safeString2 (this.options, 'fetchTime', 'defaultType', 'spot');
        const method = (type === 'spot') ? 'spotv3GetTime' : 'futuresv2GetTime';
        // eslint-disable-next-line no-undef
        const response = await this[method];
        const after = this.milliseconds ();
        const serverTime = parseInt (response['epoch'] * 1000);
        this.options['timeDifference'] = parseInt (after - serverTime);
        return this.options['timeDifference'];
    }

    async fetchMarkets (params = {}) {
        const defaultType = this.safeString2 (this.options, 'GetMarketSummary', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const query = this.omit (params, 'type');
        const method = (type === 'spot') ? 'spotv3GetMarketSummary' : 'futuresv2GetMarketSummary';
        const response = await this[method] (query);
        const results = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const future = ('futures' in market);
            const spot = future;
            const marketType = spot ? 'spot' : 'future';
            const baseId = this.safeString (market, 'base');
            const quoteId = this.safeString (market, 'quote');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const active = this.safeValue (market, 'active');
            const symbol = this.safeString (market, 'symbol'); // base + '/' + quote;
            const id = this.safeValue (market, 'symbol').replace (/-/g, '').toLowerCase ();
            const sizeIncrement = this.safeFloat (market, 'minSizeIncrement');
            const priceIncrement = this.safeFloat (market, 'minPriceIncrement');
            const precision = {
                'amount': sizeIncrement,
                'price': priceIncrement,
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
                'type': marketType,
                'limits': {
                    'amount': {
                        'min': sizeIncrement,
                        'max': undefined,
                    },
                    'price': {
                        'min': priceIncrement,
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    // 'spot': true,
                },
            });
        }
        return results;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const defaultType = this.safeString2 (this.options, 'GetMarketSummary', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const method = (type === 'spot') ? 'spotv3GetMarketSummary' : 'futuresv2GetMarketSummary';
        const request = {
            'symbol': symbol,
        };
        const response = await this[method] (this.extend (request, params));
        return this.parseTicker (response, symbol);
    }

    // TODO this def needs a fix
    parseTicker (ticker, market = undefined) {
        const symbol = this.safeString (ticker, 'symbol');
        return {
            'symbol': ticker[0]['symbol'],
            'timestamp': undefined, // fixme
            'high': this.safeFloat2 (ticker[0], 'high24Hr'),
            'low': this.safeFloat2 (ticker[0], 'low24Hr'),
            'bid': this.safeFloat (ticker[0], 'highestBid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker[0], 'lowestAsk'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'last': this.safeFloat (ticker[0], 'last'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeFloat (ticker[0], 'percentageChange'),
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': this.safeFloat (ticker[0], 'volume'),
            'info': ticker[0],
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'symbol': symbol,
        };
        if (limit !== undefined) {
            request['depth'] = limit; // default 100, max 5000, see https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md#order-book
        }
        const defaultType = this.safeString2 (this.options, 'GetOrderBookL2', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const method = (type === 'spot') ? 'spotv3GetOrderbookL2' : 'futuresv2GetOrderbookL2';
        const response = await this[method] (this.extend (request, params));
        // {
        //     buyQuote: [
        //         { price: "7568.0", size: "1.026"}
        //     ],
        //     sellQuote: [
        //         { price: "21742.0", size: "3.970" }
        //     ],
        //     timestamp: 1587680929683,
        //     symbol: "BTC-USD",
        // }
        const timestamp = this.safeTimestamp (response, 'timestamp');
        const orderbook = this.parseOrderBook (response, timestamp, 'buyQuote', 'sellQuote', 'price', 'size');
        orderbook['nonce'] = this.safeInteger (response, 'timestamp');
        return orderbook;
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': symbol,
        };
        if (limit !== undefined) {
            request['count'] = limit;
        } else {
            request['count'] = 5;
        }
        // [
        //     {
        //         price: 7467.5,
        //         size: 31,
        //         side: "BUY",
        //         symbol: "BTCPFC",
        //         serialId: 131840942,
        //         timestamp: 1587685195324,
        //     }
        // ]
        const defaultType = this.safeString2 (this.options, 'GetTrades', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const method = (type === 'spot') ? 'spotv3GetTrades' : 'futuresv2GetTrades';
        const response = await this[method] (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
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
            'amount': this.safeFloat (trade, 'size'),

            'takerOrMarker': undefined, // private
            'cost': undefined, // private
            'fee': undefined, // private
            'orderId': this.safeString (trade, 'serialId'),
            'side': this.safeString (trade, 'side'),
        };
    }

    async fetchBalance (params = {}) {
        // if (this.options['adjustTimeDifference']) {
        //     await this.loadTimeDifference ();
        // }

        // if (this.options['timeDifference'] = parseInt (after - serverTime);
        // return this.options['timeDifference'];
        await this.loadTimeDifference ();
        await this.loadMarkets ();
        const response = await this.spotv3privateGetUserWallet (params);
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
            'symbol': symbol,
            'end': this.seconds (),
            'resolution': this.timeframes[timeframe],
        };
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default == max == 300
        }
        const defaultType = this.safeString2 (this.options, 'GetOhlcv', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const method = (type === 'spot') ? 'spotv3GetOhlcv' : 'futuresv2GetOhlcv';
        // const method = market['spot'] ? 'spotv3GetOhlcv' : 'futuresv2GetOhlcv';
        const response = await this[method] (this.extend (request, params));
        // [
        //     [
        //         1586466000,
        //         7300.0,
        //         7336.5,
        //         7267.0,
        //         7297.5,
        //         2442223.812
        //     ],
        //     [
        //         1586462400,
        //         7269.5,
        //         7327.0,
        //         7243.5,
        //         7300.0,
        //         4018516.731
        //     ]
        // ]
        return this.parseOHLCVs (response, market['id'].toUpperCase (), timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1h', since = undefined, limit = undefined) {
        return [
            ohlcv[0], // time
            parseFloat (ohlcv[1]), // open
            parseFloat (ohlcv[2]), // high
            parseFloat (ohlcv[3]), // low
            parseFloat (ohlcv[4]), // close
            parseFloat (ohlcv[5]), // volume
        ];
    }

    // TODO figure out
    parseOrderStatus (status) {
        const statuses = {
            'open': 'open',
            'cancelled': 'canceled',
            'filled': 'closed',
        };
        return this.safeString (statuses, status, status);
    }

    // // TODO figure out
    // parseOrder (order, market = undefined) {
    //
    // }

    async createOrder (symbol, type, side, size, price = undefined, params = {}) {
        // if (this.options['adjustTimeDifference']) {
        //     await this.loadTimeDifference ();
        // }
        await this.loadMarkets ();
        //const market = this.market (symbol);
        const request = {
            'symbol': symbol,
            'side': side,
            'size': size,
            'type': type,
            'price': price,
            'time_in_force': 'gtc',
        };
        const response = await this.spotv3privatePostOrder (this.extend (request, params));
        const order = this.safeValue (response, 'id');
        if (order === undefined) {
            console.log ('err');
            return response;
        }
        console.log (response);
        return this.parseOrder (order);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['symbol'].replace ('/', '-'),
            'order_id': id,
        };
        // eslint-disable-next-line no-unused-vars
        const response = await this.spotv2privatePostDeleteOrder (this.extend (request, params));
        // TODO parseOrder response
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (this.options['adjustTimeDifference']) {
            await this.loadTimeDifference ();
        }
        await this.loadMarkets ();
        // const market = this.market (symbol);
        // const request = {
        //     'symbol': market['symbol'].replace ('/', '-'),
        // };
        // const response = await this.spotv2privateGetPending (this.extend (request, params));
        const response = await this.spotv2privateGetPending ();
        console.log (response);

        // TODO fix 403 giving request

        // TODO parseOrder respose
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['symbol'].replace ('/', '-'),
            'before': since,
            'limit': limit,
        };
        const orders = await this.spotv2privatePostFills (this.extend (request, params));
        return this.filterBy (orders, 'status', 'closed');
        // TODO needs double check
    }

    sign (path, api = 'api', method = 'GET', params = {}, headers = {}, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        let bodyText = undefined;
        if (method === 'GET') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        }
        if (api === 'spotv3private') {
            bodyText = JSON.stringify (params);
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
        console.log (url)
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
