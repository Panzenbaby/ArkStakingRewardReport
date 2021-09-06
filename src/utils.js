// This is a copy of https://github.com/dated/delegate-calculator-plugin/blob/master/src/utils.js

module.exports = {
    upperFirst: str => `${str.charAt(0).toUpperCase()}${str.slice(1)}`,

    formatter_currency: (value, currency, language = 'en') => {
        const isCrypto = currency => {
            return ['ARK', 'BTC', 'ETH', 'LTC'].includes(currency)
        }

        return Number(value).toLocaleString(language, {
            style: 'currency',
            currencyDisplay: 'code',
            currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: isCrypto(currency) ? 8 : 2
        })
    },

    format_time: (time, language) => {
        return new Date(time * 1000).toLocaleDateString(language)
    }
}
