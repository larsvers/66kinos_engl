

/* Globals */
/* ------- */

var vis = vis || {};

vis.dims;
vis.elements;
vis.sim;
vis.nodes;
vis.yScale;
vis.geo;
vis.maptools;
vis.state; // 'kino', 'stadt', 'datum', 'karte'
vis.player; 


/* Utlities */
/* -------- */

function type(d) {

  return {
    alphabet_kino: +d.alphabet_kino,
    alphabet_stadt: +d.alphabet_stadt,
    reihenfolge: +d.reihenfolge,
    datum: moment(d.datum),
    kino_name: d.kino_name,
    kino_name_escaped: d.kino_name_escaped,
    kino_strasse_nr: d.kino_strasse_nr,
    kino_plz: d.kino_plz,
    kino_stadt: d.kino_stadt,
    lon: +d.lon,
    lat: +d.lat,
    kino_tel: d.kino_tel,
    kino_url: d.kino_url,
    kino_url_hyper: d.kino_url_hyper,
    kino_info: d.kino_info,
    kino_map: d.kino_map,
    video_url: d.video_url,
    video_id: +d.video_id,
    image: d.image
  };

} // vis.type()

function getBoxModelValues(element) {

  var style = element.currentStyle || window.getComputedStyle(element);

  var margin = { top: parseFloat(style.marginTop), right: parseFloat(style.marginRight), bottom: parseFloat(style.marginBottom), left: parseFloat(style.marginLeft) };
  var padding = { top: parseFloat(style.paddingTop), right: parseFloat(style.paddingRight), bottom: parseFloat(style.paddingBottom), left: parseFloat(style.paddingLeft) };
  var border = { top: parseFloat(style.borderTopWidth), right: parseFloat(style.borderRightWidth), bottom: parseFloat(style.borderBottomWidth), left: parseFloat(style.borderLeftWidth) };
  var width = style.width.indexOf('vw') > -1 ? window.innnerWidth * parseInt(style.width, 10)/100 : style.width; // cater for vw and vh (issue with IE)
  var height = style.height.indexOf('vw') > -1 ? window.innnerHeight * parseInt(style.height, 10)/100 : style.height;

  return { width: width, height: height, margin: margin, padding: padding, border: border };

} // getBoxModelValues()

function showMap(show) {

  if (show) {
    d3.selectAll('.map').transition().duration(500).style('opacity', 1);
  } else {
    d3.selectAll('.map').transition().duration(500).style('opacity', 0);
  }

} // showMap()

function showCityFirst(show) {

  if (show) {
    d3.selectAll('.node-text').text(function(d) { return d.kino_stadt + ' ' + d.kino_name; });
  } else {
    d3.selectAll('.node-text').text(function(d) { return d.kino_name + ' ' + d.kino_stadt; });
  }

} // showCityFirst()

function showText(show, duration) {

  var dur = arguments.length < 2 ?  250 : duration;

  if (show) {
    d3.selectAll('.node-text').transition().duration(dur).style('opacity', 1);
  } else {
    d3.selectAll('.node-text').transition().duration(dur).style('opacity', 0);
  }

} // showText()

function showCircles(show) {

  if (show) {
    d3.selectAll('.node').transition().style('opacity', 1);
  } else {
    d3.selectAll('.node').transition().style('opacity', 0);
  }

} // showCircle()

function allowTextPointer(allow) {
 
  if (allow) {
    d3.selectAll('.node-text')
        .style('pointer-events', 'all')
        .style('cursor', 'pointer');
  } else {
    d3.selectAll('.node-text')
        .style('pointer-events', 'none')
        .style('cursor', 'default');
  }

} // allowTextPointer()

function allowNodePointer(allow) {
 
  if (allow) {
    d3.selectAll('.node')
        .style('pointer-events', 'all')
        .style('cursor', 'pointer');
  } else {
    d3.selectAll('.node')
        .style('pointer-events', 'none')
        .style('cursor', 'default');
  }

} // allowNodePointer()

