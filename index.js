const { World, Engine, Render, Runner, Bodies, Body, Events } = Matter;

const width = window.innerWidth;
const height = window.innerHeight;
const cellsHorizontal = 20;
const cellsVertical = 30;

const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;

const engine = Engine.create();
engine.world.gravity.y = 0;

const { world } = engine;

const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes: false,
        width,
        height
    }
});
Render.run(render);
Runner.run(Runner.create(), engine);





//WALLS
const walls = [
    Bodies.rectangle(width / 2, 0, width, 2, {isStatic: true}),
    Bodies.rectangle(width / 2, height, width, 2, {isStatic: true}),
    Bodies.rectangle(0, height / 2, 2, height, {isStatic: true}),
    Bodies.rectangle(width, height / 2, 2, height, {isStatic: true})
];
World.add(world, walls);






//MAZE GENERATION
const shuffle = (arr) => {
    let counter = arr.length;

    while(counter > 0) {
        const index = Math.floor(Math.random() * counter);

        counter--;

        const temporary = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temporary;
    }

    return arr;
};

const grid = Array(cellsVertical).fill(null).map(() => { 
   return Array(cellsHorizontal).fill(false) 
});

const verticals = Array(cellsVertical).fill(null).map(() => { 
    return Array(cellsHorizontal - 1).fill(false) 
 });

 const horizontals = Array(cellsVertical - 1).fill(null).map(() => { 
    return Array(cellsHorizontal).fill(false) 
 });

 const startRow = Math.floor(Math.random() * cellsVertical);
 const startColumn = Math.floor(Math.random() * cellsHorizontal);

 const stepThroughCells = (row, column) => {
     //IF I HAVE VISITED THE CELL AT [ROW, COLUMN], THE RETURN
     if(grid[row][column]) {
         return;
     };

     //MARK THIS CELL AS VISITED
     (grid[row][column]) = true;

     //ASSEMBLE RANDOMLY-ORDERED LIST OF NEIGHBOURS
     const neighbours = shuffle([
        [row -1, column, 'up'],
        [row, column + 1, 'right'],
        [row + 1, column, 'down'],
        [row, column - 1, 'left']
     ]);

     //FOR EACH NEIGHBOUR
     for(let neighbour of neighbours) {
         const [nextRow, nextColumn, direction] = neighbour;

         //SEE IF THAT NEIGHBOUR IS OUT OF BOUNDS
         if(nextRow < 0 || nextRow >= cellsVertical || nextColumn < 0 || nextColumn >= cellsHorizontal) {
            continue;
         }

         //IF WE HAVE VISITED THAT NEIGHBOUR, CONITNUE WITH THE NEXT NEIGHBOUR
         if(grid[nextRow][nextColumn]) {
             continue;
         }

         //REMOVE A WALL FROM EITHER HORIZONTAL OR VERTICAL
         if(direction === 'left') {
             verticals[row][column - 1] = true;
         } else if(direction === 'right') {
            verticals[row][column] = true;
        } else if(direction === 'up') {
            horizontals[row - 1][column] = true;
        } else if(direction === 'down') {
           horizontals[row][column] = true;
       } 

       stepThroughCells(nextRow, nextColumn);
    }
 };

 stepThroughCells(startRow, startColumn);

 horizontals.forEach((row, rowIndex) => {
     row.forEach((open, columnIndex) => {
        if(open) {
            return;
        }

        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX / 2,
            rowIndex * unitLengthY + unitLengthY,
            unitLengthX,
            5,
            {
                label: 'wall',
                isStatic: true,
                render: {
                    fillStyle: 'orangered'
                }
            }
            );
            World.add(world, wall);
     });
 });

 verticals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
       if(open) {
           return;
       }

       const wall = Bodies.rectangle(
           columnIndex * unitLengthX + unitLengthX,
           rowIndex * unitLengthY + unitLengthY / 2,
           5,
           unitLengthY,
           {
                label: 'wall',
               isStatic: true, 
               render: {
                fillStyle: 'orangered'
            }
           }
           );
           World.add(world, wall);
    });
});









//GOAL
const goal = Bodies.rectangle(
    width - unitLengthX / 2,
    height - unitLengthY / 2,
    unitLengthX * .7,
    unitLengthY * .7,
    {
        label: 'goal',
        isStatic: true
        
    }
);
World.add(world, goal);


//BALL
const ballRadius = Math.min(unitLengthY, unitLengthX) / 4;
const ball = Bodies.circle(
    unitLengthX / 2,
    unitLengthY / 2,
    ballRadius,
    {
        label: 'ball'
    }
);
World.add(world, ball);

document.addEventListener('keydown' , event => {
    const { x, y } = ball.velocity;

    if (event.keyCode === 87) {
        Body.setVelocity(ball, { x, y: y -5 });
    }
    if (event.keyCode === 68) {
        Body.setVelocity(ball, { x: x + 5, y });
    }
    if (event.keyCode === 83) {
        Body.setVelocity(ball, { x, y: y +5 });
    }
    if (event.keyCode === 65) {
        Body.setVelocity(ball, { x: x - 5, y });
    }
});






//WIN CONDITION

Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach((collision) => {
        const labels = ['ball', 'goal'];

        if(labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label)) {
            document.querySelector('.winner').classList.remove('hidden');
            world.gravity.y = 1;
            world.bodies.forEach(body => {
                if(body.label === 'wall') {
                    Body.setStatic(body, false);
                }
            
            });
        }
    });
});
