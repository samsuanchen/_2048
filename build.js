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
require.register("_2048/jefvm.v3.js", function(exports, require, module){
/*  jefvm.v3.js

	--- Javascript easy Forth (jef or jeforth) virtual machine (vm)
	--- minimalist Forth Implementation in Javascript
	--- MIT license
	2014/10/08	interpretive for next, begin again, begin until, begin while repeat
	2014/10/06	add ms as version 3 by samsuanchen@gmail.com
	2014/10/06	add ?dup 0= 1- 
				if...then, if...else...then,
				for...next, for aft...then next,
				begin...again, begin..until, begin...while...repeat by samsuanchen@gmail.com
	2014/09/26	add ip, data area, and return stack as version 2 by samsuanchen@gmail.com
	2014/09/25	add data stack and number conversion as version 1 by samsuanchen@gmail.com
	2014/09/22	simplifiy to have only code as version 0 by samsuanchen@gmail.com
    2014/09/04  New Version For Espruino Hardware by yapcheahshen@gmail.com
    2012/02/17	add example and modify kernel to be more friendly for education.
    2011/12/23  initial version by yapcheahshen@gmail.com
                equiv to http://tutor.ksana.tw/ksanavm lesson1~8
    TODO: complete eForth core word set
          interface to HTML5 canvas
          port C.H.Ting flag demo for kids
    this is merely a kick off, everyone is welcome to enhance it. */
function JeForthVM() {
    var error	= 0	;	// flag to abort source code interpreting
	var words	=[0];	// collect all words defined
	var nameWord={ };	// nameWord[name]=word
	var ip		= 0 ;	// instruction pointer to run high level colon definition		//	v2
	var cArea	=[0];	// code area to hold high level colon definition				//	v2
	var rStack	=[ ];	// return stack to return from high level colon definition		//	v2
	var dStack	=[ ];	// data stack			
	this.base=10 ;	// number conversion base										//	v1																			//	v1
	this.uob='';	// user output buffer 				// 20141209 sam
	this.clear=function(){ // clear data stack									//	v1
		dStack=this.dStack=[];															//	v1
	};
	var cr=this.cr=function(msg){	// get t=msg to print
		var t=this.tob||'';
		this.tob='';
		if(msg) t+=msg;
		else this.lastTob=t;
		this.uob+=(this.uob?'\n':'')+t;	// 20141209 sam
		console.log(t);								// print t (fixed)
	};
	var intToString=function(t){
		return typeof(t)==='number' && t%1===0 && this.base!==10 ? t.toString(this.base) : t;
	}
	var type=this.type=function(msg){	// send msg to terminal output buffer
		var a=msg||dStack.pop(), that=this;					// pop from data stack if no msg
		a= Array.isArray(a) ? a.map(function(t){
			return intToString.apply(that,[t])}).join(' ') : intToString.apply(that,[a]);	//	v1
		this.tob+=a;									// append t to terminal output buffer
    };
    function showErr(msg){var m=msg;
		if(this.err) m='<'+this.err+'>'+m+'</'+this.err+'>'; cr.apply(this,[m]);
    }
    function showTst(msg){var m=msg;
		if(this.tst) m='<'+this.tst+'>'+m+'</'+this.tst+'>'; cr.apply(this,[m]);
    }
    function showOk (msg){var m=msg;
		if(this.ok ) m='<'+this.ok +'>'+m+'</'+this.ok +'>'; cr.apply(this,[m]);
    }
    function showInp(msg){var m=msg;
		if(this.inp) m='<'+this.inp+'>'+m+'</'+this.inp+'>'; cr.apply(this,[m]);
    }
	function panic(msg){	// clear tob, show error msg, and abort
		showErr(msg),error=msg,this.compiling=0; }
    function nextChar(){	// get a char  from tib
        return this.nTib<this.tib.length ? this.tib.charAt(this.nTib++) : '';	// get null if eoi
    }
    function nextToken(){	// get a token from tib
		this.token=''; var c=nextChar.call(this);
        while (c===' '||c==='\t'||c==='\r') c=nextChar.call(this);	// skip white-space
        while (c){
			if(c===' '||c==='\t'||c==='\r'||c==='\n')break;	// break if white-space
			this.token+=c, c=nextChar.call(this);							// pick up none-white-space
		}
	//	if(c==='\n')this.nTib--;
		this.c=c;
        return this.token;
    }
    function compile(v) {	// compile v to code area									//	v2
		var c= v===undefined ? this.cArea[this.ip++] : v;									//	v2
	//	cr.apply(this,['compile '+JSON.stringify(c)]);			// for tracing only					//	v2
		this.cArea.push(c);																//	v2
    }																					//	v2
    function compileCode(name,v) {	// compile named word to code area					//	v2
		var n= name===undefined ? nextToken.call(this) : name;									//	v2
		var w=this.nameWord[n];															//	v2
		compile.apply(this,[w]);																		//	v2
		if(v!==undefined)this.compile.apply(this,[v]);                                                 //	v2
    }																					//	v2
    function resumeCall() {	// resume inner loop interpreting of compiled code			//	v3
		while(this.ip && !this.waiting){													//	v3
			var w=this.cArea[this.ip];														//	v3
		//	cr.apply(this,[this.ip+': '+w.name+' '+this.dStack]);										//	v3
			this.ip++, execute.apply(this,[w]);														//	v3
		}																				//	v3
	//	if(this.ip) cr.apply(this,['wait at '+this.ip]);													//	v3
    }																					//	v3
    function call(addr) {	// interpret compiled code at addr of cArea					//	v2
	//	cr.apply(this,[this.ip+' --> rStack '+this.rStack.length+': '+this.rStack.join()]);				//	v2
		this.rStack.push(this.ip), this.ip=addr;												//	v2
		resumeCall.call(this);																	//	v3
    }																					//	v2
    function exit() {	// return from colon definition									//	v2
		this.ip=this.rStack.pop();// pop ip from return stack								//	v2
	//	cr.apply(this,[this.ip+' <-- rStack '+this.rStack.length+': '+this.rStack.join()]);				//	v2
    }																					//	v2
    function execute(w){            // execute or compile a word
		var immediate=w.immediate, compiling=immediate?0:this.compiling;					//	v2
	//	var s=(compiling?'compile':'execute')+' word ';	// for tracing only				//	v2
		if(typeof w==='object'){
			if(compiling){																//	v2
			//	cr.apply(this,['compile '+w.name]);         // for tracing only          			//	v2
				compile.apply(this,[w]);																//	v2
			} else {																	//	v2
				var x=w.xt, t=typeof x;
			//	s+=w.id+':\t'+w.name;					// for tracing only
				if(t==="function"){
				//	cr.apply(this,[s+' primitive']);					// for tracing only
					x.call(this);				// execute function x directly
				} else if(t==="number"){												//	v2
				//	cr.apply(this,[s+' colon at '+x]);				// for tracing only				//	v2
					call.apply(this,[x]);
				//	call(x);			// execute colon definition at x				//	v2
				} else {
					panic.apply(this,['error execute:\t'+w.name+' w.xt='+x+' ????']);// xt undefined
				}
			}																			//	v2
		} else {
          panic.apply(this,['error execute:\t'+w+' ????']);						// w is not a word
		}
    }
    function extData(tkn){
    }
    function extQuotedStr(tkn){
    	var c=tkn.charAt(0);
		if(c==='"'){																	//	v1
			var t=this.tib.substr(0,this.nTib-1);												//	v1
			var L=Math.max(t.lastIndexOf(' '),t.lastIndexOf('\n'),t.lastIndexOf('\t'))+1;	// current "	//	v1
			t=this.tib.substr(L+1);										// rest tib		//	v1
			var i=t.indexOf(c);											// next    "	//	v1
			var p=t.charAt(i-1);										// prev char	//	v1
			var n=t.charAt(i+1);											// next char	//	v1
			if(i>=0 && p!=='\\' && (n===' '||n==='\t'||n==='\r'||n==='\n'||n==='')){	//	v1
				this.nTib=L+i+2, t=this.tib.substr(L+1,i);									//	v1
				return t;				// "abc" return string abc ( alow space	)		//	v1
			}																			//	v1
		}																				//	v1
		if(c==="'" && c===tkn.charAt(tkn.length-1)){									//	v1
			return tkn.substr(1,tkn.length-2);		// 'abc' return string abc no space //	v1
		}
		return this.extData.apply(this,[tkn]);
	}
    function extNum(tkn){ var n;
		if(tkn.charAt(0)==='$'){
			n=parseInt(tkn.substr(1),16);
			if('$'+n.toString(16)===tkn) return n;	// hexa decimal integer number
		}
		if(this.base===10){
	    	n=parseFloat(tkn);
			if(n.toString()===tkn) return n; 		// decimal floating number
		} else {
			n=parseInt(tkn,this.base);
			if(n.toString(this.base)===tkn) return n; // any based integer numbe
		}
    }																					//	v1
	function resumeExec(step,resumeDone){		// resume outer source code interpreting loop			//	v3
        this.onDone=resumeDone;
        this.waiting=this.steping||step;                                                                   //  v3
        if(this.ip){																		//	v3
        //  cr.apply(this,['resumeCall at ',this.ip]);
            resumeCall.call(this);		// resume inner compiled code interpreting				//	v3
        }																				//	v3
    //  cr.apply(this,['resume times',++this.rTimes]);	// for tracing only                 			//	v3
    	var tkn,n;
        do{	this.token=tkn=nextToken.call(this);	// get a token
			if (tkn) {					// break if no more
				var w=nameWord[tkn];	// get word if token is already defined
				if (w) execute.apply(this,[w]);		// execute or compile the word
				else {	n=extNum.apply(this,[tkn]);													//	v1
					if(n===undefined)
						n=extQuotedStr.apply(this,[tkn]);											//	v1
					if(n===undefined)
						n=this.extData.apply(this,[tkn]);												//	v1
					if(n===undefined){													//	v1
						panic.apply(this,["? "+this.token+" undefined"]); return; // token undefined
					}																	//	v1
					if(this.compiling){													//	v2
					//	cr.apply(this,['compile doLit '+n]);
						compileCode.apply(this,['doLit',n]);											//	v2
	                }else																//	v2
						dStack.push(n);													//	v1
				}
			}
		//	cr.apply(this,['dStack ===> '+dStack.length+':\t['+dStack.join()+']']);					//	v1
        } while(!this.waiting && this.nTib<this.tib.length);
		if(!this.waiting && !this.compiling){
			var ok=' ok';
			if(this.ok) ok=' <'+this.ok+'>'+ok+'</'+this.ok+'>';								//	v3
			cr.apply(this,[ok]);
		//	console.log(this.out), this.out='';
		}
		if(resumeDone)
			resumeDone();
		var result=this.uob+this.tob;
		this.uob=this.tob='';
		return result;
    }
    var lastCmd='',tasks=[];
    function exec(cmd,step){		// source code interpreting
    	if(!cmd) return // 20141216 sam
    	if(cmd!==lastCmd)
			lastCmd=cmd, this.cmds.push(cmd), this.iCmd=this.cmds.length;	// for tracing only
		if(this.inp)this.showInp.apply(this,[cmd]);
		else cr.apply(this,['source input '+this.cmds.length+':\t'+cmd]);			// for tracing only
		error=0, this.tib=cmd, this.nTib=0, this.tob=this.uob='';		// 20141209 sam
		resumeExec.apply(this,[step]), this.error=error;					// 20141209 sam	//	v3 
        return this.uob+this.tob;				// return this.uob 	// 20141209 sam
	}
	function addWord(name,xt,immediate){	// 
		var id=words.length, w={name:name,xt:xt,id:id}; words.push(w), nameWord[name]=w;
		if(immediate)w.immediate=1;
		cr.apply(this,['defined '+id+': '+name+(typeof xt==='function'? ' as primitive' : '')]);
	}
	var endCode='end-code';
	function code(){ // code <name> d( -- )	// low level definition as a new word
		var i,t;
		this.newName=nextToken.call(this);
		t=this.tib.substr(this.nTib),i=t.indexOf(endCode),this.nTib+=i+endCode.length;
		if(i<0){
			panic("missing end-code for low level "+this.token+" definition");
			return;
		}
		var txt='('+t.substr(0,i)+')';
		var newXt=eval(txt);//eval(txt);
		addWord.apply(this,[this.newName,newXt]);
	}
	function doLit(){ // doLit ( -- n ) //												//	v2
		this.dStack.push(this.cArea[this.ip++]);												//	v2
	}			
	this.cmds=[];
	this.iCmd=-1;
	this.showErr=showErr;
	this.showTst=showTst;
	this.showOk =showOk ;
	this.showInp=showInp;
	this.panic=panic        ;																//	v2
	this.nextToken=nextToken;																//	v2
	this.compileCode=compileCode;															//	v2
	this.execute=execute    ;																//	v2
	this.compile=compile    ;																	//	v2
	this.nameWord=nameWord  ;																//	v2
	this.ip=ip              ;																//	v2
	this.cArea=cArea        ;																//	v2
	this.rStack=rStack      ;																//	v2
	this.dStack=dStack      ;																//	v1
	this.extData=extData    ;																//	v3
	this.rTimes	= 0 ;	// resume times													//	v3
	this.waiting	= 0 ;	// flag of   waiting mode										//	v3
	this.compiling= 0 ;	// flag of compiling mode										//	v2
	this.resumeExec=resumeExec;                                                           //  v3
	this.tob		=''	;	// initial terminal output buffer
    this.tib		=''	;	// initial terminal  input buffer (source code)
    this.nTib		= 0	;	// offset of tib processed
	this.exec	=exec         ;
	this.words=words        ;
	this.code =code         ;
	this.doLit=doLit        ;
	this.exit =exit         ;
	this.addWord=addWord    ;
}
if (typeof module!="undefined")
	module.exports=JeForthVM;
else
	window.vm=new JeForthVM();
//  vm is now creaded and ready to use.
});
require.register("_2048/jefvm.v3_ext.js", function(exports, require, module){
function ext(vm) {
//////////////////////////////////////////////////////////////////////////////////////// tools
vm.equal=function equal(tag,value,expected){ var t; // asure value is exactly equal to expected
  vm.tests++;
  if(value===expected)
    vm.passed++, vm.showTst.apply(vm,[tag+' ok']);
  else{
    var tv=typeof value, te=typeof expected;
    t='??? '+tag+' value:'+value+' not equal to expected:'+expected
    vm.showErr.apply(vm,[t]);
    if(tv==='string')
      t='val len '+value.length+': '+value.split('').map(function(c){
        return c.charCodeAt(0).toString(16);
      }).join(' '), vm.showErr.apply(vm,[t]);
    if(te==='string')
      t='exp len '+expected.length+': '+expected.split('').map(function(c){
        return c.charCodeAt(0).toString(16);
      }).join(' '), vm.showErr.apply(vm,[t]);
  }
}
vm.trm=function trm(x){ // ignore all space, \t, or \n in string x
    var y='';
    for(var i=0;i<x.length;i++){
        var c=x.charAt(i);
        if(c!==' '&&c!=='\t'&&c!=='\n')y+=c;
    }
    return y;
}
///////////////////////////////////////////////////////////////////////////////////////////////
vm.showWords=function(){
	var nw=vm.words.length;
	var primitives=[], colons=[];
	vm.words.forEach(function(w,i){
		if(w){	var type=typeof w.xt, name=i+' '+w.name;
			if(type==='function') primitives.push(name);
			else if(type==='number') colons.push(name);
		}
	});
	var np=primitives.length, nc=colons.length, ni=nw-np-nc;
	vm.cr(nw+' words ('+
		np+' primitives '+
		nc+' colons '+
		ni+' ignores');
	vm.type.apply(vm,['primitives:']);
	primitives.forEach(function(w){
		if(vm.tob.length+w.length+1>80)vm.cr.apply(vm,[]);
		vm.type.apply(vm,[' '+w]);
	});
	if(vm.tob)vm.cr.apply(vm,[]);
	vm.type.apply(vm,['colons:']);
	colons.forEach(function(w){
		if(vm.tob.length+w.length+1>80)vm.cr.apply(vm,[]);
		vm.type.apply(vm,[' '+w]);
	});
	if(vm.tob)vm.cr.apply(vm,[]);
};
vm.seeColon=function seeColon(addr){
  var ip=addr,prevName='',codeLimit=0;
  do {
    var s=ip, w=vm.cArea[ip++];
    s+=': ', n=typeof w==='object'?w.name:'';
    if(n){ var x=w.xt, t=typeof x;
      s+=n.replace(/</g,'&lt;')+(t==='function'?' primitive':t==='number'?(' colon at '+x):'');
    } else {
      if((prevName==='branch' || prevName==='zBranch')){
        if(w>0)
          codeLimit=Math.max(codeLimit,ip+w);
        s+='(to '+(ip+w)+') ';
      }
      s+=w;
    }
    vm.cr.apply(vm,[s]);
    prevName=n;
  } while((codeLimit && ip<codeLimit) || n!=='exit');
};
vm.seeWord=function seeWord(w){
	var o= typeof o==='string'?vm.nameWord[w]:w;
	if(typeof o==='object'){
      var n=o.name, x=o.xt, t=typeof x, i=o.immediate?'immediate':'';
		if(t==='function'){
			vm.cr.apply(vm,[n+' primitive '+i]),vm.cr.apply(vm,[x.toString().replace(/</g,'&lt;')]);
		} else if(t==='number' && x%1===0){
			vm.cr.apply(vm,[n+' colon '+i]),vm.seeColon.apply(vm,[x]);
		}else{
			vm.cr.apply(vm,[n+' xt='+x+' ?????']);
		}
	}else{
		vm.cr.apply(vm,[w+' ?????']);
	}
};
vm.seeArray=function seeArray(arr){
	var old=vm.cArea; addr=old.length;
	vm.cArea=vm.cArea.concat(arr);
	vm.seeColon.apply(vm,[addr]);
	vm.cArea=old;
};
vm.see=function see(x){
	var o=x||vm.nextToken.apply(vm,[]);
	var t=typeof o;
	if(t==='number' && o%1===0){
		vm.seeColon.apply(vm,[o]);
	} else if(t==='object'){
		vm.seeWord.apply(vm,[o]);
	} else if(t==='string'){
		vm.seeWord.apply(vm,[vm.nameWord[o]]);
	} else {
		vm.cr.apply(vm,[o+' ?????']);
	}
};
//////////////////////////////////////////////////////////////////////////////////////// tools
vm.addWord.apply(vm,['code' ,vm.code]);
vm.addWord.apply(vm,['doLit',vm.doLit]);																//	v2
vm.addWord.apply(vm,['exit' ,vm.exit ]);																//	v2
vm.addWord.apply(vm,['words',vm.showWords]);
vm.addWord.apply(vm,['see'  ,vm.see]);
vm.addWord.apply(vm,['type' ,vm.type]);
vm.addWord.apply(vm,['cr'   ,vm.cr]);
//////////////////////////////////////////////////////////////////////////////////////////// v0
vm.addWord.apply(vm,['r1',function(){LED3.write(1);}]);
vm.addWord.apply(vm,['r0',function(){LED3.write(0);}]);
vm.addWord.apply(vm,['g1',function(){LED2.write(1);}]);
vm.addWord.apply(vm,['y1',function(){LED1.write(1);}]);
vm.addWord.apply(vm,['b1',function(){LED4.write(1);}]);
vm.addWord.apply(vm,['g0',function(){LED2.write(0);}]);
vm.addWord.apply(vm,['y0',function(){LED1.write(0);}]);
vm.addWord.apply(vm,['b0',function(){LED4.write(0);}]);
//////////////////////////////////////////////////////////////////////////////////////////// v1
vm.addWord.apply(vm,['.',function(){vm.type.call(this),vm.type.apply(this,[" "]);}]);
vm.addWord.apply(vm,['+',function(){var b=vm.dStack.pop();vm.dStack.push(vm.dStack.pop()+b);}]);
vm.addWord.apply(vm,['-',function(){var b=vm.dStack.pop();vm.dStack.push(vm.dStack.pop()-b);}]);
vm.addWord.apply(vm,['*',function(){var b=vm.dStack.pop();vm.dStack.push(vm.dStack.pop()*b);}]);
vm.addWord.apply(vm,['/',function(){var b=vm.dStack.pop();vm.dStack.push(vm.dStack.pop()/b);}]);
vm.addWord.apply(vm,[ '1+' ,function(){var s=vm.dStack; s[s.length-1]++;}]);
vm.addWord.apply(vm,[ '1-' ,function(){var s=vm.dStack; s[s.length-1]--;}]);
vm.addWord.apply(vm,[ '2+' ,function(){var s=vm.dStack; s[s.length-1]+=2;}]);
vm.addWord.apply(vm,[ '2-' ,function(){var s=vm.dStack; s[s.length-1]-=2;}]);
vm.addWord.apply(vm,[ '2*' ,function(){var s=vm.dStack; s[s.length-1]*=2;}]);
vm.addWord.apply(vm,[ '2/' ,function(){var s=vm.dStack; s[s.length-1]/=2;}]);
vm.addWord.apply(vm,[ '2%' ,function(){var s=vm.dStack; s[s.length-1]%=2;}]);
vm.addWord.apply(vm,[ 'mod',function(){var s=vm.dStack, d=s.pop(); s[s.length-1]%=d;}]);
vm.addWord.apply(vm,['/mod',function(){
	var s=vm.dStack, t=s.length-1,n=t-1,sn=s[n],st=s[t],r=s[n]=sn%st; s[t]=(sn-r)/st;}]);
vm.addWord.apply(vm,['and',function(){vm.dStack.push(vm.dStack.pop()&vm.dStack.pop());}]);
vm.addWord.apply(vm,['or' ,function(){vm.dStack.push(vm.dStack.pop()|vm.dStack.pop());}]);
vm.addWord.apply(vm,['xor',function(){vm.dStack.push(vm.dStack.pop()^vm.dStack.pop());}]);
vm.addWord.apply(vm,['hex'    ,function(){vm.base=16;}]);
vm.addWord.apply(vm,['decimal',function(){vm.base=10;}]);
vm.addWord.apply(vm,['binary' ,function(){vm.base= 2;}]);
vm.addWord.apply(vm,['.r',function(){
	var m=vm.dStack.pop(),n=""+vm.dStack.pop();vm.type.apply(vm,["         ".substr(0,m-n.length)+n]);}]);
//////////////////////////////////////////////////////////////////////////////////////////// v2
vm.addWord.apply(vm,[':',function(){
	vm.newName=vm.nextToken.apply(vm,[]),vm.newXt=vm.cArea.length,vm.compiling=1;}]);
vm.addWord.apply(vm,['immediate',function(){vm.words[vm.words.length-1].immediate=1;}]);
vm.addWord.apply(vm,[';',function(){
	vm.compileCode.apply(vm,["exit"]),vm.compiling=0;vm.addWord.apply(vm,[vm.newName,vm.newXt]);},'immediate']);
vm.addWord.apply(vm,['r@',function(){vm.dStack.push(vm.rStack[vm.rStack.length-1]);}]);
vm.addWord.apply(vm,['i' ,function(){vm.dStack.push(vm.rStack[vm.rStack.length-1].i);}]);
vm.addWord.apply(vm,['>r',function(){vm.rStack.push(vm.dStack.pop());}]);
vm.addWord.apply(vm,['for',function(){
	if(vm.compiling){
		vm.compileCode.apply(vm,[">r"]);vm.dStack.push({name:"for",at:vm.cArea.length}); return;
	}
	var nTib=vm.nTib,i=vm.dStack.pop();vm.rStack.push({name:"for",nTib:nTib,i:i});
},'immediate']);
vm.addWord.apply(vm,['doNext',function(){
	var i=vm.rStack.pop();
	if(i){vm.rStack.push(i-1),vm.ip+=vm.cArea[vm.ip];}
	else vm.ip++;}]);
vm.addWord.apply(vm,['next',function(){ var o; // why this was broken ??????????????????
  if(vm.compiling) o=vm.dStack.pop();
  else o=vm.rStack[vm.rStack.length-1];
  var t=typeof o;
  if(t!=="object" || o.name!=="for"){
    vm.panic.apply(vm,["no for to match next"]); return;
  }
  if(vm.compiling){
    vm.compileCode.apply(vm,["doNext",o.at-vm.cArea.length-1]); return;
  }
  if(--o.i>=0)vm.nTib=o.nTib;
  else        vm.rStack.pop();
},'immediate']);
vm.addWord.apply(vm,['drop',function(){vm.dStack.pop();}]);
vm.addWord.apply(vm,['dup',function(){vm.dStack.push(vm.dStack[vm.dStack.length-1]);}]);
vm.addWord.apply(vm,['over',function(){vm.dStack.push(vm.dStack[vm.dStack.length-2]);}]);
vm.addWord.apply(vm,['emit',function(){vm.type.apply(vm,[String.fromCharCode(vm.dStack.pop())]);}]);
vm.addWord.apply(vm,['branch',function(){vm.ip+=vm.cArea[vm.ip];}]);
vm.addWord.apply(vm,['zBranch',function(){
	if(vm.dStack.pop())vm.ip++; else vm.ip+=vm.cArea[vm.ip];}]);
vm.addWord.apply(vm,['if',function(){
	if(vm.compiling){
		vm.compileCode.apply(vm,["zBranch",0]);
		vm.dStack.push({name:"if",at:vm.cArea.length-1});return;
	}
	if(vm.dStack.pop())return; // 20141215 sam fixed
	var e=vm.tib.substr(vm.nTib).indexOf("else");
	var t=vm.tib.substr(vm.nTib).indexOf("then");
	if(e>=0){
		if(t && t<e)
			vm.nTib+=t+4; // zbranch to then
		else
			vm.nTib+=e+4; // zbranch to else
	} else if(t>=0)
		vm.nTib+=t+4; // zbranch to then
	else
		vm.panic.apply(vm,["no else or then to match if"]);
},'immediate']);
vm.addWord.apply(vm,['else',function () {var t;
  if(vm.compiling){
   var o=vm.dStack.pop();t=typeof o;
   if(t!=="object" || o.name!="if"){
        vm.panic.apply(vm,["there is no if to match else"]);return;
   }
   var i=o.at; vm.compileCode.apply(vm,["branch",0]);
   vm.dStack.push({name:"else",at:vm.cArea.length-1});
   vm.cArea[i]=vm.cArea.length-i;return;
  }
  t=vm.tib.substr(vm.nTib).indexOf("then");
  if(t>=0) vm.nTib+=t+4; // branch to then
  else vm.panic.apply(vm,["there is no then to match else"]);
},'immediate']);
vm.addWord.apply(vm,['then',function () {
  if(!vm.compiling) return;
  var o=vm.dStack.pop(),t=typeof o, n=o.name;
  if(t!=="object" || (n!="if" && n!="else" && n!="aft")){
        vm.panic.apply(vm,["no if, else, aft to match then"]);return;
  }
  var i=o.at; vm.cArea[i]=vm.cArea.length-i;
},'immediate']);
vm.addWord.apply(vm,['aft',function () {var t;
  if(vm.compiling){
   var s=vm.dStack,o=s[s.length-1];t=typeof o;
   if(t!=="object" || o.name!=="for"){
        vm.panic.apply(vm,["no for to match aft"]);return;
   }
   var i=o.at;
   vm.compileCode.apply(vm,["zBranch",0]);
   vm.dStack.push({name:"aft",at:vm.cArea.length-1});
   return;
  }
  t=vm.tib.substr(vm.nTib).indexOf("then");
  if(t>=0) vm.nTib+=t+4; // branch to then
  else vm.panic.apply(vm,["there is no then to match aft"]);
},'immediate']);
vm.addWord.apply(vm,['?dup',function () {var s=vm.dStack, d=s[s.length-1]; if(d)s.push(d);}]);
vm.addWord.apply(vm,['0=',function () {var s=vm.dStack,m=s.length-1; s[m]=!s[m];}]);
vm.addWord.apply(vm,['begin',function () {
  if(vm.compiling){
        vm.dStack.push({name:"begin",at:vm.cArea.length-1});
        return;
  }
  vm.rStack.push({name:"begin",nTib:vm.nTib});
},'immediate']);
vm.addWord.apply(vm,['again',function () {    var o;
  if(vm.compiling)
        o=vm.dStack.pop();
  else
        o=vm.rStack[vm.rStack.length-1];
  var    t=typeof o;
  if(t!=="object" || o.name!=="begin"){
        vm.panic.apply(vm,["no begin to match again"]);
        return;
  }
  if(vm.compiling){
        var i=o.at;
        vm.compileCode.apply(vm,[ "branch", i-vm.cArea.length]);
        return;
  }
  vm.nTib=o.nTib;
},'immediate']);
vm.addWord.apply(vm,['until',function () {    var o;
  if(vm.compiling)
        o=vm.dStack.pop();
  else
        o=vm.rStack[vm.rStack.length-1];
  var    t=typeof o;
  if(t!=="object" || o.name!=="begin"){
        vm.panic.apply(vm,["no begin to match until"]);
        return;
  }
  if(vm.compiling){
        var i=o.at;
        vm.compileCode.apply(vm,[ "zBranch", i-vm.cArea.length]);
        return;
  }
  if(vm.dStack.pop()) vm.rStack.pop();
  else vm.nTib=o.nTib;
},'immediate']);
vm.addWord.apply(vm,['while',function () {    var s,o,t;
  s=vm.dStack,o=s[s.length-1],t=typeof o;
  if(t!=="object" || o.name!=="begin"){
        vm.panic.apply(vm,["no begin to match while"]);return;
  }
  var i=o.at; vm.compileCode.apply(vm,["zBranch",0]);
  vm.dStack.push({name:"while",at:vm.cArea.length-1});
},'immediate']);
vm.addWord.apply(vm,['repeat',function () {
  var o=vm.dStack.pop(),t=typeof o;
  if(t!=="object" || o.name!=="while"){
        vm.panic.apply(vm,["no while to match repeat"]);return;
  }
  var i=o.at; o=vm.dStack.pop(),t=typeof o;
  if(t!=="object" || o.name!=="begin"){
        vm.panic.apply(vm,["no begin to match repeat"]);return;
  }
  vm.compileCode.apply(vm,["branch",o.at-vm.cArea.length]);
  vm.cArea[i]=vm.cArea.length-i;
},'immediate']);
//////////////////////////////////////////////////////////////////////////////////////////// v3
vm.msTime=[];                                   //  v2;
vm.addWord.apply(vm,['ms',function (n) {
  var m= n===undefined ? vm.dStack.pop() : n;
  var t={tib:vm.tib,nTib:vm.nTib,tob:vm.tob,uob:vm.uob,dStack:vm.dStack,wakeup:new Date()+m};
  vm.waiting=1; t.timeout=setTimeout(function(){
    var i=vm.msTime.map(function(tsk){
      return tsk.timeout
    }).indexOf(t.timeout);
    vm.msTime.splice(i,1);
    vm.tib=t.tib,vm.nTib=t.nTib,vm.tob=t.tob,vm.uob=t.uob,vm.dStack=t.dStack;
    vm.resumeExec.apply(vm,[vm.waiting===1?0:vm.waiting]);
  },m);
  vm.msTime.push(t);
}]);
vm.addWord.apply(vm,['append',function(){var d,t,o,a,v;
  d=vm.dStack.pop(), t=vm.nextToken.apply(vm,[]), vm[t]=o=d.append(t), a=vm.nextToken.apply(vm,[]);
  while(a){
	t=vm.nextToken.apply(vm,[]);
    if(a==='text')o.text(' '+t);
    else o.attr(a,t);
	if(vm.c==='\n')break;
	a=vm.nextToken.apply(vm,[]);
  }
}]);
};
if(typeof module!='undefined')
	module.exports=ext;
else
	ext(vm);

});
require.register("_2048/jefvm.v3_tst.js", function(exports, require, module){
function tst(vm) {
//////////////////////
// jefvm.v2_tst.js //
//////////////////////
vm.tests=0, vm.passed=0;
//////////////////////////////////////////////////////////////////////////////////////////// v0
vm.equal.apply(vm,['test 1',vm.trm.apply(vm,[vm.nameWord['r1'].xt.toString()]),"function(){LED3.write(1);}"]);
//////////////////////////////////////////////////////////////////////////////////////////// v0
vm.equal.apply(vm,['test 2',vm.trm.apply(vm,[vm.nameWord['r0'].xt.toString()]),"function(){LED3.write(0);}"]);
//////////////////////////////////////////////////////////////////////////////////////////// v1
vm.exec.apply(vm,['123 . 4.56 . -10 . $41 . cr']);
vm.equal.apply(vm,['test 3',vm.lastTob,"123 4.56 -10 65 "]);
//////////////////////////////////////////////////////////////////////////////////////////// v1
vm.exec.apply(vm,['"abc" . "def 123" . cr']);
vm.equal.apply(vm,['test 4',vm.lastTob,"abc def 123 "]);
//////////////////////////////////////////////////////////////////////////////////////////// v1
vm.exec.apply(vm,["'ghi' . cr"]);
vm.equal.apply(vm,['test 5',vm.lastTob,"ghi "]);
//////////////////////////////////////////////////////////////////////////////////////////// v1
vm.exec.apply(vm,['5 type 2 . 5 . cr']);
vm.equal.apply(vm,['test 6',vm.lastTob,"52 5 "]);
//////////////////////////////////////////////////////////////////////////////////////////// v1
vm.exec.apply(vm,['"abc def" '+"'ghi' + . 2.23 0.23 - 3 * 2 / . cr"]);
vm.equal.apply(vm,['test 7',vm.lastTob,"abc defghi 3 "]);
//////////////////////////////////////////////////////////////////////////////////////////// v1
vm.exec.apply(vm,['128 hex . cr decimal']);
vm.equal.apply(vm,['test 8',vm.lastTob,"80 "]);
//////////////////////////////////////////////////////////////////////////////////////////// v1
vm.exec.apply(vm,['hex 100 decimal . cr']);
vm.equal.apply(vm,['test 9',vm.lastTob,"256 "]);
//////////////////////////////////////////////////////////////////////////////////////////// v1
vm.exec.apply(vm,['11 binary . decimal cr']);
vm.equal.apply(vm,['test 10',vm.lastTob,"1011 "]);
//////////////////////////////////////////////////////////////////////////////////////////// v1
vm.exec.apply(vm,['5 3 .r 10 3 .r 15 3 .r cr']);
vm.equal.apply(vm,['test 11',vm.lastTob,"  5 10 15"]);
//////////////////////////////////////////////////////////////////////////////////////////// v2
vm.cArea=[ 0,vm.nameWord['doLit'],3,vm.nameWord['.r'],vm.nameWord['exit'] ],vm.addWord('t',1);
vm.exec.apply(vm,['5 t 10 t 15 t cr']);
vm.equal.apply(vm,['test 12',vm.lastTob,"  5 10 15"]);
//////////////////////////////////////////////////////////////////////////////////////// v2
vm.exec.apply(vm,[': x 3 .r ; 5 x 10 x 15 x cr']);
vm.equal.apply(vm,['test 13',vm.lastTob,"  5 10 15"]);
//////////////////////////////////////////////////////////////////////////////////////// v2
vm.exec.apply(vm,[': z 9 for r@ . next ; z cr']);
vm.equal.apply(vm,['test 14',vm.lastTob,'9 8 7 6 5 4 3 2 1 0 ']);
//////////////////////////////////////////////////////////////////////////////////////// v2
vm.exec.apply(vm,[': t1 8 for dup 9 r@ - * 3 .r next drop ; 3 t1 cr']);
vm.equal.apply(vm,['test 15',vm.lastTob,'  3  6  9 12 15 18 21 24 27']);
//////////////////////////////////////////////////////////////////////////////////////// v2
vm.exec.apply(vm,[': t2 8 for 9 r@ - t1 cr next ; t2']);
vm.equal.apply(vm,['test 16',vm.lastTob,'  9 18 27 36 45 54 63 72 81']);
//////////////////////////////////////////////////////////////////////////////////////// v2
var addr=vm.cArea.length;
var compiled=[
	vm.nameWord['zBranch'],5,
	vm.nameWord['doLit'],1,
	vm.nameWord['branch'],3,
	vm.nameWord['doLit'],0,
	vm.nameWord['exit']
];
vm.cArea=vm.cArea.concat(compiled);
vm.addWord.apply(vm,['t17',addr]);
vm.exec.apply(vm,['0 t17 . 5 t17 . cr']);
vm.equal.apply(vm,['test 17',vm.lastTob,'0 1 ']);
//////////////////////////////////////////////////////////////////////////////////////// v2
addr=vm.cArea.length;
vm.exec.apply(vm,[': t18 if 1 else 0 then ;']);
vm.equal.apply(vm,['test 18',JSON.stringify(vm.cArea.slice(addr)),JSON.stringify(compiled)]);
//////////////////////////////////////////////////////////////////////////////////////// v2
vm.exec.apply(vm,['0 t18 . 5 t18 . cr']);
vm.equal.apply(vm,['test 19',vm.lastTob,'0 1 ']);
//////////////////////////////////////////////////////////////////////////////////////// v2
vm.exec.apply(vm,[': t20 begin dup . 1- ?dup 0= if exit then again ; 9 t20 cr']);
vm.equal.apply(vm,['test 20',vm.lastTob,'9 8 7 6 5 4 3 2 1 ']);
//////////////////////////////////////////////////////////////////////////////////////// v2
vm.exec.apply(vm,[': t21 begin dup . 1- ?dup 0= until ; 9 t21 cr']);
vm.equal.apply(vm,['test 21',vm.lastTob,'9 8 7 6 5 4 3 2 1 ']);
//////////////////////////////////////////////////////////////////////////////////////// v2
vm.exec.apply(vm,[': t22 begin ?dup while dup . 1- repeat ; 9 t22 cr']);
vm.equal.apply(vm,['test 22',vm.lastTob,'9 8 7 6 5 4 3 2 1 ']);
//////////////////////////////////////////////////////////////////////////////////////// v2
vm.exec.apply(vm,['10 3 mod . cr']);
vm.equal.apply(vm,['test 23',vm.lastTob,'1 ']);
//////////////////////////////////////////////////////////////////////////////////////// v2
vm.exec.apply(vm,['10 3 /mod . . cr']);
vm.equal.apply(vm,['test 24',vm.lastTob,'3 1 ']);
//////////////////////////////////////////////////////////////////////////////////////// v2
vm.exec.apply(vm,['3 begin dup . 1 - ?dup 0= until cr']);
vm.equal.apply(vm,['test 25',vm.lastTob,'3 2 1 ']);
//////////////////////////////////////////////////////////////////////////////////////// v2
vm.exec.apply(vm,['8 for 9 i - 8\n  for dup 9 i - * 3 .r \n  next cr drop\nnext']);
vm.equal.apply(vm,['test 26',vm.lastTob,'  9 18 27 36 45 54 63 72 81']);
//////////////////////////////////////////////////////////////////////////////////////// v2
vm.showTst.apply(vm,['total tests '+vm.tests+' passed '+vm.passed]);
///////////////////////////////////////////////////////////////////////////////////////////
vm.addWord.apply(vm,['stop',vm.stop]);
vm.addWord.apply(vm,['go',vm.go]);
vm.X=150, vm.Y=100, vm.R=30, vm.PC='black', vm.BC='rgba(255,0,0,.1)', vm.PW=.5, vm.PC='black';
vm.addWord.apply(vm,['circle',function(){
	d3.select('svg').append('circle')
	.attr('cx',vm.X).attr('cy',vm.Y).attr('r',vm.R)
	.attr('stroke',vm.PC).attr('fill',vm.BC)
	.attr('stroke-width',vm.PW);
}]);
vm.H=150, vm.W=150;
vm.addWord.apply(vm,['rect',function(){
	var s={fill:vm.BC,stroke:vm.PC,'stroke-width':vm.PW};
	d3.select('svg').append('rect')
	.attr('x',vm.X-vm.W/2).attr('y',vm.Y-vm.H/2).attr('width',vm.W).attr('height',vm.H)
	.attr('style',Object.keys(s).map(function(a){
		return a+':'+s[a];
	}).join(';'));
}]);
}
if(typeof module!='undefined')
	module.exports=tst;
else
	tst(vm);
});
require.register("_2048/_2048.js", function(exports, require, module){
// new2048.js // http://labs.rampinteractive.co.uk/touchSwipe/demos/Basic_swipe.html
var max=localStorage.getItem('max2048'); max=max?parseInt(max):0; // 讀取 高分 紀錄
$("#max").text("最高" + max);
var/*格內數值*/locations,/*當前得分*/score,/*剩餘秒數*/time;
var tGo,nomore;
var colors=["#FFF","#FBF","#BBB","#ACE","#1EF","#FFB","#CFA","#FDB","#F9F","#DDD","#99F","#9F9"];
function showtime(){$("#time").text("時間"+(++time)+"秒");}
function newNumber(){ // 隨機在某空格產生 2 或 4
	var p=randomLocation(); // p ccould be 0
	if(p!==undefined) locations[p]=Math.random()<0.8?2:4;
}
function noMore(){
	halt(),nomore=1;
	$('#score')[0].style.background='yellow';
	$('#mainbox')[0].style.background='#fcc';
}
function isEnd() {
	if (time<0||(locations.indexOf(0)<0 && isEndH() && isEndV())) {
	// (逾時) 或者 (無 空格 且 無法 左右 橫向移動 也 無法 上下 縱向移動)
		noMore();
		return true
	}
}
function isEndH(){ var w,j,i,k; // 無法 左右 橫向移動
	for (j=-1; ++j<4;) {
		i=4*j, w=locations.slice(i,i+4);
		for (k=-1; ++k<3;)
			if (w[k]===w[k+1]) return false;
	}
	return true;
}
function isEndV(){ var w,j,i; // 無法 上下 縱向移動
	w = new Array();
	for (j= 0; j<4; j++) {
		for (i=0; i<3; i++)
			if (locations[4*i+j]===locations[4*i+4+j]) return false;
	}
	return true;
}
function toLeftPage() {
}
function toRightPage() {
}
function toLeft() { if(!tGo)return; // 向左
	for(var i=0;i<4;i++){
		var r=getArrayLeft(i); r=processArray(r); putArrayLeft(i,r);
	}
	newNumber(),paint();
}
function toRight() { if(!tGo)return; // 向右
	for(var i=0;i<4;i++){
		var r=getArrayRight(i); r=processArray(r); putArrayRight(i,r);
	}
	newNumber(),paint();
}
function toUp() { if(!tGo)return; // 向上
	for(var i=0;i<4;i++){
		var r=getArrayUp(i); r=processArray(r); putArrayUp(i,r);
	}
	newNumber(),paint();
}
function toDown() { if(!tGo)return; // 向下
	for(var i=0;i<4;i++){
		var r=getArrayDown(i); r=processArray(r); putArrayDown(i,r);
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
function getArrayLeft(j){//var r=[],i;
	//for(i=0; i<4; i++) r.push(locations[i+j*4]); return r;
	return locations.slice(j*4,j*4+4);
}
function putArrayLeft(j,r){ var k=0;
	for(var i=0; i<4; i++)
		locations[i+j*4]=r[k++];
}
function processArray(r) { var n,i,j,m; // 數值往 0 集中 碰 相同值 就 加總
	if (r[0]+r[1]+r[2]+r[3]===0) return r; // 空格列
	n=4; while(!r[n-1])n--; // 檢視 n 從 4 到 0, 直到 r[n-1] 有數值
	for(i=0;i<n-1;i++){ // 檢視 i 從 0 到 n-2
		if(r[i]){ 		// 直到 r[i] 有數值
			for(j=i+1;j<n;j++){ // 檢視 j 從 i+1 到 n-1
				if(r[j]){ 		// 直到 r[j] 有數值
					if(r[i]===r[j]){			// 若 r[i]=r[j]
						score+=r[i]*=2,r[j]=0;	// r[i]=兩樹相加, r[j]=0
					} else j--; // (下次回到 loop j 還會自動再加 1)
					break;
				}//if
			}//for j
			i=j; // (下次回到 loop i 還會自動再加 1)
		}//if
	}//for i
	for(i=m=0;i<n;i++) if(r[i]) r[m++]=r[i]; // 依序 非 0 數值
	while(m<4) r[m++]=0; // 以 0 補足 4 個
	return r;
}
function randomLocation() { // 隨機生成 空格的位置
	var L=locations.map(function(p,i){
		return p?undefined:i; // i could be 0
	}).filter(function(i){
		return i!==undefined; // i could be 0
	}); // L = 空格位置 的 陣列
	var n=L.length;
	if(n) return L[Math.floor(Math.random()*n)];
}
$("#mainbox").swipe({ // 手指 在表格中 可向 上下左右 滑動
	swipe:function(event, direction, distance, duration, fingerCount, fingerData) {
	  if (nomore) return;
	  if (direction==='up'   ) toUp   (); else
	  if (direction==='left' ) toLeft (); else
	  if (direction==='down' ) toDown (); else
	  if (direction==='right') toRight();
	}, threshold:0 // 預設值 75px (set to 0 for demo so any distance triggers swipe)
});
$("#body").swipe({ // 手指 在表格外 可向 左右 滑動 翻頁
	swipe:function(event, direction, distance, duration, fingerCount, fingerData) {
	  if (direction==='left' )
	  	toLeftPage ();
	  else if (direction==='right')
	  	toRightPage();
	}, threshold:0 // 預設值 75px (set to 0 for demo so any distance triggers swipe)
});
window.onkeydown=function(e){ var keyCode;
	e=e||window.event;
	if (document.all) keyCode = e.keyCode;
	else keyCode = e.which;
	if (keyCode==27){
		go(); return;
	}
	if(nomore) return;
	if 		(keyCode==37 || keyCode==65) /* ← 或 A */ toLeft();
	else if (keyCode==38 || keyCode==87) /* ↑ 或 W */ toUp();
	else if (keyCode==39 || keyCode==68) /* → 或 D */ toRight();
	else if (keyCode==40 || keyCode==83) /* ↓ 或 S */ toDown();
}
window.boxs=[];
for(var i=0;i<16;i++)window.boxs.push(document.getElementById('box'+i.toString(16)));
function paint() { // 更新畫面
	boxs.forEach(function(b,i){
		var L=locations[i], index=L===0?0:(L.toString(2).length-1);
		b.innerText=L?L:"";
		b.style.background=colors[index];
	});
	$("#score").html("得分<br/>" + score);
	if(score>max) max = score, localStorage.setItem('max2048',max);
	$("#max").html("最高<br/>" + max);
	isEnd();
}
var init=function(){
	var t0,t1;
	t0=new Date(), console.log('t0',t0);
	setTimeout(
		function(){
			t1=new Date(), console.log('t1', t1, 'delta', t1.valueOf()-t0.valueOf())
		},
		1000
	);
	var JeForthVM=require("./jefvm.v3.js");
	window.vm=new JeForthVM();
	require("./jefvm.v3_ext.js")(vm);
	require("./jefvm.v3_tst.js")(vm);
	vm.extData=vm.extData||function (tkn){
		if( typeof vm[tkn]!=='undefined' )
			return vm[tkn]; 						// vm attribute
		if(tkn.match(/#([0-9a-f]{3}|[0-9a-f]{6})/))
			return tkn;								// #hhh or #hhhhhh (rgb hexadecimal code string)
		var t=eval('typeof '+tkn);
		if(t==='undefined')
			return;									// undefined
		var v=d3.select('#'+tkn);
		if(v[0][0]&&v[0][0].id===tkn)
			return v;								// d3 object
		return eval(tkn);							// js defined
	}
	vm.Get=vm.Get||function (obj,att){ var lst;
		obj=obj||vm.dStack.pop(), att=att||vm.dStack.pop();
		if(typeof(obj)==='object'&&obj.attr)
			return obj.attr(att);
		lst=(Array.isArray(obj) ? obj : [obj]).map(function(o){
			if(typeof(o)!=='object') return;
			return o.attr ? o.attr(att) : o[att];
		})
		return lst.length===1 ? lst[0] : lst;
	}
	vm.Set=function (obj,att,val){
		obj=obj||vm.dStack.pop(), att=att||vm.dStack.pop(), val=val||vm.dStack.pop();
		if(typeof(obj)!=='object')
			return;
		else {
			if(obj.attr) 
				obj.attr(att,val);	// d3 object attribute setting
			else {
				var lst=Array.isArray(obj)?obj:[obj];
				if(Array.isArray(obj))
					obj.forEach(function(o){
						if(typeof o==='object') o[att]=val;
					})
			}
		}
	}
	vm.exec.apply(vm,[
		'code get function(){ /* get ( obj <att> -- val ) */\n'+
		' /* 例: vm.exec.apply(vm,["vm get words get name type"]) */\n'+
		' var obj=vm.dStack.pop(), att=vm.nextToken.call(vm); vm.dStack.push(vm.Get(obj,att)); }end-code']);
	vm.exec.apply(vm,[
		'code geti function(){ /* geti ( obj <att> -- int ) */\n'+
		' /* 例: vm.exec.apply(vm,["c1 geti cx 100 + type"]) */\n'+
		' var obj=vm.dStack.pop(), att=vm.nextToken.call(vm); vm.dStack.push(parseInt(vm.Get(obj,att))); }end-code']);
	vm.exec.apply(vm,[
		'code set function(){var obj,att;/* set ( val obj <att> -- ) */\n'+
		' /* 例1: vm.exec.apply(vm,["#ff8 c1 set fill 40 c1 set r 150 c1 set cx"]) */\n'+
		' /* 例2: vm.exec.apply(vm,["\'background-color:yellow\' box1 set style"]) */\n'+
		' obj=vm.dStack.pop(), att=vm.nextToken.call(vm), vm.Set(obj,att,vm.dStack.pop()); }end-code']);
	vm.exec.apply(vm,[
		'code Xmi function(){ /* Xmi ( -- xmin ) */\n'+
		' vm.dStack.push(parseInt(c1.getAttribute("r")));}end-code\n'+
		'code Xma function(){ /* Xma ( -- xmax ) */\n'+
		' vm.dStack.push(parseInt(svg.getAttribute("width"))-parseInt(c1.getAttribute("r")));}end-code\n'+
		'code xmi function(){ /* mi ( -- xmin ) */\n'+
		' vm.dStack.push(parseInt(c2.getAttribute("r")));}end-code\n'+
		'code xma function(){ /* ma ( -- xmax ) */\n'+
		' vm.dStack.push(parseInt(svg.getAttribute("width"))-parseInt(c2.getAttribute("r")));}end-code\n'+
		'code Cx@ function(){ /* Cx@ ( -- Cx ) */\n'+
		' vm.dStack.push(parseInt(c1.getAttribute("cx")));}end-code\n'+
		'code Dx@ function(){ /* Dx@ ( -- Dx ) */\n'+
		' vm.dStack.push(parseInt(c1.getAttribute("dx")));}end-code\n'+
		'code Cx! function(){ /* Cx! ( Cx -- ) */\n'+
		' c1.setAttribute("cx",vm.dStack.pop());}end-code\n'+
		'code Cx+! function(){ /* Cx+! ( Dx -- ) */\n'+
		' c1.setAttribute("cx",parseInt(c1.getAttribute("cx"))+vm.dStack.pop());}end-code\n'+
		'code Dx! function(){ /* Dx! ( Dx -- ) */\n'+
		' c1.setAttribute("dx",vm.dStack.pop());}end-code\n'+
		'code cx@ function(){ /* cx@ ( -- cx ) */\n'+
		' vm.dStack.push(parseInt(c2.getAttribute("cx")));}end-code\n'+
		'code dx@ function(){ /* dx@ ( -- dx ) */\n'+
		' vm.dStack.push(parseInt(c2.getAttribute("dx")));}end-code\n'+
		'code cx! function(){ /* cx! ( cx -- ) */\n'+
		' c2.setAttribute("cx",vm.dStack.pop());}end-code\n'+
		'code cx+! function(){ /* cx+! ( dx -- ) */\n'+
		' c2.setAttribute("cx",parseInt(c2.getAttribute("cx"))+vm.dStack.pop());}end-code\n'+
		'code dx! function(){ /* dx! ( dx -- ) */\n'+
		' /* 例1: vm.exec.apply(vm,["1 Dx! Xma for 20 ms Dx@ Cx+! next"]) */\n'+
		' /* 例2: vm.exec.apply(vm,["50 Cx! 1 Dx! begin Xma for 20 ms Dx@ Cx+! next 0 Dx@ - Dx! again"]) */\n'+
		' c2.setAttribute("dx",vm.dStack.pop());}end-code']);
	vm.exec.apply(vm,['code > function(){dStack.push(dStack.pop()<dStack.pop())}end-code']);
	vm.exec.apply(vm,['code < function(){dStack.push(dStack.pop()>dStack.pop())}end-code']);
}
function halt(){
	clearInterval(tGo), vm.msTime.forEach(function(t){clearTimeout(t.timeout)});
	if(btnHalt.innerText==='停'){
		btnHalt.innerText='走';
	}else{
		btnHalt.innerText='停';
		vm.exec("begin 20 ms Dx@ Cx+! Cx@ Xmi < Cx@ Xma > or if 0 Dx@ - Dx! then again");
		vm.exec("begin 15 ms dx@ cx+! cx@ xmi < cx@ xma > or if 0 dx@ - dx! then again")
		tGo=setInterval(function (){
			$("#time").html("剩餘<br/>"+ time-- +"秒");
			if(time<0) noMore();
		},1000);;
	}
}
function go(){
	clearInterval(tGo), vm.msTime.forEach(function(t){clearTimeout(t.timeout)});
	if(btnHalt.innerText==='走')
		btnHalt.innerText='停';
	if(!nomore) btnGo.innerText='重新 esc', hint.innerText='手 滑動 或 按鍵';
	locations=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]; // 每格起始分數 0
	$('#score')[0].style.background='white';
	$('#mainbox')[0].style.background='white';
	nomore=score=0, time=300, newNumber(), newNumber(), paint();
/*	if(time.innerText.match(/\d+/)[0]>='0'){
		tGo=setInterval(function (){
			$("#time").html("剩餘<br/>"+ time-- +"秒");
			if(time<0) noMore();
		},1000); // show time
	}
*/	vm.exec.apply(vm,["Xmi Cx! 1 Dx! begin 20 ms Dx@ Cx+! Cx@ Xmi < Cx@ Xma > or if 0 Dx@ - Dx! then again"])
	vm.exec.apply(vm,["xmi cx! 1 dx! begin 15 ms dx@ cx+! cx@ xmi < cx@ xma > or if 0 dx@ - dx! then again"])
}
window._2048={init:init,halt:halt,go:go,toUp:toUp,toLeft:toLeft,toRight:toRight,toDown:toDown};
window.x=function(cmd){vm.exec.apply(vm,[cmd])} // 例: x("#f00 c2 set fill")

module.exports=_2048;

});
require.alias("_2048/_2048.js", "_2048/index.js");
if (typeof exports == 'object') {
  module.exports = require('_2048');
} else if (typeof define == 'function' && define.amd) {
  define(function(){ return require('_2048'); });
} else {
  window['_2048'] = require('_2048');
}})();