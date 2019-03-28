//JavaScript
// global variables %{{{
var ndivx;
var ndivy;
var cellunit;
var cellwidth;
var cellheight;
var celladjust; // height/width ratio
var gridwidth; // width (without margin)
var gridheight;
var totalwidth;
var totalheight;
var marginscale;
var pngmarginscale;
var leftmargin;
var topmargin;
var rightmargin;
var bottommargin;
var ghostmarginscale;
var histwidth;
var histheight;
var histtopheight;
var histmainheight;
var histbottomheight;
var gridlinewidth;
var griddash0;
var griddash1;
var dotsize;
var borderlinewidth;
var walllinewidth;
var circlelinewidth;
var fontsize;
var circlefontsize;
var guidefontsize;
// color
var black;
var white;
var problemlinecolor;
var problemshadecolor;
var answerlinecolor;
var answershadecolor;
var opacity;
// context
var histcontext;
var bgcontext;
var gdcontext;
var mncontext;
var fgcontext;
var ovcontext;
// puzzle dependent set
var puzzletype;
var hasqdatac;
var hasqdatap;
var hasqdatan;
var hasadatac;
var hasadatav;
var hasadatah;
var gridtype;
var allowborderwall;
// history stack
var histstack;
var histpos;
// state
var qdatac;
var qdatav;
var qdatah;
var qdatap;
var qdatan;
var adatac;
var adatav;
var adatah;
var filebuffer;
var aview;
var cursorview;
var editmode;
var formfocusing;
var dragging;
var histdragging;
var timeoutid;
var focusprevstate;
var focusx;
var focusy;
var cursorx;
var cursory;
var resizepreventx;
var resizepreventy;
var button;
var isfirstwallchange;
var walleraser;
var isfirstcellchange;
var celleraser;
var dragpath;
//----------
//%}}}
const buttonid = { left: 0, right: 2 };

// functions defined in other files %{{{
var pencils;
var doublechoco;
var tentaisho;
var midloop;
var squlin;
//%}}}

// メモ %{{{
// ix,iyは左下からの座標
// 左下セルが(1,1)、右上のセルが(ndivx,ndivy)
// qdatac[ix][iy]はセル(ix,iy)の表出
// qdatav[ix][iy]はセル(ix,iy)の右の壁
// qdatah[ix][iy]はセル(ix,iy)の上の壁
// qdatap[2*ix][2*iy]はセル(ix,iy)の中央を指す
// qdatan[ix][iy]はセル(ix,iy)の右上の頂点
//----------------
// QC
//        '.': デフォルト値
//    '[num]': 数値
//        '?': 未知数
//        'c': 黒マス
//       'c?': 黒マスに未知数
//   'c[num]': 黒マスに数字
//   '.[num]': 白マスに数字
//    '[1-4]': ペンシルズの矢印
//        'o': ペンシルズの未知数
//   'o[num]': ペンシルズの数値
// QP
//   '.': デフォルト値
//   '1': 白丸
//   '2': 黒丸
// AC
//   '.': デフォルト値
//   '=': 黒マス
//   '#': 黒マスではないマス
// AV,AH:
//   '0': デフォルト値
//   '1': 壁あり
//  '-1': 道あり
//   '2': 壁と道の両方がある（対応を検討中）
//%}}}

// onload %{{{
window.onload = function(){
  'use strict';
  if( ! oae_checkminimalhtmlset() ){
    oaeerrmsg('failed: minimal HTML not satisfied OR getContext not available');
    return;
  }
  oaeinit();
  oaeinitcolor();
  oaeinitboard();
  oaeinithist();
  oaesizeadjust();
  oaeeventdef();
  oaedrawgrid();
  oaedrawhist();
  oae_setcolor();
  let str = location.search;
  if( str.length > 0 ){
    str = str.substring(1);
    oaefile_urldecode(str);
    str = location.href;
    let pos = str.indexOf('?');
    str = str.substring(0,pos);
    history.replaceState('','',str);
  }
};
//%}}}

// Histobj %{{{
function Histobj(qcin,qvin,qhin,qpin,qnin,acin,avin,ahin){
  'use strict';
  if( typeof this === 'undefined' ){
    return new Histobj(qcin,qvin,qhin,qpin,qnin,acin,avin,ahin);
  }
  this.qdatac = qcin;
  this.qdatav = qvin;
  this.qdatah = qhin;
  this.qdatap = qpin;
  this.qdatan = qnin;
  this.adatac = acin;
  this.adatav = avin;
  this.adatah = ahin;
}
//%}}}

