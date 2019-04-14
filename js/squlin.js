//JavaScript

var squlin = squlin || {
// mousemove %{{{
mousemove: function (){
  'use strict';
  if( editmode === 'qc' ){
    let i = dragpath.length-1;
    let swp = qdatac[dragpath[i][0]][dragpath[i][1]];
    qdatac[dragpath[i][0]][dragpath[i][1]] = qdatac[dragpath[i-1][0]][dragpath[i-1][1]];
    qdatac[dragpath[i-1][0]][dragpath[i-1][1]] = swp;
    oaedrawqdata();
  } else if( editmode === 'ac' ){
    if( button === buttonid.left ){
      oae_leftclick();
    } else if( button === buttonid.right ){
      oae_rightclick();
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
leftclick: function (){
  'use strict';
  if( editmode === 'qc' ){
    if( dragpath.length !== 1 ) return;
    let str = focusprevstate;
    if( str === '.' ){
      str = '?';
    } else if( str === '?' ){
      str = '1';
    } else if( str.match(/^[0-9]+$/) !== null ){
      let n = parseInt(str,10);
      n ++;
      if( n > Math.max((ndivx-2)*ndivy,ndivx*(ndivy-2)) ){
        str = '.';
      } else {
        str = n.toString(10);
      }
    }
    qdatac[focusx][focusy] = str;
    oaedrawqdata();
  } else if( editmode === 'ac' ){
    squlin.squareshade();
  }
},
//%}}}
// rightclick %{{{
rightclick: function (){
  'use strict';
  if( editmode === 'qc' ){
    let str = focusprevstate;
    if( str === '.' ){
      let n = Math.max((ndivx-2)*ndivy,ndivx*(ndivy-2));
      if( n >= 1 ) str = n.toString(10);
    } else if( str === '?' ){
      str = '.';
    } else if( str.match(/^[0-9]+$/) !== null ){
      let num = parseInt(str,10);
      num --;
      if( num === 0 ){
        str = '?';
      } else {
        str = num.toString(10);
      }
    }
    qdatac[focusx][focusy] = str;
    oaedrawqdata();
  } else if( editmode === 'ac' ){
    squlin.squareunshade();
  }
},
//%}}}
// keydown %{{{
keydown: function (n){
  'use strict';
  if( editmode === 'qc' ){
    let str = qdatac[cursorx][cursory];
    if( n === -2 ){
      str = '.';
    } else if( n >= 0 && n <= 9 ){
      if( str.match(/^[0-9]+$/) !== null ){
        str = str + n.toString(10);
        if( parseInt(str,10) > ndivx*ndivy ){
          str = n.toString(10);
          if( parseInt(str,10) > ndivx*ndivy ){
            str = '';
          }
          if( str === '0' ) str = '';
        }
      } else {
        str = n.toString(10);
        if( parseInt(str,10) > ndivx*ndivy/2 ){
          str = '';
        }
        if( str === '0' ) str = '';
      }
      if( str === '' ) str = '.';
    } else if( n === -1 ){
      // BS
      if( str.match(/^[0-9]+$/) !== null ){
        str = str.substring(0,str.length-1);
        if( str === '' ) str = '?';
      } else {
        str = '.';
      }
    } else if( n === -2 ){
      // Del
      str = '.';
    } else if( n === -3 ){
      // -
      if( str === '?' ){
        str = '.';
      } else {
        str = '?';
      }
    }
    qdatac[cursorx][cursory] = str;
    oaedrawqdata();
  }
},
//%}}}
// shadetoggle %{{{
shadetoggle: function (str) {
  'use strict';
  return ( str === '.' ) ? '=' : '.';
},
//%}}}
// unshadetoggle %{{{
unshadetoggle: function (str) {
  'use strict';
  return ( str === '.' ) ? '#' : '.';
},
//%}}}

// squareshade %{{{
squareshade: function () {
  'use strict';
  let n = dragpath.length;
  let cx = dragpath[n-1][0]; // c = current
  let cy = dragpath[n-1][1];
  if( cellisoutside(cx,cy) ){
    dragpath.pop();
    return;
  }
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
  adatac[focusx][focusy] = str;
  if( isshaded(adatac[cx][cy]) === isshaded(adatac[cx+1][cy]) ) adatav[cx  ][cy] = '0';
  if( isshaded(adatac[cx][cy]) !== isshaded(adatac[cx+1][cy]) ) adatav[cx  ][cy] = '1';
  if( isshaded(adatac[cx][cy]) === isshaded(adatac[cx-1][cy]) ) adatav[cx-1][cy] = '0';
  if( isshaded(adatac[cx][cy]) !== isshaded(adatac[cx-1][cy]) ) adatav[cx-1][cy] = '1';
  if( isshaded(adatac[cx][cy]) === isshaded(adatac[cx][cy+1]) ) adatah[cx][cy  ] = '0';
  if( isshaded(adatac[cx][cy]) !== isshaded(adatac[cx][cy+1]) ) adatah[cx][cy  ] = '1';
  if( isshaded(adatac[cx][cy]) === isshaded(adatac[cx][cy-1]) ) adatah[cx][cy-1] = '0';
  if( isshaded(adatac[cx][cy]) !== isshaded(adatac[cx][cy-1]) ) adatah[cx][cy-1] = '1';
  oaerewriteall();
},
//%}}}
// squareunshade %{{{
squareunshade: function () {
  'use strict';
  let n = dragpath.length;
  let cx = dragpath[n-1][0]; // c = current
  let cy = dragpath[n-1][1];
  if( cellisoutside(cx,cy) ){
    dragpath.pop();
    return;
  }
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
  adatac[focusx][focusy] = str;
  if( isshaded(adatac[cx][cy]) === isshaded(adatac[cx+1][cy]) ) adatav[cx  ][cy] = '0';
  if( isshaded(adatac[cx][cy]) !== isshaded(adatac[cx+1][cy]) ) adatav[cx  ][cy] = '1';
  if( isshaded(adatac[cx][cy]) === isshaded(adatac[cx-1][cy]) ) adatav[cx-1][cy] = '0';
  if( isshaded(adatac[cx][cy]) !== isshaded(adatac[cx-1][cy]) ) adatav[cx-1][cy] = '1';
  if( isshaded(adatac[cx][cy]) === isshaded(adatac[cx][cy+1]) ) adatah[cx][cy  ] = '0';
  if( isshaded(adatac[cx][cy]) !== isshaded(adatac[cx][cy+1]) ) adatah[cx][cy  ] = '1';
  if( isshaded(adatac[cx][cy]) === isshaded(adatac[cx][cy-1]) ) adatah[cx][cy-1] = '0';
  if( isshaded(adatac[cx][cy]) !== isshaded(adatac[cx][cy-1]) ) adatah[cx][cy-1] = '1';
  oaerewriteall();
},
//%}}}

// layersinglier %{{{
layersinglier: function (){
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
        } else if( str === '#' ){
          oaedrawadata_c_shade_sub(centx,centy,bgcontext);
        }
      }
    }
  }
  oaedrawgrid_dotatnode(bgcontext);
  for ( let ix = 1; ix <= ndivx; ix ++ ) {
    let centx = leftmargin + (ix-0.5) * cellunit;
    for ( let iy = 1; iy <= ndivy; iy ++ ) {
      if( qdatac[ix][iy] === '.' ) continue;
      let str = qdatac[ix][iy];
      let centy = topmargin + (ndivy-iy+0.5) * cellunit;
      oaedrawqdata_c_onum(centx,centy,str,bgcontext);
    }
  }
  if( aview ){
    oaedrawadata_v(bgcontext);
    oaedrawadata_h(bgcontext);
  }
  return;
},
//%}}}

