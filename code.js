/**
 * @license
 * Copyright (c) 2017 EXANTE
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:

 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
/**
 * @file Google Apps Script shows how to work with EXANTE API functions
 * @author EXANTE
 */

/**
 * workaround to ask permissions only for active spreadsheet, see
 * https://developers.google.com/apps-script/guides/services/authorization
 * for details
 * @OnlyCurrentDoc
 */

/**
 * base URL part
 * @constant {string}
 */
var BASE_URL_API = "/md/1.0";
/**
 * base URL part, edit for other environments
 * @constant {string}
 */
var BASE_URL_HOST = "https://api-demo.exante.eu";
/**
 * base URL
 * @constant {string}
 */
var BASE_URL = BASE_URL_HOST + BASE_URL_API;
/**
 * fields which are described in /symbol/:symbolId/specification instead
 * of default API
 * @constant {string[]}
 */
var SYMBOL_SPEC_FIELDS = ["leverage", "lotSize", "contractMultiplier", "priceUnit", "units"];
/**
 * auth token, generated from jwt.io. See https://developers.exante.eu/tutorials/auth-basics/
 * for more details
 * @constant {string}
 */
var TOKEN = "paste-your-token-here";

/**
 * default payload for get requests
 * @returns {object} payload object, see
 * https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app
 * for details
 */
function _payload() {
    return {
        "method": "get",
        "headers": {
            "Authorization": "Bearer " + TOKEN
        }
    };
}

/**
 * default get request worker
 * @param {string} url
 * url to fetch GET request
 * @returns {object} parsed JSON object as is
 */
function _parse(url) {
    var response = UrlFetchApp.fetch(url, _payload());
    return JSON.parse(response.getContentText());
}

/**
 * crossrates for currencies
 * @param {string} from
 * convert from currency
 * @param {string} to
 * convert to currency
 * @param {string} [timestamp]
 * dummy parameter for update feature
 * @returns {Number} coversion value
 */
function EXANTECROSSRATES(from, to, timestamp) {
    var url = BASE_URL + "/crossrates/" + from + "/" + to;
    return _parse(url)["rate"];
}

/**
 * symbols group information
 * @param {string} group
 * group name
 * @param {string} field
 * property name
 * @example
 * var name = EXANTEGROUP("Si", "name");
 * @returns {number|string} property value for specified group
 */
function EXANTEGROUP(group, field) {
    var url = BASE_URL + "/groups/" + group;
    return _parse(url)[field];
}

/**
 * nearest symbol of group information
 * @param {string} group
 * group name
 * @param {string} field
 * property name
 * @example
 * var id = EXANTEGROUPNEAREST("Si", "id");
 * @returns {number|string} property value for nearest expiration of specified group
 */
function EXANTEGROUPNEAREST(group, field) {
    var url = BASE_URL + "/groups/" + group + "/nearest";
    return _parse(url)[field];
}

/**
 * open-high-low-close value
 * @param {string} symbol
 * symbol ID
 * @param {string|number} duration
 * OHLC duration in seconds
 * @param {string} what
 * OHCL field, normally one of "open", "high", "low", "close", "timestamp"
 * @param {string} [timestamp]
 * dummy parameter for update feature
 * @example
 * var openPrice = EXANTEOHLC("EUR/USD.E.FX", 60, "open");
 * var highPrice = EXANTEOHLC("EUR/USD.E.FX", 60, "high");
 * var lowPrice = EXANTEOHLC("EUR/USD.E.FX", 60, "low");
 * var closePrice = EXANTEOHLC("EUR/USD.E.FX", 60, "close");
 * @returns {number} OHLC property for specified symbol and duration
 */
function EXANTEOHLC(symbol, duration, what, timestamp) {
    var url = BASE_URL + "/ohlc/" + encodeURIComponent(symbol) + "/" + duration + "?size=1";
    return _parse(url)[0][what];
}

/**
 * symbol information
 * @param {string} symbol
 * symbol ID
 * @param {string} field
 * property name
 * @example
 * var description = EXANTESYMBOL("AAPL.NASDAQ", "description");
 * @returns {string|number} property value for specified symbol
 */
function EXANTESYMBOL(symbol, field) {
    var url = BASE_URL + "/symbols/" + encodeURIComponent(symbol);
    if (field in SYMBOL_SPEC_FIELDS)
        url += "/specification";
    return _parse(url)[field];
}

/**
 * dummy functions which modifies A1 cell and insert current timestamp value
 * this method is actually only required for update feature (see timestamp parameter
 * in some methods), because Google Sheets does not update functions if no parameters
 * were changed, but NOW() function is not allowed to be called inside user defined
 * functions
 */
function EXANTEUPDATE() {
    SpreadsheetApp.getActiveSheet().getRange('A1').setValue(new Date().toTimeString());
    SpreadsheetApp.flush();
}

/**
 * mid (average between bid and ask) value
 * @param {string} symbol
 * symbol ID
 * @param {string} [timestamp]
 * dummy parameter for update feature
 * @example
 * var mid = EXANTEMID("EUR/USD.E.FX");
 * @returns {number} mid value for specified symbol
 */
function EXANTEMID(symbol, timestamp) {
    return EXANTEOHLC(symbol, 60, "close");
}