// oae_checkminimalhtmlset %{{{
function oae_checkminimalhtmlset(){
  'use strict';
  // HTMLに最低限要求するセット
  // イベントによってここにないDOM要素にアクセスする場合はnullになる可能性を常に考慮する
  // むしろこれらをグローバル変数に入れてしまった方が合理的かも
  if( document.body === null ){
    return false;
  } else if( document.getElementById('oae') === null ){
    return false;
  } else if( document.getElementById('oaeheader') === null ){
    return false;
  } else if( document.getElementById('oaeboard') === null ){
    return false;
  } else if( document.getElementById('canvasoaehist') === null ){
    return false;
  } else if( document.getElementById('canvasoaebg') === null ){
    return false;
  } else if( document.getElementById('canvasoaegd') === null ){
    return false;
  } else if( document.getElementById('canvasoaemn') === null ){
    return false;
  } else if( document.getElementById('canvasoaefg') === null ){
    return false;
  } else if( document.getElementById('canvasoaeov') === null ){
    return false;
  } else if( document.getElementById('oaeconsolein') === null ){
    return false;
  } else if( typeof document.getElementById('canvasoaebg').getContext === 'undefined' ){
    return false;
  }
  return true;
}
//%}}}
// oaeerrmsg %{{{
function oaeerrmsg(obj){
  'use strict';
  console.log(obj);
}
//%}}}
// oaeconsolemsg %{{{
function oaeconsolemsg(str){
  'use strict';
  let obj = document.getElementById('oaeconsoleout');
  if( typeof obj === 'undefined' ){
    oaeerrmsg(str);
  } else {
    obj.innerHTML = str;
  }
}
//%}}}
// oaeconsoleclean %{{{
function oaeconsoleclean(){
  'use strict';
  let obj = document.getElementById('oaeconsoleout');
  if( typeof obj === 'undefined' ){
  } else {
    obj.innerHTML = '';
  }
}
//%}}}
// oaeclean %{{{
function oaeclean(){
  'use strict';
  oaeinitboard();
  oaeinithist();
  oaedrawgrid();
  oaedrawhist();
  oaedrawqdata();
  oaedrawadata();
  oaedrawui();
}
//%}}}
// oaeansclean %{{{
function oaeansclean(){
  'use strict';
  oaeansinitboard();
  oae_histpush();
  oaedrawgrid();
  oaedrawhist();
  oaedrawqdata();
  oaedrawadata();
  oaedrawui();
}
//%}}}
// oaeinit %{{{
function oaeinit(){
  'use strict';
  cellunit = 35;
  celladjust = 1;
  ndivx = 10;
  ndivy = 10;
  marginscale = 0.5;
  pngmarginscale = 0.3;
  ghostmarginscale = 2;
  histwidth = 50;
  histtopheight = 45;
  histbottomheight = 60;
  leftmargin = histwidth + Math.floor(marginscale * cellunit);
  topmargin = Math.floor(marginscale * cellunit);
  rightmargin = Math.floor(marginscale * cellunit);
  bottommargin = Math.floor(marginscale * cellunit);
  if( typeof puzzletype === 'undefined' ){
    puzzletype = 'pencils';
    let str = location.pathname;
    let dir = str.split('/');
    let h = dir[dir.length-1];
    let pos = h.indexOf('.html');
    if( pos !== -1 ){
      puzzletype = h.substring(0,pos);
    }
  }
  oae_reflectpuzzletype();
  gridlinewidth = 0.04;
  griddash0 = 0.1;
  griddash1 = 0.1;
  dotsize = 0.18;
  borderlinewidth = 0.15;
  walllinewidth = 0.15;
  circlelinewidth = 0.06;
  fontsize = 0.8;
  circlefontsize = 0.6;
  guidefontsize = 0.4;
  aview = true;
  cursorview = false;
  opacity = 1;
  editmode = 'qc';
  cursorx = 1;
  cursory = 1;
  resizepreventx = false;
  resizepreventy = false;
  // ---------------------------
  formfocusing = false;
  dragging = false;
  dragpath = [];
  isfirstwallchange = true;
  isfirstcellchange = true;
  walleraser = false;
  celleraser = false;
  cellwidth = cellunit;
  cellheight = cellunit * celladjust;
  gridwidth = cellwidth * ndivx;
  gridheight = cellheight * ndivy;
  totalwidth = gridwidth + leftmargin + rightmargin;
  totalheight = gridheight + topmargin + bottommargin;
  histheight = Math.max(totalheight,histtopheight+histbottomheight+100);
  histmainheight = histheight - histtopheight - histbottomheight;
  oaeinit_puzzle();
  // ---------------------------
  focusx = -1;
  focusy = -1;
  // ---------------------------
  histcontext = document.getElementById('canvasoaehist').getContext('2d');
  bgcontext = document.getElementById('canvasoaebg').getContext('2d');
  gdcontext = document.getElementById('canvasoaegd').getContext('2d');
  mncontext = document.getElementById('canvasoaemn').getContext('2d');
  fgcontext = document.getElementById('canvasoaefg').getContext('2d');
  ovcontext = document.getElementById('canvasoaeov').getContext('2d');
  //----------
  return true;
}
//%}}}
// oaeinit_puzzle %{{{
function oaeinit_puzzle(){
  'use strict';
  if( puzzletype === 'pencils' ){
    pencils.init();
  } else if( puzzletype === 'doublechoco' ){
    //doublechoco.init();
  } else if( puzzletype === 'tentaisho' ){
    //tentaisho.init();
  } else if( puzzletype === 'midloop' ){
    //midloop.init();
  } else if( puzzletype === 'squlin' ){
    //squlin.init();
  }
}
//%}}}
// oaeinitcolor %{{{
function oaeinitcolor(){
  'use strict';
  white = '#fff';
  black = '#000';
  problemlinecolor = '#111111';
  problemshadecolor = '#cccccc';
  answerlinecolor = '#319431';
  answershadecolor = '#31ff31';
  if( document.getElementById('oaeproblemlinecolor') !== null ){
    problemlinecolor = document.getElementById('oaeproblemlinecolor').value;
  }
  if( document.getElementById('oaeproblemshadecolor') !== null ){
    problemshadecolor = document.getElementById('oaeproblemshadecolor').value;
  }
  if( document.getElementById('oaeanswerlinecolor') !== null ){
    answerlinecolor = document.getElementById('oaeanswerlinecolor').value;
  }
  if( document.getElementById('oaeanswershadecolor') !== null ){
    answershadecolor = document.getElementById('oaeanswershadecolor').value;
  }
  return;
}
//%}}}
// oaeinitboard %{{{
function oaeinitboard(){
  'use strict';
  qdatac = [];
  qdatav = [];
  qdatah = [];
  qdatan = [];
  adatac = [];
  adatav = [];
  adatah = [];
  for ( let ix = -1; ix <= ndivx+1; ix ++ ) {
    qdatac[ix] = [];
    qdatav[ix] = [];
    for ( let iy = -1; iy <= ndivy+1; iy ++ ) {
      qdatac[ix][iy] = '.';
      qdatav[ix][iy] = '0';
    }
    adatac[ix] = qdatac[ix].concat();
    qdatah[ix] = qdatav[ix].concat();
    qdatan[ix] = qdatac[ix].concat();
    adatav[ix] = qdatav[ix].concat();
    adatah[ix] = qdatav[ix].concat();
  }
  qdatap = [];
  for ( let ix = -2; ix <= 2*ndivx+2; ix ++ ) {
    qdatap[ix] = [];
    for ( let iy = -2; iy <= 2*ndivy+2; iy ++ ) {
      qdatap[ix][iy] = '.';
    }
  }
}
//%}}}
// oaeinitboard_makenegativepadding %{{{
function oaeinitboard_makenegativepadding(){
  // ixが負の部分のデータを修正する
  'use strict';
  for ( let ix = -1; ix < 0; ix ++ ) {
    qdatac[ix] = [];
    qdatav[ix] = [];
    for ( let iy = -1; iy <= ndivy+1; iy ++ ) {
      qdatac[ix][iy] = '.';
      qdatav[ix][iy] = '0';
    }
    adatac[ix] = qdatac[ix].concat();
    qdatah[ix] = qdatav[ix].concat();
    qdatan[ix] = qdatac[ix].concat();
    adatav[ix] = qdatav[ix].concat();
    adatah[ix] = qdatav[ix].concat();
  }
  for ( let ix = -2; ix < 0; ix ++ ) {
    qdatap[ix] = [];
    for ( let iy = -2; iy <= 2*ndivy+2; iy ++ ) {
      qdatap[ix][iy] = '.';
    }
  }
}
//%}}}
// oaeinithist %{{{
function oaeinithist(){
  'use strict';
  histstack = [];
  histpos = -1;
  oae_histpush();
}
//%}}}
// oae_initdrag %{{{
function oae_initdrag(){
  'use strict';
  dragging = false;
  dragpath = [];
  isfirstwallchange = true;
  isfirstcellchange = true;
  walleraser = false;
  celleraser = false;
  histdragging = false;
}
//%}}}
// oaeansinitboard %{{{
function oaeansinitboard(){
  'use strict';
  adatac = [];
  adatav = [];
  adatah = [];
  for ( let ix = -1; ix <= ndivx+1; ix ++ ) {
    adatac[ix] = [];
    adatav[ix] = [];
    adatah[ix] = [];
    for ( let iy = -1; iy <= ndivy+1; iy ++ ) {
      adatac[ix][iy] = '.';
      adatav[ix][iy] = '0';
      adatah[ix][iy] = '0';
    }
  }
}
//%}}}
// oae_reflectpuzzletype %{{{
function oae_reflectpuzzletype(){
  'use strict';
  if( puzzletype === 'pencils' ){
    hasqdatac = true;
    hasqdatap = false;
    hasqdatan = false;
    hasadatac = true;
    hasadatav = true;
    hasadatah = true;
    allowborderwall = false;
    gridtype = 'dashed';
  } else if( puzzletype === 'doublechoco' ){
    hasqdatac = true;
    hasqdatap = false;
    hasqdatan = false;
    hasadatac = false;
    hasadatav = true;
    hasadatah = true;
    allowborderwall = false;
    gridtype = 'dashed';
  } else if( puzzletype === 'tentaisho' ){
    hasqdatac = false;
    hasqdatap = true;
    hasqdatan = false;
    hasadatac = true;
    hasadatav = true;
    hasadatah = true;
    allowborderwall = false;
    gridtype = 'dashed';
  } else if( puzzletype === 'midloop' ){
    hasqdatac = false;
    hasqdatap = true;
    hasqdatan = false;
    hasadatac = false;
    hasadatav = true;
    hasadatah = true;
    allowborderwall = false;
    gridtype = 'dashed';
  } else if( puzzletype === 'squlin' ){
    hasqdatac = true;
    hasqdatap = false;
    hasqdatan = false;
    hasadatac = true;
    hasadatav = true;
    hasadatah = true;
    allowborderwall = true;
    gridtype = 'dotatnode';
  }
}
//%}}}
// oaesizeadjust %{{{
function oaesizeadjust(){
  'use strict';
  cellwidth = cellunit;
  cellheight = cellunit * celladjust;
  gridwidth = cellwidth * ndivx;
  gridheight = cellheight * ndivy;
  totalwidth = gridwidth + leftmargin + rightmargin;
  totalheight = gridheight + topmargin + bottommargin;
  histheight = Math.max(totalheight,histtopheight+histbottomheight+100);
  histmainheight = histheight - histtopheight - histbottomheight;
  {
    let canvascontainer = document.getElementById('oaeboard');
    if( editmode === 'sz' ){
      canvascontainer.style.width = totalwidth + ( ghostmarginscale * cellunit ) + 'px';
      canvascontainer.style.height = histheight + ( ghostmarginscale * cellunit ) + 'px';
    } else {
      canvascontainer.style.width = totalwidth + 'px';
      canvascontainer.style.height = histheight + 'px';
    }
  }
  {
    let histgrid = document.getElementById('canvasoaehist');
    histgrid.width = histwidth;
    histgrid.height = histheight;
    histgrid.style.marginRight = -histwidth+'px';
    histgrid.style.marginBottom = -histheight+'px';
  }
  {
    let bggrid = document.getElementById('canvasoaebg');
    bggrid.width = totalwidth;
    bggrid.height = totalheight;
    bggrid.style.marginRight = -totalwidth+'px';
    bggrid.style.marginBottom = -totalheight+'px';
  }
  {
    let gdgrid = document.getElementById('canvasoaegd');
    gdgrid.width = totalwidth;
    gdgrid.height = totalheight;
    gdgrid.style.marginRight = -totalwidth+'px';
    gdgrid.style.marginBottom = -totalheight+'px';
  }
  {
    let mngrid = document.getElementById('canvasoaemn');
    mngrid.width = totalwidth;
    mngrid.height = totalheight;
    mngrid.style.marginRight = -totalwidth+'px';
    mngrid.style.marginBottom = -totalheight+'px';
  }
  {
    let fggrid = document.getElementById('canvasoaefg');
    fggrid.width = totalwidth;
    fggrid.height = totalheight;
    fggrid.style.marginRight = -totalwidth+'px';
    fggrid.style.marginBottom = -totalheight+'px';
  }
  {
    let ovgrid = document.getElementById('canvasoaeov');
    ovgrid.width = totalwidth;
    ovgrid.height = totalheight;
  }
}
//%}}}
// oaeeventdef %{{{
function oaeeventdef(){
  'use strict';
  // contextmenu %{{{
  document.getElementById('oae').addEventListener('contextmenu', function(ev){
    ev.preventDefault();
  }, false);
  //%}}}
  // dragover %{{{
  document.getElementById('oae').ondragover = function(ev) {
    ev.preventDefault();
    clearTimeout( timeoutid ) ;
    document.getElementById('oae').style.background = '#ddf';
    timeoutid = setTimeout( function () {
      document.getElementById('oae').style.background = '#fff';
    }, 100 ) ;
  };
  //%}}}
  // drop %{{{
  document.getElementById('oae').ondrop = function(ev) {
    ev.preventDefault();
    oaefileinput_file(ev);
  };
  //%}}}
  // mousedown %{{{
  // oaeboard
  document.getElementById('oaeboard').onmousedown = function(ev) {
    if( ! oae_mousedown(ev) ){
      oae_initdrag();
    }
  };
  //%}}}
  // mousemove %{{{
  document.body.onmousemove = function(ev) {
    if( dragging ){
      if( ! oae_mousemove(ev) ){
        oae_initdrag();
      }
    } else if( histdragging ){
      oae_histdrag(ev);
    } else {
      oae_cursorposet(ev);
      oae_setmousecursor(ev);
    }
  };
  //%}}}
  // mouseup %{{{
  document.onmouseup = function() {
    if( dragging ){
      if( ! oae_mouseup() ){
        oae_initdrag();
      }
    } else if( histdragging ){
      oae_initdrag();
    }
  };
  //%}}}
  // keydown %{{{
  document.body.onkeydown = function(ev) {
    oae_keydown(ev);
  };
  //%}}}
  // blur %{{{
  document.onblur = function() {
    formfocusing = false;
    oae_initdrag();
  };
  //%}}}
  // header focus & blur %{{{
  document.getElementById('oaeheader').onfocus = function() {
    cursorx = null;
    cursory = null;
    formfocusing = true;
  };
  document.getElementById('oaeheader').onblur = function() {
    cursorx = 1;
    cursory = 1;
    formfocusing = false;
  };
  //%}}}
  // consolein focus & blur %{{{
  document.getElementById('oaeconsolein').onfocus = function() {
    cursorx = null;
    cursory = null;
    formfocusing = true;
  };
  document.getElementById('oaeconsolein').onblur = function() {
    cursorx = 1;
    cursory = 1;
    formfocusing = false;
  };
  //%}}}
  //
  // onclick option %{{{
  // oaeclean
  if( document.getElementById('oaeclean') !== null ){
    document.getElementById('oaeclean').onclick = function() {
      oaeclean();
    };
  }
  // oaefileoutput
  if( document.getElementById('oaefileoutput') !== null ){
    document.getElementById('oaefileoutput').onclick = function() {
      oaefileoutput();
    };
  }
  // oaedebugoutput
  if( document.getElementById('oaedebugoutput') !== null ){
    document.getElementById('oaedebugoutput').onclick = function() {
      oaedebugoutput();
    };
  }
  // oaepngoutput
  if( document.getElementById('oaepngoutput') !== null ){
    document.getElementById('oaepngoutput').onclick = function() {
      oaepngoutput();
    };
  }
  // oaeansclean
  if( document.getElementById('oaeansclean') !== null ){
    document.getElementById('oaeansclean').onclick = function() {
      oaeansclean();
    };
  }
  // oaeeval
  if( document.getElementById('oaeeval') !== null ){
    document.getElementById('oaeeval').onclick = function() {
      oae_eval();
    };
  }
  // oaeconsoleclean
  if( document.getElementById('oaeconsoleclean') !== null ){
    document.getElementById('oaeconsoleclean').onclick = function() {
      oaeconsoleclean();
    };
  }
  // %}}}
  // onchange option %{{{
  // oaeaview
  if( document.getElementById('oaeaview') !== null ){
    document.getElementById('oaeaview').onchange = function() {
      oae_aviewflip();
    };
  }
  // oaetransparent
  if( document.getElementById('oaetransparent') !== null ){
    document.getElementById('oaetransparent').onchange = function() {
      oae_transparentflip();
    };
  }
  // oaecursorview
  if( document.getElementById('oaecursorview') !== null ){
    document.getElementById('oaecursorview').onchange = function() {
      oae_cursorviewflip();
    };
  }
  // oaeproblemlinecolor
  if( document.getElementById('oaeproblemlinecolor') !== null ){
    document.getElementById('oaeproblemlinecolor').onchange = function() {
      oae_setcolor();
    };
  }
  // oaeproblemshadecolor
  if( document.getElementById('oaeproblemshadecolor') !== null ){
    document.getElementById('oaeproblemshadecolor').onchange = function() {
      oae_setcolor();
    };
  }
  // oaeanswerlinecolor
  if( document.getElementById('oaeanswerlinecolor') !== null ){
    document.getElementById('oaeanswerlinecolor').onchange = function() {
      oae_setcolor();
    };
  }
  // oaeanswershadecolor
  if( document.getElementById('oaeanswershadecolor') !== null ){
    document.getElementById('oaeanswershadecolor').onchange = function() {
      oae_setcolor();
    };
  }
  // oaemodeform
  if( document.getElementById('oaemodeform') !== null ){
    oae_setmode(); // 起動時に反映
    document.getElementById('oaemodeform').onchange = function() {
      oae_setmode();
    };
  }
  //%}}}
}
//%}}}
// oae_setmousecursor %{{{
function oae_setmousecursor(ev){
  'use strict';
  if( editmode === 'sz' ){
    if( cursorx === 0 ){
      if( cursory === 0 ){
        document.getElementById('oaeboard').style.cursor = 'sw-resize';
      } else if( cursory === ndivy ){
        document.getElementById('oaeboard').style.cursor = 'nw-resize';
      } else {
        document.getElementById('oaeboard').style.cursor = 'w-resize';
      }
    } else if( cursorx === ndivx ){
      if( cursory === 0 ){
        document.getElementById('oaeboard').style.cursor = 'se-resize';
      } else if( cursory === ndivy ){
        document.getElementById('oaeboard').style.cursor = 'ne-resize';
      } else {
        document.getElementById('oaeboard').style.cursor = 'e-resize';
      }
    } else {
      if( cursory === 0 ){
        document.getElementById('oaeboard').style.cursor = 's-resize';
      } else if( cursory === ndivy ){
        document.getElementById('oaeboard').style.cursor = 'n-resize';
      } else {
        document.getElementById('oaeboard').style.cursor = 'move';
      }
    }
  } else {
    if( histstack.length === 1 ){
      document.getElementById('oaeboard').style.cursor = 'auto';
    } else {
      histcontext.beginPath();
      oaedrawhist_upbutton_makepath_wrap(histcontext);
      oaedrawhist_downbutton_makepath_wrap(histcontext);
      let cr = document.getElementById('oaeboard').getBoundingClientRect() ;
      let rx = ev.pageX - ( cr.left + window.pageXOffset );
      let ry = ev.pageY - ( cr.top + window.pageYOffset );
      if( histcontext.isPointInPath(rx,ry) ){
        document.getElementById('oaeboard').style.cursor = 'pointer';
      } else {
        document.getElementById('oaeboard').style.cursor = 'auto';
      }
      histcontext.beginPath();
    }
  }
  return true;
}
//%}}}

