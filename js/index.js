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

class TicTacToe {
  constructor(params) {
    this._board = [];
    this._svg = d3.select('#board');
    this._initGame();

    this._svg.on('click', () => {
      console.log(d3.mouse(this._svg.node()));
    });

  }

  _initGame() {
    this._eraseBoard();
    this._displayGrid();
  }

  _eraseBoard() {

  }

  _displayGrid() {
    this._board[0] = new ImperfectLinePath(-4.5, 1.5, 4.5, 1.5);
    this._board[1] = new ImperfectLinePath(-4.5, -1.5, 4.5, -1.5);
    this._board[2] = new ImperfectLinePath(-1.5, 4.5, -1.5, -4.5);
    this._board[3] = new ImperfectLinePath(1.5, 4.5, 1.5, -4.5);
    this._svg.append('rect')
      .attr('x', -4.5)
      .attr('y', -4.5)
      .attr('width', 9)
      .attr('height', 9)
      .attr('fill', 'none')
      .attr('stroke', 'red')
      .attr('stroke-width', 0.01);
    for (let i = 0; i < this._board.length; i++) {
      this._chalkify(this._board[i].addPathToSvg(this._svg));
    }
  }

  _chalkify(path) {
    path.attr('filter', 'url(#chalkTexture)')
    .attr('fill', 'none')
    .attr('stroke', 'white')
    .attr('stroke-width', '0.1');
    return path;
  }
}

let app = new TicTacToe();
