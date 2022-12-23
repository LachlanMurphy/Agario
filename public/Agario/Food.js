class Food extends Particle {
  constructor(x,y,r) {
    super(x,y,r);
  }
  
  display() {
    strokeWeight(0);
    super.display();
  }
}