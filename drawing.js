
const statics = require('./static.js');
// * serial usb port module
const Usb = require('./usb.js');
const Pixel = require('./pixel.js');
var leds;


class Drawing{

	constructor(){
		this.col = { h: 0, s: 1, v: 0.5 };
		this.FR = 0;
		this.modes = [ 'RADIAL', 'RADIAL_INV', 'STRIPES', 'HATCHED', 'CRESCENT', 'ECLIPSE', 'SQUARE', 'CROSS' ];	// 'FULL',
		this.mode = this.modes.length-1;
		// 
		this.pixels = Pixel();	// create disc pixel
		leds = new Usb(()=>{
			console.log(' SERIAL CONN ');
			this.setMode(this.mode);
		});
		
		//
	}

	setMode(n){
		this.mode = n;
		this.current = this.modes[n];
		// * STATIC
		if(['RADIAL', 'RADIAL_INV', 'STRIPES', 'HATCHED', 'CRESCENT','SQUARE', 'CROSS' ].includes(this.current) ){
			this.FR = 0;
			this.redraw();
		}
		else 	// * SLOW
		if(['ECLIPSE'].includes(this.current)){
			this.FR = 80;
			this.tick();
		}
		else{	// * ANIMATION
			this.FR = 20;
			this.tick()
		}
	}

	redraw(){
		if(this.FR==0)
			this.draw();
	}

	tick() {
		setTimeout( ()=>{ this.draw() } ,this.FR);
	}

	draw()
	{
		// console.log(' DRAW ', this.current, this.FR );

		// * Different drawings
		if(this.current=='RADIAL'){	
			statics.radial(this.pixels, this.col);		// * Radial
		}
		else if(this.current=='RADIAL_INV'){	
			statics.radial_inv(this.pixels, this.col);		// * Radial inv
		}
		// else if(this.current=='FULL'){	
		// 	statics.full(this.pixels, this.col);		// * Full
		// }
		else if(this.current=='STRIPES'){	
			statics.stripes(this.pixels, this.col);		// * Stripes
		}
		else if(this.current=='HATCHED'){	
			statics.hatch(this.pixels, this.col);		// * Hatched
		}
		else if(this.current=='CRESCENT'){	
			statics.crescent(this.pixels, this.col);
		}
		else if(this.current=='ECLIPSE'){	
			statics.eclipse(this.pixels, this.col);
			statics.move_eclipse();
		}
		else if(this.current=='SQUARE'){	
			statics.square(this.pixels, this.col);
		}
		else if(this.current=='CROSS'){	
			statics.cross(this.pixels, this.col);
		}
		

		// * Send
		leds.send_pixels(this.pixels);

		if(this.FR!=0){
			this.tick();
		}
	}
	// Eo class
}



module.exports = Drawing;