// oae_cursorposet %{{{
function oae_cursorposet(ev){
  'use strict';
  let idarr;
  if( editmode === 'sz' ){
    idarr = oaegetnodeid(ev,true);
  } else if( editmode === 'qc' || editmode === 'ac' ){
    idarr = oaegetcellid(ev,false);
  } else if( editmode === 'qw' || editmode === 'aw' ){
    idarr = oaegetnodeid(ev,false);
  } else if( editmode === 'qp' ){
    idarr = oaegetpointid(ev,false);
  } else if( editmode === 'qn' ){
    idarr = oaegetnodeid(ev,false);
  }
  if( idarr === null ) return false;
  if( idarr[0] === null ) return false;
  if( idarr[1] === null ) return false;
  if( cursorx !== idarr[0] || cursory !== idarr[1] ){
    cursorx = idarr[0];
    cursory = idarr[1];
    oaedrawui();
  }
  return true;
}
//%}}}
// oae_mousedown %{{{
function oae_mousedown(ev){
  'use strict';
  {
    let cr = document.getElementById('oaeboard').getBoundingClientRect() ;
    let rx = ev.pageX - ( cr.left + window.pageXOffset );
    //let ry = ev.pageY - ( cr.top + window.pageYOffset );
    if( rx < histwidth ){
      oae_histclick(ev);
      return true;
    }
  }
  // 左クリック(0)、中クリック(1)、右クリック(2)を識別
  button = ev.button;
  if( editmode === 'qc' ){
    if( ! hasqdatac ) return false;
    let idarr = oaegetcellid(ev,false);
    if( idarr[0] === null ) return false;
    if( idarr[1] === null ) return false;
    focusx = idarr[0];
    focusy = idarr[1];
    focusprevstate = qdatac[focusx][focusy];
    dragpath.push([focusx,focusy]);
    if( puzzletype === 'pencils' ){ // ペンシルズのqdatacはmousedownのタイミングでは処理しない（芯入力があるため）
    } else if( puzzletype === 'squlin' ){ // スクリンのqdatacはmousedownのタイミングでは処理しない（表出移動のため）
    } else {
      if( button === buttonid.left ){
        oae_leftclick();
      }
    }
  } else if( editmode === 'qp' ){
    if( ! hasqdatap ) return false;
    let idarr = oaegetpointid(ev,false);
    if( idarr[0] === null ) return false;
    if( idarr[1] === null ) return false;
    focusx = idarr[0];
    focusy = idarr[1];
    focusprevstate = qdatap[focusx][focusy];
    dragpath.push([focusx,focusy]);
    if( button === buttonid.left ){
      oae_leftclick();
    } else if( button === buttonid.right ){
      oae_rightclick();
    }
  } else if( editmode === 'ac' ){
    if( ! hasadatac ) return false;
    let idarr = oaegetcellid(ev,false);
    if( idarr[0] === null ) return false;
    if( idarr[1] === null ) return false;
    focusx = idarr[0];
    focusy = idarr[1];
    focusprevstate = adatac[focusx][focusy];
    dragpath.push([focusx,focusy]);
    if( button === buttonid.left ){
      if( puzzletype !== 'pencils' ){
        oae_leftclick();
      }
    } else if( button === buttonid.right ){
      oae_rightclick();
    }
  } else if( editmode === 'qw' || editmode === 'aw' ){
    if( ! hasadatav && ! hasadatah ) return false;
    // 壁または線の処理
    if( puzzletype === 'midloop' ) button = 2 - button; // 左右入れ替え
    if( button === buttonid.left ){
      // left click -> wall operation
      let idarr = oaegetnodeid(ev,false);
      if( idarr[0] === null ) return false;
      if( idarr[1] === null ) return false;
      focusx = idarr[0];
      focusy = idarr[1];
      dragpath.push([focusx,focusy]);
    } else if( button === buttonid.right ){
      // right click -> path operation
      let idarr = oaegetcellid(ev,false);
      if( idarr[0] === null ) return;
      if( idarr[1] === null ) return;
      focusx = idarr[0];
      focusy = idarr[1];
      dragpath.push([focusx,focusy]);
    }
  } else if( editmode === 'sz' ){
    let idarr = oaegetnodeid(ev,true);
    if( idarr[0] === null ) return false;
    if( idarr[1] === null ) return false;
    focusx = idarr[0];
    focusy = idarr[1];
    dragpath.push([focusx,focusy]);
  }
  dragging = true;
  return true;
}
//%}}}
// oae_mousemove %{{{
function oae_mousemove(ev){
  'use strict';
  let idarr;
  if( editmode === 'qc' ){
    idarr = oaegetcellid(ev,true);
  } else if( editmode === 'qp' ){
    idarr = oaegetpointid(ev,true);
  } else if( editmode === 'ac' ){
    if( button === buttonid.left ){
      idarr = oaegetcellid(ev,true);
    } else if( button === buttonid.right ){
      idarr = oaegetcellid(ev,true);
    }
  } else if( editmode === 'aw' ){
    if( button === buttonid.left ){
      idarr = oaegetnodeid(ev,true);
    } else if( button === buttonid.right ){
      idarr = oaegetcellid(ev,true);
    }
  } else if( editmode === 'sz' ){
    oae_resize(ev);
    idarr = oaegetnodeid(ev,true);
    focusx = idarr[0];
    focusy = idarr[1];
    dragpath.push(idarr);
    return true;
  }
  if( idarr[0] === null || idarr[1] === null ){
    oae_initdrag();
    return false;
  }
  if( idarr[0] === focusx && idarr[1] === focusy ) return true;
  focusx = idarr[0];
  focusy = idarr[1];
  dragpath.push(idarr);
  oae_mousemove_core();
  return true;
}
//%}}}
// oae_mousemove_core %{{{
function oae_mousemove_core(){
  'use strict';
  if( puzzletype === 'pencils' ){
    pencils.mousemove();
  } else if( puzzletype === 'doublechoco' ){
    doublechoco.mousemove();
  } else if( puzzletype === 'tentaisho' ){
    tentaisho.mousemove();
  } else if( puzzletype === 'midloop' ){
    midloop.mousemove();
  } else if( puzzletype === 'squlin' ){
    squlin.mousemove();
  }
  return true;
}
//%}}}
// oae_mouseup %{{{
function oae_mouseup(){
  'use strict';
  if( ! dragging ) return;
  //if( dragpath.length === 0 ) return;
  if( dragpath.length === 1 ){
    if( button === buttonid.left ){
      oae_leftclick();
    } else if( button === buttonid.right ){
      oae_rightclick();
    }
  }
  if( editmode !== 'sz' ) oae_histpush(); // リサイズモードではリサイズした直後はプッシュしない
  oae_initdrag();
  return true;
}
//%}}}
// oae_keydown %{{{
function oae_keydown(ev){
  'use strict';
  let k = ev.keyCode;
  if( formfocusing ){
    if( k === 13 && ev.ctrlKey ){
      // Ctrl+Enterはコマンド関係
      oae_commandenter();
      return true;
    } else if( k === 27 ){
      // ESCでunfocs
      oae_unfocus();
      return true;
    }
    return;
  }
  if( cursorx === null || cursory === null ) return;
  let n = 500;
  if( k >= 48 && k <= 57 ) n = k - 48; // [0-9]
  if( k === 13 ) n = 100; // Enter
  if( k === 8 ) n = -1; // BS
  if( k === 46 ) n = -2; // Del
  if( k === 189 ) n = -3; // -
  if( k === 38 ) n = 11; // up
  if( k === 40 ) n = 12; // down
  if( k === 37 ) n = 13; // left
  if( k === 39 ) n = 14; // right
  if( k === 113 ) n = 202; // F2
  if( n === 500 ) return;
  if( n === 13 && ev.ctrlKey ){
    // Ctrl(またはMeta) + 左右キーでモード変更
    oae_decrementmode();
    return true;
  } else if( n === 14 && ev.ctrlKey ){
    oae_incrementmode();
    return true;
  } else if( n === 202 ){
    // F2でヘッダーにフォーカス
    oae_focusheader();
    return true;
  } else if( n === 100 && ev.ctrlKey ){
    // Ctrl+Enterはコマンド関係
    oae_commandenter();
    return true;
  }
  // resizeもキー入力でできるようにすると良いかも
  // 他にスラッシュ入力でコマンド欄にフォーカスとかF2でタイトル変更とか
  if( puzzletype === 'pencils' ){
    pencils.keydown(n);
  } else if( puzzletype === 'doublechoco' ){
    doublechoco.keydown(n);
  } else if( puzzletype === 'tentaisho' ){
    tentaisho.keydown(n);
  } else if( puzzletype === 'midloop' ){
    midloop.keydown(n);
  } else if( puzzletype === 'squlin' ){
    squlin.keydown(n);
  }
  return true;
}
//%}}}

// oae_histclick %{{{
function oae_histclick(ev){
  'use strict';
  let cr = document.getElementById('oaeboard').getBoundingClientRect() ;
  let rx = ev.pageX - ( cr.left + window.pageXOffset );
  let ry = ev.pageY - ( cr.top + window.pageYOffset );
  if( rx < 0 || rx > histwidth || ry < 0 || ry > histheight ){
    return;
  } else if( ry < histtopheight ){
    histcontext.beginPath();
    oaedrawhist_upbutton_makepath_wrap(histcontext);
    if( histcontext.isPointInPath(rx,ry) ){
      oae_undo();
    }
    histcontext.beginPath();
  } else if( ry < histtopheight + histmainheight ){
    if( histstack.length === 1 ) return;
    let i = Math.round((ry-histtopheight) / histmainheight * (histstack.length-1));
    oae_histsetpos(i);
    histdragging = true;
  } else {
    oaedrawhist_downbutton_makepath_wrap(histcontext);
    if( histcontext.isPointInPath(rx,ry) ){
      oae_redo();
    }
    histcontext.beginPath();
  }
}
//%}}}
// oae_histdrag %{{{
function oae_histdrag(ev){
  'use strict';
  let cr = document.getElementById('oaeboard').getBoundingClientRect() ;
  let ry = ev.pageY - ( cr.top + window.pageYOffset );
  if( histstack.length === 1 ) return;
  let i = Math.round((ry-histtopheight) / histmainheight * (histstack.length-1));
  if( i < 0 ) i = 0;
  if( i > histstack.length-1 ) i = histstack.length-1;
  oae_histsetpos(i);
}
//%}}}

// nodeisoutside %{{{
function nodeisoutside(ix,iy) {
  'use strict';
  // return null if node is at border
  if( ix < 0 || ix > ndivx ) return true;
  if( iy < 0 || iy > ndivy ) return true;
  if( ix === 0 || ix === ndivx ) return null;
  if( iy === 0 || iy === ndivy ) return null;
  return false;
}
//%}}}
// cellisoutside %{{{
function cellisoutside(ix,iy) {
  'use strict';
  if( ix < 1 || ix > ndivx ) return true;
  if( iy < 1 || iy > ndivy ) return true;
  return false;
}
//%}}}
// isshaded %{{{
function isshaded(str) {
  'use strict';
  if( str === '.' ) return false;
  if( str === '#' ) return false;
  if( str === '=' ) return true;
  if( str.match(/^\.\=[0-9]*$/) !== null ) return false;
  if( str.substring(0,1) === 'c' ) return true;
  return true;
}
//%}}}
// isunshaded %{{{
function isunshaded(str) {
  'use strict';
  // unshadeとはshadeよりもunshadeを積極的に行う操作
  // 明示的オブジェクトの置かれていないマスに対して積極的にunshadeを選択する
  // shadeとunshadeは例えばスリザーリンクで線を引く操作と、×を描く操作の関係に近い
  if( str === '.' ) return true;
  if( str === '#' ) return false;
  if( str === '=' ) return true;
  if( str.match(/^[0-9]*$/) !== null ) return true;
  if( str.match(/^\.[0-9]*$/) !== null ) return false;
  if( str.substring(0,1) === 'c' ) return true;
  return true;
}
//%}}}
// oae_shadetoggle %{{{
function oae_shadetoggle(str){
  'use strict';
  if( puzzletype === 'pencils' ){
    return pencils.shadetoggle(str);
  } else if( puzzletype === 'doublechoco' ){
    return doublechoco.shadetoggle(str);
  } else if( puzzletype === 'tentaisho' ){
    return tentaisho.shadetoggle(str);
  } else if( puzzletype === 'midloop' ){
  } else if( puzzletype === 'squlin' ){
    return squlin.shadetoggle(str);
  }
}
//%}}}
// oae_unshadetoggle %{{{
function oae_unshadetoggle(str){
  'use strict';
  if( puzzletype === 'pencils' ){
    return pencils.shadetoggle(str);
  } else if( puzzletype === 'doublechoco' ){
    return doublechoco.shadetoggle(str);
  } else if( puzzletype === 'tentaisho' ){
    return tentaisho.shadetoggle(str);
  } else if( puzzletype === 'midloop' ){
  } else if( puzzletype === 'squlin' ){
    return squlin.unshadetoggle(str);
  }
}
//%}}}

