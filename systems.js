const rgb = require('./rgb.js');

class Systems
{
  constructor(){
    this.cellArray = [];
    //
  }

  // Rings

  new_rings(){
    this.rngR = rgb.random( 3, 4 );
    this.rngPh = 0;
    this.rngTh = rgb.random (0.2, 0.45);
  }

  rings(pixels,grad){
    for(let p=0; p<pixels.length; p++){
      let pix = pixels[p], b=0;
      let dist = Math.sqrt(pix.x*pix.x+pix.y*pix.y);
      let rem = Math.abs(rgb.remainder(dist+this.rngPh, this.rngR ) );
      if((rem)<this.rngTh)
        b = rgb.expon(rem,0,this.rngTh, 0,1 )
      // if(this.inverted)    b = 1 - b;
      let col = grad.get(pix.x,pix.y);
      pix.hsv = {   h: col.h,   s: col.s,   v: col.v *b     };
      pix.col = rgb.HSVtoRGB( pix.hsv );
    }
    grad.shift();
    this.rngPh += 0.005;
    if(this.rngPh >this.rngR) this.rngPh = 0;
  }


  // ***   Automaton

  init_automaton(pixels,grad){

    this.rule = [1,4,5];
    // this.new_rule();

    // * create array
    if(this.cellArray.length==0)
      this.init_array(pixels);
    
    // * seed
    this.seed_automaton();
    
    // calc next for draw fading
    this.calc_automaton();
    
    // * Draw
    this.draw_automaton(0,grad);
    
    // * vars
    this.dicolor = false;
    this.t = 0;
    this.gens = 0;
    this.ruleGens = rgb.random_i(8,16);
    this.h=0;
    this.hold = rgb.random_i(0,10);

    this.lastGen = 0;
    // Eo init
  }


  automaton(grad){
    const AR = 80;

    if( this.t == AR){
      // * hold Full
      if(this.h<this.hold){
        this.h++;
      }
      else
      {
          // * step
        this.step_automaton();

        // calc next
        this.calc_automaton();
        
        this.dicolor = !this.dicolor;
        this.t = 0;
        this.h = 0;      
        
        // check population
        this.check_automaton(); 
      }
    }
    else{
      // * Draw
      this.t++;
      this.draw_automaton(this.t/AR,grad);
    }
    
    grad.shift();
  }


  new_rule(){
    let newRule = [];
    while(newRule.length<3){
      let x = rgb.random_i(0,7);
      if(!newRule.includes(x))
        newRule.push(x);
    }
    this.rule = newRule;
  }


  init_array(pixels){
    // * create empty
    pixels.forEach((pix)=>{
      this.cellArray.push({
        n: pix.n,  
        pix: pix,
        nbrs: [],
        state: false, next: false,
        fade: 0
      });
    })
    // * list neighbours
    this.cellArray.forEach((cell)=>{
      // cell.pix.rw , .cl
      pixels.forEach((pix)=>{
        if(cell.pix.n!=pix.n){
          let x = cell.pix.x - pix.x;
          let y = cell.pix.y - pix.y;
          let r = Math.sqrt(x*x+y*y);
          if(r<=1.2)
            cell.nbrs.push(pix.n);
        }
      })
    })
  }


  seed_automaton(){
    this.cellArray.forEach((cell)=>{
      if(cell.pix.x==0 && cell.pix.y==0)
        cell.state = true;
    })
    //
  }

  calc_automaton(){
    // * calc
    this.total = 0;
    this.cellArray.forEach((cell)=>{
      let cnt = 0;
      cell.nbrs.forEach((n)=>{
        if(this.cellArray[n].state)
          cnt++;
      });
      if(this.rule.includes(cnt)){
        cell.next = true;
        this.total++;
      }
      else
        cell.next = false;
    });      
  }

  step_automaton(){
    this.cellArray.forEach((cell)=>{
      cell.state = cell.next;
    })
  }

