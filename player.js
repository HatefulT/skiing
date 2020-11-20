var Player = function(x, y) {
  this.x = x | 0;
  this.y = y | 0;
  this.vx = 0;
  this.vy = 0;
  this.angle = Math.PI/2.;
  this.radius = 50;
  this.score = 0.;
  this.level = 100.;
  this.skillpoints = 0;
}
Player.prototype = {
  draw: function(context, width, height, size) {
    context.beginPath();
    context.fillStyle = "#df94c0";
    context.arc(width/2, height/2, this.radius*size, 0, 2*Math.PI);
    context.fill();

    context.beginPath();
    context.arc(width/2, height/2, this.radius*5*size, 0, 2*Math.PI);
    context.moveTo(width/2, height/2);
    context.lineTo(width/2+this.radius*5*size*Math.cos(this.angle), height/2+this.radius*5*size*Math.sin(this.angle));
    context.strokeStyle = 'black';
    context.stroke();

    context.beginPath();
    context.strokeStyle = '#aad741';
    context.lineWidth = 10;
    context.arc(width/2, height/2, this.radius*1.5*size, -Math.PI/2, 2*Math.PI*this.score/this.level-Math.PI/2);
    context.stroke();

    context.lineWidth = 1;
  },
  accelerate: function(dt, force) {
    this.vx += force*Math.cos(this.angle)*dt;
    this.vy += force*Math.sin(this.angle)*dt;
  },
  update: function(dt, mu) {
    let len = Math.sqrt(this.vx*this.vx+this.vy*this.vy);
    let a = Math.atan2(this.vy, this.vx);
    let d = (mu*dt)/*Math.abs(a-player.angle)/Math.PI*/;
    if(len <= d) {
      this.vx = 0;
      this.vy = 0;
    } else {
      this.vx -= Math.cos(a)*d;
      this.vy -= Math.sin(a)*d;
    }

    len = Math.sqrt(this.vx*this.vx+this.vy*this.vy);
    if(len >= maxSpeed) {
      this.vx *= maxSpeed/len;
      this.vy *= maxSpeed/len;
    }

    this.x += this.vx*dt;
    this.y += this.vy*dt;

    if(this.score >= this.level) {
      this.score -= this.level;
      this.level *= 1.1;
      this.skillpoints ++;
    }
  }
};