function allowButtons(allow) {

  if (allow) {
    d3.selectAll('#controls button').style('pointer-events', 'all');
  } else {
    d3.selectAll('#controls button:not(#button-skip)').style('pointer-events', 'none');
  }

} // allowButtons()

function displaySkip(display) {

  if (display) {
    d3.select('#controls #button-skip').style('display', 'inherit');
  } else {
    d3.select('#controls #button-skip').style('display', 'none');
    // show the footer
    d3.select('#footer').transition().style('opacity', 1);

  }

} // displaySkip()

function highlightButton(selection) {

  d3.selectAll('#controls button').classed('highlight-button', false);
  selection.classed('highlight-button', true);

} // highlightButton()



/* Set up the visual */
/* ----------------- */

function setUpVisual() {

  var container = d3.select('#visual').node().getBoundingClientRect();

  var margin = { top: 30 , right: 30 , bottom: 30 , left: 30 },
      width = container.width - margin.left - margin.right,
      height = container.height - margin.top - margin.bottom;

  var svg = d3.select('#visual')
    .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', '0 0 ' + container.width + ' ' + container.height)
    .append('g').attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')') // to translate
    .append('g').attr('class', 'chart-g'); // to base zoom on a 0, 0 coordinate system

  // Add to global
  vis.dims = { width: width, height: height, margin: margin };
  vis.elements = { svg: svg };

} // setUpVisual()

function initialVisualLayout(nodes) {

  var radius = 3,
      padding = 2;

  var gNode = vis.elements.svg.append('g').attr('class', 'node-g');

  var nodeG = gNode.selectAll('node-group')
      .data(nodes)
    .enter().append('g')
      .attr('class', 'node-group')
      .attr('id', function(d) { return d.kino_name_escaped; })
      .attr('transform', function(d) { return 'translate(' + (vis.dims.width/2) + ', ' + (vis.dims.height/2) + ')'; } );

  nodeG.append('path')
    .attr('class', 'node')
    .attr('id', function(d) { return d.kino_name_escaped; })
    .attr('d', d3.symbol().type(d3.symbolTriangle).size(30))
    .attr('transform', 'rotate(180)')
    .style('opacity', 0);

  // nodeG.append('path')
  //   .attr('class', 'node')
  //   .attr('class', 'node inner')
  //   .attr('id', function(d) { return 'inner-' + d.kino_name_escaped; })
  //   .attr('d', d3.symbol().type(d3.symbolTriangle).size(5))
  //   .attr('transform', 'rotate(180)')
  //   .style('fill', '#fff')
  //   .style('opacity', 0)

  nodeG.append('text')
    .attr('class', 'node-text')
    .attr('id', function(d) { return 'text-' + d.kino_name_escaped; })
    .text(function(d) { return d.kino_name + ' ' + d.kino_stadt; })
    .attr('font-size', '0.7em')
    .attr('dx', '0.5em')
    .attr('dy', '0.35em')
    .style('opacity', 0);

  // calculate average text length to be used for positioning
  var textLengths = [];
  nodeG.nodes().forEach(function(el) {
    textLengths.push(el.getBBox().width);
  });

  vis.dims.meanText = d3.mean([d3.mean(textLengths), d3.max(textLengths)]);
  vis.dims.maxText = d3.max(textLengths);

  // Add to global
  vis.dims.radius = radius;
  vis.dims.padding = padding;
  vis.elements.nodeG = nodeG;

} // initialVisualLayout()

function initialSimulation(nodes) {

  showText(false);

  vis.sim = d3.forceSimulation(nodes)
      .force('charge', d3.forceManyBody().strength(-5))
      .force('center', d3.forceCenter(vis.dims.width/2, vis.dims.height/2))
      .force('collide', d3.forceCollide(vis.dims.radius + vis.dims.padding))
      .on('tick', tick);

  function tick() {

    vis.elements.nodeG.attr('transform', function(d) { return 'translate(' + d.x + ', ' + d.y + ')'; } );

  } // tick()

} // initialSimulation()



/* Set up the map */
/* -------------- */

