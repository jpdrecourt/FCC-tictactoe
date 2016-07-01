// Start of Tic Tac Toe JS
'use strict';

/* Imperfect circle using 4 cubic Bezier curves
Inspired by http://bl.ocks.org/patricksurry/11087975
Constructor parameter:
  x, y: Coordinates of the circle (default to 0)
  r: radius of the circle (default to 1)
*/
class ImperfectCirclePath {
  // TODO Animation
  constructor(x = 0, y = 0, r = 1) {
    this._x = x;
    this._y = y;
    this._r = r;
    this._dR = 0.05;
    this._thetaStart = 2 * Math.PI * Math.random();
    this._dTheta = 0.2;
    this._ratio = 0.9;
    this._angle = Math.PI * Math.random();
    this._path = undefined;
  }
  get x() {return this._x;}
  get y() {return this._y;}
  get r() {return this._y;}
  get path() {return this._path;}

  /* Appends the path to a d3 svg selector an returns that path*/
  addPathToSvg(svg) {
    if (this._path !== undefined) {
      throw("Error: Path already added to an svg");
    }
    this._path = svg.append('path')
      .attr('d', this._imperfectCirclePath())
      .attr('transform', this._transformPath());
    return this._path;
  }

  _imperfectCirclePath() {
    const c = 0.551915024494,
      beta = Math.atan(c),
      d = Math.sqrt(c * c + 1 * 1);
    let r = 1,
      theta = this._thetaStart,
      path = 'M',
      randomFn = Math.random;

    // Move to P0
    path += [r * Math.sin(theta), r * Math.cos(theta)];
    // Control point P1
    path += ' C' + [d * r * Math.sin(theta + beta), d * r * Math.cos(theta + beta)];

    // For each quarter turn
    for (let i = 0; i < 4; i++) {
      // Angle overshoot/undershoot
      theta += Math.PI / 2 * (1 + randomFn() * this._dTheta);
      // Radius overshoot/undershoot
      r *= (1 + randomFn() * this._dR);
      // Control point P2
      path += ' ' + (i ? 'S' : '') + [d * r * Math.sin(theta - beta),
        d * r * Math.cos(theta - beta)
      ];
      // Control point P3
      path += ' ' + [r * Math.sin(theta), r * Math.cos(theta)];
    }
    return path;
  }

  _transformPath() {
    let angle = this._angle * 180 / Math.PI;
    return `translate(${this._x}, ${this._y}) rotate(${angle}) scale(1, ${this._ratio}) rotate(-${angle})`;
  }
}

/* Imperfect line using a cubic bezier curves
Constructor parameter:
 x0, y0: Coordinates of the origin (default to [0, 0])
 x0, y0: Coordinates of the end (default to [1, 0])
*/
class ImperfectLinePath {
  // TODO Animation
  constructor (x0=0, y0=0, x1=1, y1=0) {
    this._x0 = x0;
    this._y0 = y0;
    this._x1 = x1;
    this._y1 = y1;
    this._startAngle = 0.1 + this._rndSign() * 0.1 * Math.random();
    this._endAngle = 0.1 + this._rndSign() * 0.1 * Math.random();
    this._xMid = -0.2 + 0.2 * Math.random();
    this._path = undefined;
  }

  get x0() {return this._x0;}
  get y0() {return this._y0;}
  get x1() {return this._x1;}
  get y1() {return this._y1;}
  get path() {return this._path;}

  /* Appends the path to a d3 svg selector and returns the path */
  addPathToSvg(svg) {
    if (this._path !== undefined) {
      throw("Error: Path already added to an svg");
    }
    this._path = svg.append('path')
      .attr('d', this._imperfectLine())
      .attr('transform', this._transformPath());
    return this._path;
  }

  /* Imperfect horizontal line from [-1,0] to [1,0]
  Parameters: start and end angles in radians
  Return: d attribute of SVG path */
  _imperfectLine() {
    let path = 'M-1,0 C'; // The line starts at [-1, 0]
    // Control point P1
    path += [this._xMid, (1 + this._xMid) * Math.tan(this._startAngle)];
    // Control point P2
    path += ' ' + [this._xMid, (1 - this._xMid) * Math.tan(this._endAngle)];
    // Control point P3
    path += ' ' + [1, 0];
    return path;
  }

  _transformPath() {
    let length = Math.sqrt((this._x0 - this._x1) * (this._x0 - this._x1) + (this._y0 - this._y1) * (this._y0 - this._y1)),
      angle = Math.acos((this._x1 - this._x0) / length) * 180 / Math.PI;
    return ` translate (${0.5 * (this._x0 + this._x1)}, ${0.5 * (this._y0 + this._y1)}) rotate (${angle}) scale(${length / 2}, 1)`;
  }