// check %{{{
check: function (){
  'use strict';
  let acc = squlin.hasacceptableanswer();
  if( acc[0] ){
    oaeconsolemsg('正解です');
  } else if( acc[1].posx === null ){
    oaeconsolemsg(acc[1].errmsg);
  } else {
    oaeconsolemsg('マス('+acc[1].posx.toString(10)+','+acc[1].posy.toString(10)+') '+acc[1].errmsg);
  }
  return;
},
//%}}}
// hasacceptableanswer %{{{
hasacceptableanswer: function (){
  'use strict';
  // 色で判定
  let firstfoundcellx = null;
  let firstfoundcelly = null;
  for( let ix = 1; ix <= ndivx; ix ++ ){
    for( let iy = 1; iy <= ndivy; iy ++ ){
      if( adatac[ix][iy] === '=' ){
        firstfoundcellx = ix;
        firstfoundcelly = iy;
        break;
      }
    }
    if( firstfoundcellx !== null ) break;
  }
  if( firstfoundcellx === null ) return [false,{posx:null,posy:null,errmsg:'マスが塗られていません'}];
  let iscollected = [];
  for ( let ix = -1; ix <= ndivx+1; ix ++ ) {
    iscollected[ix] = [];
    for ( let iy = -1; iy <= ndivy+1; iy ++ ) {
      iscollected[ix][iy] = false;
    }
  }
  let cx = firstfoundcellx;
  let cy = firstfoundcelly;
  let cellqueue = [];
  cellqueue.push([cx,cy]); // cellqueue自体には重複して登録される場合もあるが気にしない
  for( let istep = 0; istep < ndivx*ndivy; istep ++ ){
    if( istep > cellqueue.length-1 ) break;
    cx = cellqueue[istep][0];
    cy = cellqueue[istep][1];
    if( iscollected[cx][cy] ) continue;
    let localroomqueue = [];
    localroomqueue.isinarr = function(ix,iy) {
      for( let i = 0; i < this.length; i ++ ){
        if( this[i][0] === ix && this[i][1] === iy ) return true;
      }
      return false;
    };
    localroomqueue.isnotinarr = function(ix,iy) {
      for( let i = 0; i < this.length; i ++ ){
        if( this[i][0] === ix && this[i][1] === iy ) return false;
      }
      return true;
    };
    // make local room queue
    localroomqueue.push([cx,cy]);
    let number = null;
    for( let i = 0; i < ndivx*ndivy; i ++ ){
      if( i >= localroomqueue.length ) break;
      let ix = localroomqueue[i][0];
      let iy = localroomqueue[i][1];
      if( qdatac[ix][iy].match(/[0-9]+/) !== null || qdatac[ix][iy] === '?' ){
        if( number !== null ) return [false,{posx:ix,posy:iy,errmsg:'一つの四角が複数の丸を含んでいます'}];
        number = qdatac[ix][iy];
      }
      if( ix < ndivx && adatac[ix+1][iy] === '=' && localroomqueue.isnotinarr(ix+1,iy) ){
        localroomqueue.push([ix+1,iy]);
      }
      if( ix > 1 && adatac[ix-1][iy] === '=' && localroomqueue.isnotinarr(ix-1,iy) ){
        localroomqueue.push([ix-1,iy]);
      }
      if( iy < ndivy && adatac[ix][iy+1] === '=' && localroomqueue.isnotinarr(ix,iy+1) ){
        localroomqueue.push([ix,iy+1]);
      }
      if( iy > 1 && adatac[ix][iy-1] === '=' && localroomqueue.isnotinarr(ix,iy-1) ){
        localroomqueue.push([ix,iy-1]);
      }
    }
    // shape check
    let isrect = oae_isrect_arr(localroomqueue);
    if( ! isrect[0] ){
      return [false,{posx:cx,posy:cy,errmsg:'四角形になっていません'}];
    }
    let ixmin = isrect[1];
    let ixmax = isrect[2];
    let iymin = isrect[3];
    let iymax = isrect[4];
    if( number !== null && number !== '?' && (ixmax-ixmin+1)*(iymax-iymin+1) !== parseInt(number,10) ){
      return [false,{posx:cx,posy:cy,errmsg:'四角の大きさが数字と異なります'}];
    }
    let ineigh = 0;
    if( ixmin > 1 && iymin > 1 && adatac[ixmin-1][iymin-1] === '=' ){
      ineigh ++;
      if( ! iscollected[ixmin-1][iymin-1] ) cellqueue.push([ixmin-1,iymin-1]);
    }
    if( ixmin > 1 && iymax < ndivy && adatac[ixmin-1][iymax+1] === '=' ){
      ineigh ++;
      if( ! iscollected[ixmin-1][iymax+1] ) cellqueue.push([ixmin-1,iymax+1]);
    }
    if( ixmax < ndivx && iymin > 1 && adatac[ixmax+1][iymin-1] === '=' ){
      ineigh ++;
      if( ! iscollected[ixmax+1][iymin-1] ) cellqueue.push([ixmax+1,iymin-1]);
    }
    if( ixmax < ndivx && iymax < ndivy && adatac[ixmax+1][iymax+1] === '=' ){
      ineigh ++;
      if( ! iscollected[ixmax+1][iymax+1] ) cellqueue.push([ixmax+1,iymax+1]);
    }
    if( ineigh === 0 ) return [false,{posx:cx,posy:cy,errmsg:'四角が孤立しています'}];
    if( ineigh === 1 ) return [false,{posx:cx,posy:cy,errmsg:'１つの四角としか頂点でつながらない四角があります'}];
    if( ineigh > 2 ) return [false,{posx:cx,posy:cy,errmsg:'３つ以上の四角と頂点でつながる四角があります'}];
    for( let ix = ixmin; ix <= ixmax; ix ++ ){
      for( let iy = iymin; iy <= iymax; iy ++ ){
        iscollected[ix][iy] = true;
      }
    }
  }
  for( let ix = 1; ix <= ndivx; ix ++ ){
    for( let iy = 1; iy <= ndivy; iy ++ ){
      if( adatac[ix][iy] === '=' && ! iscollected[ix][iy] ){
        return [false,{posx:ix,posy:iy,errmsg:'四角が頂点でひとつながりになっていません'}];
      }
      if( adatac[ix][iy] !== '=' && qdatac[ix][iy] !== '.' ){
        return [false,{posx:ix,posy:iy,errmsg:'丸のマスが塗られていません'}];
      }
    }
  }
  // ここから内側チェック
  let localroomqueue = [];
  localroomqueue.isinarr = function(ix,iy) {
    for( let i = 0; i < this.length; i ++ ){
      if( this[i][0] === ix && this[i][1] === iy ) return true;
    }
    return false;
  };
  localroomqueue.isnotinarr = function(ix,iy) {
    for( let i = 0; i < this.length; i ++ ){
      if( this[i][0] === ix && this[i][1] === iy ) return false;
    }
    return true;
  };
  // 外周とつながる図形をqueueでcollectしていき、使ったqueueを空にしてから最後に残った領域の四角形判定をする
  for( let ix = 1; ix <= ndivx; ix ++ ){
    if( adatac[ix][1] !== '=' && localroomqueue.isnotinarr(ix,1) ){
      localroomqueue.push([ix,1]);
    }
    if( adatac[ix][ndivy] !== '=' && localroomqueue.isnotinarr(ix,ndivy) ){
      localroomqueue.push([ix,ndivy]);
    }
  }
  for( let iy = 1; iy <= ndivy; iy ++ ){
    if( adatac[1][iy] !== '=' && localroomqueue.isnotinarr(1,iy) ){
      localroomqueue.push([1,iy]);
    }
    if( adatac[ndivx][iy] !== '=' && localroomqueue.isnotinarr(ndivx,iy) ){
      localroomqueue.push([ndivx,iy]);
    }
  }
  for( let iq = 0; iq < ndivx*ndivy; iq ++ ){
    if( iq >= localroomqueue.length ) break;
    let ix = localroomqueue[iq][0];
    let iy = localroomqueue[iq][1];
    iscollected[ix][iy] = true;
    if( ix < ndivx && adatac[ix+1][iy] !== '=' && localroomqueue.isnotinarr(ix+1,iy) ){
      localroomqueue.push([ix+1,iy]);
    }
    if( ix > 1 && adatac[ix-1][iy] !== '=' && localroomqueue.isnotinarr(ix-1,iy) ){
      localroomqueue.push([ix-1,iy]);
    }
    if( iy < ndivy && adatac[ix][iy+1] !== '=' && localroomqueue.isnotinarr(ix,iy+1) ){
      localroomqueue.push([ix,iy+1]);
    }
    if( iy > 1 && adatac[ix][iy-1] !== '=' && localroomqueue.isnotinarr(ix,iy-1) ){
      localroomqueue.push([ix,iy-1]);
    }
  }
  // queueを破棄してcollectされていないマスを入れなおす
  localroomqueue.length = 0;
  for ( let ix = 1; ix <= ndivx; ix ++ ) {
    for ( let iy = 1; iy <= ndivy; iy ++ ) {
      if( ! iscollected[ix][iy] ) localroomqueue.push([ix,iy]);
    }
  }
  let isrect = oae_isrect_arr(localroomqueue);
  if( isrect[0] ){
    return [false,{posx:null,posy:null,errmsg:'内側が四角形になっています'}];
  }
  return [true,{}];
}
//%}}}
};