function setupMap(geoOutline, geoCountries) {

  // Data prep
  var germanyOutline = topojson.feature(geoOutline, geoOutline.objects['d-01']); // Convert TopoJSON to GeoJSON
  var germanyCountries = topojson.feature(geoCountries, geoCountries.objects['deutschland-bl']); // Convert TopoJSON to GeoJSON

  vis.geo = { outline: germanyOutline, countries: germanyCountries };

  // Projection
  var projection = d3.geoConicEqualArea()
      .parallels([48, 54])
      .fitExtent([[vis.dims.margin.left, vis.dims.margin.top], [vis.dims.width, vis.dims.height*0.95]], vis.geo.outline); // just a little leeway for the text at the bottom

  // Path generator
  var path = d3.geoPath()
      .projection(projection);

  // Add to global
  vis.maptools = { projection: projection, path: path };

} // setupMap()

function drawMap() {

  var gMap = vis.elements.svg.insert('g', ':first-child').attr('class', 'map-g');

  // countries
  gMap.selectAll('.map')
      .data(vis.geo.countries.features)
    .enter().append('path')
      .attr('class', 'map country')
      .attr('d', vis.maptools.path)
      .style('opacity', 0);

  // outline
  gMap.selectAll('.outline')
      .data(vis.geo.outline.features)
    .enter().append('path')
      .attr('class', 'map outline')
      .attr('d', vis.maptools.path)
      .style('opacity', 0);

} // drawMap()



/* Recalculate positions */
/* --------------------- */

function nodesAlphabeticalCinema(nodes) {

  // Prep finding x
  var l = nodes.length;
  var elementLength = vis.dims.maxText + vis.dims.radius + vis.dims.padding * 15; // padding factor found through try-out

  // Prep finding y
  var mid = Math.ceil(l/2);

  var newNodes = nodes.map(function(el, i) {

    // Finding x and y
    var xPos = +nodes[i].alphabet_kino < l/2 ? vis.dims.width * 0.56 - elementLength : vis.dims.width * 0.56; // width multiplicator found through try-out
    var yPos = +nodes[i].alphabet_kino % mid;

    nodes[i].alphabeticalCinX = xPos;
    nodes[i].alphabeticalCinY = vis.yScale(yPos);

    return nodes[i];

  });

  return newNodes;

} // nodesAlphabeticalCinema()

function nodesAlphabeticalCity(nodes) {

  // Prep finding x
  var l = nodes.length;
  var elementLength = vis.dims.maxText + vis.dims.radius + vis.dims.padding * 15;

  // Prep finding y
  var mid = Math.ceil(l/2);

  var newNodes = nodes.map(function(el, i) {

    // Finding x and y
    var xPos = +nodes[i].alphabet_stadt < l/2 ? vis.dims.width * 0.56 - elementLength : vis.dims.width * 0.56;
    var yPos = +nodes[i].alphabet_stadt % mid;

    nodes[i].alphabeticalCityX = xPos;
    nodes[i].alphabeticalCityY = vis.yScale(yPos);

    return nodes[i];

  });

  return newNodes;

} // nodesAlphabeticalCity()

function nodesVisitingOrder(nodes) {

  // Prep finding x
  var l = nodes.length;
  var elementLength = vis.dims.maxText + vis.dims.radius + vis.dims.padding * 15;

  // Prep finding y
  var mid = Math.ceil(l/2);

  var newNodes = nodes.map(function(el, i) {

    // Finding x and y
    var xPos = +nodes[i].reihenfolge < l/2 ? vis.dims.width * 0.56 - elementLength : vis.dims.width * 0.56;
    var yPos = +nodes[i].reihenfolge % mid;

    nodes[i].visitingX = xPos;
    nodes[i].visitingY = vis.yScale(yPos);

    return nodes[i];

  });

  return newNodes;

} // nodesVisitingOrder()



/* Reposition */
/* ---------- */

