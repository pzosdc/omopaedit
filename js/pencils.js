//JavaScript

var pencils = pencils || {
coresize: 0.22,
core: {
  up: '1',
  down: '2',
  left: '3',
  right: '4'
},
clevercheckconditlist : [
  { tag: 'syntax_error'        , msg: '不正な文法                      '},
  { tag: 'core_on_jiku'        , msg: '軸と芯の重複                    '},
  { tag: 'line_on_jiku'        , msg: '軸と線の重複                    '},
  { tag: 'isolate_core'        , msg: '軸とも線ともつながらない芯      '},
  { tag: 'isolate_line'        , msg: '芯とつながっていない線          '},
  { tag: 'isolate_jiku'        , msg: '芯とつながっていない軸          '},
  { tag: 'share_line'          , msg: '複数の芯とつながる線            '},
  { tag: 'share_jiku'          , msg: '複数の芯とつながる軸            '},
  { tag: 'split_line'          , msg: '枝分かれしている線              '},
  { tag: 'split_jiku'          , msg: '枝分かれしている軸              '},
  { tag: 'loop_line'           , msg: 'ループしている線                '},
  { tag: 'loop_jiku'           , msg: 'ループしている軸                '},
  { tag: 'curve_jiku'          , msg: '曲っている軸                    '},
  { tag: 'unequal_length_core' , msg: '芯から出る軸と線の長さの不一致  '},
  { tag: 'false_number'        , msg: '数が正しい長さの軸になっていない'},
  { tag: 'empty_cell'          , msg: '軸でも線でもないマス            '},
  { tag: 'nowall_jiku'         , msg: '軸マスと非軸マスの間に壁がない  '},
  { tag: 'isolate_wall'        , msg: '非軸マスと非軸マスの間に壁がある'}
],
// init %{{{
init: function () {
  'use strict';
  pencils.coresize = 0.22;
  return true;
},
//%}}}

// mousemove %{{{
mousemove: function () {
  'use strict';
  if( editmode === 'qc' ){
    if( adatac[dragpath[0][0]][dragpath[0][1]].match(/^[1-4]$/) !== null ) return false;
    let relx = dragpath[dragpath.length-1][0] - dragpath[0][0];
    let rely = dragpath[dragpath.length-1][1] - dragpath[0][1];
    pencils.dragarrow(dragpath[0][0],dragpath[0][1],relx,rely);
    adatac[dragpath[0][0]][dragpath[0][1]] = '.';
    oaerewriteall();
  } else if( editmode === 'ac' ){
    if( button === buttonid.left ){
      if( qdatac[dragpath[0][0]][dragpath[0][1]].match(/^[1-4]$/) !== null ){
        // 問題の芯からドラッグ
        if( pencils.dragfromcoreisjiku() ){ // ドラッグの最初だけでなく常に判定することによって引き返しに対応
          pencils.jikushade();
        } else {
          pencils.path();
        }
      } else if( pencils.isinjiku(dragpath[0][0],dragpath[0][1]) ){
        if( pencils.isatjikuend(dragpath[0][0],dragpath[0][1]) ){
          pencils.reconfigurejiku(dragpath[0][0],dragpath[0][1]);
          pencils.jikushade();
        }
      } else {
        if( qdatac[dragpath[0][0]][dragpath[0][1]].match(/^o/) !== null ) return true;
        let relx = dragpath[dragpath.length-1][0] - dragpath[0][0];
        let rely = dragpath[dragpath.length-1][1] - dragpath[0][1];
        pencils.dragarrow(dragpath[0][0],dragpath[0][1],relx,rely);
      }
    } else if( button === buttonid.right ){
      if( qdatac[dragpath[0][0]][dragpath[0][1]].match(/^[1-4]$/) !== null ||
      adatac[dragpath[0][0]][dragpath[0][1]].match(/^[1-4]$/) !== null ){
        // 芯から右ドラッグ
        if( pencils.dragfromcoreisjiku() ){
          pencils.jikushade();
        } else {
          pencils.path();
        }
      } else {
        oae_shade();
      }
    }
    oaedrawadata();
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
    if( adatac[focusx][focusy].match(/^[1-4]$/) !== null ) return false;
    let str = qdatac[focusx][focusy];
    if( str.match(/^o[0-9]+$/) !== null ){
      // number
      let num = parseInt(str.substring(1),10);
      num ++;
      if( num > Math.max(ndivx,ndivy)-1 ){
        qdatac[focusx][focusy] = '.';
      } else {
        qdatac[focusx][focusy] = 'o' + num.toString(10);
      }
    } else {
      qdatac[focusx][focusy] = 'o1';
    }
    oaedrawqdata();
  } else if( editmode === 'ac' ){
    if( qdatac[focusx][focusy].match(/^[1-4]$/) !== null ) return false;
    if( qdatac[focusx][focusy].substring(0,1) === 'o' ){
      adatac[focusx][focusy] = adatac[focusx][focusy] === '=' ? '.' : '=';
      oaerewriteall();
      return;
    }
    let str = adatac[focusx][focusy];
    if( str === '=' ){
      adatac[focusx][focusy] = '.';
    } else if( str.match(/^[1-4]$/) !== null ){
      let num = parseInt(str,10);
      num ++;
      if( num === 5 ){
        adatac[focusx][focusy] = '=';
      } else {
        adatac[focusx][focusy] = num.toString(10);
      }
    } else {
      adatac[focusx][focusy] = '1';
    }
    oaerewriteall();
  }
},
//%}}}
// rightclick %{{{
rightclick: function () {
  'use strict';
  if( editmode === 'qc' ){
    if( adatac[focusx][focusy].match(/^[1-4]$/) !== null ) return false;
    let str = qdatac[focusx][focusy];
    if( str.match(/^o[0-9]+$/) !== null ){
      // number
      let num = parseInt(str.substring(1),10);
      num --;
      if( num === 0 ){
        qdatac[focusx][focusy] = 'o';
      } else {
        qdatac[focusx][focusy] = 'o' + num.toString(10);
      }
    } else if( str === 'o' ){
        qdatac[focusx][focusy] = '4';
    } else if( str.match(/^[1-4]$/) !== null ){
      let num = parseInt(str,10);
      num --;
      if( num === 0 ){
        qdatac[focusx][focusy] = '.';
      } else {
        qdatac[focusx][focusy] = num.toString(10);
      }
    } else {
      let num = Math.max(ndivx,ndivy) - 1;
      qdatac[focusx][focusy] = 'o' + num.toString(10);
    }
    oaedrawqdata();
  } else if( editmode === 'ac' ){
    oae_shade();
  }
},
//%}}}
// keydown %{{{
keydown: function (n) {
  'use strict';
  if( editmode === 'qc' ){
    let str = qdatac[cursorx][cursory];
    if( n === -2 ){
      str = '.';
    } else if( n >= 11 && n <= 14 ){
      str = (n-10).toString(10);
    } else if( n >= 0 && n <= 9 ){
      if( str.match(/^o[0-9]+$/) !== null ){
        str = str + n.toString(10);
        if( parseInt(str.substring(1),10) > Math.max(ndivx,ndivy)-1 ){
          str = 'o' + n.toString(10);
          if( parseInt(str.substring(1),10) > Math.max(ndivx,ndivy)-1 ){
            str = '.';
          }
          if( str === 'o0' ) str = '.';
        }
      } else {
        str = 'o' + n.toString(10);
        if( parseInt(str.substring(1),10) > Math.max(ndivx,ndivy)-1 ){
          str = '.';
        }
        if( str === 'o0' ) str = '.';
      }
    } else if( n === -1 ){
      // BS
      if( str.match(/^o[0-9]+$/) !== null ){
        str = str.substring(0,str.length-1);
        if( str === 'o' ) str = '.';
      } else {
        str = '.';
      }
    } else if( n === -3 ){
      // -
      if( str === 'o' ){
        str = '.';
      } else {
        str = 'o';
      }
    }
    qdatac[cursorx][cursory] = str;
    oaedrawqdata();
  } else if( editmode === 'ac' ){
  }
},
//%}}}

// dragfromcoreisjiku %{{{
dragfromcoreisjiku: function (){
  // 芯から後ろ方向（軸方向）にドラッグした場合は軸の描画、そうでない場合は線の描画
  'use strict';
  let dx = dragpath[1][0] - dragpath[0][0];
  let dy = dragpath[1][1] - dragpath[0][1];
  let dir;
  if( dx === 0 && dy === 1 ){
    dir = pencils.core.down;
  } else if( dx === 0 && dy === -1 ){
    dir = pencils.core.up;
  } else if( dx === -1 && dy === 0 ){
    dir = pencils.core.right;
  } else if( dx === 1 && dy === 0 ){
    dir = pencils.core.left;
  }
  if( dir === qdatac[dragpath[0][0]][dragpath[0][1]] ){
    return true;
  } else if( dir === adatac[dragpath[0][0]][dragpath[0][1]] ){
    return true;
  }
  return false;
},
//%}}}
// jikushade %{{{
jikushade: function (){
  'use strict';
  let n = dragpath.length;
  if( n === 1 ) return;
  let px = dragpath[n-2][0];
  let py = dragpath[n-2][1];
  let cx = dragpath[n-1][0];
  let cy = dragpath[n-1][1];
  if( n === 2 ){
    if( qdatac[cx][cy].match(/^[1-4]$/) !== null ||
    adatac[cx][cy].match(/^[1-4]$/) !== null ){
      // 芯の後ろに芯がある場合にドラッグをキャンセルする機能
      oae_initdrag();
      return;
    }
    focusprevstate = adatac[dragpath[1][0]][dragpath[1][1]];
    if( isshaded(focusprevstate) ){
      celleraser = true;
    } else {
      celleraser = false;
    }
    isfirstcellchange = false;
  }
  if( n >= 3 && dragpath[n-1][0] === dragpath[n-3][0] && dragpath[n-1][1] === dragpath[n-3][1] ){
    dragpath.pop();
    dragpath.pop();
    pencils.retracejiku(px,py);
    return;
  }
  if( ! celleraser ){
    if( qdatac[cx][cy].match(/^[1-4]$/) !== null ||
    adatac[cx][cy].match(/^[1-4]$/) !== null ||
    isshaded(adatac[cx][cy]) ||
    cellisoutside(cx,cy) ||
    Math.pow(cx-px,2) + Math.pow(cy-py,2) !== 1 ){
      // 既に芯や軸があるセルへのドラッグは無効
      // 盤面の外やカーソルジャンプも無効
      dragpath.pop();
      return;
    }
  }
  pencils.makejiku();
  oae_shade();
  return;
},
//%}}}
// makejiku %{{{
makejiku: function (){
  // 軸の拡張処理
  'use strict';
  let n = dragpath.length;
  let px = dragpath[n-2][0]; // p = previous
  let py = dragpath[n-2][1];
  let cx = dragpath[n-1][0]; // c = current
  let cy = dragpath[n-1][1];
  let dx = cx - px;
  let dy = cy - py;
  if( cellisoutside(cx,cy) ) return;
  if( celleraser ){
    if( ! isshaded(adatac[cx-1][cy]) ) adatav[cx-1][cy] = '0';
    if( ! isshaded(adatac[cx+1][cy]) ) adatav[cx][cy] = '0';
    if( ! isshaded(adatac[cx][cy-1]) ) adatah[cx][cy-1] = '0';
    if( ! isshaded(adatac[cx][cy+1]) ) adatah[cx][cy] = '0';
    return;
  }
  let dir;
  if( dx === 0 && dy === 1 ){    dir = pencils.core.up;
  } else if( dx === 0 && dy === -1 ){    dir = pencils.core.down;
  } else if( dx === -1 && dy === 0 ){    dir = pencils.core.left;
  } else if( dx === 1 && dy === 0 ){    dir = pencils.core.right;
  } else { return; // マウスカーソルの高速移動等で飛んだ場合はreturn
  }
  if( dir === pencils.core.up ){
    adatah[cx][cy-1] = '0';
  } else if( dir === pencils.core.down ){
    adatah[cx][cy] = '0';
  } else if( dir === pencils.core.left ){
    adatav[cx][cy] = '0';
  } else if( dir === pencils.core.right ){
    adatav[cx-1][cy] = '0';
  }
  // ここのコードが少し汚いのでもう少し整理したい
  if( dir === pencils.core.up ){
    if( ! isshaded(adatac[cx-1][cy  ]) || ! isshaded(adatac[cx][cy]) ) adatav[cx-1][cy] = '1';
    if( ! isshaded(adatac[cx+1][cy  ]) || ! isshaded(adatac[cx][cy]) ) adatav[cx  ][cy] = '1';
    if( ! isshaded(adatac[cx  ][cy+1]) || ! isshaded(adatac[cx][cy]) ) adatah[cx  ][cy] = '1';
  } else if( dir === pencils.core.down ){
    if( ! isshaded(adatac[cx-1][cy  ]) || ! isshaded(adatac[cx][cy]) ) adatav[cx-1][cy  ] = '1';
    if( ! isshaded(adatac[cx+1][cy  ]) || ! isshaded(adatac[cx][cy]) ) adatav[cx  ][cy  ] = '1';
    if( ! isshaded(adatac[cx  ][cy-1]) || ! isshaded(adatac[cx][cy]) ) adatah[cx  ][cy-1] = '1';
  } else if( dir === pencils.core.left ){
    if( ! isshaded(adatac[cx-1][cy  ]) || ! isshaded(adatac[cx][cy]) ) adatav[cx-1][cy  ] = '1';
    if( ! isshaded(adatac[cx  ][cy-1]) || ! isshaded(adatac[cx][cy]) ) adatah[cx  ][cy-1] = '1';
    if( ! isshaded(adatac[cx  ][cy+1]) || ! isshaded(adatac[cx][cy]) ) adatah[cx  ][cy  ] = '1';
  } else if( dir === pencils.core.right ){
    if( ! isshaded(adatac[cx+1][cy  ]) || ! isshaded(adatac[cx][cy]) ) adatav[cx][cy  ] = '1';
    if( ! isshaded(adatac[cx  ][cy-1]) || ! isshaded(adatac[cx][cy]) ) adatah[cx][cy-1] = '1';
    if( ! isshaded(adatac[cx  ][cy+1]) || ! isshaded(adatac[cx][cy]) ) adatah[cx][cy  ] = '1';
  }
},
//%}}}
// retracejiku %{{{
retracejiku: function (px,py){
  // 軸描画で引き返しが発生した場合の軸短縮処理
  'use strict';
  let n = dragpath.length;
  let cx = dragpath[n-1][0]; // c = current
  let cy = dragpath[n-1][1];
  let dx = cx - px;
  let dy = cy - py;
  adatac[px][py] = '.';
  let dir;
  if( dx === 0 && dy === 1 ){    dir = pencils.core.up;
  } else if( dx === 0 && dy === -1 ){    dir = pencils.core.down;
  } else if( dx === -1 && dy === 0 ){    dir = pencils.core.left;
  } else if( dx === 1 && dy === 0 ){    dir = pencils.core.right;
  } else {    return; // マウスカーソルの高速移動等で飛んだ場合はreturn
  }
  if( ! isshaded(adatac[px-1][py]) ) adatav[px-1][py] = '0';
  if( ! isshaded(adatac[px+1][py]) ) adatav[px][py] = '0';
  if( ! isshaded(adatac[px][py-1]) ) adatah[px][py-1] = '0';
  if( ! isshaded(adatac[px][py+1]) ) adatah[px][py] = '0';
  if( n !== 1 ){
    if( dir === pencils.core.up ){
      adatah[cx][cy-1] = '1';
    } else if( dir === pencils.core.down ){
      adatah[cx][cy] = '1';
    } else if( dir === pencils.core.left ){
      adatav[cx][cy] = '1';
    } else if( dir === pencils.core.right ){
      adatav[cx-1][cy] = '1';
    }
  }
},
//%}}}
// isinjiku %{{{
isinjiku: function (cx,cy){
  'use strict';
  if( isshaded(adatac[cx][cy]) ) return true;
  return false;
},
//%}}}
// isatjikuend %{{{
isatjikuend: function (cx,cy){
  'use strict';
  // injikuは前提とする
  let wallnum = 0;
  if( adatav[cx-1][cy  ] === '1' ) wallnum += 1;
  if( adatav[cx  ][cy  ] === '1' ) wallnum += 1;
  if( adatah[cx  ][cy-1] === '1' ) wallnum += 1;
  if( adatah[cx  ][cy  ] === '1' ) wallnum += 1;
  if( wallnum === 3 ) return true;
  return false;
},
//%}}}
// reconfigurejiku %{{{
reconfigurejiku: function (x,y){
  'use strict';
  // 軸の先端がクリックされた場合に芯から先端までのドラッグパスを復元する
  // 軸の先端（壁が３つ）から、壁が２つのマスをたどっていく場合、ループになる心配はない
  // ここでは軸に色が塗られているかどうかではなく壁ベースに判断していくことにする
  let cp = [];
  cp.isinarr = function(ix,iy){
    for( let i = 0; i < this.length; i ++ ){
      if( this[i][0] === ix && this[i][1] === iy ) return true;
    }
    return false;
  };
  cp.unshift([x,y]);
  for( let i = 0; i < ndivx*ndivy; i ++ ){
    let cx = cp[0][0];
    let cy = cp[0][1];
    if( i !== 0 ){
      if( qdatac[cx][cy].match(/^[1-4]$/) !== null ||
      adatac[cx][cy].match(/^[1-4]$/) !== null ){
        break;
      }
      let wallnum = 0;
      if( adatav[cx-1][cy  ] === '1' ) wallnum ++;
      if( adatav[cx  ][cy  ] === '1' ) wallnum ++;
      if( adatah[cx  ][cy-1] === '1' ) wallnum ++;
      if( adatah[cx  ][cy  ] === '1' ) wallnum ++;
      if( wallnum !== 2 ){
        // fail return
        return false;
      }
    }
    if( adatav[cx-1][cy  ] !== '1' && ! cp.isinarr(cx-1,cy  ) ){ cp.unshift([cx-1,cy  ]); continue; }
    if( adatav[cx  ][cy  ] !== '1' && ! cp.isinarr(cx+1,cy  ) ){ cp.unshift([cx+1,cy  ]); continue; }
    if( adatah[cx  ][cy-1] !== '1' && ! cp.isinarr(cx  ,cy-1) ){ cp.unshift([cx  ,cy-1]); continue; }
    if( adatah[cx  ][cy  ] !== '1' && ! cp.isinarr(cx  ,cy+1) ){ cp.unshift([cx  ,cy+1]); continue; }
  }
  let newx = dragpath[1][0];
  let newy = dragpath[1][1];
  dragpath = [];
  for( let i = 0; i < cp.length; i ++ ){
    dragpath.push([cp[i][0],cp[i][1]]);
  }
  dragpath.push([newx,newy]);
  celleraser = false;
  isfirstcellchange = false;
  if( adatac[dragpath[0][0]][dragpath[0][1]].match(/^[1-4]$/) !== null ){
    button = buttonid.right;
  }
  return true;
},
//%}}}

// path %{{{
path: function (){
  'use strict';
  let n = dragpath.length;
  let px = dragpath[n-2][0]; // p = previous
  let py = dragpath[n-2][1];
  let cx = dragpath[n-1][0]; // c = current
  let cy = dragpath[n-1][1];
  if( Math.pow(cx-px,2) + Math.pow(cy-py,2) !== 1 || cellisoutside(cx,cy) ||
  qdatac[cx][cy].match(/^[1-4]$/) !== null || adatac[cx][cy].match(/^[1-4]$/) !== null ||
  qdatac[cx][cy].match(/^o/) !== null || isshaded(adatac[cx][cy]) ){
    dragpath.pop();
    return;
  }
  editmode = 'aw'; // 一時的にAWモードにする
  oae_path();
  editmode = 'ac';
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
  let waystr;
  if( rx + ry > 0 && rx - ry < 0 ){ waystr = pencils.core.up;
  } else if( rx + ry < 0 && rx - ry > 0 ){ waystr = pencils.core.down;
  } else if( rx + ry < 0 && rx - ry < 0 ){ waystr = pencils.core.left;
  } else if( rx + ry > 0 && rx - ry > 0 ){ waystr = pencils.core.right;
  } else { waystr = ''; // 45 degrees
  }
  if( editmode === 'qc' ){
    let str = focusprevstate;
    if( waystr !== '' ) qdatac[ix][iy] = ( str === waystr ) ? '.' : waystr;
    oaedrawqdata();
  } else if( editmode === 'ac' ){
    let str = focusprevstate;
    if( waystr !== '' ) adatac[ix][iy] = ( str === waystr ) ? '.' : waystr;
    oaedrawadata();
  }
},
// %}}}

// draw_qarrow %{{{
draw_qarrow: function(cx,cy,n,targetcontext){
  'use strict';
  pencils.drawcore(cx,cy,n,targetcontext,black);
},
//%}}}
// draw_aarow %{{{
draw_aarrow: function(cx,cy,n,targetcontext){
  'use strict';
  pencils.drawcore(cx,cy,n,targetcontext,answerlinecolor);
},
//%}}}
// drawcore %{{{
drawcore: function (cx,cy,n,targetcontext,colorin){
  // cellunitが奇数の場合(cx,cy)は整数からずれている
  // 何も考えずに整数化するとグリッド線からずれてしまう
  'use strict';
  targetcontext.fillStyle = colorin;
  targetcontext.strokeStyle = colorin;
  targetcontext.globalAlpha = opacity;
  targetcontext.lineWidth = Math.max( 1, Math.floor(gridlinewidth * cellunit) );
  targetcontext.lineCap = 'round';
  targetcontext.lineJoin = 'round';
  let pf = targetcontext.lineWidth % 2 === 1 ? 0.5 : 0;
  let d1;
  let d2;
  if( n === pencils.core.up ){
    d1 = [-1,1];
    d2 = [1,1];
  } else if( n === pencils.core.down ){
    d1 = [-1,-1];
    d2 = [1,-1];
  } else if( n === pencils.core.left ){
    d1 = [1,-1];
    d2 = [1,1];
  } else if( n === pencils.core.right ){
    d1 = [-1,-1];
    d2 = [-1,1];
  }
  // cellunitが奇数の場合(cx,cy)は半整数なので、h1やh2と打ち消しあって整数になるはず
  // したがって格子点の座標は整数で正確に得られる
  let h1 = [d1[0]*cellwidth*0.5,d1[1]*cellheight*0.5];
  let h2 = [d2[0]*cellwidth*0.5,d2[1]*cellheight*0.5];
  let pcs = pencils.coresize;
  let p1 = [d1[0]*pcs*cellwidth,d1[1]*pcs*cellheight];
  let p2 = [d2[0]*pcs*cellwidth,d2[1]*pcs*cellheight];
  // 線幅補正
  cx += pf;
  cy += pf;
  targetcontext.moveTo( cx, cy );
  targetcontext.lineTo( cx + h1[0], cy + h1[1] );
  targetcontext.lineTo( cx + h2[0], cy + h2[1] );
  if( targetcontext.lineWidth < 6 ){
    targetcontext.lineTo( cx, cy );
  } else {
    targetcontext.closePath();
  }
  {
    targetcontext.fillStyle = white;
    targetcontext.fill();
  }
  targetcontext.fillStyle = colorin;
  targetcontext.stroke();
  targetcontext.beginPath();
  targetcontext.moveTo( cx, cy );
  targetcontext.lineTo( cx + p1[0], cy + p1[1] );
  targetcontext.lineTo( cx + p2[0], cy + p2[1] );
  if( targetcontext.lineWidth < 6 ){
    targetcontext.lineTo( cx, cy );
  } else {
    targetcontext.closePath();
  }
  targetcontext.fill();
  targetcontext.beginPath();
  oae_resetstyle(targetcontext);
},
//%}}}

// pzprfileinput %{{{
pzprfileinput: function () {
  'use strict';
  // puzz.link format (Aug. 2019)
  pencils.pzprfileinput_qdatac();
  oaefileinput_main_adatav();
  oaefileinput_main_adatah();
  pencils.pzprfileinput_adatasennv();
  pencils.pzprfileinput_adatasennh();
  pencils.pzprfileinput_adatac();
},
//%}}}
// pzprfileinput_qdatac %{{{
pzprfileinput_qdatac: function () {
  'use strict';
  for( let iy = ndivy; iy >= 1; iy -- ){
    let cline = filebuffer[0].trim();
    let words = cline.split(/\s+/);
    for( let ix = 1; ix <= ndivx; ix ++ ){
      if( words[ix-1] === 'o-2' ){
        qdatac[ix][iy] = 'o';
      } else {
        qdatac[ix][iy] = words[ix-1];
      }
    }
    filebuffer.shift();
  }
  return;
},
//%}}}
// pzprfileinput_adatasennv %{{{
pzprfileinput_adatasennv: function (){
  'use strict';
  for( let iy = ndivy; iy >= 1; iy -- ){
    let cline = filebuffer[0].trim();
    let words = cline.split(/\s+/);
    for( let ix = 1; ix < ndivx; ix ++ ){
      if( words[ix-1] === '1' ){
        adatav[ix][iy] = '-1';
      } else if( words[ix-1] === '-1' ){
        //adatav[ix][iy] = '1';
      }
    }
    filebuffer.shift();
  }
  return;
},
//%}}}
// pzprfileinput_adatasennh %{{{
pzprfileinput_adatasennh: function (){
  'use strict';
  for( let iy = ndivy-1; iy >= 1; iy -- ){
    let cline = filebuffer[0].trim();
    let words = cline.split(/\s+/);
    for( let ix = 1; ix <= ndivx; ix ++ ){
      if( words[ix-1] === '1' ){
        adatah[ix][iy] = '-1';
      } else if( words[ix-1] === '-1' ){
        //adatah[ix][iy] = '1';
      }
    }
    filebuffer.shift();
  }
  return;
},
//%}}}
// pzprfileinput_adatac %{{{
pzprfileinput_adatac: function () {
  'use strict';
  for( let iy = ndivy; iy >= 1; iy -- ){
    let cline = filebuffer[0].trim();
    let words = cline.split(/\s+/);
    for( let ix = 1; ix <= ndivx; ix ++ ){
      if( words[ix-1] === '+' ){
        adatac[ix][iy] = '=';
      } else if ( words[ix-1] === '-' ){
        adatac[ix][iy] = '.';
      } else {
        adatac[ix][iy] = words[ix-1];
      }
    }
    filebuffer.shift();
  }
  return;
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
  str = str + pencils.pzprfileoutput_qdatac();
  str = str + pencils.pzprfileoutput_adatajikuv();
  str = str + pencils.pzprfileoutput_adatajikuh();
  str = str + pencils.pzprfileoutput_adatasennv();
  str = str + pencils.pzprfileoutput_adatasennh();
  str = str + pencils.pzprfileoutput_adatac();
  return str;
},
//%}}}
// pzprfileoutput_qdatac %{{{
pzprfileoutput_qdatac: function () {
  'use strict';
  let str = '';
  for( let iy = ndivy; iy >= 1; iy -- ){
    for( let ix = 1; ix <= ndivx; ix ++ ){
      if( qdatac[ix][iy] === 'o' ){
        str = str + ' o-2';
      } else {
        str = str + ' ' + qdatac[ix][iy];
      }
    }
    str = str + '\n';
  }
  return str;
},
//%}}}
// pzprfileoutput_adatajikuv %{{{
pzprfileoutput_adatajikuv: function (){
  'use strict';
  let str = '';
  for( let iy = ndivy; iy >= 1; iy -- ){
    for( let ix = 1; ix < ndivx; ix ++ ){
      if( adatav[ix][iy] === '1' ){
        str = str + ' 1';
      } else {
        str = str + ' 0';
      }
    }
    str = str + '\n';
  }
  return str;
},
//%}}}
// pzprfileoutput_adatajikuh %{{{
pzprfileoutput_adatajikuh: function (){
  'use strict';
  let str = '';
  for( let iy = ndivy-1; iy >= 1; iy -- ){
    for( let ix = 1; ix <= ndivx; ix ++ ){
      if( adatah[ix][iy] === '1' ){
        str = str + ' 1';
      } else {
        str = str + ' 0';
      }
    }
    str = str + '\n';
  }
  return str;
},
//%}}}
// pzprfileoutput_adatasennv %{{{
pzprfileoutput_adatasennv: function (){
  'use strict';
  let str = '';
  for( let iy = ndivy; iy >= 1; iy -- ){
    for( let ix = 1; ix < ndivx; ix ++ ){
      if( adatav[ix][iy] === '-1' ){
        str = str + ' 1';
      } else {
        str = str + ' 0';
      }
    }
    str = str + '\n';
  }
  return str;
},
//%}}}
// pzprfileoutput_adatasennh %{{{
pzprfileoutput_adatasennh: function (){
  'use strict';
  let str = '';
  for( let iy = ndivy-1; iy >= 1; iy -- ){
    for( let ix = 1; ix <= ndivx; ix ++ ){
      if( adatah[ix][iy] === '-1' ){
        str = str + ' 1';
      } else {
        str = str + ' 0';
      }
    }
    str = str + '\n';
  }
  return str;
},
//%}}}
// pzprfileoutput_adatac %{{{
pzprfileoutput_adatac: function () {
  'use strict';
  let str = '';
  for( let iy = ndivy; iy >= 1; iy -- ){
    for( let ix = 1; ix <= ndivx; ix ++ ){
      if( adatac[ix][iy] === '=' ){
        str = str + ' +';
      } else {
        str = str + ' ' + adatac[ix][iy];
      }
    }
    str = str + '\n';
  }
  return str;
},
//%}}}

// check %{{{
check: function () {
  'use strict';
  let acc = pencils.hasacceptableanswer();
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
  // 軸の壁として使われていない壁があるかどうかは検証しない
  // 全てのマスは、軸になるか、線が通過するかのいずれかになる
  let iswood = [];
  let iscollected = [];
  // 最初すべてwoodで初期化
  for( let ix = 1; ix <= ndivx; ix ++ ){
    iswood[ix] = [];
    iscollected[ix] = [];
    for( let iy = 1; iy <= ndivy; iy ++ ){
      iswood[ix][iy] = true;
      iscollected[ix][iy] = false; // collectedは最後に使う
    }
  }
  // 中線が通っているマスを変更
  for( let ix = 1; ix <= ndivx; ix ++ ){
    for( let iy = 1; iy <= ndivy; iy ++ ){
      if( adatav[ix][iy] === '-1' ){
        iswood[ix][iy]   = false;
        iswood[ix+1][iy] = false;
      }
      if( adatah[ix][iy] === '-1' ){
        iswood[ix][iy]   = false;
        iswood[ix][iy+1] = false;
      }
    }
  }
  for( let ix = 1; ix <= ndivx; ix ++ ){
    for( let iy = 1; iy <= ndivy; iy ++ ){
      if( iswood[ix][iy] ){
        // 軸のマスに芯があればエラー
        if( adatac[ix][iy].match(/^[1-4]$/) !== null ){
          return [false,{posx:ix,posy:iy,errmsg:'芯が軸の内部にあります'}];
        } else if( qdatac[ix][iy].match(/^[1-4]$/) !== null ){
          return [false,{posx:ix,posy:iy,errmsg:'芯が軸の内部にあります'}];
        }
      } else {
        // 中線が通っているマスに数字があればエラー
        if( qdatac[ix][iy].match(/^o/) !== null ){
          return [false,{posx:ix,posy:iy,errmsg:'数字の与えられたマスに線を引いています'}];
        }
      }
    }
  }
  // 芯に注目し、分岐がないことを確認しながら、芯に近い所から徐々にcollectしていく
  for( let ix = 1; ix <= ndivx; ix ++ ){
    for( let iy = 1; iy <= ndivy; iy ++ ){
      if( qdatac[ix][iy].match(/^[1-4]$/) === null && adatac[ix][iy].match(/^[1-4]$/) === null ) continue;
      iscollected[ix][iy] = true;
      let cx = ix;
      let cy = iy;
      let woodlength = 0;
      let dx = 0;
      let dy = 0; // (dx,dy)は芯の向きではなくその逆（軸の向き）
      if( qdatac[ix][iy] === '1' || adatac[ix][iy] === '1' ){
        dy = -1;
      } else if( qdatac[ix][iy] === '2' || adatac[ix][iy] === '2' ){
        dy = 1;
      } else if( qdatac[ix][iy] === '3' || adatac[ix][iy] === '3' ){
        dx = 1;
      } else {
        dx = -1;
      }
      if( cx+dx === 0 || cx+dx === ndivx+1 || cy+dy === 0 || cy+dy === ndivy+1 ){
        return [false,{posx:cx,posy:cy,errmsg:'壁から芯が出ています'}];
      }
      let givennumber = -1;
      // 芯の真後ろにある線は無視する
      // 軸の両脇の壁は引かなくても良いことにする
      // 軸の長さを決定する突き当りの壁は必須（外壁があればいらない）
      for( let il = 1; il <= Math.max(ndivx,ndivy); il ++ ){
        cx += dx; cy += dy;
        if( ! iswood[cx][cy] ){
          return [false,{posx:ix,posy:iy,errmsg:'軸が閉じていません'}];
        }
        if( iscollected[cx][cy] ){
          return [false,{posx:ix,posy:iy,errmsg:'複数の軸がつながっています'}];
        }
        if( qdatac[cx][cy].substring(0,1).match(/^o[1-9]/) !== null ){ // 'o'自体は？なので無視
          if( givennumber !== -1 && givennumber !== parseInt(qdatac[cx][cy].substring(1),10) ){
            return [false,{posx:ix,posy:iy,errmsg:'軸に異なる数字が入っています'}];
          }
          givennumber = parseInt(qdatac[cx][cy].substring(1),10);
        }
        if( givennumber !== -1 && il > givennumber ){
          return [false,{posx:ix,posy:iy,errmsg:'軸が与えられた数より長くなっています'}];
        }
        iscollected[cx][cy] = true;
        woodlength = il;
        if( dy === 1 ){
          if( cy === ndivy ) break;
          if( adatah[cx][cy] === '1' ) break;
        } else if( dy === -1 ){
          if( cy === 1 ) break;
          if( adatah[cx][cy-1] === '1' ) break;
        } else if( dx === -1 ){
          if( cx === 1 ) break;
          if( adatav[cx-1][cy] === '1' ) break;
        } else {
          if( cx === ndivx ) break;
          if( adatav[cx][cy] === '1' ) break;
        }
      }
      if( givennumber !== -1 && woodlength !== givennumber ){
        return [false,{posx:ix,posy:iy,errmsg:'軸の長さが与えられた数と異なります'}];
      }
      // 芯の検査が完了したので線の検査に入る
      // 最初と最後以外は常に二つの線がでている必要がある
      cx = ix; cy = iy;
      dx = 0; dy = 0; // 線の検査では(dx,dy)は直前にたどってきた線の向きとする（下から来たなら(0,1)）
      for( let il = 1; il <= woodlength+1; il ++ ){
        // il==1は芯のマスから次のマスへの処理
        let ex = 0; let ey = 0;
        if( cy !== ndivy && adatah[cx][cy] === '-1' && ! ( dx === 0 && dy === -1 ) ){
          ex = 0; ey = 1;
        }
        if( cy !== 1 && adatah[cx][cy-1] === '-1' && ! ( dx === 0 && dy === 1 ) ){
          if( ex !== 0 || ey !== 0 ) return [false,{posx:cx,posy:cy,errmsg:'線が分岐しています'}];
          ex = 0; ey = -1;
        }
        if( cx !== 1 && adatav[cx-1][cy] === '-1' && ! ( dx === 1 && dy === 0 ) ){
          if( ex !== 0 || ey !== 0 ) return [false,{posx:cx,posy:cy,errmsg:'線が分岐しています'}];
          ex = -1; ey = 0;
        }
        if( cx !== ndivx && adatav[cx][cy] === '-1' && ! ( dx === -1 && dy === 0 ) ){
          if( ex !== 0 || ey !== 0 ) return [false,{posx:cx,posy:cy,errmsg:'線が分岐しています'}];
          ex = 1; ey = 0;
        }
        if( il === woodlength+1 && (ex !== 0 || ey !== 0 ) ) return [false,{posx:ix,posy:iy,errmsg:'線が軸より長くなっています'}];
        if( il === woodlength+1 ){
          // 終点に芯があると線が共有されてしまうのでそれも確認しておく
          if( qdatac[cx][cy].match(/^[1-4]$/) !== null || adatac[cx][cy].match(/^[1-4]$/) !== null ){
            return [false,{posx:cx,posy:cy,errmsg:'線を二つの芯が共有しています'}];
          }
          break;
        }
        if( ex === 0 && ey === 0 ) return [false,{posx:ix,posy:iy,errmsg:'線が軸より短くなっています'}];
        cx += ex; dx = ex;
        cy += ey; dy = ey;
        iscollected[cx][cy] = true;
      }
      //console.log(ix,iy,woodlength);
    }
  }
  // 最後に回収しそびれているマスがないか調べる
  for( let ix = 1; ix <= ndivx; ix ++ ){
    for( let iy = 1; iy <= ndivy; iy ++ ){
      if( ! iscollected[ix][iy] ) return [false,{posx:ix,posy:iy,errmsg:'芯とつながらないマスが残っています'}];
    }
  }
  return [true,{}];
},
//%}}}

// -------------------------
// clevercheck %{{{
clevercheck: function () {
  'use strict';
  pencils.clevercheckui_prep();
  oae_clearcanvas(ovcontext);
  oaedrawui_error(ovcontext);
  oae_resetstyle(ovcontext);
  return;
},
//%}}}
// clevercheckui_prep %{{{
clevercheckui_prep: function () {
  'use strict';
  let formstr = '';
  for( let i = 0; i < pencils.clevercheckconditlist.length; i ++ ){
    formstr = formstr +
    '<input type="checkbox" id="clevercheck_' +
    pencils.clevercheckconditlist[i].tag +
    '" checked /><label for="clevercheck_' +
    pencils.clevercheckconditlist[i].tag +
    '" id="clevercheck_label_' +
    pencils.clevercheckconditlist[i].tag +
    '">' +
    pencils.clevercheckconditlist[i].msg +
    '</label><br/>';
  }
  oae_clevercheck_prepcore(formstr);
  return;
},
//%}}}
// clevercheck_main %{{{
clevercheck_main: function () {
  'use strict';
  // 色がついているマスを軸マスと判定
  // 中線が引かれたマスを線マスと判定
  // 軸マスは、壁によって分断されているものとみなす
  // 線に枝分かれがある場合は合計長さを長さとする
  // 軸に枝分かれがある場合は面積を長さとする
  let errorlist = [
    pencils.clevercheck_syntax_error(),
    pencils.clevercheck_core_on_jiku(),
    pencils.clevercheck_line_on_jiku(),
    pencils.clevercheck_isolate_core(),
    pencils.clevercheck_isolate_line(),
    pencils.clevercheck_isolate_jiku(),
    pencils.clevercheck_share_line(),
    pencils.clevercheck_share_jiku(),
    pencils.clevercheck_split_line(),
    pencils.clevercheck_split_jiku(),
    pencils.clevercheck_loop_line(),
    pencils.clevercheck_loop_jiku(),
    pencils.clevercheck_curve_jiku(),
    pencils.clevercheck_unequal_length_core(),
    pencils.clevercheck_false_number(),
    pencils.clevercheck_empty_cell(),
    pencils.clevercheck_nowall_jiku(),
    pencils.clevercheck_isolate_wall()
  ];
  let celllist = [];
  celllist.isinarr = function(ix,iy) {
    for( let i = 0; i < this.length; i ++ ){
      if( this[i][0] === ix && this[i][1] === iy ) return true;
    }
    return false;
  };
  for( let i = 0; i < errorlist.length; i ++ ){
    let tag = pencils.clevercheckconditlist[i].tag;
    let checkedflag = document.getElementById( 'clevercheck_' + tag ).checked;
    let colortag = '#ccc;';
    if( checkedflag && errorlist[i].length > 0 ){
      colortag = '#600';
    }
    document.getElementById( 'clevercheck_label_' + tag ).innerHTML =
    '<span style="color:' + colortag + '">' +
    pencils.clevercheckconditlist[i].msg + ' (該当' + errorlist[i].length.toString(10) + '件)' +
    '</span>';
    if( checkedflag ){
      let l = errorlist[i];
      for( let j = 0; j < l.length; j ++ ){
        let cx = l[j][0];
        let cy = l[j][1];
        if( ! celllist.isinarr(cx,cy) ) celllist.push([cx,cy]);
      }
    }
  }
  delete celllist.isinarr;
  return {cell:celllist};
},
//%}}}
// clevercheck_syntax_error %{{{
clevercheck_syntax_error: function () {
  'use strict';
  let l = [];
  // [TODO]
  return l;
},
//%}}}
// clevercheck_core_on_jiku %{{{
clevercheck_core_on_jiku: function () {
  'use strict';
  let l = [];
  for( let ix = 1; ix <= ndivx; ix ++ ){
    for( let iy = 1; iy <= ndivy; iy ++ ){
      if( adatac[ix][iy] !== '=' ) continue;
      if( qdatac[ix][iy].match(/^[1-4]$/) !== null ){
        l.push([ix,iy]);
      }
    }
  }
  return l;
},
//%}}}
// clevercheck_line_on_jiku %{{{
clevercheck_line_on_jiku: function () {
  'use strict';
  let l = [];
  for( let ix = 1; ix <= ndivx; ix ++ ){
    for( let iy = 1; iy <= ndivy; iy ++ ){
      if( adatac[ix][iy] !== '=' ) continue;
      if( adatav[ix][iy] === '-1' ||
      adatav[ix-1][iy] === '-1' ||
      adatah[ix][iy] === '-1' ||
      adatah[ix][iy-1] === '-1' ){
        l.push([ix,iy]);
      }
    }
  }
  return l;
},
//%}}}
// clevercheck_isolate_core %{{{
clevercheck_isolate_core: function () {
  'use strict';
  let l = [];
  for( let ix = 1; ix <= ndivx; ix ++ ){
    for( let iy = 1; iy <= ndivy; iy ++ ){
      let dir;
      if( qdatac[ix][iy].match(/^[1-4]$/) !== null ){
        dir = qdatac[ix][iy];
      } else if( adatac[ix][iy].match(/^[1-4]$/) !== null ){
        dir = adatac[ix][iy];
      } else {
        continue;
      }
      let jx = ix;
      let jy = iy;
      if( dir === pencils.core.up ) jy --;
      if( dir === pencils.core.down ) jy ++;
      if( dir === pencils.core.right ) jx --;
      if( dir === pencils.core.left ) jx ++;
      let linearr = pencils.clevercheck_getline(ix,iy);
      let jikuarr = pencils.clevercheck_getjiku(jx,jy);
      if( linearr.length === 0 && jikuarr.length === 0 ) l.push([ix,iy]);
    }
  }
  return l;
},
//%}}}
// clevercheck_isolate_line %{{{
clevercheck_isolate_line: function () {
  'use strict';
  let l = [];
  let alreadysearched = [];
  alreadysearched.isinarr = function(ix,iy) {
    for( let i = 0; i < this.length; i ++ ){
      if( this[i][0] === ix && this[i][1] === iy ) return true;
    }
    return false;
  };
  for( let ix = 1; ix <= ndivx; ix ++ ){
    for( let iy = 1; iy <= ndivy; iy ++ ){
      if( alreadysearched.isinarr(ix,iy) ) continue;
      let linearr = pencils.clevercheck_getline(ix,iy);
      if( linearr.length === 0 ) continue;
      let cellarr = pencils.clevercheck_getlinecell(linearr);
      let corefound = false;
      for( let ic = 0; ic < cellarr.length; ic ++ ){
        let cx = cellarr[ic][0];
        let cy = cellarr[ic][1];
        if( qdatac[cx][cy].match(/^[1-4]$/) !== null ){ corefound = true; break;}
        if( adatac[cx][cy].match(/^[1-4]$/) !== null ){ corefound = true; break;}
      }
      for( let ic = 0; ic < cellarr.length; ic ++ ){
        let cx = cellarr[ic][0];
        let cy = cellarr[ic][1];
        alreadysearched.push([cx,cy]);
        if( ! corefound ) l.push([cx,cy]);
      }
    }
  }
  delete l.isinarr;
  return l;
},
//%}}}
// clevercheck_isolate_jiku %{{{
clevercheck_isolate_jiku: function () {
  'use strict';
  let l = [];
  let alreadysearched = [];
  alreadysearched.isinarr = function(ix,iy) {
    for( let i = 0; i < this.length; i ++ ){
      if( this[i][0] === ix && this[i][1] === iy ) return true;
    }
    return false;
  };
  for( let ix = 1; ix <= ndivx; ix ++ ){
    for( let iy = 1; iy <= ndivy; iy ++ ){
      if( adatac[ix][iy] !== '=' ) continue;
      if( alreadysearched.isinarr(ix,iy) ) continue;
      let currentjiku = pencils.clevercheck_getjiku(ix,iy);
      let corefound = false;
      for( let ic = 0; ic < currentjiku.length; ic ++ ){
        let cx = currentjiku[ic][0];
        let cy = currentjiku[ic][1];
        if( qdatac[cx+1][cy] === pencils.core.right ){ corefound = true; break; }
        if( qdatac[cx-1][cy] === pencils.core.left  ){ corefound = true; break; }
        if( qdatac[cx][cy+1] === pencils.core.up    ){ corefound = true; break; }
        if( qdatac[cx][cy-1] === pencils.core.down  ){ corefound = true; break; }
        if( adatac[cx+1][cy] === pencils.core.right ){ corefound = true; break; }
        if( adatac[cx-1][cy] === pencils.core.left  ){ corefound = true; break; }
        if( adatac[cx][cy+1] === pencils.core.up    ){ corefound = true; break; }
        if( adatac[cx][cy-1] === pencils.core.down  ){ corefound = true; break; }
      }
      for( let ic = 0; ic < currentjiku.length; ic ++ ){
        alreadysearched.push(currentjiku[ic]);
        if( ! corefound ) l.push(currentjiku[ic]);
      }
    }
  }
  return l;
},
//%}}}
// clevercheck_share_line %{{{
clevercheck_share_line: function () {
  'use strict';
  let l = [];
  let alreadysearched = [];
  alreadysearched.isinarr = function(ix,iy) {
    for( let i = 0; i < this.length; i ++ ){
      if( this[i][0] === ix && this[i][1] === iy ) return true;
    }
    return false;
  };
  for( let ix = 1; ix <= ndivx; ix ++ ){
    for( let iy = 1; iy <= ndivy; iy ++ ){
      if( alreadysearched.isinarr(ix,iy) ) continue;
      let linearr = pencils.clevercheck_getline(ix,iy);
      if( linearr.length === 0 ) continue;
      let cellarr = pencils.clevercheck_getlinecell(linearr);
      let corefound = 0;
      for( let ic = 0; ic < cellarr.length; ic ++ ){
        let cx = cellarr[ic][0];
        let cy = cellarr[ic][1];
        if( qdatac[cx][cy].match(/^[1-4]$/) !== null ) corefound ++;
        if( adatac[cx][cy].match(/^[1-4]$/) !== null ) corefound ++;
      }
      for( let ic = 0; ic < cellarr.length; ic ++ ){
        let cx = cellarr[ic][0];
        let cy = cellarr[ic][1];
        alreadysearched.push([cx,cy]);
        if( corefound >= 2 ) l.push([cx,cy]);
      }
    }
  }
  delete l.isinarr;
  return l;
},
//%}}}
// clevercheck_share_jiku %{{{
clevercheck_share_jiku: function () {
  'use strict';
  let l = [];
  let alreadysearched = [];
  alreadysearched.isinarr = function(ix,iy) {
    for( let i = 0; i < this.length; i ++ ){
      if( this[i][0] === ix && this[i][1] === iy ) return true;
    }
    return false;
  };
  for( let ix = 1; ix <= ndivx; ix ++ ){
    for( let iy = 1; iy <= ndivy; iy ++ ){
      if( adatac[ix][iy] !== '=' ) continue;
      if( alreadysearched.isinarr(ix,iy) ) continue;
      let currentjiku = pencils.clevercheck_getjiku(ix,iy);
      let corefound = 0;
      for( let ic = 0; ic < currentjiku.length; ic ++ ){
        let cx = currentjiku[ic][0];
        let cy = currentjiku[ic][1];
        if( qdatac[cx+1][cy] === pencils.core.right ){ corefound ++; }
        if( qdatac[cx-1][cy] === pencils.core.left  ){ corefound ++; }
        if( qdatac[cx][cy+1] === pencils.core.up    ){ corefound ++; }
        if( qdatac[cx][cy-1] === pencils.core.down  ){ corefound ++; }
        if( adatac[cx+1][cy] === pencils.core.right ){ corefound ++; }
        if( adatac[cx-1][cy] === pencils.core.left  ){ corefound ++; }
        if( adatac[cx][cy+1] === pencils.core.up    ){ corefound ++; }
        if( adatac[cx][cy-1] === pencils.core.down  ){ corefound ++; }
      }
      for( let ic = 0; ic < currentjiku.length; ic ++ ){
        alreadysearched.push(currentjiku[ic]);
        if( corefound >= 2 ) l.push(currentjiku[ic]);
      }
    }
  }
  return l;
},
//%}}}
// clevercheck_split_line %{{{
clevercheck_split_line: function () {
  'use strict';
  let l = [];
  for( let ix = 1; ix <= ndivx; ix ++ ){
    for( let iy = 1; iy <= ndivy; iy ++ ){
      let freedirnum = 0;
      if( adatav[ix  ][iy] === '-1' ) freedirnum ++;
      if( adatav[ix-1][iy] === '-1' ) freedirnum ++;
      if( adatah[ix][iy  ] === '-1' ) freedirnum ++;
      if( adatah[ix][iy-1] === '-1' ) freedirnum ++;
      if( freedirnum === 3 || freedirnum === 4 ) l.push([ix,iy]);
    }
  }
  return l;
},
//%}}}
// clevercheck_split_jiku %{{{
clevercheck_split_jiku: function () {
  'use strict';
  let l = [];
  for( let ix = 1; ix <= ndivx; ix ++ ){
    for( let iy = 1; iy <= ndivy; iy ++ ){
      if( adatac[ix][iy] !== '=' ) continue;
      let freedirnum = 0;
      if( adatac[ix+1][iy] === '=' && adatav[ix  ][iy] !== '1' ) freedirnum ++;
      if( adatac[ix-1][iy] === '=' && adatav[ix-1][iy] !== '1' ) freedirnum ++;
      if( adatac[ix][iy+1] === '=' && adatah[ix][iy  ] !== '1' ) freedirnum ++;
      if( adatac[ix][iy-1] === '=' && adatah[ix][iy-1] !== '1' ) freedirnum ++;
      if( freedirnum === 3 || freedirnum === 4 ) l.push([ix,iy]);
    }
  }
  return l;
},
//%}}}
// clevercheck_loop_line %{{{
clevercheck_loop_line: function () {
  'use strict';
  let l = [];
  for( let ix = 1; ix <= ndivx; ix ++ ){
    for( let iy = 1; iy <= ndivy; iy ++ ){
      let loopfound = pencils.clevercheck_haslineloop(ix,iy);
      if( loopfound ) l.push([ix,iy]);
    }
  }
  return l;
},
//%}}}
// clevercheck_loop_jiku %{{{
clevercheck_loop_jiku: function () {
  'use strict';
  let l = [];
  for( let ix = 1; ix <= ndivx; ix ++ ){
    for( let iy = 1; iy <= ndivy; iy ++ ){
      let loopfound = pencils.clevercheck_hasjikuloop(ix,iy);
      if( loopfound ) l.push([ix,iy]);
    }
  }
  return l;
},
//%}}}
// clevercheck_curve_jiku %{{{
clevercheck_curve_jiku: function () {
  'use strict';
  let l = [];
  for( let ix = 1; ix <= ndivx; ix ++ ){
    for( let iy = 1; iy <= ndivy; iy ++ ){
      if( adatac[ix][iy] !== '=' ) continue;
      let vnum = 0;
      let hnum = 0;
      if( adatac[ix+1][iy] === '=' && adatav[ix  ][iy] !== '1' ) vnum ++;
      if( adatac[ix-1][iy] === '=' && adatav[ix-1][iy] !== '1' ) vnum ++;
      if( adatac[ix][iy+1] === '=' && adatah[ix][iy  ] !== '1' ) hnum ++;
      if( adatac[ix][iy-1] === '=' && adatah[ix][iy-1] !== '1' ) hnum ++;
      if( vnum !== 0 && hnum !== 0 ) l.push([ix,iy]);
    }
  }
  return l;
},
//%}}}
// clevercheck_unequal_length_core %{{{
clevercheck_unequal_length_core: function () {
  'use strict';
  let l = [];
  for( let ix = 1; ix <= ndivx; ix ++ ){
    for( let iy = 1; iy <= ndivy; iy ++ ){
      let dir;
      if( qdatac[ix][iy].match(/^[1-4]$/) !== null ){
        dir = qdatac[ix][iy];
      } else if( adatac[ix][iy].match(/^[1-4]$/) !== null ){
        dir = adatac[ix][iy];
      } else {
        continue;
      }
      let jx = ix;
      let jy = iy;
      if( dir === pencils.core.up ) jy --;
      if( dir === pencils.core.down ) jy ++;
      if( dir === pencils.core.right ) jx --;
      if( dir === pencils.core.left ) jx ++;
      let linearr = pencils.clevercheck_getline(ix,iy);
      let jikuarr = pencils.clevercheck_getjiku(jx,jy);
      if( linearr.length !== jikuarr.length ) l.push([ix,iy]);
    }
  }
  return l;
},
//%}}}
// clevercheck_false_number %{{{
clevercheck_false_number: function () {
  'use strict';
  let l = [];
  for( let ix = 1; ix <= ndivx; ix ++ ){
    for( let iy = 1; iy <= ndivy; iy ++ ){
      if( qdatac[ix][iy] === 'o' ){
        if( adatac[ix][iy] !== '=' ) l.push([ix,iy]);
        continue;
      }
      if( qdatac[ix][iy].match(/^o[0-9]+/) === null ) continue;
      if( adatac[ix][iy] !== '=' ){
        l.push([ix,iy]);
        continue;
      }
      let num = parseInt(qdatac[ix][iy].substring(1),10);
      let jikuarr = pencils.clevercheck_getjiku(ix,iy);
      if( num !== jikuarr.length ) l.push([ix,iy]);
    }
  }
  return l;
},
//%}}}
// clevercheck_empty_cell %{{{
clevercheck_empty_cell: function () {
  'use strict';
  let l = [];
  for( let ix = 1; ix <= ndivx; ix ++ ){
    for( let iy = 1; iy <= ndivy; iy ++ ){
      if( adatac[ix][iy] === '=' ) continue;
      if( adatav[ix  ][iy] === '-1' ) continue;
      if( adatav[ix-1][iy] === '-1' ) continue;
      if( adatah[ix][iy  ] === '-1' ) continue;
      if( adatah[ix][iy-1] === '-1' ) continue;
      // 長さ０の鉛筆から長さ０の線が出ているマスは空マスとみなすことに注意
      l.push([ix,iy]);
    }
  }
  return l;
},
//%}}}
// clevercheck_nowall_jiku %{{{
clevercheck_nowall_jiku: function () {
  'use strict';
  let l = [];
  for( let ix = 1; ix <= ndivx; ix ++ ){
    for( let iy = 1; iy <= ndivy; iy ++ ){
      if( adatac[ix][iy] !== '=' ) continue;
      if( ix !== ndivx && adatac[ix+1][iy] !== '=' && adatav[ix][iy] !== '1' && qdatac[ix+1][iy] !== pencils.core.right && adatac[ix+1][iy] !== pencils.core.right ) l.push([ix,iy]);
      else if( ix !== 1 && adatac[ix-1][iy] !== '=' && adatav[ix-1][iy] !== '1' && qdatac[ix-1][iy] !== pencils.core.left && adatac[ix-1][iy] !== pencils.core.left ) l.push([ix,iy]);
      else if( iy !== ndivy && adatac[ix][iy+1] !== '=' && adatah[ix][iy] !== '1' && qdatac[ix][iy+1] !== pencils.core.up && adatac[ix][iy+1] !== pencils.core.up ) l.push([ix,iy]);
      else if( iy !== 1 && adatac[ix][iy-1] !== '=' && adatah[ix][iy-1] !== '1' && qdatac[ix][iy-1] !== pencils.core.down && adatac[ix][iy-1] !== pencils.core.down ) l.push([ix,iy]);
    }
  }
  return l;
},
//%}}}
// clevercheck_isolate_wall %{{{
clevercheck_isolate_wall: function () {
  'use strict';
  let l = [];
  for( let ix = 1; ix <= ndivx; ix ++ ){
    for( let iy = 1; iy <= ndivy; iy ++ ){
      if( adatac[ix][iy] === '=' ) continue;
      if( adatac[ix+1][iy] !== '=' && adatav[ix][iy] === '1' ) l.push([ix,iy]);
      else if( adatac[ix-1][iy] !== '=' && adatav[ix-1][iy] === '1' ) l.push([ix,iy]);
      else if( adatac[ix][iy+1] !== '=' && adatah[ix][iy] === '1' ) l.push([ix,iy]);
      else if( adatac[ix][iy-1] !== '=' && adatah[ix][iy-1] === '1' ) l.push([ix,iy]);
    }
  }
  return l;
},
//%}}}
// clevercheck_getjiku %{{{
clevercheck_getjiku: function (xin,yin) {
  'use strict';
  if( adatac[xin][yin] !== '=' ) return [];
  let l = [];
  l.isinarr = function(ix,iy) {
    for( let i = 0; i < this.length; i ++ ){
      if( this[i][0] === ix && this[i][1] === iy ) return true;
    }
    return false;
  };
  l.push([xin,yin]);
  for( let i = 0; i < ndivx*ndivy; i ++ ){
    if( i >= l.length ) break;
    let cx = l[i][0];
    let cy = l[i][1];
    if( adatac[cx+1][cy] === '=' && adatav[cx  ][cy] !== '1' && ! l.isinarr(cx+1,cy) ) l.push([cx+1,cy]);
    if( adatac[cx-1][cy] === '=' && adatav[cx-1][cy] !== '1' && ! l.isinarr(cx-1,cy) ) l.push([cx-1,cy]);
    if( adatac[cx][cy+1] === '=' && adatah[cx][cy  ] !== '1' && ! l.isinarr(cx,cy+1) ) l.push([cx,cy+1]);
    if( adatac[cx][cy-1] === '=' && adatah[cx][cy-1] !== '1' && ! l.isinarr(cx,cy-1) ) l.push([cx,cy-1]);
  }
  delete l.isinarr;
  return l;
},
//%}}}
// clevercheck_getline %{{{
clevercheck_getline: function (xin,yin) {
  'use strict';
  let l = [];
  l.isinarr = function(is,ix,iy) {
    for( let i = 0; i < this.length; i ++ ){
      if( this[i][0] === is && this[i][1] === ix && this[i][2] === iy ) return true;
    }
    return false;
  };
  let c = [];
  c.push([xin,yin]);
  if( adatav[xin  ][yin] === '-1' ){ l.push(['v',xin  ,yin]); c.push([xin+1,yin]); }
  if( adatav[xin-1][yin] === '-1' ){ l.push(['v',xin-1,yin]); c.push([xin-1,yin]); }
  if( adatah[xin][yin  ] === '-1' ){ l.push(['h',xin,yin  ]); c.push([xin,yin+1]); }
  if( adatah[xin][yin-1] === '-1' ){ l.push(['h',xin,yin-1]); c.push([xin,yin-1]); }
  for( let i = 0; i < ndivx*ndivy; i ++ ){
    if( i >= c.length ) break;
    let cx = c[i][0];
    let cy = c[i][1];
    if( adatav[cx  ][cy] === '-1' && ! l.isinarr('v',cx  ,cy) ){ l.push(['v',cx  ,cy]); c.push([cx+1,cy]); }
    if( adatav[cx-1][cy] === '-1' && ! l.isinarr('v',cx-1,cy) ){ l.push(['v',cx-1,cy]); c.push([cx-1,cy]); }
    if( adatah[cx][cy  ] === '-1' && ! l.isinarr('h',cx,cy  ) ){ l.push(['h',cx,cy  ]); c.push([cx,cy+1]); }
    if( adatah[cx][cy-1] === '-1' && ! l.isinarr('h',cx,cy-1) ){ l.push(['h',cx,cy-1]); c.push([cx,cy-1]); }
  }
  delete l.isinarr;
  return l;
},
//%}}}
// clevercheck_getlinecell %{{{
clevercheck_getlinecell: function (arrin) {
  'use strict';
  let l = [];
  l.isinarr = function(ix,iy) {
    for( let i = 0; i < this.length; i ++ ){
      if( this[i][0] === ix && this[i][1] === iy ) return true;
    }
    return false;
  };
  for( let i = 0; i < arrin.length; i ++ ){
    let cx = arrin[i][1];
    let cy = arrin[i][2];
    if( ! l.isinarr(cx,cy) ) l.push([cx,cy]);
    if( arrin[i][0] === 'v' && ! l.isinarr(cx+1,cy) ) l.push([cx+1,cy]);
    if( arrin[i][0] === 'h' && ! l.isinarr(cx,cy+1) ) l.push([cx,cy+1]);
  }
  delete l.isinarr;
  return l;
},
//%}}}
// clevercheck_haslineloop %{{{
clevercheck_haslineloop: function (xin,yin) {
  'use strict';
  for( let idir = 0; idir < 4; idir ++ ){
    let l = [];
    l.isinarr = function(is,ix,iy) {
      for( let i = 0; i < this.length; i ++ ){
        if( this[i][0] === is && this[i][1] === ix && this[i][2] === iy ) return true;
      }
      return false;
    };
    let c = [];
    // 始点から唯一の道を選び、その方向に進んだ時に始点に戻るかどうかを調べる
    c.push([xin,yin]);
    if( idir === 0 && adatav[xin  ][yin] === '-1' ){ l.push(['v',xin  ,yin]); c.push([xin+1,yin]); }
    if( idir === 1 && adatav[xin-1][yin] === '-1' ){ l.push(['v',xin-1,yin]); c.push([xin-1,yin]); }
    if( idir === 2 && adatah[xin][yin  ] === '-1' ){ l.push(['h',xin,yin  ]); c.push([xin,yin+1]); }
    if( idir === 3 && adatah[xin][yin-1] === '-1' ){ l.push(['h',xin,yin-1]); c.push([xin,yin-1]); }
    if( l.length !== 1 ) continue;
    for( let i = 1; i < ndivx*ndivy; i ++ ){
      if( i >= c.length ) break;
      let cx = c[i][0];
      let cy = c[i][1];
      if( adatav[cx  ][cy] === '-1' && ! l.isinarr('v',cx  ,cy) ){
        l.push(['v',cx  ,cy]); c.push([cx+1,cy]);
        if( xin === cx+1 && yin === cy ) return true;
      }
      if( adatav[cx-1][cy] === '-1' && ! l.isinarr('v',cx-1,cy) ){
        l.push(['v',cx-1,cy]); c.push([cx-1,cy]);
        if( xin === cx-1 && yin === cy ) return true;
      }
      if( adatah[cx][cy  ] === '-1' && ! l.isinarr('h',cx,cy  ) ){
        l.push(['h',cx,cy  ]); c.push([cx,cy+1]);
        if( xin === cx && yin === cy+1 ) return true;
      }
      if( adatah[cx][cy-1] === '-1' && ! l.isinarr('h',cx,cy-1) ){
        l.push(['h',cx,cy-1]); c.push([cx,cy-1]);
        if( xin === cx && yin === cy-1 ) return true;
      }
    }
  }
  return false;
},
//%}}}
// clevercheck_hasjikuloop %{{{
clevercheck_hasjikuloop: function (xin,yin) {
  'use strict';
  if( adatac[xin][yin] !== '=' ) return false;
  for( let idir = 0; idir < 4; idir ++ ){
    let l = [];
    l.isinarr = function(is,ix,iy) {
      for( let i = 0; i < this.length; i ++ ){
        if( this[i][0] === is && this[i][1] === ix && this[i][2] === iy ) return true;
      }
      return false;
    };
    let c = [];
    c.isinarr = function(ix,iy) {
      for( let i = 0; i < this.length; i ++ ){
        if( this[i][0] === ix && this[i][1] === iy ) return true;
      }
      return false;
    };
    // 始点から唯一の道を選び、その方向に進んだ時に始点に戻るかどうかを調べる
    c.push([xin,yin]);
    if( idir === 0 && adatac[xin+1][yin] === '=' && adatav[xin  ][yin] !== '1' ){ l.push(['v',xin  ,yin]); c.push([xin+1,yin]); }
    if( idir === 1 && adatac[xin-1][yin] === '=' && adatav[xin-1][yin] !== '1' ){ l.push(['v',xin-1,yin]); c.push([xin-1,yin]); }
    if( idir === 2 && adatac[xin][yin+1] === '=' && adatah[xin][yin  ] !== '1' ){ l.push(['h',xin,yin  ]); c.push([xin,yin+1]); }
    if( idir === 3 && adatac[xin][yin-1] === '=' && adatah[xin][yin-1] !== '1' ){ l.push(['h',xin,yin-1]); c.push([xin,yin-1]); }
    if( l.length !== 1 ) continue;
    for( let i = 1; i < ndivx*ndivy; i ++ ){
      if( i >= c.length ) break;
      let cx = c[i][0];
      let cy = c[i][1];
      if( adatac[cx+1][cy] === '=' && adatav[cx  ][cy] !== '1' && ! l.isinarr('v',cx  ,cy) ){
        l.push(['v',cx  ,cy]); c.push([cx+1,cy]);
        if( xin === cx+1 && yin === cy ) return true;
      }
      if( adatac[cx-1][cy] === '=' && adatav[cx-1][cy] !== '1' && ! l.isinarr('v',cx-1,cy) ){
        l.push(['v',cx-1,cy]); c.push([cx-1,cy]);
        if( xin === cx-1 && yin === cy ) return true;
      }
      if( adatac[cx][cy+1] === '=' && adatah[cx][cy  ] !== '1' && ! l.isinarr('h',cx,cy  ) ){
        l.push(['h',cx,cy  ]); c.push([cx,cy+1]);
        if( xin === cx && yin === cy+1 ) return true;
      }
      if( adatac[cx][cy-1] === '=' && adatah[cx][cy-1] !== '1' && ! l.isinarr('h',cx,cy-1) ){
        l.push(['h',cx,cy-1]); c.push([cx,cy-1]);
        if( xin === cx && yin === cy-1 ) return true;
      }
    }
  }
  return false;
},
//%}}}
// -------------------------

// nop %{{{
nop: function () {
  'use strict';
  return;
}
//%}}}
};

// EOF
