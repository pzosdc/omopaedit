//JavaScript

var pencilcoresize;

var pencils = pencils || {
core: {
  up: '1',
  down: '2',
  left: '3',
  right: '4'
},
// init %{{{
init: function () {
  'use strict';
  pencilcoresize = 0.22;
  return true;
},
//%}}}

// mousemove %{{{
mousemove: function () {
  'use strict';
  if( editmode === 'qc' ){
    if( adatac[dragpath[0][0]][dragpath[0][1]].match(/^[1-4]/) !== null ) return false;
    let relx = dragpath[dragpath.length-1][0] - dragpath[0][0];
    let rely = dragpath[dragpath.length-1][1] - dragpath[0][1];
    pencils.dragarrow(dragpath[0][0],dragpath[0][1],relx,rely);
    adatac[dragpath[0][0]][dragpath[0][1]] = '.';
    oaerewriteall();
  } else if( editmode === 'ac' ){
    if( button === buttonid.left ){
      // left drag -> arrow
      if( qdatac[dragpath[0][0]][dragpath[0][1]].match(/^[1-4]/) !== null ) return false;
      let relx = dragpath[dragpath.length-1][0] - dragpath[0][0];
      let rely = dragpath[dragpath.length-1][1] - dragpath[0][1];
      pencils.dragarrow(dragpath[0][0],dragpath[0][1],relx,rely);
    } else if( button === buttonid.right ){
      if( qdatac[dragpath[0][0]][dragpath[0][1]].match(/^[1-4]/) !== null ||
      adatac[dragpath[0][0]][dragpath[0][1]].match(/^[1-4]/) !== null ){
        // 芯から右ドラッグした場合は芯から出る線を描けるようにしてみる
        editmode = 'aw'; // 一時的にAWモードにする
        oae_path();
        editmode = 'ac';
      } else {
        // right drag -> shade
        oae_shade();
      }
    }
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
    if( adatac[focusx][focusy].match(/^[1-4]/) !== null ) return false;
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
    if( qdatac[focusx][focusy].match(/^[1-4]/) !== null ) return false;
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
    if( adatac[focusx][focusy].match(/^[1-4]/) !== null ) return false;
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

// shadetoggle %{{{
shadetoggle: function (str) {
  'use strict';
  // shadeできないセルの条件もここに書くことができる
  if( qdatac[focusx][focusy].match(/^[1-4]/) !== null ) return null;
  if( adatac[focusx][focusy].match(/^[1-4]/) !== null ) return null;
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
  let pcs = pencilcoresize;
  let p1 = [d1[0]*pcs*cellwidth,d1[1]*pcs*cellheight];
  let p2 = [d2[0]*pcs*cellwidth,d2[1]*pcs*cellheight];
  // 線幅補正
  cx += pf;
  cy += pf;
  //console.log(cx,cy,cx+h1[0],cy+h1[1],cx+h2[0],cy+h2[1]);
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
// layersinglier %{{{
layersinglier: function () {
  'use strict';
  leftmargin = Math.floor(pngmarginscale * cellunit);
  topmargin = Math.floor(pngmarginscale * cellunit);
  rightmargin = Math.floor(pngmarginscale * cellunit);
  bottommargin = Math.floor(pngmarginscale * cellunit);
  totalwidth = gridwidth + leftmargin + rightmargin;
  totalheight = gridheight + topmargin + bottommargin;
  oaesizeadjust();
  oae_clearcanvas(bgcontext);
  oaedrawgrid_fillbackground(bgcontext);
  if( aview ){
    for ( let ix = 1; ix <= ndivx; ix ++ ) {
      let centx = leftmargin + (ix-0.5) * cellunit;
      for ( let iy = 1; iy <= ndivy; iy ++ ) {
        if( adatac[ix][iy] === '.' ) continue;
        let centy = topmargin + (ndivy-iy+0.5) * cellunit;
        let str = adatac[ix][iy];
        if( str === '=' ){
          oaedrawadata_c_shade(centx,centy,bgcontext);
        } else {
        }
      }
    }
  }
  oaedrawgrid_normaldashedgrid(bgcontext);
  oaedrawgrid_border(bgcontext);
  if( aview ){
    oaedrawadata_v(bgcontext);
    oaedrawadata_h(bgcontext);
    for ( let ix = 1; ix <= ndivx; ix ++ ) {
      let centx = leftmargin + (ix-0.5) * cellunit;
      for ( let iy = 1; iy <= ndivy; iy ++ ) {
        if( adatac[ix][iy] === '.' ) continue;
        let centy = topmargin + (ndivy-iy+0.5) * cellunit;
        let str = adatac[ix][iy];
        if( str === '=' ){
        } else {
          pencils.draw_aarrow(centx,centy,str,bgcontext);
        }
      }
    }
  }
  for ( let ix = 1; ix <= ndivx; ix ++ ) {
    let centx = leftmargin + (ix-0.5) * cellunit;
    for ( let iy = 1; iy <= ndivy; iy ++ ) {
      if( qdatac[ix][iy] === '.' ) continue;
      let centy = topmargin + (ndivy-iy+0.5) * cellunit;
      let str = qdatac[ix][iy];
      if( str.substring(0,2).match(/^o[0-9]+$/) !== null ){
        str = str.substring(1);
        oaedrawqdata_c_num(centx,centy,str,bgcontext);
      } else if( str === 'o' ){
        oaedrawqdata_c_num(centx,centy,'?',bgcontext);
      } else {
        pencils.draw_qarrow(centx,centy,str,bgcontext);
      }
    }
  }
  return;
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
        if( adatac[ix][iy].match(/^[1-4]/) !== null ){
          return [false,{posx:ix,posy:iy,errmsg:'芯が軸の内部にあります'}];
        } else if( qdatac[ix][iy].match(/^[1-4]/) !== null ){
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
      if( qdatac[ix][iy].match(/^[1-4]/) === null && adatac[ix][iy].match(/^[1-4]/) === null ) continue;
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
          if( qdatac[cx][cy].match(/^[1-4]/) !== null || adatac[cx][cy].match(/^[1-4]/) !== null ){
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
}
//%}}}
};

// EOF