// oae_isrect_arr %{{{
function oae_isrect_arr(arrAin){
  'use strict';
  let ixmin = arrAin[0][0];
  let ixmax = arrAin[0][0];
  let iymin = arrAin[0][1];
  let iymax = arrAin[0][1];
  for( let i = 1; i < arrAin.length; i ++ ){
    if( arrAin[i][0] > ixmax ) ixmax = arrAin[i][0];
    if( arrAin[i][0] < ixmin ) ixmin = arrAin[i][0];
    if( arrAin[i][1] > iymax ) iymax = arrAin[i][1];
    if( arrAin[i][1] < iymin ) iymin = arrAin[i][1];
  }
  let hasdata = [];
  for ( let ix = ixmin; ix <= ixmax; ix ++ ) {
    hasdata[ix] = [];
    for ( let iy = iymin; iy <= iymax; iy ++ ) {
      hasdata[ix][iy] = false;
    }
  }
  for( let i = 0; i < arrAin.length; i ++ ){
    hasdata[arrAin[i][0]][arrAin[i][1]] = true;
  }
  for( let ix = ixmin; ix <= ixmax; ix ++ ){
    for( let iy = iymin; iy <= iymax; iy ++ ){
      if( ! hasdata[ix][iy] ) return [false,null,null,null,null];
    }
  }
  return [true,ixmin,ixmax,iymin,iymax];
}
//%}}}

// EOF
