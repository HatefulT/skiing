var player,
    obstacles,
    coins,
    upgrades,
    friction = 0.001,
    force = 0.002,
    maxSpeed = 10;

var lastTime;

var C, CTX, W, H, MOUSE = { x: 0, y: 0, pressed: false }, SIZE = .1;

var lerp = (a, b, c) => a * (b-c) + c;

var menu,
    upgradeMenu;

var path;

window.onload = function() {
  menu = document.getElementById('menu');
  upgradeMenu = document.getElementById('upgrade');

  C = document.createElement('canvas');
  C.width = W = 1000;
  C.height = H = 600;
  document.body.appendChild(C);
  CTX = C.getContext('2d');

  C.addEventListener('mousemove', mouseMove);
  C.addEventListener('mousedown', mouseDown);
  //C.addEventListener('mouseup', mouseUp);
}

var initGame = function() {
  player = new Player(W*.5, 0);
  obstacles = [];
  for(var i=0; i<100; i++) {
    obstacles.push(new Obstacle(lerp(Math.random(), -10*W, 10*W), lerp(Math.random(), -10*H, 10*H)));
  };

  for(var a=0; a<Math.PI*2; a+=Math.PI/60.) {
    obstacles.push(new Obstacle(Math.cos(a)*W*17, Math.sin(a)*H*17));
    obstacles[obstacles.length-1].radius = 500;
  }

  coins = [];
  for(var i=0; i<10; i++) {
    coins.push(new Coin(lerp(Math.random(), -10*W, 10*W), lerp(Math.random(), -10*H, 10*H)));
  };
  upgrades = { coinluck: 0, autocoin: 0 };

  MOUSE = { x: 0, y: 0, pressed: false };

  path = [];

  updateUpgradeLvls();
}

var ANIMATION;
var startGame = function() {
  initGame();

  lastTime = Date.now();
  ANIMATION = requestAnimationFrame(loop);

  menu.style.display = 'none';
  upgradeMenu.style.display = 'none';
  C.style.display = 'block';
}
var stopGame = function() {
  cancelAnimationFrame(ANIMATION);
}
var death = function() {
	player.skillpoints = 0;
  stopGame();
  menu.style.display = 'block';
  C.style.display = 'none';
  upgradeMenu.style.display = 'none';
}

var loop = function() {
  let currentTime = Date.now();
  let delta = currentTime - lastTime;
  lastTime = currentTime;

  if(delta > 1000) {
    requestAnimationFrame(loop);
    return;
  }

  if(player.skillpoints == 0) {
    if(MOUSE.x < 50 && MOUSE.y < 50)
      upgradeMenu.style.display = 'block';
    else
      upgradeMenu.style.display = 'none';
  }

  if(player.skillpoints > 0 && upgradeMenu.style.display == 'none') {
    upgradeMenu.style.display = 'block';
    updateUpgradeLvls();
  }

  var px = W/2,
      py = H/2;
  if(!new_render) {
    player.angle = Math.atan2(MOUSE.y - py, MOUSE.x - px);
  } else {
    player.angle += fov*(MOUSE.x - W/2)/W*0.04;
  }
  if(MOUSE.pressed) {
    player.accelerate(delta, force);
  }
  player.update(delta, friction);

  player.score += upgrades.autocoin*(1+upgrades.coinluck)*0.01;

  for(var obst of obstacles) {
    if(obst.collide(player)) {
      death();
    }
  }

  for(var i in coins) {
    if(coins[i].collide(player)) {
      player.score += Math.random()*(20+upgrades.coinluck*5)+10;
      coins[i] = new Coin(lerp(Math.random(), -10*W, 10*W), lerp(Math.random(), -10*H, 10*H))
    }
  }

  if(!new_render) {
    render();
  } else {
    render1();
  }

  requestAnimationFrame(loop);
}

var render = function() {
  CTX.fillStyle = '#fce1e7';
  CTX.fillRect(0, 0, W, H);

  player.draw(CTX, W, H, SIZE);

  for(var obst of obstacles) {
    obst.draw(CTX, player.x-W/2/SIZE, player.y-H/2/SIZE, SIZE);
  }
  for(var coin of coins) {
    coin.draw(CTX, player.x-W/2/SIZE, player.y-H/2/SIZE, SIZE);
  }
}

var fov = Math.PI/2.5,
    maxD = 10000,
    stopD = 0.1;

var render1 = function() {
  CTX.fillStyle = "#fce1e7";
  CTX.fillRect(0, 0, W, H);

  var dx = W / 100.;
  for(var i=0.; i<W; i+=dx) {
    var x = player.x,
        y = player.y,
        angle = player.angle+fov*((2.*i-W)/(2.*W)),
        d = 0;
    var color = -1;
    for(var j=0; j<1000; j++) {
      var minD = 100000.;
      for(var obst of obstacles) {
        var d1 = (Math.sqrt(Math.pow(obst.x-x, 2)+Math.pow(obst.y-y, 2))-obst.radius);
        if(minD > d1) {
          minD = d1;
          color = { r: 6*16, g: 4*16+11, b: 3*16+2 };
        }
      }
      for(var coin of coins) {
        var d1 = (Math.sqrt(Math.pow(coin.x-x, 2)+Math.pow(coin.y-y, 2))-coin.radius);
        if(minD > d1) {
          minD = d1;
          color = { r: 12*16+4, g: 11*16+3, b: 2*16+13 };
        }
      }

      if(minD <= stopD) {
        break;
      }
      if(d > maxD) {
        color = -1;
        break;
      }
      d += minD;
      x += Math.cos(angle)*minD;
      y += Math.sin(angle)*minD;
    }
    // rendering
    if(color != -1) {
      CTX.fillStyle = "rgba("+color.r+","+color.g+","+color.b+","+(1.-d/maxD)+")";
      var h = 25000./d*Math.cos(angle-player.angle);
      CTX.fillRect(i, H/2-h, dx, 2*h);
    }
  }
}

var new_render = false;
var toggleNewRender = function() {
  new_render = !new_render;
}

var updateUpgradeLvls = function() {
  for(var u in upgrades) {
    var el = document.getElementById(u+'lvl');
    el.innerHTML = upgrades[u];
  }
}
var upgrade = function(key) {
  if(player.skillpoints > 0) {
    upgrades[key] ++;
    player.skillpoints --;
    updateUpgradeLvls();
  }
  if(player.skillpoints == 0) {
    upgradeMenu.style.display = 'none';
  }
}

var mouseMove = function(evt) {
  let rect = C.getBoundingClientRect();
  MOUSE.x = evt.clientX - rect.left;
  MOUSE.y = evt.clientY - rect.top;
  if(!player) return;
};
var mouseDown = function(evt) { MOUSE.pressed = !MOUSE.pressed /*true*/; };
var mouseUp = function(evt) { MOUSE.pressed = false; };
