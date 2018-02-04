function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

window.onload = function() {
    var SECTION_SIZE = 32;
    var CANVAS_WIDTH_SECTIONS_LENGTH = 26;
    var CANVAS_HEIGHT_SECTIONS_LENGTH = 20;
    var CANVAS_HEIGHT = SECTION_SIZE * CANVAS_HEIGHT_SECTIONS_LENGTH;
    var CANVAS_WIDTH = SECTION_SIZE * CANVAS_WIDTH_SECTIONS_LENGTH;
    var SNAKE_INITIAL_LENGTH = 3;
    var DIRECTIONS = Object.freeze({ up: 0, down: 2, right: 3, left: 1 });
    var GAME_SPEED = 20;
    var GAME_OVER_MESSAGE = 'The game is over! Try again.';

    var game = new Phaser.Game(
        CANVAS_WIDTH,
        CANVAS_HEIGHT,
        Phaser.CANVAS,
        '',
        { preload: preload, create: create, update: update }
    );

    var snake = new Array(3);
    var food;
    var cursors;
    var playerDirection = DIRECTIONS.right;
    var frameCounter = 0;

    /**
     * Phaser
     */

    function preload() {
        game.load.spritesheet('player', 'assets/player.png', SECTION_SIZE, SECTION_SIZE);
        game.load.image('food', 'assets/food.png');
        game.load.image('background', 'assets/background.png')
    }

    function create() {
        game.add.tileSprite(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, 'background');

        initSnake();

        placeRandomApple();

        cursors = game.input.keyboard.createCursorKeys();
    }

    function update() {
        updateDirection();
        frameCounter++;

        if (frameCounter === GAME_SPEED) {
            movePlayer();

            if (checkSnakeHeadCollision()) {
                alert(GAME_OVER_MESSAGE);

                deleteSnake();
                initSnake();

                playerDirection = DIRECTIONS.right;

                frameCounter = 0;

                return;
            }

            if (checkAppleSnakeCollision()) {
                food.destroy();
                placeRandomApple();
            } else if (playerDirection !== undefined) {
                removeSnakeTail();
            }

            frameCounter = 0;
        }
    }

    /**
     * Snake
     */

    function initSnake() {
        snake = [];

        for (var i = 0; i < SNAKE_INITIAL_LENGTH; ++i) {
            addSnakeHead(i * SECTION_SIZE, 0);
        }
    }

    function deleteSnake() {
        while(snake.length > 0) {
            var section = snake.pop();

            section.destroy();
        }
    }

    function addSnakeHead(x, y) {
        var newSnakeHead = game.add.sprite(x, y, 'player', playerDirection);

        if (snake.length === 0) {
            return snake.push(newSnakeHead);
        }

        var oldSnakeHeadSection = game.add.sprite(snake[0].position.x, snake[0].position.y, 'player', 4);

        var deleted = snake.splice(0, 1, newSnakeHead, oldSnakeHeadSection);

        deleted[0].destroy();
    }

    function removeSnakeTail() {
        var tail = snake.pop();
        tail.destroy();
    }

    /**
     * Food
     */

    function placeRandomApple() {
        if (food) {
            food.destroy();
        }

        food = game.add.image(0, 0, 'food');
        do {
            food.position.x = getRandomInt(0, CANVAS_WIDTH_SECTIONS_LENGTH) * SECTION_SIZE;
            food.position.y = getRandomInt(0, CANVAS_HEIGHT_SECTIONS_LENGTH) * SECTION_SIZE;
        } while (checkAppleSnakeCollision());
    }

    /**
     * Collision
     */

    function checkAppleSnakeCollision() {
        return snake.some(function(section) {
            return food.position.x === section.position.x && food.position.y === section.position.y;
        })
    }

    function checkSnakeHeadCollision() {
        var head = snake[0];

        return snake.slice(1).some(function(section) {
            return section.position.x === head.position.x && section.position.y === head.position.y;
        });
    }

    /**
     * Movement
     */

    function updateDirection() {
        if (cursors.right.isDown && playerDirection !== DIRECTIONS.left) {
            playerDirection = DIRECTIONS.right;
        }
        if (cursors.left.isDown && playerDirection !== DIRECTIONS.right) {
            playerDirection = DIRECTIONS.left;
        }
        if (cursors.up.isDown && playerDirection !== DIRECTIONS.down) {
            playerDirection = DIRECTIONS.up;
        }
        if (cursors.down.isDown && playerDirection !== DIRECTIONS.up) {
            playerDirection = DIRECTIONS.down;
        }
    }

    function movePlayer() {
        var x = snake[0].position.x;
        var y = snake[0].position.y;

        if (playerDirection === DIRECTIONS.right) {
            x += SECTION_SIZE;
        } else if (playerDirection === DIRECTIONS.left) {
            x -= SECTION_SIZE;
        } else if (playerDirection === DIRECTIONS.up) {
            y -= SECTION_SIZE;
        } else if (playerDirection === DIRECTIONS.down) {
            y += SECTION_SIZE;
        }

        if (x <= 0 - SECTION_SIZE) {
            x = CANVAS_WIDTH - SECTION_SIZE;
        } else if (x >= CANVAS_WIDTH) {
            x = 0;
        } else if (y <= 0 - SECTION_SIZE) {
            y = CANVAS_HEIGHT - SECTION_SIZE;
        } else if (y >= CANVAS_HEIGHT) {
            y = 0;
        }

        if (playerDirection !== undefined) {
            addSnakeHead(x, y);
        }
    }
};
