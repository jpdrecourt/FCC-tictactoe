// Start of Tic Tac Toe JS
'use strict;'

/* Imperfect circle of base radius 1 using 4 cubic Bezier curves.
From http://bl.ocks.org/patricksurry/11087975
Parameters:
dR: The maximum multiplying factor for the radius per quarter turn
thetaStart: The angle where the drawing starts
dTheta: The maximum overshoot/undershoot angle per quarter turn (in radians)
squashAngle: The angle at which the circle will be squashed or expanded (in radians)
squashFactor: The squashing factor
Returns:
The d attribute of an SVG path
*/
function imperfectCirclePath(dR, thetaStart, dTheta, squashAngle, squashFactor) {
  let c = 0.551915024494,
      beta = Math.atan(c),
      d = Math.sqrt(c * c + 1 * 1),
      r = 1,
      theta = thetaStart,
      path = 'M',
      randomFn = Math.random;

  // Move to origin
  path += [r * Math.sin(theta), r * Math.cos(theta)];
  // Control point P1
  path += 'C' + [d * r * Math.sin(theta + beta), d * r * Math.cos(theta + beta)];

  // For each quarter turn
  for (let i = 0; i < 4; i++) {
    // Angle overshoot/undershoot
    theta += Math.PI / 2 * (1 + randomFn() * dTheta);
    // Radius overshoot/undershoot
    r *= (1 + randomFn() * dR);
    // Control point P2
    path += ' ' + (i ? 'S' : '') + [d * r * Math.sin(theta - beta),
                                    d * r * Math.cos(theta - beta)];
    // Control point P3
    path += ' ' + [r * Math.sin(theta), r * Math.cos(theta)];
  }
  return path;
}

/* Squash or expand a shape at a given angle (in radians)
Returns: The transoform attribute for the SVG */
function scaleAtAngle(ratio, angle) {
  angle *= 180 / Math.PI;
  return 'rotate(' + angle + ') '
          + 'scale(1, ' + ratio + ')'
          + 'rotate(' + (-angle) + ')';
}

$(document).ready(function() {
  let svg = d3.select("#circle0");
  svg.append('path')
    .attr('width', 3)
    .attr('height', 3)
    .attr('stroke', 'white')
    .attr('stroke-width', '0.1')
    .attr('d', function() {
      return imperfectCirclePath(0.05, 2*Math.PI*Math.random(), 0.3, 0, 0);})
    .attr('transform', function() {
      return scaleAtAngle(0.9, Math.PI*Math.random());});
});
