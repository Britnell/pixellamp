

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
    return [ Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255) ];
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

module.exports.HSVtoRGB = HSVtoRGB;
module.exports.fade_col = fade_col;
module.exports.calc_pixel_color = calc_pixel_color;
module.exports.expon = expon;
module.exports.expon3 = expon3;
module.exports.scale = scale;
module.exports.limit = limit;
