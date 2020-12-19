
//  **    Serial USB class
class Usb 
{
  constructor(callback){
    this.serialPort = require('serialport');
    this.arduinoport = '/dev/ttyACM0';

    this.port = new this.serialPort(this.arduinoport, function (err) 
    {
      if (err) {
        return console.log('Error: ', err.message)
      }
      else{
        // 2s delay for UART setup
        setTimeout(callback,2000);
      }
      
    })

    this.port.on('error', function(err) {
      console.log('Error: ', err.message)
    })

    this.port.on('data',function(data){
      // console.log('USB rec:\t', data.length);
      if(data.length==3){
        let char = String.fromCharCode(data[0]);
        if(char != '0' )
          console.log(' ? port-data: ', char);
      }
      //
    })
  }

  send_pixels(pixels){
    for(var l=0; l<pixels.length; l++){
      this.port.write(pixels[l].col);
    }
    this.port.write([255]);
  }

  clear_pixels(pixels){
    for(var l=0; l<pixels.length; l++){
      pixels[l].col = [0,0,0];
    } 
  }



  // ** Eo class
}


module.exports = Usb;