//p1ngWin v0.1
window.addEventListener('load', function (e) {
    if (navigator.maxTouchPoints > 0) {
        return;
    }

    const canvas = document.getElementById('game-viewport');
    const ctx2d = canvas.getContext('2d');
    const gameOverlay = document.getElementById('game-overlay');
    const startBtn = document.querySelector('#game-restart');

    canvas.width = 960;
    canvas.height = 720;

    var game_assets = new Map();
    //some of them picked from craftix
    //Background arts by Ansimuz
    //Menace Pinguin created by Israel Maraver Talavera
    game_assets.set('background', '/assets/game/backgrounds/sky.png');
    game_assets.set('buildings', '/assets/game/backgrounds/buildings.png');
    game_assets.set('foreground', '/assets/game/backgrounds/foreground.png');

    //player
    game_assets.set('player_walk', '/assets/game/player/walk.png');
    game_assets.set('player_walk_shoot', '/assets/game/player/walk_shoot.png');
    game_assets.set('player_hurt', '/assets/game/player/hurt.png');

    //enemies
    game_assets.set('IE', '/assets/game/enemies/IE.png');

    //props
    game_assets.set('bullet', '/assets/game/props/bullet.png');
    game_assets.set('cloud', '/assets/game/props/night_cloud.png');
    game_assets.set('heart', '/assets/game/props/heart.png');
    game_assets.set('heart_bg', '/assets/game/props/heart_bg.png');
    game_assets.set('heart_border', '/assets/game/props/heart_border.png');
    game_assets.set('healthka', '/assets/game/props/healthka.png');


    for (let [key, value] of game_assets) {
        const tmp = new Image();
        tmp.src = value;
        //tmp.setAttribute('loading', 'lazy');
        game_assets.set(key, tmp);
    }

    class InputHandler {
        constructor(game) {
            this.game = game;

            window.addEventListener('keydown', e => {
                if (
                    //dont wanna mess with WASD, coz those are depends on keyboard language layout
                    (e.key == 'ArrowUp' || e.key == 'ArrowDown' || e.key == 'ArrowLeft' || e.key == 'ArrowRight' || e.key == ' ')
                    && this.game.keys.indexOf(e.key) == -1
                ) {
                    this.game.keys.push(e.key);
                }

                if (!this.game.isGameOver)
                    e.preventDefault();
            });

            window.addEventListener('keyup', e => {
                if (this.game.keys.indexOf(e.key) > -1)
                    this.game.keys.splice(this.game.keys.indexOf(e.key), 1);

                if (this.game.isGameOver)
                    e.preventDefault();
            });
        }
    }

    class Projectile {
        constructor(game, x, y) {
            this.game = game;
            this.x = x;
            this.y = y;
            this.width = 115;
            this.height = 40;
            this.hitboxwidth = this.width;
            this.hitboxheight = this.height;
            this.velocity = 5;
            this.mustBeDeleted = false;
            this.image = game_assets.get('bullet');
        }
        update() {
            if (this.x > this.game.width)
                this.mustBeDeleted = true;
            else
                this.x += this.velocity;
        }
        draw(context) {
            if (this.game.isDebugMode) {
                context.strokeStyle = 'red';
                context.strokeRect(this.x, this.y, this.width, this.height);
            }
            context.drawImage(this.image, this.x, this.y);
        }
    }

    class Player {
        constructor(game) {
            this.game = game;
            this.height = 250;
            this.width = 245;
            this.hitboxwidth = 200;
            this.hitboxheight = 250;
            this.x = 50;
            this.y = 400;
            this.speed = 1;
            this.maxSpeed = 3;
            this.isUsingMelle = true;
            this.isUsingGun = false;
            this.maxLives = 5;
            this.lives = this.maxLives;

            this.jumped = false;
            this.jumpTimer = 0;
            this.jumpTimerLimit = 1000;
            this.floor = this.game.height - this.height - 10;

            this.receivedDamage = false;
            this.painTimer = 0;
            this.painTimerLimit = 150;

            this.frameX = 0;
            this.frameY = 0;
            this.maxFrameX = 15;
            this.maxFrameY = 0;

            this.shooting = false;
            this.shotTimer = 0;
            this.shotTimerLimit = 400;

            this.projectiles = [];

            this.image_walk = game_assets.get('player_walk');
            this.image_walk_shoot = game_assets.get('player_walk_shoot');
            this.image_jump = game_assets.get('player_jump');
            this.image_hurt = game_assets.get('player_hurt');
        }

        update(deltaTime) {
            //TODO
            //ADD BELLY SLIDING DODGE MECHANIC
            if (this.game.keys.includes('ArrowUp') && !this.jumped && this.y == this.floor) {
                this.jumped = true;
            }
            if (this.game.keys.includes('ArrowLeft'))
                this.x -= this.maxSpeed;
            if (this.game.keys.includes('ArrowRight'))
                this.x += this.maxSpeed;
            if (this.game.keys.includes(' ') && !this.receivedDamage) {
                this.shooting = true;
            }
            else
                this.shooting = false;

            if (this.x < 10)
                this.x = 10;

            if (this.jumped) {
                if (this.jumpTimer > this.jumpTimerLimit) {
                    this.jumpTimer = 0;
                    this.jumped = false;
                }
                else {
                    this.jumpTimer += deltaTime;
                    this.y -= this.game.gravity * 6;
                }
            }

            if (this.receivedDamage) {
                if (this.painTimer > this.painTimerLimit) {
                    this.painTimer = 0;
                    this.receivedDamage = false;
                }
                else {
                    this.painTimer += deltaTime;
                }
            }

            if (this.shooting) {
                if (this.shotTimer > this.shotTimerLimit) {
                    this.shotTimer = 0;
                    this.shoot();
                }
                else {
                    this.shotTimer += deltaTime;
                }
            }
            else
                this.shotTimer = this.shotTimerLimit;

            if (this.y < this.floor && !this.jumped) {
                this.y += this.game.gravity * 6;
            }

            if (this.y > this.floor)
                this.y = this.floor;

            if (this.x > 440)
                this.x = 440;

            if (this.frameX < this.maxFrameX)
                this.frameX++;
            else
                this.frameX = 0;

            this.projectiles.forEach(projectile => {
                projectile.update();
            });

            this.projectiles = this.projectiles.filter(projectile => !projectile.mustBeDeleted);
        }

        draw(context) {
            if (this.game.isDebugMode) {
                context.strokeStyle = 'red';
                context.strokeRect(this.x, this.y, this.width, this.height);
                context.strokeStyle = 'green';
                context.strokeRect(this.x, this.y, this.hitboxwidth, this.hitboxheight);
            }

            this.projectiles.forEach(projectile => {
                projectile.draw(context);
            });

            if (this.receivedDamage) {
                this.width = 248;
                context.drawImage(this.image_hurt, this.frameX * this.width, this.frameY * this.height,
                    this.width, this.height, this.x, this.y, this.width, this.height);
            }
            else if (this.shooting) {
                this.width = 340;
                context.drawImage(this.image_walk_shoot, this.frameX * 350, this.frameY * this.height,
                    this.width, this.height, this.x, this.y, this.width, this.height);
            }
            else {
                this.width = 245;
                this.maxFrameX = 15;
                context.drawImage(this.image_walk, this.frameX * this.width, this.frameY * this.height,
                    this.width, this.height, this.x, this.y, this.width, this.height);
            }
        }

        shoot() {
            this.maxFrameX = 15;
            this.projectiles.push(new Projectile(this.game, this.x + this.width - 40, this.y + this.y * 0.25));
        }
        reload_gun() {
            this.shotTimer = this.shotTimerLimit;
        }
        hurt() {
            this.shooting = false;
            this.receivedDamage = true;
            this.maxFrameX = 7;
            this.lives--;
        }
    }

    class Entity {
        constructor(game) {
            this.game = game;
            this.mustBeDeleted = false;
            this.x = this.game.width;
            this.y = (Math.random() * 200) + (this.game.height * 0.5);
            this.width = 125;
            this.width = 125;
            this.velocityX = 1;
            this.hitboxwidth = this.width;
            this.hitboxheight = this.height;
        }
        update() {
            this.x += this.velocityX;

            if (this.x + this.width < 0)
                this.mustBeDeleted = true;
        }

    }

    class HealingBox extends Entity {
        constructor(game) {
            super(game);
            this.image = game_assets.get('healthka');
            this.x = this.game.width;
            this.y = 400;
            this.yd = 1; //y direction
            this.width = 64;
            this.height = 64;
            this.hitboxwidth = this.width;
            this.hitboxheight = this.height;
        }
        update() {
            this.x -= this.velocityX;

            if (this.x + this.width < 0)
                this.mustBeDeleted = true;

            if (this.y == 380)
                this.yd = -this.yd;
            else if (this.y == 400)
                this.yd = -this.yd;

            this.y += this.yd;
        }
        draw(context) {
            if (this.game.isDebugMode) {
                context.strokeStyle = 'red';
                context.strokeRect(this.x, this.y, this.width, this.height);
            }
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
    }


    class Enemy extends Entity {
        constructor(game) {
            super(game);
            this.type = 'enemy';
            this.velocityX = Math.random() * -5 - (this.game.score / 1000);
        }
    }

    class IE extends Enemy {
        constructor(game) {
            super(game);
            this.image = game_assets.get('IE');
            this.hitboxwidth = 125;
            this.hitboxheight = 125;
            this.value = 5;
        }
        draw(context) {
            context.drawImage(this.image, this.x, this.y);
        }
    }

    class Prop {
        constructor(game, image, scrollingSpeed = 0, x = 0, y = 0, width = 0, height = 0) {
            this.game = game;
            this.image = image;
            this.scrollingSpeed = scrollingSpeed;
            this.x = x ? x : this.game.width;
            this.y = y;
            this.width = width;
            this.height = height;
        }
        update() {
            if (this.x + this.width < 0)
                this.x = this.game.width + this.width;
            this.x -= this.scrollingSpeed;
        }
        draw(context) {
            if (this.game.isDebugMode) {
                context.strokeStyle = 'red';
                context.strokeRect(this.x, this.y, this.width, this.height);
            }
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
    }

    class Layer {
        constructor(game, image, scrollingSpeed, x = 0, y = 0, width = 0, height = 0, parallax = true) {
            this.game = game;
            this.image = image;
            this.scrollingSpeed = scrollingSpeed;
            this.x = x ? x : 0;
            this.y = y ? y : 0;
            this.width = width ? width : this.game.width;
            this.height = height ? height : this.game.height;
            this.parallax = parallax;
        }

        update() {
            if (this.x <= -this.game.width)
                this.x = 0;

            this.x -= this.scrollingSpeed;
        }

        draw(context) {
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
            if (this.parallax)
                context.drawImage(this.image, this.x + this.game.width, this.y, this.game.width, this.game.height);
        }
    }

    class Background {
        constructor(game) {
            this.game = game;
            this.layers = [];
            this.props = [];
            this.layers.push(new Layer(this.game, game_assets.get('background'), 0));
            this.layers.push(new Layer(this.game, game_assets.get('buildings'), 1));

            this.props.push(new Prop(this.game, game_assets.get('cloud'), 2, this.game.width - 200, Math.random() * 10, 180, 80));
            this.props.push(new Prop(this.game, game_assets.get('cloud'), Math.random() * 3, this.game.width - 400, Math.random() * 30, 180, 80));
            this.props.push(new Prop(this.game, game_assets.get('cloud'), Math.random() * 3, this.game.width - 400, Math.random() * 30, 180, 80));

            this.layers.push(new Layer(this.game, game_assets.get('foreground'), 1));


        }
        update() {
            this.layers.forEach(layer => layer.update());
            this.props.forEach(prop => prop.update());
        }
        draw(context) {
            this.layers.forEach(layer => layer.draw(context));
            this.props.forEach(prop => prop.draw(context));
        }
    }

    class UI {
        constructor(game) {
            this.game = game;
            this.fontSize = 32;
            this.heartImage = game_assets.get('heart');
            this.heartImageBorder = game_assets.get('heart_border');
        }
        draw(context) {
            context.save();
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;
            context.shadowColor = 'black';

            if (this.game.isGameOver && this.game.isGameEverStarted) {
                context.globalAlpha = 0.5;
                context.fillStyle = '#cc11f0';
                context.fillRect(0, 0, this.game.width, this.game.height);
                context.globalAlpha = 1.0;
            }

            //draw score
            context.font = '40px Aldrich';
            context.textAlign = 'center';
            context.fillStyle = 'yellow';
            context.fillText('SCORE: ' + this.game.score, this.game.width * 0.5, 60);

            context.restore();

            //draw player lives
            for (let i = 0; i < this.game.player.lives; i++) {
                let x = 2;
                if (i > 0)
                    x = 52 * i;

                context.drawImage(this.heartImageBorder, x, 20, 48, 48);
                context.drawImage(this.heartImage, x, 20, 48, 48);
            }



        }
    }

    class Game {
        constructor(width, height) {
            //game core options
            this.width = width;
            this.height = height;
            this.isDebugMode = false;
            this.isGameEverStarted = false;
            this.isGameOver = true;

            //world variables
            this.speed = 1;
            this.gravity = 0.8;

            //keys handle
            this.keys = [];
            this.inputHandler = new InputHandler(this);

            //enemies controll
            this.enemies = [];
            this.enemySpawnTimer = 0;
            this.enemySpawnInterval = 500;

            //heal boxes
            this.healthBoxes = [];
            this.healBoxTimer = 0;
            this.healBoxTimerLimit = 10000;

            //draw stuff
            this.ui = new UI(this);
            this.background = new Background(this);
            this.player = new Player(this);

            //game stats
            this.score = 0;
            this.hurtPenalty = 20;
        }
        start() {
            this.score = 0;
            this.player.lives = this.player.maxLives;
            this.player.x = 50;
            this.player.y = 400;
            this.isGameOver = false;
            this.isGameEverStarted = true;
            this.enemies.splice(0, this.enemies.length);
            this.healthBoxes.splice(0, this.healthBoxes.length);
            gameOverlay.setAttribute('style', 'display: none !important');
        }

        update(deltaTime) {
            if (this.isGameOver)
                return;

            this.background.update();
            this.player.update(deltaTime);


            this.enemies = this.enemies.filter(enemy => !enemy.mustBeDeleted);

            this.enemies.forEach(enemy => {
                enemy.update();
                if (this.checkCollision(this.player, enemy)) {
                    enemy.mustBeDeleted = true;
                    if (this.player.lives <= 0) {
                        this.isGameOver = true;
                        gameOverlay.setAttribute('style', 'display: flex !important');
                        startBtn.innerHTML = 'Restart';
                    }
                    else {
                        this.player.hurt();
                    }
                }

                this.player.projectiles.forEach(projectile => {
                    if (this.checkCollision(projectile, enemy)) {
                        enemy.mustBeDeleted = true;
                        projectile.mustBeDeleted = true;
                        if (!this.isGameOver) {
                            this.player.reload_gun();
                            this.score += enemy.value;
                        }
                    }
                });
            });


            if (this.enemySpawnTimer > this.enemySpawnInterval && !this.isGameOver) {
                this.addEnemy();
                this.enemySpawnTimer = 0;
            }
            else
                this.enemySpawnTimer += deltaTime;

            this.healthBoxes = this.healthBoxes.filter(healthBox => !healthBox.mustBeDeleted);

            this.healthBoxes.forEach(healthBox => {
                healthBox.update(deltaTime);
                if (this.checkCollision(this.player, healthBox)) {
                    healthBox.mustBeDeleted = true;
                    this.player.lives++;
                }
            });

            if (this.healBoxTimer > this.healBoxTimerLimit && this.healthBoxes.length < 1) {
                this.addHealthBox();
                this.healBoxTimer = 0;
            }
            else
                this.healBoxTimer += deltaTime;

        }

        draw(context) {
            this.background.draw(context);
            this.player.draw(context);
            this.healthBoxes.forEach(healthBox => healthBox.draw(context));
            this.enemies.forEach(enemy => enemy.draw(context));
            this.ui.draw(context);
        }

        addEnemy() {
            if (this.enemies.length < 250)
                this.enemies.push(new IE(this));
        }

        addHealthBox() {
            if (this.player.lives < this.player.maxLives)
                this.healthBoxes.push(new HealingBox(this));
        }

        checkCollision(entity1, entity2) {
            return (entity1.x < entity2.x + entity2.hitboxwidth &&
                entity1.y < entity2.y + entity2.hitboxheight &&
                entity1.x + entity1.hitboxwidth > entity2.x &&
                entity1.y + entity1.hitboxheight > entity2.y);
        }
    }

    const game = new Game(canvas.width, canvas.height);

    startBtn.addEventListener('click', function (e) {
        game.start();
    });

    let lastTick = 0;
    //kinda endless game loop
    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTick;
        lastTick = timeStamp;
        ctx2d.clearRect(0, 0, canvas.width, canvas.height);
        game.update(deltaTime);
        game.draw(ctx2d);
        //called b4 window renderer
        requestAnimationFrame(animate);
    }

    animate(0);
});