  draw_automaton(fade, grad){
    // 
    // console.log(' draw\t', fade );

    let exf = rgb.expon3(fade, 0,1, 0,1 );

    this.cellArray.forEach((cell)=>{
      let colA, colB;
      if(this.dicolor){ 
        colA = grad.colA;        colB = grad.colB;
      }
      else {
        colA = grad.colB;        colB = grad.colA;
      }

      if(!cell.state && !cell.next) // just off
        cell.pix.col = [ 0,0,0 ];
      else if(cell.state && !cell.next){ // fade off
        cell.pix.col =  rgb.HSVtoRGB( {   h: colA.h,   s: colA.s,   v: (1-exf)*colA.v   } ); 
      }
      else if(!cell.state && cell.next){  // fade on
        cell.pix.col =  rgb.HSVtoRGB( {   h: colB.h,   s: colB.s,   v: exf*colB.v   } );  
      }
      else {  // fade A>B
        let h = rgb.scale(fade,0,1,colA.h,colB.h)
        cell.pix.col =  rgb.HSVtoRGB( {   h: h,   s: colB.s,   v: colB.v   } );   
      }
      
    })
  }


  check_automaton(){
    // * check for dying population
    if(this.total<35 && !this.rule.includes(1) ){
      // console.log(' DIED , ', this.total, this.rule)
      this.restart_automation();
    }
    else {
      // * check generation expiration
      this.gens++;
      if(this.gens==this.ruleGens)
        this.restart_automation();
    }
    // Eo ()
  }


  restart_automation(){
    this.new_rule();
    this.gens = 0;
    this.ruleGens = rgb.random_i(10,30);
    this.hold = rgb.random_i(0,20);
    // recalc
    this.calc_automaton();
    // console.log(' N:\t', this.rule,' h: ', this.hold, '  g: ', this.ruleGens)
  }


  //        *******************************       Tree      *******************

  init_tree(pixels,grad){
    this.treeSize = rgb.random_i(80,145);
    this.period = rgb.random_i(30,60);
    this.p_turn = rgb.random(0.1,0.2);

    this.PI6 = Math.PI /3;
    this.pixels = pixels;
    this.tree = [];
    this.symmetries = [ 'XY', 'ROT2', 'ROT3' ];
    this.symm = 'ROT3';  //this.symmetries[ rgb.random_i(0,this.symmetries.length) ];

    this.init_heads();

    this.t = 0;
    // this.head_to_tree(grad);

    this.step_tree();

    // Draw
    


    //
  }

  init_heads(){
    this.heads = [];

    let h = {
      pos: { x:0, y:0 }, n: 150,
      dir: this.PI6 *rgb.random_i(-3,3)
    };
    this.heads.push(h);

    if(this.symm =='XY'){
      let x = { pos: { x:0, y:0 }, n: 150, dir: h.dir };
      if(h.dir>0)   x.dir = Math.PI - h.dir; 
      else          x.dir = 0-Math.PI - h.dir;
      this.heads.push(x); 
      let y = { pos: { x:0, y:0 }, n: 150, dir: -h.dir };
      this.heads.push(y); 
      let xy = { pos: { x:0, y:0 }, n: 150, dir: h.dir-Math.PI };
      this.heads.push(xy); 
    }
    else if(this.symm=='ROT2'){
      let two = { pos: { x:0, y:0 }, n: 150, dir: (h.dir+Math.PI) };
      this.heads.push(two);
    }
    else if(this.symm=='ROT3'){
      let two = { pos: { x:0, y:0 }, n: 150, dir: (h.dir+this.PI6*2) };
      this.heads.push(two);
      let three = { pos: { x:0, y:0 }, n: 150, dir: (h.dir+this.PI6*4) };
      this.heads.push(three);
    }


  }



  draw_tree(gradient){ 
    //

    if(this.t==this.period){
      // * Complete period > step

      this.step_tree();

      // console.log(' T: ', this.tree.length )
      if(this.tree.length>this.treeSize){
        this.tree = this.tree.slice(this.heads.length);
      }
      this.t = 0;
    }
    else {
      // * during period fade
      let fd = rgb.expon(this.t/this.period,0,1,0,1);

      this.show_tree(gradient);
      this.show_head(fd, gradient);
      this.show_tail(fd,gradient);
      this.t++;
    }

    // randomize tree variable
    this.change_tree();

    // * active gradient
    if(this.t%2 ==0)
      gradient.shift();
  }

  change_tree(){
    // skew values
    // this.treeSize , this.period , this.p_turn
  }


