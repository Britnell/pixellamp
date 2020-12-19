
class pixel {

  constructor(l){
    this.x=0;
    this.y=0;

    this.rw = 0;
    this.cl = 0;

    // this.index= {};
    this.rev = false;
    this.rowOrigin = 0;
    this.rowLEDS = 0;
    
    this.col = new Uint8Array(3);   // rgb array that is sent by serial
    this.hsv = {};      // hsv object for calculations
    this.n=l;

    // this.state = 0;
  }

}

function create_disclamp_pixel()
{
  var n = 0;
  var xStep = 1;  
  var yStep = 0.866025;
  var pix_per_row = [ 5,10,11,14,15,16,17,18,17,18,19,18,17,18,17,16,15,14,11,10,5 ];
  
  let pixels = [];

  for(var row = 0; row<pix_per_row.length; row++ )        // * Rows
  {    

    // * Y height of Row
    let rowY;
    if(row<10){       rowY = (10-row)*yStep;    }   // Y height of row
    else if(row>10){       rowY = -(row-10)*yStep;    }     // Y height is symmetrical
    else{      rowY = 0;    }
    rowY = Math.round(rowY*10)/10;
    
    // * X pixels of row
    let rowLEDS = pix_per_row[row];
    let rowX = -xStep * ((rowLEDS-1)/2);    // x coordinate begin of this row
    
    // row array
    // row_pixels.push([]);
    for( var c=0; c<rowLEDS; c++ )      // * Leds in row
    { 
      pixels[n] = new pixel(n);

      let cRev;
      if(row%2==0){
        cRev = c;
        pixels[n].rev = false;
      }
      else {
        cRev= (rowLEDS-1-c);
        pixels[n].rev = true;
      } 

      pixels[n].col = [0,0,0];
      pixels[n].rw = row;     // row
      pixels[n].cl = cRev;    // collumn
      pixels[n].rowOrigin = rowX;
      pixels[n].rowLEDS   = rowLEDS;
      pixels[n].x = rowX + cRev*xStep;
      pixels[n].y = rowY;
      
      n++;
    }
  }
  return pixels;
  // Eo func
}




module.exports = create_disclamp_pixel;