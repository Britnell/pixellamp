
const statics = require('./static.js');	// Object for static drawings
const systems = require('./systems.js');

// * serial usb port module
const Usb = require('./usb.js');
const Pixel = require('./pixel.js');
const rgb = require('./rgb.js');

var leds;

const staticFR = 80;
const staticList = [ 'Radial', 'Axial','Crescent', 'Eclipse', 
				   'Stripes', 'Hatched','Dots', 
				   'Trigs',  'Triangle',	
				   // 'Nest','Star', 
				   'Square', 'Cross', 'Half', 'Full', 'Xmas' ];	// 

const animFR = 20;
const animList = [ 'Firework', 'Hexaton', 'Growth', 'Snow' ];


class Drawing{

	constructor(){
		this.FR = 0;	// LIES this FrameRate is actually the period

		this.modes = [];
		this.modes = this.modes.concat(staticList);
		this.modes = this.modes.concat(animList );

 		this.mode = 0;//this.modes.length-1;
		// create pixels array 
		this.pixels = Pixel();
		// create usb connection
		leds = new Usb(()=>{
			console.log(' SERIAL CONN ');
			this.timer = null;
			this.setMode(this.mode);
			this.tick();
		});
		// create color gradient 
		this.gradient = new rgb.Gradient();
		this.gradient.xscale = 0.3;
		this.gradient.yscale = 0.9;
		this.gradient.hueDiff = 0.1;
		this.setColour({ h:0, s:1, v: 0.5 });

		// 
	}

	getInvert(){
		return statics.inverted;
	}

	Invert(){
		return statics.invert();
		// console.log(' INVERT : ', statics.inverted )
	}

	setColour(hsv){
		this.col = hsv;	// monotone 
		this.gradient.setColour(hsv);	// gradient
	}

	setMode(n){
		this.mode = n;
		this.current = this.modes[n];
		
		// * Statics , slower
		if(staticList.includes(this.current)){
			this.FR = staticFR;
		}
		else if(animList.includes(this.current)){
			this.FR = animFR;
		}

		if(this.current=='Firework')
			systems.new_rings();
		else if(this.current=='Hexaton')
			systems.init_automaton(this.pixels,this.gradient);
		else if(this.current=='Growth')
			systems.init_tree(this.pixels,this.gradient);
		else if(this.current=='Snow')
			systems.init_snow(this.pixels,this.gradient);
		
	}

	redraw(){
		if(this.FR==0)
			this.draw();
	}

	tick() {
		if(this.FR!=0)
			this.tier = setTimeout( ()=>{ this.draw() } ,this.FR);
	}

	draw()
	{
		// console.log(' DRAW ');
		// * Different drawings
		if(this.current=='Radial'){	
			statics.radial(this.pixels, this.gradient);		// * Radial
		}
		else if(this.current=='Full'){	
			statics.full(this.pixels, this.gradient);		// * Full
		}
		else if(this.current=='Stripes'){	
			statics.stripes(this.pixels, this.gradient);		// * Stripes
		}
		else if(this.current=='Hatched'){	
			statics.hatch(this.pixels, this.gradient);		// * Hatched
		}
		else if(this.current=='Crescent'){	
			statics.crescent(this.pixels, this.gradient);
		}
		else if(this.current=='Eclipse'){	
			statics.eclipse(this.pixels, this.gradient);
			statics.move_eclipse();
		}
		else if(this.current=='Square'){	
			statics.square(this.pixels, this.gradient);
		}
		else if(this.current=='Triangle'){	
			statics.triangle(this.pixels, this.gradient);
		}
		else if(this.current=='Cross'){	
			statics.cross(this.pixels, this.gradient);
		}
		else if(this.current=='Axial'){	
			statics.quarter(this.pixels, this.gradient);
		}
		else if(this.current=='Dots'){
			statics.dots(this.pixels, this.gradient);
		}
		else if(this.current=='Trigs'){
			statics.trigs(this.pixels, this.gradient);
		}
		else if(this.current=='Half'){
			statics.half(this.pixels, this.gradient);
		}
		else if(this.current=='Star'){
			statics.star(this.pixels, this.gradient);
		}
		else if(this.current=='Nest'){
			statics.nest(this.pixels, this.gradient);
		}
		else if(this.current=='Xmas'){
			statics.xmas(this.pixels, this.gradient);
		}
		// * SYSTEMS
		else if(this.current=='Firework'){
			systems.rings(this.pixels, this.gradient);
		}
		else if(this.current=='Hexaton'){
			systems.automaton(this.gradient);
		}
		else if(this.current=='Growth'){
			systems.draw_tree(this.gradient);
		}
		else if(this.current=='Snow'){
			systems.snows();
		}

		// * Send
		leds.send_pixels(this.pixels);

		this.tick();
		
	}
	// Eo class
}



module.exports = Drawing;