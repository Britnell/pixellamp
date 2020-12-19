/*
 *  Now to run socket server on here so that it doenst need th other pi... durrr
 *   click for different colour modes, they work so-so
 */


const express = require('express'); // running immediately
const app = require('express')(); // running immediately
const server = require('http').Server(app);
const io = require('socket.io')(server);


// * pixel array class & generator

// * drawing modules
const Drawing = require('./drawing.js');
var draw = new Drawing();
// draw.start();

// drawing.pixel = pixels;

// 		****		Variables

//    ****    Server & Socket

server.listen(8000, () =>  {
  console.log(`Server is runnign port :8000 `);
});
app.get('/', (req,res) => {
  res.sendFile(__dirname +'/lamp_rgb.html');
});
app.use(express.static('public'));

io.on('connection', (socket)=>{
    // socket refers to client side obj / event
  console.log(` New Socket connected w id \t ${socket.id} ` );
  
  socket.on('msg', (data)=>{
    console.log(' [ socket-msg ] :\t',data );
    io.emit('msg', data);
  });

  socket.on('disconnect',()=>{
    console.log(' # # Socket disconnected.');
  });

  socket.on('lamp',(data)=>
  {
    // console.log(' #socket>Lamp : ', data );
    if(data.hasOwnProperty('set-col'))
    {
      // Set colour
      let col = data['set-col'];
      if( col.length == 3){
        // clean
        draw.col = {
        	h: col[0],
        	s: col[1],
        	v: col[2]
        }
        draw.redraw();
        // Eo set col
      }
    }
    else if(data.hasOwnProperty('get-col'))
    {
      console.log(' GET COL');
      socket.emit('lamp',{'get-col': draw.col });		//[Hue,1,Bright] });
    }
    else if(data.hasOwnProperty('get-mode'))
    {
    	console.log(' GET mode ');
      socket.emit('lamp',{'get-mode': {n: draw.mode, mode: draw.current, max: draw.modes.length  }} );
    }
    else if(data.hasOwnProperty('set-mode'))
    {
        // * Set mode
        console.log(' set mode ');
        draw.setMode(data['set-mode']['n']);
        socket.emit('lamp',{'get-mode': {n: draw.mode, mode: draw.current, max: draw.modes.length  }} );
        draw.redraw();
      // }
    }
    // Eo socket
  });

  // ** Eo socket
});