function positionAlphabeticalCinema() {

  showMap(false);
  showCityFirst(false);
  showText(true);
  allowTextPointer(true);
  highlightButton(d3.select('#button-cinema'));
  vis.state = 'kino';

  vis.sim.stop();

  vis.sim
      .force('center', null)
      .force('collide', null)
      .force('xPos', d3.forceX(function(d) { return d.alphabeticalCinX; }).strength(0.5))
      .force('yPos', d3.forceY(function(d) { return d.alphabeticalCinY; }).strength(0.5));

  vis.sim.alpha(0.5).restart();

} // positionAlphabeticalCinema()

function positionAlphabeticalCity() {

  showMap(false);
  showCityFirst(true);
  showText(true);
  allowTextPointer(true);
  highlightButton(d3.select('#button-city'));
  vis.state = 'stadt';

  vis.sim.stop();

  vis.sim
      .force('center', null)
      .force('collide', null)
      .force('xPos', d3.forceX(function(d) { return d.alphabeticalCityX; }).strength(0.5))
      .force('yPos', d3.forceY(function(d) { return d.alphabeticalCityY; }).strength(0.5));

  vis.sim.alpha(0.5).restart();

} // positionAlphabeticalCity()

function positionVisitingOrder() {

  showMap(false);
  showCityFirst(true);
  showText(true);
  allowTextPointer(true);
  highlightButton(d3.select('#button-date'));
  vis.state = 'datum';

  vis.sim.stop();

  vis.sim
      // .velocityDecay(0.1)
      // .alphaDecay(0)
      // .force('charge', d3.forceManyBody().strength(-5))
      .force('center', null)
      .force('collide', null)
      .force('xPos', d3.forceX(function(d) { return d.visitingX; }).strength(0.5))
      .force('yPos', d3.forceY(function(d) { return d.visitingY; }).strength(0.5));

  vis.sim.alpha(0.5).restart();

} // positionVisitingOrder()


function transitionLocation() {

  // Here we first transition and since some dots overlap, 
  // we will switch on the force post transition.

  showMap(true);
  showCityFirst(true);
  showText(true);
  allowTextPointer(false);
  highlightButton(d3.select('#button-map'));
  vis.state = 'karte';

  vis.sim.stop();

  d3.selectAll('.node-group')
    .transition().style('opacity', 0.4)
    .transition().duration(500).delay(function(d) { return d.reihenfolge * 100; })
      .style('opacity', 1)
      .attr('transform', function(d) { 
        
        // set x and y to map location so we can force-simulate 
        // after the transition without a jump
        d.x = vis.maptools.projection([d.lon, d.lat])[0];
        d.y = vis.maptools.projection([d.lon, d.lat])[1];

        return 'translate(' + d.x + ', ' + d.y + ')'; 

      })
      .on('end', function(d, i) {

        // switch on the force simulation after the last element's transition
        if (i === vis.nodes.length-1) { positionLocation(); }

      });

} // transitionLocation()

function positionLocation() {

  showMap(true);
  showCityFirst(true);
  showText(false, 1000);
  allowTextPointer(false);
  highlightButton(d3.select('#button-map'));
  vis.state = 'karte';

  vis.sim.stop();

  vis.sim
      // .velocityDecay(0.1)
      // .alphaDecay(0)
      // .force('charge', d3.forceManyBody().strength(-5))
      .force('center', null)
      .force('collide', null)
      .force('xPos', d3.forceX(function(d) { return vis.maptools.projection([d.lon, d.lat])[0]; }).strength(0.5))
      .force('yPos', d3.forceY(function(d) { return vis.maptools.projection([d.lon, d.lat])[1]; }).strength(0.5));

  vis.sim.alpha(0.5).restart();

} // positionLocation()

function setText(text, position, dur, large) {

  if (arguments.length < 4) { large = false; }

  // Update
  var textNode = d3.select('.text-g').selectAll('.intro-text')
    .data(text, function(d) { return d; });

  // Enter
  textNode.enter()
    .append('text')
    .merge(textNode)
      .text(function(d) { return d; })
      .attr('class', 'intro-text')
      .classed('large', large)
      .attr('x', position.x)
      .attr('y', position.y)
      .attr('dy', '1em')
      .attr('text-anchor', position.anchor)
      .style('fill-opacity', 1e-6)
    .transition().duration(dur)
      .style('fill-opacity', 1);

  // Exit
  textNode.exit()
    .transition().duration(dur)
      .style('fill-opacity', 0)
      .remove();

} // setText()



