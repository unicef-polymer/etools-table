export function isValidDate(date) {
    return date instanceof Date === false ? false : date.toString() !== 'Invalid Date';
}
export function prettyDate(dateString, format, placeholder = '-') {
    const date = convertDate(dateString);
    return !date ? (placeholder ? placeholder : '') : _utcDate(date, format);
}
function getDateLib() {
    const dateLib = window.dayjs || window.moment;
    if (!dateLib) {
        throw new Error('Etools-table: dayjs or moment is not loaded');
    }
    return dateLib;
}
function _utcDate(date, format) {
    const dateLib = getDateLib();
    return !date ? '' : dateLib.utc(date).format(format ? format : 'D MMM YYYY');
}
export function convertDate(dateString, noZTimezoneOffset) {
    if (dateString !== '') {
        dateString = dateString.indexOf('T') === -1 ? dateString + 'T00:00:00' : dateString;
        /**
         * `Z` (zero time offset) will ensure `new Date` will create the date in UTC and then it will apply local timezone
         * and will have the same result in all timezones (for the UTC date).
         * Example:
         *  d = new Date('2018-04-25T00:00:00Z');
         *  d.toString() == "Wed Apr 25 2018 03:00:00 GMT+0300 (EEST)"
         *  d.toGMTString() == "Wed, 25 Apr 2018 00:00:00 GMT"
         * @type {string}
         */
        dateString += noZTimezoneOffset || dateString.indexOf('Z') >= 0 ? '' : 'Z';
        const date = new Date(dateString);
        const isValid = isValidDate(date);
        if (!isValid) {
            console.log('Date conversion unsuccessful: ' + dateString);
        }
        return isValid ? date : null;
    }
    return null;
}
export function formatDate(date, format) {
    if (!date) {
        return null;
    }
    const dateLib = getDateLib();
    return dateLib(date).format(format);
}