  turn_head(){
    let turn = null;
    let r = rgb.r();
    if(r<this.p_turn)       turn = this.PI6
    else if(r<2*this.p_turn)  turn = -this.PI6;

    if(turn)
    if(this.symm=='XY'){
      this.heads[0].dir += turn;
      this.heads[1].dir -= turn;  // X inv
      this.heads[2].dir -= turn;  // Y inv
      this.heads[3].dir += turn;  // XY non-inv
    }
    else if(this.symm.indexOf('ROT')!=-1){ // Rot all turn synchronoush
      this.heads.forEach((head)=>{
        head.dir += turn;
      })
    }
  }


  step_tree(){
    
    // * add head to tree
    this.heads.forEach((head)=>{
      // if(!this.tree.includes(head.n))
      this.tree.push(head.n);
    });

    let pos, px;
    do {
      // * random turns
      this.turn_head();

      // * Step head
      this.step_head();

      pos = this.heads[0].pos;
      px = rgb.getXY(this.pixels,pos.x,pos.y);

    }
    while(this.tree.includes(px.n))
    // * skip fast forward through path
    // this.skip_path();
  } 

  skip_path(){
    let pos = this.heads[0].pos;
    let px = rgb.getXY(this.pixels,pos.x,pos.y);
    if(this.tree.includes(px.n))
      console.log(px.n, ' in tree ');
    //
  }
  
  // moves head in current dir
  step_head(){
    this.heads.forEach( (head)=>{
      let v, pos, pix;

      // calc new pos
      v = rgb.stepVec(head.dir);
      pos = {   x:  head.pos.x +v.x,    y: head.pos.y +v.y   };
      pix = rgb.getXY(this.pixels, pos.x, pos.y );

      if(pix){
        // if pix exists
        head.pos = { x: pix.x, y: pix.y };
        head.n = pix.n;
      }
      else {
        // off the map >> rotate 180 
        let mag = Math.sqrt( pos.x*pos.x + pos.y*pos.y );
        let ang = Math.atan2( pos.y, pos.x ) + Math.PI;
        let newHead = {
          x: mag * Math.cos(ang),
          y: mag * Math.sin(ang)
        }
        // try again, add step vec 
        pos = {
          x: newHead.x + v.x,
          y: newHead.y + v.y
        }
        pix = rgb.getXY(this.pixels, pos.x, pos.y );
        head.n = pix.n;
        head.pos = { x: pix.x, y: pix.y };

        // turn around?
      }
    })
  }

  // fd is perc fade for head pixels
  show_head(fd,grad){
    this.heads.forEach((head)=>{
      let col = grad.get(head.pos.x,head.pos.y);
      this.pixels[head.n].col = rgb.HSVtoRGB( {   h: col.h,   s: col.s,   v: col.v*fd    } );
    })
  }

  show_tree(grad){
    // clear first
    this.pixels.forEach((pix)=>{ pix.col = [0,0,0] });
    // draw pixels
    this.tree.forEach((n)=>{
      let pix = this.pixels[n];
      let col = grad.get(pix.x,pix.y);
      this.pixels[n].col = rgb.HSVtoRGB( {   h: col.h,   s: col.s,   v: col.v*1    } );
    });
  }

  show_tail(fade,grad){
    if(this.tree.length>this.treeSize-4){
      for(let x=0; x<4; x++){
        let pix = this.pixels[this.tree[x]];
        let col = grad.get(pix.x,pix.y);
        pix.col = rgb.HSVtoRGB( {   h: col.h,   s: col.s,   v: col.v*(1-fade)    } ); 
      }
    }
  }

  init_snow(pixels, gradient){


    // flakes
    this.snow_N = rgb.random_i(10,20);
    this.snowSpeed = rgb.random(0.01,0.08);
    this.rad2 = rgb.random(0.8, 1.8); 
    
    // * calc forces
    this.forceRad  = 9; //rgb.random(3,6);
    this.sideRepel = 10;
    this.forceProp = 0.05;

    this.pixels = pixels;
    this.gradient = gradient;

    this.snow = [];
    for(let x=0; x<this.snow_N; x++){
      this.snow.push(new Snow())
    }
    // Eo init
  }

  
  vary_snow(){
    

    // * number
    if(rgb.r()<0.02){
      this.snow_N += rgb.random(-1,1);
      this.snow_N = rgb.limit( this.snow_N, 10, 26 );
      // console.log('\tN: ',this.snow_N);
    }

    // * Speed
    if(rgb.r()<0.05){
      this.snowSpeed += rgb.random(-0.001,0.001);
      this.snowSpeed = rgb.limit( this.snowSpeed, 0.01, 0.06 );
      // console.log('\t\t\tS: ',this.snowSpeed);
    }

    // * radius
    if(rgb.r()<0.02){
      this.rad2 += rgb.random(-0.2,0.2);
      this.rad2 = rgb.limit( this.rad2, 0.8, 2 );
      // console.log('\t\t\t\t\t R:',this.rad2);
    }


    // * add snowflakes
    if( Math.floor(this.snow_N) > this.snow.length){
      let sn = new Snow();
      sn.y = -sn.wrap;
      this.snow.push(sn);
    }

    //
  }


