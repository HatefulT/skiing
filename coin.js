var Coin = function(x, y) {
  this.x = x;
  this.y = y;
  this.radius = 50;
};
Coin.prototype = {
  draw: function(context, rx, ry, size) {
    context.fillStyle = '#c4b32d';
    context.beginPath();
    context.arc((this.x-rx)*size, (this.y-ry)*size, this.radius*size, 0, Math.PI*2);
    context.fill();
  },
  collide: function(o) {
    return (distSq(this.x, this.y, o.x, o.y) <= Math.pow(this.radius + o.radius, 2));
  },
};