/* Player control */
/* -------------- */

function setPlayer(id) {

  // need to remove the player div before creating a new player (god knows why)
  // there's the loadVideao method, which failed to work in specific cases.
  d3.select('#vimeo-player').remove();
  d3.select('#context').insert('div', '#cinema-info').attr('id', 'vimeo-player');

  // calculate player width
  var dims = getBoxModelValues(d3.select('#context').node());
  var videoWidth = Math.floor(parseInt(dims.width, 10) * 0.9);

  // define options
  var options = {
    id: id,
    width: videoWidth,
    autoplay: true
  };

  // instantiate player
  vis.player = new Vimeo.Player('vimeo-player', options);

  // set volume
  vis.player.setVolume(5);

} // setPlayer()



/* Element handler */
/* --------------- */

function circleOver(d) {

  d3.select(this).call(transRotate, '90');

  if (vis.state === 'karte') { 
    d3.select('.node-text#text-' + d.kino_name_escaped).call(transOpacity, 1);
  } else {
    d3.select('.node-text#text-' + d.kino_name_escaped).call(transPosition, '0.8em');
  }

} // circleOver()

function circleDown(d) {

  // hide the info
  d3.selectAll('#cinema-info').style('opacity', 0);

  // header at once
  d3.select('#cinema-name').html(d.kino_name);
  d3.select('#cinema-city').html(d.kino_stadt);
  
  // load video
  setPlayer(d.video_id);

  // info when player ready
  vis.player.ready().then(function() {

    d3.selectAll('#cinema-info').transition().style('opacity', 1);

    d3.select('#cinema-info-text').html(d.kino_info);
    d3.select('#cinema-info-adress').html(d.kino_strasse_nr + '<br>' + d.kino_plz + ' ' + d.kino_stadt + '<br>' + '<a href="tel:' + d.kino_tel + '">' + d.kino_tel + '</a>');

    d3.select('#cinema-info-link a').attr('href', d.kino_url).html('link');
    d3.select('#cinema-map-link a').attr('href', d.kino_map).html('map');

  }); // player.ready()

} // circleDown()

function circleOut(d) {

  d3.select(this).call(transRotate, '180');

  if (vis.state === 'karte') { 
    d3.select('.node-text#text-' + d.kino_name_escaped).call(transOpacity, 0);
  } else {
    d3.select('.node-text#text-' + d.kino_name_escaped).call(transPosition, '0.5em');
  }

} // circleOver()


function textOver(d) {

  d3.select('.node#' + d.kino_name_escaped).call(transRotate, '90');
  d3.select(this).call(transPosition, '0.8em');

} // textOver()

function textDown(d) {

  // hide the info
  d3.selectAll('#cinema-info').style('opacity', 0);

  // header at once
  d3.select('#cinema-name').html(d.kino_name);
  d3.select('#cinema-city').html(d.kino_stadt);
  
  // load video
  setPlayer(d.video_id);

  // info when player ready
  vis.player.ready().then(function() {

    d3.selectAll('#cinema-info').transition().style('opacity', 1);

    d3.select('#cinema-info-text').html(d.kino_info);

    var infoHtml = 
      (d.kino_strasse_nr !== 'NA' ? d.kino_strasse_nr + '<br>' : '') +
      (d.kino_plz !== 'NA' ? d.kino_plz + ' ' : '') +
      (d.kino_stadt !== 'NA' ? d.kino_stadt + '<br>' : '') +
      (d.kino_tel !== 'NA' ? '<a href="tel:' + d.kino_tel + '">' + d.kino_tel + '</a>' : '');

    d3.select('#cinema-info-adress').html(infoHtml);
      // .html(d.kino_strasse_nr + '<br>' + d.kino_plz + ' ' + d.kino_stadt + '<br>' + '<a href="tel:' + d.kino_tel + '">' + d.kino_tel + '</a>');
      

    if (d.kino_url !== 'NA') { d3.select('#cinema-info-link a').attr('href', d.kino_url).html('link'); }
    if (d.kino_map !== 'NA') { d3.select('#cinema-map-link a').attr('href', d.kino_map).html('map'); }

  }); // player.ready()

} // textDown()

