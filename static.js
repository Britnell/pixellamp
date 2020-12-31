const rgb = require('./rgb.js');

class statics
{
  constructor(){
    this.inverted = false;
    this.ecl_ctr = {x: -9, y: 0 };
    this.ecl_dir = true;
  }

radial(pixels, grad){
  for(let p=0; p<pixels.length; p++){
    let pix = pixels[p];
    let dist = Math.sqrt(pix.x*pix.x + pix.y*pix.y);
    dist = rgb.limit( dist, 0,9);
    let b;
    if(this.inverted) 
      b = rgb.scale(dist, 0,9, 0,1 );
    else
      b = rgb.scale(9-dist, 0,9, 0,1 );
    let col = grad.colA;
    pix.hsv = {   h: col.h,   s: col.s,   v: rgb.expon3( b*col.v, 0,1, 0,1 )     };
    pix.col = rgb.HSVtoRGB( pix.hsv );
  }
  grad.shift();
  //
}

full(pixels, grad){
  for(let p=0; p<pixels.length; p++){
    let pix = pixels[p];
    let col = grad.get(pix.x,pix.y);
    pix.hsv = {   h: col.h,   s: col.s,   v: col.v*0.7    };
    pix.col = rgb.HSVtoRGB( pix.hsv );
  }
  grad.shift();
  //
}


