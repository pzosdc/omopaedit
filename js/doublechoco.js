//JavaScript

var doublechoco = doublechoco || {
// mousemove %{{{
mousemove: function(){
  'use strict';
  if( editmode === 'qc' ){
    oae_shade();
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
leftclick: function(){
  'use strict';
  if( editmode === 'qc' ){
    oae_shade();
  }
},
//%}}}
// rightclick %{{{
rightclick: function(){
  'use strict';
  if( editmode === 'qc' ){
    let str = focusprevstate;
    if( str.match(/^[c\.][0-9]+$/) !== null ){
      let num = parseInt(str.substring(1),10);
      num ++;
      str = str.substring(0,1) + num.toString(10);
    } else {
      str = str + '1';
    }
    qdatac[focusx][focusy] = str;
    oaedrawgrid();
    oaedrawqdata();
  }
},
//%}}}
// keydown %{{{
keydown: function(n){
  'use strict';
  if( editmode === 'qc' ){
    let str = qdatac[cursorx][cursory];
    if( n === -2 ){
      if( str.substring(0,1) === 'c' ){
        str = 'c';
      } else {
        str = '.';
      }
    } else if( n >= 0 && n <= 9 ){
      let head = '.';
      if( str.substring(0,1) === 'c' ){
        head = 'c';
      }
      str = str.substring(1);
      if( str.match(/^[0-9]+$/) !== null ){
        str = str + n.toString(10);
        if( parseInt(str,10) > ndivx*ndivy/2 ){
          str = n.toString(10);
          if( parseInt(str,10) > ndivx*ndivy/2 ){
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
      str = head + str;
      if( str === '' ) str = '.';
    } else if( n === -1 ){
      // BS
      if( str.match(/^c[0-9]+$/) !== null ){
        str = str.substring(0,str.length-1);
      } else if( str.match(/^\.[0-9]+$/) !== null ){
        str = str.substring(0,str.length-1);
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
  if( str.match(/^\.[0-9]*$/) !== null ){
    return 'c' + str.substring(1);
  } else {
    return '.' + str.substring(1);
  }
},
//%}}}
// check %{{{
check: function (){
  'use strict';
  let acc = doublechoco.hasacceptableanswer();
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
      let firstblackid = -1;
      let firstwhiteid = -1;
      let givennumber = -1;
      // make local room queue
      localroomqueue.push([ix,iy]);
      if( qdatac[ix][iy].substring(0,1) === 'c' ) firstblackid = 0;
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
        if( qdatac[jx][jy].substring(0,1) === 'c' ){
          if( firstblackid === -1 ) firstblackid = ip;
        } else {
          if( firstwhiteid === -1 ) firstwhiteid = ip;
        }
        if( qdatac[jx][jy].match(/[0-9]+$/) !== null ){
          let i = parseInt(qdatac[jx][jy].match(/[0-9]+$/)[0],10);
          if( givennumber !== -1 && i !== givennumber ){
            return [false,{posx:jx,posy:jy,errmsg:'異なる数が与えられています'}];
          }
          givennumber = i;
        }
      }
      // reflect cell state
      for( let ip = 0; ip < localroomqueue.length; ip ++ ) {
        let jx = localroomqueue[ip][0];
        let jy = localroomqueue[ip][1];
        iscollected[jx][jy] = true;
      }
      // easy check
      if( localroomqueue.length % 2 === 1 ){
        return [false,{posx:ix,posy:iy,errmsg:'部屋のサイズが奇数になっています'}];
      }
      if( firstblackid === -1 ){
        return [false,{posx:ix,posy:iy,errmsg:'部屋に黒マスがありません'}];
      }
      if( firstwhiteid === -1 ){
        return [false,{posx:ix,posy:iy,errmsg:'部屋に白マスがありません'}];
      }
      //-------------------------------------
      //console.log(ix,iy,localroomqueue.length,firstblackid,firstwhiteid);
      //-------------------------------------
      // make black queue (also check connection)
      let localblackqueue = Object.create(localroomqueue);
      localblackqueue.length = 0;
      localblackqueue.push(localroomqueue[firstblackid]);
      for( let ip = 0; ip <= ndivx*ndivy; ip ++ ) {
        if( ip >= localblackqueue.length ) break;
        let jx = localblackqueue[ip][0];
        let jy = localblackqueue[ip][1];
        if( (jx !== 1) && localroomqueue.isinarr(jx-1,jy) && localblackqueue.isnotinarr(jx-1,jy) && qdatac[jx-1][jy].substring(0,1) === 'c' ){
          localblackqueue.push([jx-1,jy]);
        }
        if( (jx !== ndivx) && localroomqueue.isinarr(jx+1,jy) && localblackqueue.isnotinarr(jx+1,jy) && qdatac[jx+1][jy].substring(0,1) === 'c'  ){
          localblackqueue.push([jx+1,jy]);
        }
        if( (jy !== 1) && localroomqueue.isinarr(jx,jy-1) && localblackqueue.isnotinarr(jx,jy-1) && qdatac[jx][jy-1].substring(0,1) === 'c'  ){
          localblackqueue.push([jx,jy-1]);
        }
        if( (jy !== ndivy) && localroomqueue.isinarr(jx,jy+1) && localblackqueue.isnotinarr(jx,jy+1) && qdatac[jx][jy+1].substring(0,1) === 'c'  ){
          localblackqueue.push([jx,jy+1]);
        }
      }
      // make white queue (also check connection)
      let localwhitequeue = Object.create(localroomqueue);
      localwhitequeue.length = 0;
      localwhitequeue.push(localroomqueue[firstwhiteid]);
      for( let ip = 0; ip <= ndivx*ndivy; ip ++ ) {
        if( ip >= localwhitequeue.length ) break;
        let jx = localwhitequeue[ip][0];
        let jy = localwhitequeue[ip][1];
        if( (jx !== 1) && localroomqueue.isinarr(jx-1,jy) && localwhitequeue.isnotinarr(jx-1,jy) && qdatac[jx-1][jy].substring(0,1) !== 'c' ){
          localwhitequeue.push([jx-1,jy]);
        }
        if( (jx !== ndivx) && localroomqueue.isinarr(jx+1,jy) && localwhitequeue.isnotinarr(jx+1,jy) && qdatac[jx+1][jy].substring(0,1) !== 'c'  ){
          localwhitequeue.push([jx+1,jy]);
        }
        if( (jy !== 1) && localroomqueue.isinarr(jx,jy-1) && localwhitequeue.isnotinarr(jx,jy-1) && qdatac[jx][jy-1].substring(0,1) !== 'c'  ){
          localwhitequeue.push([jx,jy-1]);
        }
        if( (jy !== ndivy) && localroomqueue.isinarr(jx,jy+1) && localwhitequeue.isnotinarr(jx,jy+1) && qdatac[jx][jy+1].substring(0,1) !== 'c'  ){
          localwhitequeue.push([jx,jy+1]);
        }
      }
      // check
      if( localblackqueue.length !== localroomqueue.length / 2 || localwhitequeue.length !== localroomqueue.length / 2 ){
        return [false,{posx:ix,posy:iy,errmsg:'部屋内のひとつながりの黒マスまたは白マスの数があっていません'}];
      }
      if( givennumber !== -1 && localblackqueue.length !== givennumber ){
        return [false,{posx:ix,posy:iy,errmsg:'部屋サイズと与えられた数が一致していません'}];
      }
      givennumber = localblackqueue.length;
      // size and connection has been checked
      // shape check
      let iscongruent = oae_iscongruent_arr(localblackqueue,localwhitequeue);
      if( ! iscongruent ){
        return [false,{posx:ix,posy:iy,errmsg:'合同でありません'}];
      }
    }
  }
  return [true,{}];
},
//%}}}
};

// oae_iscongruent_arr %{{{
function oae_iscongruent_arr(arrAin,arrBin){
  'use strict';
  // それぞれの図形は座標値[ix,iy]の対の配列として入ってくることを想定
  // 例えばarrA[0]=[5,2], arrA[1]=[5,1],...
  // 図形は連結でなくても良いものとする
  if( arrAin.length !== arrBin.length ){
    //console.log('size differ');
    return false;
  }
  // shallowにコピー
  let arrA = [];
  let arrB = [];
  for ( let ic = 0; ic < arrAin.length; ic ++ ){
    arrA[ic] = arrAin[ic].concat();
    arrB[ic] = arrBin[ic].concat();
  }
  // get boundingbox
  let xmaxA;  let xminA;
  let ymaxA;  let yminA;
  let xmaxB;  let xminB;
  let ymaxB;  let yminB;
  for( let ic = 0; ic < arrA.length; ic ++ ){
    let ixA = arrA[ic][0];
    let iyA = arrA[ic][1];
    let ixB = arrB[ic][0];
    let iyB = arrB[ic][1];
    if( ic === 0 ){
      xmaxA = ixA;  xminA = ixA;
      ymaxA = iyA;  yminA = iyA;
      xmaxB = ixB;  xminB = ixB;
      ymaxB = iyB;  yminB = iyB;
    } else {
      if( ixA > xmaxA ) xmaxA = ixA;
      if( ixA < xminA ) xminA = ixA;
      if( iyA > ymaxA ) ymaxA = iyA;
      if( iyA < yminA ) yminA = iyA;
      if( ixB > xmaxB ) xmaxB = ixB;
      if( ixB < xminB ) xminB = ixB;
      if( iyB > ymaxB ) ymaxB = iyB;
      if( iyB < yminB ) yminB = iyB;
    }
  }
  let xsizeA = xmaxA - xminA;
  let ysizeA = ymaxA - yminA;
  let xsizeB = xmaxB - xminB;
  let ysizeB = ymaxB - yminB;
  let sxA = xmaxA + xminA;
  let syA = ymaxA + yminA;
  let sxB = xmaxB + xminB;
  let syB = ymaxB + yminB;
  // boundingbox status
  let shapestatus;
  if( xsizeA === ysizeA ){
    if( xsizeB !== ysizeB ) return false;
    shapestatus = 'square';
  } else if( xsizeA === xsizeB && ysizeA === ysizeB ){
    shapestatus = 'normal';
  } else if( xsizeA === ysizeB && ysizeA === xsizeB ){
    shapestatus = 'perpendicular';
  } else {
    //console.log('boundingbox differ');
    return false;
  }
  // 比較の条件を統一するためにperpendicularの場合はあらかじめarrAを回転しておく
  if( shapestatus === 'perpendicular' ){
    for( let ip = 0; ip < arrA.length; ip ++ ){
      let ix = arrA[ip][0];
      let iy = arrA[ip][1];
      arrA[ip][0] = iy;
      arrA[ip][1] = ix;
    }
    let swap;
    swap = sxA; sxA = syA; syA = swap;
    swap = xsizeA; xsizeA = ysizeA; ysizeA = swap;
    swap = xmaxA; xmaxA = ymaxA; ymaxA = swap;
    swap = xminA; xminA = yminA; yminA = swap;
    shapestatus = 'normal';
  }
  // わかりやすさのため中心も統一
  {
    xmaxA += (sxB-sxA)/2;  xminA += (sxB-sxA)/2;
    ymaxA += (syB-syA)/2;  yminA += (syB-syA)/2;
    for( let ip = 0; ip < arrA.length; ip ++ ){
      arrA[ip][0] += (sxB-sxA)/2;
      arrA[ip][1] += (syB-syA)/2;
    }
    sxA = sxB;
    syA = syB;
  }
  // この時点で二つのバウンディングボックスは完全に一致したはず
  arrB.isindata = function(ix,iy){
    for( let ip = 0; ip < this.length; ip ++ ){
      if( this[ip][0] === ix && this[ip][1] === iy ){
        return true;
      }
    }
    return false;
  };
  // そのまま・上下反転・左右反転・点対称のいずれかで一致するかしらべる
  // 正方形の場合は回転してからもう一度同じ処理をする
  // コード再利用のためループにする
  let iloopmax = 1;
  if( shapestatus === 'square' ) iloopmax = 2;
  for( let iloop = 1; iloop <= iloopmax; iloop ++ ){
    if( iloop === 2 ){
      // arrAのデータを90度回転
      // perpendicularを回転したように、XとYを入れ替えてから中心を戻す
      {
        for( let ip = 0; ip < arrA.length; ip ++ ){
          let ix = arrA[ip][0];
          let iy = arrA[ip][1];
          arrA[ip][0] = iy;
          arrA[ip][1] = ix;
        }
        let swap;
        swap = sxA; sxA = syA; syA = swap;
        swap = xsizeA; xsizeA = ysizeA; ysizeA = swap;
        swap = xmaxA; xmaxA = ymaxA; ymaxA = swap;
        swap = xminA; xminA = yminA; yminA = swap;
        shapestatus = 'normal';
      }
      {
        xmaxA += (sxB-sxA)/2;  xminA += (sxB-sxA)/2;
        ymaxA += (syB-syA)/2;  yminA += (syB-syA)/2;
        for( let ip = 0; ip < arrA.length; ip ++ ){
          arrA[ip][0] += (sxB-sxA)/2;
          arrA[ip][1] += (syB-syA)/2;
        }
        sxA = sxB;
        syA = syB;
      }
    }
    let iscongruent;
    // compare
    iscongruent = true;
    for( let ic = 0; ic < arrA.length; ic ++ ){
      if( ! arrB.isindata(arrA[ic][0],arrA[ic][1]) ){
        iscongruent = false;
        break;
      }
    }
    if( iscongruent ) return true;
    // upside down
    iscongruent = true;
    for( let ic = 0; ic < arrA.length; ic ++ ){
      if( ! arrB.isindata(arrA[ic][0],syA-arrA[ic][1]) ){
        iscongruent = false;
        break;
      }
    }
    if( iscongruent ) return true;
    // leftside right
    iscongruent = true;
    for( let ic = 0; ic < arrA.length; ic ++ ){
      if( ! arrB.isindata(sxA-arrA[ic][0],arrA[ic][1]) ){
        iscongruent = false;
        break;
      }
    }
    if( iscongruent ) return true;
    // upside down AND leftside right
    iscongruent = true;
    for( let ic = 0; ic < arrA.length; ic ++ ){
      if( ! arrB.isindata(sxA-arrA[ic][0],syA-arrA[ic][1]) ){
        iscongruent = false;
        break;
      }
    }
    if( iscongruent ) return true;
  }
  return;
}
//%}}}

// EOF
