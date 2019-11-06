'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { TICK_SIZE } = require ('./base/functions/number');
const { AuthenticationError, ExchangeError, ArgumentsRequired, PermissionDenied, InvalidOrder, OrderNotFound, DDoSProtection, NotSupported, ExchangeNotAvailable, InsufficientFunds } = require ('./base/errors');

module.exports = class btse extends Exchange {
    describe() {
        return this.deepExtend(super.describe(), {
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
                    'testnet': 'https://testapi.btse.io'
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
                    ],
                },
                'private': {
                    'get': [
                    ],
                    'post': [
                    ],
                },
            },
            'exceptions': {
            },
            'precisionMode': TICK_SIZE,
            'options': {
                'fetchTickerQuotes': true,
            },
        });
    }

    async loadTimeDifference () {
        const serverTime = await this.spotv2GetTime()
        const after = this.milliseconds ();
        this.options['timeDifference'] = parseInt (after - serverTime);
        return this.options['timeDifference'];
    }

}