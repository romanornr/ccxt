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
                    ],
                },
                'spotv2private': {
                    'get': [
                        'account',
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

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
            'symbol': this.marketId (symbol),
            'side': this.capitalize (side),
            'qty': amount,
            'order_type': this.capitalize (type),
        };
        if (price !== undefined) {
            request['price'] = price;
        }
        let response = undefined;
        if (('stop_px' in params) && ('base_price' in params)) {
            response = await this.privatePostStopOrderCreate (this.extend (request, params));
        } else {
            response = await this.privatePostOrderCreate (this.extend (request, params));
        }
        const order = this.parseOrder (response['result']);
        const id = this.safeString (order, 'order_id');
        this.orders[id] = order;
        return this.extend ({ 'info': response }, order);
    }

    sign (path, api = 'api', method = 'GET', params = {}, headers = {}, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        if (Object.keys (params).length) {
            url += '?' + this.urlencode (params);
        }
        if (api === 'spotv2private') {
            const signaturePath = this.cleanSignaturePath (url);
            const nonce = this.nonce ();
            const signature = this.createSignature (this.secret, nonce, signaturePath);
            headers['btse-nonce'] = nonce;
            headers['btse-api'] = this.apiKey;
            headers['btse-sign'] = signature;
        }
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
