// Start of Tic Tac Toe JS
'use strict;'

/* Imperfect circle of base radius 1 using 4 cubic Bezier curves.
From http://bl.ocks.org/patricksurry/11087975
Parameters:
dR: The maximum multiplying factor for the radius per quarter turn
thetaStart: The angle where the drawing starts
dTheta: The maximum overshoot/undershoot angle per quarter turn (in radians)
Returns:
The d attribute of an SVG path
*/
function imperfectCirclePath(dR, thetaStart, dTheta) {
  let c = 0.551915024494,
      beta = Math.atan(c),
      d = Math.sqrt(c * c + 1 * 1),
      r = 1,
      theta = thetaStart,
      path = 'M',
      randomFn = Math.random;

  // Move to P0
  path += [r * Math.sin(theta), r * Math.cos(theta)];
  // Control point P1
  path += ' C' + [d * r * Math.sin(theta + beta), d * r * Math.cos(theta + beta)];

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

/* Imperfect horizontal line from [-1,0] to [1,0]
Parameters: start and end angles in radians
Return: d attribute of SVG path */
function imperfectLine(startAngle, endAngle) {
  let xMid = -0.2 + 0.4*Math.random(),
    path = 'M-1,0 C'; // The line starts at (0, 0)

  // Control point P1
  path += [xMid, (1 + xMid) * Math.tan(startAngle)];
  // Control point P2
  path += ' ' + [xMid, (1 - xMid) * Math.tan(endAngle)];
  // Control point P3
  path += ' ' + [1, 0];

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

function rndSign() {
  return (Math.random() >= 0.5 ? 1 : -1);
}


$(document).ready(function() {
  let svg = d3.select("#circle0"),
    angle1 = 30 + 30*Math.random();
    angle2 = -30 - 30*Math.random();
  // Circle
  svg.append('path')
    .attr('fill', 'none')
    .attr('stroke', 'white')
    .attr('stroke-width', '0.1')
    .attr('d', function() {
      return imperfectCirclePath(0.05, 2*Math.PI*Math.random(), 0.2, 0, 0);})
    .attr('transform', function() {
      return scaleAtAngle(0.9, Math.PI*Math.random());})
    .attr('filter', 'url(#chalkTexture)');
  svg.append('path')
    .attr('fill', 'none')
    .attr('stroke', 'white')
    .attr('stroke-width', '0.1')
    .attr('d', function(){
      return imperfectLine(rndSign() * (0.1 + 0.1 * Math.random()) ,
                          rndSign() * (0.1 + 0.1 * Math.random()));})
    .attr('transform', 'rotate(' + angle1 + ') scale(1.414)')
    .attr('filter', 'url(#chalkTexture)');
  svg.append('path')
    .attr('fill', 'none')
    .attr('stroke', 'white')
    .attr('stroke-width', '0.1')
    .attr('d', function(){
      return imperfectLine(rndSign() * (0.1 + 0.1 * Math.random()) ,
                          rndSign() * (0.1 + 0.1 * Math.random()));})
    .attr('transform', 'rotate(' + angle2 + ') scale(1.414)')
    .attr('filter', 'url(#chalkTexture)');
  // Horizontal game lines
  for (let i=0; i < 4; i++) {
    svg.append('path')
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-width', '0.2')
      .attr('d', function(){
        return imperfectLine(rndSign() * (0.1 + 0.1 * Math.random()) ,
                            rndSign() * (0.1 + 0.1 * Math.random()));})
      .attr('transform', 'rotate(' + (i < 2 ? 0 : 90) + ') translate(0,' + (i % 2 ? 1.5 : -1.5) + ') scale(4.5, 1)')
      .attr('filter', 'url(#chalkTexture)');
  }
});
