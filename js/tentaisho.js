//JavaScript

var tentaisho = tentaisho || {
// mousemove %{{{
mousemove: function (){
  'use strict';
  if( editmode === 'qp' ){
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
  if( editmode === 'qp' ){
    let str = focusprevstate;
    if( str === '.' ){
      str = '1';
    } else if( str === '1' ){
      str = '2';
    } else {
      str = '.';
    }
    qdatap[focusx][focusy] = str;
    oaedrawqdata();
  } else if( editmode === 'ac' ){
    oae_shade();
  }
},
//%}}}
// rightclick %{{{
rightclick: function (){
  'use strict';
  if( editmode === 'qp' ){
    let str = focusprevstate;
    if( str === '.' ){
      str = '2';
    } else if( str === '1' ){
      str = '.';
    } else {
      str = '1';
    }
    qdatap[focusx][focusy] = str;
    oaedrawqdata();
  } else if( editmode === 'ac' ){
    oae_unshade();
  }
},
//%}}}
// keydown %{{{
keydown: function (){
  'use strict';
  return;
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
  return ( str === '.' ) ? '-' : '.';
},
//%}}}

// pzprfileinput %{{{
pzprfileinput: function () {
  'use strict';
  tentaisho.pzprfileinput_qdatap();
  oaefileinput_main_adatav();
  oaefileinput_main_adatah();
  tentaisho.pzprfileinput_adatac();
},
//%}}}
// pzprfileinput_qdatap %{{{
pzprfileinput_qdatap: function () {
  'use strict';
  for( let iy = 2*ndivy; iy >= 2; iy -- ){
    let cline = filebuffer[0].trim();
    let words = cline.split(/\s*/);
    for( let ix = 2; ix <= 2*ndivx; ix ++ ){
      qdatap[ix][iy] = words[ix-2];
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
      if( words[ix-1] === '0' ){
        adatac[ix][iy] = '.';
      } else if ( words[ix-1] === '1' ){
        adatac[ix][iy] = '=';
      } else if ( words[ix-1] === '2' ){
        adatac[ix][iy] = '-';
      } else if ( words[ix-1] === '3' ){
        adatac[ix][iy] = '#';
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
  let str;
  str = 'pzprv3';
  str = str + '\n' + puzzletype;
  str = str + '\n' + ndivy.toString(10);
  str = str + '\n' + ndivx.toString(10);
  str = str + '\n';
  str = str + tentaisho.pzprfileoutput_qdatap();
  str = str + oaefileoutput_main_adatav();
  str = str + oaefileoutput_main_adatah();
  str = str + tentaisho.pzprfileoutput_adatac();
  return str;
},
//%}}}
// pzprfileoutput_qdatap %{{{
pzprfileoutput_qdatap: function () {
  'use strict';
  let str = '';
  for( let iy = 2*ndivy; iy >= 2; iy -- ){
    for( let ix = 2; ix <= 2*ndivx; ix ++ ){
      str = str + qdatap[ix][iy];
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
      if( adatac[ix][iy] === '.' ){
        str = str + ' 0';
      } else if ( adatac[ix][iy] === '=' ){
        str = str + ' 1';
      } else if ( adatac[ix][iy] === '-' ){
        str = str + ' 2';
      } else if ( adatac[ix][iy] === '#' ){
        str = str + ' 3';
      }
    }
    str = str + '\n';
  }
  return str;
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
  for ( let ix = 1; ix <= ndivx; ix ++ ) {
    let centx = leftmargin + (ix-0.5) * cellunit;
    for ( let iy = 1; iy <= ndivy; iy ++ ) {
      if( adatac[ix][iy] === '.' ) continue;
      let centy = topmargin + (ndivy-iy+0.5) * cellunit;
      let str = adatac[ix][iy];
      if( str === '=' ){
        oaedrawadata_c_shade(centx,centy,bgcontext);
      } else if( str === '-' ){
        oaedrawadata_c_shade_2(centx,centy,bgcontext);
      } else if( str === '#' ){
        oaedrawadata_c_shade_sub(centx,centy,bgcontext);
      }
    }
  }
  oaedrawgrid_normaldashedgrid(bgcontext);
  oaedrawgrid_border(bgcontext);
  if( aview ){
    oaedrawadata_v(bgcontext);
    oaedrawadata_h(bgcontext);
  }
  for ( let ix = 2; ix <= 2*ndivx; ix ++ ) {
    let centx = leftmargin + (ix-1) * cellunit/2;
    for ( let iy = 2; iy <= 2*ndivy; iy ++ ) {
      if( typeof qdatap[ix][iy] === 'undefined' ){
        oaeerrmsg('undefined fixed: qdatap '+ix.toString(10)+' '+iy.toString(10));
        qdatap[ix][iy] = '.';
      }
      if( qdatap[ix][iy] === '.' ) continue;
      let str = qdatap[ix][iy];
      let centy = topmargin + (2*ndivy-iy+1) * cellunit/2;
      if( puzzletype === 'tentaisho' ){
        if( str === '1' ){
          oaedrawqdata_p_smallcircle(centx,centy,false,bgcontext);
        } else if( str === '2' ){
          oaedrawqdata_p_smallcircle(centx,centy,true,bgcontext);
        }
      }
    }
  }
  return;
},
//%}}}

// check %{{{
check: function (){
  'use strict';
  let acc = tentaisho.hasacceptableanswer();
  if( acc[0] ){
    oaeconsolemsg('正解です');
  } else {
    oaeconsolemsg('マス('+acc[1].posx.toString(10)+','+acc[1].posy.toString(10)+') '+acc[1].errmsg);
  }
  return;
},
//%}}}
// hasacceptableanswer %{{{
hasacceptableanswer: function (){
  'use strict';
  let iscollected = [];
  for ( let ix = -1; ix <= ndivx+1; ix ++ ) {
    iscollected[ix] = [];
    for ( let iy = -1; iy <= ndivy+1; iy ++ ) {
      iscollected[ix][iy] = false;
    }
  }
  let iscenterofsomeroom = [];
  for ( let ix = 2; ix <= 2*ndivx; ix ++ ){
    iscenterofsomeroom[ix] = [];
    for ( let iy = 2; iy <= 2*ndivy; iy ++ ){
      iscenterofsomeroom[ix][iy] = false;
    }
  }
  for ( let iy = ndivy; iy >= 1; iy -- ) {
    for ( let ix = 1; ix <= ndivx; ix ++ ) {
      if( iscollected[ix][iy] ) continue;
      // prep
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
      localroomqueue.push([ix,iy]);
      for( let ip = 0; ip <= ndivx*ndivy; ip ++ ) {
        if( ip >= localroomqueue.length ) break;
        let jx = localroomqueue[ip][0];
        let jy = localroomqueue[ip][1];
        if( (jx !== 1) && adatav[jx-1][jy] === '0' && localroomqueue.isnotinarr(jx-1,jy) ){
          localroomqueue.push([jx-1,jy]);
        }
        if( (jx !== ndivx) && adatav[jx][jy] === '0' && localroomqueue.isnotinarr(jx+1,jy) ){
          localroomqueue.push([jx+1,jy]);
        }
        if( (jy !== 1) && adatah[jx][jy-1] === '0' && localroomqueue.isnotinarr(jx,jy-1) ){
          localroomqueue.push([jx,jy-1]);
        }
        if( (jy !== ndivy) && adatah[jx][jy] === '0' && localroomqueue.isnotinarr(jx,jy+1) ){
          localroomqueue.push([jx,jy+1]);
        }
      }
      // reflect cell state
      for( let ip = 0; ip < localroomqueue.length; ip ++ ) {
        let jx = localroomqueue[ip][0];
        let jy = localroomqueue[ip][1];
        iscollected[jx][jy] = true;
      }
      //-------------------------------------
      //console.log(ix,iy,localroomqueue.length);
      //-------------------------------------
      // check
      // shape check
      let ispointsym = oae_ispointsym_arr(-1,-1,localroomqueue);
      if( ! ispointsym[0] ){
        return [false,{posx:ix,posy:iy,errmsg:'星に関して点対称でありません'}];
      }
      let sx = ispointsym[1];
      let sy = ispointsym[2];
      iscenterofsomeroom[sx][sy] = true;
    }
  }
  for ( let iy = 2*ndivy; iy >= 2; iy -- ){
    for ( let ix = 2; ix <= 2*ndivx; ix ++ ){
      if( qdatap[ix][iy].match(/^[12]$/) !== null ){
        if( ! iscenterofsomeroom[ix][iy] ){
          return [false,{posx:ix/2,posy:iy/2,errmsg:'星が部屋の中心からはずれた位置にあります'}];
        }
      } else {
        if( iscenterofsomeroom[ix][iy] ){
          return [false,{posx:ix/2,posy:iy/2,errmsg:'部屋の中心に星がありません'}];
        }
      }
    }
  }
  return [true,{}];
}
//%}}}
};

// oae_ispointsym_arr %{{{
function oae_ispointsym_arr(sxin,syin,arrAin){
  'use strict';
  // shallowにコピー
  let arrA = [];
  for ( let ic = 0; ic < arrAin.length; ic ++ ){
    arrA[ic] = arrAin[ic].concat();
  }
  let sx;
  let sy;
  if( sxin !== -1 && syin !== -1 ){
    // 入力値がある場合はそれを使う
    sx = sxin;
    sy = syin;
  } else {
    // get boundingbox
    let xmaxA;  let xminA;
    let ymaxA;  let yminA;
    for( let ic = 0; ic < arrA.length; ic ++ ){
      let ixA = arrA[ic][0];
      let iyA = arrA[ic][1];
      if( ic === 0 ){
        xmaxA = ixA;  xminA = ixA;
        ymaxA = iyA;  yminA = iyA;
      } else {
        if( ixA > xmaxA ) xmaxA = ixA;
        if( ixA < xminA ) xminA = ixA;
        if( iyA > ymaxA ) ymaxA = iyA;
        if( iyA < yminA ) yminA = iyA;
      }
    }
    sx = xmaxA + xminA;
    sy = ymaxA + yminA;
  }
  // 検査用
  arrA.isindata = function(ix,iy){
    for( let ip = 0; ip < this.length; ip ++ ){
      if( this[ip][0] === ix && this[ip][1] === iy ){
        return true;
      }
    }
    return false;
  };
  // 反転して一致するかしらべる
  for( let ic = 0; ic < arrA.length; ic ++ ){
    if( ! arrA.isindata(sx-arrA[ic][0],sy-arrA[ic][1]) ){
      return [false,-1,-1];
    }
  }
  return [true,sx,sy];
}
//%}}}

// EOF