  /* Return a positive or a negative sign */
  _rndSign () {
    return Math.random() < 0.5 ? -1 : 1;
  }
}

/* Creates a cross - Default in square centered on 0 and of size 2
Constructor parameters: center and size of the bounding square */
class ImperfectCrossPath {
  constructor(x = 0, y = 0, size = 2) {
    this._lines = [];
    /* Left to right line */
    this._lines[0] = new ImperfectLinePath(x - size/2, y - size/2, x + size/2, y + size/2);
    this._lines[1] = new ImperfectLinePath(x + size/2, y + size/2, x - size/2, y - size/2);
    this._path = undefined;
  }

  get path() {return this._path;}

  addPathToSvg(svg) {
    if (this._path !== undefined) {
      throw("Error: Path already added to an svg");
    }
    this._path = [];
    for (let i = 0; i < this._lines.length; i++){
      this._path[i] = this._lines[i].addPathToSvg(svg);
    }
    return this._path;
  }
}

class Player {
  constructor () {
  }
}

class HumanPlayer extends Player {
  constructor() {
    super();
  }
}

class ComputerPlayer extends Player {
  constructor() {
    super();
  }
}

/* Class dealing with the display of the Tic Tac Toe board */
class TicTacToeBoard {
  constructor() {
    this._board = {};
    this.svg = d3.select('#board');
    let viewBox = this.svg.attr('viewBox').split(' ').map(Number);
    this._board.topCorner = viewBox[0];
    this._board.bottomCorner = viewBox[2] + this._board.topCorner;
    this._board.boxWidth = (this._board.bottomCorner - this._board.topCorner) / 3;
    this._isCross = true; // Cross plays first

    this._initBoard();
  }

  _initBoard() {
    this._eraseBoard();
    this._displayGrid();
  }

  _eraseBoard() {

  }

  _displayGrid() {
    let firstLine = this._board.topCorner + this._board.boxWidth,
      secondLine = firstLine + this._board.boxWidth;
    this._board.lines = [];
    this._board.lines[0] = new ImperfectLinePath(this._board.topCorner, firstLine, this._board.bottomCorner, firstLine);
    this._board.lines[1] = new ImperfectLinePath(this._board.topCorner, secondLine, this._board.bottomCorner, secondLine);
    this._board.lines[2] = new ImperfectLinePath(firstLine, this._board.topCorner, firstLine, this._board.bottomCorner);
    this._board.lines[3] = new ImperfectLinePath(secondLine, this._board.topCorner, secondLine, this._board.bottomCorner);

    this.svg.append('rect')
      .attr('x', -4.5)
      .attr('y', -4.5)
      .attr('width', 9)
      .attr('height', 9)
      .attr('fill', 'none')
      .attr('stroke', 'red')
      .attr('stroke-width', 0.01);
    for (let i = 0; i < this._board.lines.length; i++) {
      this._chalkify(this._board.lines[i].addPathToSvg(this.svg));
    }
  }

  /* Displays a nought at the x,y location */
  _displayNought(x, y) {
    let n = new ImperfectCirclePath(x, y);
    this._chalkify(n.addPathToSvg(this.svg));
    return n;
  }
  /* Displays a cross at the x,y location */
  _displayCross(x, y) {
    let c = new ImperfectCrossPath(x, y);
    c.addPathToSvg(this.svg);
    for (let i = 0; i < c.path.length; i++) {
      this._chalkify(c.path[i]);
    }
    return c;
  }


  /* Play a nought or a cross at a given line and column (0 indexed)*/
  play(xClicked, yClicked) {
    let x = this._centerSymbol(xClicked),
      y = this._centerSymbol(yClicked);
    if (this._isCross) {
      this._displayCross(x, y);
    } else {
      this._displayNought(x, y);
    }

    this._isCross = !this._isCross;
  }

  _chalkify(path) {
    path.attr('filter', 'url(#chalkTexture)')
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-width', '0.1');
    return path;
  }

  _centerSymbol(v) {
    return ((Math.floor((v - this._board.topCorner) / this._board.boxWidth) + 0.5) * this._board.boxWidth) + this._board.topCorner;
  }
}

class TicTacToeGame {
  constructor() {
    this._game = new TicTacToeBoard();
    this._played = [['', '', ''], ['', '', ''], ['', '', '']];
    this._isWon = false;
    this._player = [];
    this._player[0] = new HumanPlayer();
    this._player[1] = new HumanPlayer();
    this._currentPlayer = 0;
    this._game.svg.on("click", () =>  {this._game.play(...d3.mouse(this._game.svg.node()));});
  }
}

let app = new TicTacToeGame();
