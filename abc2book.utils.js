window.mobileAndTabletCheck = function() {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

Number.prototype.mod = function (n) {
  return ((this % n) + n) % n;
};

function shuffleArray(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

function getReviewListFromDOM() {
  var reviewList = []
  try {
    reviewList = JSON.parse($('#reviewlist').val())
  } catch {}
  //console.log('get rewwv',$('#reviewlist').val(), reviewList)
  if (!reviewList) reviewList = {}
  return reviewList
}
 
function getTuneTitles() {
    var tunes = loadLocalObject('abc2book_tunes')
    var titles = tunes ? Object.values(tunes).map(function(tune) {return tune.name}) : []
    return titles.join("\n")    
} 

//function getSearchTexts() {
    //var tunes = $("#songlist").val().split("\n")
    //var titles = tunes ? Object.values(tunes).map(function(tune) {return getTextFromSongline(tune)}) : []
    ////console.log(tunes,titles)
    //return titles.join("\n")    
//} 

function bindCopy(element,val) {
  //console.log('bindcopy',element,val)
  element.click(function() {
    //console.log('bindcopy click')
    const cb = navigator.clipboard;
    cb.writeText(val()).then(function() {
       alert('Copied!')
       
    }).catch(function(e) {
        console.log(e)
    });
  })
}
    
function removeAbcInnerStrings(abc) {
  if (abc) {
        // remove strings from abc
      abc = abc.trim()
      var next = abc.indexOf('"')
      while (next !== -1) {
        nextClose = abc.indexOf('"', next+1)
        if ((nextClose !== -1) && (nextClose > next)) {
          // strip string
          abc = abc.slice(0,next) + abc.slice(nextClose+1)
        } else {
          abc = abc.slice(0,next) + abc.slice(next + 1)
        }
        next = abc.indexOf('"')
      }
  }
  return abc
}

function getInnerStrings(abc) {
    var s = []
  if (abc) {
        // remove strings from abc
      abc = abc.trim()
      var next = abc.indexOf('"')
      while (next !== -1) {
        nextClose = abc.indexOf('"', next+1)
        if ((nextClose !== -1) && (nextClose > next)) {
          // strip string
          s.push(abc.slice(next+1,nextClose))
          abc = abc.slice(0,next) + abc.slice(nextClose+1)
        } else {
          abc = abc.slice(0,next) + abc.slice(next + 1)
        }
        next = abc.indexOf('"')
      }
  }
  return s
}



function safeString(text) {
    if (text) {
        text = text.replaceAll(" ",'_')
        text = text.replaceAll(",",'_')
        text = text.replaceAll(".",'_')
        text = text.replaceAll("[",'_')
        text = text.replaceAll("]",'_')
        text = text.replaceAll("(",'_')
        text = text.replaceAll(")",'_')
        text = text.replaceAll("?",'_')
    }
    return  text
}

function test() {
    
    //generateAbcFromTunes();
    var tb = new window.ABCJS.TuneBook($('#longabc').val())
}


/* extract key sig and rhythm from string with - seperator
 * for formatting, the rhythm key R is abused to hold key signature and rhythm
 * @return {key:'',rhythm:''}
 */
function splitKeyAndRhythm(text) {
    if (text) {
        var parts = text.split('-')
        if (parts.length ==2) {
            return {key: parts[0].trim(), rhythm: parts[1].trim()}
        } else if (parts.length ==1) {
            return {key: '', rhythm: parts[0].trim()}
        }
    }
    return {key: '', rhythm: ''}
}

function getMetaValueFromSongline(key,songline) {
    try {
        var parts = songline.split("["+key+":")
        //var isFirst = songline.indexOf(key + "]") === 0
        //isFirst || 
        if (parts.length > 1) {
            return parts[1].split("]")[0]
        } else {
            return null
        }
    } catch (e) {
        return null
    }
}
function scrollTo(id) {
    var element = document.getElementById(id);
  //console.log('scroll to '+id,element)
    var headerOffset = 60;
    var elementPosition = element.offsetTop;
    var offsetPosition = elementPosition - headerOffset;
    document.documentElement.scrollTop = offsetPosition;
    document.body.scrollTop = offsetPosition; // For Safari
}


function getTextFromSongline(songline) {
    if (!songline) return
    var last = songline.lastIndexOf(']')
    if (last !== -1) {
        return songline.slice(last + 1)
    } else {
        return songline
    }
}

function getMetaValueFromTune(key,abc) {
    try {
        var parts = abc.split("\n"+key+":")
        var isFirst = abc.indexOf(key + ":") === 0
        if (isFirst || parts.length > 1) {
            return parts[1].split("\n")[0]
        } else {
            return ''
        }
    } catch (e) {
        return ''
    }
}

function getCommentFromAbc(key,abc) {
    if (!abc) return
    var first = abc.indexOf('\n% abc-'+key)
    if (first !== -1) {
        var parts = abc.slice(first + 8 + key.length).split("\n")
        return parts[0]
    } else {
        return null
    }
}

function getAliasesFromAbc(abc) {
    if (!abc) return
    var aliases=[]
    var first = abc.indexOf('N: AKA:')
    while (first !== -1) {
        var parts = abc.slice(first + 7).split("\n")
        var aliasParts = parts[0].split(",")
        aliasParts.forEach(function(aliasPart) {
          aliases.push(aliasPart)
        })
        first = abc.indexOf('N: AKA:', first + 1)
    } 
    return aliases
}

function timeSignatureFromTuneType(type) {
  var types = {
    'jig': '6/8',
    'reel':  '4/4',
    'slip jig':  '9/8',
    'hornpipe':  '4/4',
    'polka':  '2/4',
    'slide':  '12/8',
    'waltz':  '3/4',
    'barndance':  '4/4',
    'strathspey':  '4/4',
    'three-two':  '3/2',
    'mazurka':  '3/4'
  }
  if (types.hasOwnProperty(type)) {
    return types[type]
  } else {
    return ''
  }
}


function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function printPage() {
  filterMusicList('')
  $('#musicsearchfilter').val()
  $('#indexes').show()
  $('#music').show()
  $('#cheatsheet_music_container').show()
  $('#songlistmanager').show()
  window.print()
}
function showTuneControls() {
    $("#stopbutton").hide()
    $("#generatebutton").show()
    $('#downloadbutton').show()
    $('#printbutton').show()
    $('#cheatsheetbutton').show()
    $('#indexbutton').show()
    $('#playallbutton').show()
    $('#tempo').show()
}
function hideTuneControls() {
    $("#generatebutton").hide()
    $('#downloadbutton').hide()
    $('#printbutton').hide()
    $('#cheatsheetbutton').hide()
    $('#indexbutton').hide()
    $('#playallbutton').hide()
    $('#tempo').hide()
}

function showContentSection(contentId) {
    var contentTypes = ['cheatsheet_music_container','indexes','music','help','review','edit','songlistmanager','welcometext','longabcwrapper']
    if (contentId === 'review') {
      $('#reviewbuttons').show()
    } else {
      $('#reviewbuttons').hide()
    }
    $("#reviewbuttons").hide()
    $('#buttonblock').show()
    $('.playblock').show()
    if (contentId === 'music') {
      $('#musiclistbuttons').show()
    } else {
      $('#musiclistbuttons').hide()
    }
    
    if (contentId == 'home') {
         contentTypes.map(function(type) {
            $("#"+type).hide()
         })
         $('#musiclistbuttons').show()
         //$('#helptext').show()
        // $('#songlistbutton').show()
         $('#errors').show()
         $("#music").show()
         //$("#welcometext").show()
         scrollTo('topofpage')
    } else {
        
             
        contentTypes.map(function(type) {
          if (contentId !== type) {
              $("#"+type).hide()
          } else {
              $("#"+type).show()
          }  
        })
        //$('#helptext').hide()
        //$('#songlistbutton').hide()
        $('#errors').hide()
       // $('#songlistmanager').hide()
        scrollTo('topofpage')
    }
    
}

/**
 * Set flag to stop rendering lookups.
 */

function setStopNow(val) {
   $("#stopbuttonvalue").val("true")
   $("#stopbutton").hide()
}


function downloadLongAbc() {
  download('tunebook.abc', $("#longabc").val())
}

function downloadShortAbc() {
  download('tunebook_cheatsheet.abc', $("#shortabc").val())
}

function isChord(chord) {
  var chordMatches = [
      'A','B','C','D','E','F','G',  
      'Am','Bm','Cm','Dm','Em','Fm','Gm',
      'Amin','Bmin','Cmin','Dmin','Emin','Fmin','Gmin',
      'Amaj','Bmaj','Cmaj','Dmaj','Emaj','Fmaj','Gmaj',
      'Adim','Bdim','Cdim','Ddim','Edim','Fdim','Gdim',
      'Aaug','Baug','Caug','Daug','Eaug','Faug','Gaug',
      'Asus','Bsus','Csus','Dsus','Esus','Fsus','Gsus',
      'A7','B7','C7','D7','E7','F7','G7',
      'A9','B9','C9','D9','E9','F9','G9',
      
      'Ab','Bb','Cb','Db','Eb','Fb','Gb',  
      'Abm','Bbm','Cbm','Dbm','Ebm','Fbm','Gbm',
      'Abmin','Bbmin','Cbmin','Dbmin','Ebmin','Fbmin','Gbmin',
      'Abmaj','Bbmaj','Cbmaj','Dbmaj','Ebmaj','Fbmaj','Gbmaj',
      'Abdim','Bbdim','Cbdim','Dbdim','Ebdim','Fbdim','Gbdim',
      'Abaug','Bbaug','Cbaug','Dbaug','Ebaug','Fbaug','Gbaug',
      'Absus','Bbsus','Cbsus','Dbsus','Ebsus','Fbsus','Gbsus',
      'Ab7','Bb7','Cb7','Db7','Eb7','Fb7','Gb7',
      'Ab9','Bb9','Cb9','Db9','Eb9','Fb9','Gb9',
      
      'A#','B#','C#','D#','E#','F#','G#',  
      'A#m','B#m','C#m','D#m','E#m','F#m','G#m',
      'A#min','B#min','C#min','D#min','E#min','F#min','G#min',
      'A#maj','B#maj','C#maj','D#maj','E#maj','F#maj','G#maj',
      'A#dim','B#dim','C#dim','D#dim','E#dim','F#dim','G#dim',
      'A#aug','B#aug','C#aug','D#aug','E#aug','F#aug','G#aug',
      'A#sus','B#sus','C#sus','D#sus','E#sus','F#sus','G#sus',
      'A#7','B#7','C#7','D#7','E#7','F#7','G#7',
      'A#9','B#9','C#9','D#9','E#9','F#9','G#9'
  ]
  return chordMatches.indexOf(chord.trim()) !== -1
}

function progressUp(songNumber) {
    var tunes = loadLocalObject('abc2book_tunes')
    if (tunes.length > songNumber && tunes[songNumber]) {
      var tune = tunes[songNumber]
      var boost = tune.boost
      boost = boost > 0 ? boost : 0
      var newBoost = boost + 1
      tune.boost = newBoost
      tunes[songNumber] = tune
      saveLocalObject('abc2book_tunes',tunes)
      $('#tune_boost_'+songNumber).text(newBoost)
    }
}

function progressDown(songNumber) {
    var tunes = loadLocalObject('abc2book_tunes')
    if (tunes.length > songNumber && tunes[songNumber]) {
      var tune = tunes[songNumber]
      var boost = tune.boost
      boost = boost > 0 ? boost : 0
      var newBoost = boost - 1
      tune.boost = newBoost
      tunes[songNumber] = tune
      saveLocalObject('abc2book_tunes',tunes)
      $('#tune_boost_'+songNumber).text(newBoost)
    }
}

function parseAbc() {
  var abc = $('#longabc').val()
  var tuneBook = new ABCJS.TuneBook(abc)
  var measureArray = ABCJS.extractMeasures(abc);
  var tunes = []
  tuneBook.tunes.map(function(tune,k) {
    tune.measures = measureArray[k].measures
    tune.hasPickup = measureArray[k].hasPickup
    tune.meta = extractAbcMeta(tune.abc)
    tunes.push(tune)
    return true
  })
  //console.log('parsed',tunes)
  return tunes
}

function extractAbcMeta(abc) {
  var parts = abc.split("\n")
  var meta = {}
  var tune = []
  parts.map(function(part) {
    if (part[1] === ":" && part[0] !== "|" ) {
       meta[part[0]] = part.slice(2)
    } else {
      tune.push(part)
    }
  })
  meta.cleanAbc = tune.join("\n")
  return meta
  
}
/*
function parseMeasures() {
  
}


function isMusicalNote() {
  case
}

*/
