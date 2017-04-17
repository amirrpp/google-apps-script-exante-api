/**
 * @remark workaround to ask permissions only for active spreadsheet
 * @OnlyCurrentDoc
 */

/**
 * @brief base URL part
 */
var BASE_URL_API = "/md/1.0";
/**
 * @brief base URL part, edit for other environments
 */
var BASE_URL_HOST = "https://api-demo.exante.eu";
/**
 * @brief base URL
 */
var BASE_URL = BASE_URL_HOST + BASE_URL_API;
/**
 * @brief fields which are described in /symbol/:symbolId/specification instead
 * of default API
 */
var SYMBOL_SPEC_FIELDS = ["leverage", "lotSize", "contractMultiplier", "priceUnit", "units"];
/**
 * @brief auth token, generated from jwt.io. See https://developers.exante.eu/tutorials/auth-basics/
 * for more details
 */
var TOKEN = "paste-your-token-here";

/**
 * @brief default payload for get requests
 * @return payload object, see https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app
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
 * @brief default get request worker
 * @param url
 * url to fetch GET request
 * @return parsed JSON object as is
 */
function _parse(url) {
  var response = UrlFetchApp.fetch(url, _payload());
  return JSON.parse(response.getContentText());
}

/**
 * @brief crossrates for currencies
 * @param from
 * convert from currency
 * @param to
 * convert to currency
 * @param timestamp
 * dummy parameter for update feature
 * @return coversion value
 */
function EXANTECROSSRATES(from, to, timestamp) {
  var url = BASE_URL + "/crossrates/" + from + "/" + to;
  return _parse(url)["rate"];
}

/**
 * @brief symbols group information
 * @param group
 * group name
 * @param field
 * property name
 * @return property value for specified group
 */
function EXANTEGROUP(group, field) {
  var url = BASE_URL + "/groups/" + group;
  return _parse(url)[field];
}

/**
 * @brief nearest symbol of group information
 * @param group
 * group name
 * @param field
 * property name
 * @return property value for nearest expiration of specified group
 */
function EXANTEGROUPNEAREST(group, field) {
  var url = BASE_URL + "/groups/" + group + "/nearest";
  return _parse(url)[field];
}

/**
 * @brief open-high-low-close value
 * @param symbol
 * symbol ID
 * @param duration
 * OHLC duration in seconds
 * @param what
 * OHCL field, normally one of "open", "high", "low", "close", "timestamp"
 * @param timestamp
 * dummy parameter for update feature
 * @return OHLC property for specified symbol and duration
 */
function EXANTEOHLC(symbol, duration, what, timestamp) {
  var url = BASE_URL + "/ohlc/" + encodeURIComponent(symbol) + "/" + duration + "?size=1";
  return _parse(url)[0][what];
}

/**
 * @brief symbol information
 * @param symbol
 * symbol ID
 * @param field
 * property name
 * @return property value for specified symbol
 */
function EXANTESYMBOL(symbol, field) {
  var url = BASE_URL + "/symbols/" + encodeURIComponent(symbol);
  if (field in SYMBOL_SPEC_FIELDS)
    url += "/specification";
  return _parse(url)[field];
}

/**
 * @brief dummy functions which modifies A1 cell and insert current timestamp value
 * this method is actually only required for update feature (see timestamp parameter
 * in some methods), because Google Sheets does not update functions if no parameters
 * were changed, but NOW() function is not allowed to be called inside user defined
 * functions
 */
function EXANTEUPDATE() {
  SpreadsheetApp.getActiveSheet().getRange('A1').setValue(new Date().toTimeString())
  SpreadsheetApp.flush();
}

/**
 * @brief mid (average between bid and ask) value
 * @param symbol
 * symbol ID
 * @param timestamp
 * dummy parameter for update feature
 * @return mid value for specified symbol
 */
function EXANTEMID(symbol, timestamp) {
  return EXANTEOHLC(symbol, 60, "close");
}
