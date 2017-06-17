/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

const DateUtils = {
  yesterday: function() {
    let date = new Date();
    date.setDate(date.getDate() - 1);
    return date;
  },
  lastMonth: function() {
    let date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date;
  },
  fiveMinutesAgo: function() {
    let date = new Date();
    date.setMinutes(date.getMinutes() - 5);
    return date;
  },
  oneSecondBeforeMidnight: function(date) {
    /*
      Primarily used to set each task's dueDateTimeUtc
      to very last moment of specified date.
    */

    if (!(date instanceof Date)) {
      date = new Date(date);
    }

    date.setHours(23, 59, 59, 0);
    return date;
  }
};

module.exports = DateUtils;
