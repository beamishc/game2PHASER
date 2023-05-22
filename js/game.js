// create a new scene
let gameScene = new Phaser.Scene('Game');

// initiate game parameters
gameScene.init = function() {

  this.isTerminating = false;

  // speeds
  this.playerSpeed = 3;
  this.enemyMinSpeed = 1;
  this.enemyMaxSpeed = 4;

  // boundaries
  this.enemyMinY = 80;
  this.enemyMaxY = 280;
}

// load assets
gameScene.preload = function(){
  // load images
  this.load.image('background', 'assets/background.png');
  this.load.image('player', 'assets/player.png');
  this.load.image('dragon', 'assets/dragon.png');
  this.load.image('treasure', 'assets/treasure.png');
};

// called once after the preload ends
gameScene.create = function(){
  this.gameW = this.sys.game.config.width;
  this.gameH = this.sys.game.config.height;

  // creates background sprite
  this.bg = this.add.sprite(0, 0, 'background').setPosition(this.gameW/2, this.gameH/2);

  // create the player
  this.player = this.add.sprite(40, this.gameH/2, 'player').setScale(0.5);

  // create enemy group
  this.enemies = this.add.group({
    key: 'dragon',
    repeat: 5,
    setXY: {
      x: 90,
      y: 100,
      stepX: 80,
      stepY: 20
    }
  });

  // set scale for all enemies in group
  Phaser.Actions.ScaleXY(this.enemies.getChildren(), -0.4)

  // set flip and speed for all enemies in group
  Phaser.Actions.Call(this.enemies.getChildren(), function(enemy){
    // set flipX
    enemy.flipX = true;
    // set speed
    let dir = Math.random() < 0.5 ? 1 : -1;
    let speed = this.enemyMinSpeed + Math.random() * (this.enemyMaxSpeed - this.enemyMinSpeed);
    enemy.speed = dir * speed;
    }, this);

  // set goal
  this.treasure = this.add.sprite(this.gameW - 80, this.gameH/2, 'treasure').setScale(0.6);
};

// this is called up to 60 times per second
gameScene.update = function(){

  if (this.isTerminating) return;

  // define player bounds
  let playerRect = this.player.getBounds();

  // check for active input
  if (this.input.activePointer.isDown){
    // player walks
    this.player.x += this.playerSpeed;
  };

  let enemies = this.enemies.getChildren();
  let numEnemies = enemies.length;

  for (let i = 0; i < numEnemies; i++){
    //enemy movement
    enemies[i].y += enemies[i].speed;

    // check we haven't passed min or max y
    let conditionUp = enemies[i].speed < 0 && enemies[i].y <= this.enemyMinY;
    let conditionDown = enemies[i].speed > 0 && enemies[i].y >= this.enemyMaxY;
    if (conditionUp || conditionDown){
      enemies[i].speed *= -1
      };

    // check enemy overlap
    let enemyRect = enemies[i].getBounds();

    if (Phaser.Geom.Intersects.RectangleToRectangle(playerRect, enemyRect)){
        // end game
        return this.gameOver()
      };
    };

  // treasure overlap check
  let treasureRect = this.treasure.getBounds();

  if (Phaser.Geom.Intersects.RectangleToRectangle(playerRect, treasureRect)){
      // this.treasure.scale += 0.1;
      // this.player.scale += 0.1;
      // end game
      return this.gameOver()
    };

  // if (this.treasure.scale < 1) {
  //   this.treasure.scale += 0.01;
  // }
};

gameScene.gameOver = function(){
  this.isTerminating = true;
  this.cameras.main.shake(500);
  this.cameras.main.on('camerashakecomplete', function(camera, effect){
    this.cameras.main.fade(500);
  }, this);

  this.cameras.main.on('camerafadeoutcomplete', function(camera, effect){
    this.scene.restart();
  }, this);
};

// set the configuration of the game
let config = {
  type: Phaser.AUTO,
  width: 640,
  height: 360,
  scene: gameScene
};

// create a new game, pass the configuration
let game = new Phaser.Game(config);
