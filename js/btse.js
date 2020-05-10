'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { TICK_SIZE } = require ('./base/functions/number');
const { InvalidOrder } = require ('./base/errors');
// const { } = require ('./base/errors');

module.exports = class btse extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'btse',
            'name': 'BTSE',
            'countries': ['UAE'],
            'userAgent': 'sdk_ccxt/btse',
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
                    'futuresv2private': 'https://api.btse.com/futures/api/v2.1',
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
                },
                'spotv3private': {
                    'get': [
                        'user/fees',
                        'user/open_orders',
                        'user/trade_history',
                        'user/wallet',
                        'user/wallet_history',
                    ],
                    'post': [
                        'order',
                        'order/peg',
                        '/order/cancelAllAfter',
                    ],
                    'delete': [
                        'order',
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
                'futuresv2private': {
                    'get': [
                        'user/fees',
                        'user/open_orders',
                        'user/positions',
                        'user/trade_history',
                        'user/wallet',
                        'user/wallet_history',
                    ],
                    'post': [
                        'user/wallet_transfer',
                        'order',
                        'order/peg',
                        'order/close_position',
                        'order/cancelAllAfter',
                        'leverage',
                        'risk_limit',
                    ],
                    'delete': [
                        'order',
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
        response.forEach((market) => {
            const baseId = this.safeString (market, 'base');
            const quoteId = this.safeString (market, 'quote');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            results.push ({
                'id': this.safeValue (market, 'symbol'),
                'symbol': `${base}/${quote}`,
                base,
                quote,
                baseId,
                quoteId,
                'active': this.safeValue (market, 'active'),
                'precision': {
                    'price': this.safeFloat (market, 'minPriceIncrement'),
                    'amount': this.safeFloat (market, 'minSizeIncrement'),
                    'cost': undefined,
                },
                'limits': {
                    'amount': {
                        'min': this.safeFloat (market, 'minOrderSize'),
                        'max': this.safeFloat (market, 'maxOrderSize'),
                    },
                    'price': {
                        'min': this.safeFloat (market, 'minValidPrice'),
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'info': market
            });
        });
        return results;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const defaultType = this.safeString2 (this.options, 'GetMarketSummary', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const method = (type === 'spot') ? 'spotv3GetMarketSummary' : 'futuresv2GetMarketSummary';
        const request = {
            'symbol': market['id'],
        };
        const response = await this[method] (this.extend (request, params));
        return this.parseTicker (response[0]);
    }

    parseTicker (ticker) {
        return {
            'symbol': this.safeString (ticker, 'symbol'),
            'timestamp': this.milliseconds (),
            'high': this.safeFloat2 (ticker, 'high24Hr'),
            'low': this.safeFloat2 (ticker, 'low24Hr'),
            'bid': this.safeFloat (ticker, 'highestBid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'lowestAsk'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'last': this.safeFloat (ticker, 'last'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeFloat (ticker, 'percentageChange'),
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': this.safeFloat (ticker, 'volume'),
            'info': ticker,
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['depth'] = limit;
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
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['count'] = limit;
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
            'id': this.safeString (trade, 'serialId'),
            'order': this.safeString (trade, 'orderID'),
            'symbol': market['symbol'],
            'price': this.safeFloat (trade, 'price'),
            'amount': this.safeFloat (trade, 'size'),
            'fee': this.safeFloat (trade, 'feeAmount'),
            'type': undefined,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'info': trade,
        };
    }

    async fetchBalance (params = {}) {
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
            'symbol': market['id'],
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
    parseOrder (order, market = undefined) {
        // [
        //     {
        //         "status": 2,
        //         "symbol": "BTC-USD",
        //         "orderType": 76,
        //         "price": 3000.0,
        //         "side": "BUY",
        //         "size": 0.002,
        //         "orderID": "299c9caa-ce3a-4054-b541-af2aaeaaa933",
        //         "timestamp": 1588019952927,
        //         "triggerPrice": 0.0,
        //         "stopPrice": null,
        //         "trigger": false,
        //         "message": "",
        //         "averageFillPrice": 0.0,
        //         "fillSize": 0.0,
        //         "clOrderID": ""
        //     }
        // ]
        const id = this.safeString (order, 'orderID');
        const timestamp = this.parse8601 (this.safeString (order, 'timestamp'));
        const filled = this.safeFloat (order, 'fillSize');
        let symbol = undefined;
        const marketId = this.safeString (order, 'symbol');
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
            symbol = market['symbol'];
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const side = this.safeString (order, 'side');
        // const type = this.safeString (order, 'type');
        const amount = this.safeFloat (order, 'size');
        const remaining = this.safeFloat (amount - filled); // TODO fails: undefined
        const average = this.safeFloat (order, 'averageFillPrice:');
        const price = this.safeFloat2 (order, 'price', 'triggerPrice:', average);
        let cost = undefined;
        if (filled !== 0 && price !== undefined) {
            cost = filled * price;
        }
        // const lastTradeTimestamp = this.parse8601 (this.safeString (order, 'triggeredAt'));
        const clientOrderId = this.safeString (order, 'clOrderID');
        return {
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            // 'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            // 'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
            'trades': undefined,
        };
    }

    async createOrder (symbol, orderType, side, size, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'].toUpperCase (),
            'side': side.toUpperCase (),
            'size': size.toUpperCase (),
            'time_in_force': 'GTC',
        };
        let priceToPrecision = undefined;
        if (price !== undefined) {
            priceToPrecision = parseFloat (this.priceToPrecision (symbol, price));
        }
        switch (orderType.toUpperCase ()) {
        case 'LIMIT':
            request['type'] = 'LIMIT';
            request['price'] = priceToPrecision;
            break;
        case 'MARKET':
            request['type'] = 'MARKET';
            // request['price'] = null;
            break;
        case 'STOP':
            request['txType'] = 'STOP';
            request['stopPrice'] = priceToPrecision;
            break;
        case 'TRAILINGSTOP':
            request['trailValue'] = priceToPrecision;
            break;
        default:
            throw new InvalidOrder (this.id + ' createOrder () does not support order type ' + orderType + ', only limit, market, stop, trailingStop, or takeProfit orders are supported');
        }
        const defaultType = this.safeString2 (this.options, 'PostOrder', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const method = (type === 'spot') ? 'spotv3privatePostOrder' : 'futuresv2privatePostOrder';
        const response = await this[method] (this.extend (request, params));
        const order = this.safeValue (response[0], 'orderID');
        if (order === undefined) {
            console.log ('err order undefined');
            return response;
        }
        return this.parseOrder (response[0]);
    }

    async cancelOrder (id, symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['symbol'],
            'orderID': id,
        };
        const defaultType = this.safeString2 (this.options, 'DeleteOrder', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const method = (type === 'spot') ? 'spotv3privateDeleteOrder' : 'futuresv2privateDeleteOrder';
        const response = await this[method] (this.extend (request, params));
        const order = this.safeValue (response[0], 'orderID');
        if (order === undefined) {
            console.log ('err order undefined');
            return response;
        }
        return this.parseOrder (response[0]);
    }

    async fetchOpenOrders (symbol, orderId, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (orderId !== undefined) {
            request['orderID'] = orderId;
        }
        const defaultType = this.safeString2 (this.options, 'GetUserOpenOrders', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const method = (type === 'spot') ? 'spotv3privateGetUserOpenOrders' : 'futuresv2privateGetUserOpenOrders';
        const response = await this[method] (this.extend (request, params));
        return this.parseOrder (response[0]);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'before': since,
            'limit': limit,
        };
        const orders = await this.spotv2privatePostFills (this.extend (request, params));
        return this.filterBy (orders, 'status', 'closed');
        // TODO needs double check
    }

    sign (path, api = 'api', method = 'GET', params = {}, headers = {}, body) {
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        let bodyText = undefined;
        if (method === 'GET' || method === 'DELETE') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        }
        if (api.includes('private')) {
            this.checkRequiredCredentials ();
            bodyText = JSON.stringify (params);
            const signaturePath = this.cleanSignaturePath (api, this.urls['api'][api] + '/' + path);
            headers = this.signHeaders (headers = {}, signaturePath, bodyText);
        }
        body = (method === 'GET') ? null : bodyText;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    signHeaders (headers, signaturePath, bodyText = undefined) {
        const nonce = this.nonce();
        let signature;
        if (method === 'GET' || method === 'DELETE') {
            signature = this.createSignature (this.secret, nonce, signaturePath);
        } else {
            signature = this.createSignature (this.secret, nonce, signaturePath, bodyText);
        }
        headers['btse-nonce'] = nonce;
        headers['btse-api'] = this.apiKey;
        headers['btse-sign'] = signature;
        headers['Content-Type'] = 'application/json';
        return headers;
    }

    createSignature (key, nonce, path, body = null) {
        console.log (path);
        const content = body == null ? this.encode ('/' + path + nonce) : this.encode ('/' + path + nonce + body);
        return this.hmac (content, key, 'sha384');
    }

    cleanSignaturePath (api, url) {
        return (api === "spotv3private")
            ? url.replace ('https://api.btse.com/spot/', '')
            : url.replace ('https://api.btse.com/futures/', '');
    }
};
