class Arena {
  constructor(w,h) {
    this.w = w;
    this.h = h;
  }
  
  display() {
    stroke(0);
    strokeWeight(4);
    for (let i = 0; i < this.w/100; i++) {
      line(i*100,0,i*100,this.h);
    }
    
    for (let i = 0; i < this.h/100; i++) {
      line(0,i*100,this.w,i*100);
    }
    line(0,this.h,this.w,this.h);
    line(this.w,0,this.w,this.h);
  }
}