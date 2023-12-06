//everything in js is a string tx Netscape
var g_activate_code = ['1', '3', '3', '7'];
var g_ac_ind = 0;
var g_b_tools_activated = Cookies.get('tools_activated') ? true : false;//best prefix for global variables is "//" don't choke on C++ memes
var g_typer_data_index = 0;
var g_typer_string_index = 0;

if (g_b_tools_activated) {
  $('#tools').show();
  $('.tools-placeholder').remove();
}

//sry i came from another hood
function setToolsActivated(b) { g_b_tools_activated = b; }
function getToolsActivated() { return g_b_tools_activated; }

function playHackermanAnimation() {
  $('<div class="hackerman"><span>HACKERMAN</span></div>').insertBefore('.noise');
  $('.hackerman').css({ 'display': 'block' }).animate({ opacity: 1 }, {
    step: function (now, fx) {
      $(this).css('transform', 'scale(' + now + ')');//didnt want to use fancy library to perform scaling animation
    },
    duration: 250,
    easing: "linear",
    done: function () {
      $('.hackerman').css({ 'transform': 'scale(1)', 'display': 'none' });
      $('.hackerman').remove();
    }
  });
}

//originally was made to unlock tools section, but I've decided to make it always visible due to lack of content
function activateTools() {
  g_ac_ind = 0;
  setToolsActivated('1');//huh? yeah boolean is a joke
  Cookies.set('tools_activated', true);
  playHackermanAnimation();
}

function keyLogger(e) {
  // if (getToolsActivated())
  //   return;
  let c = String.fromCharCode(e.keyCode);//in strings we trust, char is a devils work
  if (c === g_activate_code[g_ac_ind]) {
    g_ac_ind++;
    if (g_ac_ind == g_activate_code.length) { activateTools(); }
  }
}

//cf is called from
//I wasnt sure about using prototype.caller
function convertFromAscii(cf) {
  const data = $('#ascii').val();
  var hex_ta = $('#hex');
  var base64_ta = $('#base64');
  var url_ta = $('#url-encoded');
  var hex_format = $('#hex-format').val();

  if (data) {
    if (cf !== 'base64')
      base64_ta.val(btoa(unescape(encodeURIComponent(data))));

    if (cf !== 'hex') {
      let hex_data = '';
      for (let i = 0; i < data.length; i++) {
        const coded = data.charCodeAt(i);
        const codeh = coded.toString(16);
        if (hex_format === 'cpp')
          hex_data += '0x' + codeh + ', ';
        else
          hex_data += codeh + ' ';

      }
      if (hex_format === 'cpp') {
        hex_data = hex_data.substring(0, hex_data.length - 2);
        hex_data = 'const char data[' + data.length + '] = {' + hex_data + '};';
      }
      else
        hex_data = hex_data.substring(0, hex_data.length - 1);

      hex_ta.val(hex_data);
    }

    //replace all the shit encodeURIComponent doesnt convert
    //add convert modes for url convertion like full convertion in Burp, etc
    //it's kinda goofy rn
    if (cf !== 'url') {
      const url_data = encodeURIComponent(data).
        replaceAll('%20', '+').replaceAll('!', '%21').
        replaceAll('~', '%7E').replaceAll('*', '%2A').
        replaceAll('\'', '%27').replaceAll('(', '%28').replaceAll(')', '%29');
      url_ta.val(url_data);
    }
  }

}

function convertHexToAscii() {
  const hex_format = $('#hex-format').val();
  var hex_el = $('#hex');
  var hex_data = hex_el.val();
  var new_hex_data;
  var ascii_data = '';

  let hex_data_bytes;
  if (hex_data === undefined)
    return;
  if (hex_format === 'cpp') {
    //clean c++ stuff
    const o_bracket = hex_data.indexOf('{');
    const c_bracket = hex_data.lastIndexOf('}');
    if (o_bracket == -1 || c_bracket == -1) {
      $('#hex').addClass('window-invalid');
      return;
    }
    else {
      $('#hex').removeClass('window-invalid');
    }
    new_hex_data = hex_data.substring(o_bracket + 1, c_bracket);
    hex_data = new_hex_data.replaceAll('0x', '');

    hex_data_bytes = hex_data.split(',');
    new_hex_data = 'const char data[' + hex_data_bytes.length + '] = {' + new_hex_data + '};';

    for (let i = 0; i < hex_data_bytes.length; i++) {
      const byte = hex_data_bytes[i].trim();
      if (byte && byte.length == 2) {
        const char_code = parseInt(byte, 16);
        ascii_data += String.fromCharCode(char_code);
      }
      else
        return;
    }

  }
  else {
    new_hex_data = hex_data;
    hex_data_bytes = hex_data.split(' ');
    for (let i = 0; i < hex_data_bytes.length; i++) {
      const byte = hex_data_bytes[i].trim();
      if (byte && byte.length == 2) {
        const char_code = parseInt(byte, 16);
        ascii_data += String.fromCharCode(char_code);
      }
      else
        return;
    }
  }

  if (ascii_data !== '') {
    $('#ascii').val(ascii_data);
    let old_cpos = hex_el.prop('selectionStart');
    $(hex_el).val(new_hex_data);
    $(hex_el).caretTo(old_cpos);
    convertFromAscii('hex');
  }
}

