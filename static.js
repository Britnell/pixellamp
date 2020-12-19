const rgb = require('./rgb.js');

function radial(pixels, col){
  for(let p=0; p<pixels.length; p++){
    let pix = pixels[p];
    let dist = Math.sqrt(pix.x*pix.x + pix.y*pix.y);
    dist = rgb.limit( dist, 0,9);
    pix.hsv = {   h: col.h,   s: col.s,   v: rgb.expon3( dist*col.v, 0,9, 0,1 )     };
    pix.col = rgb.HSVtoRGB( pix.hsv );
    pix.col.forEach((byte,i)=>{
      if(byte>254)  pix.col[i] = 254;
    })
  }
  //
}

function radial_inv(pixels, col){
  for(let p=0; p<pixels.length; p++){
    let pix = pixels[p];
    let dist = Math.sqrt(pix.x*pix.x + pix.y*pix.y);
    dist = rgb.limit( 9-dist, 0,9);
    pix.hsv = {   h: col.h,   s: col.s,   v: rgb.expon( dist*col.v, 0,9, 0,1 )     };
    pix.col = rgb.HSVtoRGB( pix.hsv );
    pix.col.forEach((byte,i)=>{
      if(byte>254)  pix.col[i] = 254;
    })
  }
  //
}

function full(pixels, col){
  for(let p=0; p<pixels.length; p++){
    let pix = pixels[p];
    pix.hsv = {   h: col.h,   s: col.s,   v: col.v    };
    pix.col = rgb.HSVtoRGB( pix.hsv );
    pix.col.forEach((byte,i)=>{
      if(byte>254)  pix.col[i] = 254;
    })
  }
  //
}


function square(pixels,col){
  let SQU = 6.7;
  for(let p=0; p<pixels.length; p++){
    let pix = pixels[p];    let b=0;
    if(pix.x > -SQU && pix.x < SQU )
    if(pix.y > -SQU && pix.y < SQU ){
      b = 1;
    }
    pix.hsv = {   h: col.h,   s: col.s,   v: col.v *b     };
    pix.col = rgb.HSVtoRGB( pix.hsv );
    pix.col.forEach((byte,i)=>{
      if(byte>254)  pix.col[i] = 254;
    })
  }
}

function cross(pixels,col){
  let m = 1.76, C = -0.5;
  let th = 2.5, fade = 2.5;

  for(let p=0; p<pixels.length; p++){
    let pix = pixels[p]; let b = 0;
    let L = Math.abs(pix.y - pix.x*m + C);
    let R = Math.abs(pix.y + pix.x*m + C);
    let dist = (L < R) ? L : R;
    if(dist < th)       b = 1;
    else                b = rgb.expon3( fade-dist, 0,th, 0,1 );
    b = rgb.limit(b,0,1);
    pix.hsv = {   h: col.h,   s: col.s,   v: b*col.v   };
    pix.col = rgb.HSVtoRGB( pix.hsv );
    pix.col.forEach((byte,i)=>{
      if(byte>254)  pix.col[i] = 254;
    })
  }
}

function stripes(pixels, col){
  let m = 1.8; let per = 4;
  let oddeven = 0, lastRow = 0;
  for(let p=0; p<pixels.length; p++){
    let pix = pixels[p];
    let rem = remainder( pix.y - pix.x*m, 3*m );
    let b = 0;
    if(Math.abs(rem)<0.1)       b = 1;
    pix.hsv = {   h: col.h,   s: col.s,   v: b*col.v   };
    pix.col = rgb.HSVtoRGB( pix.hsv );
    pix.col.forEach((byte,i)=>{
      if(byte>254)  pix.col[i] = 254;
    })
  }
  //
}

function hatch(pixels, col){
  let m = 1.8; let per = 4;
  let oddeven = 0, lastRow = 0;
  for(let p=0; p<pixels.length; p++){
    let b=0;    let pix = pixels[p];
    let left = Math.abs( remainder( pix.y - pix.x*m, 4*m ) );
    let right = Math.abs( remainder( pix.y + pix.x*m, 4*m ) );
    let rem = (left<right) ? left : right;
    if(Math.abs(rem)<0.1)       b = 1;
    pix.hsv = {   h: col.h,   s: col.s,   v: b*col.v   };
    pix.col = rgb.HSVtoRGB( pix.hsv );
    pix.col.forEach((byte,i)=>{
      if(byte>254)  pix.col[i] = 254;
    })
  }
  //
}

function crescent(pixels, col){
  for(let p=0; p<pixels.length; p++){
    let pix = pixels[p];
    let fadeW = rgb.scale(Math.abs(pix.y),  0,9,  8,4  );
    // let b = rgb.scale(pix.cl, 0,fadeW, 1,0 );
    let b = rgb.expon3(fadeW-pix.cl, 0,fadeW, 0, 1 );
    b = rgb.limit(b,0,1);
    pix.hsv = {   h: col.h,   s: col.s,   v: b*col.v     };
    pix.col = rgb.HSVtoRGB( pix.hsv );
    pix.col.forEach((byte,i)=>{
      if(byte>254)  pix.col[i] = 254;
    })
  }
}

var ecl_ctr = {x: -9, y: 0 };
var ecl_dir = true;

function eclipse(pixels, col){
  
  for(let p=0; p<pixels.length; p++){
    let pix = pixels[p];
    let b = 0;  
    let v = { x: ecl_ctr.x-pix.x , y: ecl_ctr.y-pix.y };
    let dist = Math.sqrt(v.x*v.x + v.y*v.y);
    var inner = 7, outer = 11;
    if(dist<inner)
      b = 0;
    else if(dist<outer)
      b = rgb.expon(dist, inner,outer, 0,1 );
    else 
      b = 1;
    b = rgb.limit(b,0,1);
    pix.hsv = {   h: col.h,   s: col.s,   v: b*col.v     };
    pix.col = rgb.HSVtoRGB( pix.hsv );
    pix.col.forEach((byte,i)=>{
      if(byte>254)  pix.col[i] = 254;
    })
  }
}

function move_eclipse(){
  let lim = 9;
  if(ecl_dir){
    ecl_ctr.x += 0.01;
    if(ecl_ctr.x > lim)
      ecl_dir = false;
  }
  else{
    ecl_ctr.x -= 0.01;
    if(ecl_ctr.x < -lim)
      ecl_dir = true;
  }
}




function remainder(x,div){
  return ( Math.round(x/div) -(x/div) );
}




module.exports.radial = radial;
module.exports.radial_inv = radial_inv;
module.exports.full = full;
module.exports.stripes = stripes;
module.exports.hatch = hatch;
module.exports.cross = cross;
module.exports.square = square;
module.exports.crescent = crescent;
module.exports.eclipse = eclipse;
module.exports.move_eclipse = move_eclipse;

