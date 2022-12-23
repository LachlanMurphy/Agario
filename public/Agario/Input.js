class Input {
  constructor(x,y,w,h) {
    this.pos = createVector(x,y);
    this.content = "";
    this.w = w;
    this.h = h;
    this.selected = false;
  }
  
  display() {
    fill(0);
    textSize(70);
    if (this.selected)
      stroke(0,255,0);
    else
      noStroke();
    strokeWeight(4);
    rect(this.pos.x-this.w/2,this.pos.y-this.h/2,this.w,this.h);
    fill(255);
    noStroke();
    text(this.content,this.pos.x,this.pos.y);
  }

  addContent(k,code) {
    if (this.selected) {
      if (code === BACKSPACE && this.content.length > 0)
        this.content = this.content.substring(0, this.content.length - 1);
      else if (code != 16 && k.length === 1)
        this.content += k;
    }
  }
  
  contains(x,y) {
    if (x < this.pos.x+this.w/2 &&
        x > this.pos.x-this.w/2 &&
        y < this.pos.y+this.h/2 &&
        y > this.pos.y-this.h/2) {
      return true;
    }
    
    return false;
  }
}