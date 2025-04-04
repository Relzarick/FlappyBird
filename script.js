class SpriteLoader {
  constructor(source) {
    this.img = new Image();
    this.src = source;
    this.img.src = source;

    this.isLoaded = false;
    this.isLogged = false;
  }

  async load() {
    return new Promise((resolve, reject) => {
      this.img.onload = () => {
        this.isLoaded = true;
        resolve(this.img);
      };
    });
  }

  //

  draw(ctx, x, y, width = this.img.width, height = this.img.height) {
    // * Only draws once image is loaded
    if (this.isLoaded) {
      ctx.drawImage(this.img, x, y, width, height);
    } else if (!this.isLogged) {
      console.log(`${this.src} is not loaded`);
      this.isLogged = true;
    }
  }
}

// t

//  t

const canvas = document.querySelector("#canvas");
canvas.width = 700;
canvas.height = 1000;

const ctx = canvas.getContext("2d");

const flappy = new SpriteLoader("images/bird.png");
const background = new SpriteLoader("images/background.png");

let groundOffset = 0;
const ground = new SpriteLoader("images/ground.png");

//

// * Load assets
const assetsPreLoader = async () => {
  try {
    await Promise.all([background.load(), ground.load(), flappy.load()]);
    gameLoop();
  } catch (error) {
    console.error(error);
  }
};

//

// * Game Looping  Logic
const gameLoop = () => {
  background.draw(ctx, 0, -128, canvas.width, canvas.height);

  flappy.draw(ctx, 200, 400);

  // * Draw the ground sprite multiple times to cover the canvas width
  for (let x = -groundOffset; x < canvas.width; x += ground.img.width) {
    ground.draw(ctx, x, canvas.height - ground.img.height);
  }

  // Increments determines movement speed
  // t when increasing the difficulty increase this number
  groundOffset = (groundOffset + 1) % ground.img.width; // Wrap when reaching sprite width

  requestAnimationFrame(gameLoop);
};

assetsPreLoader();

// ! Development Guidelines
//? Define the core mechanics: the bird’s movement (flap, gravity, drop)
// Craft a responsive “flap” mechanism using event listeners to modify the bird’s velocity and simulate jumps.
//? precise collision detection logic to determine when the bird touches obstacles or the canvas boundaries.
// * Position of the bird is always centered

// ? Integrate keyboard (space bar) touch events (mobile)
// Provide immediate visual and audio feedback for events (collision, and game-over transitions)

// Use OOP
// Ensure encapsulation for maintainability.

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

// use image() onload event and call drawimage()