// oae_leftclick %{{{
function oae_leftclick(){
  'use strict';
  if( puzzletype === 'pencils' ){
    pencils.leftclick();
  } else if( puzzletype === 'doublechoco' ){
    doublechoco.leftclick();
  } else if( puzzletype === 'tentaisho' ){
    tentaisho.leftclick();
  } else if( puzzletype === 'midloop' ){
    midloop.leftclick();
  } else if( puzzletype === 'squlin' ){
    squlin.leftclick();
  }
}
//%}}}
// oae_rightclick %{{{
function oae_rightclick(){
  'use strict';
  if( puzzletype === 'pencils' ){
    pencils.rightclick();
  } else if( puzzletype === 'doublechoco' ){
    doublechoco.rightclick();
  } else if( puzzletype === 'tentaisho' ){
    tentaisho.rightclick();
  } else if( puzzletype === 'midloop' ){
    midloop.rightclick();
  } else if( puzzletype === 'squlin' ){
    squlin.rightclick();
  }
}
//%}}}
// oae_wall %{{{
function oae_wall(){
  'use strict';
  let prevarr = dragpath[dragpath.length-2];
  let postarr = dragpath[dragpath.length-1];
  let n1 = nodeisoutside(prevarr[0],prevarr[1]);
  let n2 = nodeisoutside(postarr[0],postarr[1]);
  if( n1 === true || n2 === true ) return;
  if( n1 === null && n2 === null && ! allowborderwall ) return;
  if( editmode === 'qw' ){
  } else if( editmode === 'aw' ){
    let ix;
    let iy;
    if( isfirstwallchange ){
      if( postarr[0] !== prevarr[0] ){
        ix = Math.max(postarr[0],prevarr[0]);
        iy = postarr[1];
        if( adatah[ix][iy] === '1' ){
          adatah[ix][iy] = '0';
          walleraser = true;
        } else {
          adatah[ix][iy] = '1';
          walleraser = false;
        }
      } else {
        ix = postarr[0];
        iy = Math.max(postarr[1],prevarr[1]);
        if( adatav[ix][iy] === '1' ){
          adatav[ix][iy] = '0';
          walleraser = true;
        } else {
          adatav[ix][iy] = '1';
          walleraser = false;
        }
      }
      isfirstwallchange = false;
    } else {
      if( postarr[0] !== prevarr[0] ){
        ix = Math.max(postarr[0],prevarr[0]);
        iy = postarr[1];
        if( walleraser ){
          adatah[ix][iy] = '0';
        } else {
          adatah[ix][iy] = '1';
        }
      } else {
        ix = postarr[0];
        iy = Math.max(postarr[1],prevarr[1]);
        if( walleraser ){
          adatav[ix][iy] = '0';
        } else {
          adatav[ix][iy] = '1';
        }
      }
    }
    oaedrawadata();
  }
}
// %}}}
// oae_path %{{{
function oae_path(){
  'use strict';
  let prevarr = dragpath[dragpath.length-2];
  let postarr = dragpath[dragpath.length-1];
  let n1 = cellisoutside(prevarr[0],prevarr[1]);
  let n2 = cellisoutside(postarr[0],postarr[1]);
  if( n1 === true || n2 === true ) return;
  if( editmode === 'qw' ){
  } else if( editmode === 'aw' ){
    let ix;
    let iy;
    if( isfirstwallchange ){
      if( postarr[0] !== prevarr[0] ){
        ix = Math.min(postarr[0],prevarr[0]);
        iy = postarr[1];
        if( adatav[ix][iy] === '-1' ){
          adatav[ix][iy] = '0';
          walleraser = true;
        } else {
          adatav[ix][iy] = '-1';
          walleraser = false;
        }
      } else {
        ix = postarr[0];
        iy = Math.min(postarr[1],prevarr[1]);
        if( adatah[ix][iy] === '-1' ){
          adatah[ix][iy] = '0';
          walleraser = true;
        } else {
          adatah[ix][iy] = '-1';
          walleraser = false;
        }
      }
      isfirstwallchange = false;
    } else {
      if( postarr[0] !== prevarr[0] ){
        ix = Math.min(postarr[0],prevarr[0]);
        iy = postarr[1];
        if( walleraser ){
          adatav[ix][iy] = '0';
        } else {
          adatav[ix][iy] = '-1';
        }
      } else {
        ix = postarr[0];
        iy = Math.min(postarr[1],prevarr[1]);
        if( walleraser ){
          adatah[ix][iy] = '0';
        } else {
          adatah[ix][iy] = '-1';
        }
      }
    }
    oaedrawadata();
  }
}
// %}}}
// oae_shade %{{{
function oae_shade(){
  'use strict';
  if( cellisoutside(focusx,focusy) ) return;
  let str = focusprevstate;
  if( isfirstcellchange ){
    celleraser = isshaded(str);
    str = oae_shadetoggle(str);
  } else {
    if( celleraser === isshaded(str) ){
      str = oae_shadetoggle(str);
    }
  }
  if( str === null ) return;
  isfirstcellchange = false;
  if( editmode === 'qc' ){
    qdatac[focusx][focusy] = str;
    oaedrawgrid();
    oaedrawqdata();
  } else if( editmode === 'ac' ){
    adatac[focusx][focusy] = str;
    oaerewriteall();
  }
}
//%}}}
// oae_unshade %{{{
function oae_unshade(){
  'use strict';
  if( cellisoutside(focusx,focusy) ) return;
  let str = focusprevstate;
  if( isfirstcellchange ){
    celleraser = isunshaded(str);
    str = oae_unshadetoggle(str);
  } else {
    if( celleraser === isunshaded(str) ){
      str = oae_unshadetoggle(str);
    }
  }
  if( str === null ) return;
  isfirstcellchange = false;
  if( editmode === 'qc' ){
    qdatac[focusx][focusy] = str;
    oaedrawgrid();
    oaedrawqdata();
  } else if( editmode === 'ac' ){
    adatac[focusx][focusy] = str;
    oaerewriteall();
  }
}
//%}}}
// oae_resize %{{{
function oae_resize(ev){
  'use strict';
  oaeinithist();
  let idarr = oaegetnodeid(ev,true);
  if( idarr[0] === null || idarr[1] === null ){
    oae_initdrag();
    return;
  }
  // 右端から左右方向へドラッグした場合は右端を変形
  // 中央から左右方向へドラッグした場合は左端を変形
  // 上下も同様
  // 変形によって盤外に出たデータは（ただちにデータ破棄しなくても良いが少なくとも見かけ上は）破棄する
  // 壁もしくは道は、枠と同化したか、または枠を貫く配置になることによっても破棄する
  if( dragpath.length === 1 ){
    resizepreventx = false;
    resizepreventy = false;
    // 辺からドラッグした場合はその辺と垂直方向のリサイズを防止する
    if( ( focusx === 0 || focusx === ndivx ) && ( focusy !== 0 && focusy !== ndivy ) ) resizepreventy = true;
    if( ( focusx !== 0 && focusx !== ndivx ) && ( focusy === 0 || focusy === ndivy ) ) resizepreventx = true;
  }
  let relx = idarr[0] - focusx;
  let rely = idarr[1] - focusy;
  if( relx === 0 && rely === 0 ) return;
  if( relx !== 0 && ! resizepreventx ){ // x方向に移動がある場合
    //%{{{
    if( focusx === ndivx && idarr[0] > 0 ){ // 右端を持ってドラッグ
      ndivx = idarr[0]; // 配列変更の前にndivxを変更していることに注意
      if( relx > 0 ){ // 右方向にドラッグ
        oae_resize_rplus(relx); // 右にデータを足す
      } else {
        oae_resize_rminus(relx); // 右のデータを消す
      }
    } else if( ndivx + relx > 0 ){
      ndivx += relx; // 先に変更
      if( relx > 0 ){
        oae_resize_lplus(relx); // 右にデータをずらしてから左にデータを足す
      } else {
        oae_resize_lminus(relx); // 左にデータをずらしてから左のデータを消す
      }
    } else {
      // 禁止領域へのドラッグ対策（左はみだし）
      oae_initdrag();
      // ここでreturnしないで、上下方向の処理と最後の再描画をする
    }
    focusx = idarr[0];
    //%}}}
  }
  if( rely !== 0 && ! resizepreventy ){ // y方向に移動がある場合
    //%{{{
    // 上下方向の拡縮は第二次元目なので左右方向より簡単
    if( focusy === 0 && idarr[1] < ndivy ){ // 下端を持ってドラッグ
      ndivy -= rely; // 先に変更！！
      // relyは直観と反するので注意（負だと盤面が大きくなる）
      // ただしfocusyとidarr[1]はもっとややこしく、変形前の盤面における座標値なので、配列の変形はrelyで行う
      if( rely < 0 ){ // 下方向にドラッグ
        oae_resize_bplus(rely); // 上にデータをずらしてから下にデータを足す
      } else { // 上方向にドラッグ
        oae_resize_bminus(rely); // 下にデータをずらしてから上のデータを消す（ここでは上のデータは消していない）
      }
      focusy = 0;
    } else if( ndivy - rely > 0  ) {
      ndivy -= rely; // 先に変更！！
      if( rely > 0 ){ // 上方向にドラッグ
        oae_resize_tminus(rely); // 上のデータを消す（実際には何もしないで良い
      } else { // 下方向にドラッグ
        oae_resize_tplus(rely); // 上にデータを足す
      }
      focusy = focusy;
    } else {
      // 禁止領域へのドラッグ対策（上はみだし）
      oae_initdrag();
      // ここでreturnしないで、最後の再描画をする
    }
    //%}}}
  }
  // [TODO] リサイズ時にスクロールバーが出現すると盤面データの一部がundefinedになるバグ（がある可能性）
  oaeinithist();
  cursorx = focusx;
  cursory = focusy;
  oaerewriteall();
  // シロちゃんの動画は為になるなぁ
  return;
}
// %}}}

// oae_resize_rplus %{{{
function oae_resize_rplus(relx){
  'use strict';
  for ( let ix = ndivx-relx+1; ix <= ndivx+1; ix ++ ) {
    qdatac[ix] = [];
    qdatav[ix] = [];
    if( hasqdatap ) qdatap[2*ix-1] = [];
    if( hasqdatap ) qdatap[2*ix] = [];
    for ( let iy = -1; iy <= ndivy+1; iy ++ ) {
      qdatac[ix][iy] = '.';
      qdatav[ix][iy] = '0';
    }
    if( hasqdatap ){
      for ( let iy = -1; iy <= 2*ndivy+2; iy ++ ) {
        qdatap[2*ix-1][iy] = '.';
        qdatap[2*ix][iy] = '.';
      }
    }
    if( hasadatac ) adatac[ix] = qdatac[ix].concat();
    qdatah[ix] = qdatav[ix].concat();
    adatav[ix] = qdatav[ix].concat();
    adatah[ix] = qdatav[ix].concat();
  }
  qdatav[ndivx-relx] = qdatav[ndivx-relx+1].concat(); // qdatavはセルの右の壁なので
  adatav[ndivx-relx] = adatav[ndivx-relx+1].concat(); // adatavはセルの右の壁なので
}
//%}}}
// oae_resize_rminus %{{{
function oae_resize_rminus(relx){
  'use strict';
  for ( let ix = ndivx+1; ix <= ndivx-relx; ix ++ ) {
    if( hasqdatap ) qdatap[2*ix-1] = [];
    if( hasqdatap ) qdatap[2*ix] = [];
    qdatac[ix] = [];
    qdatav[ix] = [];
    qdatah[ix] = [];
    if( hasadatac ) adatac[ix] = [];
    adatav[ix] = [];
    adatah[ix] = [];
  }
}
//%}}}
// oae_resize_lplus %{{{
function oae_resize_lplus(relx){
  'use strict';
  // 右にデータをずらしてから左にデータを足す
  for ( let ix = ndivx+1; ix >= relx-1; ix -- ) {
    // 配列操作はpushとかでもっときれいに書けそうだが間違えるので成分代入する
    // クラスにしてしまった方が楽かも
    // 配列並進や虚無詰めを別ルーチンに分けた方が見通しが良いかもだが、ここ以外で使う予定はまだない
    // あるいはArrayコンストラクタでもうちょっときれいになりそう（要確認）
    if( hasqdatap ){
      qdatap[2*ix] = qdatap[2*(ix-relx)].concat();
      if( ix !== relx-1 )qdatap[2*ix-1] = qdatap[2*(ix-relx)-1].concat();
    }
    qdatac[ix] = qdatac[ix-relx].concat();
    qdatav[ix] = qdatav[ix-relx].concat();
    qdatah[ix] = qdatah[ix-relx].concat();
    if( hasadatac ) adatac[ix] = adatac[ix-relx].concat();
    adatav[ix] = adatav[ix-relx].concat();
    adatah[ix] = adatah[ix-relx].concat();
  }
  for ( let ix = relx; ix >= 1; ix -- ) {
    qdatac[ix] = []; // この代入は不要かもしれないがrelxが極端に大きい場合に一応備えておく
    qdatav[ix] = [];
    if( hasqdatap ) qdatap[2*ix-1] = [];
    if( hasqdatap ) qdatap[2*ix] = [];
    for ( let iy = -1; iy <= ndivy+1; iy ++ ) {
      qdatac[ix][iy] = '.';
      qdatav[ix][iy] = '0';
    }
    if( hasqdatap ){
      for ( let iy = -2; iy <= 2*ndivy+2; iy ++ ) {
        qdatap[2*ix-1][iy] = '.';
        qdatap[2*ix][iy] = '.';
      }
    }
    if( hasadatac ) adatac[ix] = qdatac[ix].concat();
    qdatah[ix] = qdatav[ix].concat();
    adatav[ix] = qdatav[ix].concat();
    adatah[ix] = qdatav[ix].concat();
  }
}
//%}}}
// oae_resize_lminus %{{{
function oae_resize_lminus(relx){
  'use strict';
  // 左にデータをずらしてから左のデータを消す
  for ( let ix = 1; ix <= ndivx; ix ++ ) {
    if( hasqdatap ){
      qdatap[2*ix] = qdatap[2*(ix-relx)].concat();
      if( ix !== 1 ) qdatap[2*ix-1] = qdatap[2*(ix-relx)-1].concat();
    }
    qdatac[ix] = qdatac[ix-relx].concat();
    qdatav[ix] = qdatav[ix-relx].concat();
    qdatah[ix] = qdatah[ix-relx].concat();
    if( hasadatac ) adatac[ix] = adatac[ix-relx].concat();
    adatav[ix] = adatav[ix-relx].concat();
    adatah[ix] = adatah[ix-relx].concat();
  }
  for ( let ix = ndivx+2; ix <= ndivx-relx+1; ix ++ ) {
    if( hasqdatap ) qdatap[2*ix] = [];
    if( hasqdatap ) qdatap[2*ix-1] = [];
    qdatac[ix] = [];
    qdatav[ix] = [];
    qdatah[ix] = [];
    if( hasadatac ) adatac[ix] = [];
    adatav[ix] = [];
    adatah[ix] = [];
  }
}
//%}}}
// oae_resize_bplus %{{{
function oae_resize_bplus(rely){
  'use strict';
  for ( let ix = 0; ix <= ndivx+1; ix ++ ) {
    for ( let iy = ndivy+1; iy >= -rely; iy -- ) {
      if( hasqdatap ){
        // 上下方向にずらしはShiftでできそう
        if( ix !== -1 ) qdatap[2*ix][2*iy] = qdatap[2*ix][2*(iy+rely)]; // この２つの代入の順序に注意
        if( ix !== -1 ) qdatap[2*ix][2*iy-1] = qdatap[2*ix][2*(iy+rely)-1];
        // ixが範囲外アクセスかどうかは気にする必要があるが、iyは第二次元目なのでさほど気にしなくて良い（はず）
        if( ix !== -1 ) qdatap[2*ix-1][2*iy] = qdatap[2*ix-1][2*(iy+rely)];
        if( ix !== -1 ) qdatap[2*ix-1][2*iy-1] = qdatap[2*ix-1][2*(iy+rely)-1];
      }
      qdatac[ix][iy] = qdatac[ix][iy+rely];
      qdatav[ix][iy] = qdatav[ix][iy+rely];
      qdatah[ix][iy] = qdatah[ix][iy+rely];
      if( hasadatac ) adatac[ix][iy] = adatac[ix][iy+rely];
      adatav[ix][iy] = adatav[ix][iy+rely];
      adatah[ix][iy] = adatah[ix][iy+rely];
    }
    for ( let iy = -rely; iy >= -1; iy -- ) {
      if( hasqdatap ){
        qdatap[2*ix][2*iy+1] = '.';
        qdatap[2*ix][2*iy] = '.';
        if( ix !== -1 ) qdatap[2*ix-1][2*iy+1] = '.';
        if( ix !== -1 ) qdatap[2*ix-1][2*iy] = '.';
      }
      qdatac[ix][iy] = '.';
      qdatav[ix][iy] = '.';
      qdatah[ix][iy] = '.';
      if( hasadatac ) adatac[ix][iy] = '.';
      adatav[ix][iy] = '.';
      adatah[ix][iy] = '.';
    }
  }
}
//%}}}
// oae_resize_bminus %{{{
function oae_resize_bminus(rely){
  'use strict';
  for ( let ix = -1; ix <= ndivx+1; ix ++ ) {
    for ( let iy = -1; iy <= ndivy+1; iy ++ ) {
      if( hasqdatap ){
        qdatap[2*ix][2*iy-1] = qdatap[2*ix][2*(iy+rely)-1];
        qdatap[2*ix][2*iy] = qdatap[2*ix][2*(iy+rely)];
        if( ix !== -1 ) qdatap[2*ix-1][2*iy-1] = qdatap[2*ix-1][2*(iy+rely)-1];
        if( ix !== -1 ) qdatap[2*ix-1][2*iy] = qdatap[2*ix-1][2*(iy+rely)];
      }
      qdatac[ix][iy] = qdatac[ix][iy+rely];
      qdatav[ix][iy] = qdatav[ix][iy+rely];
      qdatah[ix][iy] = qdatah[ix][iy+rely];
      if( hasadatac ) adatac[ix][iy] = adatac[ix][iy+rely];
      adatav[ix][iy] = adatav[ix][iy+rely];
      adatah[ix][iy] = adatah[ix][iy+rely];
    }
  }
}
//%}}}
// oae_resize_tplus %{{{
function oae_resize_tplus(rely){
  'use strict';
  for ( let ix = -1; ix <= ndivx+1; ix ++ ) {
    for ( let iy = ndivy+rely+1; iy <= ndivy+1; iy ++ ) {
      if( hasqdatap ){
        qdatap[2*ix][2*iy] = '.';
        qdatap[2*ix][2*iy-1] = '.';
        if( ix !== -1 ) qdatap[2*ix-1][2*iy] = '.';
        if( ix !== -1 ) qdatap[2*ix-1][2*iy-1] = '.';
      }
      qdatac[ix][iy] = '.';
      qdatav[ix][iy] = '.';
      qdatah[ix][iy] = '.';
      if( hasadatac ) adatac[ix][iy] = '.';
      adatav[ix][iy] = '.';
      adatah[ix][iy] = '.';
    }
    qdatah[ix][ndivy+rely] = '.'; // qdatahはセルの上の壁なので
    adatah[ix][ndivy+rely] = '.'; // qdatahはセルの上の壁なので
  }
}
//%}}}
// oae_resize_tminus %{{{
function oae_resize_tminus(rely){
  'use strict';
  for ( let ix = -1; ix <= ndivx+1; ix ++ ) {
    for ( let iy = ndivy+rely+1; iy <= ndivy+1; iy ++ ) {
      if( hasqdatap ){
        qdatap[2*ix][2*iy] = '.';
        qdatap[2*ix][2*iy-1] = '.';
        if( ix !== -1 ) qdatap[2*ix-1][2*iy] = '.';
        if( ix !== -1 ) qdatap[2*ix-1][2*iy-1] = '.';
      }
      qdatac[ix][iy] = '.';
      qdatav[ix][iy] = '.';
      qdatah[ix][iy] = '.';
      if( hasadatac ) adatac[ix][iy] = '.';
      adatav[ix][iy] = '.';
      adatah[ix][iy] = '.';
    }
    qdatah[ix][ndivy+rely] = '.'; // qdatahはセルの上の壁なので
    adatah[ix][ndivy+rely] = '.'; // qdatahはセルの上の壁なので
  }
}
//%}}}

