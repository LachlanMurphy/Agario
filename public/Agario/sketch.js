let arena;
let player; // Keeps track of the client side player

let zoom;

let screenId;

let game;

let playerName;
let playButton;

let eatCooldown = [];

// Server
let socket;

let food = new Map();
let otherPlayers = new Map();

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  
  textAlign(CENTER,CENTER);
  
  arena = new Arena(4000,4000);
  
  // Menu inputs
  playerName = new Input(width/2,height/2-100,400,100);
  playButton = new Input(width/2,height/2+100,400,100);
  playButton.content = "Play!";
  
  zoom = 1;
  screenId = 1;
  game = true;

  // Server
  socket = io.connect(window.location.href);

  // Updates the other players in the arena
  socket.on('update', data => {
    otherPlayers = new Map(JSON.parse(data));
  });

  // Updates local client if they've been eaten
  socket.on('eaten', ball => {
    game = false;
  });

  // Updates the static food in the arena
  socket.on('updateFood', data => {
    food = new Map(JSON.parse(data));
  });
}

function draw() {
  if (screenId == 1) {
    drawMenu();
  } if (screenId == 2) {
    drawGame();
  }
}

function drawMenu() {
  background(255);
  arena.display();
  
  playerName.display();
  playButton.display();
}

function drawGame() {
  background(255);
  
  // Player score
  fill(0);
  textSize(90);
  text(floor(player.r),width/2,50);
  
  // The offset is the player's position reversed
  let offSet = player.pos.copy().mult(-1);
  
  // Move to center
  translate(width/2,height/2);
  // Make smooth transitions for camera when eating food
  if (player.r > 100) {
    let newZoom = 100 / player.r;
    zoom = lerp(zoom,newZoom, 0.1);
  }
  // Very screen based on size
  scale(zoom);
  translate(offSet.x,offSet.y); // Set everything relative to top left of the arena
  
  arena.display();

  // Server

  //Update food
  for (let v of food) {
    let f = v[1];

    noStroke();
    fill(f.col[0],f.col[1],f.col[2]);
    ellipse(f.x,f.y,10,10);

    if (dist(f.x,f.y,player.pos.x,player.pos.y) < player.r && !eatCooldown.includes(v[0])) {
      socket.emit('eatFood', v);
      eatCooldown.push(v[0]);
      player.newR++;
      setTimeout(() => {
        eatCooldown.splice(eatCooldown.indexOf(v[0]),1);
      }, 2000);
    }
  }

  // Update other players
  for (let v of otherPlayers) {
    let p = v[1];

    if (v[0] != socket.id) {
      // Display other players
      fill(p.col.levels[0],p.col.levels[1],p.col.levels[2],p.col.levels[3]);
      stroke(255);
      circle(p.x,p.y,p.r*2);
      fill(255);
      stroke(0);
      strokeWeight(4);
      textSize(p.r/4);
      text(p.name,p.x,p.y);

      // Collision detection
      if (dist(p.x,p.y,player.pos.x,player.pos.y) < player.r &&
          p.r < player.r*0.9 &&
          !eatCooldown.includes(p.id)) {
        socket.emit('eat', v);
        player.newR += p.r * 0.1;
        eatCooldown.push(p.id);
        setTimeout(() => {
          eatCooldown.splice(eatCooldown.indexOf(p.id),1);
        }, 2000);
      }
    }
  }

  // Player commands
  if (game) {
    player.display();
    player.edges(arena);
    player.friction();

    socket.emit('update', player);

    let mouse = createVector(mouseX,mouseY);
    let dir = p5.Vector.sub(mouse,createVector(width/2,height/2));
    player.vel.add(dir.setMag(0.5)); // Player max speed
  } else {
    // What happens locally if the game ends
    fill(255,0,0);
    textSize(50);
    text("You died", player.pos.x,player.pos.y-100);
    text("Press space to restart!", player.pos.x,player.pos.y+100);
  }
}

function mousePressed() {
  if (screenId == 1) {
    if (playerName.contains(mouseX,mouseY)) {
      playerName.selected = true;
    } else {
      playerName.selected = false;
    }
    
    if (playButton.contains(mouseX,mouseY)) {
      player = new Player(random(0,arena.w),random(arena.h),random(50,75), playerName.content);
      screenId = 2;
      game = true;

      // Send new player info to the server
      socket.emit('start', player);
    }
  }
}

function keyPressed() {
  // Add to gameMenu inputs
  if (screenId === 1 && playerName.selected) {
    playerName.addContent(key,keyCode);
  }

  // Restart game
  if (keyCode === 32 && !game) {
    screenId = 1;
  }
}