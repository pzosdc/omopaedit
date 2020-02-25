//JavaScript

var symlink = symlink || {
mark: {
  whitecircle: '1',
  blackcircle: '2',
  star: '3'
},
arrow: {
  up: '1',
  down: '2',
  left: '3',
  right: '4'
},
// init %{{{
init: function () {
  'use strict';
  walllinewidth = 0.6;
  return true;
},
//%}}}

// mousemove %{{{
mousemove: function () {
  'use strict';
  if( editmode === 'qc' ){
    //if( qdatac[dragpath[0][0]][dragpath[0][1]].match(/^[1-4]$/) !== null ) return false;
    let relx = dragpath[dragpath.length-1][0] - dragpath[0][0];
    let rely = dragpath[dragpath.length-1][1] - dragpath[0][1];
    symlink.dragarrow(dragpath[0][0],dragpath[0][1],relx,rely);
    oaedrawqdata();
  } else if( editmode === 'aw' ){
    if( button === buttonid.left ){
      oae_wall();
    } else if( button === buttonid.right ){
      oae_path();
    }
  }
  return true;
},
//%}}}
// leftclick %{{{
leftclick: function () {
  'use strict';
  if( editmode === 'qc' ){
    let str = qdatac[focusx][focusy];
    if( str.substring(0,1) === '.' ){
      qdatac[focusx][focusy] = symlink.mark.whitecircle;
    } else if( str.substring(0,1) === symlink.mark.whitecircle ){
      qdatac[focusx][focusy] = symlink.mark.blackcircle;
    } else if( str.substring(0,1) === symlink.mark.blackcircle ){
      qdatac[focusx][focusy] = symlink.mark.star;
    } else {
      qdatac[focusx][focusy] = '.';
    }
    oaedrawqdata();
  }
},
//%}}}
// rightclick %{{{
rightclick: function () {
  'use strict';
  if( editmode === 'qc' ){
    let str = qdatac[focusx][focusy];
    if( str.substring(0,1) === '.' ){
      qdatac[focusx][focusy] = symlink.mark.star;
    } else if( str.substring(0,1) === symlink.mark.star ){
      qdatac[focusx][focusy] = symlink.mark.blackcircle;
    } else if( str.substring(0,1) === symlink.mark.blackcircle ){
      qdatac[focusx][focusy] = symlink.mark.whitecircle;
    } else {
      qdatac[focusx][focusy] = '.';
    }
    oaedrawqdata();
  }
},
//%}}}
// keydown %{{{
keydown: function (n) {
  'use strict';
  if( editmode === 'qc' ){
    oaedrawqdata();
  } else if( editmode === 'ac' ){
  }
},
//%}}}

// shadetoggle %{{{
shadetoggle: function (str) {
  'use strict';
  // shadeできないセルの条件もここに書くことができる
  if( qdatac[focusx][focusy].match(/^[1-4]$/) !== null ) return null;
  if( adatac[focusx][focusy].match(/^[1-4]$/) !== null ) return null;
  return ( str === '.' ) ? '=' : '.';
},
//%}}}
// dragarrow %{{{
dragarrow: function (ix,iy,rx,ry){
  'use strict';
  if( editmode === 'qc' ){
    let waystr;
    if( rx + ry > 0 && rx - ry < 0 ){ waystr = symlink.arrow.up;
    } else if( rx + ry < 0 && rx - ry > 0 ){ waystr = symlink.arrow.down;
    } else if( rx + ry < 0 && rx - ry < 0 ){ waystr = symlink.arrow.left;
    } else if( rx + ry > 0 && rx - ry > 0 ){ waystr = symlink.arrow.right;
    } else { waystr = ''; // 45 degrees
    }
    if( waystr !== '' ){
      let str = focusprevstate;
      waystr = symlink.mark.blackcircle + waystr;
      qdatac[ix][iy] = ( str === waystr ) ? symlink.mark.blackcircle : waystr;
    }
    oaedrawqdata();
  }
},
// %}}}

// draw_qdata %{{{
draw_qdata: function(cx,cy,n,targetcontext){
  'use strict';
  targetcontext.strokeStyle = black;
  targetcontext.globalAlpha = opacity;
  targetcontext.lineWidth = Math.max( 1, Math.floor(circlelinewidth * cellunit) );
  targetcontext.lineCap = 'round';
  targetcontext.lineJoin = 'round';
  let cr = cellunit * 0.5;
  if( n === symlink.mark.whitecircle ){
    targetcontext.fillStyle = white;
    targetcontext.arc( cx, cy, cr, 0, Math.PI*2, false );
    targetcontext.fill();
    targetcontext.stroke();
    targetcontext.beginPath();
  } else if( n.substring(0,1) === symlink.mark.blackcircle ){
    targetcontext.fillStyle = black;
    targetcontext.arc( cx, cy, cr, 0, Math.PI*2, false );
    targetcontext.fill();
    targetcontext.stroke();
    targetcontext.beginPath();
    if( n !== symlink.mark.blackcircle ){
      symlink.drawarrow(cx,cy,n.substring(1,2),targetcontext);
    }
  } else if( n === symlink.mark.star ){
    targetcontext.fillStyle = white;
    targetcontext.lineJoin = 'miter';
    let r = 0.8 * 0.5 * cellunit;
    let d = 0.8 * 0.2 * cellunit;
    targetcontext.moveTo( cx, cy - r );
    targetcontext.lineTo( cx + d * Math.sin(Math.PI/5), cy - d * Math.cos(Math.PI/5) );
    targetcontext.lineTo( cx + r * Math.sin(Math.PI*2/5), cy - r * Math.cos(Math.PI*2/5) );
    targetcontext.lineTo( cx + d * Math.sin(Math.PI*3/5), cy - d * Math.cos(Math.PI*3/5) );
    targetcontext.lineTo( cx + r * Math.sin(Math.PI*4/5), cy - r * Math.cos(Math.PI*4/5) );
    targetcontext.lineTo( cx + d * Math.sin(Math.PI*5/5), cy - d * Math.cos(Math.PI*5/5) );
    targetcontext.lineTo( cx + r * Math.sin(Math.PI*6/5), cy - r * Math.cos(Math.PI*6/5) );
    targetcontext.lineTo( cx + d * Math.sin(Math.PI*7/5), cy - d * Math.cos(Math.PI*7/5) );
    targetcontext.lineTo( cx + r * Math.sin(Math.PI*8/5), cy - r * Math.cos(Math.PI*8/5) );
    targetcontext.lineTo( cx + d * Math.sin(Math.PI*9/5), cy - d * Math.cos(Math.PI*9/5) );
    targetcontext.closePath();
    targetcontext.fill();
    targetcontext.stroke();
    targetcontext.beginPath();
  }
  oae_resetstyle(targetcontext);
},
//%}}}
// drawarrow %{{{
drawarrow: function (cx,cy,n,targetcontext){
  // cellunitが奇数の場合(cx,cy)は整数からずれている
  // 何も考えずに整数化するとグリッド線からずれてしまう
  'use strict';
  targetcontext.fillStyle = white;
  targetcontext.strokeStyle = black;
  targetcontext.globalAlpha = opacity;
  targetcontext.lineWidth = Math.max( 1, Math.floor(gridlinewidth * cellunit) );
  targetcontext.lineCap = 'round';
  targetcontext.lineJoin = 'round';
  let pf = targetcontext.lineWidth % 2 === 1 ? 0.5 : 0;
  targetcontext.save();
  targetcontext.translate(cx,cy);
  if( n === symlink.arrow.up ){
    targetcontext.rotate(-Math.PI/2);
  } else if( n === symlink.arrow.down ){
    targetcontext.rotate(Math.PI/2);
  } else if( n === symlink.arrow.left ){
    targetcontext.rotate(Math.PI);
  } else if( n === symlink.arrow.right ){
  }
  let b = -0.4 * cellunit;
  let c = 0.08 * cellunit;
  let f = 0.4 * cellunit;
  let w = 0.06 * cellunit;
  let r = 0.20 * cellunit;
  targetcontext.moveTo( b, w );
  targetcontext.lineTo( c, w );
  targetcontext.lineTo( c, r );
  targetcontext.lineTo( f, 0 );
  targetcontext.lineTo( c, -r );
  targetcontext.lineTo( c, -w );
  targetcontext.lineTo( b, -w );
  targetcontext.closePath();
  targetcontext.fill();
  targetcontext.beginPath();
  targetcontext.restore();
  oae_resetstyle(targetcontext);
},
//%}}}

// pzprfileinput %{{{
pzprfileinput: function () {
  'use strict';
  //pencils.pzprfileinput_qdatac();
  //oaefileinput_main_adatav();
  //oaefileinput_main_adatah();
  //pencils.pzprfileinput_adatasennv();
  //pencils.pzprfileinput_adatasennh();
  //pencils.pzprfileinput_adatac();
},
//%}}}

// pzprfileoutput %{{{
pzprfileoutput: function () {
  'use strict';
  // puzz.link format (Aug. 2019)
  let str;
  str = 'pzprv3';
  str = str + '\n' + puzzletype;
  str = str + '\n' + ndivy.toString(10);
  str = str + '\n' + ndivx.toString(10);
  str = str + '\n';
  //str = str + pencils.pzprfileoutput_qdatac();
  //str = str + pencils.pzprfileoutput_adatajikuv();
  //str = str + pencils.pzprfileoutput_adatajikuh();
  //str = str + pencils.pzprfileoutput_adatasennv();
  //str = str + pencils.pzprfileoutput_adatasennh();
  //str = str + pencils.pzprfileoutput_adatac();
  return str;
},
//%}}}

// check %{{{
check: function () {
  'use strict';
  let acc = symlink.hasacceptableanswer();
  if( acc[0] ){
    oaeconsolemsg('正解です');
  } else {
    oaeconsolemsg('マス('+acc[1].posx.toString(10)+','+acc[1].posy.toString(10)+') '+acc[1].errmsg);
  }
  return;
},
//%}}}
// hasacceptableanswer %{{{
hasacceptableanswer: function () {
  'use strict';
  return [true,{}];
},
//%}}}

// nop %{{{
nop: function () {
  'use strict';
  return;
}
//%}}}
};

// EOF
