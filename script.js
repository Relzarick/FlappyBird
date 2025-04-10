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
      console.log(`${this.src} is not loaded`); // t Logs if not loading
      this.isLogged = true;
    }
  }
}

class LoadBirdSprite extends SpriteLoader {
  constructor(source) {
    super(source);

    this.sourceX = 0;

    this.frameWidth = 92; // t Controls the width of each frame
    this.frameHeight = 64; // t Controls the height of each frame

    this.totalSprite = 3;
    this.currentSprite = 0;

    this.framesUpdateCounter = 0;
    this.framesDelay = 12; // t This controls animation speed
  }

  updateFramesIndex() {
    this.framesUpdateCounter++; // t Only update when looped 12 times

    if (this.framesUpdateCounter >= this.framesDelay) {
      this.sourceX = this.currentSprite * this.frameWidth; // t Gets the starting point of each sprite
      this.currentSprite = (this.currentSprite + 1) % this.totalSprite; // t Transition to next frame or reset

      this.framesUpdateCounter = 0; // Resets for next loop
    }
  }

  renderAnimations(ctx, x, y) {
    if (this.isLoaded) {
      ctx.drawImage(
        this.img,
        this.sourceX,
        0,
        this.frameWidth,
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
    let gap = this.clacGap(320, 220);

    if (this.isLoaded) {
      ctx.save(); // t Save default img before alterations
      ctx.scale(1, -1); // t Flip Vertically
      ctx.drawImage(this.img, x, -y);
      ctx.restore(); // t Resets img before rendering lower pipe
      this.draw(ctx, x, y + gap);
    }
  }
}

const canvas = document.querySelector("#canvas");
canvas.width = 700;
canvas.height = 1000;
const ctx = canvas.getContext("2d");

const flappy = new LoadBirdSprite("images/bird.png");
const flappyPositionX = 200;
const flappyPositionY = 400;
const background = new SpriteLoader("images/background.png");

let groundOffset = 0;
const ground = new SpriteLoader("images/ground.png");
let stopGame = false;

let pipesArray = [];
let initFirstPipe = false;
let pipeIndex = 0;

flappyAutomaticCollisionDetectionAndScoringSystem = () => {
  flappy.renderAnimations(ctx, flappyPositionX, flappyPositionY);

  const flapTop = flappyPositionY;
  const flapRight = flappyPositionX + 80;
  const flapBottom = flappyPositionY + 64;

  const threshold = flapRight + 30;
  const currentPipe = pipesArray[pipeIndex];

  if (currentPipe) {
    // IF LOOP FIRST CHECKS IF PIPE HAS BEEN INIT
    // SECOND CONDITION CHECKS IF PIPE HAS PASSED ACTIVATION THRESHOLD

    // console.log(currentPipe, pipesArray);

    // *
    if (currentPipe.x <= threshold) {
      const lowerPipeTopEdge = Math.floor(currentPipe.y + currentPipe.gap);
      const groundHeight = canvas.height - 128;

      // HANDLES DETECTION OF COLLISION
      if (
        (flapRight >= currentPipe.x && //t Pipe's left edge detection
          flapRight <= currentPipe.x + currentPipe.width && //t And checks if it is within pipe's width
          flapBottom >= lowerPipeTopEdge) || //t Checks y axis of bird does not touch pipe's y axis
        flapTop <= currentPipe.y ||
        flapBottom >= groundHeight //t Handles ground collision detection
      ) {
        currentPipe.speed = 0;
        stopGame = true;
      } else {
        console.log("score");
      }
    }

    // RESETS INDEX
    if (currentPipe.x + currentPipe.width < flappyPositionY) {
      pipeIndex = (pipeIndex + 1) % 2;
    }
    // *
  }

  // *
};

// PreLoads Assets
const assetsPreLoader = async () => {
  try {
    await Promise.all([background.load(), ground.load(), flappy.load()]);
    gameLoop(); // t Only start gameloop once all ctx are loaded
  } catch (error) {
    console.error(error);
  }
};

// Creates new pipe classes and pushes to array
const spawnPipe = async () => {
  const newPipe = new LoadPipeSprite("images/pipe.png");
  await newPipe.load();
  pipesArray.push(newPipe);
};

const pipeFunc = async () => {
  if (!initFirstPipe) {
    initFirstPipe = true;
    await spawnPipe(); // t Adds the first pipe into array
  }

  for (let i = 0; i < pipesArray.length; i++) {
    if (pipesArray.length < 2 && pipesArray[i].x < flappyPositionX) {
      await spawnPipe();
    }
    pipesArray[i].renderPipe(ctx); // t Renders each pipe in array
  }
};

const groundFunc = () => {
  for (let x = -groundOffset; x < canvas.width; x += ground.img.width) {
    ground.draw(ctx, x, canvas.height - ground.img.height); // t Redraws the ground sprite to cover entire width
  }

  if (!stopGame) {
    groundOffset = (groundOffset + 1) % ground.img.width; // t Determines speed
  }
};

//  Game Looping Logic
// ? Order in which ctx are drawn determines the Z index
const gameLoop = () => {
  background.draw(ctx, 0, -128, canvas.width, canvas.height);

  pipeFunc();

  flappyAutomaticCollisionDetectionAndScoringSystem();

  groundFunc();

  // ! probably temp solution???
  if (!stopGame) {
    requestAnimationFrame(gameLoop);
  }
};

assetsPreLoader();

// ! Development Guidelines
//? Define the core mechanics: the bird’s movement (flap, gravity, drop)
// Craft a responsive “flap” mechanism using event listeners to modify the bird’s velocity and simulate jumps.
//? precise collision detection logic to determine when the bird touches obstacles or the canvas boundaries.

// ? Integrate keyboard (space bar) touch events (mobile)
// Provide immediate visual and audio feedback for events (collision, and game-over transitions)

//? obstacle generation (pipes) with varying gaps(increase difficulty as score increases)
// Implement a scoring system.

// ! Testing
//Verify transitions between game states (start, playing, game over, restart) occur correctly.

//Test that gravity, velocity, and the flap mechanism produce expected position changes.
//Test that event listeners correctly respond to user input, triggering the flap action reliably.

//Check behavior when the bird nearly touches obstacles or screen boundaries to ensure correct detection
//verify that score resets and state transitions are robust.

//persistent high scores using local storage
