class SpriteLoader {
  constructor(source) {
    this.img = new Image();
    this.src = source;
    this.img.src = source;

    this.isLoaded = false;
    this.isLogged = false;

    this.width = 0;
    this.height = 0;
  }

  async load() {
    return new Promise((resolve, reject) => {
      this.img.onload = () => {
        this.isLoaded = true;

        this.width = this.img.width;
        this.height = this.img.height;

        resolve(this.img);
      };
    });
  }

  // t Specify width or height to change scale
  draw(ctx, x, y, width = this.width, height = this.height) {
    // * Draws only when loaded
    if (this.isLoaded) {
      ctx.drawImage(this.img, x, y, width, height);
    } else if (!this.isLogged) {
      console.log(`${this.src} is not loaded`);
      this.isLogged = true;
    }
  }
}

class LoadBirdSprite extends SpriteLoader {
  constructor(source) {
    super(source);

    this.spriteWidth = 92;
    this.sourceX = 0;

    this.frameWidth = 92; // t Controls the width of each frame
    this.frameHeight = 64; // t Controls the height of each frame

    this.totalSprite = 3;
    this.currentSprite = 0;

    this.framesUpdateCounter = 0;
    this.framesDelay = 12; // t This controls animation speed
  }

  updateFramesIndex() {
    this.framesUpdateCounter++;

    if (this.framesUpdateCounter >= this.framesDelay) {
      this.sourceX = this.currentSprite * this.spriteWidth; // t Gets the starting point of each sprite
      this.currentSprite = (this.currentSprite + 1) % this.totalSprite; // t Transition to next frame or reset

      this.framesUpdateCounter = 0;
    }
  }

  renderAnimations(ctx, x, y) {
    if (this.isLoaded) {
      ctx.drawImage(
        this.img,
        this.sourceX,
        0,
        this.spriteWidth,
        this.frameHeight,
        x,
        y,
        this.frameWidth,
        this.frameHeight
      );
      this.updateFramesIndex();
    }
  }
}

class LoadPipeSprite extends SpriteLoader {
  constructor(source) {
    super(source);

    this.x = canvas.width;
    this.y = undefined;
    this.gap = undefined;
    this.speed = 1;

    // * Sprite range width should be 120 to 170 ||138(Default)
  }

  calcX() {
    this.x -= this.speed;
    if (this.x + this.width < 0) {
      this.x = canvas.width; // t Resets horizontal position
      this.y = undefined; // t Allows clacY() to set a new position
      this.gap = undefined; // t Allows variation in gap size
    }
    return this.x;
  }

  calcY() {
    if (this.y === undefined) {
      this.y = Math.floor(Math.random() * 500 + 100);
    }
    return this.y;
  }

  clacGap(max, min) {
    if (this.gap === undefined) {
      this.gap = Math.floor(Math.random() * (max - min) + min);
    }
    return this.gap;
  }

  calcSpeed() {}

  renderPipe(ctx) {
    let x = this.calcX();
    let y = this.calcY();
    let gap = this.clacGap(300, 200);

    if (this.isLoaded) {
      ctx.save(); // t Save default img before alterations
      ctx.scale(1, -1); // t Flip Vertically
      ctx.drawImage(this.img, x, -y);
      ctx.restore(); // t Resets img before rendering lower pipe

      pipes.draw(ctx, x, y + gap);
    }
  }

  // t gap is determined by score (reduce gap every 10 passed, maxed at certain amount)
  // t distance between pipes are determined by score while staying random
  // t speed is determined by score
}

const canvas = document.querySelector("#canvas");
canvas.width = 700;
canvas.height = 1000;
const ctx = canvas.getContext("2d");

const flappy = new LoadBirdSprite("images/bird.png");
const background = new SpriteLoader("images/background.png");
const pipes = new LoadPipeSprite("images/pipe.png");

let groundOffset = 0;
const ground = new SpriteLoader("images/ground.png");

// * PreLoads Assets
const assetsPreLoader = async () => {
  try {
    await Promise.all([
      background.load(),
      ground.load(),
      flappy.load(),
      pipes.load(),
    ]);
    gameLoop();
  } catch (error) {
    console.error(error);
  }
};

// * Game Looping Logic
const gameLoop = () => {
  // t Ctx render order = z index order
  background.draw(ctx, 0, -128, canvas.width, canvas.height);

  pipes.renderPipe(ctx);

  for (let x = -groundOffset; x < canvas.width; x += ground.img.width) {
    ground.draw(ctx, x, canvas.height - ground.img.height); // * Redraws the ground sprite to cover entire width
  }
  groundOffset = (groundOffset + 1) % ground.img.width; // * Increments determines speed

  flappy.renderAnimations(ctx, 200, 400);

  requestAnimationFrame(gameLoop);
};

//

assetsPreLoader();

//

// ! Development Guidelines
//? Define the core mechanics: the bird’s movement (flap, gravity, drop)
// Craft a responsive “flap” mechanism using event listeners to modify the bird’s velocity and simulate jumps.
//? precise collision detection logic to determine when the bird touches obstacles or the canvas boundaries.
// * Position of the bird is always centered

// ? Integrate keyboard (space bar) touch events (mobile)
// Provide immediate visual and audio feedback for events (collision, and game-over transitions)

// t Set up an HTML5 <canvas> for drawing and animation
// Initializing the 2D rendering context for smoother graphics.
// ? Manage the animation loop with requestAnimationFrame to ensure consistent frame rates and performance

//? obstacle generation (pipes) with varying gaps and positions. (increase difficulty as score increases)
// Design an algorithm to generate and recycle pipes dynamically.
// Implement a scoring system.

// ! Testing
//Verify transitions between game states (start, playing, game over, restart) occur correctly.

//Test that gravity, velocity, and the flap mechanism produce expected position changes.
//Test that event listeners correctly respond to user input, triggering the flap action reliably.

//Ensure the animation loop consistently invokes requestAnimationFrame without performance lag.
//Check behavior when the bird nearly touches obstacles or screen boundaries to ensure correct detection
//verify that score resets and state transitions are robust.

//persistent high scores using local storage
