$(document).ready(function() {
  let g_typer_data_index = 0;
  let g_typer_string_index = 0;
  const ascii_textarea = document.querySelector('#ascii');
  const hex_textarea = document.querySelector('#hex');
  const base64_textarea = document.querySelector('#base64');
  const urlencoded_textarea = document.querySelector('#url-encoded');
  const format_selector = document.querySelector('#hex-format');

  function userOnPhone() {
    return (navigator.maxTouchPoints > 0);
  }

  function asciiToHex(str) {
    let result = '';
    for (let i = 0; i < str.length; i++) {
      result += str.charCodeAt(i).toString(16) + ' ';
    }
    return result.trim();
  }

  function asciiToCppHex(str) {
    let hex = asciiToHex(str);
    const bytes = hex.split(' ').map((byte) => '0x' + byte);
    const jopa = bytes.join(', ').trim();
    hex = `const unsigned char data[${bytes.length}] = \{${jopa}\};`
    return hex;
  }

  function hexToAscii(hexstr)
  {
    let result = '';
    let bytes = hexstr.trim().split(' ');
    bytes.forEach((byte) => {
      if (byte.length === 0)
        return;
      if (byte.length === 1)
        byte = 0 + byte;

      const char_code = parseInt(byte, 16);
      // if (char_code < 21 || char_code > 126)
      //   return;
      result += String.fromCharCode(char_code);
    });
    return result;
  }

  function asciiToBase64(str) {
    return btoa(encodeURIComponent(str));
  }

  function asciiToUrlEncoded(str) {
    return encodeURIComponent(str).replaceAll('%20', '+').replaceAll('!', '%21').replaceAll('~', '%7E').replaceAll('*', '%2A').replaceAll('\'', '%27').replaceAll('(', '%28').replaceAll(')', '%29');
  }

  function base64ToAscii(base64) {
    let result = '';
    base64_textarea.classList.remove('window-invalid');
    try {
      result = decodeURIComponent(atob(base64));
    } catch(ex) {
      base64_textarea.classList.add('window-invalid');
      console.error('base64ToAscii thrown an exception: ', ex);
    }
    return result;
  }

  function urlEncodedToAscii(encoded) {
    return decodeURIComponent(encoded);
  }
  function cppHexToAscii(hexstr, s_bracket_index, e_bracket_index){
    const result = hexstr.substring(s_bracket_index + 1, e_bracket_index).replaceAll('0x', '')
        .replaceAll(', ',' ');

    return hexToAscii(result);
  }

  function processClipboardPaste(e) {
    let data = (e.originalEvent.clipboardData || window.clipboardData).getData('text');
  }

  function generateRandomString(length) {
    //add extra symbols
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

  //gallery init
  $("#nanoshowcase").nanogallery2({
    galleryTheme: {
      navigationBreadcrumb: {background: '#ff9aff', color: '#000', colorHover: '#333', borderRadius: '4px'},
      thumbnail: {
        titleShadow: 'none',
        descriptionShadow: 'none',
        titleColor: '#0bf4f3',
        background: '#000',
        labelBackground: 'rgba(0,0,0,.75)'
      }
    },
    thumbnailDisplayOutsideScreen: true,
    thumbnailToolbarImage: null,
    thumbnailL1Label: {display: true, position: 'center', valign: 'bottom', align: 'center', background: '#ff9aff'},
    thumbnailLabel: {display: false},

    items: [
      // cinema
      {src: '/assets/img/showcase/cinema/1.jpg', title: 'TutKino.OnLine', ID: 1, kind: 'album'},
      {src: '/assets/img/showcase/cinema/1.jpg', ID: 10, albumID: 1},
      {src: '/assets/img/showcase/cinema/2.jpg', ID: 11, albumID: 1},
      {src: '/assets/img/showcase/cinema/3.jpg', ID: 12, albumID: 1},
      {src: '/assets/img/showcase/cinema/4.jpg', ID: 13, albumID: 1},
      {src: '/assets/img/showcase/cinema/5.jpg', ID: 14, albumID: 1},
      {src: '/assets/img/showcase/cinema/6.jpg', ID: 15, albumID: 1},
      {src: '/assets/img/showcase/cinema/7.jpg', ID: 16, albumID: 1},
      // service
      {src: '/assets/img/showcase/service/1.jpg', title: 'Service-pro.kz', ID: 2, kind: 'album'},
      {src: '/assets/img/showcase/service/1.jpg', ID: 20, albumID: 2},
      {src: '/assets/img/showcase/service/2.jpg', ID: 21, albumID: 2},
      {src: '/assets/img/showcase/service/3.jpg', ID: 22, albumID: 2},
      {src: '/assets/img/showcase/service/4.jpg', ID: 23, albumID: 2},
      {src: '/assets/img/showcase/service/5.jpg', ID: 24, albumID: 2},
      {src: '/assets/img/showcase/service/6.jpg', ID: 24, albumID: 2},
      // store
      {src: '/assets/img/showcase/store/1.jpg', title: 'gabengames.com', ID: 3, kind: 'album'},
      {src: '/assets/img/showcase/store/1.jpg', ID: 30, albumID: 3},
      {src: '/assets/img/showcase/store/2.jpg', ID: 31, albumID: 3},
      {src: '/assets/img/showcase/store/3.jpg', ID: 32, albumID: 3},
      {src: '/assets/img/showcase/store/4.jpg', ID: 33, albumID: 3},
      {src: '/assets/img/showcase/store/5.jpg', ID: 34, albumID: 3},
      {src: '/assets/img/showcase/store/6.jpg', ID: 35, albumID: 3},
      {src: '/assets/img/showcase/store/7.jpg', ID: 36, albumID: 3},
      {src: '/assets/img/showcase/store/8.jpg', ID: 37, albumID: 3},
      {src: '/assets/img/showcase/store/9.jpg', ID: 38, albumID: 3},
      {src: '/assets/img/showcase/store/10.jpg', ID: 39, albumID: 3},
      {src: '/assets/img/showcase/store/11.jpg', ID: 301, albumID: 3},
      // tours
      {src: '/assets/img/showcase/tours/1.jpg', title: 'tamik4x4tours.ru', ID: 4, kind: 'album'},
      {src: '/assets/img/showcase/tours/1.jpg', ID: 40, albumID: 4},
      {src: '/assets/img/showcase/tours/2.jpg', ID: 41, albumID: 4},
      {src: '/assets/img/showcase/tours/3.jpg', ID: 42, albumID: 4}
    ]
  });

  $('textarea').on('paste', function (e) {
    processClipboardPaste(e);
    convertAsciiToAll();
  });

  function convertAsciiToAll() {
    let str = ascii_textarea.value;
    if (format_selector.value == 1) {
      hex_textarea.value = asciiToCppHex(str);
    }
    else
      hex_textarea.value = asciiToHex(str);

    base64_textarea.value = asciiToBase64(str);
    urlencoded_textarea.value = asciiToUrlEncoded(str);
  }

  ascii_textarea.addEventListener('keydown', function(e) {
    convertAsciiToAll();
  });

  format_selector.addEventListener('change', function(e) {
    let v = e.target.value;
    convertAsciiToAll();
  });

  hex_textarea.addEventListener('keydown', function(e) {
    let t = e.target;
    let v = t.value;
    if (v.length > 0) {
      t.classList.remove('window-invalid');
      if (format_selector.value == 1) {
        const s_bracket = v.indexOf('{');
        const e_bracket = v.lastIndexOf('}');
        if (s_bracket == -1 || e_bracket == -1) {
          t.classList.add('window-invalid');
          return;
        }
        ascii_textarea.value = cppHexToAscii(v, s_bracket, e_bracket);
        convertAsciiToAll();
      }
      else {
        ascii_textarea.value = hexToAscii(v);
        convertAsciiToAll();
      }
    }
  });

  base64_textarea.addEventListener('keydown', function(e) {
    ascii_textarea.value = base64ToAscii(e.target.value);
    convertAsciiToAll();
  });

  urlencoded_textarea.addEventListener('keydown', function(e) {
    ascii_textarea.value = urlEncodedToAscii(e.target.value);
    convertAsciiToAll();
  })

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
      ascii_textarea.value = generateRandomString(l);
    convertAsciiToAll();
  });

  if (userOnPhone()) {
    $('#game').hide();
  }

  typerAnimation();

});