 square(pixels,grad){
  let SQU = 6.7;
  // console.log(' SQU - ', this.inverted)
  for(let p=0; p<pixels.length; p++){
    let pix = pixels[p];    let b=0;
    if(this.inverted)    SQU = 6.0;
    if(pix.x > -SQU && pix.x < SQU )
      if(pix.y > -SQU && pix.y < SQU )
        b = 1;
    if(this.inverted)  b = 1-b;
    let col = grad.get(pix.x,pix.y);
    pix.hsv = {   h: col.h,   s: col.s,   v: col.v *b     };
    pix.col = rgb.HSVtoRGB( pix.hsv );
  }
  grad.shift();
}


triangle(pixels,grad){
  let m1 = 1.77,   m2 = -1.77;
  let  c = -9;

  for(let p=0; p<pixels.length; p++){
    let pix = pixels[p];
    if(this.inverted)    c = -8
    let y1 = m1*pix.x + c;
    let y2 = m2*pix.x + c;
    let b = 0;
    if( pix.y>y1 && pix.y>y2 && pix.y<5 )      
      b = 1;
    if(this.inverted)    b = 1 - b;
    let col = grad.get(pix.x,pix.y);
    pix.hsv = {   h: col.h,   s: col.s,   v: col.v *b     };
    pix.col = rgb.HSVtoRGB( pix.hsv );
  }
  grad.shift();
}



cross(pixels,grad){
  let m = 1.76, C = 1.2;
  let th = 3.2, fade = 2.5;

  let cX = 2.5, cY = 2.5;
  for(let p=0; p<pixels.length; p++){
    let pix = pixels[p]; let b = 0;
    if( (pix.x>-cX && pix.x<cX) || (pix.y>-cY && pix.y<cY) )
      b = 1;
    if(this.inverted)    b = 1 - b;
    let col = grad.get(pix.x,pix.y);
    pix.hsv = {   h: col.h,   s: col.s,   v: b*col.v   };
    pix.col = rgb.HSVtoRGB( pix.hsv );
  }
  grad.shift();
}

stripes(pixels, grad){
  let m = 1.8; let per = 4;
  let oddeven = 0, lastRow = 0;
  for(let p=0; p<pixels.length; p++){
    let pix = pixels[p];
    let rem = rgb.remainder( pix.y - pix.x*m, 3*m );
    let b = 0;
    if(Math.abs(rem)<0.1)       b = 1;
    if(this.inverted)    b = 1 - b;
    let col = grad.get(pix.x,pix.y);
    pix.hsv = {   h: col.h,   s: col.s,   v: b*col.v   };
    pix.col = rgb.HSVtoRGB( pix.hsv );
  }
  grad.shift();
}

hatch(pixels, grad){
  let m = 1.8; let per = 4;
  let oddeven = 0, lastRow = 0;
  for(let p=0; p<pixels.length; p++){
    let b=0;    let pix = pixels[p];
    let left = Math.abs( rgb.remainder( pix.y - pix.x*m, 4*m ) );
    let right = Math.abs( rgb.remainder( pix.y + pix.x*m, 4*m ) );
    let rem = (left<right) ? left : right;
    if(Math.abs(rem)<0.1)       b = 1;
    if(this.inverted)    b = 1 - b;
    let col = grad.get(pix.x,pix.y);
    pix.hsv = {   h: col.h,   s: col.s,   v: b*col.v   };
    pix.col = rgb.HSVtoRGB( pix.hsv );
  }
  grad.shift();
}

crescent(pixels, grad){
  for(let p=0; p<pixels.length; p++){
    let pix = pixels[p], b=0;
    let fadeW = rgb.scale(Math.abs(pix.y),  0,9,  8,4  );
    if(!this.inverted)
      b = rgb.expon3(fadeW-pix.cl, 0,fadeW, 0, 1 );
    else
      b = rgb.expon3(pix.cl, 0,fadeW, 0, 1 );
    b = rgb.limit(b,0,1);
    // if(this.inverted)    b = 1 - b;
    let col = grad.get(pix.x,pix.y);
    pix.hsv = {   h: col.h,   s: col.s,   v: b*col.v     };
    pix.col = rgb.HSVtoRGB( pix.hsv );
  }
  grad.shift();
}


eclipse(pixels, grad){
  
  for(let p=0; p<pixels.length; p++){
    let pix = pixels[p];
    let b = 0;  
    let v = { x: this.ecl_ctr.x-pix.x , y: this.ecl_ctr.y-pix.y };
    let dist = Math.sqrt(v.x*v.x + v.y*v.y);
    var inner = 7, outer = 11;
    if(dist<inner)
      b = (this.inverted) ? 1 : 0;
    else 
      if(dist<outer){
        if(!this.inverted)
          b = rgb.expon(dist, inner,outer, 0,1 );
        else
          b = rgb.expon(outer-dist, 0, inner, 0,1 );
      }
    else                    
      b = (this.inverted) ? 0 : 1;
    b = rgb.limit(b,0,1);
    // if(this.inverted)    b = 1 - b;
    let col = grad.get(pix.x,pix.y);
    pix.hsv = {   h: col.h,   s: col.s,   v: b*col.v     };
    pix.col = rgb.HSVtoRGB( pix.hsv );
  }
  grad.shift();
}

move_eclipse(){
  let lim = 9;
  if(this.ecl_dir){
    this.ecl_ctr.x += 0.01;
    if(this.ecl_ctr.x > lim)
      this.ecl_dir = false;
  }
  else{
    this.ecl_ctr.x -= 0.01;
    if(this.ecl_ctr.x < -lim)
      this.ecl_dir = true;
  }
}


quarter(pixels,grad){  // axial 
  const pi = Math.PI;
  const lean = Math.PI/3;
  for(let p=0; p<pixels.length; p++){
    let pix = pixels[p];
    let ang = Math.atan2(pix.y, pix.x );  // -pi to pi
    let X = Math.abs( lean -ang);
    let Y = Math.abs( -pi+lean-ang);
    let smaller = (X<Y) ? X : Y;
    let b = rgb.expon3(smaller, 0,pi/2, 0, 1);
    b = rgb.limit(b,0,1);
    if(this.inverted)    b = 1 - b;
    let col = grad.get(pix.x,pix.y);
    pix.hsv = {   h: col.h,   s: col.s,   v: b*col.v     };
    pix.col = rgb.HSVtoRGB( pix.hsv );
  }
  grad.shift();
}


dots(pixels,grad){ 
  for(let p=0; p<pixels.length; p++){
    let pix = pixels[p]; let b=0;
    if(pix.rw%2==0){
      let c = pix.cl + (pix.rowOrigin%2) + (pix.rw/2);
      if(c%2==0)
        b=1;
    }
    if(this.inverted)    b = 1 - b;
    let col = grad.get(pix.x,pix.y);
    pix.hsv = {   h: col.h,   s: col.s,   v: b*col.v     };
    pix.col = rgb.HSVtoRGB( pix.hsv );
  }
  grad.shift();

}

trigs(pixels,grad){ 
  for(let p=0; p<pixels.length; p++){
    let pix = pixels[p]; let b=0;
    if(pix.rw%4==0){
      let c = pix.cl + (pix.rowOrigin%4) + (pix.rw/2);
      if(c%4==0)          b=1;
    }
    else if(pix.rw%4==3){
      let c = pix.cl + (pix.rowOrigin%4) + (pix.rw/2);
      if(c%4==0 || c%4==3)          b=1;
    }
    else if(pix.rw%4==2){
      let c = pix.cl + (pix.rowOrigin%4) + (pix.rw/2);
      if(c%4!=1)          b=1;
    }
    else
      b=1;
    if(this.inverted)    b = 1 - b;
    let col = grad.get(pix.x,pix.y);
    pix.hsv = {   h: col.h,   s: col.s,   v: b*col.v     };
    pix.col = rgb.HSVtoRGB( pix.hsv );
  }
  grad.shift();

}

half(pixels,grad){ 
  const xMin = -1;
  for(let p=0; p<pixels.length; p++){
    let pix = pixels[p]; let b=0;
    if(this.inverted){
      if(pix.x>=0)  b = 1;
    }
    else 
      if(pix.x<=0)  b = 1;
    let col = grad.get(pix.x,pix.y);
    pix.hsv = {   h: col.h,   s: col.s,   v: b*col.v     };
    pix.col = rgb.HSVtoRGB( pix.hsv );
  }
  grad.shift();
}

star(pixels,grad){ 
  let m1 = 1.77,   m2 = -1.77;
  let  c = -9;
  for(let p=0; p<pixels.length; p++){
    let pix = pixels[p], b=0;
    // if(this.inverted)    c = -8
    let y, dists = [];
    dists.push(Math.abs( pix.y -(m1*pix.x+c) ));
    dists.push(Math.abs( pix.y -(c-m1*pix.x) ));
    //
    dists.push(Math.abs( pix.y -(m1*pix.x-c) ));
    dists.push(Math.abs( pix.y +(c+m1*pix.x) ));
    //
    dists.push(Math.abs(pix.y -4.0));
    dists.push(Math.abs(pix.y +4.0));
    // dists.push(Math.abs( pix.y -(m1*pix.x) ));
    // dists.push(Math.abs( pix.y +(m1*pix.x) ));
    // dists.push(Math.abs(pix.y ));
    let dist = rgb.arrayMin(dists);
    if( dist < 0.5)       b = 1;
    if(this.inverted)    b = 1 - b;
    let col = grad.get(pix.x,pix.y);
    pix.hsv = {   h: col.h,   s: col.s,   v: col.v *b     };
    pix.col = rgb.HSVtoRGB( pix.hsv );
  }
  grad.shift();
}

nest(pixels,grad){ 
  let m1 = 1.77,   m2 = -1.77;
  let  c = -9;
  for(let p=0; p<pixels.length; p++){
    let pix = pixels[p], b=0;
    // if(this.inverted)    c = -8
    let y, dists = [];
    dists.push(Math.abs( pix.y -(m1*pix.x) ));
    dists.push(Math.abs( pix.y +(m1*pix.x) ));
    dists.push(Math.abs(pix.y));
    //
    let dist = rgb.arrayMin(dists);
    if( dist < 0.5)       b = 1;
    if(this.inverted)    b = 1 - b;
    let col = grad.get(pix.x,pix.y);
    pix.hsv = {   h: col.h,   s: col.s,   v: col.v *b     };
    pix.col = rgb.HSVtoRGB( pix.hsv );
  }
  grad.shift();
}


xmas(pixels,gradient){

  // background
  
  // * Tree
  const star = [ 
                 298,
                 291, 290, 
                 280 
               ];
  const tree = [ 268, 267, 
                 254, 253, 252,
                 239, 238, 237, 236,
                 223, 222, 221, 220, 219,
                 205, 204, 203, 202,
                 188, 187, 186, 185, 184,
                 171, 170, 169, 168, 167, 166,
                 152, 151, 150, 149, 148,
                 134, 133, 132, 131, 130, 129,
                 117, 116, 115, 114, 113, 112, 111,
                 99, 98, 97, 96, 95, 94,
                 82, 81, 80, 79, 78, 77, 76,
                 66, 65, 64, 63, 62, 61, 60, 59,
                 51, 50, 49, 48, 47, 46, 45, 44, 43
               ];
  const stump = [ 
                  48, 47, 46,
                  33, 32,
                  21, 20
                ];

  let Htree = rgb.wrap(gradient.colA.h + 0.3, 0, 1);
  let Hstar = rgb.wrap(gradient.colA.h + 0.6, 0, 1);
  let Hstump = rgb.wrap(gradient.colA.h + 0.6, 0, 1);


  for(let p=0; p<pixels.length; p++){
    let col = gradient.get( pixels[p].x, pixels[p].y );
    col.v *= 0.3;
    pixels[p].col = rgb.HSVtoRGB(col);
  }

  star.forEach((p)=>{
    let col = { h: Hstar, s: gradient.colA.s,   v: 1   }; //gradient.colA.v 
    pixels[p].col = rgb.HSVtoRGB(col);
  })
  
  tree.forEach((p)=>{
    let col = { h: Htree, s: gradient.colA.s,   v: gradient.colA.v    };
    pixels[p].col = rgb.HSVtoRGB(col);
  });

  // stump.forEach((p)=>{
  //   let col = { h: Hstar, s: gradient.colA.s,   v: gradient.colA.v   };
  //   pixels[p].col = rgb.HSVtoRGB(col);
  // })
  //
  gradient.shift();
}



invert(){
  this.inverted = !this.inverted;
  return this.inverted;
}

}

module.exports = new statics();