// oaegetrelativexy %{{{
function oaegetrelativexy(ev){
  'use strict';
  let cr = document.getElementById('oaeboard').getBoundingClientRect() ;
  let rx = ev.pageX - ( cr.left + window.pageXOffset )- leftmargin;
  let ry = ev.pageY - ( cr.top + window.pageYOffset ) - topmargin;
  ry = gridheight - ry; // upside down
  return [rx,ry];
}
//%}}}
// oaegetcellid %{{{
function oaegetcellid(ev,allowoutside){
  'use strict';
  let xyarr = oaegetrelativexy(ev);
  let x = xyarr[0];
  let y = xyarr[1];
  let ix = 1 + Math.floor(x / cellwidth);
  let iy = 1 + Math.floor(y / cellheight);
  if( allowoutside ) return [ix,iy];
  if( ix < 1 || ix > ndivx ) ix = null;
  if( iy < 1 || iy > ndivy ) iy = null;
  return [ix,iy];
}
//%}}}
// oaegetnodeid %{{{
function oaegetnodeid(ev,allowoutside){
  'use strict';
  // 左下原点を(0,0)、右上頂点を(ndivx+1,ndivy+1)とする
  let xyarr = oaegetrelativexy(ev);
  let x = xyarr[0];
  let y = xyarr[1];
  let ix = Math.round(x / cellwidth);
  let iy = Math.round(y / cellheight);
  if( ! allowoutside ){
    if( ix < 0 || ix > ndivx ) ix = null;
    if( iy < 0 || iy > ndivy ) iy = null;
  }
  return [ix,iy];
}
//%}}}
// oaegetpointid %{{{
function oaegetpointid(ev,allowoutside){
  'use strict';
  let xyarr = oaegetrelativexy(ev);
  let x = xyarr[0];
  let y = xyarr[1];
  if( x < -leftmargin ) return [null,null];
  if( x > totalwidth-rightmargin ) return [null,null];
  if( y < -topmargin ) return [null,null];
  if( y > totalheight-bottommargin ) return [null,null];
  x = x + 0.25*cellwidth;
  y = y + 0.25*cellheight;
  let ix = 1 + Math.floor(2*x / cellwidth);
  let iy = 1 + Math.floor(2*y / cellheight);
  if( allowoutside ) return [ix,iy];
  if( ix <= 1 || ix > 2*ndivx ) ix = null;
  if( iy <= 1 || iy > 2*ndivy ) iy = null;
  return [ix,iy];
}
//%}}}

