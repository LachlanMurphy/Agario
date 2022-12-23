class Enemy extends Particle {
  constructor(x,y,r) {
    super(x,y,r);
    // Random initial velocity
    this.vel = p5.Vector.random2D().setMag(random(10,0));
  }
  
  attract() {
    let closest = Number.POSITIVE_INFINITY;
    let attractor = createVector(Number.POSITIVE_INFINITY,Number.POSITIVE_INFINITY);
    
    for (let f of food) {
      let dis = dist(f.pos.x,f.pos.y,this.pos.x,this.pos.y);
      if (dis < closest) {
        closest = dis;
        attractor = f.pos.copy();
      }
    }
    
    for (let e of enemies) {
      if (p5.Vector.sub(e.pos,this.pos).mag() < e.r+this.r+1000 && e.r/this.r < 0.9) {
        attractor = e.pos.copy();
      }
    }
    
    if (p5.Vector.sub(player.pos,this.pos).mag() < player.r+this.r+1000 && player.r/this.r < 0.9) {
      attractor = player.pos.copy();
    }

    let desiredVel = p5.Vector.sub(attractor,this.pos);
    desiredVel.limit(1);
    this.vel.add(desiredVel);
  }
  
  evade() {
    let evader = new Enemy(Number.POSITIVE_INFINITY,Number.POSITIVE_INFINITY,1);
    
    for (let e of enemies) {
      if (p5.Vector.sub(e.pos,this.pos).mag() < e.r+this.r+1000 && e.r/this.r > 1.1) {
        evader = e;
      }
    }
    
    if (p5.Vector.sub(player.pos,this.pos).mag() < player.r+this.r+1000 && p5.Vector.sub(evader.pos,this.pos).mag() > p5.Vector.sub(player.pos,this.pos).mag() && player.r/this.r > 1.1) {
      evader = player;
    }

    if (evader.pos.mag() !== Number.POSITIVE_INFINITY) {
      let desiredVel = p5.Vector.sub(evader.pos,this.pos).mult(-1);
      desiredVel.limit(1);
      this.vel.add(desiredVel);
    }
  }
  
  display() {
    this.attract();
    this.evade();
    
    super.display();
  }
}