;(function(){
'use strict';

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    throwError()
    return
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  function throwError () {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.exts = [
    '',
    '.js',
    '.json',
    '/index.js',
    '/index.json'
 ];

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  for (var i = 0; i < 5; i++) {
    var fullPath = path + require.exts[i];
    if (require.modules.hasOwnProperty(fullPath)) return fullPath;
    if (require.aliases.hasOwnProperty(fullPath)) return require.aliases[fullPath];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {

  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' === path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }
  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throwError()
    return
  }
  require.aliases[to] = from;

  function throwError () {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' === c) return path.slice(1);
    if ('.' === c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = segs.length;
    while (i--) {
      if (segs[i] === 'deps') {
        break;
      }
    }
    path = segs.slice(0, i + 2).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("_2048/_2048.js", function(exports, require, module){
// new2048.js // http://labs.rampinteractive.co.uk/touchSwipe/demos/Basic_swipe.html
var max=localStorage.getItem('max2048')||0; max=parseInt(max); // 讀取 高分 紀錄
$("#max").text("最高" + max);
var/*位置內含數值*/locations,/*分數*/score,/*秒數*/time,t,nomore;
var colors=["#FFF","#FBF","#BBB","#ACE","#1EF","#FFB","#CFA","#FDB","#F9F","#DDD","#99F","#9F9"];
function showtime(){$("#time").text("時間"+(++time)+"秒");}
function newNumber(){ // 隨機在某空格產生 2 或 4
	var p=createLocation();
	if(p!=undefined) locations[p]=createNum(); // p ccould be 0
}
function init(){
	clearInterval(t);
	locations=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]; // 每格起始分數 0
	$('#score')[0].style.background='white';
	$('#box-main')[0].style.background='white';
	nomore=score=time=0,paint();
}
function go(){
	if(!nomore)
		btnGo.innerText='重新 esc';
	init();
	t=setInterval(function (){$("#time").text(++time+"秒")},1000); // show time
	newNumber(),newNumber(),paint();
	window.onkeydown=function(e){
		if(nomore) return;
		var keyCode;
		e=e||window.event;
		if (document.all)
			keyCode = e.keyCode;
		else
			keyCode = e.which;
		if 		(keyCode==37 || keyCode==65) // ← 或 A
			toLeft();
		else if (keyCode==38 || keyCode==87) // ↑ 或 W
			toUp();
		else if (keyCode==39 || keyCode==68) // → 或 D
			toRight();
		else if (keyCode==40 || keyCode==83) // ↓ 或 S
			toDown();
		else if (keyCode==27)
			go();
	}
}
function isEnd() {
	if (locations.indexOf(0)<0) { // 沒有空格了
		if (isEndX() && isEndY()) {
			clearInterval(t),nomore=1;
			$('#score')[0].style.background='yellow';
			$('#box-main')[0].style.background='#ffc';
		}
	}
}
function isEndX(){// X 方向都無路
	var w,j,i;
	for (var j=0; j<4; j++) {
		i=4*j, w=locations.slice(i,i+4);
		for (var k=0; k<3; k++)
			if (w[k]===w[k+1])
				return false;
	}
	return true;
}
function isEndY(){// Y 方向都無路
	var w = new Array();
	for (var j= 0; j<4; j++) {
		for (var i=0; i<3; i++)
			if (locations[4*i+j]===locations[4*i+4+j])
				return false;
	}
	return true;
}
function toDown() { if(!t)return; // 向下
	for(var i=0;i<4;i++){
		var r=getArrayDown(i); r=makeArray(r); putArrayDown(i,r);
	}
	newNumber(),paint();
}
function toRight() { if(!t)return; // 向右
	for(var i=0;i<4;i++){
		var r=getArrayRight(i); r=makeArray(r); putArrayRight(i,r);
	}
	newNumber(),paint();
}
function toLeft() { if(!t)return; // 向左
	for(var i=0;i<4;i++){
		var r=getArrayLeft(i); r=makeArray(r); putArrayLeft(i,r);
	}
	newNumber(),paint();
}
function toUp() { if(!t)return; // 向上
	for(var i=0;i<4;i++){
		var r=getArrayUp(i); r=makeArray(r); putArrayUp(i,r);
	}
	newNumber(),paint();
}
function getArrayDown(i){ var r=[],j;
	for(j=3; j>=0; j--) r.push(locations[i+j*4]); return r;
}
function putArrayDown(i,r){ var k=0,j;
	for(j=3; j>=0; j--) locations[i+j*4]=r[k++];
}
function getArrayUp(i){ var r=[],j;
	for(j=0; j<4; j++) r.push(locations[i+j*4]); return r;
}
function putArrayUp(i,r){ var k=0,j;
	for(j=0; j<4; j++) locations[i+j*4]=r[k++];
}
function getArrayRight(j){ var r=[],i;
	for(i=3; i>=0; i--) r.push(locations[i+j*4]); return r;
}
function putArrayRight(j,r){ var k=0,i;
	for(i=3; i>=0; i--) locations[i+j*4]=r[k++];
}
function getArrayLeft(j){ var r=[],i;
	for(i=0; i<4; i++) r.push(locations[i+j*4]); return r;
}
function putArrayLeft(j,r){ var k=0;
	for(var i=0; i<4; i++)
		locations[i+j*4]=r[k++];
}
function makeArray(r) { var n,i,j,m; // 集中並加總
	if (r[0]+r[1]+r[2]+r[3]===0) return r; // 空格列
	n=4; while(!r[n-1])n--;
	for(i=0;i<n-1;i++){
		if(r[i]){
			for(j=i+1;j<n;j++){
				if(r[j]){
					if(r[i]===r[j])
						score+=r[i]*=2,r[j]=0; // 相同數值 加總
					else j--;
					break
				}//if
			}//for j
			i=j;
		}//if
	}//for i
	for(i=m=0;i<n;i++)
		if(r[i])
			r[m++]=r[i]; // 保留 非 0 數值
	while(m<4)
		r[m++]=0; // 補 0
	return r;
}
function createNum(){ return Math.random()<0.8?2:4; } // 隨機生成 2 或 4
function createLocation() { // 隨機生成 空格的位置陣列
	var L=locations.map(function(p,i){
		return p?undefined:i; // i could be 0
	}).filter(function(i){
		return i!==undefined; // i could be 0
	}), n=L.length;
	if(n) return L[Math.floor(Math.random()*n)];
}
$("html").swipe({ // 在整個網頁上檢測滑行方向
	swipe:function(event, direction, distance, duration, fingerCount, fingerData) {
	  if (nomore) return;
	  if (direction==='up'   ) toUp   (); else
	  if (direction==='left' ) toLeft (); else
	  if (direction==='down' ) toDown (); else
	  if (direction==='right') toRight();
	}, threshold:0 // 預設值 75px (set to 0 for demo so any distance triggers swipe)
});
window.boxs=[];
for(var i=0;i<16;i++)window.boxs.push(document.getElementById('box'+i.toString(16)));
function paint() {
	boxs.forEach(function(b,i){
		var L=locations[i], index=L===0?0:(L.toString(2).length-1);
		b.innerText=L?L:"";
		b.style.background=colors[index];
	});
	$("#score").text("總分" + score);
	if(score>max) max = score, localStorage.setItem('max2048',max);
	$("#max").text("最高" + max);
	isEnd();
}
});
require.alias("_2048/_2048.js", "_2048/index.js");
if (typeof exports == 'object') {
  module.exports = require('_2048');
} else if (typeof define == 'function' && define.amd) {
  define(function(){ return require('_2048'); });
} else {
  window['_2048'] = require('_2048');
}})();