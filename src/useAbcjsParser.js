import abcjs from 'abcjs'
import useAbcTools from './useAbcTools'
import { chordParserFactory, chordRendererFactory } from 'chord-symbol';

export default function useAbcjsParser() {
    
    var abcTools = useAbcTools()
    
    function getNoteLength(abc) {
        var nl = 0.125
        var parts = abc.split("\n")
        for (var partKey in parts) {
            var part = parts[partKey]
            if (part.startsWith('L:')) {
                var found = part.slice(2).trim()
                var foundParts = found.split("/")
                if (foundParts.length === 2) {
                    nl = foundParts[0]/foundParts[1]
                } 
                break;
            }
        }
       return nl
    }
    
    function getMeter(abc) {
        var nl = '4/4'
        var parts = abc.split("\n")
        for (var partKey in parts) {
            var part = parts[partKey]
            if (part.startsWith('M:')) {
                var found = part.slice(2).trim()
                var foundParts = found.split("/")
                if (foundParts.length === 2) {
                    nl = foundParts[0] + "/" + foundParts[1]
                } 
                break;
            }
        }
       return nl
    }
    
    function gcd(a, b) {
        return (b) ? gcd(b, a % b) : a;
    }
    
    var decimalToFraction = function (_decimal) {

        if (_decimal == 1){
            return {
                top		: 1,
                bottom	: 1,
                display	: 1 + ':' + 1
            };
        }  else {

            var top		= _decimal.toString().replace(/\d+[.]/, '');
            var bottom	= Math.pow(10, top.length);
            if (_decimal > 1) {
                top	= +top + Math.floor(_decimal) * bottom;
            }
            var x = gcd(top, bottom);
            return {
                top		: (top / x),
                bottom	: (bottom / x),
                display	: (top / x) + ':' + (bottom / x)
            };
        }
    };
    
    function durationToNoteLength(duration, noteLength=0.125) {
        var l = duration / noteLength 
        if (l > 1) {
            if (Math.round(l) == l) {
                return l
            } else {
                // fraction
                var f = decimalToFraction(l)
                //console.log("FFFF",f)
                return f.top + "/" + f.bottom
            }
        } else if (l < 1) {
            return "/" + parseInt((1/l))
        } else {
            return ''
        }
    }
    
    function pitchToNote(pitch,duration, noteLength) {
        var note = ''
        if (pitch && pitch.name && duration > 0) {
            note = pitch.name.trim() + durationToNoteLength(duration, noteLength)
        }
        
        if (pitch.startSlur) {
            note = "(" + note
        } else if (pitch.endSlur) {
            note = note + ")"
        } else if (pitch.startTie) {
            note = note + "-"
        } else if (pitch.endTie) {
            
        }
        
        return note
    }

    function lookupDecoration(d) {
        
        var decorations = {'upbow': 'u','downbow':'v','fermata': 'H','accent': 'L','mordent': 'M','coda':'O','pralltriller':'P','segno':'S','trill':'T','staccato':'.', 'wedge': "!wedge!", 'uppermordent': "!uppermordent!", 'turn': "!turn!", 'thumb': "!thumb!", 'tenuto': "!tenuto!", 'snap': "!snap!", 'shortphrase': "!shortphrase!", 'roll': "!roll!", 'pppp': "!pppp!", 'ppp': "!ppp!", 'pp': "!pp!", 'p': "!p!", 'open': "!open!", 'mf': "!mf!", 'mediumphrase': "!mediumphrase!", 'lowermordent': "!lowermordent!", 'longphrase': "!longphrase!", 'invertedfermata': "!invertedfermata!", 'fine': "!fine!", 'ffff': "!ffff!", 'fff': "!fff!", 'ff': "!ff!", 'f': "!f!", 'diminuendo)': "!diminuendo)!", 'diminuendo(': "!diminuendo(!", 'crescendo)': "!crescendo)!", 'crescendo(': "!crescendo(!", 'breath': "!breath!", 'D.S.': "!D.S.!", 'D.C.': "!D.C.!", '5': "!5!", '4': "!4!", '3': "!3!", '2': "!2!", '1': "!1!", '0': "!0!", '+': "!+!"}
        return decorations.hasOwnProperty(d) ? decorations[d] : '' //'{'+d+"}"
    }   
       
       
    // convert from abcjs parsed object to ABC notation string
    // the original string is required as well as the parsed version 
    // to determine note spacings  and note length  
    function render(abc, abcString) {
        //console.log('ren',abc)
        var noteLength = getNoteLength(abcString)
        var final = []
        var symbolsSinceLastBar = 0
        abc[0].lines.forEach(function(line, lineNumber) {
            //console.log(lineNumber, line)
            line.staff[0].voices.forEach(function(symbols, voiceNumber) {
               symbols.forEach(function(symbol,symbolNumber) {
                   //console.log(symbol)
                   var originalString = abcString && abcString.length >= symbol.startChar && abcString.length > symbol.endChar ? abcString.slice(symbol.startChar,symbol.endChar + 1) : ''
                   var trailingSpace = originalString.endsWith(' ')
                   if (symbol.el_type === 'note') {
                        symbolsSinceLastBar++
                        var note = ''
                        if (symbol.pitches && symbol.pitches.length > 1 && symbol.duration > 0) {
                            note = '[' + symbol.pitches.map(function(pitch) { return pitch.name}).join('') + ']' +  durationToNoteLength(symbol.duration, noteLength)
                        } else if (symbol.pitches && symbol.pitches.length === 1 && symbol.duration > 0) {
                            note = pitchToNote(symbol.pitches[0], symbol.duration, noteLength)
                        } else if (symbol.rest && symbol.rest.type === 'rest' && symbol.duration > 0) {
                            note = 'z' + durationToNoteLength(symbol.duration, noteLength)
                        } else if (symbol.rest && symbol.rest.type === 'spacer') {
                            note = 'y' + (trailingSpace ? ' ' : '')
                        }
                        if (Array.isArray(symbol.decoration) && symbol.decoration.length > 0) {
                            symbol.decoration.reverse().forEach(function(decoration) {
                               note = lookupDecoration(decoration) + note  
                            })
                        }
                        if (symbol.startTriplet > 0) {
                            note = "(" + String(symbol.startTriplet) + note
                        }
                        if (Array.isArray(symbol.gracenotes) && symbol.gracenotes.length > 0) {
                            note = "{" + symbol.gracenotes.map(function(note) {
                                    if (note.acciaccatura) {
                                        return "/" + note.name
                                    } else {
                                        return note.name
                                    }
                                }).join("") + "}" + note
                            
                        }
                        if (Array.isArray(symbol.chord) && symbol.chord.length > 0) {
                            note = '"' +symbol.chord.map(function(chord) {
                                    return  chord.name.replace("♭","b").replace("♯","#")
                                }).join(" ").trim()  + '"' +  note
                        }
                        if (trailingSpace) {// && note.length > 0) {
                            note = note + ' '
                        }
                        if (note.length > 0) {
                            //console.log("NOTE",note, lineNumber)
                            final.push({note: note, lineNumber: lineNumber})
                        } 
                   }  else if (symbol.el_type === "tempo")  {
                       var note = '[Q:' + symbol.bpm + "]" + (trailingSpace ? ' ' : '')
                       final.push({note: note, lineNumber: lineNumber})
                   }  else if (symbol.el_type === "keySignature")  {
                       var note = '[K:' + symbol.root + "]" + (trailingSpace ? ' ' : '')
                       final.push({note: note, lineNumber: lineNumber})
                   }  else if (symbol.el_type === "timeSignature")  {
                       var note = '[M:' + symbol.value[0].num + "/" + symbol.value[0].den + "]" + (trailingSpace ? ' ' : '')
                       final.push({note: note, lineNumber: lineNumber})
                   }  else if (symbol.el_type === "part" && symbol.title && symbol.title.length > 0)  {
                       var note = '[P:' + symbol.title + "]" + (trailingSpace ? ' ' : '')
                       final.push({note: note, lineNumber: lineNumber})
                   } else if (symbol.el_type === 'bar') {
                       //console.log("BAR")
                       symbolsSinceLastBar = 0
                       if (symbol.type === 'bar_thin') {
                           var note = "|" + (trailingSpace ? ' ' : '')
                           final.push({note: note, lineNumber: lineNumber})
                       } else if (symbol.type === 'bar_thin_thin') {
                           var note = "||" + (trailingSpace ? ' ' : '')
                           final.push({note: note, lineNumber: lineNumber})
                       } else if (symbol.type === 'bar_thin_thick') {
                           var note = "|]" + (trailingSpace ? ' ' : '')
                           final.push({note: note, lineNumber: lineNumber})
                       } else if (symbol.type === 'bar_thick_thin') {
                           var note = "[|" + (trailingSpace ? ' ' : '')
                           final.push({note: note, lineNumber: lineNumber})
                       } else if (symbol.type === 'bar_left_repeat') {
                           var note = "|:" + (trailingSpace ? ' ' : '')
                           final.push({note: note, lineNumber: lineNumber})
                       } else if (symbol.type === 'bar_right_repeat') {
                           var note = ":|" + (trailingSpace ? ' ' : '')
                           final.push({note: note, lineNumber: lineNumber})
                       }
                       if (symbol.startEnding > 0)  {
                           var em = (symbolsSinceLastBar > 0 ? "[" : '') +String(symbol.startEnding)
                           final.push({note: em, lineNumber: lineNumber})
                       }
                    }
                })
            })
        }) 
        //console.log(final)
        var lastLineNumber = 0
        return final.map(function(noteData) {
            if (noteData.lineNumber != lastLineNumber) {
                lastLineNumber = noteData.lineNumber
                return "\n" + noteData.note
            } else {
                return noteData.note
            }
        }).join("")
    }
   
        
    function renderChords(abcString, showDots=true) {
        var noteLength = getNoteLength(abcString)
        var barSize = abcTools.getNoteLengthsPerBar(abcTools.abc2json(abcString))
        var meter = getMeter(abcString)
        //console.log("render chords",noteLength,barSize, meter)
        var abc = parse(abcString)
        //console.log(abc[0].lines[0].staff[0].voices, abcString)
        var final = []
        var noteLengthsSinceLastBar = 0
        abc[0].lines.forEach(function(line, lineNumber) {
            //line.staff[0].voices.forEach(function(symbols, voiceNumber) {
                var symbols = line.staff[0].voices[0]
                //console.log(lineNumber,symbols)
                var barLayout = []
                for (var i=0; i < barSize; i++) {
                    barLayout[i] = []
                }
                // iterate symbols mapping to barLayout
                // for each symbol if there is a chord attached, assign it to the closest noteLength in barLayout
                // if the symbol is a bar
                var lastSymbol = null
                symbols.forEach(function(symbol,symbolNumber) {
                   lastSymbol = symbol
                   if (symbol.el_type === 'note') {
                        // assign note to bar layout
                        var chord = ''
                        if (Array.isArray(symbol.chord) && symbol.chord.length > 0) {
                            chord = symbol.chord.reverse().map(function(chord) {
                                return chord.name.replace("♭","b").replace("♯","#")
                            }).join("").trim()
                            var assignChordToBeat = parseInt(noteLengthsSinceLastBar / noteLength)
                            if (assignChordToBeat <= barSize && Array.isArray(barLayout.at(assignChordToBeat))) {
                                var current = Array.isArray(barLayout.at(assignChordToBeat)) ? barLayout.at(assignChordToBeat) : []
                                current.push(chord.trim())
                                barLayout.splice(assignChordToBeat,1,current)
                            }
                        }
                        if (symbol.duration > 0) {
                            noteLengthsSinceLastBar = noteLengthsSinceLastBar + symbol.duration
                        }
                   } else if (symbol.el_type === 'bar') {
                       noteLengthsSinceLastBar = 0
                       // write bar to final array
                       var maxLength = 0
                       for (var i=0; i < barSize; i++) {
                            if (Array.isArray(barLayout[i]) && barLayout[i].length > maxLength) {
                                maxLength = barLayout[i].length
                            }
                       }
                       for (var i=0; i < barSize; i++) {
                            if (Array.isArray(barLayout[i]) && barLayout[i].length > 0) {
                                final.push(barLayout[i].join(' ').trim())
                                var extraDots = maxLength - barLayout[i].length
                                for (var j=0; j< extraDots; j++) {
                                    if (showDots) final.push(".")
                                    //else final.push(" ")
                                }
                            } else {
                                for (var j=0; j< maxLength; j++) {
                                    if (showDots) final.push(".")
                                    //else final.push(" ")
                                }
                            }
                       }
                       final.push("|")
                       if (symbol.type === 'bar_thin_thin') {
                           final.push("\n" )
                       }
                       // clear barLayout
                       barLayout = []
                        for (var i=0; i < barSize; i++) {
                            barLayout.push([])
                        }
                        
                    }
                })
                if (lastSymbol.el_type !== 'bar') {
                    noteLengthsSinceLastBar = 0
                       // write bar to final array
                       var maxLength = 0
                       for (var i=0; i < barSize; i++) {
                            if (Array.isArray(barLayout[i]) && barLayout[i].length > maxLength) {
                                maxLength = barLayout[i].length
                            }
                       }
                       for (var i=0; i < barSize; i++) {
                            if (Array.isArray(barLayout[i]) && barLayout[i].length > 0) {
                                final.push(barLayout[i].join(' ').trim())
                                var extraDots = maxLength - barLayout[i].length
                                for (var j=0; j< extraDots; j++) {
                                    if (showDots) final.push(".")
                                    //else final.push(" ")
                                }
                            } else {
                                for (var j=0; j< maxLength; j++) {
                                    if (showDots) final.push(".")
                                    //else final.push(" ")
                                }
                            }
                       }
                       final.push("|")
                       if (lastSymbol.type === 'bar_thin_thin') {
                           final.push("\n" )
                       }
                }
                final.push("\n")
            //})
            
        }) 
        //console.log(final)
        return final.join(' ').replaceAll("\n ","\n")
    }
    
    function parse(abc) {
        return abcjs.renderAbc("*", abc)
    }
    
    
    function parseChordText(chordText, abcString) {
        var noteLengthsPerBar = abcTools.getNoteLengthsPerBar(abcTools.abc2json(abcString)) 
        var result = []
        var lines = chordText.split("\n")
        lines.forEach(function(line,lineNumber) {
          if (!Array.isArray(result[lineNumber])) result[lineNumber] = []
          var bars = line.trim().split("|")
          bars.forEach(function(bar,bk) {
              if (typeof bar === 'string' && bar.trim()) {
                // cull empties
                var barChords = bar.trim().split(" ").filter(function(val) {if (!val || !val.trim()) return false; else return true})
                // distribute provided symbols over beats
                var newChords = {} //new Array(noteLengthsPerBar)
                barChords.forEach(function(barToken, barTokenKey) {
                    var position = (barTokenKey/barChords.length) * noteLengthsPerBar
                    if (barChords[barTokenKey].replaceAll('.','').trim().length !== 0)  {
                        if (!Array.isArray(newChords[position])) {
                            newChords[position] = []
                        }  
                        //if (newChords[position].length > 0) newChords[position].push(' ')
                        newChords[position].push(barChords[barTokenKey])  
                    }
                })
              
                result[lineNumber][bk] = newChords
              }
          })
        })
        console.log('CHORDTEXT',result)
        return result
    }
    
    
    function  mergeChords(chordText, abcString) {
        var chordLayout = parseChordText(abcTools.justNotes(chordText))
        var abc = parse(abcString)
        var noteLength = getNoteLength(abcString)
        var barSize = abcTools.getNoteLengthsPerBar(abcTools.abc2json(abcString))
        var meter = getMeter(abcString)
        var final = []
        var noteLengthsSinceLastBar = 0
        console.log("meRGE",chordLayout,abc)
        var barIndex = {}
        // iterate parsed note and bar lines to create lookups 
        abc[0].lines.forEach(function(line,lineNumber) {
            var barCount = 0
            var barTally = 0
            line.staff[0].voices[0].forEach(function(symbol, symbolNumber) {
                var indexKey = lineNumber + "-" + barCount + '-' + barTally
                //console.log(indexKey, symbol, symbol.el_type)
                if (!Array.isArray(barIndex[indexKey])) barIndex[indexKey] = []
                if (symbol.el_type === 'note') {
                    barIndex[indexKey].push(symbolNumber)
                    if (symbol.duration > 0) barTally = barTally + (symbol.duration/noteLength)
                    //console.log('UPDDUR',barTally)
                } else if (symbol.el_type === 'bar') {
                    barCount++
                    barTally = 0
                    //console.log('UPDtally',barCount)
                }
                // clear chords
                abc[0].lines[lineNumber].staff[0].voices[0][symbolNumber].chord = []
            })
        })
        console.log("BARIND",barIndex, chordLayout)    
        
        // ensure the correct number of lines
        var parsedLength = abc[0].lines.length
        var counter = 0
        var lineNewLines = {}
        var chordLinesNotEmpty = chordLayout.filter(function(a) {
            if (a.length > 0) {
                counter++
                return true
            } else {
                if (counter > 0) lineNewLines[counter - 1] = true
                return false
            }
        })
        var chordLength = chordLinesNotEmpty.length
        console.log("LENGS",lineNewLines,chordLength, parsedLength)    
        if (chordLength > parsedLength) {
            // create lines
            for (var i = 0; i < (chordLength - parsedLength); i++) {
                var restLine = []
                var barsToCreate = chordLinesNotEmpty[parsedLength + i].length
                for (var k = 0; k < barsToCreate; k++) {
                    var restChord = chordLinesNotEmpty[parsedLength + i][k]
                    for (var j = 0; j< barSize; j++) {
                        var r = {rest: {type:'rest'}, el_type:'note', duration: noteLength}
                        if (restChord[j]) r.chord = restChord[j].map(function(c) {return {name: c}})
                        //console.log("RRRR",restChord,r)
                        restLine.push(r)
                    }
                    restLine.push(lineNewLines[parsedLength + i] ? {type:'bar_thin_thin', el_type:'bar'} : {type:'bar_thin', el_type:'bar'})
                }
                
                //var totalBars = 0
                //var totalRests = 0
                //for var
                //console.log('push line',chordLength > parsedLength)
                abc[0].lines.push({staff:[{voices:[restLine]}]})
            }
        } else if (chordLength < parsedLength) {
            // chop lines
            console.log('chops lines',parsedLength - chordLength)
            abc[0].lines = abc[0].lines.slice(0,chordLength)
        }
        
        // ensure correct bar lengths and line endings
        abc[0].lines.forEach(function(line, lineNumber) {
            var barCount = 0
            var lastSymbol = null
            var lastSymbolNumber = null
            var symbols = line.staff[0].voices[0]
            var barEnds = {}
            symbols.forEach(function(symbol, symbolNumber) {
                if (symbol.el_type === "bar") {
                    barEnds[barCount] = symbolNumber
                    barCount++
                }
                lastSymbol = symbol
                lastSymbolNumber = symbolNumber
            })
            
            // add bar line to lines without closing bar
            if (lastSymbol.el_type !== 'bar') {
                barCount++
                // append rests and bar line to 
                abc[0].lines[lineNumber].staff[0].voices[0].push(lineNewLines[lineNumber] ? {type:'bar_thin_thin', el_type:'bar'} : {type:'bar_thin', el_type:'bar'})
            } else {
                // if lineNewLine force double bar
                var barLine = abc[0].lines[lineNumber].staff[0].voices[0][lastSymbolNumber]
                console.log("FIRCECDIB",barLine,lastSymbolNumber, lastSymbol)
                barLine.type = lineNewLines[lineNumber] ? 'bar_thin_thin' : 'bar_thin'
                abc[0].lines[lineNumber].staff[0].voices[0].splice(lastSymbolNumber,1,barLine)
                //push(lineNewLines[lineNumber] ? {type:'bar_thin_thin', el_type:'bar'} : {type:'bar_thin', el_type:'bar'})
                //}
            }
            var barsInChordText = chordLinesNotEmpty[lineNumber].length
            var barCountDiff = barsInChordText - barCount
            if (barCountDiff > 0) {
                // add bars
                console.log('add bars',barCountDiff,parsedLength,chordLinesNotEmpty)
                for (var k = 0; k < barCountDiff; k++) {
                    var restChord = chordLinesNotEmpty[lineNumber][k]
                    for (var j = 0; j< barSize; j++) {
                        var r = {rest: {type:'rest'}, el_type:'note', duration: noteLength}
                        if (restChord[j]) r.chord = restChord[j].map(function(c) {return {name: c}})
                        abc[0].lines[lineNumber].staff[0].voices[0].push(r)
                    }
                    abc[0].lines[lineNumber].staff[0].voices[0].push(lineNewLines[lineNumber] ? {type:'bar_thin_thin', el_type:'bar'} : {type:'bar_thin', el_type:'bar'})
                }
                //var totalBars = 0
                //var totalRests = 0
                //for var
                //console.log('push line',chordLength > parsedLength)
                //abc[0].lines.push({staff:[{voices:[restLine]}]})
            } else if (barCountDiff < 0) {
                // remove bars
                var removeBarsAfter = barCount + barCountDiff - 1
                var barLineIndex = barEnds[removeBarsAfter] + 1
                console.log('remove bars',barCountDiff, removeBarsAfter, barLineIndex )
                abc[0].lines[lineNumber].staff[0].voices[0] = abc[0].lines[lineNumber].staff[0].voices[0].slice(0,barLineIndex) 
                console.log('removed bars',abc[0].lines[lineNumber].staff[0].voices[0])
            }
        })
        
        //console.log(abc[0])
        
        var lineCount = 0        
        // iterate incoming chords assigning to parsed abc 
        chordLayout.forEach(function(line,lineNumber) {
            //var addNewLine = false
            //console.log(lineNumber,line)
            
            line.forEach(function(bar,barNumber) {
                var lastSymbolNumber = null
                Object.keys(bar).sort(function(a,b) {return (parseFloat(a) < parseFloat(b) ? -1 : 1) }).forEach(function(barKey, barCount) {
                    var chords = bar[barKey]
                    var key = lineCount + "-" + barNumber + "-" + barKey
                    //console.log(key,chords)
                    if (barIndex.hasOwnProperty(key) && barIndex[key] && barIndex[key].length > 0) {
                        console.log('note exists at correct time ' + barKey)
                        var firstNoteSymbolNumber = barIndex[key][0]
                        lastSymbolNumber = firstNoteSymbolNumber
                        abc[0].lines[lineCount].staff[0].voices[0][firstNoteSymbolNumber].chord = chords.reverse().map(function(c) {
                          return {name: c}  
                        })
                    } else {
                        console.log('NO note exists at correct time ' + barKey)
                        //var akey = lineCount + "-" + barNumber + "-" + Math.floor(barKey * 2) / 2
                        if (lastSymbolNumber !== null) {
                            //barIndex.hasOwnProperty(akey) && barIndex[akey] && barIndex[akey].length > 0) {
                            //console.log('use previous note ' + barKey, akey)
                            //var firstNoteSymbolNumber = barIndex[akey][0]
                            var oldChords = abc[0].lines[lineCount].staff[0].voices[0][lastSymbolNumber].chord 
                            
                            chords.reverse().forEach(function(c) {
                              oldChords.push({name: c} )
                            })
                            abc[0].lines[lineCount].staff[0].voices[0][lastSymbolNumber].chord = oldChords
                        } else {
                            console.log('DUMP NOTE',key, barIndex, barKey) //.hasOwnProperty(akey) )
                            //if (barIndex[akey]) console.log(barIndex[akey] , barIndex[akey].length > 0)
                        }
                    }
                })  
            })
            if (line.length > 0) {
                lineCount++
            }
             //else {
                //addNewLine = true
            //}
        }) 
        
        var final = render(abc, abcString)            
        //console.log(abc,final)
        return final
    }
     
    function parseChordsAndText(chords) {
        const parseChord = chordParserFactory();
        const renderChord = chordRendererFactory({ useShortNamings: true });
        var lines = chords.replaceAll(/[(){}\[\]]/g, ' ').replaceAll("|"," | ").split("\n")
        // first by tokens
        var parsedLines = {}
        console.log(lines)
        lines.forEach(function(line, lineKey) {
            //console.log(line)
            if (line.trim().length > 0) {
                var chordTokens = []
                var textTokens = []
                var tokens = line.trim().split(' ')
                tokens.forEach(function(token) {
                     const chord = parseChord(token);
                     const chordRendered = renderChord(chord)
                     if (chordRendered !== null) {
                          console.log("CT",chordRendered)
                          chordTokens.push(chordRendered)
                     } else {
                         if (token.trim().length > 0) {
                             if (token.trim() === '|' || token.trim() === '.') {
                                 chordTokens.push(token.trim())
                             } else {
                                textTokens.push(token.trim())
                                console.log("TT",token.trim())
                             }
                         }
                     }
                })
                parsedLines[lineKey] = {chords:chordTokens, text: textTokens, line: line}
            } else {
                console.log("EMPTY")
                parsedLines[lineKey] = {chords:[], text: [], line: line} 
            }
        })
        //console.log(parsedLines)
        var lyricsLineKeys = Object.keys(parsedLines).filter(function(lineKey) {
            if (parsedLines[lineKey].text.join(' ').trim().length === 0 && parsedLines[lineKey].chords.length === 0) {
                return true
            } else if (parsedLines[lineKey].text.join(' ').trim().length > 0) {
                return true
            } else {
                return false
            }
        })
        var lyrics = lyricsLineKeys.map(function(lineKey) {
            return  parsedLines[lineKey].text.join(' ')
        }).join('\n')
        var chords = Object.keys(parsedLines).filter(function(lineKey) {
            // preserve blanks
            if (parsedLines[lineKey].text.join(' ').trim().length === 0 && parsedLines[lineKey].chords.length === 0) {
                return true
            } else if (parsedLines[lineKey].chords.length > 0) {
                return true
            } else {
                return false
            }
        }).map(function(lineKey) {
            return parsedLines[lineKey].chords.join(' ')
        }).join('\n').replaceAll("\n\n\n\n","\n")
        return {chords: chords, lyrics: lyrics}

    }
    
    function cleanupChords(val) {
        var data = parseChordsAndText(val)
        return data && data.chords ? data.chords : (val ? val : '')
    }
    
    function cleanupLyrics(val) {
           var data = parseChordsAndText(val)
           return data && data.lyrics ? data.lyrics :  ''
    }
    
    
    
    return {render,renderChords, parse, mergeChords, cleanupChords, cleanupLyrics}
}