function convertBase64ToAscii() {
  const base64_data = $('#base64').val();
  if (base64_data) {
    $('#base64').removeClass('window-invalid');
    try {
      let ascii_data = decodeURIComponent(escape(atob(base64_data)));
      $('#ascii').val(ascii_data);
      convertFromAscii('base64');
    }
    catch (ex) {
      $('#base64').addClass('window-invalid');
      console.error('convertBase64ToAscii thrown an exception: ', ex);
    }

  }
}

function convertUrlToAscii() {
  var url_el = $('#url-encoded');
  const url_data = $('#url-encoded').val();
  var ascii_data;
  try {
    ascii_data = decodeURIComponent(url_data);
  }
  catch (ex) {
    $(url_el).addClass('window-invalid');
    return;
  }
  $(url_el).removeClass('window-invalid');

  $('#ascii').val(ascii_data);
  convertFromAscii('url');
}


function converterFn(e) {
  var orig_field = e.target.id;
  switch (orig_field) {
    case 'ascii':
      convertFromAscii();
      break;

    case 'hex':
      convertHexToAscii();
      break;

    case 'base64':
      convertBase64ToAscii();
      break

    case 'url-encoded':
      convertUrlToAscii();
      break;
  }
}

function processClipboardPaste(e) {
  let data = (e.originalEvent.clipboardData || window.clipboardData).getData('text');
}

function generateRandomString(length) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let res = '';
  for (let i = 0; i < length; i++)
    res += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  return res;
}

function typeChar(el, c, ms) {
  return new Promise(resolve => {
    setTimeout(() => {
      el.textContent += c;
      resolve();
    }, ms);
  });
}

async function typerAnimation() {
  const data = ['HTML, CSS, Bootstrap', 'JS, Ajax, jQuery', 'PHP, Laravel', 'MySQL, SQLite', 'Linux, Github, Docker'];
  const target = $('.list-skills');

  for (let i = 0; i < data.length; i++) {
    $(target).append('<li></li>');//i wish append was returning an actual object as result
    let target_li = $(target).children('li')[i];
    const text = data[i];
    for (let j = 0; j < text.length; j++) {
      await typeChar(target_li, text.charAt(j), 50);
    }
  }
}