// oaefileoutput %{{{
function oaefileoutput(){
  'use strict';
  let str = oaefileoutput_base();
  let blob = new Blob([str],{type:'text/plain'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = document.getElementById('oaeheader').value + '.txt';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
//%}}}
// oaefileoutput_base %{{{
function oaefileoutput_base(){
  'use strict';
  let str = 'oaef0';
  str = str + '\n' + puzzletype;
  str = str + '\n' + ndivy.toString(10);
  str = str + '\n' + ndivx.toString(10);
  str = str + '\n';
  if( hasqdatap ) str = str + oaefileoutput_main_qdatap();
  if( hasqdatac ) str = str + oaefileoutput_main_qdatac();
  if( hasqdatan ) str = str + oaefileoutput_main_qdatan();
  if( hasadatac ) str = str + oaefileoutput_main_adatac();
  if( hasadatav ) str = str + oaefileoutput_main_adatav();
  if( hasadatah ) str = str + oaefileoutput_main_adatah();
  return str;
}
//%}}}
// oaefileoutput_main_qdatap %{{{
function oaefileoutput_main_qdatap(){
  'use strict';
  let str = '';
  for( let iy = 2*ndivy; iy >= 2; iy -- ){
    for( let ix = 2; ix <= 2*ndivx; ix ++ ){
      str = str + ' ' + qdatap[ix][iy].toString(10);
    }
    str = str + '\n';
  }
  return str;
}
//%}}}
// oaefileoutput_main_qdatac %{{{
function oaefileoutput_main_qdatac(){
  'use strict';
  let str = '';
  for( let iy = ndivy; iy >= 1; iy -- ){
    for( let ix = 1; ix <= ndivx; ix ++ ){
      str = str + ' ' + qdatac[ix][iy].toString(10);
    }
    str = str + '\n';
  }
  return str;
}
//%}}}
// oaefileoutput_main_qdatan %{{{
function oaefileoutput_main_qdatan(){
  'use strict';
  let str = '';
  for( let iy = ndivy; iy >= 0; iy -- ){
    for( let ix = 0; ix <= ndivx; ix ++ ){
      str = str + ' ' + qdatan[ix][iy].toString(10);
    }
    str = str + '\n';
  }
  return str;
}
//%}}}
// oaefileoutput_main_adatac %{{{
function oaefileoutput_main_adatac(){
  'use strict';
  let str = '';
  for( let iy = ndivy; iy >= 1; iy -- ){
    for( let ix = 1; ix <= ndivx; ix ++ ){
      str = str + ' ' + adatac[ix][iy].toString(10);
    }
    str = str + '\n';
  }
  return str;
}
//%}}}
// oaefileoutput_main_adatav %{{{
function oaefileoutput_main_adatav(){
  'use strict';
  let str = '';
  if( allowborderwall ){
    for( let iy = ndivy; iy >= 1; iy -- ){
      for( let ix = 0; ix <= ndivx; ix ++ ){
        str = str + ' ' + adatav[ix][iy].toString(10);
      }
      str = str + '\n';
    }
  } else {
    for( let iy = ndivy; iy >= 1; iy -- ){
      for( let ix = 1; ix < ndivx; ix ++ ){
        str = str + ' ' + adatav[ix][iy].toString(10);
      }
      str = str + '\n';
    }
  }
  return str;
}
//%}}}
// oaefileoutput_main_adatah %{{{
function oaefileoutput_main_adatah(){
  'use strict';
  let str = '';
  if( allowborderwall ){
    for( let iy = ndivy; iy >= 0; iy -- ){
      for( let ix = 1; ix <= ndivx; ix ++ ){
        str = str + ' ' + adatah[ix][iy].toString(10);
      }
      str = str + '\n';
    }
  } else {
    for( let iy = ndivy-1; iy >= 1; iy -- ){
      for( let ix = 1; ix <= ndivx; ix ++ ){
        str = str + ' ' + adatah[ix][iy].toString(10);
      }
      str = str + '\n';
    }
  }
  return str;
}
//%}}}
// oaepngoutput %{{{
function oaepngoutput(){
  'use strict';
  oaelayersinglier();
  let bgcanvas = document.getElementById('canvasoaebg');
  let imgbase64 = bgcanvas.toDataURL('image/png');
  let imgbase64arr = imgbase64.split(',');
  let d = atob(imgbase64arr[1]);
  let arr = new Uint8Array(d.length);
  for( let i = 0; i < d.length; i++ ){
    arr[i] = d.charCodeAt(i);
  }
  let blob = new Blob([arr],{type:'image/png'});

  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = document.getElementById('oaeheader').value + '.png';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // layer fix
  leftmargin = histwidth + Math.floor(marginscale * cellunit);
  topmargin = Math.floor(marginscale * cellunit);
  rightmargin = Math.floor(marginscale * cellunit);
  bottommargin = Math.floor(marginscale * cellunit);
  totalwidth = gridwidth + leftmargin + rightmargin;
  totalheight = gridheight + topmargin + bottommargin;
  oaerewriteall();
  return;
}
//%}}}
// oaelayersinglier %{{{
function oaelayersinglier(){
  'use strict';
  // inverse layer 'multiplier'
  // 全てのキャンバスの描画を合成して一つのキャンバスで再表現
  // 前の方法はブラウザのアンチエイリアスの影響を受けるみたいなので個別ルーチンで再描画させることにする
  // 何のためにレイヤー分けしたのか...
  if( puzzletype === 'pencils' ){
    pencils.layersinglier();
  } else if( puzzletype === 'doublechoco' ){
    doublechoco.layersinglier();
  } else if( puzzletype === 'tentaisho' ){
    tentaisho.layersinglier();
  } else if( puzzletype === 'midloop' ){
    midloop.layersinglier();
  } else if( puzzletype === 'squlin' ){
    squlin.layersinglier();
  }
  return;
}
//%}}}

// oaefile_urldecode %{{{
function oaefile_urldecode(str){
  'use strict';
  str = str.replace(/^file=/,'');
  str = str.replace(/%S/g,' ');
  str = str.replace(/%N/g,'\n');
  oaefileinput_base(str);
  return;
}
//%}}}
// oaefileinput_file %{{{
function oaefileinput_file(ev){
  'use strict';
  let file = ev.dataTransfer.files[0];
  if( file.type === 'text/plain' ){
    let fr = new FileReader();
    fr.readAsText(file);
    fr.addEventListener('load',function(){
      let str = fr.result;
      if( oaefileinput_base(str) ){
        return true;
      } else {
        return false;
      }
    });
  } else if( file.type.substring(0,6) === 'image/' ){
    // 画像だったら背景をその画像にする
    // 画像からパズル盤面を推測する機能があると面白いかも
    let fileurl = URL.createObjectURL(file);
    document.getElementById('oaeboard').style.background = '#fff';
    document.getElementById('oaeboard').style.backgroundImage =
      'url("'+fileurl+'")';
  } else {
    oaeconsolemsg('ファイル形式エラー');
    return;
  }
  return;
}
//%}}}
// oaefileinput_base %{{{
function oaefileinput_base(str){
  'use strict';
  let arr = str.split('\n');
  let formatstr = arr[0];
  arr.shift();
  if( formatstr === 'pzprv3' ){
  } else if( formatstr === 'oaef0' ){
  } else {
    // unknown format
    return false;
  }
  if( puzzletype !== arr[0].trim() ){
    puzzletype = arr[0].trim();
    str = str.replace(/\n/g,'%N');
    str = str.replace(/\s/g,'%S');
    location.replace(puzzletype+'.html?file='+str);
  }
  oae_reflectpuzzletype();
  arr.shift();
  //-------------------------------------
  if( arr[0].match(/^\s*[1-9][0-9]*\s*$/) === null ) return false;
  ndivy = parseInt(arr[0],10);
  arr.shift();
  if( arr[0].match(/^\s*[1-9][0-9]*\s*$/) === null ) return false;
  ndivx = parseInt(arr[0],10);
  arr.shift();
  //-------------------------------------
  oaeinitboard();
  // qdatac, adatac などの処理は別関数で処理するため
  // グローバル変数に預けておく
  filebuffer = arr;
  if( hasqdatap ) oaefileinput_main_qdatap();
  if( hasqdatac ) oaefileinput_main_qdatac();
  if( hasqdatan ) oaefileinput_main_qdatan();
  if( hasadatac ) oaefileinput_main_adatac();
  if( hasadatav ) oaefileinput_main_adatav();
  if( hasadatah ) oaefileinput_main_adatah();
  // 描画
  oaesizeadjust();
  oaedrawgrid();
  oaeinithist();
  oaedrawhist();
  oaedrawqdata();
  oaedrawadata();
  oaedrawui();
}
//%}}}
// oaefileinput_main_qdatap %{{{
function oaefileinput_main_qdatap(){
  'use strict';
  for( let iy = 2*ndivy; iy >= 2; iy -- ){
    let cline = filebuffer[0].trim();
    let words = cline.split(/\s+/);
    for( let ix = 2; ix <= 2*ndivx; ix ++ ){
      qdatap[ix][iy] = words[ix-2];
    }
    filebuffer.shift();
  }
  return;
}
//%}}}
// oaefileinput_main_qdatac %{{{
function oaefileinput_main_qdatac(){
  'use strict';
  for( let iy = ndivy; iy >= 1; iy -- ){
    let cline = filebuffer[0].trim();
    let words = cline.split(/\s+/);
    for( let ix = 1; ix <= ndivx; ix ++ ){
      qdatac[ix][iy] = words[ix-1];
    }
    filebuffer.shift();
  }
  return;
}
//%}}}
// oaefileinput_main_qdatan %{{{
function oaefileinput_main_qdatan(){
  'use strict';
  return;
}
//%}}}
// oaefileinput_main_adatac %{{{
function oaefileinput_main_adatac(){
  'use strict';
  for( let iy = ndivy; iy >= 1; iy -- ){
    let cline = filebuffer[0].trim();
    let words = cline.split(/\s+/);
    for( let ix = 1; ix <= ndivx; ix ++ ){
      adatac[ix][iy] = words[ix-1];
    }
    filebuffer.shift();
  }
  return;
}
//%}}}
// oaefileinput_main_adatav %{{{
function oaefileinput_main_adatav(){
  'use strict';
  if( allowborderwall ){
    for( let iy = ndivy; iy >= 1; iy -- ){
      let cline = filebuffer[0].trim();
      let words = cline.split(/\s+/);
      for( let ix = 0; ix <= ndivx; ix ++ ){
        adatav[ix][iy] = words[ix];
      }
      filebuffer.shift();
    }
  } else {
    for( let iy = ndivy; iy >= 1; iy -- ){
      let cline = filebuffer[0].trim();
      let words = cline.split(/\s+/);
      for( let ix = 1; ix < ndivx; ix ++ ){
        adatav[ix][iy] = words[ix-1];
      }
      filebuffer.shift();
    }
  }
  return;
}
//%}}}
// oaefileinput_main_adatah %{{{
function oaefileinput_main_adatah(){
  'use strict';
  if( allowborderwall ){
    for( let iy = ndivy; iy >= 0; iy -- ){
      let cline = filebuffer[0].trim();
      let words = cline.split(/\s+/);
      for( let ix = 1; ix <= ndivx; ix ++ ){
        adatah[ix][iy] = words[ix-1];
      }
      filebuffer.shift();
    }
  } else {
    for( let iy = ndivy-1; iy >= 1; iy -- ){
      let cline = filebuffer[0].trim();
      let words = cline.split(/\s+/);
      for( let ix = 1; ix <= ndivx; ix ++ ){
        adatah[ix][iy] = words[ix-1];
      }
      filebuffer.shift();
    }
  }
  return;
}
//%}}}

// oae_duplicateboard %{{{
function oae_duplicateboard(){
  'use strict';
  // 現在盤面の複製（履歴はコピーしない、主に解きチェック用）
  let str = oaefileoutput_base();
  str = str.replace(/\n/g,'%N');
  str = str.replace(/\s/g,'%S');
  window.open(location.href+'?file='+str);
  return;
}
//%}}}
// oaerewriteall %{{{
function oaerewriteall(){
  'use strict';
  oaesizeadjust();
  oae_clearcanvas(bgcontext);
  oae_clearcanvas(gdcontext);
  oae_clearcanvas(mncontext);
  oae_clearcanvas(fgcontext);
  oaedrawgrid();
  oaedrawhist();
  oaedrawqdata();
  oaedrawadata();
  oaedrawui();
}
//%}}}

// oae_histpush %{{{
function oae_histpush(){
  'use strict';
  if( histstack.length-1 !== histpos ){
    histstack.splice(histpos+1,histstack.length-histpos-1);
    histpos = histstack.length-1;
  }
  //--------------------------
  // 以下の方法でも良いが、Histobjのままにしておいた方が良さそう？
  //let h = new Histobj(qdatac,qdatav,qdatah,qdatap,adatac,adatav,adatah);
  //h = JSON.parse(JSON.stringify(h));
  //--------------------------
  // stringifyは負ラベルの配列要素を消去する
  let h = new Histobj(
    JSON.stringify(qdatac),
    JSON.stringify(qdatav),
    JSON.stringify(qdatah),
    JSON.stringify(qdatap),
    JSON.stringify(qdatan),
    JSON.stringify(adatac),
    JSON.stringify(adatav),
    JSON.stringify(adatah)
  );
  histstack.push(h);
  histpos = histstack.length-1;
  //--
  //console.log(histstack);
  //--
  oaedrawhist();
}
//%}}}
// oae_histsetpos %{{{
function oae_histsetpos(pos){
  'use strict';
  if( pos < 0 ) return;
  if( pos > histstack.length-1 ) return;
  qdatac = JSON.parse(histstack[pos].qdatac);
  qdatav = JSON.parse(histstack[pos].qdatav);
  qdatah = JSON.parse(histstack[pos].qdatah);
  qdatap = JSON.parse(histstack[pos].qdatap);
  adatac = JSON.parse(histstack[pos].adatac);
  adatav = JSON.parse(histstack[pos].adatav);
  adatah = JSON.parse(histstack[pos].adatah);
  // stringifyしてparseで戻すと負の配列要素が消えてしまうので修正する
  // 負の要素も保持できるような形に修正しておきたい
  // pushのようなずらしを加えるとうまくいく（JavaScriptのpushは負の配列要素を移動しないので人力pushを使用する）
  oaeinitboard_makenegativepadding();
  histpos = pos;
  oaerewriteall();
}
//%}}}
// oae_undo %{{{
function oae_undo(){
  'use strict';
  if( histpos < 1 ) return;
  oae_histsetpos(histpos-1);
}
//%}}}
// oae_redo %{{{
function oae_redo(){
  'use strict';
  if( histpos > histstack.length-2 ) return;
  oae_histsetpos(histpos+1);
}
//%}}}

// ------------------------------------------------------
// oaedrawhist %{{{
function oaedrawhist(){
  'use strict';
  oae_clearcanvas(histcontext);
  oaedrawhist_upbutton(histcontext);
  oaedrawhist_downbutton(histcontext);
  oaedrawhist_bar(histcontext);
  oaedrawhist_currentpoint(histcontext);
  oae_resetstyle(histcontext);
}
//%}}}
// oaedrawhist_upbutton %{{{
function oaedrawhist_upbutton(targetcontext){
  'use strict';
  targetcontext.lineCap = 'round';
  targetcontext.lineJoin = 'round';
  let h1 = 14;
  let h2 = h1+13;
  let g = targetcontext.createLinearGradient(histwidth/2-2,h1,histwidth/2+2,h2);
  if( histstack.length === 1 ){
    g.addColorStop(0,'#fff');
    g.addColorStop(1,'#f2f2f2');
  } else {
    g.addColorStop(0,'#eee');
    g.addColorStop(1,'#ccc');
  }
  oaedrawhist_upbutton_makepath(histcontext);
  targetcontext.lineWidth = 8;
  if( histstack.length === 1 ){
    targetcontext.strokeStyle = '#ddd';
  } else {
    targetcontext.strokeStyle = '#888';
  }
  targetcontext.stroke();
  targetcontext.lineWidth = 6;
  targetcontext.strokeStyle = g;
  targetcontext.stroke();
  targetcontext.fillStyle = g;
  targetcontext.fill();
  targetcontext.beginPath();
  oae_resetstyle(targetcontext);
}
//%}}}
// oaedrawhist_upbutton_makepath %{{{
function oaedrawhist_upbutton_makepath(targetcontext){
  'use strict';
  targetcontext.beginPath();
  let h1 = 14;
  let h2 = h1+13;
  let w = 8;
  targetcontext.moveTo( histwidth/2, h1 );
  targetcontext.lineTo( histwidth/2-w, h2 );
  targetcontext.lineTo( histwidth/2+w, h2 );
  targetcontext.closePath();
}
//%}}}
// oaedrawhist_upbutton_makepath_wrap %{{{
function oaedrawhist_upbutton_makepath_wrap(targetcontext){
  'use strict';
  let h1 = 7;
  let h2 = h1+24;
  let w = 14;
  targetcontext.moveTo( histwidth/2, h1 );
  targetcontext.lineTo( histwidth/2-w, h2 );
  targetcontext.lineTo( histwidth/2+w, h2 );
  targetcontext.closePath();
}
//%}}}
// oaedrawhist_bar %{{{
function oaedrawhist_bar(targetcontext){
  'use strict';
  if( histstack.length === 1 ){
    targetcontext.strokeStyle = '#aaa';
  } else {
    targetcontext.strokeStyle = black;
  }
  targetcontext.lineCap = 'round';
  targetcontext.lineWidth = 1;
  targetcontext.beginPath();
  targetcontext.moveTo( histwidth/2-8, histtopheight );
  targetcontext.lineTo( histwidth/2+8, histtopheight );
  targetcontext.moveTo( histwidth/2, histtopheight );
  targetcontext.lineTo( histwidth/2, histtopheight+histmainheight );
  targetcontext.moveTo( histwidth/2-8, histtopheight+histmainheight );
  targetcontext.lineTo( histwidth/2+8, histtopheight+histmainheight );
  targetcontext.stroke();
  targetcontext.beginPath();
  for( let i = 1; i < histstack.length-1; i ++ ){
    let h = histtopheight + (histmainheight*i/(histstack.length-1));
    targetcontext.moveTo( histwidth/2-2, h );
    targetcontext.lineTo( histwidth/2+2, h );
  }
  targetcontext.stroke();
  targetcontext.beginPath();
  oae_resetstyle(targetcontext);
}
//%}}}
// oaedrawhist_currentpoint %{{{
function oaedrawhist_currentpoint(targetcontext){
  'use strict';
  if( histstack.length === 1 ) return;
  targetcontext.strokeStyle = black;
  targetcontext.lineJoin = 'round';
  targetcontext.lineWidth = 1;
  targetcontext.beginPath();
  let h0 = histtopheight + (histmainheight*histpos/(histstack.length-1));
  let h1 = h0 - 2;
  let h2 = h0 + 2;
  targetcontext.moveTo( histwidth/2-8, h1 );
  targetcontext.lineTo( histwidth/2+8, h1 );
  targetcontext.lineTo( histwidth/2+8, h2 );
  targetcontext.lineTo( histwidth/2-8, h2 );
  targetcontext.closePath();
  targetcontext.stroke();
  targetcontext.beginPath();
  oae_resetstyle(targetcontext);
}
//%}}}
// oaedrawhist_downbutton %{{{
function oaedrawhist_downbutton(targetcontext){
  'use strict';
  targetcontext.lineCap = 'round';
  targetcontext.lineJoin = 'round';
  let h1 = histtopheight + histmainheight + 14;
  let h2 = h1+13;
  let g = targetcontext.createLinearGradient(histwidth/2-2,h1,histwidth/2+2,h2);
  if( histstack.length === 1 ){
    g.addColorStop(0,'#fff');
    g.addColorStop(1,'#f2f2f2');
  } else {
    g.addColorStop(0,'#eee');
    g.addColorStop(1,'#ccc');
  }
  oaedrawhist_downbutton_makepath(histcontext);
  targetcontext.lineWidth = 8;
  if( histstack.length === 1 ){
    targetcontext.strokeStyle = '#ddd';
  } else {
    targetcontext.strokeStyle = '#888';
  }
  targetcontext.stroke();
  targetcontext.lineWidth = 6;
  targetcontext.strokeStyle = g;
  targetcontext.stroke();
  targetcontext.fillStyle = g;
  targetcontext.fill();
  targetcontext.beginPath();
  oae_resetstyle(targetcontext);
}
//%}}}
// oaedrawhist_downbutton_makepath %{{{
function oaedrawhist_downbutton_makepath(targetcontext){
  'use strict';
  targetcontext.beginPath();
  let h1 = 4+histtopheight + histmainheight + 14;
  let h2 = h1+13;
  let w = 8;
  targetcontext.moveTo( histwidth/2-w, h1 );
  targetcontext.lineTo( histwidth/2+w, h1 );
  targetcontext.lineTo( histwidth/2, h2 );
  targetcontext.closePath();
}
//%}}}
// oaedrawhist_downbutton_makepath_wrap %{{{
function oaedrawhist_downbutton_makepath_wrap(targetcontext){
  'use strict';
  let h1 = 4+histtopheight + histmainheight + 10;
  let h2 = h1+23;
  let w = 14;
  targetcontext.moveTo( histwidth/2-w, h1 );
  targetcontext.lineTo( histwidth/2+w, h1 );
  targetcontext.lineTo( histwidth/2, h2 );
  targetcontext.closePath();
}
//%}}}

// oaedrawui %{{{
function oaedrawui(){
  'use strict';
  oae_clearcanvas(ovcontext);
  oaedrawui_resizeguide(ovcontext);
  oaedrawui_cursor(ovcontext);
  oae_resetstyle(ovcontext);
}
//%}}}
// oaedrawui_resizeguide %{{{
function oaedrawui_resizeguide(targetcontext){
  'use strict';
  if( editmode !== 'sz' ) return;
  targetcontext.textAlign = 'left';
  targetcontext.textBaseline = 'top';
  targetcontext.font =
    (Math.floor(guidefontsize*cellunit)).toString(10) + "px 'Helvetica'";
  targetcontext.fillStyle = black;
  let str = (ndivx.toString(10)) + 'x' + (ndivy.toString(10));
  let cx = histwidth + 2;
  let cy = 2;
  targetcontext.fillText(str,cx,cy);
  oae_resetstyle(targetcontext);
}
//%}}}
// oaedrawui_cursor %{{{
function oaedrawui_cursor(targetcontext){
  'use strict';
  if( ! cursorview ) return false;
  if( cursorx === null ) return false;
  if( cursory === null ) return false;
  targetcontext.fillStyle = 'rgb( 0, 0, 100 )';
  targetcontext.globalAlpha = 0.1;
  let cx = leftmargin + (cursorx-0.5) * cellunit;
  let cy = topmargin + (ndivy-cursory+0.5) * cellunit;
  if( editmode === 'sz' || editmode === 'qw' || editmode === 'aw' || editmode === 'qn' ){
    cx += 0.5 * cellunit;
    cy -= 0.5 * cellunit;
  }
  if( editmode === 'qp' ){
    cx = leftmargin + (cursorx-1)/2 * cellunit;
    cy = topmargin + (2*ndivy-cursory+1)/2 * cellunit;
  }
  if( editmode === 'sz' ){
    if( cursorx === ndivx || cursory === 0 ){
      targetcontext.fillStyle = 'rgb( 200, 200, 0 )';
      targetcontext.globalAlpha = 0.4;
    }
  }
  let pf = Math.floor(gridlinewidth * cellunit) % 2 === 1 ? 0.5 : 0;
  if( editmode === 'qp' ){
    targetcontext.moveTo( cx -    0.25*cellwidth, cy -    0.25*cellheight );
    targetcontext.lineTo( cx -    0.25*cellwidth, cy +pf+ 0.25*cellheight );
    targetcontext.lineTo( cx +pf+ 0.25*cellwidth, cy +pf+ 0.25*cellheight );
    targetcontext.lineTo( cx +pf+ 0.25*cellwidth, cy -    0.25*cellheight );
    targetcontext.closePath();
    targetcontext.fill();
  } else {
    targetcontext.moveTo( cx -    0.5*cellwidth, cy -    0.5*cellheight );
    targetcontext.lineTo( cx -    0.5*cellwidth, cy +pf+ 0.5*cellheight );
    targetcontext.lineTo( cx +pf+ 0.5*cellwidth, cy +pf+ 0.5*cellheight );
    targetcontext.lineTo( cx +pf+ 0.5*cellwidth, cy -    0.5*cellheight );
    targetcontext.closePath();
    targetcontext.fill();
  }
  oae_resetstyle(targetcontext);
}
//%}}}

// oaedrawgrid %{{{
function oaedrawgrid(){
  'use strict';
  oae_clearcanvas(gdcontext);
  oae_clearcanvas(bgcontext);
  oaedrawgrid_fillbackground(bgcontext);
  if( gridtype === 'solid' ){
    oaedrawgrid_normalsolidgrid(gdcontext);
    oaedrawgrid_border(gdcontext);
  } else if( gridtype === 'dashed' ){
    oaedrawgrid_normaldashedgrid(gdcontext);
    oaedrawgrid_border(gdcontext);
  } else if( gridtype === 'dotatnode' ){
    oaedrawgrid_dotatnode(gdcontext);
  } else {
  }
  oae_resetstyle(gdcontext);
  oae_resetstyle(bgcontext);
}
//%}}}
// oaedrawgrid_fillbackground %{{{
function oaedrawgrid_fillbackground(targetcontext){
  'use strict';
  targetcontext.fillStyle = white;
  targetcontext.globalAlpha = opacity;
  targetcontext.fillRect( leftmargin, topmargin, gridwidth, gridheight );
  targetcontext.beginPath();
  oae_resetstyle(targetcontext);
}
//%}}}
// oaedrawgrid_normalsolidgrid %{{{
function oaedrawgrid_normalsolidgrid(targetcontext){
  'use strict';
  targetcontext.lineWidth = Math.max( 1, Math.floor(gridlinewidth * cellunit) );
  let pf = targetcontext.lineWidth % 2 === 1 ? 0.5 : 0;
  targetcontext.lineCap = 'round';
  targetcontext.strokeStyle = black;
  targetcontext.beginPath();
  let l = leftmargin;
  let t = topmargin;
  let cu = cellunit;
  for ( let ix = 0; ix <= ndivx; ix ++ ) {
    targetcontext.moveTo( pf+ l + ix*cu, pf+ t            );
    targetcontext.lineTo( pf+ l + ix*cu, pf+ t + ndivy*cu );
  }
  for ( let iy = 0; iy <= ndivy; iy ++ ) {
    targetcontext.moveTo( pf+ l           , pf+ t + iy * cu );
    targetcontext.lineTo( pf+ l + ndivx*cu, pf+ t + iy * cu );
  }
  targetcontext.stroke();
  targetcontext.beginPath();
  oae_resetstyle(targetcontext);
}
//%}}}
// oaedrawgrid_normaldashedgrid %{{{
function oaedrawgrid_normaldashedgrid(targetcontext){
  'use strict';
  targetcontext.lineWidth = Math.max( 1, Math.floor(gridlinewidth * cellunit) );
  let pf = targetcontext.lineWidth % 2 === 1 ? 0.5 : 0;
  targetcontext.lineCap = 'round';
  targetcontext.strokeStyle = black;
  targetcontext.setLineDash( [ griddash0 * cellunit, griddash1 * cellunit ] );
  targetcontext.lineDashOffset = griddash0 * cellunit / 2;
  targetcontext.beginPath();
  let l = leftmargin;
  let t = topmargin;
  let cu = cellunit;
  for ( let ix = 0; ix <= ndivx; ix ++ ) {
    targetcontext.moveTo( pf+ l + ix*cu, pf+ t            );
    targetcontext.lineTo( pf+ l + ix*cu, pf+ t + ndivy*cu );
  }
  for ( let iy = 0; iy <= ndivy; iy ++ ) {
    targetcontext.moveTo( pf+ l           , pf+ t + iy*cu );
    targetcontext.lineTo( pf+ l + ndivx*cu, pf+ t + iy*cu );
  }
  targetcontext.stroke();
  targetcontext.beginPath();
  oae_resetstyle(targetcontext);
}
//%}}}
// oaedrawgrid_dotatnode %{{{
function oaedrawgrid_dotatnode(targetcontext){
  'use strict';
  targetcontext.lineWidth = Math.max( 1, Math.floor(dotsize * cellunit) );
  let pf = targetcontext.lineWidth % 2 === 1 ? 0.5 : 0;
  targetcontext.lineCap = 'round';
  targetcontext.strokeStyle = black;
  targetcontext.setLineDash( [ 0, cellunit ] );
  targetcontext.beginPath();
  let l = leftmargin;
  let t = topmargin;
  let h = (ndivy+1) * cellunit;
  let cu = cellunit;
  for ( let ix = 0; ix <= ndivx; ix ++ ) {
    targetcontext.moveTo( pf+ l + ix*cu, pf+ t     );
    targetcontext.lineTo( pf+ l + ix*cu, pf+ t + h );
  }
  targetcontext.stroke();
  targetcontext.beginPath();
  oae_resetstyle(targetcontext);
}
//%}}}
// oaedrawgrid_border %{{{
function oaedrawgrid_border(targetcontext){
  'use strict';
  targetcontext.lineWidth = Math.max( 1, Math.floor(borderlinewidth * cellunit) );
  let pf = targetcontext.lineWidth % 2 === 1 ? 0.5 : 0;
  targetcontext.lineCap = 'round';
  let l = leftmargin;
  let t = topmargin;
  let cu = cellunit;
  targetcontext.moveTo( pf+ l           , pf+ t            );
  targetcontext.lineTo( pf+ l           , pf+ t + ndivy*cu );
  targetcontext.lineTo( pf+ l + ndivx*cu, pf+ t + ndivy*cu );
  targetcontext.lineTo( pf+ l + ndivx*cu, pf+ t            );
  targetcontext.closePath();
  targetcontext.stroke();
  targetcontext.beginPath();
  oae_resetstyle(targetcontext);
}
//%}}}

// oaedrawqdata %{{{
function oaedrawqdata(){
  'use strict';
  oae_clearcanvas(fgcontext);
  if( hasqdatap ) oaedrawqdata_p();
  if( hasqdatac ) oaedrawqdata_c();
  oae_resetstyle(fgcontext);
}
//%}}}
// oaedrawqdata_p %{{{
function oaedrawqdata_p(){
  'use strict';
  for ( let ix = 2; ix <= 2*ndivx; ix ++ ) {
    let centx = leftmargin + (ix-1) * cellunit/2;
    if( typeof qdatap[ix] === 'undefined'  ){
      oaeerrmsg('undefined fixed: qdatap '+ix.toString(10));
      qdatap[ix] = [];
    }
    for ( let iy = 2; iy <= 2*ndivy; iy ++ ) {
      if( typeof qdatap[ix][iy] === 'undefined' ){
        oaeerrmsg('undefined fixed: qdatap '+ix.toString(10)+' '+iy.toString(10));
        qdatap[ix][iy] = '.';
      }
      if( qdatap[ix][iy] === '.' ) continue;
      let str = qdatap[ix][iy];
      let centy = topmargin + (2*ndivy-iy+1) * cellunit/2;
      if( str === '1' ){
        oaedrawqdata_p_smallcircle(centx,centy,false,fgcontext);
      } else if( str === '2' ){
        oaedrawqdata_p_smallcircle(centx,centy,true,fgcontext);
      }
    }
  }
  oae_resetstyle(fgcontext);
}
//%}}}
// oaedrawqdata_p_smallcircle %{{{
function oaedrawqdata_p_smallcircle(cx,cy,bw,targetcontext){
  'use strict';
  if( bw ){
    targetcontext.fillStyle = black;
  } else {
    targetcontext.fillStyle = white;
  }
  targetcontext.globalAlpha = opacity;
  let cr = cellunit * 0.14;
  targetcontext.arc( cx, cy, cr, 0, Math.PI*2, false );
  targetcontext.fill();
  targetcontext.stroke();
  oae_resetstyle(targetcontext);
}
//%}}}
// oaedrawqdata_c %{{{
function oaedrawqdata_c(){
  'use strict';
  for ( let ix = 1; ix <= ndivx; ix ++ ) {
    let centx = leftmargin + (ix-0.5) * cellunit;
    if( typeof qdatac[ix] === 'undefined' ){
      oaeerrmsg('undefined fixed: qdatac '+ix.toString(10));
      qdatac[ix] = [];
    }
    for ( let iy = 1; iy <= ndivy; iy ++ ) {
      if( typeof qdatac[ix][iy] === 'undefined' ){
        oaeerrmsg('undefined fixed: qdatac '+ix.toString(10)+' '+iy.toString(10));
        qdatac[ix][iy] = '.';
        continue;
      }
      if( qdatac[ix][iy] === '.' ) continue;
      let str = qdatac[ix][iy];
      let centy = topmargin + (ndivy-iy+0.5) * cellunit;
      if( puzzletype === 'pencils' ){
        if( str.substring(0,2).match(/^o[0-9]+$/) !== null ){
          str = str.substring(1);
          oaedrawqdata_c_num(centx,centy,str,fgcontext);
        } else if( str === 'o' ){
          oaedrawqdata_c_num(centx,centy,'?',fgcontext);
        } else {
          pencils.draw_qarrow(centx,centy,str,fgcontext);
        }
      } else if( puzzletype === 'doublechoco' ){
        if( str.match(/^c[0-9]*$/) !== null ){
          oaedrawqdata_c_shade(centx,centy,bgcontext);
        }
        str = str.substring(1);
        if( str !== '' ){
          oaedrawqdata_c_num(centx,centy,str,fgcontext);
        }
      } else if( puzzletype === 'squlin' ){
        oaedrawqdata_c_onum(centx,centy,str,fgcontext);
      } else {
        // default
        oaedrawqdata_c_num(centx,centy,str,fgcontext);
      }
    }
  }
  oae_resetstyle(fgcontext);
}
//%}}}
// oaedrawqdata_c_shade %{{{
function oaedrawqdata_c_shade(cx,cy,targetcontext){
  'use strict';
  targetcontext.fillStyle = problemshadecolor;
  targetcontext.globalAlpha = opacity;
  targetcontext.lineWidth = Math.max( 1, Math.floor(gridlinewidth * cellunit) );
  let pf = targetcontext.lineWidth % 2 === 1 ? 0.5 : 0;
  targetcontext.moveTo( cx -    0.5*cellwidth, cy -    0.5*cellheight );
  targetcontext.lineTo( cx -    0.5*cellwidth, cy +pf+ 0.5*cellheight );
  targetcontext.lineTo( cx +pf+ 0.5*cellwidth, cy +pf+ 0.5*cellheight );
  targetcontext.lineTo( cx +pf+ 0.5*cellwidth, cy -    0.5*cellheight );
  targetcontext.closePath();
  targetcontext.fill();
  oae_resetstyle(targetcontext);
}
//%}}}
// oaedrawqdata_c_num %{{{
function oaedrawqdata_c_num(cx,cy,n,targetcontext){
  'use strict';
  targetcontext.textAlign = 'center';
  targetcontext.textBaseline = 'middle';
  targetcontext.globalAlpha = opacity;
  targetcontext.font =
    (Math.floor(fontsize*cellunit)).toString(10) + "px 'Helvetica'";
  targetcontext.fillStyle = black;
  // [TODO] 数字の表示がずれる問題
  targetcontext.fillText(n,cx,cy+(cellunit/14));
  oae_resetstyle(targetcontext);
}
//%}}}
// oaedrawqdata_c_onum %{{{
function oaedrawqdata_c_onum(cx,cy,n,targetcontext){
  'use strict';
  targetcontext.lineWidth = circlelinewidth * cellunit; // 円を描くときに線幅を整数化する必要はあまりなさそう
  targetcontext.textAlign = 'center';
  targetcontext.textBaseline = 'middle';
  targetcontext.globalAlpha = opacity;
  targetcontext.font =
    (Math.floor(circlefontsize*cellunit)).toString(10) + "px 'Helvetica'";
  targetcontext.fillStyle = white;
  targetcontext.strokeStyle = black;
  let cr = cellunit * 0.40;
  targetcontext.arc( cx, cy, cr, 0, Math.PI*2, false );
  targetcontext.fill();
  targetcontext.stroke();
  // [TODO] 数字の表示がずれる問題(バウンディングボックス関係)
  targetcontext.fillStyle = black;
  //if( n !== '?' ) targetcontext.fillText(n,cx-0.1,cy+2.0);
  if( n !== '?' ) targetcontext.fillText(n,cx-(cellunit/360),cy+(cellunit/22));
  oae_resetstyle(targetcontext);
}
//%}}}

// oaedrawadata %{{{
function oaedrawadata(){
  'use strict';
  oae_clearcanvas(mncontext);
  if( ! aview ) return;
  if( hasadatac ){
    // adatacはしばしばbgレイヤーにも描画を行う
    // opacity指定がある場合重複して描画されてしまう
    // そのため背景も再描画しておく
    oae_clearcanvas(bgcontext);
    oaedrawgrid_fillbackground(bgcontext);
    oaedrawadata_c();
  }
  oaedrawadata_v(mncontext);
  oaedrawadata_h(mncontext);
  oae_resetstyle(mncontext);
}
//%}}}
// oaedrawadata_c %{{{
function oaedrawadata_c(){
  'use strict';
  for ( let ix = 1; ix <= ndivx; ix ++ ) {
    let centx = leftmargin + (ix-0.5) * cellunit;
    if( typeof adatac[ix] === 'undefined' ){
      oaeerrmsg('undefined fixed: adatac '+ix.toString(10));
      adatac[ix] = [];
    }
    for ( let iy = 1; iy <= ndivy; iy ++ ) {
      if( typeof adatac[ix][iy] === 'undefined' ){
        oaeerrmsg('undefined fixed: adatac '+ix.toString(10)+' '+iy.toString(10));
        adatac[ix][iy] = '.';
        continue;
      }
      if( adatac[ix][iy] === '.' ) continue;
      let centy = topmargin + (ndivy-iy+0.5) * cellunit;
      let str = adatac[ix][iy];
      if( str === '=' ){
        oaedrawadata_c_shade(centx,centy,bgcontext);
      } else if( str === '#' ){
        oaedrawadata_c_shade_sub(centx,centy,bgcontext);
      } else {
        pencils.draw_aarrow(centx,centy,str,mncontext);
      }
    }
  }
  oae_resetstyle(mncontext);
}
//%}}}
// oaedrawadata_c_shade %{{{
function oaedrawadata_c_shade(cx,cy,targetcontext){
  'use strict';
  targetcontext.fillStyle = answershadecolor;
  targetcontext.strokeStyle = answershadecolor;
  targetcontext.globalAlpha = opacity;
  targetcontext.lineWidth = Math.max( 1, Math.floor(gridlinewidth * cellunit) );
  let pf = targetcontext.lineWidth % 2 === 1 ? 0.5 : 0;
  targetcontext.moveTo( cx -    0.5*cellwidth, cy -    0.5*cellheight );
  targetcontext.lineTo( cx -    0.5*cellwidth, cy +pf+ 0.5*cellheight );
  targetcontext.lineTo( cx +pf+ 0.5*cellwidth, cy +pf+ 0.5*cellheight );
  targetcontext.lineTo( cx +pf+ 0.5*cellwidth, cy -    0.5*cellheight );
  targetcontext.closePath();
  targetcontext.fill();
  oae_resetstyle(targetcontext);
}
//%}}}
// oaedrawadata_c_shade_sub %{{{
function oaedrawadata_c_shade_sub(cx,cy,targetcontext){
  'use strict';
  targetcontext.strokeStyle = black;
  targetcontext.globalAlpha = opacity;
  targetcontext.lineWidth = Math.max( 1, Math.floor(gridlinewidth * cellunit) );
  let pf = targetcontext.lineWidth % 2 === 1 ? 0.5 : 0;
  targetcontext.moveTo( cx -    0.5*cellwidth, cy -    0.5*cellheight );
  targetcontext.lineTo( cx +pf+ 0.5*cellwidth, cy +pf+ 0.5*cellheight );
  targetcontext.moveTo( cx -    0.5*cellwidth, cy +pf+ 0.5*cellheight );
  targetcontext.lineTo( cx +pf+ 0.5*cellwidth, cy -    0.5*cellheight );
  targetcontext.closePath();
  targetcontext.stroke();
  oae_resetstyle(targetcontext);
}
//%}}}
// oaedrawadata_v %{{{
function oaedrawadata_v(targetcontext){
  'use strict';
  targetcontext.strokeStyle = answerlinecolor;
  targetcontext.globalAlpha = opacity;
  targetcontext.lineCap = 'round';
  targetcontext.lineWidth = Math.max( 1, Math.floor(walllinewidth * cellunit) );
  let pf = targetcontext.lineWidth % 2 === 1 ? 0.5 : 0;
  for ( let ix = 1; ix < ndivx; ix ++ ) {
    let cx = pf+ leftmargin + (ix) * cellunit;
    for ( let iy = 1; iy <= ndivy; iy ++ ) {
      let cy = pf+ topmargin + (ndivy-iy) * cellunit;
      let str = adatav[ix][iy];
      if( str === '1' ){
        targetcontext.moveTo( cx, cy );
        targetcontext.lineTo( cx, cy + cellheight );
        targetcontext.stroke();
        targetcontext.beginPath();
      } else if( str === '-1' ){
        let ch = Math.floor(0.5*cellwidth);
        let chh = Math.ceil(0.5*cellwidth);
        targetcontext.moveTo( cx-chh, cy + ch );
        targetcontext.lineTo( cx+ch, cy + ch );
        targetcontext.stroke();
        targetcontext.beginPath();
      } else {
      }
    }
  }
  if( allowborderwall ){
    for ( let iy = 1; iy <= ndivy; iy ++ ) {
      let cy = pf+ topmargin + (ndivy-iy) * cellunit;
      if( adatav[0][iy] === '1' ){
        let cx = pf+ leftmargin;
        targetcontext.moveTo( cx, cy );
        targetcontext.lineTo( cx, cy + cellheight );
        targetcontext.stroke();
        targetcontext.beginPath();
      }
      if( adatav[ndivx][iy] === '1' ){
        let cx = pf+ leftmargin + ndivx * cellunit;
        targetcontext.moveTo( cx, cy );
        targetcontext.lineTo( cx, cy + cellheight );
        targetcontext.stroke();
        targetcontext.beginPath();
      }
    }
  }
  oae_resetstyle(targetcontext);
}
//%}}}
// oaedrawadata_h %{{{
function oaedrawadata_h(targetcontext){
  'use strict';
  targetcontext.strokeStyle = answerlinecolor;
  targetcontext.globalAlpha = opacity;
  targetcontext.lineCap = 'round';
  targetcontext.lineWidth = Math.max( 1, Math.floor(walllinewidth * cellunit) );
  let pf = targetcontext.lineWidth % 2 === 1 ? 0.5 : 0;
  for ( let ix = 1; ix <= ndivx; ix ++ ) {
    let cx = pf+leftmargin + (ix) * cellunit;
    for ( let iy = 1; iy < ndivy; iy ++ ) {
      let cy = pf+topmargin + (ndivy-iy) * cellunit;
      let str = adatah[ix][iy];
      if( str === '1' ){
        targetcontext.moveTo( cx            , cy );
        targetcontext.lineTo( cx - cellwidth, cy );
        targetcontext.stroke();
        targetcontext.beginPath();
      } else if( str === '-1' ){
        let ch = Math.floor(0.5*cellwidth);
        let chh = Math.ceil(0.5*cellwidth);
        targetcontext.moveTo( cx - chh, cy - chh );
        targetcontext.lineTo( cx - chh, cy + ch );
        targetcontext.stroke();
        targetcontext.beginPath();
      } else {
      }
    }
  }
  if( allowborderwall ){
    for ( let ix = 1; ix <= ndivx; ix ++ ) {
      let cx = pf + leftmargin + ix * cellunit;
      if( adatah[ix][0] === '1' ){
        let cy = pf+ topmargin + ndivy * cellunit;
        targetcontext.moveTo( cx            , cy );
        targetcontext.lineTo( cx - cellwidth, cy );
        targetcontext.stroke();
        targetcontext.beginPath();
      }
      if( adatah[ix][ndivy] === '1' ){
        let cy = pf+ topmargin;
        targetcontext.moveTo( cx            , cy );
        targetcontext.lineTo( cx - cellwidth, cy );
        targetcontext.stroke();
        targetcontext.beginPath();
      }
    }
  }
  oae_resetstyle(targetcontext);
}
//%}}}
// ------------------------------------------------------

// oae_resetstyle %{{{
function oae_resetstyle(targetcontext){
  'use strict';
  targetcontext.beginPath();
  targetcontext.fillStyle = black;
  targetcontext.strokeStyle = black;
  targetcontext.globalAlpha = 1;
  targetcontext.setLineDash([]);
  targetcontext.lineWidth = 1;
}
//%}}}
// oae_clearcanvas %{{{
function oae_clearcanvas(targetcontext){
  'use strict';
  targetcontext.clearRect(0,0,totalwidth,totalheight);
  // 履歴キャンバスの場合はメトリクスが異なるため、汎用的に使えるようにする
  targetcontext.clearRect(0,0,histwidth,histheight);
  targetcontext.beginPath();
}
//%}}}

// oae_eval %{{{
function oae_eval(){
  'use strict';
  let str = document.getElementById('oaeconsolein').value;
  // [TODO] ここで字句解析と構文解析
  oae_eval_cmd(str);
  return;
}
//%}}}
// oae_eval_cmd %{{{
function oae_eval_cmd(str){
  'use strict';
  if( str === 'check' ){
    oae_check();
  } else if( str === 'help' ){
    oae_help();
  } else if( str === 'debug' ){
    oaedebugoutput();
  } else if( str === 'debughist' ){
    oaedebughist();
  } else if( str === 'dup' ){
    oae_duplicateboard();
  } else if( str === 'consoleclean' ){
    oaeconsoleclean();
  } else {
    oaeconsolemsg('未知のコマンドです');
  }
  return;
}
//%}}}
// oae_help %{{{
function oae_help(){
  'use strict';
  let str;
  str = 'コマンド一覧';
  str = str + "<br/> help : このメッセージを表示する";
  str = str + "<br/> check : 正解判定を行う";
  str = str + "<br/> dup : 盤面の複製";
  str = str + "<br/> consoleclean : 出力コンソールエリアのクリア";
  str = str + "<br/> debug : デバッグ（開発者用）";
  str = str + "<br/> debughist : デバッグ（開発者用）";
  oaeconsolemsg(str);
}
//%}}}

// oae_aviewflip %{{{
function oae_aviewflip(){
  'use strict';
  aview = ! aview;
  oaedrawgrid();
  oaedrawqdata();
  oaedrawadata();
  oaedrawui();
  return;
}
//%}}}
// oae_cursorviewflip %{{{
function oae_cursorviewflip(){
  'use strict';
  cursorview = ! cursorview;
  oaedrawui();
  return;
}
//%}}}
// oae_transparentflip %{{{
function oae_transparentflip(){
  'use strict';
  if( opacity === 1 ){
    opacity = 0.6;
  } else {
    opacity = 1;
  }
  oaerewriteall();
  return;
}
//%}}}
// oae_focusheader %{{{
function oae_focusheader(){
  'use strict';
  document.getElementById('oaeheader').focus();
  formfocusing = true;
  return true;
}
//%}}}
// oae_unfocus %{{{
function oae_unfocus(){
  'use strict';
  document.activeElement.blur();
  formfocusing = false;
  return true;
}
//%}}}
// oae_commandenter %{{{
function oae_commandenter(){
  'use strict';
  let obj = document.getElementById('oaeconsolein');
  if( document.activeElement === obj ){
    oae_eval();
  } else {
    obj.focus();
  }
  return;
}
//%}}}
// oae_setmode %{{{
function oae_setmode(){
  'use strict';
  let str = document.getElementById('oaemodeform').oaemode.value;
  let fromsz = false;
  if( editmode === 'sz' ){
    fromsz = true;
    document.getElementById('oaeboard').style.cursor = 'auto';
  }
  editmode = str;
  if( editmode === 'sz' ){
    document.getElementById('oaeboard').style.cursor = 'move';
  }
  if( editmode === 'sz' || fromsz ){
    oaeinithist();
    oaerewriteall();
  }
  oaedrawui();
  return;
}
//%}}}
// oae_decrementmode %{{{
function oae_decrementmode(){
  'use strict';
  // increment, decrementでszモードにならないようにする(履歴が消えるので)
  for( let i = 0; i < 10; i ++ ){
    if( editmode === 'aw' ){
      editmode = 'ac';
    } else if( editmode === 'ac' ){
      editmode = 'ap';
    } else if( editmode === 'ap' ){
      editmode = 'qn';
    } else if( editmode === 'qn' ){
      editmode = 'qw';
    } else if( editmode === 'qw' ){
      editmode = 'qc';
    } else if( editmode === 'qc' ){
      editmode = 'qp';
    } else if( editmode === 'qp' ){
      editmode = 'aw';
    }
    if( document.getElementById('oaemode'+editmode) !== null ){
      break;
    }
  }
  document.getElementById('oaemodeform').oaemode.value = editmode;
  oaedrawui();
  return;
}
//%}}}
// oae_incrementmode %{{{
function oae_incrementmode(){
  'use strict';
  // increment, decrementでszモードにならないようにする(履歴が消えるので)
  for( let i = 0; i < 10; i ++ ){
    if( editmode === 'qp' ){
      editmode = 'qc';
    } else if( editmode === 'qc' ){
      editmode = 'qw';
    } else if( editmode === 'qw' ){
      editmode = 'qn';
    } else if( editmode === 'qn' ){
      editmode = 'ap';
    } else if( editmode === 'ap' ){
      editmode = 'ac';
    } else if( editmode === 'ac' ){
      editmode = 'aw';
    } else if( editmode === 'aw' ){
      editmode = 'qp';
    }
    if( document.getElementById('oaemode'+editmode) !== null ){
      break;
    }
  }
  document.getElementById('oaemodeform').oaemode.value = editmode;
  oaedrawui();
  return;
}
//%}}}
// oae_setcolor %{{{
function oae_setcolor(){
  'use strict';
  problemlinecolor = '#111111';
  problemshadecolor = '#cccccc';
  answerlinecolor = '#319431';
  answershadecolor = '#31ff31';
  if( document.getElementById('oaeproblemlinecolor') !== null ){
    problemlinecolor = document.getElementById('oaeproblemlinecolor').value;
  }
  if( document.getElementById('oaeproblemshadecolor') !== null ){
    problemshadecolor = document.getElementById('oaeproblemshadecolor').value;
  }
  if( document.getElementById('oaeanswerlinecolor') !== null ){
    answerlinecolor = document.getElementById('oaeanswerlinecolor').value;
  }
  if( document.getElementById('oaeanswershadecolor') !== null ){
    answershadecolor = document.getElementById('oaeanswershadecolor').value;
  }
  oaerewriteall();
  return;
}
//%}}}
// oae_check %{{{
function oae_check(){
  'use strict';
  if( puzzletype === 'pencils' ){
    pencils.check();
  } else if( puzzletype === 'doublechoco' ){
    doublechoco.check();
  } else if( puzzletype === 'tentaisho' ){
    tentaisho.check();
  } else if( puzzletype === 'midloop' ){
    midloop.check();
  } else if( puzzletype === 'squlin' ){
    squlin.check();
  } else {
    oaeconsolemsg('未実装です');
  }
  return;
}
//%}}}
// oaedebugoutput %{{{
function oaedebugoutput(){
  'use strict';
  let str = 'debug';
  str = str + '\npuzzletype: ' + puzzletype;
  str = str + '\nndivy: ' + ndivy.toString(10);
  str = str + '\nndivx: ' + ndivx.toString(10);
  str = str + '\n';
  if( hasqdatap ) str = str + 'qdatap\n';
  if( hasqdatap ) str = str + oaefileoutput_main_qdatap();
  if( hasqdatac ) str = str + 'qdatac\n';
  if( hasqdatac ) str = str + oaefileoutput_main_qdatac();
  if( hasqdatan ) str = str + 'qdatan\n';
  if( hasqdatan ) str = str + oaefileoutput_main_qdatan();
  if( hasadatac ) str = str + 'adatac\n';
  if( hasadatac ) str = str + oaefileoutput_main_adatac();
  if( hasadatav ) str = str + 'adatav\n';
  if( hasadatav ) str = str + oaefileoutput_main_adatav();
  if( hasadatah ) str = str + 'adatah\n';
  if( hasadatah ) str = str + oaefileoutput_main_adatah();
  oaeerrmsg(str);
}
//%}}}
// oaedebughist %{{{
function oaedebughist(){
  'use strict';
  oaeerrmsg('debughist');
  oaeerrmsg(histstack);
  //oaeerrmsg( JSON.stringify(histstack[histstack.length-1]).replace(/[\\",]/g,'') );
}
//%}}}

// EOF
