Number.prototype.toTimeFormat = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var days   = Math.floor(sec_num / (3600*24));
    var hours   = Math.floor((sec_num - (days*(3600*24))) / 3600);
    var minutes = Math.floor((sec_num - (days*(3600*24)) - (hours * 3600)) / 60);
    var seconds = sec_num - (days*(3600*24)) - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    if (days < 10) {days = "0"+days;}

    if (days > 0) {
        return days + "d " + hours + "h " + minutes + "m"
    } else if (hours > 0) {
        return hours + "h " + minutes + "m"
    } else {
        return minutes + "m"
    }

    //return days+":"+hours+":"+minutes;

}

String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

function isInt(n) {
   return n % 1 === 0;
}

function retr_dec(num) {
  return (num.split('.')[1] || []).length;
}

(function() {
  /**
   * Decimal adjustment of a number.
   *
   * @param {String}  type  The type of adjustment.
   * @param {Number}  value The number.
   * @param {Integer} exp   The exponent (the 10 logarithm of the adjustment base).
   * @returns {Number} The adjusted value.
   */
  function decimalAdjust(type, value, exp) {
    // If the exp is undefined or zero...
    if (typeof exp === 'undefined' || +exp === 0) {
      return Math[type](value);
    }
    value = +value;
    exp = +exp;
    // If the value is not a number or the exp is not an integer...
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
      return NaN;
    }
    // Shift
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    // Shift back
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
  }

  // Decimal round
  if (!Math.round10) {
    Math.round10 = function(value, exp) {
      return decimalAdjust('round', value, exp);
    };
  }
  // Decimal floor
  if (!Math.floor10) {
    Math.floor10 = function(value, exp) {
      return decimalAdjust('floor', value, exp);
    };
  }
  // Decimal ceil
  if (!Math.ceil10) {
    Math.ceil10 = function(value, exp) {
      return decimalAdjust('ceil', value, exp);
    };
  }
})();



function gup(name) {
    var url = location.href
    name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]")
    var regexS = "[\\?&]"+name+"=([^&#]*)"
    var regex = new RegExp( regexS )
    var results = regex.exec( url )
    return results == null ? null : results[1]
}

function checkForUrlParams() {
    if(document.location.search.length) {
        // query string exists
        return true
    } else {
        // no query string exists
        return false
    }
}