$(document).ready(function () {
  //gallery init
  $("#nanoshowcase").nanogallery2({
    galleryTheme: {
      navigationBreadcrumb: { background: '#ff9aff', color: '#000', colorHover: '#333', borderRadius: '4px' },
      thumbnail: { titleShadow: 'none', descriptionShadow: 'none', titleColor: '#0bf4f3', background: '#000', labelBackground: 'rgba(0,0,0,.75)' }
    },

    thumbnailToolbarImage: null,
    thumbnailL1Label: { display: true, position: 'center', valign: 'bottom', align: 'center', background: '#ff9aff' },
    thumbnailLabel: { display: false },

    items: [
      // cinema
      { src: 'https://cdn.discordapp.com/attachments/893045779332222996/1182011120404414704/1.png', title: 'Cinema', ID: 1, kind: 'album' },
      { src: 'https://cdn.discordapp.com/attachments/893045779332222996/1182011120404414704/1.png', ID: 10, albumID: 1 },
      { src: 'https://cdn.discordapp.com/attachments/893045779332222996/1182011120882569236/2.png', ID: 11, albumID: 1 },
      { src: 'https://cdn.discordapp.com/attachments/893045779332222996/1182011121373298688/3.png', ID: 12, albumID: 1 },
      { src: 'https://cdn.discordapp.com/attachments/893045779332222996/1182011121872408676/4.png', ID: 13, albumID: 1 },
      { src: 'https://cdn.discordapp.com/attachments/893045779332222996/1182011122514153642/5.png', ID: 14, albumID: 1 },
      { src: 'https://cdn.discordapp.com/attachments/893045779332222996/1182011122988105758/6.png', ID: 15, albumID: 1 },
      { src: 'https://cdn.discordapp.com/attachments/893045779332222996/1182011123399151696/7.png', ID: 16, albumID: 1 },
      // service
      { src: 'https://cdn.discordapp.com/attachments/893045779332222996/1182012203071713340/1.png', title: 'Service', ID: 2, kind: 'album' },
      { src: 'https://cdn.discordapp.com/attachments/893045779332222996/1182012203071713340/1.png', ID: 20, albumID: 2 },
      { src: 'https://cdn.discordapp.com/attachments/893045779332222996/1182012203658920066/2.png', ID: 21, albumID: 2 },
      { src: 'https://cdn.discordapp.com/attachments/893045779332222996/1182012204069965854/3.png', ID: 22, albumID: 2 },
      { src: 'https://cdn.discordapp.com/attachments/893045779332222996/1182012204397113344/4.png', ID: 23, albumID: 2 },
      { src: 'https://cdn.discordapp.com/attachments/893045779332222996/1182012204720078858/5.png', ID: 24, albumID: 2 },
      { src: 'https://cdn.discordapp.com/attachments/893045779332222996/1182012205105958992/6.png', ID: 24, albumID: 2 },
      // store
      { src: 'https://cdn.discordapp.com/attachments/893045779332222996/1182012756891811911/1.png', title: 'Store', ID: 3, kind: 'album' },
      { src: 'https://cdn.discordapp.com/attachments/893045779332222996/1182012756891811911/1.png', ID: 30, albumID: 3 },
      { src: 'https://cdn.discordapp.com/attachments/893045779332222996/1182012757520945152/2.png', ID: 31, albumID: 3 },
      { src: 'https://cdn.discordapp.com/attachments/893045779332222996/1182012757877465281/3.png', ID: 32, albumID: 3 },
      { src: 'https://cdn.discordapp.com/attachments/893045779332222996/1182012758355623987/4.png', ID: 33, albumID: 3 },
      { src: 'https://cdn.discordapp.com/attachments/893045779332222996/1182012758905065563/5.png', ID: 34, albumID: 3 },
      { src: 'https://cdn.discordapp.com/attachments/893045779332222996/1182012759437746238/6.png', ID: 35, albumID: 3 },
      { src: 'https://cdn.discordapp.com/attachments/893045779332222996/1182012759752327218/7.png', ID: 36, albumID: 3 },
      { src: 'https://cdn.discordapp.com/attachments/893045779332222996/1182012760205299753/8.png', ID: 37, albumID: 3 },
      { src: 'https://cdn.discordapp.com/attachments/893045779332222996/1182012760566013962/9.png', ID: 38, albumID: 3 },
      { src: 'https://cdn.discordapp.com/attachments/893045779332222996/1182012760981258260/10.png', ID: 39, albumID: 3 },
      { src: 'https://cdn.discordapp.com/attachments/893045779332222996/1182012777112543322/11.png', ID: 301, albumID: 3 },
      // tours
      { src: 'https://cdn.discordapp.com/attachments/893045779332222996/1182013444749271160/1.png', title: 'Tours', ID: 4, kind: 'album' },
      { src: 'https://cdn.discordapp.com/attachments/893045779332222996/1182013444749271160/1.png', ID: 40, albumID: 4 },
      { src: 'https://cdn.discordapp.com/attachments/893045779332222996/1182013445323903076/2.png', ID: 41, albumID: 4 },
      { src: 'https://cdn.discordapp.com/attachments/893045779332222996/1182013446015946903/3.png', ID: 42, albumID: 4 }
    ]
  });
  //init some other stuff
  $(document).on('keypress', function (e) { keyLogger(e); });
  $('textarea').on('keyup', function (e) { converterFn(e); });
  $('textarea').on('paste', function (e) { processClipboardPaste(e); });
  $('#hex-format').on('change', function (e) { convertFromAscii() });

  $('#random-str-length').on('keypress', function (e) {
    if (e.keyCode < 48 || e.keyCode > 57) {
      e.preventDefault();
    }
  });

  $('#random-str-length').on('input', function () {
    let val = parseInt($(this).val());
    if (val >= 4096) {
      $(this).val(4096);
    }
  });

  $('#generate-random-string').on('click', function (e) {
    const l = $('#random-str-length').val();
    if (l)
      $('#ascii').val(generateRandomString(l));
    convertFromAscii();
  });


  typerAnimation();

});
