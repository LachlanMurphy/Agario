class Player extends Particle {
  constructor(x,y,r,name) {
    super(x,y,r);
    this.id = name;
  }
  
  eat(enemies) {
    for (let i = enemies.length-1; i >= 0; i--) {
      if (p5.Vector.sub(enemies[i].pos,this.pos).mag() < this.r && enemies[i].r/this.r < 0.9) {
          this.r += enemies[i].r * 0.1;
          enemies.splice(i,1);
          enemies.push(new Enemy(random(40,arena.w-40),random(40,arena.h-40), random(20,75)));
      }
    }
  }
}