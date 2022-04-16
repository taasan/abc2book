const abcjs = require('abcjs');
var abc = `X: 8
T: John Ryan's
Z: NfldWhistler
S: https://thesession.org/tunes/441#setting34567
R: polka
M: 2/4
L: 1/8
K: Dmaj
A|:dd "C"B/c/d/B/|AF AF|[c:hi there everywone]dd B/c/d/B/|AF ED|
dd B/c/d/B/|[M:2/4]AF Ad/e/|[K:Gm] fd ec|1 d2 d2:|2 d2 dd/e/||
|:fd de/f/|gf ed/e/|fd Ad|fd/f/ a2|
fd de/f/|gf ed/e/|fd ec|1 d2 dd/e/:|2 d2 d2||`


function multiplyTiming(multiplier,abc) {
    var measures = abcjs.extractMeasures(abc)[0].measures
    var newMeasures = measures.map(function(m) {
      var abc = m.abc
      var c = 0
      var newAbc = []
      var inQuote = false
      var inCurlyBracket = false
      var inSquareBracket = false
      while (c < abc.length) {
        var symbol = abc[c]
        if (symbol === '"') {
            inQuote =!inQuote
        }
        if (symbol === '{') {
            inCurlyBracket = true
        }
        if (symbol === '}') {
            inCurlyBracket = false
        }
        if (symbol === '[') {
            inSquareBracket = true
        }
        if (symbol === ']') {
            inSquareBracket = false
        }
        var newSymbol = null
        var nextSymbol = abc[c+1]
        var nextNextSymbol = null
        var nextNextNextSymbol = null
        if (!inQuote && !inCurlyBracket && !inSquareBracket && isNoteLetter(symbol)) {
            if (c > abc.length + 1) {
                nextSymbol = abc[c+1]
                if (c > abc.length + 2) {
                    nextNextSymbol = abc[c+2]
                    
                    if (c > abc.length + 2) {
                        nextNextNextSymbol = abc[c+2]
                    }
                }
            }
            var result = symbolsToNumber(nextSymbol, nextNextSymbol,nextNextNextSymbol) 
            newAbc.push(symbol + abcFraction(decimalToFraction(result.number  * multiplier)))
            c = c + result.symbolsUsed  + 1
        } else {
            newAbc.push(symbol)
            c++
        }
      }
      m.abc = newAbc.join('')
      return m 
    })
    return generateAbcFromMeasures(newMeasures)
}

function generateAbcFromMeasures(measures) {
    return measures.map(function(measure) {
        var abc = measure.abc
        return abc 
    }).join(" ")
}

// eg /4 becomes 0.25, /2 becomes 0.5, 4 becomes 4.0
function symbolsToNumber(a,b,c) {
    if (isSlash(a)) {
        if (isDigit(b)) {
            if (isDigit(c)) {
                var combined = parseInt(b + '' + c)
                return {symbolsUsed: 3, number: 1/combined}
            } else {
                return {symbolsUsed: 2, number: 1/b}
            }
        } else {
            return {symbolsUsed: 1, number: 1/2}
        }
    } else {
        if (isDigit(a)) {
            if (isDigit(b)) {
                var combined = parseInt(a + '' + b)
                return {symbolsUsed: 2, number: 1/combined}
            } else {
                return {symbolsUsed: 1, number: 1/a}
            }
        } else {
            return {symbolsUsed: 0, number: 1}
        }
    }
}

function gcd(a, b) {
	return (b) ? gcd(b, a % b) : a;
}

var decimalToFraction = function (_decimal) {
    if (_decimal == parseInt(_decimal)) {
        return {
            top: parseInt(_decimal),
            bottom: 1,
            display: parseInt(_decimal) + '/' + 1
        };
    }
    else {
        var top = _decimal.toString().includes(".") ? _decimal.toString().replace(/\d+[.]/, '') : 0;
        var bottom = Math.pow(10, top.toString().replace('-','').length);
        if (_decimal >= 1) {
            top = +top + (Math.floor(_decimal) * bottom);
        }
        else if (_decimal <= -1) {
            top = +top + (Math.ceil(_decimal) * bottom);
        }

        var x = Math.abs(gcd(top, bottom));
        return {
            top: (top / x),
            bottom: (bottom / x),
            display: (top / x) + '/' + (bottom / x)
        };
    }
}

function abcFraction(fraction) {
    if (fraction.bottom === 1) {
        if (fraction.top === 1) {
            return ''
        } else {
            return fraction.top
        }
    } else {
        if (fraction.bottom === 2) {
            return "/"
        } else {
            return "/" + fraction.bottom
        }
    }
}


function isNoteLetter(a) {
    if ("zabcdefgABCDEFG".indexOf(a) !== -1) {
        return true
    } else {
        return false
    }
}
function isDigit(a) {
    if ("123456789".indexOf(a) !== -1) {
        return true
    } else {
        return false
    }
}
function isSlash(a) {
    if (a === "/") {
        return true
    } else {
        return false
    }
}



console.log(multiplyTiming(process.argv[2] > 0 ? process.argv[2] : 1,abc))
