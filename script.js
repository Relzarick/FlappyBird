class SpriteLoader {
  constructor(source) {
    this.img = new Image();
    this.src = source; // t This is for logging purposes
    this.img.src = source;

    this.isLoaded = false;
    this.isLogged = false;

    this.width = 0;
    this.height = 0;
  }

  // load assets
  async load() {
    return new Promise((resolve, reject) => {
      this.img.onload = () => {
        this.isLoaded = true; // t program only draws if img is loaded

        // t Sets size to sprite size
        this.width = this.img.width;
        this.height = this.img.height;

        resolve(this.img);
      };
    });
  }

  // t Specify width or height to change scale
  // * Draws only when loaded
  draw(ctx, x, y, width = this.width, height = this.height) {
    if (this.isLoaded) {
      ctx.drawImage(this.img, x, y, width, height);
    } else if (!this.isLogged) {
      console.log(`${this.src} is not loaded`); // t Logs which img is not loading
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
    this.speed = 4;

    // * Sprite range width should be 120 to 170 ||138(Default)
  }

  // * Handles the calculation for shifting pipes from right to left
  calcX() {
    this.x -= this.speed; // t Moves pipe leftward

    // * Checks if pipes are off screen
    if (this.x + this.width < 0) {
      this.x = canvas.width; // t Resets horizontal position
      this.y = undefined; // t Allows clacY() to reset position
      this.gap = undefined; // t Allows clacGap() to reset gap
    }
    return this.x;
  }

  // * Calculates the height of the pipes
  calcY() {
    if (this.y === undefined) {
      this.y = Math.floor(Math.random() * 500 + 100);
    }
    return this.y;
  }

  // * Determines a randomized gap between pipes
  clacGap(max, min) {
    if (this.gap === undefined) {
      this.gap = Math.random() * (max - min) + min;
    }
    return this.gap;
  }

  // * Will be used to determine speed scaling it with score
  calcSpeed() {}

  renderPipe(ctx) {
    let x = this.calcX();
    let y = this.calcY();
    let gap = this.clacGap(300, 200);

    // if (pipesArray[pipesArray.length - 1].x) {
    //  }

    if (this.isLoaded) {
      ctx.save(); // t Save default img before alterations
      ctx.scale(1, -1); // t Flip Vertically
      ctx.drawImage(this.img, x, -y);
      ctx.restore(); // t Resets img before rendering lower pipe
      this.draw(ctx, x, y + gap); // t Bottom pipe
    }
  }

  // t gap is determined by score (reduce gap every 10 passed, maxed at certain amount)
  // t distance between pipes are determined by score while staying random
}

const canvas = document.querySelector("#canvas");
canvas.width = 700;
canvas.height = 1000;
const ctx = canvas.getContext("2d");

const flappy = new LoadBirdSprite("images/bird.png");
const flappyPosition = 200;
const background = new SpriteLoader("images/background.png");

let groundOffset = 0;
const ground = new SpriteLoader("images/ground.png");

let pipesArray = [];

// * PreLoads Assets
const assetsPreLoader = async () => {
  try {
    await Promise.all([background.load(), ground.load(), flappy.load()]);
    gameLoop(); // t Only start gameloop once all ctx are loaded
  } catch (error) {
    console.error(error);
  }
};

// * Creates new pipe classes and pushes to array
const spawnPipe = async () => {
  const newPipe = new LoadPipeSprite("images/pipe.png");
  await newPipe.load();

  pipesArray.push(newPipe);
};

// * Game Looping Logic
//  Order in which ctx are drawn determines the Z index
const gameLoop = () => {
  background.draw(ctx, 0, -128, canvas.width, canvas.height);

  // ! Pipe logic
  pipesArray.forEach((pipe) => pipe.renderPipe(ctx)); // t Runs the rendering logic for indivdual pipe in the array
  pipesArray = pipesArray.filter((pipe) => pipe.x + pipe.width > 0); // t Removes off screen pipe

  const lastPipe = pipesArray[pipesArray.length - 1]; // t Gets the last pipe in array

  // If there are no pipes, or if last pipe + width of pipe has passed flappy
  // .some() checks is any pipe is within stipulated coordinate, only spawns if there is not
  if (
    !lastPipe ||
    (lastPipe.x + lastPipe.width < flappyPosition + 92 &&
      !pipesArray.some(
        (pipe) => pipe.x + pipe.width >= canvas.width - pipe.width
      ))
  ) {
    spawnPipe();
  }

  flappy.renderAnimations(ctx, flappyPosition, 400);

  // ! Ground logic
  for (let x = -groundOffset; x < canvas.width; x += ground.img.width) {
    ground.draw(ctx, x, canvas.height - ground.img.height); // t Redraws the ground sprite to cover entire width
  }
  groundOffset = (groundOffset + 1) % ground.img.width; // t Increments determines speed

  requestAnimationFrame(gameLoop);
};

assetsPreLoader();

// ! Development Guidelines
//? Define the core mechanics: the bird’s movement (flap, gravity, drop)
// Craft a responsive “flap” mechanism using event listeners to modify the bird’s velocity and simulate jumps.
//? precise collision detection logic to determine when the bird touches obstacles or the canvas boundaries.

// ? Integrate keyboard (space bar) touch events (mobile)
// Provide immediate visual and audio feedback for events (collision, and game-over transitions)

//? obstacle generation (pipes) with varying gaps and positions. (increase difficulty as score increases)
// Implement a scoring system.

// ! Testing
//Verify transitions between game states (start, playing, game over, restart) occur correctly.

//Test that gravity, velocity, and the flap mechanism produce expected position changes.
//Test that event listeners correctly respond to user input, triggering the flap action reliably.

//Check behavior when the bird nearly touches obstacles or screen boundaries to ensure correct detection
//verify that score resets and state transitions are robust.

//persistent high scores using local storage