function textOut(d) {

  d3.select('.node#' + d.kino_name_escaped).call(transRotate, '180');
  d3.select(this).call(transPosition, '0.5em');

} // textOut()


// Named transitions

function transRotate(sel, degree) {
  sel.transition().duration(100).attr('transform', 'rotate(' + degree + ')');
}

function transPosition(sel, delta) {
  sel.transition().duration(100).attr('dx', delta);
}

function transOpacity(sel, value) {
  sel.transition().duration(100).style('opacity', value);
}



/* Intro story */
/* ----------- */

var timers = [];

function story() {

  // Disallow button interaction and highlight skip button
  allowButtons(false);
  highlightButton(d3.select('#button-skip'));

  // Disallow node interaction
  allowNodePointer(false);
  allowTextPointer(false);

  // Add text group element
  d3.select('.chart-g').insert('g', ':first-child').attr('class', 'text-g');

  // Init scoped variables
  var position, text, dur;


  // Intro text

  text = [''];
  position = { x: vis.dims.width/2, y: vis.dims.height/2, anchor: 'middle' };
  dur = 1000;
  setText(text, position, dur);

  timers[0] = d3.timeout(function() { 
    text = ['From October 2014 to February 2016'];
    setText(text, position, dur, true);
  }, dur * 2);

  timers[1] = d3.timeout(function() { 
    text = ['I\'ve visited over 66 cinemas'];
    setText(text, position, dur, true); 
  }, dur * 5);

  timers[2] = d3.timeout(function() { 
    text = ['and filmed the story of the cinemas and their makers.'];
    setText(text, position, dur, true);
  }, dur * 8);

  timers[3] = d3.timeout(function() { 
    text = [];
    setText(text, position, dur);
  }, dur * 11);

  timers[4] = d3.timeout(function() { 
    text = ['I documented the journey in my film 66KINOS,'];
    setText(text, position, dur, true);
  }, dur * 12);

  timers[5] = d3.timeout(function() { 
    text = ['which tells many stories...'];
    setText(text, position, dur, true);
  }, dur * 15);


  timers[6] = d3.timeout(function() { 
    text = ['... one for each cinema:'];
    setText(text, position, dur, true);
  }, dur * 18);

  timers[7] = d3.timeout(function() { 
    text = [];
    setText(text, position, dur * 2);
  }, dur * 21.5);

  // Set and kick off the initial simulation

  timers[8] = d3.timeout(function() { 
    showCircles(true);
    initialSimulation(vis.nodes);
  }, dur * 23);

  // Sortings and map

  timers[9] = d3.timeout(function() { 
    text = ['Each triangle represents a cinema.'];
    position = { x: vis.dims.width/2, y: -15, anchor: 'middle' };
    setText(text, position, dur);
  }, dur * 26.5);

  timers[10] = d3.timeout(function() { 
    text = ['You can sort them by cinema name...'];
    setText(text, position, dur);
  }, dur * 28.5);

  timers[11] = d3.timeout(positionAlphabeticalCinema, dur * 29.5);

  timers[12] = d3.timeout(function() { 
    text = ['... by city...'];
    setText(text, position, dur);
  }, dur * 31);

  timers[13] = d3.timeout(positionAlphabeticalCity, dur * 32);

  timers[14] = d3.timeout(function() { 
    text = ['... by the order of my visits...'];
    setText(text, position, dur);
  }, dur * 33);

  timers[15] = d3.timeout(positionVisitingOrder, dur * 34);

  timers[16] = d3.timeout(function() { 
    text = ['... or you can find it on a map.'];
    setText(text, position, dur);
  }, dur * 36);

  timers[17] = d3.timeout(transitionLocation, dur * 37);

  timers[18] = d3.timeout(function() { 
    position = { x: vis.dims.width/2, y: vis.dims.height, anchor: 'middle' };
    text = ['Click on a cinema and watch its story'];
    setText(text, position, dur);

    // Allow button interaction and remove skip button
    allowButtons(true);
    displaySkip(false);

    // Allow node interaction
    allowNodePointer(true);

  }, dur * 46);

} // story()

