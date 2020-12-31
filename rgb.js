  
const PI = Math.PI;

class Gradient {
  constructor(){
    // this.freq = 1;
    this.phase = 0;

    this.xscale = 0.2;
    this.yscale = 0.6;

    this.hueDiff = random(0.05,0.15);
    this.colA = {      h: 0,   s:1, v:1    };
    this.colB = {      h: 0.2, s:1, v:1    };

    this.incP = 0;
    this.incX = 0;
    this.incY = 0;
    this.incH = 0;
    //
  }

  setColour(col){
    this.colA = { h: col.h, s: col.s, v: col.v };
    this.colB = { h: col.h +this.hueDiff, s: col.s, v: col.v };
  }
  updateColour(){
    this.colB = { h: this.colA.h +this.hueDiff, s: this.colA.s, v: this.colA.v };
  }

  get(x,y){
    let val = Math.cos( (x *PI/9 *this.xscale + y *PI/9 * this.yscale ) + this.phase *2*PI );
    let h = scale(val, -1,1, this.colA.h, this.colB.h );
    let col = {
      h: wrap(h,0,1),
      s: scale(val, -1,1, this.colA.s, this.colB.s ),
      v: scale(val, -1,1, this.colA.v, this.colB.v )
    }
    return col;
  }

  shift(){
    const xy = 0.01;
    const xySc = 1.4;
    // * Phase 
    this.phase += this.incP;
    this.phase = wrap(this.phase, 0,1 );
    if(r()<0.01){
      this.incP = random(0.001,0.016);
      // console.log('phase : ',this.incP);
    }

    // * X
    if(this.incX!=0){
      if(this.incX>0){
        this.xscale += xy;
        this.incX   -= xy;
      }
      else {
        this.xscale -= xy;
        this.incX   += xy;
      }
      if(Math.abs(this.incX)<xy) this.incX = 0;
      this.xscale = limit(this.xscale, -xySc,xySc );
    }
    else if(r()<0.1)         
      this.incX = random(-0.5,0.5);

    // * Y
    if(this.incY!=0){
      if(this.incY>0){
        this.yscale += xy;
        this.incY   -= xy;
      }
      else {
        this.yscale -= xy;
        this.incY   += xy;
      }
      if(Math.abs(this.incY)<xy) this.incY = 0;
      this.yscale = limit(this.yscale, -xySc,xySc );
    }
    else if(r()<0.1) 
      this.incY = random(-0.5,0.5);
    
    if(r()<0.1) { 
      this.hueDiff += random(-0.01, 0.01 );
      this.hueDiff = limit(this.hueDiff, 0, 0.18 );
      this.updateColour();
      // console.log('c-diff\t',this.hueDiff);
    }

  }
  // * 
}

function r(){
  return Math.random();
}

function arrayMin(array){
  let min = array[0];
  array.forEach((x)=>{
    if(x<min)
      min = x;
  })
  return min;
}

// returns min <= r < max
function random(min,max){
  return min + (max-min) *Math.random();
}
function random_i(min,max){
  return Math.floor(min + (max-min) *Math.random());
}

function calc_pixel_color(pixels){
  pixels.forEach((pixel)=>{
    pixel.col = HSVtoRGB( pixel.hsv );
  })
}

function HSVtoRGB(h,s,v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    // rescale hue
    h = rescale_hues(h);
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    r = limit( Math.floor(r * 255), 0,254 );
    g = limit( Math.floor(g * 255), 0,254 );
    b = limit( Math.floor(b * 255), 0,254 );
    return [ r,g,b];
}


// neopixel rgb hues are visually not linear, to balance out : 
function rescale_hues(hue){
  const hues = [ 0, 0.025, 0.08, 0.185, 0.3, 0.36, 0.48, 0.66, 0.75, 0.90, 1.0 ];
  const hLin = 0.1;
  let l = Math.floor(hue*10); // nearest 0.1
  if(l==10)
    return 1;
  else
    return scale(hue, l*hLin, (l+1)*hLin,  hues[l],hues[l+1] );
}


function fade_col(bright,col){
  var r = Math.round( expon(bright,0,100,0,col[0]) );
  var g = Math.round( expon(bright,0,100,0,col[1]) );
  var b = Math.round( expon(bright,0,100,0,col[2]) );
  if(r==255)  r=254;
  if(g==255)  g=254;
  if(b==255)  b=254;
  return [r,g,b];
}



function scale(x,xMin,xMax,yMin,yMax){
  let prop = (x-xMin)/(xMax-xMin);
  let sc = yMin + prop * (yMax-yMin);
  return sc;
}

function limit(x,min,max){
  if(x<min)         return min;
  else if(x>max)    return max;
  else    return x;
}

function wrap(x,min,max){
  while(x<min)
    x += (max-min);
  while(x>max)
    x -= (max-min);
  return x;
}

function expon(x,xMin,xMax,yMin,yMax){
  let prop = (x-xMin)/(xMax-xMin);
  let sc = yMin + prop *prop *(yMax-yMin);
  return sc;
}
function expon3(x,xMin,xMax,yMin,yMax){
  let prop = (x-xMin)/(xMax-xMin);
  let sc = yMin + prop*prop*prop *(yMax-yMin);
  return sc;
}

function getRC(pixels,rw,cl){
  pixels.forEach((pix)=>{
    if(pix.rw==rw && pix.cl==cl)
      return pix;
  })
  return null;
}

function getXY(pixels,x,y){
  let ret = null;
  for(let n=0; n<pixels.length; n++){
    let pix = pixels[n];
    let dist = Math.abs(pix.x-x) + Math.abs(pix.y-y);
    if(dist<0.1){
      ret = pix;
      break;
    }
  }
  return ret;
}

function remainder(x,div){
  return ( Math.round(x/div) -(x/div) );
}

function stepVec(ang){
  return { x: Math.cos(ang), y: Math.sin(ang) };
}

// function vecMag(v1,v2){
//   let v = { x: v1.x-v2.x , y: v1.y-v2.y };
//   return Math.sqrt(x*x + v.y*v.y );
// }

function vecMag(x,y){
  return Math.sqrt( x*x + y*y );
}


module.exports.Gradient = Gradient;

module.exports.HSVtoRGB = HSVtoRGB;
module.exports.fade_col = fade_col;
module.exports.calc_pixel_color = calc_pixel_color;
module.exports.r = r;
module.exports.random = random;
module.exports.random_i = random_i;
module.exports.expon = expon;
module.exports.expon3 = expon3;
module.exports.scale = scale;
module.exports.limit = limit;
module.exports.arrayMin = arrayMin;
module.exports.remainder = remainder;
module.exports.wrap = wrap;
module.exports.getRC = getRC;
module.exports.getXY = getXY;
module.exports.stepVec = stepVec;
module.exports.vecMag = vecMag;
