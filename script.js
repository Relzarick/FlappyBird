const canvas = document.querySelector("#canvas");
canvas.width = 700;
canvas.height = 1000;

const ctx = canvas.getContext("2d");

// t
class Flappy {
  constructor() {
    this.src = "images/bird.png";
  }

  draw(ctx, x, y) {}
}

// t
class SpriteLoader {
  constructor(src) {
    this.img = new Image();
    this.src = src;
    this.img.src = src;
    this.isLoaded = false;
  }

  async load() {
    return new Promise((resolve, reject) => {
      this.img.onload = () => {
        this.isLoaded = true;
        resolve(this.img);
      };
    });
  }

  draw(ctx, x, y, width, height) {
    // * Only draws once image is loaded
    if (this.isLoaded) {
      ctx.drawImage(this.img, x, y, width, height);
    }
  }
}

//  t
const assetsPreLoader = async () => {
  try {
    await background.load();
    gameLoop();
  } catch (error) {
    console.error(error);
  }
};

// t
const gameLoop = () => {
  background.draw(ctx, 0, 0, canvas.width, canvas.height);
  requestAnimationFrame(gameLoop);
};

const flappy = new Flappy();
const background = new SpriteLoader("images/background.png");
const ground = new SpriteLoader("images/ground.png");

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
