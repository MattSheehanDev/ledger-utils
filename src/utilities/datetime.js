"use strict";
const utility_1 = require('./utility');
var DateTime;
(function (DateTime) {
    DateTime.shortDateFormat = 'M/d/yyyy';
    DateTime.longDateFormat = 'dddd, MMMM dd, yyyy';
    DateTime.shortTimeFormat = 'hh:mm tt';
    DateTime.longTimeFormat = 'hh:mm:ss tt';
    DateTime.shortDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    DateTime.longDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    DateTime.shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    DateTime.longMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    DateTime.shortMeridial = ['A', 'P'];
    DateTime.longMeridial = ['AM', 'PM'];
    DateTime.eraNames = ['AD', 'BC'];
    DateTime.dateRegex = /[dM]{1,4}|yy(?:yy)?|g{1,2}|Z|'[^']*'/g;
    DateTime.timeRegex = /f{1,3}|[hHmstT]{1,2}|'[^']*'/g;
    DateTime.datetimeRegex = /[dM]{1,4}|yy(?:yy)?|[fz]{1,3}|[ghHmst]{1,2}|KZ|'[^']*'/g;
    DateTime.utcRegex = /Z|'[^']*'/g;
    let daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    function format(date, dateFormat, utc) {
        if (dateFormat === null || dateFormat === undefined)
            dateFormat = "f";
        switch (dateFormat) {
            case "d":
                return format(date, DateTime.shortDateFormat);
            case "D":
                return format(date, DateTime.longDateFormat);
            case "t":
                return format(date, DateTime.shortTimeFormat);
            case "T":
                return format(date, DateTime.longTimeFormat);
            case "f":
                if (date.getTime() == 0)
                    return format(date, DateTime.longDateFormat);
                else
                    return format(date, DateTime.longDateFormat + " " + DateTime.shortTimeFormat);
            case "F":
                if (date.getTime() == 0)
                    return format(date, DateTime.longDateFormat);
                else
                    return format(date, DateTime.longDateFormat + " " + DateTime.longTimeFormat);
            case "g":
                if (date.getTime() == 0)
                    return format(date, DateTime.shortDateFormat);
                else
                    return format(date, DateTime.shortDateFormat + " " + DateTime.shortTimeFormat);
            case "G":
                if (date.getTime() == 0)
                    return format(date, DateTime.shortDateFormat);
                else
                    return format(date, DateTime.shortDateFormat + " " + DateTime.longTimeFormat);
            case "m":
            case "M":
                return format(date, "MMMM d");
            case "o":
            case "O":
                return format(date, "yyyy-MM-ddTHH:mm:ss.fff");
            case "s":
                return format(date, "yyyy-MM-ddTHH:mm:ss");
            case "u":
            case "U":
                return format(date, "");
            case "y":
            case "Y":
                return format(date, "MMMM, yyyy");
        }
        if (utc === undefined || utc === null) {
            let matchUTC = dateFormat.match(DateTime.utcRegex);
            utc = matchUTC !== undefined ? true : false;
        }
        let year = utc ? date.getUTCFullYear() : date.getFullYear();
        let month = utc ? date.getUTCMonth() : date.getMonth();
        let day = utc ? date.getUTCDate() : date.getDate();
        let weekday = utc ? date.getUTCDay() : date.getDay();
        let hour = utc ? date.getUTCHours() : date.getHours();
        let minute = utc ? date.getUTCMinutes() : date.getMinutes();
        let second = utc ? date.getUTCSeconds() : date.getSeconds();
        let milli = utc ? date.getUTCMilliseconds() : date.getMilliseconds();
        let offset = date.getTimezoneOffset();
        let parts = {
            d: String(day),
            dd: utility_1.Pad(day, 2),
            ddd: DateTime.shortDayNames[weekday],
            dddd: DateTime.longDayNames[weekday],
            M: String(month + 1),
            MM: utility_1.Pad(month + 1, 2),
            MMM: DateTime.shortMonthNames[month],
            MMMM: DateTime.longMonthNames[month],
            yy: String(year).slice(2),
            yyyy: String(year),
            g: DateTime.eraNames[year >= 0 ? 0 : 1],
            gg: DateTime.eraNames[year >= 0 ? 0 : 1],
            h: String(hour > 12 ? hour - 12 : (hour < 1 ? 12 : hour)),
            hh: utility_1.Pad(hour > 12 ? hour - 12 : (hour < 1 ? 12 : hour), 2),
            H: String(hour),
            HH: utility_1.Pad(hour, 2),
            m: String(minute),
            mm: utility_1.Pad(minute, 2),
            s: String(second),
            ss: utility_1.Pad(second, 2),
            f: String(Math.round(milli / 100)),
            ff: utility_1.Pad(Math.round(milli / 10), 2),
            fff: utility_1.Pad(milli, 3),
            t: DateTime.shortMeridial[hour < 12 ? 0 : 1],
            tt: DateTime.longMeridial[hour < 12 ? 0 : 1],
            z: (offset > 0 ? '+' : '-') + String(Math.abs(offset) / 60),
            zz: (offset > 0 ? '+' : '-') + utility_1.Pad(Math.abs(offset / 60), 2),
            zzz: (offset > 0 ? '+' : '-') + utility_1.Pad(Math.abs(offset / 60), 2) + ':' + utility_1.Pad(Math.abs(offset) % 60, 2),
            Z: 'Z',
            K: utc ? 'Z' : (offset > 0 ? '+' : '-') + utility_1.Pad(Math.abs(offset / 60), 2) + ':' + utility_1.Pad(Math.abs(offset) % 60, 2),
        };
        return dateFormat.replace(DateTime.datetimeRegex, function (match) {
            if (match in parts)
                return parts[match];
            else
                return match.slice(1, match.length - 1);
        });
    }
    DateTime.format = format;
    function setDay(date, day) {
        let monthDays = daysInMonth[date.getMonth()];
        if (day > monthDays) {
            setMonth(date, date.getMonth() + 1);
            day = 1;
        }
        else if (day < 1) {
            let month = setMonth(date, date.getMonth() - 1);
            day = daysInMonth[month];
        }
        date.setDate(day);
        return day;
    }
    DateTime.setDay = setDay;
    function setMonth(date, month) {
        if (month > 11) {
            setYear(date, date.getFullYear() + 1);
            month = 0;
        }
        else if (month < 0) {
            setYear(date, date.getFullYear() - 1);
            month = 11;
        }
        let days = daysInMonth[month];
        let currDays = daysInMonth[date.getMonth()];
        let currDate = date.getDate();
        if (days < currDays && currDate > days) {
            setDay(date, days);
        }
        date.setMonth(month);
        return month;
    }
    DateTime.setMonth = setMonth;
    function setYear(date, year) {
        if (year < 1) {
            year = 0;
        }
        date.setFullYear(year);
        return year;
    }
    DateTime.setYear = setYear;
    function setPeriod(date, p) {
        let hours = date.getHours();
        let period = p.toUpperCase();
        if (hours < 12 && period == "PM") {
            hours += 12;
        }
        else if (hours >= 12 && period == "AM") {
            hours -= 12;
        }
        setHours(date, hours);
        return period;
    }
    DateTime.setPeriod = setPeriod;
    function setHours(date, hours) {
        if (hours < 0)
            hours = 23;
        else if (hours > 23)
            hours = 0;
        date.setHours(hours);
        return hours;
    }
    DateTime.setHours = setHours;
    function setMinutes(date, minutes) {
        if (minutes > 59) {
            setHours(date, date.getHours() + 1);
            minutes = 0;
        }
        else if (minutes < 0) {
            setHours(date, date.getHours() - 1);
            minutes = 59;
        }
        date.setMinutes(minutes);
        return minutes;
    }
    DateTime.setMinutes = setMinutes;
    function setSeconds(date, seconds) {
        if (seconds > 59) {
            setMinutes(date, date.getMinutes() + 1);
            seconds = 0;
        }
        else if (seconds < 0) {
            setMinutes(date, date.getMinutes() - 1);
            seconds = 59;
        }
        date.setSeconds(seconds);
        return seconds;
    }
    DateTime.setSeconds = setSeconds;
})(DateTime = exports.DateTime || (exports.DateTime = {}));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DateTime;

//# sourceMappingURL=datetime.js.map