function cancelStory() {

  // Allow button interaction and remove skip button
  allowButtons(true);
  displaySkip(false);

  // Allow node interaction
  allowNodePointer(true);
  allowTextPointer(true);

  // stop the story and potential text transitions
  timers.forEach(function(el) { el.stop(); }); // clear out all timers 
  d3.select('g.chart-g').selectAll('*').interrupt(); // interrupt all transitions

  // update the text
  var text = ['Klick auf ein Kino und schau Dir seine Geschichte an'];
  var position = { x: vis.dims.width/2, y: vis.dims.height, anchor: 'middle' };
  setText(text, position, 1000);
  
  // move to map
  if (!vis.sim) {
    showCircles(true);
    initialSimulation(vis.nodes);    
  }
  positionLocation();

  // show the footer
  d3.select('#footer').transition().style('opacity', 1);

} // cancelStory()



/* Sequence run */
/* ------------ */

function ready(error, data, gerOutline, gerCountries) {
  if (error) throw error;
  
  console.log({data: data, gerOutline: gerOutline, gerCountries: gerCountries});

  
  /* Sequence */
  /* -------- */

  // Global data
  vis.nodes = data;

  // Set up and get visual variables
  setUpVisual();

  // Set the initial node layout
  initialVisualLayout(vis.nodes);

  // Set up the map
  setupMap(gerOutline, gerCountries);

  // Draw the map
  drawMap();

  // Calculate y scale for positioning (pull the lower end up a little to leave space for the text)
  vis.yScale = d3.scaleLinear().domain([0, Math.ceil(vis.nodes.length/2)]).range([vis.dims.height*0.05, vis.dims.height*0.85]);

  // Calculate and augment positions
  vis.nodes = nodesAlphabeticalCinema(vis.nodes);
  vis.nodes = nodesAlphabeticalCity(vis.nodes);
  vis.nodes = nodesVisitingOrder(vis.nodes);

  // play intro
  story();


  /* Interactivity elements */
  /* ---------------------- */

  // Zoom
  var zoom = d3.zoom().scaleExtent([0.75, 2.5]).on('zoom', zoomed);
  d3.select('#visual svg').call(zoom);


  // circles
  d3.selectAll('.node').on('mouseover', circleOver);
  d3.selectAll('.node').on('mousedown', circleDown);
  d3.selectAll('.node').on('mouseout', circleOut);
  d3.selectAll('.node-text').on('mouseover', textOver);
  d3.selectAll('.node-text').on('mousedown', textDown);
  d3.selectAll('.node-text').on('mouseout', textOut);

} // ready()



/* Interactivity buttons */
/* --------------------- */

d3.select('button#button-cinema').on('mousedown', positionAlphabeticalCinema);
d3.select('button#button-city').on('mousedown', positionAlphabeticalCity);
d3.select('button#button-date').on('mousedown', positionVisitingOrder);
d3.select('button#button-map').on('mousedown', positionLocation);
d3.select('button#button-skip').on('mousedown', cancelStory);



/* Zoom */
/* ---- */

function zoomed() {

  var transform = d3.event.transform;

  d3.select('.chart-g').attr('transform', transform.toString());

} // zoomed()



/* Data load */
/* --------- */

d3.queue()
    .defer(d3.csv, '../data/66kinos_data_v6.csv', type)
    .defer(d3.json, '../data/d-04-simple.json') 
    .defer(d3.json, '../data/d-bl-04-simple.json') // toposimplify -s 0.0000009 -f < deutschland-bl-topo-quant.json > output.json
    .await(ready);