  snows(){

    // Calc snowflake force
    this.snow_spread();

    // * step flakes
    // console.log(' STEP ')
    this.snow.forEach((flake,i)=>{
      // * Step each snowflake 
      if(flake.step(this.snowSpeed))  // ( and remove while wrapping )
        if( Math.floor(this.snow_N) < this.snow.length){
          this.snow.splice(i,1);
        }
      // console.log( flake.x, flake.y )
    })

    // * draw
    this.draw_snow();
    
    this.vary_snow();
    

    // * Eo snow    
  }


  draw_snow(){
    this.pixels.forEach((pix)=>{
      // find closest snowflake
      let dist = 1, bright = 0;
      for(let s=0; s<this.snow.length; s++){
        let d = this.snow[s].dist(pix.x,pix.y);
        // get brightness within radius
        if(d<this.rad2){
          let b = rgb.expon3( this.rad2-(d*d), 0,this.rad2, 0,1 );
          // get highest brightness
          if(b>bright)            bright = b;
        }
      }
      // brightness to color
      let col = {   h: this.gradient.colA.h,   s: this.gradient.colA.s,   v: this.gradient.colA.v *bright    };
      pix.col = rgb.HSVtoRGB( col );
    })
  }


  snow_spread(){
    
    // for each flake

    for(let s=0; s<this.snow.length; s++){
      // * add forces
      let flake = this.snow[s];
      flake.force = { x: 0, y: 0 }; 

      // * other flakes
      for(let o=0; o<this.snow.length; o++){
        if(s!=o){
          let other = this.snow[o];
          let v = { x: flake.x - other.x , y: flake.y - other.y };
          let mag = Math.sqrt(v.x*v.x + v.y*v.y );
          // add forces 
          if(mag < this.forceRad ){
            flake.force.x += v.x * this.forceProp / (mag*mag);
            flake.force.y += v.y * this.forceProp / (mag*mag);
          }
        }
      }

      // * repel sides
      let v, mag;

      // add left
      v = { x: flake.x +this.sideRepel , y: 0 };
      mag = Math.sqrt(v.x*v.x + v.y*v.y );
      if(mag < this.forceRad ){
        flake.force.x += v.x * this.forceProp / (mag*mag);
        flake.force.y += v.y * this.forceProp / (mag*mag);
      }
      // add right 
      v = { x: flake.x -this.sideRepel , y: 0 };
      mag = Math.sqrt(v.x*v.x + v.y*v.y );
      if(mag < this.forceRad ){
        flake.force.x += v.x * this.forceProp / (mag*mag);
        flake.force.y += v.y * this.forceProp / (mag*mag);
      }
      
      //Eo for each snowflake
    }
  }
  //  ****    Eo class
}

class Snow 
{

  constructor(){
    // const
    this.wrap = 12;

    // * variables
    this.y = rgb.random(-8,8);
    this.x = rgb.random(-8,8);

    this.force = {x: 0, y:0 };
  }

  step(speed){
    // * move down
    this.y += speed;      //rgb.expon(speed, 0.01,0.08, 0.01,0.08 ); 

    // * add force
    this.x += this.force.x;
    this.y += this.force.y;
    this.force = {x:0, y:0 };

    // * wrap
    if(this.y > this.wrap ){
      this.y = -this.wrap;
      this.x += rgb.random(-1,1);
      return true;
    }
    else
      return false;


    // draw
  }

  dist(x,y){
    // let dist = Math.abs(this.x-x) + Math.abs(this.y-y);
    // return dist;
    let v = { x: this.x -x, y: this.y-y };
    return Math.sqrt( v.x*v.x + v.y*v.y );
  }


  //      *****   Eo class
}



module.exports = new Systems();
