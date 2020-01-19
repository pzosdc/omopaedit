//JavaScript

var midloop = midloop || {
// mousemove %{{{
mousemove: function (){
  'use strict';
  if( editmode === 'qp' ){
  } else if( editmode === 'aw' ){
    // 呼び出し元で左右入れ替えしていることに注意
    if( button === buttonid.left ){
      oae_wall();
    } else {
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
      str = '2';
    } else {
      str = '.';
    }
    qdatap[focusx][focusy] = str;
    oaedrawqdata();
  }
},
//%}}}
// rightclick %{{{
rightclick: function (){
  'use strict';
  if( editmode === 'qp' ){
    let str = focusprevstate;
    if( str === '.' ){
      str = '1';
    } else {
      str = '.';
    }
    qdatap[focusx][focusy] = str;
    oaedrawgrid();
    oaedrawqdata();
  }
},
//%}}}
// keydown %{{{
keydown: function (){
  'use strict';
  return;
},
//%}}}

// pzprfileinput %{{{
pzprfileinput: function () {
  'use strict';
  midloop.pzprfileinput_qdatap();
  midloop.pzprfileinput_adatav();
  midloop.pzprfileinput_adatah();
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
// pzprfileinput_adatav %{{{
pzprfileinput_adatav: function () {
  'use strict';
  for( let iy = ndivy; iy >= 1; iy -- ){
    let cline = filebuffer[0].trim();
    let words = cline.split(/\s+/);
    for( let ix = 1; ix < ndivx; ix ++ ){
      if( words[ix-1] === '0' ){
        adatav[ix][iy] = '0';
      } else if( words[ix-1] === '1' ){
        adatav[ix][iy] = '-1';
      } else if( words[ix-1] === '-1' ){
        adatav[ix][iy] = '1';
      }
    }
    filebuffer.shift();
  }
  return;
},
//%}}}
// pzprfileinput_adatah %{{{
pzprfileinput_adatah: function () {
  'use strict';
  for( let iy = ndivy-1; iy >= 1; iy -- ){
    let cline = filebuffer[0].trim();
    let words = cline.split(/\s+/);
    for( let ix = 1; ix <= ndivx; ix ++ ){
      if( words[ix-1] === '0' ){
        adatah[ix][iy] = '0';
      } else if( words[ix-1] === '1' ){
        adatah[ix][iy] = '-1';
      } else if( words[ix-1] === '-1' ){
        adatah[ix][iy] = '1';
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
  str = str + midloop.pzprfileoutput_qdatap();
  str = str + midloop.pzprfileoutput_adatav();
  str = str + midloop.pzprfileoutput_adatah();
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
// pzprfileoutput_adatav %{{{
pzprfileoutput_adatav: function () {
  'use strict';
  let str = '';
  for( let iy = ndivy; iy >= 1; iy -- ){
    for( let ix = 1; ix < ndivx; ix ++ ){
      if( adatav[ix][iy] === '-1' ){
        str = str + ' 1';
      } else if( adatav[ix][iy] === '1' ){
        str = str + ' -1';
      } else {
        str = str + ' 0';
      }
    }
    str = str + '\n';
  }
  return str;
},
//%}}}
// pzprfileoutput_adatah %{{{
pzprfileoutput_adatah: function () {
  'use strict';
  let str = '';
  for( let iy = ndivy-1; iy >= 1; iy -- ){
    for( let ix = 1; ix <= ndivx; ix ++ ){
      if( adatah[ix][iy] === '-1' ){
        str = str + ' 1';
      } else if( adatah[ix][iy] === '1' ){
        str = str + ' -1';
      } else {
        str = str + ' 0';
      }
    }
    str = str + '\n';
  }
  return str;
},
//%}}}

// check %{{{
check: function (){
  'use strict';
  let acc = midloop.hasacceptableanswer();
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
  let iscollected = [];
  for ( let ix = -1; ix <= ndivx+1; ix ++ ) {
    iscollected[ix] = [];
    for ( let iy = -1; iy <= ndivy+1; iy ++ ) {
      iscollected[ix][iy] = false;
    }
  }
  let fpcfx = null;
  let fpcfy = null;
  for ( let ix = 2; ix <= ndivx-1; ix ++ ) {
    for ( let iy = 2; iy <= ndivy-1; iy ++ ) {
      let linum = 0;
      if( adatav[ix][iy] === '-1' ) linum ++;
      if( adatah[ix][iy] === '-1' ) linum ++;
      if( adatav[ix-1][iy] === '-1' ) linum ++;
      if( adatah[ix][iy-1] === '-1' ) linum ++;
      if( linum > 2 ) return [false,{posx:ix,posy:iy,errmsg:'線が分岐しています'}];
      if( linum === 1 ) return [false,{posx:ix,posy:iy,errmsg:'線が途切れています'}];
      if( fpcfx === null && linum === 2 ){
        fpcfx = ix;
        fpcfy = iy;
      }
    }
  }
  if( fpcfx === null ) return [false,{posx:null,posy:null,errmsg:'線が引かれていません'}];
  // 複数のループチェック(firstpathcellfoundから辿れるセルリストの作成)
  let cx = fpcfx;
  let cy = fpcfy;
  let prex = 0;
  let prey = 0;
  for( let iq = 1; iq < ndivx*ndivy; iq ++ ){
    iscollected[cx][cy] = true;
    if( cx < ndivx && adatav[cx][cy] === '-1' && prex !== -1 ){
      cx ++;
      prex = 1;
      prey = 0;
    } else if( cy < ndivy && adatah[cx][cy] === '-1' && prey !== -1 ){
      cy ++;
      prex = 0;
      prey = 1;
    } else if( cx > 1 && adatav[cx-1][cy] === '-1' && prex !== 1 ){
      cx --;
      prex = -1;
      prey = 0;
    } else if( cy > 1 && adatah[cx][cy-1] === '-1' && prey !== 1 ){
      cy --;
      prex = 0;
      prey = -1;
    }
    if( iscollected[cx][cy] ) break;
  }
  for ( let ix = 1; ix <= ndivx; ix ++ ) {
    for ( let iy = 1; iy <= ndivy; iy ++ ) {
      if( iscollected[ix][iy] ) continue;
      if( ix < ndivx && adatav[ix][iy] === '-1' ) return [false,{posx:ix,posy:iy,errmsg:'ループが複数あります'}];
      if( iy < ndivy && adatah[ix][iy] === '-1' ) return [false,{posx:ix,posy:iy,errmsg:'ループが複数あります'}];
    }
  }
  for ( let ix = 1; ix <= ndivx; ix ++ ) {
    for ( let iy = 1; iy <= ndivy; iy ++ ) {
      if( qdatap[2*ix][2*iy] === '2' && ! iscollected[ix][iy] ) return [false,{posx:ix,posy:iy,errmsg:'黒い点を線が通っていません'}];
      if( qdatap[2*ix+1][2*iy] === '2' && adatav[ix][iy] !== '-1' ) return [false,{posx:ix+0.5,posy:iy,errmsg:'黒い点を線が通っていません'}];
      if( qdatap[2*ix][2*iy+1] === '2' && adatah[ix][iy] !== '-1' ) return [false,{posx:ix,posy:iy+0.5,errmsg:'黒い点を線が通っていません'}];
      if( qdatap[2*ix+1][2*iy+1] === '2' ) return [false,{posx:ix+0.5,posy:iy+0.5,errmsg:'格子点に黒い点があります'}];
    }
  }
  // [TODO] 黒点の中点条件チェック
  for ( let ix = 1; ix <= ndivx; ix ++ ) {
    for ( let iy = 1; iy <= ndivy; iy ++ ) {
      if( qdatap[2*ix][2*iy] === '2' ){
        if( adatav[ix][iy] === '-1' || adatav[ix-1][iy] === '-1' ){
          for( let il = 1; il < Math.max(ndivx,ndivy); il ++ ){
            if( adatav[ix+il-1][iy] === '-1' || adatav[ix-il][iy] === '-1' ){
              if( adatav[ix+il-1][iy] !== '-1' || adatav[ix-il][iy] !== '-1' ){
                return [false,{posx:ix,posy:iy,errmsg:'黒い点が線分の中央にありません'}];
              }
            } else {
              break;
            }
          }
        } else {
          for( let il = 1; il < Math.max(ndivx,ndivy); il ++ ){
            if( adatah[ix][iy+il-1] === '-1' || adatah[ix][iy-il] === '-1' ){
              if( adatah[ix][iy+il-1] !== '-1' || adatah[ix][iy-il] !== '-1' ){
                return [false,{posx:ix,posy:iy,errmsg:'黒い点が線分の中央にありません'}];
              }
            } else {
              break;
            }
          }
        }
      }
      if( qdatap[2*ix+1][2*iy] === '2' ){
        for( let il = 1; il < Math.max(ndivx,ndivy); il ++ ){
          if( adatav[ix+il][iy] === '-1' || adatav[ix-il][iy] === '-1' ){
            if( adatav[ix+il][iy] !== '-1' || adatav[ix-il][iy] !== '-1' ){
              return [false,{posx:ix+0.5,posy:iy,errmsg:'黒い点が線分の中央にありません'}];
            }
          } else {
            break;
          }
        }
      }
      if( qdatap[2*ix][2*iy+1] === '2' ){
        for( let il = 1; il < Math.max(ndivx,ndivy); il ++ ){
          if( adatah[ix][iy+il] === '-1' || adatah[ix][iy-il] === '-1' ){
            if( adatah[ix][iy+il] !== '-1' || adatah[ix][iy-il] !== '-1' ){
              return [false,{posx:ix,posy:iy+0.5,errmsg:'黒い点が線分の中央にありません'}];
            }
          } else {
            break;
          }
        }
      }
    }
  }
  return [true,{}];
}
//%}}}
};

// EOF
