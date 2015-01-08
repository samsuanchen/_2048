(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"c:\\ksana2015\\_2048\\_2048.js":[function(require,module,exports){
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
		' /* 例1: vm.exec.apply(vm,["1 Dx! xma for 20 ms Dx@ Cx+! next"]) */\n'+
		' /* 例2: vm.exec.apply(vm,["50 Cx! 1 Dx! begin xma for 20 ms Dx@ Cx+! next 0 Dx@ - Dx! again"]) */\n'+
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

},{"./jefvm.v3.js":"c:\\ksana2015\\_2048\\jefvm.v3.js","./jefvm.v3_ext.js":"c:\\ksana2015\\_2048\\jefvm.v3_ext.js","./jefvm.v3_tst.js":"c:\\ksana2015\\_2048\\jefvm.v3_tst.js"}],"c:\\ksana2015\\_2048\\index.js":[function(require,module,exports){
var runtime=require("ksana2015-webruntime");
runtime.boot("_2048",function(){
	//var Main=React.createElement(require("./src/main.jsx"));
	//ksana.mainComponent=React.render(Main,document.getElementById("main"));
	var _2048=require("./_2048.js");
	function doResize(){
		var body=document.getElementsByTagName('body')[0];
    	var width=body.clientWidth ||document.clientWidth ||window.innerWidth;
    	svg.setAttribute('width',width);
	}
	_2048.init();
	doResize();
});

},{"./_2048.js":"c:\\ksana2015\\_2048\\_2048.js","ksana2015-webruntime":"c:\\ksana2015\\node_modules\\ksana2015-webruntime\\index.js"}],"c:\\ksana2015\\_2048\\jefvm.v3.js":[function(require,module,exports){
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
},{}],"c:\\ksana2015\\_2048\\jefvm.v3_ext.js":[function(require,module,exports){
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

},{}],"c:\\ksana2015\\_2048\\jefvm.v3_tst.js":[function(require,module,exports){
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
},{}],"c:\\ksana2015\\node_modules\\ksana2015-webruntime\\checkbrowser.js":[function(require,module,exports){
/** @jsx React.DOM */
/*
convert to pure js
save -g reactify
*/
var E=React.createElement;

var hasksanagap=(typeof ksanagap!="undefined");
if (hasksanagap && (typeof console=="undefined" || typeof console.log=="undefined")) {
		window.console={log:ksanagap.log,error:ksanagap.error,debug:ksanagap.debug,warn:ksanagap.warn};
		console.log("install console output funciton");
}

var checkfs=function() {
	return (navigator && navigator.webkitPersistentStorage) || hasksanagap;
}
var featurechecks={
	"fs":checkfs
}
var checkbrowser = React.createClass({
	getInitialState:function() {

		var missingFeatures=this.getMissingFeatures();
		return {ready:false, missing:missingFeatures};
	},
	getMissingFeatures:function() {
		var feature=this.props.feature.split(",");
		var status=[];
		feature.map(function(f){
			var checker=featurechecks[f];
			if (checker) checker=checker();
			status.push([f,checker]);
		});
		return status.filter(function(f){return !f[1]});
	},
	downloadbrowser:function() {
		window.location="https://www.google.com/chrome/"
	},
	renderMissing:function() {
		var showMissing=function(m) {
			return E("div", null, m);
		}
		return (
		 E("div", {ref: "dialog1", className: "modal fade", "data-backdrop": "static"}, 
		    E("div", {className: "modal-dialog"}, 
		      E("div", {className: "modal-content"}, 
		        E("div", {className: "modal-header"}, 
		          E("button", {type: "button", className: "close", "data-dismiss": "modal", "aria-hidden": "true"}, "×"), 
		          E("h4", {className: "modal-title"}, "Browser Check")
		        ), 
		        E("div", {className: "modal-body"}, 
		          E("p", null, "Sorry but the following feature is missing"), 
		          this.state.missing.map(showMissing)
		        ), 
		        E("div", {className: "modal-footer"}, 
		          E("button", {onClick: this.downloadbrowser, type: "button", className: "btn btn-primary"}, "Download Google Chrome")
		        )
		      )
		    )
		  )
		 );
	},
	renderReady:function() {
		return E("span", null, "browser ok")
	},
	render:function(){
		return  (this.state.missing.length)?this.renderMissing():this.renderReady();
	},
	componentDidMount:function() {
		if (!this.state.missing.length) {
			this.props.onReady();
		} else {
			$(this.refs.dialog1.getDOMNode()).modal('show');
		}
	}
});

module.exports=checkbrowser;
},{}],"c:\\ksana2015\\node_modules\\ksana2015-webruntime\\downloader.js":[function(require,module,exports){

var userCancel=false;
var files=[];
var totalDownloadByte=0;
var targetPath="";
var tempPath="";
var nfile=0;
var baseurl="";
var result="";
var downloading=false;
var startDownload=function(dbid,_baseurl,_files) { //return download id
	var fs     = require("fs");
	var path   = require("path");

	
	files=_files.split("\uffff");
	if (downloading) return false; //only one session
	userCancel=false;
	totalDownloadByte=0;
	nextFile();
	downloading=true;
	baseurl=_baseurl;
	if (baseurl[baseurl.length-1]!='/')baseurl+='/';
	targetPath=ksanagap.rootPath+dbid+'/';
	tempPath=ksanagap.rootPath+".tmp/";
	result="";
	return true;
}

var nextFile=function() {
	setTimeout(function(){
		if (nfile==files.length) {
			nfile++;
			endDownload();
		} else {
			downloadFile(nfile++);	
		}
	},100);
}

var downloadFile=function(nfile) {
	var url=baseurl+files[nfile];
	var tmpfilename=tempPath+files[nfile];
	var mkdirp = require("./mkdirp");
	var fs     = require("fs");
	var http   = require("http");

	mkdirp.sync(path.dirname(tmpfilename));
	var writeStream = fs.createWriteStream(tmpfilename);
	var datalength=0;
	var request = http.get(url, function(response) {
		response.on('data',function(chunk){
			writeStream.write(chunk);
			totalDownloadByte+=chunk.length;
			if (userCancel) {
				writeStream.end();
				setTimeout(function(){nextFile();},100);
			}
		});
		response.on("end",function() {
			writeStream.end();
			setTimeout(function(){nextFile();},100);
		});
	});
}

var cancelDownload=function() {
	userCancel=true;
	endDownload();
}
var verify=function() {
	return true;
}
var endDownload=function() {
	nfile=files.length+1;//stop
	result="cancelled";
	downloading=false;
	if (userCancel) return;
	var fs     = require("fs");
	var mkdirp = require("./mkdirp");

	for (var i=0;i<files.length;i++) {
		var targetfilename=targetPath+files[i];
		var tmpfilename   =tempPath+files[i];
		mkdirp.sync(path.dirname(targetfilename));
		fs.renameSync(tmpfilename,targetfilename);
	}
	if (verify()) {
		result="success";
	} else {
		result="error";
	}
}

var downloadedByte=function() {
	return totalDownloadByte;
}
var doneDownload=function() {
	if (nfile>files.length) return result;
	else return "";
}
var downloadingFile=function() {
	return nfile-1;
}

var downloader={startDownload:startDownload, downloadedByte:downloadedByte,
	downloadingFile:downloadingFile, cancelDownload:cancelDownload,doneDownload:doneDownload};
module.exports=downloader;
},{"./mkdirp":"c:\\ksana2015\\node_modules\\ksana2015-webruntime\\mkdirp.js","fs":false,"http":false,"path":false}],"c:\\ksana2015\\node_modules\\ksana2015-webruntime\\fileinstaller.js":[function(require,module,exports){
/** @jsx React.DOM */

/* todo , optional kdb */

var HtmlFS=require("./htmlfs");
var html5fs=require("./html5fs");
var CheckBrowser=require("./checkbrowser");
var E=React.createElement;
  

var FileList = React.createClass({
	getInitialState:function() {
		return {downloading:false,progress:0};
	},
	updatable:function(f) {
        var classes="btn btn-warning";
        if (this.state.downloading) classes+=" disabled";
		if (f.hasUpdate) return   E("button", {className: classes, 
			"data-filename": f.filename, "data-url": f.url, 
	            onClick: this.download
	       }, "Update")
		else return null;
	},
	showLocal:function(f) {
        var classes="btn btn-danger";
        if (this.state.downloading) classes+=" disabled";
	  return E("tr", null, E("td", null, f.filename), 
	      E("td", null), 
	      E("td", {className: "pull-right"}, 
	      this.updatable(f), E("button", {className: classes, 
	               onClick: this.deleteFile, "data-filename": f.filename}, "Delete")
	        
	      )
	  )
	},  
	showRemote:function(f) { 
	  var classes="btn btn-warning";
	  if (this.state.downloading) classes+=" disabled";
	  return (E("tr", {"data-id": f.filename}, E("td", null, 
	      f.filename), 
	      E("td", null, f.desc), 
	      E("td", null, 
	      E("span", {"data-filename": f.filename, "data-url": f.url, 
	            className: classes, 
	            onClick: this.download}, "Download")
	      )
	  ));
	},
	showFile:function(f) {
	//	return <span data-id={f.filename}>{f.url}</span>
		return (f.ready)?this.showLocal(f):this.showRemote(f);
	},
	reloadDir:function() {
		this.props.action("reload");
	},
	download:function(e) {
		var url=e.target.dataset["url"];
		var filename=e.target.dataset["filename"];
		this.setState({downloading:true,progress:0,url:url});
		this.userbreak=false;
		html5fs.download(url,filename,function(){
			this.reloadDir();
			this.setState({downloading:false,progress:1});
			},function(progress,total){
				if (progress==0) {
					this.setState({message:"total "+total})
			 	}
			 	this.setState({progress:progress});
			 	//if user press abort return true
			 	return this.userbreak;
			}
		,this);
	},
	deleteFile:function( e) {
		var filename=e.target.attributes["data-filename"].value;
		this.props.action("delete",filename);
	},
	allFilesReady:function(e) {
		return this.props.files.every(function(f){ return f.ready});
	},
	dismiss:function() {
		$(this.refs.dialog1.getDOMNode()).modal('hide');
		this.props.action("dismiss");
	},
	abortdownload:function() {
		this.userbreak=true;
	},
	showProgress:function() {
	     if (this.state.downloading) {
	      var progress=Math.round(this.state.progress*100);
	      return (
	      	E("div", null, 
	      	"Downloading from ", this.state.url, 
	      E("div", {key: "progress", className: "progress col-md-8"}, 
	          E("div", {className: "progress-bar", role: "progressbar", 
	              "aria-valuenow": progress, "aria-valuemin": "0", 
	              "aria-valuemax": "100", style: {width: progress+"%"}}, 
	            progress, "%"
	          )
	        ), 
	        E("button", {onClick: this.abortdownload, 
	        	className: "btn btn-danger col-md-4"}, "Abort")
	        )
	        );
	      } else {
	      		if ( this.allFilesReady() ) {
	      			return E("button", {onClick: this.dismiss, className: "btn btn-success"}, "Ok")
	      		} else return null;
	      		
	      }
	},
	showUsage:function() {
		var percent=this.props.remainPercent;
           return (E("div", null, E("span", {className: "pull-left"}, "Usage:"), E("div", {className: "progress"}, 
		  E("div", {className: "progress-bar progress-bar-success progress-bar-striped", role: "progressbar", style: {width: percent+"%"}}, 
		    	percent+"%"
		  )
		)));
	},
	render:function() {
	  	return (
		E("div", {ref: "dialog1", className: "modal fade", "data-backdrop": "static"}, 
		    E("div", {className: "modal-dialog"}, 
		      E("div", {className: "modal-content"}, 
		        E("div", {className: "modal-header"}, 
		          E("h4", {className: "modal-title"}, "File Installer")
		        ), 
		        E("div", {className: "modal-body"}, 
		        	E("table", {className: "table"}, 
		        	E("tbody", null, 
		          	this.props.files.map(this.showFile)
		          	)
		          )
		        ), 
		        E("div", {className: "modal-footer"}, 
		        	this.showUsage(), 
		           this.showProgress()
		        )
		      )
		    )
		  )
		);
	},	
	componentDidMount:function() {
		$(this.refs.dialog1.getDOMNode()).modal('show');
	}
});
/*TODO kdb check version*/
var Filemanager = React.createClass({
	getInitialState:function() {
		var quota=this.getQuota();
		return {browserReady:false,noupdate:true,	requestQuota:quota,remain:0};
	},
	getQuota:function() {
		var q=this.props.quota||"128M";
		var unit=q[q.length-1];
		var times=1;
		if (unit=="M") times=1024*1024;
		else if (unit="K") times=1024;
		return parseInt(q) * times;
	},
	missingKdb:function() {
		if (ksanagap.platform!="chrome") return [];
		var missing=this.props.needed.filter(function(kdb){
			for (var i in html5fs.files) {
				if (html5fs.files[i][0]==kdb.filename) return false;
			}
			return true;
		},this);
		return missing;
	},
	getRemoteUrl:function(fn) {
		var f=this.props.needed.filter(function(f){return f.filename==fn});
		if (f.length ) return f[0].url;
	},
	genFileList:function(existing,missing){
		var out=[];
		for (var i in existing) {
			var url=this.getRemoteUrl(existing[i][0]);
			out.push({filename:existing[i][0], url :url, ready:true });
		}
		for (var i in missing) {
			out.push(missing[i]);
		}
		return out;
	},
	reload:function() {
		html5fs.readdir(function(files){
  			this.setState({files:this.genFileList(files,this.missingKdb())});
  		},this);
	 },
	deleteFile:function(fn) {
	  html5fs.rm(fn,function(){
	  	this.reload();
	  },this);
	},
	onQuoteOk:function(quota,usage) {
		if (ksanagap.platform!="chrome") {
			//console.log("onquoteok");
			this.setState({noupdate:true,missing:[],files:[],autoclose:true
				,quota:quota,remain:quota-usage,usage:usage});
			return;
		}
		//console.log("quote ok");
		var files=this.genFileList(html5fs.files,this.missingKdb());
		var that=this;
		that.checkIfUpdate(files,function(hasupdate) {
			var missing=this.missingKdb();
			var autoclose=this.props.autoclose;
			if (missing.length) autoclose=false;
			that.setState({autoclose:autoclose,
				quota:quota,usage:usage,files:files,
				missing:missing,
				noupdate:!hasupdate,
				remain:quota-usage});
		});
	},  
	onBrowserOk:function() {
	  this.totalDownloadSize();
	}, 
	dismiss:function() {
		this.props.onReady(this.state.usage,this.state.quota);
		setTimeout(function(){
			var modalin=$(".modal.in");
			if (modalin.modal) modalin.modal('hide');
		},500);
	}, 
	totalDownloadSize:function() {
		var files=this.missingKdb();
		var taskqueue=[],totalsize=0;
		for (var i=0;i<files.length;i++) {
			taskqueue.push(
				(function(idx){
					return (function(data){
						if (!(typeof data=='object' && data.__empty)) totalsize+=data;
						html5fs.getDownloadSize(files[idx].url,taskqueue.shift());
					});
				})(i)
			);
		}
		var that=this;
		taskqueue.push(function(data){	
			totalsize+=data;
			setTimeout(function(){that.setState({requireSpace:totalsize,browserReady:true})},0);
		});
		taskqueue.shift()({__empty:true});
	},
	checkIfUpdate:function(files,cb) {
		var taskqueue=[];
		for (var i=0;i<files.length;i++) {
			taskqueue.push(
				(function(idx){
					return (function(data){
						if (!(typeof data=='object' && data.__empty)) files[idx-1].hasUpdate=data;
						html5fs.checkUpdate(files[idx].url,files[idx].filename,taskqueue.shift());
					});
				})(i)
			);
		}
		var that=this;
		taskqueue.push(function(data){	
			files[files.length-1].hasUpdate=data;
			var hasupdate=files.some(function(f){return f.hasUpdate});
			if (cb) cb.apply(that,[hasupdate]);
		});
		taskqueue.shift()({__empty:true});
	},
	render:function(){
    		if (!this.state.browserReady) {   
      			return E(CheckBrowser, {feature: "fs", onReady: this.onBrowserOk})
    		} if (!this.state.quota || this.state.remain<this.state.requireSpace) {  
    			var quota=this.state.requestQuota;
    			if (this.state.usage+this.state.requireSpace>quota) {
    				quota=(this.state.usage+this.state.requireSpace)*1.5;
    			}
      			return E(HtmlFS, {quota: quota, autoclose: "true", onReady: this.onQuoteOk})
      		} else {
			if (!this.state.noupdate || this.missingKdb().length || !this.state.autoclose) {
				var remain=Math.round((this.state.usage/this.state.quota)*100);				
				return E(FileList, {action: this.action, files: this.state.files, remainPercent: remain})
			} else {
				setTimeout( this.dismiss ,0);
				return E("span", null, "Success");
			}
      		}
	},
	action:function() {
	  var args = Array.prototype.slice.call(arguments);
	  var type=args.shift();
	  var res=null, that=this;
	  if (type=="delete") {
	    this.deleteFile(args[0]);
	  }  else if (type=="reload") {
	  	this.reload();
	  } else if (type=="dismiss") {
	  	this.dismiss();
	  }
	}
});

module.exports=Filemanager;
},{"./checkbrowser":"c:\\ksana2015\\node_modules\\ksana2015-webruntime\\checkbrowser.js","./html5fs":"c:\\ksana2015\\node_modules\\ksana2015-webruntime\\html5fs.js","./htmlfs":"c:\\ksana2015\\node_modules\\ksana2015-webruntime\\htmlfs.js"}],"c:\\ksana2015\\node_modules\\ksana2015-webruntime\\html5fs.js":[function(require,module,exports){
/* emulate filesystem on html5 browser */
var get_head=function(url,field,cb){
	var xhr = new XMLHttpRequest();
	xhr.open("HEAD", url, true);
	xhr.onreadystatechange = function() {
			if (this.readyState == this.DONE) {
				cb(xhr.getResponseHeader(field));
			} else {
				if (this.status!==200&&this.status!==206) {
					cb("");
				}
			} 
	};
	xhr.send();	
}
var get_date=function(url,cb) {
	get_head(url,"Last-Modified",function(value){
		cb(value);
	});
}
var get_size=function(url, cb) {
	get_head(url,"Content-Length",function(value){
		cb(parseInt(value));
	});
};
var checkUpdate=function(url,fn,cb) {
	if (!url) {
		cb(false);
		return;
	}
	get_date(url,function(d){
		API.fs.root.getFile(fn, {create: false, exclusive: false}, function(fileEntry) {
			fileEntry.getMetadata(function(metadata){
				var localDate=Date.parse(metadata.modificationTime);
				var urlDate=Date.parse(d);
				cb(urlDate>localDate);
			});
		},function(){
			cb(false);
		});
	});
}
var download=function(url,fn,cb,statuscb,context) {
	 var totalsize=0,batches=null,written=0;
	 var fileEntry=0, fileWriter=0;
	 var createBatches=function(size) {
		var bytes=1024*1024, out=[];
		var b=Math.floor(size / bytes);
		var last=size %bytes;
		for (var i=0;i<=b;i++) {
			out.push(i*bytes);
		}
		out.push(b*bytes+last);
		return out;
	 }
	 var finish=function() {
		 rm(fn,function(){
				fileEntry.moveTo(fileEntry.filesystem.root, fn,function(){
					setTimeout( cb.bind(context,false) , 0) ; 
				},function(e){
					console.log("failed",e)
				});
		 },this); 
	 };
		var tempfn="temp.kdb";
		var batch=function(b) {
		var abort=false;
		var xhr = new XMLHttpRequest();
		var requesturl=url+"?"+Math.random();
		xhr.open('get', requesturl, true);
		xhr.setRequestHeader('Range', 'bytes='+batches[b]+'-'+(batches[b+1]-1));
		xhr.responseType = 'blob';    
		xhr.addEventListener('load', function() {
			var blob=this.response;
			fileEntry.createWriter(function(fileWriter) {
				fileWriter.seek(fileWriter.length);
				fileWriter.write(blob);
				written+=blob.size;
				fileWriter.onwriteend = function(e) {
					if (statuscb) {
						abort=statuscb.apply(context,[ fileWriter.length / totalsize,totalsize ]);
						if (abort) setTimeout( cb.bind(context,false) , 0) ;
				 	}
					b++;
					if (!abort) {
						if (b<batches.length-1) setTimeout(batch.bind(context,b),0);
						else                    finish();
				 	}
			 	};
			}, console.error);
		},false);
		xhr.send();
	}

	get_size(url,function(size){
		totalsize=size;
		if (!size) {
			if (cb) cb.apply(context,[false]);
		} else {//ready to download
			rm(tempfn,function(){
				 batches=createBatches(size);
				 if (statuscb) statuscb.apply(context,[ 0, totalsize ]);
				 API.fs.root.getFile(tempfn, {create: 1, exclusive: false}, function(_fileEntry) {
							fileEntry=_fileEntry;
						batch(0);
				 });
			},this);
		}
	});
}

var readFile=function(filename,cb,context) {
	API.fs.root.getFile(filename, function(fileEntry) {
			var reader = new FileReader();
			reader.onloadend = function(e) {
					if (cb) cb.apply(cb,[this.result]);
				};            
	}, console.error);
}
var writeFile=function(filename,buf,cb,context){
	API.fs.root.getFile(filename, {create: true, exclusive: true}, function(fileEntry) {
			fileEntry.createWriter(function(fileWriter) {
				fileWriter.write(buf);
				fileWriter.onwriteend = function(e) {
					if (cb) cb.apply(cb,[buf.byteLength]);
				};            
			}, console.error);
	}, console.error);
}

var readdir=function(cb,context) {
	var dirReader = API.fs.root.createReader();
	var out=[],that=this;
	dirReader.readEntries(function(entries) {
		if (entries.length) {
			for (var i = 0, entry; entry = entries[i]; ++i) {
				if (entry.isFile) {
					out.push([entry.name,entry.toURL ? entry.toURL() : entry.toURI()]);
				}
			}
		}
		API.files=out;
		if (cb) cb.apply(context,[out]);
	}, function(){
		if (cb) cb.apply(context,[null]);
	});
}
var getFileURL=function(filename) {
	if (!API.files ) return null;
	var file= API.files.filter(function(f){return f[0]==filename});
	if (file.length) return file[0][1];
}
var rm=function(filename,cb,context) {
	var url=getFileURL(filename);
	if (url) rmURL(url,cb,context);
	else if (cb) cb.apply(context,[false]);
}

var rmURL=function(filename,cb,context) {
	webkitResolveLocalFileSystemURL(filename, function(fileEntry) {
		fileEntry.remove(function() {
			if (cb) cb.apply(context,[true]);
		}, console.error);
	},  function(e){
		if (cb) cb.apply(context,[false]);//no such file
	});
}
function errorHandler(e) {
	console.error('Error: ' +e.name+ " "+e.message);
}
var initfs=function(grantedBytes,cb,context) {
	webkitRequestFileSystem(PERSISTENT, grantedBytes,  function(fs) {
		API.fs=fs;
		API.quota=grantedBytes;
		readdir(function(){
			API.initialized=true;
			cb.apply(context,[grantedBytes,fs]);
		},context);
	}, errorHandler);
}
var init=function(quota,cb,context) {
	navigator.webkitPersistentStorage.requestQuota(quota, 
			function(grantedBytes) {
				initfs(grantedBytes,cb,context);
		}, errorHandler
	);
}
var queryQuota=function(cb,context) {
	var that=this;
	navigator.webkitPersistentStorage.queryUsageAndQuota( 
	 function(usage,quota){
			initfs(quota,function(){
				cb.apply(context,[usage,quota]);
			},context);
	});
}
var API={
	init:init
	,readdir:readdir
	,checkUpdate:checkUpdate
	,rm:rm
	,rmURL:rmURL
	,getFileURL:getFileURL
	,writeFile:writeFile
	,readFile:readFile
	,download:download
	,get_head:get_head
	,get_date:get_date
	,get_size:get_size
	,getDownloadSize:get_size
	,queryQuota:queryQuota
}
module.exports=API;
},{}],"c:\\ksana2015\\node_modules\\ksana2015-webruntime\\htmlfs.js":[function(require,module,exports){
var html5fs=require("./html5fs");
var E=React.createElement;

var htmlfs = React.createClass({
	getInitialState:function() { 
		return {ready:false, quota:0,usage:0,Initialized:false,autoclose:this.props.autoclose};
	},
	initFilesystem:function() {
		var quota=this.props.quota||1024*1024*128; // default 128MB
		quota=parseInt(quota);
		html5fs.init(quota,function(q){
			this.dialog=false;
			$(this.refs.dialog1.getDOMNode()).modal('hide');
			this.setState({quota:q,autoclose:true});
		},this);
	},
	welcome:function() {
		return (
		E("div", {ref: "dialog1", className: "modal fade", id: "myModal", "data-backdrop": "static"}, 
		    E("div", {className: "modal-dialog"}, 
		      E("div", {className: "modal-content"}, 
		        E("div", {className: "modal-header"}, 
		          E("h4", {className: "modal-title"}, "Welcome")
		        ), 
		        E("div", {className: "modal-body"}, 
		          "Browser will ask for your confirmation."
		        ), 
		        E("div", {className: "modal-footer"}, 
		          E("button", {onClick: this.initFilesystem, type: "button", 
		            className: "btn btn-primary"}, "Initialize File System")
		        )
		      )
		    )
		  )
		 );
	},
	renderDefault:function(){
		var used=Math.floor(this.state.usage/this.state.quota *100);
		var more=function() {
			if (used>50) return E("button", {type: "button", className: "btn btn-primary"}, "Allocate More");
			else null;
		}
		return (
		E("div", {ref: "dialog1", className: "modal fade", id: "myModal", "data-backdrop": "static"}, 
		    E("div", {className: "modal-dialog"}, 
		      E("div", {className: "modal-content"}, 
		        E("div", {className: "modal-header"}, 
		          E("h4", {className: "modal-title"}, "Sandbox File System")
		        ), 
		        E("div", {className: "modal-body"}, 
		          E("div", {className: "progress"}, 
		            E("div", {className: "progress-bar", role: "progressbar", style: {width: used+"%"}}, 
		               used, "%"
		            )
		          ), 
		          E("span", null, this.state.quota, " total , ", this.state.usage, " in used")
		        ), 
		        E("div", {className: "modal-footer"}, 
		          E("button", {onClick: this.dismiss, type: "button", className: "btn btn-default", "data-dismiss": "modal"}, "Close"), 
		          more()
		        )
		      )
		    )
		  )
		  );
	},
	dismiss:function() {
		var that=this;
		setTimeout(function(){
			that.props.onReady(that.state.quota,that.state.usage);	
		},0);
	},
	queryQuota:function() {
		if (ksanagap.platform=="chrome") {
			html5fs.queryQuota(function(usage,quota){
				this.setState({usage:usage,quota:quota,initialized:true});
			},this);			
		} else {
			this.setState({usage:333,quota:1000*1000*1024,initialized:true,autoclose:true});
		}
	},
	render:function() {
		var that=this;
		if (!this.state.quota || this.state.quota<this.props.quota) {
			if (this.state.initialized) {
				this.dialog=true;
				return this.welcome();	
			} else {
				return E("span", null, "checking quota");
			}			
		} else {
			if (!this.state.autoclose) {
				this.dialog=true;
				return this.renderDefault(); 
			}
			this.dismiss();
			this.dialog=false;
			return null;
		}
	},
	componentDidMount:function() {
		if (!this.state.quota) {
			this.queryQuota();

		};
	},
	componentDidUpdate:function() {
		if (this.dialog) $(this.refs.dialog1.getDOMNode()).modal('show');
	}
});

module.exports=htmlfs;
},{"./html5fs":"c:\\ksana2015\\node_modules\\ksana2015-webruntime\\html5fs.js"}],"c:\\ksana2015\\node_modules\\ksana2015-webruntime\\index.js":[function(require,module,exports){
var ksana={"platform":"remote"};
if (typeof window!="undefined") {
	window.ksana=ksana;
	if (typeof ksanagap=="undefined") {
		window.ksanagap=require("./ksanagap"); //compatible layer with mobile
	}
}
if (typeof process !="undefined") {
	if (process.versions && process.versions["node-webkit"]) {
  		if (typeof nodeRequire!="undefined") ksana.require=nodeRequire;
  		ksana.platform="node-webkit";
  		window.ksanagap.platform="node-webkit";
		var ksanajs=require("fs").readFileSync("ksana.js","utf8").trim();
		ksana.js=JSON.parse(ksanajs.substring(14,ksanajs.length-1));
		window.kfs=require("./kfs");
  	}
} else if (typeof chrome!="undefined"){//} && chrome.fileSystem){
//	window.ksanagap=require("./ksanagap"); //compatible layer with mobile
	window.ksanagap.platform="chrome";
	window.kfs=require("./kfs_html5");
	require("./livereload")();
	ksana.platform="chrome";
} else {
	if (typeof ksanagap!="undefined" && typeof fs!="undefined") {//mobile
		var ksanajs=fs.readFileSync("ksana.js","utf8").trim(); //android extra \n at the end
		ksana.js=JSON.parse(ksanajs.substring(14,ksanajs.length-1));
		ksana.platform=ksanagap.platform;
		if (typeof ksanagap.android !="undefined") {
			ksana.platform="android";
		}
	}
}
var timer=null;
var boot=function(appId,cb) {
	ksana.appId=appId;
	if (ksanagap.platform=="chrome") { //need to wait for jsonp ksana.js
		timer=setInterval(function(){
			if (ksana.ready){
				clearInterval(timer);
				if (ksana.js && ksana.js.files && ksana.js.files.length) {
					require("./installkdb")(ksana.js,cb);
				} else {
					cb();		
				}
			}
		},300);
	} else {
		cb();
	}
}

module.exports={boot:boot
	,htmlfs:require("./htmlfs")
	,html5fs:require("./html5fs")
	,liveupdate:require("./liveupdate")
	,fileinstaller:require("./fileinstaller")
	,downloader:require("./downloader")
	,installkdb:require("./installkdb")
};
},{"./downloader":"c:\\ksana2015\\node_modules\\ksana2015-webruntime\\downloader.js","./fileinstaller":"c:\\ksana2015\\node_modules\\ksana2015-webruntime\\fileinstaller.js","./html5fs":"c:\\ksana2015\\node_modules\\ksana2015-webruntime\\html5fs.js","./htmlfs":"c:\\ksana2015\\node_modules\\ksana2015-webruntime\\htmlfs.js","./installkdb":"c:\\ksana2015\\node_modules\\ksana2015-webruntime\\installkdb.js","./kfs":"c:\\ksana2015\\node_modules\\ksana2015-webruntime\\kfs.js","./kfs_html5":"c:\\ksana2015\\node_modules\\ksana2015-webruntime\\kfs_html5.js","./ksanagap":"c:\\ksana2015\\node_modules\\ksana2015-webruntime\\ksanagap.js","./livereload":"c:\\ksana2015\\node_modules\\ksana2015-webruntime\\livereload.js","./liveupdate":"c:\\ksana2015\\node_modules\\ksana2015-webruntime\\liveupdate.js","fs":false}],"c:\\ksana2015\\node_modules\\ksana2015-webruntime\\installkdb.js":[function(require,module,exports){
var Fileinstaller=require("./fileinstaller");

var getRequire_kdb=function() {
    var required=[];
    ksana.js.files.map(function(f){
      if (f.indexOf(".kdb")==f.length-4) {
        var slash=f.lastIndexOf("/");
        if (slash>-1) {
          var dbid=f.substring(slash+1,f.length-4);
          required.push({url:f,dbid:dbid,filename:dbid+".kdb"});
        } else {
          var dbid=f.substring(0,f.length-4);
          required.push({url:ksana.js.baseurl+f,dbid:dbid,filename:f});
        }        
      }
    });
    return required;
}
var callback=null;
var onReady=function() {
	callback();
}
var openFileinstaller=function(keep) {
	var require_kdb=getRequire_kdb().map(function(db){
	  return {
	    url:window.location.origin+window.location.pathname+db.dbid+".kdb",
	    dbdb:db.dbid,
	    filename:db.filename
	  }
	})
	return React.createElement(Fileinstaller, {quota: "512M", autoclose: !keep, needed: require_kdb, 
	                 onReady: onReady});
}
var installkdb=function(ksanajs,cb,context) {
	console.log(ksanajs.files);
	React.render(openFileinstaller(),document.getElementById("main"));
	callback=cb;
}
module.exports=installkdb;
},{"./fileinstaller":"c:\\ksana2015\\node_modules\\ksana2015-webruntime\\fileinstaller.js"}],"c:\\ksana2015\\node_modules\\ksana2015-webruntime\\kfs.js":[function(require,module,exports){
//Simulate feature in ksanagap
/* 
  runs on node-webkit only
*/

var readDir=function(path) { //simulate Ksanagap function
	var fs=nodeRequire("fs");
	path=path||"..";
	var dirs=[];
	if (path[0]==".") {
		if (path==".") dirs=fs.readdirSync(".");
		else {
			dirs=fs.readdirSync("..");
		}
	} else {
		dirs=fs.readdirSync(path);
	}

	return dirs.join("\uffff");
}
var listApps=function() {
	var fs=nodeRequire("fs");
	var ksanajsfile=function(d) {return "../"+d+"/ksana.js"};
	var dirs=fs.readdirSync("..").filter(function(d){
				return fs.statSync("../"+d).isDirectory() && d[0]!="."
				   && fs.existsSync(ksanajsfile(d));
	});
	
	var out=dirs.map(function(d){
		var content=fs.readFileSync(ksanajsfile(d),"utf8");
  	content=content.replace("})","}");
  	content=content.replace("jsonp_handler(","");
		var obj= JSON.parse(content);
		obj.dbid=d;
		obj.path=d;
		return obj;
	})
	return JSON.stringify(out);
}



var kfs={readDir:readDir,listApps:listApps};

module.exports=kfs;
},{}],"c:\\ksana2015\\node_modules\\ksana2015-webruntime\\kfs_html5.js":[function(require,module,exports){
var readDir=function(){
	return [];
}
var listApps=function(){
	return [];
}
module.exports={readDir:readDir,listApps:listApps};
},{}],"c:\\ksana2015\\node_modules\\ksana2015-webruntime\\ksanagap.js":[function(require,module,exports){
var appname="installer";
var switchApp=function(path) {
	var fs=require("fs");
	path="../"+path;
	appname=path;
	document.location.href= path+"/index.html"; 
	process.chdir(path);
}
var downloader={};
var rootPath="";

var deleteApp=function(app) {
	console.error("not allow on PC, do it in File Explorer/ Finder");
}
var username=function() {
	return "";
}
var useremail=function() {
	return ""
}
var runtime_version=function() {
	return "1.4";
}

//copy from liveupdate
var jsonp=function(url,dbid,callback,context) {
  var script=document.getElementById("jsonp2");
  if (script) {
    script.parentNode.removeChild(script);
  }
  window.jsonp_handler=function(data) {
    if (typeof data=="object") {
      data.dbid=dbid;
      callback.apply(context,[data]);    
    }  
  }
  window.jsonp_error_handler=function() {
    console.error("url unreachable",url);
    callback.apply(context,[null]);
  }
  script=document.createElement('script');
  script.setAttribute('id', "jsonp2");
  script.setAttribute('onerror', "jsonp_error_handler()");
  url=url+'?'+(new Date().getTime());
  script.setAttribute('src', url);
  document.getElementsByTagName('head')[0].appendChild(script); 
}

var ksanagap={
	platform:"node-webkit",
	startDownload:downloader.startDownload,
	downloadedByte:downloader.downloadedByte,
	downloadingFile:downloader.downloadingFile,
	cancelDownload:downloader.cancelDownload,
	doneDownload:downloader.doneDownload,
	switchApp:switchApp,
	rootPath:rootPath,
	deleteApp: deleteApp,
	username:username, //not support on PC
	useremail:username,
	runtime_version:runtime_version,
	
}

if (typeof process!="undefined") {
	var ksanajs=require("fs").readFileSync("./ksana.js","utf8").trim();
	downloader=require("./downloader");
	console.log(ksanajs);
	//ksana.js=JSON.parse(ksanajs.substring(14,ksanajs.length-1));
	rootPath=process.cwd();
	rootPath=require("path").resolve(rootPath,"..").replace(/\\/g,"/")+'/';
	ksana.ready=true;
} else{
	var url=window.location.origin+window.location.pathname.replace("index.html","")+"ksana.js";
	jsonp(url,appname,function(data){
		ksana.js=data;
		ksana.ready=true;
	});
}
module.exports=ksanagap;
},{"./downloader":"c:\\ksana2015\\node_modules\\ksana2015-webruntime\\downloader.js","fs":false,"path":false}],"c:\\ksana2015\\node_modules\\ksana2015-webruntime\\livereload.js":[function(require,module,exports){
var started=false;
var timer=null;
var bundledate=null;
var get_date=require("./html5fs").get_date;
var checkIfBundleUpdated=function() {
	get_date("bundle.js",function(date){
		if (bundledate &&bundledate!=date){
			location.reload();
		}
		bundledate=date;
	});
}
var livereload=function() {
	if (started) return;

	timer1=setInterval(function(){
		checkIfBundleUpdated();
	},2000);
	started=true;
}

module.exports=livereload;
},{"./html5fs":"c:\\ksana2015\\node_modules\\ksana2015-webruntime\\html5fs.js"}],"c:\\ksana2015\\node_modules\\ksana2015-webruntime\\liveupdate.js":[function(require,module,exports){

var jsonp=function(url,dbid,callback,context) {
  var script=document.getElementById("jsonp");
  if (script) {
    script.parentNode.removeChild(script);
  }
  window.jsonp_handler=function(data) {
    //console.log("receive from ksana.js",data);
    if (typeof data=="object") {
      if (typeof data.dbid=="undefined") {
        data.dbid=dbid;
      }
      callback.apply(context,[data]);
    }  
  }

  window.jsonp_error_handler=function() {
    console.error("url unreachable",url);
    callback.apply(context,[null]);
  }

  script=document.createElement('script');
  script.setAttribute('id', "jsonp");
  script.setAttribute('onerror', "jsonp_error_handler()");
  url=url+'?'+(new Date().getTime());
  script.setAttribute('src', url);
  document.getElementsByTagName('head')[0].appendChild(script); 
}
var runtime_version_ok=function(minruntime) {
  if (!minruntime) return true;//not mentioned.
  var min=parseFloat(minruntime);
  var runtime=parseFloat( ksanagap.runtime_version()||"1.0");
  if (min>runtime) return false;
  return true;
}

var needToUpdate=function(fromjson,tojson) {
  var needUpdates=[];
  for (var i=0;i<fromjson.length;i++) { 
    var to=tojson[i];
    var from=fromjson[i];
    var newfiles=[],newfilesizes=[],removed=[];
    
    if (!to) continue; //cannot reach host
    if (!runtime_version_ok(to.minruntime)) {
      console.warn("runtime too old, need "+to.minruntime);
      continue; 
    }
    if (!from.filedates) {
      console.warn("missing filedates in ksana.js of "+from.dbid);
      continue;
    }
    from.filedates.map(function(f,idx){
      var newidx=to.files.indexOf( from.files[idx]);
      if (newidx==-1) {
        //file removed in new version
        removed.push(from.files[idx]);
      } else {
        var fromdate=Date.parse(f);
        var todate=Date.parse(to.filedates[newidx]);
        if (fromdate<todate) {
          newfiles.push( to.files[newidx] );
          newfilesizes.push(to.filesizes[newidx]);
        }        
      }
    });
    if (newfiles.length) {
      from.newfiles=newfiles;
      from.newfilesizes=newfilesizes;
      from.removed=removed;
      needUpdates.push(from);
    }
  }
  return needUpdates;
}
var getUpdatables=function(apps,cb,context) {
  getRemoteJson(apps,function(jsons){
    var hasUpdates=needToUpdate(apps,jsons);
    cb.apply(context,[hasUpdates]);
  },context);
}
var getRemoteJson=function(apps,cb,context) {
  var taskqueue=[],output=[];
  var makecb=function(app){
    return function(data){
        if (!(data && typeof data =='object' && data.__empty)) output.push(data);
        if (!app.baseurl) {
          taskqueue.shift({__empty:true});
        } else {
          var url=app.baseurl+"/ksana.js";    
          console.log(url);
          jsonp( url ,app.dbid,taskqueue.shift(), context);           
        }
    };
  };
  apps.forEach(function(app){taskqueue.push(makecb(app))});

  taskqueue.push(function(data){
    output.push(data);
    cb.apply(context,[output]);
  });

  taskqueue.shift()({__empty:true}); //run the task
}
var humanFileSize=function(bytes, si) {
    var thresh = si ? 1000 : 1024;
    if(bytes < thresh) return bytes + ' B';
    var units = si ? ['kB','MB','GB','TB','PB','EB','ZB','YB'] : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
    var u = -1;
    do {
        bytes /= thresh;
        ++u;
    } while(bytes >= thresh);
    return bytes.toFixed(1)+' '+units[u];
};

var start=function(ksanajs,cb,context){
  var files=ksanajs.newfiles||ksanajs.files;
  var baseurl=ksanajs.baseurl|| "http://127.0.0.1:8080/"+ksanajs.dbid+"/";
  var started=ksanagap.startDownload(ksanajs.dbid,baseurl,files.join("\uffff"));
  cb.apply(context,[started]);
}
var status=function(){
  var nfile=ksanagap.downloadingFile();
  var downloadedByte=ksanagap.downloadedByte();
  var done=ksanagap.doneDownload();
  return {nfile:nfile,downloadedByte:downloadedByte, done:done};
}

var cancel=function(){
  return ksanagap.cancelDownload();
}

var liveupdate={ humanFileSize: humanFileSize, 
  needToUpdate: needToUpdate , jsonp:jsonp, 
  getUpdatables:getUpdatables,
  start:start,
  cancel:cancel,
  status:status
  };
module.exports=liveupdate;
},{}],"c:\\ksana2015\\node_modules\\ksana2015-webruntime\\mkdirp.js":[function(require,module,exports){
function mkdirP (p, mode, f, made) {
     var path = nodeRequire('path');
     var fs = nodeRequire('fs');
	
    if (typeof mode === 'function' || mode === undefined) {
        f = mode;
        mode = 0x1FF & (~process.umask());
    }
    if (!made) made = null;

    var cb = f || function () {};
    if (typeof mode === 'string') mode = parseInt(mode, 8);
    p = path.resolve(p);

    fs.mkdir(p, mode, function (er) {
        if (!er) {
            made = made || p;
            return cb(null, made);
        }
        switch (er.code) {
            case 'ENOENT':
                mkdirP(path.dirname(p), mode, function (er, made) {
                    if (er) cb(er, made);
                    else mkdirP(p, mode, cb, made);
                });
                break;

            // In the case of any other error, just see if there's a dir
            // there already.  If so, then hooray!  If not, then something
            // is borked.
            default:
                fs.stat(p, function (er2, stat) {
                    // if the stat fails, then that's super weird.
                    // let the original error be the failure reason.
                    if (er2 || !stat.isDirectory()) cb(er, made)
                    else cb(null, made);
                });
                break;
        }
    });
}

mkdirP.sync = function sync (p, mode, made) {
    var path = nodeRequire('path');
    var fs = nodeRequire('fs');
    if (mode === undefined) {
        mode = 0x1FF & (~process.umask());
    }
    if (!made) made = null;

    if (typeof mode === 'string') mode = parseInt(mode, 8);
    p = path.resolve(p);

    try {
        fs.mkdirSync(p, mode);
        made = made || p;
    }
    catch (err0) {
        switch (err0.code) {
            case 'ENOENT' :
                made = sync(path.dirname(p), mode, made);
                sync(p, mode, made);
                break;

            // In the case of any other error, just see if there's a dir
            // there already.  If so, then hooray!  If not, then something
            // is borked.
            default:
                var stat;
                try {
                    stat = fs.statSync(p);
                }
                catch (err1) {
                    throw err0;
                }
                if (!stat.isDirectory()) throw err0;
                break;
        }
    }

    return made;
};

module.exports = mkdirP.mkdirp = mkdirP.mkdirP = mkdirP;

},{}]},{},["c:\\ksana2015\\_2048\\index.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uXFwuLlxcVXNlcnNcXGNoZW5cXEFwcERhdGFcXFJvYW1pbmdcXG5wbVxcbm9kZV9tb2R1bGVzXFxicm93c2VyaWZ5XFxub2RlX21vZHVsZXNcXGJyb3dzZXItcGFja1xcX3ByZWx1ZGUuanMiLCJfMjA0OC5qcyIsImluZGV4LmpzIiwiamVmdm0udjMuanMiLCJqZWZ2bS52M19leHQuanMiLCJqZWZ2bS52M190c3QuanMiLCIuLlxcbm9kZV9tb2R1bGVzXFxrc2FuYTIwMTUtd2VicnVudGltZVxcY2hlY2ticm93c2VyLmpzIiwiLi5cXG5vZGVfbW9kdWxlc1xca3NhbmEyMDE1LXdlYnJ1bnRpbWVcXGRvd25sb2FkZXIuanMiLCIuLlxcbm9kZV9tb2R1bGVzXFxrc2FuYTIwMTUtd2VicnVudGltZVxcZmlsZWluc3RhbGxlci5qcyIsIi4uXFxub2RlX21vZHVsZXNcXGtzYW5hMjAxNS13ZWJydW50aW1lXFxodG1sNWZzLmpzIiwiLi5cXG5vZGVfbW9kdWxlc1xca3NhbmEyMDE1LXdlYnJ1bnRpbWVcXGh0bWxmcy5qcyIsIi4uXFxub2RlX21vZHVsZXNcXGtzYW5hMjAxNS13ZWJydW50aW1lXFxpbmRleC5qcyIsIi4uXFxub2RlX21vZHVsZXNcXGtzYW5hMjAxNS13ZWJydW50aW1lXFxpbnN0YWxsa2RiLmpzIiwiLi5cXG5vZGVfbW9kdWxlc1xca3NhbmEyMDE1LXdlYnJ1bnRpbWVcXGtmcy5qcyIsIi4uXFxub2RlX21vZHVsZXNcXGtzYW5hMjAxNS13ZWJydW50aW1lXFxrZnNfaHRtbDUuanMiLCIuLlxcbm9kZV9tb2R1bGVzXFxrc2FuYTIwMTUtd2VicnVudGltZVxca3NhbmFnYXAuanMiLCIuLlxcbm9kZV9tb2R1bGVzXFxrc2FuYTIwMTUtd2VicnVudGltZVxcbGl2ZXJlbG9hZC5qcyIsIi4uXFxub2RlX21vZHVsZXNcXGtzYW5hMjAxNS13ZWJydW50aW1lXFxsaXZldXBkYXRlLmpzIiwiLi5cXG5vZGVfbW9kdWxlc1xca3NhbmEyMDE1LXdlYnJ1bnRpbWVcXG1rZGlycC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbFZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIG5ldzIwNDguanMgLy8gaHR0cDovL2xhYnMucmFtcGludGVyYWN0aXZlLmNvLnVrL3RvdWNoU3dpcGUvZGVtb3MvQmFzaWNfc3dpcGUuaHRtbFxyXG52YXIgbWF4PWxvY2FsU3RvcmFnZS5nZXRJdGVtKCdtYXgyMDQ4Jyk7IG1heD1tYXg/cGFyc2VJbnQobWF4KTowOyAvLyDoroDlj5Yg6auY5YiGIOe0gOmMhFxyXG4kKFwiI21heFwiKS50ZXh0KFwi5pyA6auYXCIgKyBtYXgpO1xyXG52YXIvKuagvOWFp+aVuOWAvCovbG9jYXRpb25zLC8q55W25YmN5b6X5YiGKi9zY29yZSwvKuWJqemkmOenkuaVuCovdGltZTtcclxudmFyIHRHbyxub21vcmU7XHJcbnZhciBjb2xvcnM9W1wiI0ZGRlwiLFwiI0ZCRlwiLFwiI0JCQlwiLFwiI0FDRVwiLFwiIzFFRlwiLFwiI0ZGQlwiLFwiI0NGQVwiLFwiI0ZEQlwiLFwiI0Y5RlwiLFwiI0RERFwiLFwiIzk5RlwiLFwiIzlGOVwiXTtcclxuZnVuY3Rpb24gc2hvd3RpbWUoKXskKFwiI3RpbWVcIikudGV4dChcIuaZgumWk1wiKygrK3RpbWUpK1wi56eSXCIpO31cclxuZnVuY3Rpb24gbmV3TnVtYmVyKCl7IC8vIOmaqOapn+WcqOafkOepuuagvOeUoueUnyAyIOaIliA0XHJcblx0dmFyIHA9cmFuZG9tTG9jYXRpb24oKTsgLy8gcCBjY291bGQgYmUgMFxyXG5cdGlmKHAhPT11bmRlZmluZWQpIGxvY2F0aW9uc1twXT1NYXRoLnJhbmRvbSgpPDAuOD8yOjQ7XHJcbn1cclxuZnVuY3Rpb24gbm9Nb3JlKCl7XHJcblx0aGFsdCgpLG5vbW9yZT0xO1xyXG5cdCQoJyNzY29yZScpWzBdLnN0eWxlLmJhY2tncm91bmQ9J3llbGxvdyc7XHJcblx0JCgnI21haW5ib3gnKVswXS5zdHlsZS5iYWNrZ3JvdW5kPScjZmNjJztcclxufVxyXG5mdW5jdGlvbiBpc0VuZCgpIHtcclxuXHRpZiAodGltZTwwfHwobG9jYXRpb25zLmluZGV4T2YoMCk8MCAmJiBpc0VuZEgoKSAmJiBpc0VuZFYoKSkpIHtcclxuXHQvLyAo6YC+5pmCKSDmiJbogIUgKOeEoSDnqbrmoLwg5LiUIOeEoeazlSDlt6blj7Mg5qmr5ZCR56e75YuVIOS5nyDnhKHms5Ug5LiK5LiLIOe4seWQkeenu+WLlSlcclxuXHRcdG5vTW9yZSgpO1xyXG5cdFx0cmV0dXJuIHRydWVcclxuXHR9XHJcbn1cclxuZnVuY3Rpb24gaXNFbmRIKCl7IHZhciB3LGosaSxrOyAvLyDnhKHms5Ug5bem5Y+zIOapq+WQkeenu+WLlVxyXG5cdGZvciAoaj0tMTsgKytqPDQ7KSB7XHJcblx0XHRpPTQqaiwgdz1sb2NhdGlvbnMuc2xpY2UoaSxpKzQpO1xyXG5cdFx0Zm9yIChrPS0xOyArK2s8MzspXHJcblx0XHRcdGlmICh3W2tdPT09d1trKzFdKSByZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cdHJldHVybiB0cnVlO1xyXG59XHJcbmZ1bmN0aW9uIGlzRW5kVigpeyB2YXIgdyxqLGk7IC8vIOeEoeazlSDkuIrkuIsg57ix5ZCR56e75YuVXHJcblx0dyA9IG5ldyBBcnJheSgpO1xyXG5cdGZvciAoaj0gMDsgajw0OyBqKyspIHtcclxuXHRcdGZvciAoaT0wOyBpPDM7IGkrKylcclxuXHRcdFx0aWYgKGxvY2F0aW9uc1s0Kmkral09PT1sb2NhdGlvbnNbNCppKzQral0pIHJldHVybiBmYWxzZTtcclxuXHR9XHJcblx0cmV0dXJuIHRydWU7XHJcbn1cclxuZnVuY3Rpb24gdG9MZWZ0UGFnZSgpIHtcclxufVxyXG5mdW5jdGlvbiB0b1JpZ2h0UGFnZSgpIHtcclxufVxyXG5mdW5jdGlvbiB0b0xlZnQoKSB7IGlmKCF0R28pcmV0dXJuOyAvLyDlkJHlt6ZcclxuXHRmb3IodmFyIGk9MDtpPDQ7aSsrKXtcclxuXHRcdHZhciByPWdldEFycmF5TGVmdChpKTsgcj1wcm9jZXNzQXJyYXkocik7IHB1dEFycmF5TGVmdChpLHIpO1xyXG5cdH1cclxuXHRuZXdOdW1iZXIoKSxwYWludCgpO1xyXG59XHJcbmZ1bmN0aW9uIHRvUmlnaHQoKSB7IGlmKCF0R28pcmV0dXJuOyAvLyDlkJHlj7NcclxuXHRmb3IodmFyIGk9MDtpPDQ7aSsrKXtcclxuXHRcdHZhciByPWdldEFycmF5UmlnaHQoaSk7IHI9cHJvY2Vzc0FycmF5KHIpOyBwdXRBcnJheVJpZ2h0KGkscik7XHJcblx0fVxyXG5cdG5ld051bWJlcigpLHBhaW50KCk7XHJcbn1cclxuZnVuY3Rpb24gdG9VcCgpIHsgaWYoIXRHbylyZXR1cm47IC8vIOWQkeS4ilxyXG5cdGZvcih2YXIgaT0wO2k8NDtpKyspe1xyXG5cdFx0dmFyIHI9Z2V0QXJyYXlVcChpKTsgcj1wcm9jZXNzQXJyYXkocik7IHB1dEFycmF5VXAoaSxyKTtcclxuXHR9XHJcblx0bmV3TnVtYmVyKCkscGFpbnQoKTtcclxufVxyXG5mdW5jdGlvbiB0b0Rvd24oKSB7IGlmKCF0R28pcmV0dXJuOyAvLyDlkJHkuItcclxuXHRmb3IodmFyIGk9MDtpPDQ7aSsrKXtcclxuXHRcdHZhciByPWdldEFycmF5RG93bihpKTsgcj1wcm9jZXNzQXJyYXkocik7IHB1dEFycmF5RG93bihpLHIpO1xyXG5cdH1cclxuXHRuZXdOdW1iZXIoKSxwYWludCgpO1xyXG59XHJcbmZ1bmN0aW9uIGdldEFycmF5RG93bihpKXsgdmFyIHI9W10sajtcclxuXHRmb3Ioaj0zOyBqPj0wOyBqLS0pIHIucHVzaChsb2NhdGlvbnNbaStqKjRdKTsgcmV0dXJuIHI7XHJcbn1cclxuZnVuY3Rpb24gcHV0QXJyYXlEb3duKGkscil7IHZhciBrPTAsajtcclxuXHRmb3Ioaj0zOyBqPj0wOyBqLS0pIGxvY2F0aW9uc1tpK2oqNF09cltrKytdO1xyXG59XHJcbmZ1bmN0aW9uIGdldEFycmF5VXAoaSl7IHZhciByPVtdLGo7XHJcblx0Zm9yKGo9MDsgajw0OyBqKyspIHIucHVzaChsb2NhdGlvbnNbaStqKjRdKTsgcmV0dXJuIHI7XHJcbn1cclxuZnVuY3Rpb24gcHV0QXJyYXlVcChpLHIpeyB2YXIgaz0wLGo7XHJcblx0Zm9yKGo9MDsgajw0OyBqKyspIGxvY2F0aW9uc1tpK2oqNF09cltrKytdO1xyXG59XHJcbmZ1bmN0aW9uIGdldEFycmF5UmlnaHQoail7IHZhciByPVtdLGk7XHJcblx0Zm9yKGk9MzsgaT49MDsgaS0tKSByLnB1c2gobG9jYXRpb25zW2kraio0XSk7IHJldHVybiByO1xyXG59XHJcbmZ1bmN0aW9uIHB1dEFycmF5UmlnaHQoaixyKXsgdmFyIGs9MCxpO1xyXG5cdGZvcihpPTM7IGk+PTA7IGktLSkgbG9jYXRpb25zW2kraio0XT1yW2srK107XHJcbn1cclxuZnVuY3Rpb24gZ2V0QXJyYXlMZWZ0KGopey8vdmFyIHI9W10saTtcclxuXHQvL2ZvcihpPTA7IGk8NDsgaSsrKSByLnB1c2gobG9jYXRpb25zW2kraio0XSk7IHJldHVybiByO1xyXG5cdHJldHVybiBsb2NhdGlvbnMuc2xpY2Uoaio0LGoqNCs0KTtcclxufVxyXG5mdW5jdGlvbiBwdXRBcnJheUxlZnQoaixyKXsgdmFyIGs9MDtcclxuXHRmb3IodmFyIGk9MDsgaTw0OyBpKyspXHJcblx0XHRsb2NhdGlvbnNbaStqKjRdPXJbaysrXTtcclxufVxyXG5mdW5jdGlvbiBwcm9jZXNzQXJyYXkocikgeyB2YXIgbixpLGosbTsgLy8g5pW45YC85b6AIDAg6ZuG5LitIOeisCDnm7jlkIzlgLwg5bCxIOWKoOe4vVxyXG5cdGlmIChyWzBdK3JbMV0rclsyXStyWzNdPT09MCkgcmV0dXJuIHI7IC8vIOepuuagvOWIl1xyXG5cdG49NDsgd2hpbGUoIXJbbi0xXSluLS07IC8vIOaqouimliBuIOW+niA0IOWIsCAwLCDnm7TliLAgcltuLTFdIOacieaVuOWAvFxyXG5cdGZvcihpPTA7aTxuLTE7aSsrKXsgLy8g5qqi6KaWIGkg5b6eIDAg5YiwIG4tMlxyXG5cdFx0aWYocltpXSl7IFx0XHQvLyDnm7TliLAgcltpXSDmnInmlbjlgLxcclxuXHRcdFx0Zm9yKGo9aSsxO2o8bjtqKyspeyAvLyDmqqLoppYgaiDlvp4gaSsxIOWIsCBuLTFcclxuXHRcdFx0XHRpZihyW2pdKXsgXHRcdC8vIOebtOWIsCByW2pdIOacieaVuOWAvFxyXG5cdFx0XHRcdFx0aWYocltpXT09PXJbal0pe1x0XHRcdC8vIOiLpSByW2ldPXJbal1cclxuXHRcdFx0XHRcdFx0c2NvcmUrPXJbaV0qPTIscltqXT0wO1x0Ly8gcltpXT3lhanmqLnnm7jliqAsIHJbal09MFxyXG5cdFx0XHRcdFx0fSBlbHNlIGotLTsgLy8gKOS4i+asoeWbnuWIsCBsb29wIGog6YKE5pyD6Ieq5YuV5YaN5YqgIDEpXHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHR9Ly9pZlxyXG5cdFx0XHR9Ly9mb3IgalxyXG5cdFx0XHRpPWo7IC8vICjkuIvmrKHlm57liLAgbG9vcCBpIOmChOacg+iHquWLleWGjeWKoCAxKVxyXG5cdFx0fS8vaWZcclxuXHR9Ly9mb3IgaVxyXG5cdGZvcihpPW09MDtpPG47aSsrKSBpZihyW2ldKSByW20rK109cltpXTsgLy8g5L6d5bqPIOmdniAwIOaVuOWAvFxyXG5cdHdoaWxlKG08NCkgclttKytdPTA7IC8vIOS7pSAwIOijnOi2syA0IOWAi1xyXG5cdHJldHVybiByO1xyXG59XHJcbmZ1bmN0aW9uIHJhbmRvbUxvY2F0aW9uKCkgeyAvLyDpmqjmqZ/nlJ/miJAg56m65qC855qE5L2N572uXHJcblx0dmFyIEw9bG9jYXRpb25zLm1hcChmdW5jdGlvbihwLGkpe1xyXG5cdFx0cmV0dXJuIHA/dW5kZWZpbmVkOmk7IC8vIGkgY291bGQgYmUgMFxyXG5cdH0pLmZpbHRlcihmdW5jdGlvbihpKXtcclxuXHRcdHJldHVybiBpIT09dW5kZWZpbmVkOyAvLyBpIGNvdWxkIGJlIDBcclxuXHR9KTsgLy8gTCA9IOepuuagvOS9jee9riDnmoQg6Zmj5YiXXHJcblx0dmFyIG49TC5sZW5ndGg7XHJcblx0aWYobikgcmV0dXJuIExbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKm4pXTtcclxufVxyXG4kKFwiI21haW5ib3hcIikuc3dpcGUoeyAvLyDmiYvmjIcg5Zyo6KGo5qC85LitIOWPr+WQkSDkuIrkuIvlt6blj7Mg5ruR5YuVXHJcblx0c3dpcGU6ZnVuY3Rpb24oZXZlbnQsIGRpcmVjdGlvbiwgZGlzdGFuY2UsIGR1cmF0aW9uLCBmaW5nZXJDb3VudCwgZmluZ2VyRGF0YSkge1xyXG5cdCAgaWYgKG5vbW9yZSkgcmV0dXJuO1xyXG5cdCAgaWYgKGRpcmVjdGlvbj09PSd1cCcgICApIHRvVXAgICAoKTsgZWxzZVxyXG5cdCAgaWYgKGRpcmVjdGlvbj09PSdsZWZ0JyApIHRvTGVmdCAoKTsgZWxzZVxyXG5cdCAgaWYgKGRpcmVjdGlvbj09PSdkb3duJyApIHRvRG93biAoKTsgZWxzZVxyXG5cdCAgaWYgKGRpcmVjdGlvbj09PSdyaWdodCcpIHRvUmlnaHQoKTtcclxuXHR9LCB0aHJlc2hvbGQ6MCAvLyDpoJDoqK3lgLwgNzVweCAoc2V0IHRvIDAgZm9yIGRlbW8gc28gYW55IGRpc3RhbmNlIHRyaWdnZXJzIHN3aXBlKVxyXG59KTtcclxuJChcIiNib2R5XCIpLnN3aXBlKHsgLy8g5omL5oyHIOWcqOihqOagvOWkliDlj6/lkJEg5bem5Y+zIOa7keWLlSDnv7vpoIFcclxuXHRzd2lwZTpmdW5jdGlvbihldmVudCwgZGlyZWN0aW9uLCBkaXN0YW5jZSwgZHVyYXRpb24sIGZpbmdlckNvdW50LCBmaW5nZXJEYXRhKSB7XHJcblx0ICBpZiAoZGlyZWN0aW9uPT09J2xlZnQnIClcclxuXHQgIFx0dG9MZWZ0UGFnZSAoKTtcclxuXHQgIGVsc2UgaWYgKGRpcmVjdGlvbj09PSdyaWdodCcpXHJcblx0ICBcdHRvUmlnaHRQYWdlKCk7XHJcblx0fSwgdGhyZXNob2xkOjAgLy8g6aCQ6Kit5YC8IDc1cHggKHNldCB0byAwIGZvciBkZW1vIHNvIGFueSBkaXN0YW5jZSB0cmlnZ2VycyBzd2lwZSlcclxufSk7XHJcbndpbmRvdy5vbmtleWRvd249ZnVuY3Rpb24oZSl7IHZhciBrZXlDb2RlO1xyXG5cdGU9ZXx8d2luZG93LmV2ZW50O1xyXG5cdGlmIChkb2N1bWVudC5hbGwpIGtleUNvZGUgPSBlLmtleUNvZGU7XHJcblx0ZWxzZSBrZXlDb2RlID0gZS53aGljaDtcclxuXHRpZiAoa2V5Q29kZT09Mjcpe1xyXG5cdFx0Z28oKTsgcmV0dXJuO1xyXG5cdH1cclxuXHRpZihub21vcmUpIHJldHVybjtcclxuXHRpZiBcdFx0KGtleUNvZGU9PTM3IHx8IGtleUNvZGU9PTY1KSAvKiDihpAg5oiWIEEgKi8gdG9MZWZ0KCk7XHJcblx0ZWxzZSBpZiAoa2V5Q29kZT09MzggfHwga2V5Q29kZT09ODcpIC8qIOKGkSDmiJYgVyAqLyB0b1VwKCk7XHJcblx0ZWxzZSBpZiAoa2V5Q29kZT09MzkgfHwga2V5Q29kZT09NjgpIC8qIOKGkiDmiJYgRCAqLyB0b1JpZ2h0KCk7XHJcblx0ZWxzZSBpZiAoa2V5Q29kZT09NDAgfHwga2V5Q29kZT09ODMpIC8qIOKGkyDmiJYgUyAqLyB0b0Rvd24oKTtcclxufVxyXG53aW5kb3cuYm94cz1bXTtcclxuZm9yKHZhciBpPTA7aTwxNjtpKyspd2luZG93LmJveHMucHVzaChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYm94JytpLnRvU3RyaW5nKDE2KSkpO1xyXG5mdW5jdGlvbiBwYWludCgpIHsgLy8g5pu05paw55Wr6Z2iXHJcblx0Ym94cy5mb3JFYWNoKGZ1bmN0aW9uKGIsaSl7XHJcblx0XHR2YXIgTD1sb2NhdGlvbnNbaV0sIGluZGV4PUw9PT0wPzA6KEwudG9TdHJpbmcoMikubGVuZ3RoLTEpO1xyXG5cdFx0Yi5pbm5lclRleHQ9TD9MOlwiXCI7XHJcblx0XHRiLnN0eWxlLmJhY2tncm91bmQ9Y29sb3JzW2luZGV4XTtcclxuXHR9KTtcclxuXHQkKFwiI3Njb3JlXCIpLmh0bWwoXCLlvpfliIY8YnIvPlwiICsgc2NvcmUpO1xyXG5cdGlmKHNjb3JlPm1heCkgbWF4ID0gc2NvcmUsIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdtYXgyMDQ4JyxtYXgpO1xyXG5cdCQoXCIjbWF4XCIpLmh0bWwoXCLmnIDpq5g8YnIvPlwiICsgbWF4KTtcclxuXHRpc0VuZCgpO1xyXG59XHJcbnZhciBpbml0PWZ1bmN0aW9uKCl7XHJcblx0dmFyIHQwLHQxO1xyXG5cdHQwPW5ldyBEYXRlKCksIGNvbnNvbGUubG9nKCd0MCcsdDApO1xyXG5cdHNldFRpbWVvdXQoXHJcblx0XHRmdW5jdGlvbigpe1xyXG5cdFx0XHR0MT1uZXcgRGF0ZSgpLCBjb25zb2xlLmxvZygndDEnLCB0MSwgJ2RlbHRhJywgdDEudmFsdWVPZigpLXQwLnZhbHVlT2YoKSlcclxuXHRcdH0sXHJcblx0XHQxMDAwXHJcblx0KTtcclxuXHR2YXIgSmVGb3J0aFZNPXJlcXVpcmUoXCIuL2plZnZtLnYzLmpzXCIpO1xyXG5cdHdpbmRvdy52bT1uZXcgSmVGb3J0aFZNKCk7XHJcblx0cmVxdWlyZShcIi4vamVmdm0udjNfZXh0LmpzXCIpKHZtKTtcclxuXHRyZXF1aXJlKFwiLi9qZWZ2bS52M190c3QuanNcIikodm0pO1xyXG5cdHZtLmV4dERhdGE9dm0uZXh0RGF0YXx8ZnVuY3Rpb24gKHRrbil7XHJcblx0XHRpZiggdHlwZW9mIHZtW3Rrbl0hPT0ndW5kZWZpbmVkJyApXHJcblx0XHRcdHJldHVybiB2bVt0a25dOyBcdFx0XHRcdFx0XHQvLyB2bSBhdHRyaWJ1dGVcclxuXHRcdGlmKHRrbi5tYXRjaCgvIyhbMC05YS1mXXszfXxbMC05YS1mXXs2fSkvKSlcclxuXHRcdFx0cmV0dXJuIHRrbjtcdFx0XHRcdFx0XHRcdFx0Ly8gI2hoaCBvciAjaGhoaGhoIChyZ2IgaGV4YWRlY2ltYWwgY29kZSBzdHJpbmcpXHJcblx0XHR2YXIgdD1ldmFsKCd0eXBlb2YgJyt0a24pO1xyXG5cdFx0aWYodD09PSd1bmRlZmluZWQnKVxyXG5cdFx0XHRyZXR1cm47XHRcdFx0XHRcdFx0XHRcdFx0Ly8gdW5kZWZpbmVkXHJcblx0XHR2YXIgdj1kMy5zZWxlY3QoJyMnK3Rrbik7XHJcblx0XHRpZih2WzBdWzBdJiZ2WzBdWzBdLmlkPT09dGtuKVxyXG5cdFx0XHRyZXR1cm4gdjtcdFx0XHRcdFx0XHRcdFx0Ly8gZDMgb2JqZWN0XHJcblx0XHRyZXR1cm4gZXZhbCh0a24pO1x0XHRcdFx0XHRcdFx0Ly8ganMgZGVmaW5lZFxyXG5cdH1cclxuXHR2bS5HZXQ9dm0uR2V0fHxmdW5jdGlvbiAob2JqLGF0dCl7IHZhciBsc3Q7XHJcblx0XHRvYmo9b2JqfHx2bS5kU3RhY2sucG9wKCksIGF0dD1hdHR8fHZtLmRTdGFjay5wb3AoKTtcclxuXHRcdGlmKHR5cGVvZihvYmopPT09J29iamVjdCcmJm9iai5hdHRyKVxyXG5cdFx0XHRyZXR1cm4gb2JqLmF0dHIoYXR0KTtcclxuXHRcdGxzdD0oQXJyYXkuaXNBcnJheShvYmopID8gb2JqIDogW29ial0pLm1hcChmdW5jdGlvbihvKXtcclxuXHRcdFx0aWYodHlwZW9mKG8pIT09J29iamVjdCcpIHJldHVybjtcclxuXHRcdFx0cmV0dXJuIG8uYXR0ciA/IG8uYXR0cihhdHQpIDogb1thdHRdO1xyXG5cdFx0fSlcclxuXHRcdHJldHVybiBsc3QubGVuZ3RoPT09MSA/IGxzdFswXSA6IGxzdDtcclxuXHR9XHJcblx0dm0uU2V0PWZ1bmN0aW9uIChvYmosYXR0LHZhbCl7XHJcblx0XHRvYmo9b2JqfHx2bS5kU3RhY2sucG9wKCksIGF0dD1hdHR8fHZtLmRTdGFjay5wb3AoKSwgdmFsPXZhbHx8dm0uZFN0YWNrLnBvcCgpO1xyXG5cdFx0aWYodHlwZW9mKG9iaikhPT0nb2JqZWN0JylcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0ZWxzZSB7XHJcblx0XHRcdGlmKG9iai5hdHRyKSBcclxuXHRcdFx0XHRvYmouYXR0cihhdHQsdmFsKTtcdC8vIGQzIG9iamVjdCBhdHRyaWJ1dGUgc2V0dGluZ1xyXG5cdFx0XHRlbHNlIHtcclxuXHRcdFx0XHR2YXIgbHN0PUFycmF5LmlzQXJyYXkob2JqKT9vYmo6W29ial07XHJcblx0XHRcdFx0aWYoQXJyYXkuaXNBcnJheShvYmopKVxyXG5cdFx0XHRcdFx0b2JqLmZvckVhY2goZnVuY3Rpb24obyl7XHJcblx0XHRcdFx0XHRcdGlmKHR5cGVvZiBvPT09J29iamVjdCcpIG9bYXR0XT12YWw7XHJcblx0XHRcdFx0XHR9KVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cdHZtLmV4ZWMuYXBwbHkodm0sW1xyXG5cdFx0J2NvZGUgZ2V0IGZ1bmN0aW9uKCl7IC8qIGdldCAoIG9iaiA8YXR0PiAtLSB2YWwgKSAqL1xcbicrXHJcblx0XHQnIC8qIOS+izogdm0uZXhlYy5hcHBseSh2bSxbXCJ2bSBnZXQgd29yZHMgZ2V0IG5hbWUgdHlwZVwiXSkgKi9cXG4nK1xyXG5cdFx0JyB2YXIgb2JqPXZtLmRTdGFjay5wb3AoKSwgYXR0PXZtLm5leHRUb2tlbi5jYWxsKHZtKTsgdm0uZFN0YWNrLnB1c2godm0uR2V0KG9iaixhdHQpKTsgfWVuZC1jb2RlJ10pO1xyXG5cdHZtLmV4ZWMuYXBwbHkodm0sW1xyXG5cdFx0J2NvZGUgZ2V0aSBmdW5jdGlvbigpeyAvKiBnZXRpICggb2JqIDxhdHQ+IC0tIGludCApICovXFxuJytcclxuXHRcdCcgLyog5L6LOiB2bS5leGVjLmFwcGx5KHZtLFtcImMxIGdldGkgY3ggMTAwICsgdHlwZVwiXSkgKi9cXG4nK1xyXG5cdFx0JyB2YXIgb2JqPXZtLmRTdGFjay5wb3AoKSwgYXR0PXZtLm5leHRUb2tlbi5jYWxsKHZtKTsgdm0uZFN0YWNrLnB1c2gocGFyc2VJbnQodm0uR2V0KG9iaixhdHQpKSk7IH1lbmQtY29kZSddKTtcclxuXHR2bS5leGVjLmFwcGx5KHZtLFtcclxuXHRcdCdjb2RlIHNldCBmdW5jdGlvbigpe3ZhciBvYmosYXR0Oy8qIHNldCAoIHZhbCBvYmogPGF0dD4gLS0gKSAqL1xcbicrXHJcblx0XHQnIC8qIOS+izE6IHZtLmV4ZWMuYXBwbHkodm0sW1wiI2ZmOCBjMSBzZXQgZmlsbCA0MCBjMSBzZXQgciAxNTAgYzEgc2V0IGN4XCJdKSAqL1xcbicrXHJcblx0XHQnIC8qIOS+izI6IHZtLmV4ZWMuYXBwbHkodm0sW1wiXFwnYmFja2dyb3VuZC1jb2xvcjp5ZWxsb3dcXCcgYm94MSBzZXQgc3R5bGVcIl0pICovXFxuJytcclxuXHRcdCcgb2JqPXZtLmRTdGFjay5wb3AoKSwgYXR0PXZtLm5leHRUb2tlbi5jYWxsKHZtKSwgdm0uU2V0KG9iaixhdHQsdm0uZFN0YWNrLnBvcCgpKTsgfWVuZC1jb2RlJ10pO1xyXG5cdHZtLmV4ZWMuYXBwbHkodm0sW1xyXG5cdFx0J2NvZGUgWG1pIGZ1bmN0aW9uKCl7IC8qIFhtaSAoIC0tIHhtaW4gKSAqL1xcbicrXHJcblx0XHQnIHZtLmRTdGFjay5wdXNoKHBhcnNlSW50KGMxLmdldEF0dHJpYnV0ZShcInJcIikpKTt9ZW5kLWNvZGVcXG4nK1xyXG5cdFx0J2NvZGUgWG1hIGZ1bmN0aW9uKCl7IC8qIFhtYSAoIC0tIHhtYXggKSAqL1xcbicrXHJcblx0XHQnIHZtLmRTdGFjay5wdXNoKHBhcnNlSW50KHN2Zy5nZXRBdHRyaWJ1dGUoXCJ3aWR0aFwiKSktcGFyc2VJbnQoYzEuZ2V0QXR0cmlidXRlKFwiclwiKSkpO31lbmQtY29kZVxcbicrXHJcblx0XHQnY29kZSB4bWkgZnVuY3Rpb24oKXsgLyogbWkgKCAtLSB4bWluICkgKi9cXG4nK1xyXG5cdFx0JyB2bS5kU3RhY2sucHVzaChwYXJzZUludChjMi5nZXRBdHRyaWJ1dGUoXCJyXCIpKSk7fWVuZC1jb2RlXFxuJytcclxuXHRcdCdjb2RlIHhtYSBmdW5jdGlvbigpeyAvKiBtYSAoIC0tIHhtYXggKSAqL1xcbicrXHJcblx0XHQnIHZtLmRTdGFjay5wdXNoKHBhcnNlSW50KHN2Zy5nZXRBdHRyaWJ1dGUoXCJ3aWR0aFwiKSktcGFyc2VJbnQoYzIuZ2V0QXR0cmlidXRlKFwiclwiKSkpO31lbmQtY29kZVxcbicrXHJcblx0XHQnY29kZSBDeEAgZnVuY3Rpb24oKXsgLyogQ3hAICggLS0gQ3ggKSAqL1xcbicrXHJcblx0XHQnIHZtLmRTdGFjay5wdXNoKHBhcnNlSW50KGMxLmdldEF0dHJpYnV0ZShcImN4XCIpKSk7fWVuZC1jb2RlXFxuJytcclxuXHRcdCdjb2RlIER4QCBmdW5jdGlvbigpeyAvKiBEeEAgKCAtLSBEeCApICovXFxuJytcclxuXHRcdCcgdm0uZFN0YWNrLnB1c2gocGFyc2VJbnQoYzEuZ2V0QXR0cmlidXRlKFwiZHhcIikpKTt9ZW5kLWNvZGVcXG4nK1xyXG5cdFx0J2NvZGUgQ3ghIGZ1bmN0aW9uKCl7IC8qIEN4ISAoIEN4IC0tICkgKi9cXG4nK1xyXG5cdFx0JyBjMS5zZXRBdHRyaWJ1dGUoXCJjeFwiLHZtLmRTdGFjay5wb3AoKSk7fWVuZC1jb2RlXFxuJytcclxuXHRcdCdjb2RlIEN4KyEgZnVuY3Rpb24oKXsgLyogQ3grISAoIER4IC0tICkgKi9cXG4nK1xyXG5cdFx0JyBjMS5zZXRBdHRyaWJ1dGUoXCJjeFwiLHBhcnNlSW50KGMxLmdldEF0dHJpYnV0ZShcImN4XCIpKSt2bS5kU3RhY2sucG9wKCkpO31lbmQtY29kZVxcbicrXHJcblx0XHQnY29kZSBEeCEgZnVuY3Rpb24oKXsgLyogRHghICggRHggLS0gKSAqL1xcbicrXHJcblx0XHQnIGMxLnNldEF0dHJpYnV0ZShcImR4XCIsdm0uZFN0YWNrLnBvcCgpKTt9ZW5kLWNvZGVcXG4nK1xyXG5cdFx0J2NvZGUgY3hAIGZ1bmN0aW9uKCl7IC8qIGN4QCAoIC0tIGN4ICkgKi9cXG4nK1xyXG5cdFx0JyB2bS5kU3RhY2sucHVzaChwYXJzZUludChjMi5nZXRBdHRyaWJ1dGUoXCJjeFwiKSkpO31lbmQtY29kZVxcbicrXHJcblx0XHQnY29kZSBkeEAgZnVuY3Rpb24oKXsgLyogZHhAICggLS0gZHggKSAqL1xcbicrXHJcblx0XHQnIHZtLmRTdGFjay5wdXNoKHBhcnNlSW50KGMyLmdldEF0dHJpYnV0ZShcImR4XCIpKSk7fWVuZC1jb2RlXFxuJytcclxuXHRcdCdjb2RlIGN4ISBmdW5jdGlvbigpeyAvKiBjeCEgKCBjeCAtLSApICovXFxuJytcclxuXHRcdCcgYzIuc2V0QXR0cmlidXRlKFwiY3hcIix2bS5kU3RhY2sucG9wKCkpO31lbmQtY29kZVxcbicrXHJcblx0XHQnY29kZSBjeCshIGZ1bmN0aW9uKCl7IC8qIGN4KyEgKCBkeCAtLSApICovXFxuJytcclxuXHRcdCcgYzIuc2V0QXR0cmlidXRlKFwiY3hcIixwYXJzZUludChjMi5nZXRBdHRyaWJ1dGUoXCJjeFwiKSkrdm0uZFN0YWNrLnBvcCgpKTt9ZW5kLWNvZGVcXG4nK1xyXG5cdFx0J2NvZGUgZHghIGZ1bmN0aW9uKCl7IC8qIGR4ISAoIGR4IC0tICkgKi9cXG4nK1xyXG5cdFx0JyAvKiDkvosxOiB2bS5leGVjLmFwcGx5KHZtLFtcIjEgRHghIHhtYSBmb3IgMjAgbXMgRHhAIEN4KyEgbmV4dFwiXSkgKi9cXG4nK1xyXG5cdFx0JyAvKiDkvosyOiB2bS5leGVjLmFwcGx5KHZtLFtcIjUwIEN4ISAxIER4ISBiZWdpbiB4bWEgZm9yIDIwIG1zIER4QCBDeCshIG5leHQgMCBEeEAgLSBEeCEgYWdhaW5cIl0pICovXFxuJytcclxuXHRcdCcgYzIuc2V0QXR0cmlidXRlKFwiZHhcIix2bS5kU3RhY2sucG9wKCkpO31lbmQtY29kZSddKTtcclxuXHR2bS5leGVjLmFwcGx5KHZtLFsnY29kZSA+IGZ1bmN0aW9uKCl7ZFN0YWNrLnB1c2goZFN0YWNrLnBvcCgpPGRTdGFjay5wb3AoKSl9ZW5kLWNvZGUnXSk7XHJcblx0dm0uZXhlYy5hcHBseSh2bSxbJ2NvZGUgPCBmdW5jdGlvbigpe2RTdGFjay5wdXNoKGRTdGFjay5wb3AoKT5kU3RhY2sucG9wKCkpfWVuZC1jb2RlJ10pO1xyXG59XHJcbmZ1bmN0aW9uIGhhbHQoKXtcclxuXHRjbGVhckludGVydmFsKHRHbyksIHZtLm1zVGltZS5mb3JFYWNoKGZ1bmN0aW9uKHQpe2NsZWFyVGltZW91dCh0LnRpbWVvdXQpfSk7XHJcblx0aWYoYnRuSGFsdC5pbm5lclRleHQ9PT0n5YGcJyl7XHJcblx0XHRidG5IYWx0LmlubmVyVGV4dD0n6LWwJztcclxuXHR9ZWxzZXtcclxuXHRcdGJ0bkhhbHQuaW5uZXJUZXh0PSflgZwnO1xyXG5cdFx0dm0uZXhlYyhcImJlZ2luIDIwIG1zIER4QCBDeCshIEN4QCBYbWkgPCBDeEAgWG1hID4gb3IgaWYgMCBEeEAgLSBEeCEgdGhlbiBhZ2FpblwiKTtcclxuXHRcdHZtLmV4ZWMoXCJiZWdpbiAxNSBtcyBkeEAgY3grISBjeEAgeG1pIDwgY3hAIHhtYSA+IG9yIGlmIDAgZHhAIC0gZHghIHRoZW4gYWdhaW5cIilcclxuXHRcdHRHbz1zZXRJbnRlcnZhbChmdW5jdGlvbiAoKXtcclxuXHRcdFx0JChcIiN0aW1lXCIpLmh0bWwoXCLlianppJg8YnIvPlwiKyB0aW1lLS0gK1wi56eSXCIpO1xyXG5cdFx0XHRpZih0aW1lPDApIG5vTW9yZSgpO1xyXG5cdFx0fSwxMDAwKTs7XHJcblx0fVxyXG59XHJcbmZ1bmN0aW9uIGdvKCl7XHJcblx0Y2xlYXJJbnRlcnZhbCh0R28pLCB2bS5tc1RpbWUuZm9yRWFjaChmdW5jdGlvbih0KXtjbGVhclRpbWVvdXQodC50aW1lb3V0KX0pO1xyXG5cdGlmKGJ0bkhhbHQuaW5uZXJUZXh0PT09J+i1sCcpXHJcblx0XHRidG5IYWx0LmlubmVyVGV4dD0n5YGcJztcclxuXHRpZighbm9tb3JlKSBidG5Hby5pbm5lclRleHQ9J+mHjeaWsCBlc2MnLCBoaW50LmlubmVyVGV4dD0n5omLIOa7keWLlSDmiJYg5oyJ6Y21JztcclxuXHRsb2NhdGlvbnM9WzAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDBdOyAvLyDmr4/moLzotbflp4vliIbmlbggMFxyXG5cdCQoJyNzY29yZScpWzBdLnN0eWxlLmJhY2tncm91bmQ9J3doaXRlJztcclxuXHQkKCcjbWFpbmJveCcpWzBdLnN0eWxlLmJhY2tncm91bmQ9J3doaXRlJztcclxuXHRub21vcmU9c2NvcmU9MCwgdGltZT0zMDAsIG5ld051bWJlcigpLCBuZXdOdW1iZXIoKSwgcGFpbnQoKTtcclxuLypcdGlmKHRpbWUuaW5uZXJUZXh0Lm1hdGNoKC9cXGQrLylbMF0+PScwJyl7XHJcblx0XHR0R289c2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCl7XHJcblx0XHRcdCQoXCIjdGltZVwiKS5odG1sKFwi5Ymp6aSYPGJyLz5cIisgdGltZS0tICtcIuenklwiKTtcclxuXHRcdFx0aWYodGltZTwwKSBub01vcmUoKTtcclxuXHRcdH0sMTAwMCk7IC8vIHNob3cgdGltZVxyXG5cdH1cclxuKi9cdHZtLmV4ZWMuYXBwbHkodm0sW1wiWG1pIEN4ISAxIER4ISBiZWdpbiAyMCBtcyBEeEAgQ3grISBDeEAgWG1pIDwgQ3hAIFhtYSA+IG9yIGlmIDAgRHhAIC0gRHghIHRoZW4gYWdhaW5cIl0pXHJcblx0dm0uZXhlYy5hcHBseSh2bSxbXCJ4bWkgY3ghIDEgZHghIGJlZ2luIDE1IG1zIGR4QCBjeCshIGN4QCB4bWkgPCBjeEAgeG1hID4gb3IgaWYgMCBkeEAgLSBkeCEgdGhlbiBhZ2FpblwiXSlcclxufVxyXG53aW5kb3cuXzIwNDg9e2luaXQ6aW5pdCxoYWx0OmhhbHQsZ286Z28sdG9VcDp0b1VwLHRvTGVmdDp0b0xlZnQsdG9SaWdodDp0b1JpZ2h0LHRvRG93bjp0b0Rvd259O1xyXG53aW5kb3cueD1mdW5jdGlvbihjbWQpe3ZtLmV4ZWMuYXBwbHkodm0sW2NtZF0pfSAvLyDkvos6IHgoXCIjZjAwIGMyIHNldCBmaWxsXCIpXHJcblxyXG5tb2R1bGUuZXhwb3J0cz1fMjA0ODtcclxuIiwidmFyIHJ1bnRpbWU9cmVxdWlyZShcImtzYW5hMjAxNS13ZWJydW50aW1lXCIpO1xyXG5ydW50aW1lLmJvb3QoXCJfMjA0OFwiLGZ1bmN0aW9uKCl7XHJcblx0Ly92YXIgTWFpbj1SZWFjdC5jcmVhdGVFbGVtZW50KHJlcXVpcmUoXCIuL3NyYy9tYWluLmpzeFwiKSk7XHJcblx0Ly9rc2FuYS5tYWluQ29tcG9uZW50PVJlYWN0LnJlbmRlcihNYWluLGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFpblwiKSk7XHJcblx0dmFyIF8yMDQ4PXJlcXVpcmUoXCIuL18yMDQ4LmpzXCIpO1xyXG5cdGZ1bmN0aW9uIGRvUmVzaXplKCl7XHJcblx0XHR2YXIgYm9keT1kb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYm9keScpWzBdO1xyXG4gICAgXHR2YXIgd2lkdGg9Ym9keS5jbGllbnRXaWR0aCB8fGRvY3VtZW50LmNsaWVudFdpZHRoIHx8d2luZG93LmlubmVyV2lkdGg7XHJcbiAgICBcdHN2Zy5zZXRBdHRyaWJ1dGUoJ3dpZHRoJyx3aWR0aCk7XHJcblx0fVxyXG5cdF8yMDQ4LmluaXQoKTtcclxuXHRkb1Jlc2l6ZSgpO1xyXG59KTtcclxuIiwiLyogIGplZnZtLnYzLmpzXHJcblxyXG5cdC0tLSBKYXZhc2NyaXB0IGVhc3kgRm9ydGggKGplZiBvciBqZWZvcnRoKSB2aXJ0dWFsIG1hY2hpbmUgKHZtKVxyXG5cdC0tLSBtaW5pbWFsaXN0IEZvcnRoIEltcGxlbWVudGF0aW9uIGluIEphdmFzY3JpcHRcclxuXHQtLS0gTUlUIGxpY2Vuc2VcclxuXHQyMDE0LzEwLzA4XHRpbnRlcnByZXRpdmUgZm9yIG5leHQsIGJlZ2luIGFnYWluLCBiZWdpbiB1bnRpbCwgYmVnaW4gd2hpbGUgcmVwZWF0XHJcblx0MjAxNC8xMC8wNlx0YWRkIG1zIGFzIHZlcnNpb24gMyBieSBzYW1zdWFuY2hlbkBnbWFpbC5jb21cclxuXHQyMDE0LzEwLzA2XHRhZGQgP2R1cCAwPSAxLSBcclxuXHRcdFx0XHRpZi4uLnRoZW4sIGlmLi4uZWxzZS4uLnRoZW4sXHJcblx0XHRcdFx0Zm9yLi4ubmV4dCwgZm9yIGFmdC4uLnRoZW4gbmV4dCxcclxuXHRcdFx0XHRiZWdpbi4uLmFnYWluLCBiZWdpbi4udW50aWwsIGJlZ2luLi4ud2hpbGUuLi5yZXBlYXQgYnkgc2Ftc3VhbmNoZW5AZ21haWwuY29tXHJcblx0MjAxNC8wOS8yNlx0YWRkIGlwLCBkYXRhIGFyZWEsIGFuZCByZXR1cm4gc3RhY2sgYXMgdmVyc2lvbiAyIGJ5IHNhbXN1YW5jaGVuQGdtYWlsLmNvbVxyXG5cdDIwMTQvMDkvMjVcdGFkZCBkYXRhIHN0YWNrIGFuZCBudW1iZXIgY29udmVyc2lvbiBhcyB2ZXJzaW9uIDEgYnkgc2Ftc3VhbmNoZW5AZ21haWwuY29tXHJcblx0MjAxNC8wOS8yMlx0c2ltcGxpZml5IHRvIGhhdmUgb25seSBjb2RlIGFzIHZlcnNpb24gMCBieSBzYW1zdWFuY2hlbkBnbWFpbC5jb21cclxuICAgIDIwMTQvMDkvMDQgIE5ldyBWZXJzaW9uIEZvciBFc3BydWlubyBIYXJkd2FyZSBieSB5YXBjaGVhaHNoZW5AZ21haWwuY29tXHJcbiAgICAyMDEyLzAyLzE3XHRhZGQgZXhhbXBsZSBhbmQgbW9kaWZ5IGtlcm5lbCB0byBiZSBtb3JlIGZyaWVuZGx5IGZvciBlZHVjYXRpb24uXHJcbiAgICAyMDExLzEyLzIzICBpbml0aWFsIHZlcnNpb24gYnkgeWFwY2hlYWhzaGVuQGdtYWlsLmNvbVxyXG4gICAgICAgICAgICAgICAgZXF1aXYgdG8gaHR0cDovL3R1dG9yLmtzYW5hLnR3L2tzYW5hdm0gbGVzc29uMX44XHJcbiAgICBUT0RPOiBjb21wbGV0ZSBlRm9ydGggY29yZSB3b3JkIHNldFxyXG4gICAgICAgICAgaW50ZXJmYWNlIHRvIEhUTUw1IGNhbnZhc1xyXG4gICAgICAgICAgcG9ydCBDLkguVGluZyBmbGFnIGRlbW8gZm9yIGtpZHNcclxuICAgIHRoaXMgaXMgbWVyZWx5IGEga2ljayBvZmYsIGV2ZXJ5b25lIGlzIHdlbGNvbWUgdG8gZW5oYW5jZSBpdC4gKi9cclxuZnVuY3Rpb24gSmVGb3J0aFZNKCkge1xyXG4gICAgdmFyIGVycm9yXHQ9IDBcdDtcdC8vIGZsYWcgdG8gYWJvcnQgc291cmNlIGNvZGUgaW50ZXJwcmV0aW5nXHJcblx0dmFyIHdvcmRzXHQ9WzBdO1x0Ly8gY29sbGVjdCBhbGwgd29yZHMgZGVmaW5lZFxyXG5cdHZhciBuYW1lV29yZD17IH07XHQvLyBuYW1lV29yZFtuYW1lXT13b3JkXHJcblx0dmFyIGlwXHRcdD0gMCA7XHQvLyBpbnN0cnVjdGlvbiBwb2ludGVyIHRvIHJ1biBoaWdoIGxldmVsIGNvbG9uIGRlZmluaXRpb25cdFx0Ly9cdHYyXHJcblx0dmFyIGNBcmVhXHQ9WzBdO1x0Ly8gY29kZSBhcmVhIHRvIGhvbGQgaGlnaCBsZXZlbCBjb2xvbiBkZWZpbml0aW9uXHRcdFx0XHQvL1x0djJcclxuXHR2YXIgclN0YWNrXHQ9WyBdO1x0Ly8gcmV0dXJuIHN0YWNrIHRvIHJldHVybiBmcm9tIGhpZ2ggbGV2ZWwgY29sb24gZGVmaW5pdGlvblx0XHQvL1x0djJcclxuXHR2YXIgZFN0YWNrXHQ9WyBdO1x0Ly8gZGF0YSBzdGFja1x0XHRcdFxyXG5cdHRoaXMuYmFzZT0xMCA7XHQvLyBudW1iZXIgY29udmVyc2lvbiBiYXNlXHRcdFx0XHRcdFx0XHRcdFx0XHQvL1x0djFcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdC8vXHR2MVxyXG5cdHRoaXMudW9iPScnO1x0Ly8gdXNlciBvdXRwdXQgYnVmZmVyIFx0XHRcdFx0Ly8gMjAxNDEyMDkgc2FtXHJcblx0dGhpcy5jbGVhcj1mdW5jdGlvbigpeyAvLyBjbGVhciBkYXRhIHN0YWNrXHRcdFx0XHRcdFx0XHRcdFx0Ly9cdHYxXHJcblx0XHRkU3RhY2s9dGhpcy5kU3RhY2s9W107XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly9cdHYxXHJcblx0fTtcclxuXHR2YXIgY3I9dGhpcy5jcj1mdW5jdGlvbihtc2cpe1x0Ly8gZ2V0IHQ9bXNnIHRvIHByaW50XHJcblx0XHR2YXIgdD10aGlzLnRvYnx8Jyc7XHJcblx0XHR0aGlzLnRvYj0nJztcclxuXHRcdGlmKG1zZykgdCs9bXNnO1xyXG5cdFx0ZWxzZSB0aGlzLmxhc3RUb2I9dDtcclxuXHRcdHRoaXMudW9iKz0odGhpcy51b2I/J1xcbic6JycpK3Q7XHQvLyAyMDE0MTIwOSBzYW1cclxuXHRcdGNvbnNvbGUubG9nKHQpO1x0XHRcdFx0XHRcdFx0XHQvLyBwcmludCB0IChmaXhlZClcclxuXHR9O1xyXG5cdHZhciBpbnRUb1N0cmluZz1mdW5jdGlvbih0KXtcclxuXHRcdHJldHVybiB0eXBlb2YodCk9PT0nbnVtYmVyJyAmJiB0JTE9PT0wICYmIHRoaXMuYmFzZSE9PTEwID8gdC50b1N0cmluZyh0aGlzLmJhc2UpIDogdDtcclxuXHR9XHJcblx0dmFyIHR5cGU9dGhpcy50eXBlPWZ1bmN0aW9uKG1zZyl7XHQvLyBzZW5kIG1zZyB0byB0ZXJtaW5hbCBvdXRwdXQgYnVmZmVyXHJcblx0XHR2YXIgYT1tc2d8fGRTdGFjay5wb3AoKSwgdGhhdD10aGlzO1x0XHRcdFx0XHQvLyBwb3AgZnJvbSBkYXRhIHN0YWNrIGlmIG5vIG1zZ1xyXG5cdFx0YT0gQXJyYXkuaXNBcnJheShhKSA/IGEubWFwKGZ1bmN0aW9uKHQpe1xyXG5cdFx0XHRyZXR1cm4gaW50VG9TdHJpbmcuYXBwbHkodGhhdCxbdF0pfSkuam9pbignICcpIDogaW50VG9TdHJpbmcuYXBwbHkodGhhdCxbYV0pO1x0Ly9cdHYxXHJcblx0XHR0aGlzLnRvYis9YTtcdFx0XHRcdFx0XHRcdFx0XHQvLyBhcHBlbmQgdCB0byB0ZXJtaW5hbCBvdXRwdXQgYnVmZmVyXHJcbiAgICB9O1xyXG4gICAgZnVuY3Rpb24gc2hvd0Vycihtc2cpe3ZhciBtPW1zZztcclxuXHRcdGlmKHRoaXMuZXJyKSBtPSc8Jyt0aGlzLmVycisnPicrbSsnPC8nK3RoaXMuZXJyKyc+JzsgY3IuYXBwbHkodGhpcyxbbV0pO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gc2hvd1RzdChtc2cpe3ZhciBtPW1zZztcclxuXHRcdGlmKHRoaXMudHN0KSBtPSc8Jyt0aGlzLnRzdCsnPicrbSsnPC8nK3RoaXMudHN0Kyc+JzsgY3IuYXBwbHkodGhpcyxbbV0pO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gc2hvd09rIChtc2cpe3ZhciBtPW1zZztcclxuXHRcdGlmKHRoaXMub2sgKSBtPSc8Jyt0aGlzLm9rICsnPicrbSsnPC8nK3RoaXMub2sgKyc+JzsgY3IuYXBwbHkodGhpcyxbbV0pO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gc2hvd0lucChtc2cpe3ZhciBtPW1zZztcclxuXHRcdGlmKHRoaXMuaW5wKSBtPSc8Jyt0aGlzLmlucCsnPicrbSsnPC8nK3RoaXMuaW5wKyc+JzsgY3IuYXBwbHkodGhpcyxbbV0pO1xyXG4gICAgfVxyXG5cdGZ1bmN0aW9uIHBhbmljKG1zZyl7XHQvLyBjbGVhciB0b2IsIHNob3cgZXJyb3IgbXNnLCBhbmQgYWJvcnRcclxuXHRcdHNob3dFcnIobXNnKSxlcnJvcj1tc2csdGhpcy5jb21waWxpbmc9MDsgfVxyXG4gICAgZnVuY3Rpb24gbmV4dENoYXIoKXtcdC8vIGdldCBhIGNoYXIgIGZyb20gdGliXHJcbiAgICAgICAgcmV0dXJuIHRoaXMublRpYjx0aGlzLnRpYi5sZW5ndGggPyB0aGlzLnRpYi5jaGFyQXQodGhpcy5uVGliKyspIDogJyc7XHQvLyBnZXQgbnVsbCBpZiBlb2lcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIG5leHRUb2tlbigpe1x0Ly8gZ2V0IGEgdG9rZW4gZnJvbSB0aWJcclxuXHRcdHRoaXMudG9rZW49Jyc7IHZhciBjPW5leHRDaGFyLmNhbGwodGhpcyk7XHJcbiAgICAgICAgd2hpbGUgKGM9PT0nICd8fGM9PT0nXFx0J3x8Yz09PSdcXHInKSBjPW5leHRDaGFyLmNhbGwodGhpcyk7XHQvLyBza2lwIHdoaXRlLXNwYWNlXHJcbiAgICAgICAgd2hpbGUgKGMpe1xyXG5cdFx0XHRpZihjPT09JyAnfHxjPT09J1xcdCd8fGM9PT0nXFxyJ3x8Yz09PSdcXG4nKWJyZWFrO1x0Ly8gYnJlYWsgaWYgd2hpdGUtc3BhY2VcclxuXHRcdFx0dGhpcy50b2tlbis9YywgYz1uZXh0Q2hhci5jYWxsKHRoaXMpO1x0XHRcdFx0XHRcdFx0Ly8gcGljayB1cCBub25lLXdoaXRlLXNwYWNlXHJcblx0XHR9XHJcblx0Ly9cdGlmKGM9PT0nXFxuJyl0aGlzLm5UaWItLTtcclxuXHRcdHRoaXMuYz1jO1xyXG4gICAgICAgIHJldHVybiB0aGlzLnRva2VuO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gY29tcGlsZSh2KSB7XHQvLyBjb21waWxlIHYgdG8gY29kZSBhcmVhXHRcdFx0XHRcdFx0XHRcdFx0Ly9cdHYyXHJcblx0XHR2YXIgYz0gdj09PXVuZGVmaW5lZCA/IHRoaXMuY0FyZWFbdGhpcy5pcCsrXSA6IHY7XHRcdFx0XHRcdFx0XHRcdFx0Ly9cdHYyXHJcblx0Ly9cdGNyLmFwcGx5KHRoaXMsWydjb21waWxlICcrSlNPTi5zdHJpbmdpZnkoYyldKTtcdFx0XHQvLyBmb3IgdHJhY2luZyBvbmx5XHRcdFx0XHRcdC8vXHR2MlxyXG5cdFx0dGhpcy5jQXJlYS5wdXNoKGMpO1x0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly9cdHYyXHJcbiAgICB9XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly9cdHYyXHJcbiAgICBmdW5jdGlvbiBjb21waWxlQ29kZShuYW1lLHYpIHtcdC8vIGNvbXBpbGUgbmFtZWQgd29yZCB0byBjb2RlIGFyZWFcdFx0XHRcdFx0Ly9cdHYyXHJcblx0XHR2YXIgbj0gbmFtZT09PXVuZGVmaW5lZCA/IG5leHRUb2tlbi5jYWxsKHRoaXMpIDogbmFtZTtcdFx0XHRcdFx0XHRcdFx0XHQvL1x0djJcclxuXHRcdHZhciB3PXRoaXMubmFtZVdvcmRbbl07XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly9cdHYyXHJcblx0XHRjb21waWxlLmFwcGx5KHRoaXMsW3ddKTtcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQvL1x0djJcclxuXHRcdGlmKHYhPT11bmRlZmluZWQpdGhpcy5jb21waWxlLmFwcGx5KHRoaXMsW3ZdKTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9cdHYyXHJcbiAgICB9XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly9cdHYyXHJcbiAgICBmdW5jdGlvbiByZXN1bWVDYWxsKCkge1x0Ly8gcmVzdW1lIGlubmVyIGxvb3AgaW50ZXJwcmV0aW5nIG9mIGNvbXBpbGVkIGNvZGVcdFx0XHQvL1x0djNcclxuXHRcdHdoaWxlKHRoaXMuaXAgJiYgIXRoaXMud2FpdGluZyl7XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQvL1x0djNcclxuXHRcdFx0dmFyIHc9dGhpcy5jQXJlYVt0aGlzLmlwXTtcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly9cdHYzXHJcblx0XHQvL1x0Y3IuYXBwbHkodGhpcyxbdGhpcy5pcCsnOiAnK3cubmFtZSsnICcrdGhpcy5kU3RhY2tdKTtcdFx0XHRcdFx0XHRcdFx0XHRcdC8vXHR2M1xyXG5cdFx0XHR0aGlzLmlwKyssIGV4ZWN1dGUuYXBwbHkodGhpcyxbd10pO1x0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQvL1x0djNcclxuXHRcdH1cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly9cdHYzXHJcblx0Ly9cdGlmKHRoaXMuaXApIGNyLmFwcGx5KHRoaXMsWyd3YWl0IGF0ICcrdGhpcy5pcF0pO1x0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly9cdHYzXHJcbiAgICB9XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly9cdHYzXHJcbiAgICBmdW5jdGlvbiBjYWxsKGFkZHIpIHtcdC8vIGludGVycHJldCBjb21waWxlZCBjb2RlIGF0IGFkZHIgb2YgY0FyZWFcdFx0XHRcdFx0Ly9cdHYyXHJcblx0Ly9cdGNyLmFwcGx5KHRoaXMsW3RoaXMuaXArJyAtLT4gclN0YWNrICcrdGhpcy5yU3RhY2subGVuZ3RoKyc6ICcrdGhpcy5yU3RhY2suam9pbigpXSk7XHRcdFx0XHQvL1x0djJcclxuXHRcdHRoaXMuclN0YWNrLnB1c2godGhpcy5pcCksIHRoaXMuaXA9YWRkcjtcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQvL1x0djJcclxuXHRcdHJlc3VtZUNhbGwuY2FsbCh0aGlzKTtcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly9cdHYzXHJcbiAgICB9XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly9cdHYyXHJcbiAgICBmdW5jdGlvbiBleGl0KCkge1x0Ly8gcmV0dXJuIGZyb20gY29sb24gZGVmaW5pdGlvblx0XHRcdFx0XHRcdFx0XHRcdC8vXHR2MlxyXG5cdFx0dGhpcy5pcD10aGlzLnJTdGFjay5wb3AoKTsvLyBwb3AgaXAgZnJvbSByZXR1cm4gc3RhY2tcdFx0XHRcdFx0XHRcdFx0Ly9cdHYyXHJcblx0Ly9cdGNyLmFwcGx5KHRoaXMsW3RoaXMuaXArJyA8LS0gclN0YWNrICcrdGhpcy5yU3RhY2subGVuZ3RoKyc6ICcrdGhpcy5yU3RhY2suam9pbigpXSk7XHRcdFx0XHQvL1x0djJcclxuICAgIH1cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQvL1x0djJcclxuICAgIGZ1bmN0aW9uIGV4ZWN1dGUodyl7ICAgICAgICAgICAgLy8gZXhlY3V0ZSBvciBjb21waWxlIGEgd29yZFxyXG5cdFx0dmFyIGltbWVkaWF0ZT13LmltbWVkaWF0ZSwgY29tcGlsaW5nPWltbWVkaWF0ZT8wOnRoaXMuY29tcGlsaW5nO1x0XHRcdFx0XHQvL1x0djJcclxuXHQvL1x0dmFyIHM9KGNvbXBpbGluZz8nY29tcGlsZSc6J2V4ZWN1dGUnKSsnIHdvcmQgJztcdC8vIGZvciB0cmFjaW5nIG9ubHlcdFx0XHRcdC8vXHR2MlxyXG5cdFx0aWYodHlwZW9mIHc9PT0nb2JqZWN0Jyl7XHJcblx0XHRcdGlmKGNvbXBpbGluZyl7XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQvL1x0djJcclxuXHRcdFx0Ly9cdGNyLmFwcGx5KHRoaXMsWydjb21waWxlICcrdy5uYW1lXSk7ICAgICAgICAgLy8gZm9yIHRyYWNpbmcgb25seSAgICAgICAgICBcdFx0XHQvL1x0djJcclxuXHRcdFx0XHRjb21waWxlLmFwcGx5KHRoaXMsW3ddKTtcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdC8vXHR2MlxyXG5cdFx0XHR9IGVsc2Uge1x0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQvL1x0djJcclxuXHRcdFx0XHR2YXIgeD13Lnh0LCB0PXR5cGVvZiB4O1xyXG5cdFx0XHQvL1x0cys9dy5pZCsnOlxcdCcrdy5uYW1lO1x0XHRcdFx0XHQvLyBmb3IgdHJhY2luZyBvbmx5XHJcblx0XHRcdFx0aWYodD09PVwiZnVuY3Rpb25cIil7XHJcblx0XHRcdFx0Ly9cdGNyLmFwcGx5KHRoaXMsW3MrJyBwcmltaXRpdmUnXSk7XHRcdFx0XHRcdC8vIGZvciB0cmFjaW5nIG9ubHlcclxuXHRcdFx0XHRcdHguY2FsbCh0aGlzKTtcdFx0XHRcdC8vIGV4ZWN1dGUgZnVuY3Rpb24geCBkaXJlY3RseVxyXG5cdFx0XHRcdH0gZWxzZSBpZih0PT09XCJudW1iZXJcIil7XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly9cdHYyXHJcblx0XHRcdFx0Ly9cdGNyLmFwcGx5KHRoaXMsW3MrJyBjb2xvbiBhdCAnK3hdKTtcdFx0XHRcdC8vIGZvciB0cmFjaW5nIG9ubHlcdFx0XHRcdC8vXHR2MlxyXG5cdFx0XHRcdFx0Y2FsbC5hcHBseSh0aGlzLFt4XSk7XHJcblx0XHRcdFx0Ly9cdGNhbGwoeCk7XHRcdFx0Ly8gZXhlY3V0ZSBjb2xvbiBkZWZpbml0aW9uIGF0IHhcdFx0XHRcdC8vXHR2MlxyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRwYW5pYy5hcHBseSh0aGlzLFsnZXJyb3IgZXhlY3V0ZTpcXHQnK3cubmFtZSsnIHcueHQ9Jyt4KycgPz8/PyddKTsvLyB4dCB1bmRlZmluZWRcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdC8vXHR2MlxyXG5cdFx0fSBlbHNlIHtcclxuICAgICAgICAgIHBhbmljLmFwcGx5KHRoaXMsWydlcnJvciBleGVjdXRlOlxcdCcrdysnID8/Pz8nXSk7XHRcdFx0XHRcdFx0Ly8gdyBpcyBub3QgYSB3b3JkXHJcblx0XHR9XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBleHREYXRhKHRrbil7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBleHRRdW90ZWRTdHIodGtuKXtcclxuICAgIFx0dmFyIGM9dGtuLmNoYXJBdCgwKTtcclxuXHRcdGlmKGM9PT0nXCInKXtcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly9cdHYxXHJcblx0XHRcdHZhciB0PXRoaXMudGliLnN1YnN0cigwLHRoaXMublRpYi0xKTtcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQvL1x0djFcclxuXHRcdFx0dmFyIEw9TWF0aC5tYXgodC5sYXN0SW5kZXhPZignICcpLHQubGFzdEluZGV4T2YoJ1xcbicpLHQubGFzdEluZGV4T2YoJ1xcdCcpKSsxO1x0Ly8gY3VycmVudCBcIlx0Ly9cdHYxXHJcblx0XHRcdHQ9dGhpcy50aWIuc3Vic3RyKEwrMSk7XHRcdFx0XHRcdFx0XHRcdFx0XHQvLyByZXN0IHRpYlx0XHQvL1x0djFcclxuXHRcdFx0dmFyIGk9dC5pbmRleE9mKGMpO1x0XHRcdFx0XHRcdFx0XHRcdFx0XHQvLyBuZXh0ICAgIFwiXHQvL1x0djFcclxuXHRcdFx0dmFyIHA9dC5jaGFyQXQoaS0xKTtcdFx0XHRcdFx0XHRcdFx0XHRcdC8vIHByZXYgY2hhclx0Ly9cdHYxXHJcblx0XHRcdHZhciBuPXQuY2hhckF0KGkrMSk7XHRcdFx0XHRcdFx0XHRcdFx0XHRcdC8vIG5leHQgY2hhclx0Ly9cdHYxXHJcblx0XHRcdGlmKGk+PTAgJiYgcCE9PSdcXFxcJyAmJiAobj09PScgJ3x8bj09PSdcXHQnfHxuPT09J1xccid8fG49PT0nXFxuJ3x8bj09PScnKSl7XHQvL1x0djFcclxuXHRcdFx0XHR0aGlzLm5UaWI9TCtpKzIsIHQ9dGhpcy50aWIuc3Vic3RyKEwrMSxpKTtcdFx0XHRcdFx0XHRcdFx0XHQvL1x0djFcclxuXHRcdFx0XHRyZXR1cm4gdDtcdFx0XHRcdC8vIFwiYWJjXCIgcmV0dXJuIHN0cmluZyBhYmMgKCBhbG93IHNwYWNlXHQpXHRcdC8vXHR2MVxyXG5cdFx0XHR9XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQvL1x0djFcclxuXHRcdH1cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly9cdHYxXHJcblx0XHRpZihjPT09XCInXCIgJiYgYz09PXRrbi5jaGFyQXQodGtuLmxlbmd0aC0xKSl7XHRcdFx0XHRcdFx0XHRcdFx0Ly9cdHYxXHJcblx0XHRcdHJldHVybiB0a24uc3Vic3RyKDEsdGtuLmxlbmd0aC0yKTtcdFx0Ly8gJ2FiYycgcmV0dXJuIHN0cmluZyBhYmMgbm8gc3BhY2UgLy9cdHYxXHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdGhpcy5leHREYXRhLmFwcGx5KHRoaXMsW3Rrbl0pO1xyXG5cdH1cclxuICAgIGZ1bmN0aW9uIGV4dE51bSh0a24peyB2YXIgbjtcclxuXHRcdGlmKHRrbi5jaGFyQXQoMCk9PT0nJCcpe1xyXG5cdFx0XHRuPXBhcnNlSW50KHRrbi5zdWJzdHIoMSksMTYpO1xyXG5cdFx0XHRpZignJCcrbi50b1N0cmluZygxNik9PT10a24pIHJldHVybiBuO1x0Ly8gaGV4YSBkZWNpbWFsIGludGVnZXIgbnVtYmVyXHJcblx0XHR9XHJcblx0XHRpZih0aGlzLmJhc2U9PT0xMCl7XHJcblx0ICAgIFx0bj1wYXJzZUZsb2F0KHRrbik7XHJcblx0XHRcdGlmKG4udG9TdHJpbmcoKT09PXRrbikgcmV0dXJuIG47IFx0XHQvLyBkZWNpbWFsIGZsb2F0aW5nIG51bWJlclxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0bj1wYXJzZUludCh0a24sdGhpcy5iYXNlKTtcclxuXHRcdFx0aWYobi50b1N0cmluZyh0aGlzLmJhc2UpPT09dGtuKSByZXR1cm4gbjsgLy8gYW55IGJhc2VkIGludGVnZXIgbnVtYmVcclxuXHRcdH1cclxuICAgIH1cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQvL1x0djFcclxuXHRmdW5jdGlvbiByZXN1bWVFeGVjKHN0ZXAscmVzdW1lRG9uZSl7XHRcdC8vIHJlc3VtZSBvdXRlciBzb3VyY2UgY29kZSBpbnRlcnByZXRpbmcgbG9vcFx0XHRcdC8vXHR2M1xyXG4gICAgICAgIHRoaXMub25Eb25lPXJlc3VtZURvbmU7XHJcbiAgICAgICAgdGhpcy53YWl0aW5nPXRoaXMuc3RlcGluZ3x8c3RlcDsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gIHYzXHJcbiAgICAgICAgaWYodGhpcy5pcCl7XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly9cdHYzXHJcbiAgICAgICAgLy8gIGNyLmFwcGx5KHRoaXMsWydyZXN1bWVDYWxsIGF0ICcsdGhpcy5pcF0pO1xyXG4gICAgICAgICAgICByZXN1bWVDYWxsLmNhbGwodGhpcyk7XHRcdC8vIHJlc3VtZSBpbm5lciBjb21waWxlZCBjb2RlIGludGVycHJldGluZ1x0XHRcdFx0Ly9cdHYzXHJcbiAgICAgICAgfVx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQvL1x0djNcclxuICAgIC8vICBjci5hcHBseSh0aGlzLFsncmVzdW1lIHRpbWVzJywrK3RoaXMuclRpbWVzXSk7XHQvLyBmb3IgdHJhY2luZyBvbmx5ICAgICAgICAgICAgICAgICBcdFx0XHQvL1x0djNcclxuICAgIFx0dmFyIHRrbixuO1xyXG4gICAgICAgIGRve1x0dGhpcy50b2tlbj10a249bmV4dFRva2VuLmNhbGwodGhpcyk7XHQvLyBnZXQgYSB0b2tlblxyXG5cdFx0XHRpZiAodGtuKSB7XHRcdFx0XHRcdC8vIGJyZWFrIGlmIG5vIG1vcmVcclxuXHRcdFx0XHR2YXIgdz1uYW1lV29yZFt0a25dO1x0Ly8gZ2V0IHdvcmQgaWYgdG9rZW4gaXMgYWxyZWFkeSBkZWZpbmVkXHJcblx0XHRcdFx0aWYgKHcpIGV4ZWN1dGUuYXBwbHkodGhpcyxbd10pO1x0XHQvLyBleGVjdXRlIG9yIGNvbXBpbGUgdGhlIHdvcmRcclxuXHRcdFx0XHRlbHNlIHtcdG49ZXh0TnVtLmFwcGx5KHRoaXMsW3Rrbl0pO1x0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly9cdHYxXHJcblx0XHRcdFx0XHRpZihuPT09dW5kZWZpbmVkKVxyXG5cdFx0XHRcdFx0XHRuPWV4dFF1b3RlZFN0ci5hcHBseSh0aGlzLFt0a25dKTtcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly9cdHYxXHJcblx0XHRcdFx0XHRpZihuPT09dW5kZWZpbmVkKVxyXG5cdFx0XHRcdFx0XHRuPXRoaXMuZXh0RGF0YS5hcHBseSh0aGlzLFt0a25dKTtcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQvL1x0djFcclxuXHRcdFx0XHRcdGlmKG49PT11bmRlZmluZWQpe1x0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly9cdHYxXHJcblx0XHRcdFx0XHRcdHBhbmljLmFwcGx5KHRoaXMsW1wiPyBcIit0aGlzLnRva2VuK1wiIHVuZGVmaW5lZFwiXSk7IHJldHVybjsgLy8gdG9rZW4gdW5kZWZpbmVkXHJcblx0XHRcdFx0XHR9XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdC8vXHR2MVxyXG5cdFx0XHRcdFx0aWYodGhpcy5jb21waWxpbmcpe1x0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly9cdHYyXHJcblx0XHRcdFx0XHQvL1x0Y3IuYXBwbHkodGhpcyxbJ2NvbXBpbGUgZG9MaXQgJytuXSk7XHJcblx0XHRcdFx0XHRcdGNvbXBpbGVDb2RlLmFwcGx5KHRoaXMsWydkb0xpdCcsbl0pO1x0XHRcdFx0XHRcdFx0XHRcdFx0XHQvL1x0djJcclxuXHQgICAgICAgICAgICAgICAgfWVsc2VcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdC8vXHR2MlxyXG5cdFx0XHRcdFx0XHRkU3RhY2sucHVzaChuKTtcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdC8vXHR2MVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0Ly9cdGNyLmFwcGx5KHRoaXMsWydkU3RhY2sgPT09PiAnK2RTdGFjay5sZW5ndGgrJzpcXHRbJytkU3RhY2suam9pbigpKyddJ10pO1x0XHRcdFx0XHQvL1x0djFcclxuICAgICAgICB9IHdoaWxlKCF0aGlzLndhaXRpbmcgJiYgdGhpcy5uVGliPHRoaXMudGliLmxlbmd0aCk7XHJcblx0XHRpZighdGhpcy53YWl0aW5nICYmICF0aGlzLmNvbXBpbGluZyl7XHJcblx0XHRcdHZhciBvaz0nIG9rJztcclxuXHRcdFx0aWYodGhpcy5vaykgb2s9JyA8Jyt0aGlzLm9rKyc+JytvaysnPC8nK3RoaXMub2srJz4nO1x0XHRcdFx0XHRcdFx0XHQvL1x0djNcclxuXHRcdFx0Y3IuYXBwbHkodGhpcyxbb2tdKTtcclxuXHRcdC8vXHRjb25zb2xlLmxvZyh0aGlzLm91dCksIHRoaXMub3V0PScnO1xyXG5cdFx0fVxyXG5cdFx0aWYocmVzdW1lRG9uZSlcclxuXHRcdFx0cmVzdW1lRG9uZSgpO1xyXG5cdFx0dmFyIHJlc3VsdD10aGlzLnVvYit0aGlzLnRvYjtcclxuXHRcdHRoaXMudW9iPXRoaXMudG9iPScnO1xyXG5cdFx0cmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuICAgIHZhciBsYXN0Q21kPScnLHRhc2tzPVtdO1xyXG4gICAgZnVuY3Rpb24gZXhlYyhjbWQsc3RlcCl7XHRcdC8vIHNvdXJjZSBjb2RlIGludGVycHJldGluZ1xyXG4gICAgXHRpZighY21kKSByZXR1cm4gLy8gMjAxNDEyMTYgc2FtXHJcbiAgICBcdGlmKGNtZCE9PWxhc3RDbWQpXHJcblx0XHRcdGxhc3RDbWQ9Y21kLCB0aGlzLmNtZHMucHVzaChjbWQpLCB0aGlzLmlDbWQ9dGhpcy5jbWRzLmxlbmd0aDtcdC8vIGZvciB0cmFjaW5nIG9ubHlcclxuXHRcdGlmKHRoaXMuaW5wKXRoaXMuc2hvd0lucC5hcHBseSh0aGlzLFtjbWRdKTtcclxuXHRcdGVsc2UgY3IuYXBwbHkodGhpcyxbJ3NvdXJjZSBpbnB1dCAnK3RoaXMuY21kcy5sZW5ndGgrJzpcXHQnK2NtZF0pO1x0XHRcdC8vIGZvciB0cmFjaW5nIG9ubHlcclxuXHRcdGVycm9yPTAsIHRoaXMudGliPWNtZCwgdGhpcy5uVGliPTAsIHRoaXMudG9iPXRoaXMudW9iPScnO1x0XHQvLyAyMDE0MTIwOSBzYW1cclxuXHRcdHJlc3VtZUV4ZWMuYXBwbHkodGhpcyxbc3RlcF0pLCB0aGlzLmVycm9yPWVycm9yO1x0XHRcdFx0XHQvLyAyMDE0MTIwOSBzYW1cdC8vXHR2MyBcclxuICAgICAgICByZXR1cm4gdGhpcy51b2IrdGhpcy50b2I7XHRcdFx0XHQvLyByZXR1cm4gdGhpcy51b2IgXHQvLyAyMDE0MTIwOSBzYW1cclxuXHR9XHJcblx0ZnVuY3Rpb24gYWRkV29yZChuYW1lLHh0LGltbWVkaWF0ZSl7XHQvLyBcclxuXHRcdHZhciBpZD13b3Jkcy5sZW5ndGgsIHc9e25hbWU6bmFtZSx4dDp4dCxpZDppZH07IHdvcmRzLnB1c2godyksIG5hbWVXb3JkW25hbWVdPXc7XHJcblx0XHRpZihpbW1lZGlhdGUpdy5pbW1lZGlhdGU9MTtcclxuXHRcdGNyLmFwcGx5KHRoaXMsWydkZWZpbmVkICcraWQrJzogJytuYW1lKyh0eXBlb2YgeHQ9PT0nZnVuY3Rpb24nPyAnIGFzIHByaW1pdGl2ZScgOiAnJyldKTtcclxuXHR9XHJcblx0dmFyIGVuZENvZGU9J2VuZC1jb2RlJztcclxuXHRmdW5jdGlvbiBjb2RlKCl7IC8vIGNvZGUgPG5hbWU+IGQoIC0tIClcdC8vIGxvdyBsZXZlbCBkZWZpbml0aW9uIGFzIGEgbmV3IHdvcmRcclxuXHRcdHZhciBpLHQ7XHJcblx0XHR0aGlzLm5ld05hbWU9bmV4dFRva2VuLmNhbGwodGhpcyk7XHJcblx0XHR0PXRoaXMudGliLnN1YnN0cih0aGlzLm5UaWIpLGk9dC5pbmRleE9mKGVuZENvZGUpLHRoaXMublRpYis9aStlbmRDb2RlLmxlbmd0aDtcclxuXHRcdGlmKGk8MCl7XHJcblx0XHRcdHBhbmljKFwibWlzc2luZyBlbmQtY29kZSBmb3IgbG93IGxldmVsIFwiK3RoaXMudG9rZW4rXCIgZGVmaW5pdGlvblwiKTtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0dmFyIHR4dD0nKCcrdC5zdWJzdHIoMCxpKSsnKSc7XHJcblx0XHR2YXIgbmV3WHQ9ZXZhbCh0eHQpOy8vZXZhbCh0eHQpO1xyXG5cdFx0YWRkV29yZC5hcHBseSh0aGlzLFt0aGlzLm5ld05hbWUsbmV3WHRdKTtcclxuXHR9XHJcblx0ZnVuY3Rpb24gZG9MaXQoKXsgLy8gZG9MaXQgKCAtLSBuICkgLy9cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQvL1x0djJcclxuXHRcdHRoaXMuZFN0YWNrLnB1c2godGhpcy5jQXJlYVt0aGlzLmlwKytdKTtcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQvL1x0djJcclxuXHR9XHRcdFx0XHJcblx0dGhpcy5jbWRzPVtdO1xyXG5cdHRoaXMuaUNtZD0tMTtcclxuXHR0aGlzLnNob3dFcnI9c2hvd0VycjtcclxuXHR0aGlzLnNob3dUc3Q9c2hvd1RzdDtcclxuXHR0aGlzLnNob3dPayA9c2hvd09rIDtcclxuXHR0aGlzLnNob3dJbnA9c2hvd0lucDtcclxuXHR0aGlzLnBhbmljPXBhbmljICAgICAgICA7XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQvL1x0djJcclxuXHR0aGlzLm5leHRUb2tlbj1uZXh0VG9rZW47XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQvL1x0djJcclxuXHR0aGlzLmNvbXBpbGVDb2RlPWNvbXBpbGVDb2RlO1x0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdC8vXHR2MlxyXG5cdHRoaXMuZXhlY3V0ZT1leGVjdXRlICAgIDtcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdC8vXHR2MlxyXG5cdHRoaXMuY29tcGlsZT1jb21waWxlICAgIDtcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly9cdHYyXHJcblx0dGhpcy5uYW1lV29yZD1uYW1lV29yZCAgO1x0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly9cdHYyXHJcblx0dGhpcy5pcD1pcCAgICAgICAgICAgICAgO1x0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly9cdHYyXHJcblx0dGhpcy5jQXJlYT1jQXJlYSAgICAgICAgO1x0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly9cdHYyXHJcblx0dGhpcy5yU3RhY2s9clN0YWNrICAgICAgO1x0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly9cdHYyXHJcblx0dGhpcy5kU3RhY2s9ZFN0YWNrICAgICAgO1x0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly9cdHYxXHJcblx0dGhpcy5leHREYXRhPWV4dERhdGEgICAgO1x0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly9cdHYzXHJcblx0dGhpcy5yVGltZXNcdD0gMCA7XHQvLyByZXN1bWUgdGltZXNcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdC8vXHR2M1xyXG5cdHRoaXMud2FpdGluZ1x0PSAwIDtcdC8vIGZsYWcgb2YgICB3YWl0aW5nIG1vZGVcdFx0XHRcdFx0XHRcdFx0XHRcdC8vXHR2M1xyXG5cdHRoaXMuY29tcGlsaW5nPSAwIDtcdC8vIGZsYWcgb2YgY29tcGlsaW5nIG1vZGVcdFx0XHRcdFx0XHRcdFx0XHRcdC8vXHR2MlxyXG5cdHRoaXMucmVzdW1lRXhlYz1yZXN1bWVFeGVjOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gIHYzXHJcblx0dGhpcy50b2JcdFx0PScnXHQ7XHQvLyBpbml0aWFsIHRlcm1pbmFsIG91dHB1dCBidWZmZXJcclxuICAgIHRoaXMudGliXHRcdD0nJ1x0O1x0Ly8gaW5pdGlhbCB0ZXJtaW5hbCAgaW5wdXQgYnVmZmVyIChzb3VyY2UgY29kZSlcclxuICAgIHRoaXMublRpYlx0XHQ9IDBcdDtcdC8vIG9mZnNldCBvZiB0aWIgcHJvY2Vzc2VkXHJcblx0dGhpcy5leGVjXHQ9ZXhlYyAgICAgICAgIDtcclxuXHR0aGlzLndvcmRzPXdvcmRzICAgICAgICA7XHJcblx0dGhpcy5jb2RlID1jb2RlICAgICAgICAgO1xyXG5cdHRoaXMuZG9MaXQ9ZG9MaXQgICAgICAgIDtcclxuXHR0aGlzLmV4aXQgPWV4aXQgICAgICAgICA7XHJcblx0dGhpcy5hZGRXb3JkPWFkZFdvcmQgICAgO1xyXG59XHJcbmlmICh0eXBlb2YgbW9kdWxlIT1cInVuZGVmaW5lZFwiKVxyXG5cdG1vZHVsZS5leHBvcnRzPUplRm9ydGhWTTtcclxuZWxzZVxyXG5cdHdpbmRvdy52bT1uZXcgSmVGb3J0aFZNKCk7XHJcbi8vICB2bSBpcyBub3cgY3JlYWRlZCBhbmQgcmVhZHkgdG8gdXNlLiIsImZ1bmN0aW9uIGV4dCh2bSkge1xyXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vIHRvb2xzXHJcbnZtLmVxdWFsPWZ1bmN0aW9uIGVxdWFsKHRhZyx2YWx1ZSxleHBlY3RlZCl7IHZhciB0OyAvLyBhc3VyZSB2YWx1ZSBpcyBleGFjdGx5IGVxdWFsIHRvIGV4cGVjdGVkXHJcbiAgdm0udGVzdHMrKztcclxuICBpZih2YWx1ZT09PWV4cGVjdGVkKVxyXG4gICAgdm0ucGFzc2VkKyssIHZtLnNob3dUc3QuYXBwbHkodm0sW3RhZysnIG9rJ10pO1xyXG4gIGVsc2V7XHJcbiAgICB2YXIgdHY9dHlwZW9mIHZhbHVlLCB0ZT10eXBlb2YgZXhwZWN0ZWQ7XHJcbiAgICB0PSc/Pz8gJyt0YWcrJyB2YWx1ZTonK3ZhbHVlKycgbm90IGVxdWFsIHRvIGV4cGVjdGVkOicrZXhwZWN0ZWRcclxuICAgIHZtLnNob3dFcnIuYXBwbHkodm0sW3RdKTtcclxuICAgIGlmKHR2PT09J3N0cmluZycpXHJcbiAgICAgIHQ9J3ZhbCBsZW4gJyt2YWx1ZS5sZW5ndGgrJzogJyt2YWx1ZS5zcGxpdCgnJykubWFwKGZ1bmN0aW9uKGMpe1xyXG4gICAgICAgIHJldHVybiBjLmNoYXJDb2RlQXQoMCkudG9TdHJpbmcoMTYpO1xyXG4gICAgICB9KS5qb2luKCcgJyksIHZtLnNob3dFcnIuYXBwbHkodm0sW3RdKTtcclxuICAgIGlmKHRlPT09J3N0cmluZycpXHJcbiAgICAgIHQ9J2V4cCBsZW4gJytleHBlY3RlZC5sZW5ndGgrJzogJytleHBlY3RlZC5zcGxpdCgnJykubWFwKGZ1bmN0aW9uKGMpe1xyXG4gICAgICAgIHJldHVybiBjLmNoYXJDb2RlQXQoMCkudG9TdHJpbmcoMTYpO1xyXG4gICAgICB9KS5qb2luKCcgJyksIHZtLnNob3dFcnIuYXBwbHkodm0sW3RdKTtcclxuICB9XHJcbn1cclxudm0udHJtPWZ1bmN0aW9uIHRybSh4KXsgLy8gaWdub3JlIGFsbCBzcGFjZSwgXFx0LCBvciBcXG4gaW4gc3RyaW5nIHhcclxuICAgIHZhciB5PScnO1xyXG4gICAgZm9yKHZhciBpPTA7aTx4Lmxlbmd0aDtpKyspe1xyXG4gICAgICAgIHZhciBjPXguY2hhckF0KGkpO1xyXG4gICAgICAgIGlmKGMhPT0nICcmJmMhPT0nXFx0JyYmYyE9PSdcXG4nKXkrPWM7XHJcbiAgICB9XHJcbiAgICByZXR1cm4geTtcclxufVxyXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG52bS5zaG93V29yZHM9ZnVuY3Rpb24oKXtcclxuXHR2YXIgbnc9dm0ud29yZHMubGVuZ3RoO1xyXG5cdHZhciBwcmltaXRpdmVzPVtdLCBjb2xvbnM9W107XHJcblx0dm0ud29yZHMuZm9yRWFjaChmdW5jdGlvbih3LGkpe1xyXG5cdFx0aWYodyl7XHR2YXIgdHlwZT10eXBlb2Ygdy54dCwgbmFtZT1pKycgJyt3Lm5hbWU7XHJcblx0XHRcdGlmKHR5cGU9PT0nZnVuY3Rpb24nKSBwcmltaXRpdmVzLnB1c2gobmFtZSk7XHJcblx0XHRcdGVsc2UgaWYodHlwZT09PSdudW1iZXInKSBjb2xvbnMucHVzaChuYW1lKTtcclxuXHRcdH1cclxuXHR9KTtcclxuXHR2YXIgbnA9cHJpbWl0aXZlcy5sZW5ndGgsIG5jPWNvbG9ucy5sZW5ndGgsIG5pPW53LW5wLW5jO1xyXG5cdHZtLmNyKG53Kycgd29yZHMgKCcrXHJcblx0XHRucCsnIHByaW1pdGl2ZXMgJytcclxuXHRcdG5jKycgY29sb25zICcrXHJcblx0XHRuaSsnIGlnbm9yZXMnKTtcclxuXHR2bS50eXBlLmFwcGx5KHZtLFsncHJpbWl0aXZlczonXSk7XHJcblx0cHJpbWl0aXZlcy5mb3JFYWNoKGZ1bmN0aW9uKHcpe1xyXG5cdFx0aWYodm0udG9iLmxlbmd0aCt3Lmxlbmd0aCsxPjgwKXZtLmNyLmFwcGx5KHZtLFtdKTtcclxuXHRcdHZtLnR5cGUuYXBwbHkodm0sWycgJyt3XSk7XHJcblx0fSk7XHJcblx0aWYodm0udG9iKXZtLmNyLmFwcGx5KHZtLFtdKTtcclxuXHR2bS50eXBlLmFwcGx5KHZtLFsnY29sb25zOiddKTtcclxuXHRjb2xvbnMuZm9yRWFjaChmdW5jdGlvbih3KXtcclxuXHRcdGlmKHZtLnRvYi5sZW5ndGgrdy5sZW5ndGgrMT44MCl2bS5jci5hcHBseSh2bSxbXSk7XHJcblx0XHR2bS50eXBlLmFwcGx5KHZtLFsnICcrd10pO1xyXG5cdH0pO1xyXG5cdGlmKHZtLnRvYil2bS5jci5hcHBseSh2bSxbXSk7XHJcbn07XHJcbnZtLnNlZUNvbG9uPWZ1bmN0aW9uIHNlZUNvbG9uKGFkZHIpe1xyXG4gIHZhciBpcD1hZGRyLHByZXZOYW1lPScnLGNvZGVMaW1pdD0wO1xyXG4gIGRvIHtcclxuICAgIHZhciBzPWlwLCB3PXZtLmNBcmVhW2lwKytdO1xyXG4gICAgcys9JzogJywgbj10eXBlb2Ygdz09PSdvYmplY3QnP3cubmFtZTonJztcclxuICAgIGlmKG4peyB2YXIgeD13Lnh0LCB0PXR5cGVvZiB4O1xyXG4gICAgICBzKz1uLnJlcGxhY2UoLzwvZywnJmx0OycpKyh0PT09J2Z1bmN0aW9uJz8nIHByaW1pdGl2ZSc6dD09PSdudW1iZXInPygnIGNvbG9uIGF0ICcreCk6JycpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYoKHByZXZOYW1lPT09J2JyYW5jaCcgfHwgcHJldk5hbWU9PT0nekJyYW5jaCcpKXtcclxuICAgICAgICBpZih3PjApXHJcbiAgICAgICAgICBjb2RlTGltaXQ9TWF0aC5tYXgoY29kZUxpbWl0LGlwK3cpO1xyXG4gICAgICAgIHMrPScodG8gJysoaXArdykrJykgJztcclxuICAgICAgfVxyXG4gICAgICBzKz13O1xyXG4gICAgfVxyXG4gICAgdm0uY3IuYXBwbHkodm0sW3NdKTtcclxuICAgIHByZXZOYW1lPW47XHJcbiAgfSB3aGlsZSgoY29kZUxpbWl0ICYmIGlwPGNvZGVMaW1pdCkgfHwgbiE9PSdleGl0Jyk7XHJcbn07XHJcbnZtLnNlZVdvcmQ9ZnVuY3Rpb24gc2VlV29yZCh3KXtcclxuXHR2YXIgbz0gdHlwZW9mIG89PT0nc3RyaW5nJz92bS5uYW1lV29yZFt3XTp3O1xyXG5cdGlmKHR5cGVvZiBvPT09J29iamVjdCcpe1xyXG4gICAgICB2YXIgbj1vLm5hbWUsIHg9by54dCwgdD10eXBlb2YgeCwgaT1vLmltbWVkaWF0ZT8naW1tZWRpYXRlJzonJztcclxuXHRcdGlmKHQ9PT0nZnVuY3Rpb24nKXtcclxuXHRcdFx0dm0uY3IuYXBwbHkodm0sW24rJyBwcmltaXRpdmUgJytpXSksdm0uY3IuYXBwbHkodm0sW3gudG9TdHJpbmcoKS5yZXBsYWNlKC88L2csJyZsdDsnKV0pO1xyXG5cdFx0fSBlbHNlIGlmKHQ9PT0nbnVtYmVyJyAmJiB4JTE9PT0wKXtcclxuXHRcdFx0dm0uY3IuYXBwbHkodm0sW24rJyBjb2xvbiAnK2ldKSx2bS5zZWVDb2xvbi5hcHBseSh2bSxbeF0pO1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdHZtLmNyLmFwcGx5KHZtLFtuKycgeHQ9Jyt4KycgPz8/Pz8nXSk7XHJcblx0XHR9XHJcblx0fWVsc2V7XHJcblx0XHR2bS5jci5hcHBseSh2bSxbdysnID8/Pz8/J10pO1xyXG5cdH1cclxufTtcclxudm0uc2VlQXJyYXk9ZnVuY3Rpb24gc2VlQXJyYXkoYXJyKXtcclxuXHR2YXIgb2xkPXZtLmNBcmVhOyBhZGRyPW9sZC5sZW5ndGg7XHJcblx0dm0uY0FyZWE9dm0uY0FyZWEuY29uY2F0KGFycik7XHJcblx0dm0uc2VlQ29sb24uYXBwbHkodm0sW2FkZHJdKTtcclxuXHR2bS5jQXJlYT1vbGQ7XHJcbn07XHJcbnZtLnNlZT1mdW5jdGlvbiBzZWUoeCl7XHJcblx0dmFyIG89eHx8dm0ubmV4dFRva2VuLmFwcGx5KHZtLFtdKTtcclxuXHR2YXIgdD10eXBlb2YgbztcclxuXHRpZih0PT09J251bWJlcicgJiYgbyUxPT09MCl7XHJcblx0XHR2bS5zZWVDb2xvbi5hcHBseSh2bSxbb10pO1xyXG5cdH0gZWxzZSBpZih0PT09J29iamVjdCcpe1xyXG5cdFx0dm0uc2VlV29yZC5hcHBseSh2bSxbb10pO1xyXG5cdH0gZWxzZSBpZih0PT09J3N0cmluZycpe1xyXG5cdFx0dm0uc2VlV29yZC5hcHBseSh2bSxbdm0ubmFtZVdvcmRbb11dKTtcclxuXHR9IGVsc2Uge1xyXG5cdFx0dm0uY3IuYXBwbHkodm0sW28rJyA/Pz8/PyddKTtcclxuXHR9XHJcbn07XHJcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8gdG9vbHNcclxudm0uYWRkV29yZC5hcHBseSh2bSxbJ2NvZGUnICx2bS5jb2RlXSk7XHJcbnZtLmFkZFdvcmQuYXBwbHkodm0sWydkb0xpdCcsdm0uZG9MaXRdKTtcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdC8vXHR2MlxyXG52bS5hZGRXb3JkLmFwcGx5KHZtLFsnZXhpdCcgLHZtLmV4aXQgXSk7XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQvL1x0djJcclxudm0uYWRkV29yZC5hcHBseSh2bSxbJ3dvcmRzJyx2bS5zaG93V29yZHNdKTtcclxudm0uYWRkV29yZC5hcHBseSh2bSxbJ3NlZScgICx2bS5zZWVdKTtcclxudm0uYWRkV29yZC5hcHBseSh2bSxbJ3R5cGUnICx2bS50eXBlXSk7XHJcbnZtLmFkZFdvcmQuYXBwbHkodm0sWydjcicgICAsdm0uY3JdKTtcclxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8gdjBcclxudm0uYWRkV29yZC5hcHBseSh2bSxbJ3IxJyxmdW5jdGlvbigpe0xFRDMud3JpdGUoMSk7fV0pO1xyXG52bS5hZGRXb3JkLmFwcGx5KHZtLFsncjAnLGZ1bmN0aW9uKCl7TEVEMy53cml0ZSgwKTt9XSk7XHJcbnZtLmFkZFdvcmQuYXBwbHkodm0sWydnMScsZnVuY3Rpb24oKXtMRUQyLndyaXRlKDEpO31dKTtcclxudm0uYWRkV29yZC5hcHBseSh2bSxbJ3kxJyxmdW5jdGlvbigpe0xFRDEud3JpdGUoMSk7fV0pO1xyXG52bS5hZGRXb3JkLmFwcGx5KHZtLFsnYjEnLGZ1bmN0aW9uKCl7TEVENC53cml0ZSgxKTt9XSk7XHJcbnZtLmFkZFdvcmQuYXBwbHkodm0sWydnMCcsZnVuY3Rpb24oKXtMRUQyLndyaXRlKDApO31dKTtcclxudm0uYWRkV29yZC5hcHBseSh2bSxbJ3kwJyxmdW5jdGlvbigpe0xFRDEud3JpdGUoMCk7fV0pO1xyXG52bS5hZGRXb3JkLmFwcGx5KHZtLFsnYjAnLGZ1bmN0aW9uKCl7TEVENC53cml0ZSgwKTt9XSk7XHJcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vIHYxXHJcbnZtLmFkZFdvcmQuYXBwbHkodm0sWycuJyxmdW5jdGlvbigpe3ZtLnR5cGUuY2FsbCh0aGlzKSx2bS50eXBlLmFwcGx5KHRoaXMsW1wiIFwiXSk7fV0pO1xyXG52bS5hZGRXb3JkLmFwcGx5KHZtLFsnKycsZnVuY3Rpb24oKXt2YXIgYj12bS5kU3RhY2sucG9wKCk7dm0uZFN0YWNrLnB1c2godm0uZFN0YWNrLnBvcCgpK2IpO31dKTtcclxudm0uYWRkV29yZC5hcHBseSh2bSxbJy0nLGZ1bmN0aW9uKCl7dmFyIGI9dm0uZFN0YWNrLnBvcCgpO3ZtLmRTdGFjay5wdXNoKHZtLmRTdGFjay5wb3AoKS1iKTt9XSk7XHJcbnZtLmFkZFdvcmQuYXBwbHkodm0sWycqJyxmdW5jdGlvbigpe3ZhciBiPXZtLmRTdGFjay5wb3AoKTt2bS5kU3RhY2sucHVzaCh2bS5kU3RhY2sucG9wKCkqYik7fV0pO1xyXG52bS5hZGRXb3JkLmFwcGx5KHZtLFsnLycsZnVuY3Rpb24oKXt2YXIgYj12bS5kU3RhY2sucG9wKCk7dm0uZFN0YWNrLnB1c2godm0uZFN0YWNrLnBvcCgpL2IpO31dKTtcclxudm0uYWRkV29yZC5hcHBseSh2bSxbICcxKycgLGZ1bmN0aW9uKCl7dmFyIHM9dm0uZFN0YWNrOyBzW3MubGVuZ3RoLTFdKys7fV0pO1xyXG52bS5hZGRXb3JkLmFwcGx5KHZtLFsgJzEtJyAsZnVuY3Rpb24oKXt2YXIgcz12bS5kU3RhY2s7IHNbcy5sZW5ndGgtMV0tLTt9XSk7XHJcbnZtLmFkZFdvcmQuYXBwbHkodm0sWyAnMisnICxmdW5jdGlvbigpe3ZhciBzPXZtLmRTdGFjazsgc1tzLmxlbmd0aC0xXSs9Mjt9XSk7XHJcbnZtLmFkZFdvcmQuYXBwbHkodm0sWyAnMi0nICxmdW5jdGlvbigpe3ZhciBzPXZtLmRTdGFjazsgc1tzLmxlbmd0aC0xXS09Mjt9XSk7XHJcbnZtLmFkZFdvcmQuYXBwbHkodm0sWyAnMionICxmdW5jdGlvbigpe3ZhciBzPXZtLmRTdGFjazsgc1tzLmxlbmd0aC0xXSo9Mjt9XSk7XHJcbnZtLmFkZFdvcmQuYXBwbHkodm0sWyAnMi8nICxmdW5jdGlvbigpe3ZhciBzPXZtLmRTdGFjazsgc1tzLmxlbmd0aC0xXS89Mjt9XSk7XHJcbnZtLmFkZFdvcmQuYXBwbHkodm0sWyAnMiUnICxmdW5jdGlvbigpe3ZhciBzPXZtLmRTdGFjazsgc1tzLmxlbmd0aC0xXSU9Mjt9XSk7XHJcbnZtLmFkZFdvcmQuYXBwbHkodm0sWyAnbW9kJyxmdW5jdGlvbigpe3ZhciBzPXZtLmRTdGFjaywgZD1zLnBvcCgpOyBzW3MubGVuZ3RoLTFdJT1kO31dKTtcclxudm0uYWRkV29yZC5hcHBseSh2bSxbJy9tb2QnLGZ1bmN0aW9uKCl7XHJcblx0dmFyIHM9dm0uZFN0YWNrLCB0PXMubGVuZ3RoLTEsbj10LTEsc249c1tuXSxzdD1zW3RdLHI9c1tuXT1zbiVzdDsgc1t0XT0oc24tcikvc3Q7fV0pO1xyXG52bS5hZGRXb3JkLmFwcGx5KHZtLFsnYW5kJyxmdW5jdGlvbigpe3ZtLmRTdGFjay5wdXNoKHZtLmRTdGFjay5wb3AoKSZ2bS5kU3RhY2sucG9wKCkpO31dKTtcclxudm0uYWRkV29yZC5hcHBseSh2bSxbJ29yJyAsZnVuY3Rpb24oKXt2bS5kU3RhY2sucHVzaCh2bS5kU3RhY2sucG9wKCl8dm0uZFN0YWNrLnBvcCgpKTt9XSk7XHJcbnZtLmFkZFdvcmQuYXBwbHkodm0sWyd4b3InLGZ1bmN0aW9uKCl7dm0uZFN0YWNrLnB1c2godm0uZFN0YWNrLnBvcCgpXnZtLmRTdGFjay5wb3AoKSk7fV0pO1xyXG52bS5hZGRXb3JkLmFwcGx5KHZtLFsnaGV4JyAgICAsZnVuY3Rpb24oKXt2bS5iYXNlPTE2O31dKTtcclxudm0uYWRkV29yZC5hcHBseSh2bSxbJ2RlY2ltYWwnLGZ1bmN0aW9uKCl7dm0uYmFzZT0xMDt9XSk7XHJcbnZtLmFkZFdvcmQuYXBwbHkodm0sWydiaW5hcnknICxmdW5jdGlvbigpe3ZtLmJhc2U9IDI7fV0pO1xyXG52bS5hZGRXb3JkLmFwcGx5KHZtLFsnLnInLGZ1bmN0aW9uKCl7XHJcblx0dmFyIG09dm0uZFN0YWNrLnBvcCgpLG49XCJcIit2bS5kU3RhY2sucG9wKCk7dm0udHlwZS5hcHBseSh2bSxbXCIgICAgICAgICBcIi5zdWJzdHIoMCxtLW4ubGVuZ3RoKStuXSk7fV0pO1xyXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLyB2MlxyXG52bS5hZGRXb3JkLmFwcGx5KHZtLFsnOicsZnVuY3Rpb24oKXtcclxuXHR2bS5uZXdOYW1lPXZtLm5leHRUb2tlbi5hcHBseSh2bSxbXSksdm0ubmV3WHQ9dm0uY0FyZWEubGVuZ3RoLHZtLmNvbXBpbGluZz0xO31dKTtcclxudm0uYWRkV29yZC5hcHBseSh2bSxbJ2ltbWVkaWF0ZScsZnVuY3Rpb24oKXt2bS53b3Jkc1t2bS53b3Jkcy5sZW5ndGgtMV0uaW1tZWRpYXRlPTE7fV0pO1xyXG52bS5hZGRXb3JkLmFwcGx5KHZtLFsnOycsZnVuY3Rpb24oKXtcclxuXHR2bS5jb21waWxlQ29kZS5hcHBseSh2bSxbXCJleGl0XCJdKSx2bS5jb21waWxpbmc9MDt2bS5hZGRXb3JkLmFwcGx5KHZtLFt2bS5uZXdOYW1lLHZtLm5ld1h0XSk7fSwnaW1tZWRpYXRlJ10pO1xyXG52bS5hZGRXb3JkLmFwcGx5KHZtLFsnckAnLGZ1bmN0aW9uKCl7dm0uZFN0YWNrLnB1c2godm0uclN0YWNrW3ZtLnJTdGFjay5sZW5ndGgtMV0pO31dKTtcclxudm0uYWRkV29yZC5hcHBseSh2bSxbJ2knICxmdW5jdGlvbigpe3ZtLmRTdGFjay5wdXNoKHZtLnJTdGFja1t2bS5yU3RhY2subGVuZ3RoLTFdLmkpO31dKTtcclxudm0uYWRkV29yZC5hcHBseSh2bSxbJz5yJyxmdW5jdGlvbigpe3ZtLnJTdGFjay5wdXNoKHZtLmRTdGFjay5wb3AoKSk7fV0pO1xyXG52bS5hZGRXb3JkLmFwcGx5KHZtLFsnZm9yJyxmdW5jdGlvbigpe1xyXG5cdGlmKHZtLmNvbXBpbGluZyl7XHJcblx0XHR2bS5jb21waWxlQ29kZS5hcHBseSh2bSxbXCI+clwiXSk7dm0uZFN0YWNrLnB1c2goe25hbWU6XCJmb3JcIixhdDp2bS5jQXJlYS5sZW5ndGh9KTsgcmV0dXJuO1xyXG5cdH1cclxuXHR2YXIgblRpYj12bS5uVGliLGk9dm0uZFN0YWNrLnBvcCgpO3ZtLnJTdGFjay5wdXNoKHtuYW1lOlwiZm9yXCIsblRpYjpuVGliLGk6aX0pO1xyXG59LCdpbW1lZGlhdGUnXSk7XHJcbnZtLmFkZFdvcmQuYXBwbHkodm0sWydkb05leHQnLGZ1bmN0aW9uKCl7XHJcblx0dmFyIGk9dm0uclN0YWNrLnBvcCgpO1xyXG5cdGlmKGkpe3ZtLnJTdGFjay5wdXNoKGktMSksdm0uaXArPXZtLmNBcmVhW3ZtLmlwXTt9XHJcblx0ZWxzZSB2bS5pcCsrO31dKTtcclxudm0uYWRkV29yZC5hcHBseSh2bSxbJ25leHQnLGZ1bmN0aW9uKCl7IHZhciBvOyAvLyB3aHkgdGhpcyB3YXMgYnJva2VuID8/Pz8/Pz8/Pz8/Pz8/Pz8/P1xyXG4gIGlmKHZtLmNvbXBpbGluZykgbz12bS5kU3RhY2sucG9wKCk7XHJcbiAgZWxzZSBvPXZtLnJTdGFja1t2bS5yU3RhY2subGVuZ3RoLTFdO1xyXG4gIHZhciB0PXR5cGVvZiBvO1xyXG4gIGlmKHQhPT1cIm9iamVjdFwiIHx8IG8ubmFtZSE9PVwiZm9yXCIpe1xyXG4gICAgdm0ucGFuaWMuYXBwbHkodm0sW1wibm8gZm9yIHRvIG1hdGNoIG5leHRcIl0pOyByZXR1cm47XHJcbiAgfVxyXG4gIGlmKHZtLmNvbXBpbGluZyl7XHJcbiAgICB2bS5jb21waWxlQ29kZS5hcHBseSh2bSxbXCJkb05leHRcIixvLmF0LXZtLmNBcmVhLmxlbmd0aC0xXSk7IHJldHVybjtcclxuICB9XHJcbiAgaWYoLS1vLmk+PTApdm0ublRpYj1vLm5UaWI7XHJcbiAgZWxzZSAgICAgICAgdm0uclN0YWNrLnBvcCgpO1xyXG59LCdpbW1lZGlhdGUnXSk7XHJcbnZtLmFkZFdvcmQuYXBwbHkodm0sWydkcm9wJyxmdW5jdGlvbigpe3ZtLmRTdGFjay5wb3AoKTt9XSk7XHJcbnZtLmFkZFdvcmQuYXBwbHkodm0sWydkdXAnLGZ1bmN0aW9uKCl7dm0uZFN0YWNrLnB1c2godm0uZFN0YWNrW3ZtLmRTdGFjay5sZW5ndGgtMV0pO31dKTtcclxudm0uYWRkV29yZC5hcHBseSh2bSxbJ292ZXInLGZ1bmN0aW9uKCl7dm0uZFN0YWNrLnB1c2godm0uZFN0YWNrW3ZtLmRTdGFjay5sZW5ndGgtMl0pO31dKTtcclxudm0uYWRkV29yZC5hcHBseSh2bSxbJ2VtaXQnLGZ1bmN0aW9uKCl7dm0udHlwZS5hcHBseSh2bSxbU3RyaW5nLmZyb21DaGFyQ29kZSh2bS5kU3RhY2sucG9wKCkpXSk7fV0pO1xyXG52bS5hZGRXb3JkLmFwcGx5KHZtLFsnYnJhbmNoJyxmdW5jdGlvbigpe3ZtLmlwKz12bS5jQXJlYVt2bS5pcF07fV0pO1xyXG52bS5hZGRXb3JkLmFwcGx5KHZtLFsnekJyYW5jaCcsZnVuY3Rpb24oKXtcclxuXHRpZih2bS5kU3RhY2sucG9wKCkpdm0uaXArKzsgZWxzZSB2bS5pcCs9dm0uY0FyZWFbdm0uaXBdO31dKTtcclxudm0uYWRkV29yZC5hcHBseSh2bSxbJ2lmJyxmdW5jdGlvbigpe1xyXG5cdGlmKHZtLmNvbXBpbGluZyl7XHJcblx0XHR2bS5jb21waWxlQ29kZS5hcHBseSh2bSxbXCJ6QnJhbmNoXCIsMF0pO1xyXG5cdFx0dm0uZFN0YWNrLnB1c2goe25hbWU6XCJpZlwiLGF0OnZtLmNBcmVhLmxlbmd0aC0xfSk7cmV0dXJuO1xyXG5cdH1cclxuXHRpZih2bS5kU3RhY2sucG9wKCkpcmV0dXJuOyAvLyAyMDE0MTIxNSBzYW0gZml4ZWRcclxuXHR2YXIgZT12bS50aWIuc3Vic3RyKHZtLm5UaWIpLmluZGV4T2YoXCJlbHNlXCIpO1xyXG5cdHZhciB0PXZtLnRpYi5zdWJzdHIodm0ublRpYikuaW5kZXhPZihcInRoZW5cIik7XHJcblx0aWYoZT49MCl7XHJcblx0XHRpZih0ICYmIHQ8ZSlcclxuXHRcdFx0dm0ublRpYis9dCs0OyAvLyB6YnJhbmNoIHRvIHRoZW5cclxuXHRcdGVsc2VcclxuXHRcdFx0dm0ublRpYis9ZSs0OyAvLyB6YnJhbmNoIHRvIGVsc2VcclxuXHR9IGVsc2UgaWYodD49MClcclxuXHRcdHZtLm5UaWIrPXQrNDsgLy8gemJyYW5jaCB0byB0aGVuXHJcblx0ZWxzZVxyXG5cdFx0dm0ucGFuaWMuYXBwbHkodm0sW1wibm8gZWxzZSBvciB0aGVuIHRvIG1hdGNoIGlmXCJdKTtcclxufSwnaW1tZWRpYXRlJ10pO1xyXG52bS5hZGRXb3JkLmFwcGx5KHZtLFsnZWxzZScsZnVuY3Rpb24gKCkge3ZhciB0O1xyXG4gIGlmKHZtLmNvbXBpbGluZyl7XHJcbiAgIHZhciBvPXZtLmRTdGFjay5wb3AoKTt0PXR5cGVvZiBvO1xyXG4gICBpZih0IT09XCJvYmplY3RcIiB8fCBvLm5hbWUhPVwiaWZcIil7XHJcbiAgICAgICAgdm0ucGFuaWMuYXBwbHkodm0sW1widGhlcmUgaXMgbm8gaWYgdG8gbWF0Y2ggZWxzZVwiXSk7cmV0dXJuO1xyXG4gICB9XHJcbiAgIHZhciBpPW8uYXQ7IHZtLmNvbXBpbGVDb2RlLmFwcGx5KHZtLFtcImJyYW5jaFwiLDBdKTtcclxuICAgdm0uZFN0YWNrLnB1c2goe25hbWU6XCJlbHNlXCIsYXQ6dm0uY0FyZWEubGVuZ3RoLTF9KTtcclxuICAgdm0uY0FyZWFbaV09dm0uY0FyZWEubGVuZ3RoLWk7cmV0dXJuO1xyXG4gIH1cclxuICB0PXZtLnRpYi5zdWJzdHIodm0ublRpYikuaW5kZXhPZihcInRoZW5cIik7XHJcbiAgaWYodD49MCkgdm0ublRpYis9dCs0OyAvLyBicmFuY2ggdG8gdGhlblxyXG4gIGVsc2Ugdm0ucGFuaWMuYXBwbHkodm0sW1widGhlcmUgaXMgbm8gdGhlbiB0byBtYXRjaCBlbHNlXCJdKTtcclxufSwnaW1tZWRpYXRlJ10pO1xyXG52bS5hZGRXb3JkLmFwcGx5KHZtLFsndGhlbicsZnVuY3Rpb24gKCkge1xyXG4gIGlmKCF2bS5jb21waWxpbmcpIHJldHVybjtcclxuICB2YXIgbz12bS5kU3RhY2sucG9wKCksdD10eXBlb2Ygbywgbj1vLm5hbWU7XHJcbiAgaWYodCE9PVwib2JqZWN0XCIgfHwgKG4hPVwiaWZcIiAmJiBuIT1cImVsc2VcIiAmJiBuIT1cImFmdFwiKSl7XHJcbiAgICAgICAgdm0ucGFuaWMuYXBwbHkodm0sW1wibm8gaWYsIGVsc2UsIGFmdCB0byBtYXRjaCB0aGVuXCJdKTtyZXR1cm47XHJcbiAgfVxyXG4gIHZhciBpPW8uYXQ7IHZtLmNBcmVhW2ldPXZtLmNBcmVhLmxlbmd0aC1pO1xyXG59LCdpbW1lZGlhdGUnXSk7XHJcbnZtLmFkZFdvcmQuYXBwbHkodm0sWydhZnQnLGZ1bmN0aW9uICgpIHt2YXIgdDtcclxuICBpZih2bS5jb21waWxpbmcpe1xyXG4gICB2YXIgcz12bS5kU3RhY2ssbz1zW3MubGVuZ3RoLTFdO3Q9dHlwZW9mIG87XHJcbiAgIGlmKHQhPT1cIm9iamVjdFwiIHx8IG8ubmFtZSE9PVwiZm9yXCIpe1xyXG4gICAgICAgIHZtLnBhbmljLmFwcGx5KHZtLFtcIm5vIGZvciB0byBtYXRjaCBhZnRcIl0pO3JldHVybjtcclxuICAgfVxyXG4gICB2YXIgaT1vLmF0O1xyXG4gICB2bS5jb21waWxlQ29kZS5hcHBseSh2bSxbXCJ6QnJhbmNoXCIsMF0pO1xyXG4gICB2bS5kU3RhY2sucHVzaCh7bmFtZTpcImFmdFwiLGF0OnZtLmNBcmVhLmxlbmd0aC0xfSk7XHJcbiAgIHJldHVybjtcclxuICB9XHJcbiAgdD12bS50aWIuc3Vic3RyKHZtLm5UaWIpLmluZGV4T2YoXCJ0aGVuXCIpO1xyXG4gIGlmKHQ+PTApIHZtLm5UaWIrPXQrNDsgLy8gYnJhbmNoIHRvIHRoZW5cclxuICBlbHNlIHZtLnBhbmljLmFwcGx5KHZtLFtcInRoZXJlIGlzIG5vIHRoZW4gdG8gbWF0Y2ggYWZ0XCJdKTtcclxufSwnaW1tZWRpYXRlJ10pO1xyXG52bS5hZGRXb3JkLmFwcGx5KHZtLFsnP2R1cCcsZnVuY3Rpb24gKCkge3ZhciBzPXZtLmRTdGFjaywgZD1zW3MubGVuZ3RoLTFdOyBpZihkKXMucHVzaChkKTt9XSk7XHJcbnZtLmFkZFdvcmQuYXBwbHkodm0sWycwPScsZnVuY3Rpb24gKCkge3ZhciBzPXZtLmRTdGFjayxtPXMubGVuZ3RoLTE7IHNbbV09IXNbbV07fV0pO1xyXG52bS5hZGRXb3JkLmFwcGx5KHZtLFsnYmVnaW4nLGZ1bmN0aW9uICgpIHtcclxuICBpZih2bS5jb21waWxpbmcpe1xyXG4gICAgICAgIHZtLmRTdGFjay5wdXNoKHtuYW1lOlwiYmVnaW5cIixhdDp2bS5jQXJlYS5sZW5ndGgtMX0pO1xyXG4gICAgICAgIHJldHVybjtcclxuICB9XHJcbiAgdm0uclN0YWNrLnB1c2goe25hbWU6XCJiZWdpblwiLG5UaWI6dm0ublRpYn0pO1xyXG59LCdpbW1lZGlhdGUnXSk7XHJcbnZtLmFkZFdvcmQuYXBwbHkodm0sWydhZ2FpbicsZnVuY3Rpb24gKCkgeyAgICB2YXIgbztcclxuICBpZih2bS5jb21waWxpbmcpXHJcbiAgICAgICAgbz12bS5kU3RhY2sucG9wKCk7XHJcbiAgZWxzZVxyXG4gICAgICAgIG89dm0uclN0YWNrW3ZtLnJTdGFjay5sZW5ndGgtMV07XHJcbiAgdmFyICAgIHQ9dHlwZW9mIG87XHJcbiAgaWYodCE9PVwib2JqZWN0XCIgfHwgby5uYW1lIT09XCJiZWdpblwiKXtcclxuICAgICAgICB2bS5wYW5pYy5hcHBseSh2bSxbXCJubyBiZWdpbiB0byBtYXRjaCBhZ2FpblwiXSk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gIH1cclxuICBpZih2bS5jb21waWxpbmcpe1xyXG4gICAgICAgIHZhciBpPW8uYXQ7XHJcbiAgICAgICAgdm0uY29tcGlsZUNvZGUuYXBwbHkodm0sWyBcImJyYW5jaFwiLCBpLXZtLmNBcmVhLmxlbmd0aF0pO1xyXG4gICAgICAgIHJldHVybjtcclxuICB9XHJcbiAgdm0ublRpYj1vLm5UaWI7XHJcbn0sJ2ltbWVkaWF0ZSddKTtcclxudm0uYWRkV29yZC5hcHBseSh2bSxbJ3VudGlsJyxmdW5jdGlvbiAoKSB7ICAgIHZhciBvO1xyXG4gIGlmKHZtLmNvbXBpbGluZylcclxuICAgICAgICBvPXZtLmRTdGFjay5wb3AoKTtcclxuICBlbHNlXHJcbiAgICAgICAgbz12bS5yU3RhY2tbdm0uclN0YWNrLmxlbmd0aC0xXTtcclxuICB2YXIgICAgdD10eXBlb2YgbztcclxuICBpZih0IT09XCJvYmplY3RcIiB8fCBvLm5hbWUhPT1cImJlZ2luXCIpe1xyXG4gICAgICAgIHZtLnBhbmljLmFwcGx5KHZtLFtcIm5vIGJlZ2luIHRvIG1hdGNoIHVudGlsXCJdKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgfVxyXG4gIGlmKHZtLmNvbXBpbGluZyl7XHJcbiAgICAgICAgdmFyIGk9by5hdDtcclxuICAgICAgICB2bS5jb21waWxlQ29kZS5hcHBseSh2bSxbIFwiekJyYW5jaFwiLCBpLXZtLmNBcmVhLmxlbmd0aF0pO1xyXG4gICAgICAgIHJldHVybjtcclxuICB9XHJcbiAgaWYodm0uZFN0YWNrLnBvcCgpKSB2bS5yU3RhY2sucG9wKCk7XHJcbiAgZWxzZSB2bS5uVGliPW8ublRpYjtcclxufSwnaW1tZWRpYXRlJ10pO1xyXG52bS5hZGRXb3JkLmFwcGx5KHZtLFsnd2hpbGUnLGZ1bmN0aW9uICgpIHsgICAgdmFyIHMsbyx0O1xyXG4gIHM9dm0uZFN0YWNrLG89c1tzLmxlbmd0aC0xXSx0PXR5cGVvZiBvO1xyXG4gIGlmKHQhPT1cIm9iamVjdFwiIHx8IG8ubmFtZSE9PVwiYmVnaW5cIil7XHJcbiAgICAgICAgdm0ucGFuaWMuYXBwbHkodm0sW1wibm8gYmVnaW4gdG8gbWF0Y2ggd2hpbGVcIl0pO3JldHVybjtcclxuICB9XHJcbiAgdmFyIGk9by5hdDsgdm0uY29tcGlsZUNvZGUuYXBwbHkodm0sW1wiekJyYW5jaFwiLDBdKTtcclxuICB2bS5kU3RhY2sucHVzaCh7bmFtZTpcIndoaWxlXCIsYXQ6dm0uY0FyZWEubGVuZ3RoLTF9KTtcclxufSwnaW1tZWRpYXRlJ10pO1xyXG52bS5hZGRXb3JkLmFwcGx5KHZtLFsncmVwZWF0JyxmdW5jdGlvbiAoKSB7XHJcbiAgdmFyIG89dm0uZFN0YWNrLnBvcCgpLHQ9dHlwZW9mIG87XHJcbiAgaWYodCE9PVwib2JqZWN0XCIgfHwgby5uYW1lIT09XCJ3aGlsZVwiKXtcclxuICAgICAgICB2bS5wYW5pYy5hcHBseSh2bSxbXCJubyB3aGlsZSB0byBtYXRjaCByZXBlYXRcIl0pO3JldHVybjtcclxuICB9XHJcbiAgdmFyIGk9by5hdDsgbz12bS5kU3RhY2sucG9wKCksdD10eXBlb2YgbztcclxuICBpZih0IT09XCJvYmplY3RcIiB8fCBvLm5hbWUhPT1cImJlZ2luXCIpe1xyXG4gICAgICAgIHZtLnBhbmljLmFwcGx5KHZtLFtcIm5vIGJlZ2luIHRvIG1hdGNoIHJlcGVhdFwiXSk7cmV0dXJuO1xyXG4gIH1cclxuICB2bS5jb21waWxlQ29kZS5hcHBseSh2bSxbXCJicmFuY2hcIixvLmF0LXZtLmNBcmVhLmxlbmd0aF0pO1xyXG4gIHZtLmNBcmVhW2ldPXZtLmNBcmVhLmxlbmd0aC1pO1xyXG59LCdpbW1lZGlhdGUnXSk7XHJcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vIHYzXHJcbnZtLm1zVGltZT1bXTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICB2Mjtcclxudm0uYWRkV29yZC5hcHBseSh2bSxbJ21zJyxmdW5jdGlvbiAobikge1xyXG4gIHZhciBtPSBuPT09dW5kZWZpbmVkID8gdm0uZFN0YWNrLnBvcCgpIDogbjtcclxuICB2YXIgdD17dGliOnZtLnRpYixuVGliOnZtLm5UaWIsdG9iOnZtLnRvYix1b2I6dm0udW9iLGRTdGFjazp2bS5kU3RhY2ssd2FrZXVwOm5ldyBEYXRlKCkrbX07XHJcbiAgdm0ud2FpdGluZz0xOyB0LnRpbWVvdXQ9c2V0VGltZW91dChmdW5jdGlvbigpe1xyXG4gICAgdmFyIGk9dm0ubXNUaW1lLm1hcChmdW5jdGlvbih0c2spe1xyXG4gICAgICByZXR1cm4gdHNrLnRpbWVvdXRcclxuICAgIH0pLmluZGV4T2YodC50aW1lb3V0KTtcclxuICAgIHZtLm1zVGltZS5zcGxpY2UoaSwxKTtcclxuICAgIHZtLnRpYj10LnRpYix2bS5uVGliPXQublRpYix2bS50b2I9dC50b2Isdm0udW9iPXQudW9iLHZtLmRTdGFjaz10LmRTdGFjaztcclxuICAgIHZtLnJlc3VtZUV4ZWMuYXBwbHkodm0sW3ZtLndhaXRpbmc9PT0xPzA6dm0ud2FpdGluZ10pO1xyXG4gIH0sbSk7XHJcbiAgdm0ubXNUaW1lLnB1c2godCk7XHJcbn1dKTtcclxudm0uYWRkV29yZC5hcHBseSh2bSxbJ2FwcGVuZCcsZnVuY3Rpb24oKXt2YXIgZCx0LG8sYSx2O1xyXG4gIGQ9dm0uZFN0YWNrLnBvcCgpLCB0PXZtLm5leHRUb2tlbi5hcHBseSh2bSxbXSksIHZtW3RdPW89ZC5hcHBlbmQodCksIGE9dm0ubmV4dFRva2VuLmFwcGx5KHZtLFtdKTtcclxuICB3aGlsZShhKXtcclxuXHR0PXZtLm5leHRUb2tlbi5hcHBseSh2bSxbXSk7XHJcbiAgICBpZihhPT09J3RleHQnKW8udGV4dCgnICcrdCk7XHJcbiAgICBlbHNlIG8uYXR0cihhLHQpO1xyXG5cdGlmKHZtLmM9PT0nXFxuJylicmVhaztcclxuXHRhPXZtLm5leHRUb2tlbi5hcHBseSh2bSxbXSk7XHJcbiAgfVxyXG59XSk7XHJcbn07XHJcbmlmKHR5cGVvZiBtb2R1bGUhPSd1bmRlZmluZWQnKVxyXG5cdG1vZHVsZS5leHBvcnRzPWV4dDtcclxuZWxzZVxyXG5cdGV4dCh2bSk7XHJcbiIsImZ1bmN0aW9uIHRzdCh2bSkge1xyXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbi8vIGplZnZtLnYyX3RzdC5qcyAvL1xyXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbnZtLnRlc3RzPTAsIHZtLnBhc3NlZD0wO1xyXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLyB2MFxyXG52bS5lcXVhbC5hcHBseSh2bSxbJ3Rlc3QgMScsdm0udHJtLmFwcGx5KHZtLFt2bS5uYW1lV29yZFsncjEnXS54dC50b1N0cmluZygpXSksXCJmdW5jdGlvbigpe0xFRDMud3JpdGUoMSk7fVwiXSk7XHJcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vIHYwXHJcbnZtLmVxdWFsLmFwcGx5KHZtLFsndGVzdCAyJyx2bS50cm0uYXBwbHkodm0sW3ZtLm5hbWVXb3JkWydyMCddLnh0LnRvU3RyaW5nKCldKSxcImZ1bmN0aW9uKCl7TEVEMy53cml0ZSgwKTt9XCJdKTtcclxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8gdjFcclxudm0uZXhlYy5hcHBseSh2bSxbJzEyMyAuIDQuNTYgLiAtMTAgLiAkNDEgLiBjciddKTtcclxudm0uZXF1YWwuYXBwbHkodm0sWyd0ZXN0IDMnLHZtLmxhc3RUb2IsXCIxMjMgNC41NiAtMTAgNjUgXCJdKTtcclxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8gdjFcclxudm0uZXhlYy5hcHBseSh2bSxbJ1wiYWJjXCIgLiBcImRlZiAxMjNcIiAuIGNyJ10pO1xyXG52bS5lcXVhbC5hcHBseSh2bSxbJ3Rlc3QgNCcsdm0ubGFzdFRvYixcImFiYyBkZWYgMTIzIFwiXSk7XHJcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vIHYxXHJcbnZtLmV4ZWMuYXBwbHkodm0sW1wiJ2doaScgLiBjclwiXSk7XHJcbnZtLmVxdWFsLmFwcGx5KHZtLFsndGVzdCA1Jyx2bS5sYXN0VG9iLFwiZ2hpIFwiXSk7XHJcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vIHYxXHJcbnZtLmV4ZWMuYXBwbHkodm0sWyc1IHR5cGUgMiAuIDUgLiBjciddKTtcclxudm0uZXF1YWwuYXBwbHkodm0sWyd0ZXN0IDYnLHZtLmxhc3RUb2IsXCI1MiA1IFwiXSk7XHJcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vIHYxXHJcbnZtLmV4ZWMuYXBwbHkodm0sWydcImFiYyBkZWZcIiAnK1wiJ2doaScgKyAuIDIuMjMgMC4yMyAtIDMgKiAyIC8gLiBjclwiXSk7XHJcbnZtLmVxdWFsLmFwcGx5KHZtLFsndGVzdCA3Jyx2bS5sYXN0VG9iLFwiYWJjIGRlZmdoaSAzIFwiXSk7XHJcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vIHYxXHJcbnZtLmV4ZWMuYXBwbHkodm0sWycxMjggaGV4IC4gY3IgZGVjaW1hbCddKTtcclxudm0uZXF1YWwuYXBwbHkodm0sWyd0ZXN0IDgnLHZtLmxhc3RUb2IsXCI4MCBcIl0pO1xyXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLyB2MVxyXG52bS5leGVjLmFwcGx5KHZtLFsnaGV4IDEwMCBkZWNpbWFsIC4gY3InXSk7XHJcbnZtLmVxdWFsLmFwcGx5KHZtLFsndGVzdCA5Jyx2bS5sYXN0VG9iLFwiMjU2IFwiXSk7XHJcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vIHYxXHJcbnZtLmV4ZWMuYXBwbHkodm0sWycxMSBiaW5hcnkgLiBkZWNpbWFsIGNyJ10pO1xyXG52bS5lcXVhbC5hcHBseSh2bSxbJ3Rlc3QgMTAnLHZtLmxhc3RUb2IsXCIxMDExIFwiXSk7XHJcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vIHYxXHJcbnZtLmV4ZWMuYXBwbHkodm0sWyc1IDMgLnIgMTAgMyAuciAxNSAzIC5yIGNyJ10pO1xyXG52bS5lcXVhbC5hcHBseSh2bSxbJ3Rlc3QgMTEnLHZtLmxhc3RUb2IsXCIgIDUgMTAgMTVcIl0pO1xyXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLyB2MlxyXG52bS5jQXJlYT1bIDAsdm0ubmFtZVdvcmRbJ2RvTGl0J10sMyx2bS5uYW1lV29yZFsnLnInXSx2bS5uYW1lV29yZFsnZXhpdCddIF0sdm0uYWRkV29yZCgndCcsMSk7XHJcbnZtLmV4ZWMuYXBwbHkodm0sWyc1IHQgMTAgdCAxNSB0IGNyJ10pO1xyXG52bS5lcXVhbC5hcHBseSh2bSxbJ3Rlc3QgMTInLHZtLmxhc3RUb2IsXCIgIDUgMTAgMTVcIl0pO1xyXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vIHYyXHJcbnZtLmV4ZWMuYXBwbHkodm0sWyc6IHggMyAuciA7IDUgeCAxMCB4IDE1IHggY3InXSk7XHJcbnZtLmVxdWFsLmFwcGx5KHZtLFsndGVzdCAxMycsdm0ubGFzdFRvYixcIiAgNSAxMCAxNVwiXSk7XHJcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8gdjJcclxudm0uZXhlYy5hcHBseSh2bSxbJzogeiA5IGZvciByQCAuIG5leHQgOyB6IGNyJ10pO1xyXG52bS5lcXVhbC5hcHBseSh2bSxbJ3Rlc3QgMTQnLHZtLmxhc3RUb2IsJzkgOCA3IDYgNSA0IDMgMiAxIDAgJ10pO1xyXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vIHYyXHJcbnZtLmV4ZWMuYXBwbHkodm0sWyc6IHQxIDggZm9yIGR1cCA5IHJAIC0gKiAzIC5yIG5leHQgZHJvcCA7IDMgdDEgY3InXSk7XHJcbnZtLmVxdWFsLmFwcGx5KHZtLFsndGVzdCAxNScsdm0ubGFzdFRvYiwnICAzICA2ICA5IDEyIDE1IDE4IDIxIDI0IDI3J10pO1xyXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vIHYyXHJcbnZtLmV4ZWMuYXBwbHkodm0sWyc6IHQyIDggZm9yIDkgckAgLSB0MSBjciBuZXh0IDsgdDInXSk7XHJcbnZtLmVxdWFsLmFwcGx5KHZtLFsndGVzdCAxNicsdm0ubGFzdFRvYiwnICA5IDE4IDI3IDM2IDQ1IDU0IDYzIDcyIDgxJ10pO1xyXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vIHYyXHJcbnZhciBhZGRyPXZtLmNBcmVhLmxlbmd0aDtcclxudmFyIGNvbXBpbGVkPVtcclxuXHR2bS5uYW1lV29yZFsnekJyYW5jaCddLDUsXHJcblx0dm0ubmFtZVdvcmRbJ2RvTGl0J10sMSxcclxuXHR2bS5uYW1lV29yZFsnYnJhbmNoJ10sMyxcclxuXHR2bS5uYW1lV29yZFsnZG9MaXQnXSwwLFxyXG5cdHZtLm5hbWVXb3JkWydleGl0J11cclxuXTtcclxudm0uY0FyZWE9dm0uY0FyZWEuY29uY2F0KGNvbXBpbGVkKTtcclxudm0uYWRkV29yZC5hcHBseSh2bSxbJ3QxNycsYWRkcl0pO1xyXG52bS5leGVjLmFwcGx5KHZtLFsnMCB0MTcgLiA1IHQxNyAuIGNyJ10pO1xyXG52bS5lcXVhbC5hcHBseSh2bSxbJ3Rlc3QgMTcnLHZtLmxhc3RUb2IsJzAgMSAnXSk7XHJcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8gdjJcclxuYWRkcj12bS5jQXJlYS5sZW5ndGg7XHJcbnZtLmV4ZWMuYXBwbHkodm0sWyc6IHQxOCBpZiAxIGVsc2UgMCB0aGVuIDsnXSk7XHJcbnZtLmVxdWFsLmFwcGx5KHZtLFsndGVzdCAxOCcsSlNPTi5zdHJpbmdpZnkodm0uY0FyZWEuc2xpY2UoYWRkcikpLEpTT04uc3RyaW5naWZ5KGNvbXBpbGVkKV0pO1xyXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vIHYyXHJcbnZtLmV4ZWMuYXBwbHkodm0sWycwIHQxOCAuIDUgdDE4IC4gY3InXSk7XHJcbnZtLmVxdWFsLmFwcGx5KHZtLFsndGVzdCAxOScsdm0ubGFzdFRvYiwnMCAxICddKTtcclxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLyB2MlxyXG52bS5leGVjLmFwcGx5KHZtLFsnOiB0MjAgYmVnaW4gZHVwIC4gMS0gP2R1cCAwPSBpZiBleGl0IHRoZW4gYWdhaW4gOyA5IHQyMCBjciddKTtcclxudm0uZXF1YWwuYXBwbHkodm0sWyd0ZXN0IDIwJyx2bS5sYXN0VG9iLCc5IDggNyA2IDUgNCAzIDIgMSAnXSk7XHJcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8gdjJcclxudm0uZXhlYy5hcHBseSh2bSxbJzogdDIxIGJlZ2luIGR1cCAuIDEtID9kdXAgMD0gdW50aWwgOyA5IHQyMSBjciddKTtcclxudm0uZXF1YWwuYXBwbHkodm0sWyd0ZXN0IDIxJyx2bS5sYXN0VG9iLCc5IDggNyA2IDUgNCAzIDIgMSAnXSk7XHJcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8gdjJcclxudm0uZXhlYy5hcHBseSh2bSxbJzogdDIyIGJlZ2luID9kdXAgd2hpbGUgZHVwIC4gMS0gcmVwZWF0IDsgOSB0MjIgY3InXSk7XHJcbnZtLmVxdWFsLmFwcGx5KHZtLFsndGVzdCAyMicsdm0ubGFzdFRvYiwnOSA4IDcgNiA1IDQgMyAyIDEgJ10pO1xyXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vIHYyXHJcbnZtLmV4ZWMuYXBwbHkodm0sWycxMCAzIG1vZCAuIGNyJ10pO1xyXG52bS5lcXVhbC5hcHBseSh2bSxbJ3Rlc3QgMjMnLHZtLmxhc3RUb2IsJzEgJ10pO1xyXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vIHYyXHJcbnZtLmV4ZWMuYXBwbHkodm0sWycxMCAzIC9tb2QgLiAuIGNyJ10pO1xyXG52bS5lcXVhbC5hcHBseSh2bSxbJ3Rlc3QgMjQnLHZtLmxhc3RUb2IsJzMgMSAnXSk7XHJcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8gdjJcclxudm0uZXhlYy5hcHBseSh2bSxbJzMgYmVnaW4gZHVwIC4gMSAtID9kdXAgMD0gdW50aWwgY3InXSk7XHJcbnZtLmVxdWFsLmFwcGx5KHZtLFsndGVzdCAyNScsdm0ubGFzdFRvYiwnMyAyIDEgJ10pO1xyXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vIHYyXHJcbnZtLmV4ZWMuYXBwbHkodm0sWyc4IGZvciA5IGkgLSA4XFxuICBmb3IgZHVwIDkgaSAtICogMyAuciBcXG4gIG5leHQgY3IgZHJvcFxcbm5leHQnXSk7XHJcbnZtLmVxdWFsLmFwcGx5KHZtLFsndGVzdCAyNicsdm0ubGFzdFRvYiwnICA5IDE4IDI3IDM2IDQ1IDU0IDYzIDcyIDgxJ10pO1xyXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vIHYyXHJcbnZtLnNob3dUc3QuYXBwbHkodm0sWyd0b3RhbCB0ZXN0cyAnK3ZtLnRlc3RzKycgcGFzc2VkICcrdm0ucGFzc2VkXSk7XHJcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxudm0uYWRkV29yZC5hcHBseSh2bSxbJ3N0b3AnLHZtLnN0b3BdKTtcclxudm0uYWRkV29yZC5hcHBseSh2bSxbJ2dvJyx2bS5nb10pO1xyXG52bS5YPTE1MCwgdm0uWT0xMDAsIHZtLlI9MzAsIHZtLlBDPSdibGFjaycsIHZtLkJDPSdyZ2JhKDI1NSwwLDAsLjEpJywgdm0uUFc9LjUsIHZtLlBDPSdibGFjayc7XHJcbnZtLmFkZFdvcmQuYXBwbHkodm0sWydjaXJjbGUnLGZ1bmN0aW9uKCl7XHJcblx0ZDMuc2VsZWN0KCdzdmcnKS5hcHBlbmQoJ2NpcmNsZScpXHJcblx0LmF0dHIoJ2N4Jyx2bS5YKS5hdHRyKCdjeScsdm0uWSkuYXR0cigncicsdm0uUilcclxuXHQuYXR0cignc3Ryb2tlJyx2bS5QQykuYXR0cignZmlsbCcsdm0uQkMpXHJcblx0LmF0dHIoJ3N0cm9rZS13aWR0aCcsdm0uUFcpO1xyXG59XSk7XHJcbnZtLkg9MTUwLCB2bS5XPTE1MDtcclxudm0uYWRkV29yZC5hcHBseSh2bSxbJ3JlY3QnLGZ1bmN0aW9uKCl7XHJcblx0dmFyIHM9e2ZpbGw6dm0uQkMsc3Ryb2tlOnZtLlBDLCdzdHJva2Utd2lkdGgnOnZtLlBXfTtcclxuXHRkMy5zZWxlY3QoJ3N2ZycpLmFwcGVuZCgncmVjdCcpXHJcblx0LmF0dHIoJ3gnLHZtLlgtdm0uVy8yKS5hdHRyKCd5Jyx2bS5ZLXZtLkgvMikuYXR0cignd2lkdGgnLHZtLlcpLmF0dHIoJ2hlaWdodCcsdm0uSClcclxuXHQuYXR0cignc3R5bGUnLE9iamVjdC5rZXlzKHMpLm1hcChmdW5jdGlvbihhKXtcclxuXHRcdHJldHVybiBhKyc6JytzW2FdO1xyXG5cdH0pLmpvaW4oJzsnKSk7XHJcbn1dKTtcclxufVxyXG5pZih0eXBlb2YgbW9kdWxlIT0ndW5kZWZpbmVkJylcclxuXHRtb2R1bGUuZXhwb3J0cz10c3Q7XHJcbmVsc2VcclxuXHR0c3Qodm0pOyIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xyXG4vKlxyXG5jb252ZXJ0IHRvIHB1cmUganNcclxuc2F2ZSAtZyByZWFjdGlmeVxyXG4qL1xyXG52YXIgRT1SZWFjdC5jcmVhdGVFbGVtZW50O1xyXG5cclxudmFyIGhhc2tzYW5hZ2FwPSh0eXBlb2Yga3NhbmFnYXAhPVwidW5kZWZpbmVkXCIpO1xyXG5pZiAoaGFza3NhbmFnYXAgJiYgKHR5cGVvZiBjb25zb2xlPT1cInVuZGVmaW5lZFwiIHx8IHR5cGVvZiBjb25zb2xlLmxvZz09XCJ1bmRlZmluZWRcIikpIHtcclxuXHRcdHdpbmRvdy5jb25zb2xlPXtsb2c6a3NhbmFnYXAubG9nLGVycm9yOmtzYW5hZ2FwLmVycm9yLGRlYnVnOmtzYW5hZ2FwLmRlYnVnLHdhcm46a3NhbmFnYXAud2Fybn07XHJcblx0XHRjb25zb2xlLmxvZyhcImluc3RhbGwgY29uc29sZSBvdXRwdXQgZnVuY2l0b25cIik7XHJcbn1cclxuXHJcbnZhciBjaGVja2ZzPWZ1bmN0aW9uKCkge1xyXG5cdHJldHVybiAobmF2aWdhdG9yICYmIG5hdmlnYXRvci53ZWJraXRQZXJzaXN0ZW50U3RvcmFnZSkgfHwgaGFza3NhbmFnYXA7XHJcbn1cclxudmFyIGZlYXR1cmVjaGVja3M9e1xyXG5cdFwiZnNcIjpjaGVja2ZzXHJcbn1cclxudmFyIGNoZWNrYnJvd3NlciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcclxuXHRnZXRJbml0aWFsU3RhdGU6ZnVuY3Rpb24oKSB7XHJcblxyXG5cdFx0dmFyIG1pc3NpbmdGZWF0dXJlcz10aGlzLmdldE1pc3NpbmdGZWF0dXJlcygpO1xyXG5cdFx0cmV0dXJuIHtyZWFkeTpmYWxzZSwgbWlzc2luZzptaXNzaW5nRmVhdHVyZXN9O1xyXG5cdH0sXHJcblx0Z2V0TWlzc2luZ0ZlYXR1cmVzOmZ1bmN0aW9uKCkge1xyXG5cdFx0dmFyIGZlYXR1cmU9dGhpcy5wcm9wcy5mZWF0dXJlLnNwbGl0KFwiLFwiKTtcclxuXHRcdHZhciBzdGF0dXM9W107XHJcblx0XHRmZWF0dXJlLm1hcChmdW5jdGlvbihmKXtcclxuXHRcdFx0dmFyIGNoZWNrZXI9ZmVhdHVyZWNoZWNrc1tmXTtcclxuXHRcdFx0aWYgKGNoZWNrZXIpIGNoZWNrZXI9Y2hlY2tlcigpO1xyXG5cdFx0XHRzdGF0dXMucHVzaChbZixjaGVja2VyXSk7XHJcblx0XHR9KTtcclxuXHRcdHJldHVybiBzdGF0dXMuZmlsdGVyKGZ1bmN0aW9uKGYpe3JldHVybiAhZlsxXX0pO1xyXG5cdH0sXHJcblx0ZG93bmxvYWRicm93c2VyOmZ1bmN0aW9uKCkge1xyXG5cdFx0d2luZG93LmxvY2F0aW9uPVwiaHR0cHM6Ly93d3cuZ29vZ2xlLmNvbS9jaHJvbWUvXCJcclxuXHR9LFxyXG5cdHJlbmRlck1pc3Npbmc6ZnVuY3Rpb24oKSB7XHJcblx0XHR2YXIgc2hvd01pc3Npbmc9ZnVuY3Rpb24obSkge1xyXG5cdFx0XHRyZXR1cm4gRShcImRpdlwiLCBudWxsLCBtKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiAoXHJcblx0XHQgRShcImRpdlwiLCB7cmVmOiBcImRpYWxvZzFcIiwgY2xhc3NOYW1lOiBcIm1vZGFsIGZhZGVcIiwgXCJkYXRhLWJhY2tkcm9wXCI6IFwic3RhdGljXCJ9LCBcclxuXHRcdCAgICBFKFwiZGl2XCIsIHtjbGFzc05hbWU6IFwibW9kYWwtZGlhbG9nXCJ9LCBcclxuXHRcdCAgICAgIEUoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJtb2RhbC1jb250ZW50XCJ9LCBcclxuXHRcdCAgICAgICAgRShcImRpdlwiLCB7Y2xhc3NOYW1lOiBcIm1vZGFsLWhlYWRlclwifSwgXHJcblx0XHQgICAgICAgICAgRShcImJ1dHRvblwiLCB7dHlwZTogXCJidXR0b25cIiwgY2xhc3NOYW1lOiBcImNsb3NlXCIsIFwiZGF0YS1kaXNtaXNzXCI6IFwibW9kYWxcIiwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIn0sIFwiw5dcIiksIFxyXG5cdFx0ICAgICAgICAgIEUoXCJoNFwiLCB7Y2xhc3NOYW1lOiBcIm1vZGFsLXRpdGxlXCJ9LCBcIkJyb3dzZXIgQ2hlY2tcIilcclxuXHRcdCAgICAgICAgKSwgXHJcblx0XHQgICAgICAgIEUoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJtb2RhbC1ib2R5XCJ9LCBcclxuXHRcdCAgICAgICAgICBFKFwicFwiLCBudWxsLCBcIlNvcnJ5IGJ1dCB0aGUgZm9sbG93aW5nIGZlYXR1cmUgaXMgbWlzc2luZ1wiKSwgXHJcblx0XHQgICAgICAgICAgdGhpcy5zdGF0ZS5taXNzaW5nLm1hcChzaG93TWlzc2luZylcclxuXHRcdCAgICAgICAgKSwgXHJcblx0XHQgICAgICAgIEUoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJtb2RhbC1mb290ZXJcIn0sIFxyXG5cdFx0ICAgICAgICAgIEUoXCJidXR0b25cIiwge29uQ2xpY2s6IHRoaXMuZG93bmxvYWRicm93c2VyLCB0eXBlOiBcImJ1dHRvblwiLCBjbGFzc05hbWU6IFwiYnRuIGJ0bi1wcmltYXJ5XCJ9LCBcIkRvd25sb2FkIEdvb2dsZSBDaHJvbWVcIilcclxuXHRcdCAgICAgICAgKVxyXG5cdFx0ICAgICAgKVxyXG5cdFx0ICAgIClcclxuXHRcdCAgKVxyXG5cdFx0ICk7XHJcblx0fSxcclxuXHRyZW5kZXJSZWFkeTpmdW5jdGlvbigpIHtcclxuXHRcdHJldHVybiBFKFwic3BhblwiLCBudWxsLCBcImJyb3dzZXIgb2tcIilcclxuXHR9LFxyXG5cdHJlbmRlcjpmdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuICAodGhpcy5zdGF0ZS5taXNzaW5nLmxlbmd0aCk/dGhpcy5yZW5kZXJNaXNzaW5nKCk6dGhpcy5yZW5kZXJSZWFkeSgpO1xyXG5cdH0sXHJcblx0Y29tcG9uZW50RGlkTW91bnQ6ZnVuY3Rpb24oKSB7XHJcblx0XHRpZiAoIXRoaXMuc3RhdGUubWlzc2luZy5sZW5ndGgpIHtcclxuXHRcdFx0dGhpcy5wcm9wcy5vblJlYWR5KCk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHQkKHRoaXMucmVmcy5kaWFsb2cxLmdldERPTU5vZGUoKSkubW9kYWwoJ3Nob3cnKTtcclxuXHRcdH1cclxuXHR9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHM9Y2hlY2ticm93c2VyOyIsIlxyXG52YXIgdXNlckNhbmNlbD1mYWxzZTtcclxudmFyIGZpbGVzPVtdO1xyXG52YXIgdG90YWxEb3dubG9hZEJ5dGU9MDtcclxudmFyIHRhcmdldFBhdGg9XCJcIjtcclxudmFyIHRlbXBQYXRoPVwiXCI7XHJcbnZhciBuZmlsZT0wO1xyXG52YXIgYmFzZXVybD1cIlwiO1xyXG52YXIgcmVzdWx0PVwiXCI7XHJcbnZhciBkb3dubG9hZGluZz1mYWxzZTtcclxudmFyIHN0YXJ0RG93bmxvYWQ9ZnVuY3Rpb24oZGJpZCxfYmFzZXVybCxfZmlsZXMpIHsgLy9yZXR1cm4gZG93bmxvYWQgaWRcclxuXHR2YXIgZnMgICAgID0gcmVxdWlyZShcImZzXCIpO1xyXG5cdHZhciBwYXRoICAgPSByZXF1aXJlKFwicGF0aFwiKTtcclxuXHJcblx0XHJcblx0ZmlsZXM9X2ZpbGVzLnNwbGl0KFwiXFx1ZmZmZlwiKTtcclxuXHRpZiAoZG93bmxvYWRpbmcpIHJldHVybiBmYWxzZTsgLy9vbmx5IG9uZSBzZXNzaW9uXHJcblx0dXNlckNhbmNlbD1mYWxzZTtcclxuXHR0b3RhbERvd25sb2FkQnl0ZT0wO1xyXG5cdG5leHRGaWxlKCk7XHJcblx0ZG93bmxvYWRpbmc9dHJ1ZTtcclxuXHRiYXNldXJsPV9iYXNldXJsO1xyXG5cdGlmIChiYXNldXJsW2Jhc2V1cmwubGVuZ3RoLTFdIT0nLycpYmFzZXVybCs9Jy8nO1xyXG5cdHRhcmdldFBhdGg9a3NhbmFnYXAucm9vdFBhdGgrZGJpZCsnLyc7XHJcblx0dGVtcFBhdGg9a3NhbmFnYXAucm9vdFBhdGgrXCIudG1wL1wiO1xyXG5cdHJlc3VsdD1cIlwiO1xyXG5cdHJldHVybiB0cnVlO1xyXG59XHJcblxyXG52YXIgbmV4dEZpbGU9ZnVuY3Rpb24oKSB7XHJcblx0c2V0VGltZW91dChmdW5jdGlvbigpe1xyXG5cdFx0aWYgKG5maWxlPT1maWxlcy5sZW5ndGgpIHtcclxuXHRcdFx0bmZpbGUrKztcclxuXHRcdFx0ZW5kRG93bmxvYWQoKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGRvd25sb2FkRmlsZShuZmlsZSsrKTtcdFxyXG5cdFx0fVxyXG5cdH0sMTAwKTtcclxufVxyXG5cclxudmFyIGRvd25sb2FkRmlsZT1mdW5jdGlvbihuZmlsZSkge1xyXG5cdHZhciB1cmw9YmFzZXVybCtmaWxlc1tuZmlsZV07XHJcblx0dmFyIHRtcGZpbGVuYW1lPXRlbXBQYXRoK2ZpbGVzW25maWxlXTtcclxuXHR2YXIgbWtkaXJwID0gcmVxdWlyZShcIi4vbWtkaXJwXCIpO1xyXG5cdHZhciBmcyAgICAgPSByZXF1aXJlKFwiZnNcIik7XHJcblx0dmFyIGh0dHAgICA9IHJlcXVpcmUoXCJodHRwXCIpO1xyXG5cclxuXHRta2RpcnAuc3luYyhwYXRoLmRpcm5hbWUodG1wZmlsZW5hbWUpKTtcclxuXHR2YXIgd3JpdGVTdHJlYW0gPSBmcy5jcmVhdGVXcml0ZVN0cmVhbSh0bXBmaWxlbmFtZSk7XHJcblx0dmFyIGRhdGFsZW5ndGg9MDtcclxuXHR2YXIgcmVxdWVzdCA9IGh0dHAuZ2V0KHVybCwgZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuXHRcdHJlc3BvbnNlLm9uKCdkYXRhJyxmdW5jdGlvbihjaHVuayl7XHJcblx0XHRcdHdyaXRlU3RyZWFtLndyaXRlKGNodW5rKTtcclxuXHRcdFx0dG90YWxEb3dubG9hZEJ5dGUrPWNodW5rLmxlbmd0aDtcclxuXHRcdFx0aWYgKHVzZXJDYW5jZWwpIHtcclxuXHRcdFx0XHR3cml0ZVN0cmVhbS5lbmQoKTtcclxuXHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7bmV4dEZpbGUoKTt9LDEwMCk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdFx0cmVzcG9uc2Uub24oXCJlbmRcIixmdW5jdGlvbigpIHtcclxuXHRcdFx0d3JpdGVTdHJlYW0uZW5kKCk7XHJcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKXtuZXh0RmlsZSgpO30sMTAwKTtcclxuXHRcdH0pO1xyXG5cdH0pO1xyXG59XHJcblxyXG52YXIgY2FuY2VsRG93bmxvYWQ9ZnVuY3Rpb24oKSB7XHJcblx0dXNlckNhbmNlbD10cnVlO1xyXG5cdGVuZERvd25sb2FkKCk7XHJcbn1cclxudmFyIHZlcmlmeT1mdW5jdGlvbigpIHtcclxuXHRyZXR1cm4gdHJ1ZTtcclxufVxyXG52YXIgZW5kRG93bmxvYWQ9ZnVuY3Rpb24oKSB7XHJcblx0bmZpbGU9ZmlsZXMubGVuZ3RoKzE7Ly9zdG9wXHJcblx0cmVzdWx0PVwiY2FuY2VsbGVkXCI7XHJcblx0ZG93bmxvYWRpbmc9ZmFsc2U7XHJcblx0aWYgKHVzZXJDYW5jZWwpIHJldHVybjtcclxuXHR2YXIgZnMgICAgID0gcmVxdWlyZShcImZzXCIpO1xyXG5cdHZhciBta2RpcnAgPSByZXF1aXJlKFwiLi9ta2RpcnBcIik7XHJcblxyXG5cdGZvciAodmFyIGk9MDtpPGZpbGVzLmxlbmd0aDtpKyspIHtcclxuXHRcdHZhciB0YXJnZXRmaWxlbmFtZT10YXJnZXRQYXRoK2ZpbGVzW2ldO1xyXG5cdFx0dmFyIHRtcGZpbGVuYW1lICAgPXRlbXBQYXRoK2ZpbGVzW2ldO1xyXG5cdFx0bWtkaXJwLnN5bmMocGF0aC5kaXJuYW1lKHRhcmdldGZpbGVuYW1lKSk7XHJcblx0XHRmcy5yZW5hbWVTeW5jKHRtcGZpbGVuYW1lLHRhcmdldGZpbGVuYW1lKTtcclxuXHR9XHJcblx0aWYgKHZlcmlmeSgpKSB7XHJcblx0XHRyZXN1bHQ9XCJzdWNjZXNzXCI7XHJcblx0fSBlbHNlIHtcclxuXHRcdHJlc3VsdD1cImVycm9yXCI7XHJcblx0fVxyXG59XHJcblxyXG52YXIgZG93bmxvYWRlZEJ5dGU9ZnVuY3Rpb24oKSB7XHJcblx0cmV0dXJuIHRvdGFsRG93bmxvYWRCeXRlO1xyXG59XHJcbnZhciBkb25lRG93bmxvYWQ9ZnVuY3Rpb24oKSB7XHJcblx0aWYgKG5maWxlPmZpbGVzLmxlbmd0aCkgcmV0dXJuIHJlc3VsdDtcclxuXHRlbHNlIHJldHVybiBcIlwiO1xyXG59XHJcbnZhciBkb3dubG9hZGluZ0ZpbGU9ZnVuY3Rpb24oKSB7XHJcblx0cmV0dXJuIG5maWxlLTE7XHJcbn1cclxuXHJcbnZhciBkb3dubG9hZGVyPXtzdGFydERvd25sb2FkOnN0YXJ0RG93bmxvYWQsIGRvd25sb2FkZWRCeXRlOmRvd25sb2FkZWRCeXRlLFxyXG5cdGRvd25sb2FkaW5nRmlsZTpkb3dubG9hZGluZ0ZpbGUsIGNhbmNlbERvd25sb2FkOmNhbmNlbERvd25sb2FkLGRvbmVEb3dubG9hZDpkb25lRG93bmxvYWR9O1xyXG5tb2R1bGUuZXhwb3J0cz1kb3dubG9hZGVyOyIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xyXG5cclxuLyogdG9kbyAsIG9wdGlvbmFsIGtkYiAqL1xyXG5cclxudmFyIEh0bWxGUz1yZXF1aXJlKFwiLi9odG1sZnNcIik7XHJcbnZhciBodG1sNWZzPXJlcXVpcmUoXCIuL2h0bWw1ZnNcIik7XHJcbnZhciBDaGVja0Jyb3dzZXI9cmVxdWlyZShcIi4vY2hlY2ticm93c2VyXCIpO1xyXG52YXIgRT1SZWFjdC5jcmVhdGVFbGVtZW50O1xyXG4gIFxyXG5cclxudmFyIEZpbGVMaXN0ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xyXG5cdGdldEluaXRpYWxTdGF0ZTpmdW5jdGlvbigpIHtcclxuXHRcdHJldHVybiB7ZG93bmxvYWRpbmc6ZmFsc2UscHJvZ3Jlc3M6MH07XHJcblx0fSxcclxuXHR1cGRhdGFibGU6ZnVuY3Rpb24oZikge1xyXG4gICAgICAgIHZhciBjbGFzc2VzPVwiYnRuIGJ0bi13YXJuaW5nXCI7XHJcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZG93bmxvYWRpbmcpIGNsYXNzZXMrPVwiIGRpc2FibGVkXCI7XHJcblx0XHRpZiAoZi5oYXNVcGRhdGUpIHJldHVybiAgIEUoXCJidXR0b25cIiwge2NsYXNzTmFtZTogY2xhc3NlcywgXHJcblx0XHRcdFwiZGF0YS1maWxlbmFtZVwiOiBmLmZpbGVuYW1lLCBcImRhdGEtdXJsXCI6IGYudXJsLCBcclxuXHQgICAgICAgICAgICBvbkNsaWNrOiB0aGlzLmRvd25sb2FkXHJcblx0ICAgICAgIH0sIFwiVXBkYXRlXCIpXHJcblx0XHRlbHNlIHJldHVybiBudWxsO1xyXG5cdH0sXHJcblx0c2hvd0xvY2FsOmZ1bmN0aW9uKGYpIHtcclxuICAgICAgICB2YXIgY2xhc3Nlcz1cImJ0biBidG4tZGFuZ2VyXCI7XHJcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZG93bmxvYWRpbmcpIGNsYXNzZXMrPVwiIGRpc2FibGVkXCI7XHJcblx0ICByZXR1cm4gRShcInRyXCIsIG51bGwsIEUoXCJ0ZFwiLCBudWxsLCBmLmZpbGVuYW1lKSwgXHJcblx0ICAgICAgRShcInRkXCIsIG51bGwpLCBcclxuXHQgICAgICBFKFwidGRcIiwge2NsYXNzTmFtZTogXCJwdWxsLXJpZ2h0XCJ9LCBcclxuXHQgICAgICB0aGlzLnVwZGF0YWJsZShmKSwgRShcImJ1dHRvblwiLCB7Y2xhc3NOYW1lOiBjbGFzc2VzLCBcclxuXHQgICAgICAgICAgICAgICBvbkNsaWNrOiB0aGlzLmRlbGV0ZUZpbGUsIFwiZGF0YS1maWxlbmFtZVwiOiBmLmZpbGVuYW1lfSwgXCJEZWxldGVcIilcclxuXHQgICAgICAgIFxyXG5cdCAgICAgIClcclxuXHQgIClcclxuXHR9LCAgXHJcblx0c2hvd1JlbW90ZTpmdW5jdGlvbihmKSB7IFxyXG5cdCAgdmFyIGNsYXNzZXM9XCJidG4gYnRuLXdhcm5pbmdcIjtcclxuXHQgIGlmICh0aGlzLnN0YXRlLmRvd25sb2FkaW5nKSBjbGFzc2VzKz1cIiBkaXNhYmxlZFwiO1xyXG5cdCAgcmV0dXJuIChFKFwidHJcIiwge1wiZGF0YS1pZFwiOiBmLmZpbGVuYW1lfSwgRShcInRkXCIsIG51bGwsIFxyXG5cdCAgICAgIGYuZmlsZW5hbWUpLCBcclxuXHQgICAgICBFKFwidGRcIiwgbnVsbCwgZi5kZXNjKSwgXHJcblx0ICAgICAgRShcInRkXCIsIG51bGwsIFxyXG5cdCAgICAgIEUoXCJzcGFuXCIsIHtcImRhdGEtZmlsZW5hbWVcIjogZi5maWxlbmFtZSwgXCJkYXRhLXVybFwiOiBmLnVybCwgXHJcblx0ICAgICAgICAgICAgY2xhc3NOYW1lOiBjbGFzc2VzLCBcclxuXHQgICAgICAgICAgICBvbkNsaWNrOiB0aGlzLmRvd25sb2FkfSwgXCJEb3dubG9hZFwiKVxyXG5cdCAgICAgIClcclxuXHQgICkpO1xyXG5cdH0sXHJcblx0c2hvd0ZpbGU6ZnVuY3Rpb24oZikge1xyXG5cdC8vXHRyZXR1cm4gPHNwYW4gZGF0YS1pZD17Zi5maWxlbmFtZX0+e2YudXJsfTwvc3Bhbj5cclxuXHRcdHJldHVybiAoZi5yZWFkeSk/dGhpcy5zaG93TG9jYWwoZik6dGhpcy5zaG93UmVtb3RlKGYpO1xyXG5cdH0sXHJcblx0cmVsb2FkRGlyOmZ1bmN0aW9uKCkge1xyXG5cdFx0dGhpcy5wcm9wcy5hY3Rpb24oXCJyZWxvYWRcIik7XHJcblx0fSxcclxuXHRkb3dubG9hZDpmdW5jdGlvbihlKSB7XHJcblx0XHR2YXIgdXJsPWUudGFyZ2V0LmRhdGFzZXRbXCJ1cmxcIl07XHJcblx0XHR2YXIgZmlsZW5hbWU9ZS50YXJnZXQuZGF0YXNldFtcImZpbGVuYW1lXCJdO1xyXG5cdFx0dGhpcy5zZXRTdGF0ZSh7ZG93bmxvYWRpbmc6dHJ1ZSxwcm9ncmVzczowLHVybDp1cmx9KTtcclxuXHRcdHRoaXMudXNlcmJyZWFrPWZhbHNlO1xyXG5cdFx0aHRtbDVmcy5kb3dubG9hZCh1cmwsZmlsZW5hbWUsZnVuY3Rpb24oKXtcclxuXHRcdFx0dGhpcy5yZWxvYWREaXIoKTtcclxuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7ZG93bmxvYWRpbmc6ZmFsc2UscHJvZ3Jlc3M6MX0pO1xyXG5cdFx0XHR9LGZ1bmN0aW9uKHByb2dyZXNzLHRvdGFsKXtcclxuXHRcdFx0XHRpZiAocHJvZ3Jlc3M9PTApIHtcclxuXHRcdFx0XHRcdHRoaXMuc2V0U3RhdGUoe21lc3NhZ2U6XCJ0b3RhbCBcIit0b3RhbH0pXHJcblx0XHRcdCBcdH1cclxuXHRcdFx0IFx0dGhpcy5zZXRTdGF0ZSh7cHJvZ3Jlc3M6cHJvZ3Jlc3N9KTtcclxuXHRcdFx0IFx0Ly9pZiB1c2VyIHByZXNzIGFib3J0IHJldHVybiB0cnVlXHJcblx0XHRcdCBcdHJldHVybiB0aGlzLnVzZXJicmVhaztcclxuXHRcdFx0fVxyXG5cdFx0LHRoaXMpO1xyXG5cdH0sXHJcblx0ZGVsZXRlRmlsZTpmdW5jdGlvbiggZSkge1xyXG5cdFx0dmFyIGZpbGVuYW1lPWUudGFyZ2V0LmF0dHJpYnV0ZXNbXCJkYXRhLWZpbGVuYW1lXCJdLnZhbHVlO1xyXG5cdFx0dGhpcy5wcm9wcy5hY3Rpb24oXCJkZWxldGVcIixmaWxlbmFtZSk7XHJcblx0fSxcclxuXHRhbGxGaWxlc1JlYWR5OmZ1bmN0aW9uKGUpIHtcclxuXHRcdHJldHVybiB0aGlzLnByb3BzLmZpbGVzLmV2ZXJ5KGZ1bmN0aW9uKGYpeyByZXR1cm4gZi5yZWFkeX0pO1xyXG5cdH0sXHJcblx0ZGlzbWlzczpmdW5jdGlvbigpIHtcclxuXHRcdCQodGhpcy5yZWZzLmRpYWxvZzEuZ2V0RE9NTm9kZSgpKS5tb2RhbCgnaGlkZScpO1xyXG5cdFx0dGhpcy5wcm9wcy5hY3Rpb24oXCJkaXNtaXNzXCIpO1xyXG5cdH0sXHJcblx0YWJvcnRkb3dubG9hZDpmdW5jdGlvbigpIHtcclxuXHRcdHRoaXMudXNlcmJyZWFrPXRydWU7XHJcblx0fSxcclxuXHRzaG93UHJvZ3Jlc3M6ZnVuY3Rpb24oKSB7XHJcblx0ICAgICBpZiAodGhpcy5zdGF0ZS5kb3dubG9hZGluZykge1xyXG5cdCAgICAgIHZhciBwcm9ncmVzcz1NYXRoLnJvdW5kKHRoaXMuc3RhdGUucHJvZ3Jlc3MqMTAwKTtcclxuXHQgICAgICByZXR1cm4gKFxyXG5cdCAgICAgIFx0RShcImRpdlwiLCBudWxsLCBcclxuXHQgICAgICBcdFwiRG93bmxvYWRpbmcgZnJvbSBcIiwgdGhpcy5zdGF0ZS51cmwsIFxyXG5cdCAgICAgIEUoXCJkaXZcIiwge2tleTogXCJwcm9ncmVzc1wiLCBjbGFzc05hbWU6IFwicHJvZ3Jlc3MgY29sLW1kLThcIn0sIFxyXG5cdCAgICAgICAgICBFKFwiZGl2XCIsIHtjbGFzc05hbWU6IFwicHJvZ3Jlc3MtYmFyXCIsIHJvbGU6IFwicHJvZ3Jlc3NiYXJcIiwgXHJcblx0ICAgICAgICAgICAgICBcImFyaWEtdmFsdWVub3dcIjogcHJvZ3Jlc3MsIFwiYXJpYS12YWx1ZW1pblwiOiBcIjBcIiwgXHJcblx0ICAgICAgICAgICAgICBcImFyaWEtdmFsdWVtYXhcIjogXCIxMDBcIiwgc3R5bGU6IHt3aWR0aDogcHJvZ3Jlc3MrXCIlXCJ9fSwgXHJcblx0ICAgICAgICAgICAgcHJvZ3Jlc3MsIFwiJVwiXHJcblx0ICAgICAgICAgIClcclxuXHQgICAgICAgICksIFxyXG5cdCAgICAgICAgRShcImJ1dHRvblwiLCB7b25DbGljazogdGhpcy5hYm9ydGRvd25sb2FkLCBcclxuXHQgICAgICAgIFx0Y2xhc3NOYW1lOiBcImJ0biBidG4tZGFuZ2VyIGNvbC1tZC00XCJ9LCBcIkFib3J0XCIpXHJcblx0ICAgICAgICApXHJcblx0ICAgICAgICApO1xyXG5cdCAgICAgIH0gZWxzZSB7XHJcblx0ICAgICAgXHRcdGlmICggdGhpcy5hbGxGaWxlc1JlYWR5KCkgKSB7XHJcblx0ICAgICAgXHRcdFx0cmV0dXJuIEUoXCJidXR0b25cIiwge29uQ2xpY2s6IHRoaXMuZGlzbWlzcywgY2xhc3NOYW1lOiBcImJ0biBidG4tc3VjY2Vzc1wifSwgXCJPa1wiKVxyXG5cdCAgICAgIFx0XHR9IGVsc2UgcmV0dXJuIG51bGw7XHJcblx0ICAgICAgXHRcdFxyXG5cdCAgICAgIH1cclxuXHR9LFxyXG5cdHNob3dVc2FnZTpmdW5jdGlvbigpIHtcclxuXHRcdHZhciBwZXJjZW50PXRoaXMucHJvcHMucmVtYWluUGVyY2VudDtcclxuICAgICAgICAgICByZXR1cm4gKEUoXCJkaXZcIiwgbnVsbCwgRShcInNwYW5cIiwge2NsYXNzTmFtZTogXCJwdWxsLWxlZnRcIn0sIFwiVXNhZ2U6XCIpLCBFKFwiZGl2XCIsIHtjbGFzc05hbWU6IFwicHJvZ3Jlc3NcIn0sIFxyXG5cdFx0ICBFKFwiZGl2XCIsIHtjbGFzc05hbWU6IFwicHJvZ3Jlc3MtYmFyIHByb2dyZXNzLWJhci1zdWNjZXNzIHByb2dyZXNzLWJhci1zdHJpcGVkXCIsIHJvbGU6IFwicHJvZ3Jlc3NiYXJcIiwgc3R5bGU6IHt3aWR0aDogcGVyY2VudCtcIiVcIn19LCBcclxuXHRcdCAgICBcdHBlcmNlbnQrXCIlXCJcclxuXHRcdCAgKVxyXG5cdFx0KSkpO1xyXG5cdH0sXHJcblx0cmVuZGVyOmZ1bmN0aW9uKCkge1xyXG5cdCAgXHRyZXR1cm4gKFxyXG5cdFx0RShcImRpdlwiLCB7cmVmOiBcImRpYWxvZzFcIiwgY2xhc3NOYW1lOiBcIm1vZGFsIGZhZGVcIiwgXCJkYXRhLWJhY2tkcm9wXCI6IFwic3RhdGljXCJ9LCBcclxuXHRcdCAgICBFKFwiZGl2XCIsIHtjbGFzc05hbWU6IFwibW9kYWwtZGlhbG9nXCJ9LCBcclxuXHRcdCAgICAgIEUoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJtb2RhbC1jb250ZW50XCJ9LCBcclxuXHRcdCAgICAgICAgRShcImRpdlwiLCB7Y2xhc3NOYW1lOiBcIm1vZGFsLWhlYWRlclwifSwgXHJcblx0XHQgICAgICAgICAgRShcImg0XCIsIHtjbGFzc05hbWU6IFwibW9kYWwtdGl0bGVcIn0sIFwiRmlsZSBJbnN0YWxsZXJcIilcclxuXHRcdCAgICAgICAgKSwgXHJcblx0XHQgICAgICAgIEUoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJtb2RhbC1ib2R5XCJ9LCBcclxuXHRcdCAgICAgICAgXHRFKFwidGFibGVcIiwge2NsYXNzTmFtZTogXCJ0YWJsZVwifSwgXHJcblx0XHQgICAgICAgIFx0RShcInRib2R5XCIsIG51bGwsIFxyXG5cdFx0ICAgICAgICAgIFx0dGhpcy5wcm9wcy5maWxlcy5tYXAodGhpcy5zaG93RmlsZSlcclxuXHRcdCAgICAgICAgICBcdClcclxuXHRcdCAgICAgICAgICApXHJcblx0XHQgICAgICAgICksIFxyXG5cdFx0ICAgICAgICBFKFwiZGl2XCIsIHtjbGFzc05hbWU6IFwibW9kYWwtZm9vdGVyXCJ9LCBcclxuXHRcdCAgICAgICAgXHR0aGlzLnNob3dVc2FnZSgpLCBcclxuXHRcdCAgICAgICAgICAgdGhpcy5zaG93UHJvZ3Jlc3MoKVxyXG5cdFx0ICAgICAgICApXHJcblx0XHQgICAgICApXHJcblx0XHQgICAgKVxyXG5cdFx0ICApXHJcblx0XHQpO1xyXG5cdH0sXHRcclxuXHRjb21wb25lbnREaWRNb3VudDpmdW5jdGlvbigpIHtcclxuXHRcdCQodGhpcy5yZWZzLmRpYWxvZzEuZ2V0RE9NTm9kZSgpKS5tb2RhbCgnc2hvdycpO1xyXG5cdH1cclxufSk7XHJcbi8qVE9ETyBrZGIgY2hlY2sgdmVyc2lvbiovXHJcbnZhciBGaWxlbWFuYWdlciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcclxuXHRnZXRJbml0aWFsU3RhdGU6ZnVuY3Rpb24oKSB7XHJcblx0XHR2YXIgcXVvdGE9dGhpcy5nZXRRdW90YSgpO1xyXG5cdFx0cmV0dXJuIHticm93c2VyUmVhZHk6ZmFsc2Usbm91cGRhdGU6dHJ1ZSxcdHJlcXVlc3RRdW90YTpxdW90YSxyZW1haW46MH07XHJcblx0fSxcclxuXHRnZXRRdW90YTpmdW5jdGlvbigpIHtcclxuXHRcdHZhciBxPXRoaXMucHJvcHMucXVvdGF8fFwiMTI4TVwiO1xyXG5cdFx0dmFyIHVuaXQ9cVtxLmxlbmd0aC0xXTtcclxuXHRcdHZhciB0aW1lcz0xO1xyXG5cdFx0aWYgKHVuaXQ9PVwiTVwiKSB0aW1lcz0xMDI0KjEwMjQ7XHJcblx0XHRlbHNlIGlmICh1bml0PVwiS1wiKSB0aW1lcz0xMDI0O1xyXG5cdFx0cmV0dXJuIHBhcnNlSW50KHEpICogdGltZXM7XHJcblx0fSxcclxuXHRtaXNzaW5nS2RiOmZ1bmN0aW9uKCkge1xyXG5cdFx0aWYgKGtzYW5hZ2FwLnBsYXRmb3JtIT1cImNocm9tZVwiKSByZXR1cm4gW107XHJcblx0XHR2YXIgbWlzc2luZz10aGlzLnByb3BzLm5lZWRlZC5maWx0ZXIoZnVuY3Rpb24oa2RiKXtcclxuXHRcdFx0Zm9yICh2YXIgaSBpbiBodG1sNWZzLmZpbGVzKSB7XHJcblx0XHRcdFx0aWYgKGh0bWw1ZnMuZmlsZXNbaV1bMF09PWtkYi5maWxlbmFtZSkgcmV0dXJuIGZhbHNlO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fSx0aGlzKTtcclxuXHRcdHJldHVybiBtaXNzaW5nO1xyXG5cdH0sXHJcblx0Z2V0UmVtb3RlVXJsOmZ1bmN0aW9uKGZuKSB7XHJcblx0XHR2YXIgZj10aGlzLnByb3BzLm5lZWRlZC5maWx0ZXIoZnVuY3Rpb24oZil7cmV0dXJuIGYuZmlsZW5hbWU9PWZufSk7XHJcblx0XHRpZiAoZi5sZW5ndGggKSByZXR1cm4gZlswXS51cmw7XHJcblx0fSxcclxuXHRnZW5GaWxlTGlzdDpmdW5jdGlvbihleGlzdGluZyxtaXNzaW5nKXtcclxuXHRcdHZhciBvdXQ9W107XHJcblx0XHRmb3IgKHZhciBpIGluIGV4aXN0aW5nKSB7XHJcblx0XHRcdHZhciB1cmw9dGhpcy5nZXRSZW1vdGVVcmwoZXhpc3RpbmdbaV1bMF0pO1xyXG5cdFx0XHRvdXQucHVzaCh7ZmlsZW5hbWU6ZXhpc3RpbmdbaV1bMF0sIHVybCA6dXJsLCByZWFkeTp0cnVlIH0pO1xyXG5cdFx0fVxyXG5cdFx0Zm9yICh2YXIgaSBpbiBtaXNzaW5nKSB7XHJcblx0XHRcdG91dC5wdXNoKG1pc3NpbmdbaV0pO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIG91dDtcclxuXHR9LFxyXG5cdHJlbG9hZDpmdW5jdGlvbigpIHtcclxuXHRcdGh0bWw1ZnMucmVhZGRpcihmdW5jdGlvbihmaWxlcyl7XHJcbiAgXHRcdFx0dGhpcy5zZXRTdGF0ZSh7ZmlsZXM6dGhpcy5nZW5GaWxlTGlzdChmaWxlcyx0aGlzLm1pc3NpbmdLZGIoKSl9KTtcclxuICBcdFx0fSx0aGlzKTtcclxuXHQgfSxcclxuXHRkZWxldGVGaWxlOmZ1bmN0aW9uKGZuKSB7XHJcblx0ICBodG1sNWZzLnJtKGZuLGZ1bmN0aW9uKCl7XHJcblx0ICBcdHRoaXMucmVsb2FkKCk7XHJcblx0ICB9LHRoaXMpO1xyXG5cdH0sXHJcblx0b25RdW90ZU9rOmZ1bmN0aW9uKHF1b3RhLHVzYWdlKSB7XHJcblx0XHRpZiAoa3NhbmFnYXAucGxhdGZvcm0hPVwiY2hyb21lXCIpIHtcclxuXHRcdFx0Ly9jb25zb2xlLmxvZyhcIm9ucXVvdGVva1wiKTtcclxuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7bm91cGRhdGU6dHJ1ZSxtaXNzaW5nOltdLGZpbGVzOltdLGF1dG9jbG9zZTp0cnVlXHJcblx0XHRcdFx0LHF1b3RhOnF1b3RhLHJlbWFpbjpxdW90YS11c2FnZSx1c2FnZTp1c2FnZX0pO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHQvL2NvbnNvbGUubG9nKFwicXVvdGUgb2tcIik7XHJcblx0XHR2YXIgZmlsZXM9dGhpcy5nZW5GaWxlTGlzdChodG1sNWZzLmZpbGVzLHRoaXMubWlzc2luZ0tkYigpKTtcclxuXHRcdHZhciB0aGF0PXRoaXM7XHJcblx0XHR0aGF0LmNoZWNrSWZVcGRhdGUoZmlsZXMsZnVuY3Rpb24oaGFzdXBkYXRlKSB7XHJcblx0XHRcdHZhciBtaXNzaW5nPXRoaXMubWlzc2luZ0tkYigpO1xyXG5cdFx0XHR2YXIgYXV0b2Nsb3NlPXRoaXMucHJvcHMuYXV0b2Nsb3NlO1xyXG5cdFx0XHRpZiAobWlzc2luZy5sZW5ndGgpIGF1dG9jbG9zZT1mYWxzZTtcclxuXHRcdFx0dGhhdC5zZXRTdGF0ZSh7YXV0b2Nsb3NlOmF1dG9jbG9zZSxcclxuXHRcdFx0XHRxdW90YTpxdW90YSx1c2FnZTp1c2FnZSxmaWxlczpmaWxlcyxcclxuXHRcdFx0XHRtaXNzaW5nOm1pc3NpbmcsXHJcblx0XHRcdFx0bm91cGRhdGU6IWhhc3VwZGF0ZSxcclxuXHRcdFx0XHRyZW1haW46cXVvdGEtdXNhZ2V9KTtcclxuXHRcdH0pO1xyXG5cdH0sICBcclxuXHRvbkJyb3dzZXJPazpmdW5jdGlvbigpIHtcclxuXHQgIHRoaXMudG90YWxEb3dubG9hZFNpemUoKTtcclxuXHR9LCBcclxuXHRkaXNtaXNzOmZ1bmN0aW9uKCkge1xyXG5cdFx0dGhpcy5wcm9wcy5vblJlYWR5KHRoaXMuc3RhdGUudXNhZ2UsdGhpcy5zdGF0ZS5xdW90YSk7XHJcblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcblx0XHRcdHZhciBtb2RhbGluPSQoXCIubW9kYWwuaW5cIik7XHJcblx0XHRcdGlmIChtb2RhbGluLm1vZGFsKSBtb2RhbGluLm1vZGFsKCdoaWRlJyk7XHJcblx0XHR9LDUwMCk7XHJcblx0fSwgXHJcblx0dG90YWxEb3dubG9hZFNpemU6ZnVuY3Rpb24oKSB7XHJcblx0XHR2YXIgZmlsZXM9dGhpcy5taXNzaW5nS2RiKCk7XHJcblx0XHR2YXIgdGFza3F1ZXVlPVtdLHRvdGFsc2l6ZT0wO1xyXG5cdFx0Zm9yICh2YXIgaT0wO2k8ZmlsZXMubGVuZ3RoO2krKykge1xyXG5cdFx0XHR0YXNrcXVldWUucHVzaChcclxuXHRcdFx0XHQoZnVuY3Rpb24oaWR4KXtcclxuXHRcdFx0XHRcdHJldHVybiAoZnVuY3Rpb24oZGF0YSl7XHJcblx0XHRcdFx0XHRcdGlmICghKHR5cGVvZiBkYXRhPT0nb2JqZWN0JyAmJiBkYXRhLl9fZW1wdHkpKSB0b3RhbHNpemUrPWRhdGE7XHJcblx0XHRcdFx0XHRcdGh0bWw1ZnMuZ2V0RG93bmxvYWRTaXplKGZpbGVzW2lkeF0udXJsLHRhc2txdWV1ZS5zaGlmdCgpKTtcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH0pKGkpXHJcblx0XHRcdCk7XHJcblx0XHR9XHJcblx0XHR2YXIgdGhhdD10aGlzO1xyXG5cdFx0dGFza3F1ZXVlLnB1c2goZnVuY3Rpb24oZGF0YSl7XHRcclxuXHRcdFx0dG90YWxzaXplKz1kYXRhO1xyXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7dGhhdC5zZXRTdGF0ZSh7cmVxdWlyZVNwYWNlOnRvdGFsc2l6ZSxicm93c2VyUmVhZHk6dHJ1ZX0pfSwwKTtcclxuXHRcdH0pO1xyXG5cdFx0dGFza3F1ZXVlLnNoaWZ0KCkoe19fZW1wdHk6dHJ1ZX0pO1xyXG5cdH0sXHJcblx0Y2hlY2tJZlVwZGF0ZTpmdW5jdGlvbihmaWxlcyxjYikge1xyXG5cdFx0dmFyIHRhc2txdWV1ZT1bXTtcclxuXHRcdGZvciAodmFyIGk9MDtpPGZpbGVzLmxlbmd0aDtpKyspIHtcclxuXHRcdFx0dGFza3F1ZXVlLnB1c2goXHJcblx0XHRcdFx0KGZ1bmN0aW9uKGlkeCl7XHJcblx0XHRcdFx0XHRyZXR1cm4gKGZ1bmN0aW9uKGRhdGEpe1xyXG5cdFx0XHRcdFx0XHRpZiAoISh0eXBlb2YgZGF0YT09J29iamVjdCcgJiYgZGF0YS5fX2VtcHR5KSkgZmlsZXNbaWR4LTFdLmhhc1VwZGF0ZT1kYXRhO1xyXG5cdFx0XHRcdFx0XHRodG1sNWZzLmNoZWNrVXBkYXRlKGZpbGVzW2lkeF0udXJsLGZpbGVzW2lkeF0uZmlsZW5hbWUsdGFza3F1ZXVlLnNoaWZ0KCkpO1xyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0fSkoaSlcclxuXHRcdFx0KTtcclxuXHRcdH1cclxuXHRcdHZhciB0aGF0PXRoaXM7XHJcblx0XHR0YXNrcXVldWUucHVzaChmdW5jdGlvbihkYXRhKXtcdFxyXG5cdFx0XHRmaWxlc1tmaWxlcy5sZW5ndGgtMV0uaGFzVXBkYXRlPWRhdGE7XHJcblx0XHRcdHZhciBoYXN1cGRhdGU9ZmlsZXMuc29tZShmdW5jdGlvbihmKXtyZXR1cm4gZi5oYXNVcGRhdGV9KTtcclxuXHRcdFx0aWYgKGNiKSBjYi5hcHBseSh0aGF0LFtoYXN1cGRhdGVdKTtcclxuXHRcdH0pO1xyXG5cdFx0dGFza3F1ZXVlLnNoaWZ0KCkoe19fZW1wdHk6dHJ1ZX0pO1xyXG5cdH0sXHJcblx0cmVuZGVyOmZ1bmN0aW9uKCl7XHJcbiAgICBcdFx0aWYgKCF0aGlzLnN0YXRlLmJyb3dzZXJSZWFkeSkgeyAgIFxyXG4gICAgICBcdFx0XHRyZXR1cm4gRShDaGVja0Jyb3dzZXIsIHtmZWF0dXJlOiBcImZzXCIsIG9uUmVhZHk6IHRoaXMub25Ccm93c2VyT2t9KVxyXG4gICAgXHRcdH0gaWYgKCF0aGlzLnN0YXRlLnF1b3RhIHx8IHRoaXMuc3RhdGUucmVtYWluPHRoaXMuc3RhdGUucmVxdWlyZVNwYWNlKSB7ICBcclxuICAgIFx0XHRcdHZhciBxdW90YT10aGlzLnN0YXRlLnJlcXVlc3RRdW90YTtcclxuICAgIFx0XHRcdGlmICh0aGlzLnN0YXRlLnVzYWdlK3RoaXMuc3RhdGUucmVxdWlyZVNwYWNlPnF1b3RhKSB7XHJcbiAgICBcdFx0XHRcdHF1b3RhPSh0aGlzLnN0YXRlLnVzYWdlK3RoaXMuc3RhdGUucmVxdWlyZVNwYWNlKSoxLjU7XHJcbiAgICBcdFx0XHR9XHJcbiAgICAgIFx0XHRcdHJldHVybiBFKEh0bWxGUywge3F1b3RhOiBxdW90YSwgYXV0b2Nsb3NlOiBcInRydWVcIiwgb25SZWFkeTogdGhpcy5vblF1b3RlT2t9KVxyXG4gICAgICBcdFx0fSBlbHNlIHtcclxuXHRcdFx0aWYgKCF0aGlzLnN0YXRlLm5vdXBkYXRlIHx8IHRoaXMubWlzc2luZ0tkYigpLmxlbmd0aCB8fCAhdGhpcy5zdGF0ZS5hdXRvY2xvc2UpIHtcclxuXHRcdFx0XHR2YXIgcmVtYWluPU1hdGgucm91bmQoKHRoaXMuc3RhdGUudXNhZ2UvdGhpcy5zdGF0ZS5xdW90YSkqMTAwKTtcdFx0XHRcdFxyXG5cdFx0XHRcdHJldHVybiBFKEZpbGVMaXN0LCB7YWN0aW9uOiB0aGlzLmFjdGlvbiwgZmlsZXM6IHRoaXMuc3RhdGUuZmlsZXMsIHJlbWFpblBlcmNlbnQ6IHJlbWFpbn0pXHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0c2V0VGltZW91dCggdGhpcy5kaXNtaXNzICwwKTtcclxuXHRcdFx0XHRyZXR1cm4gRShcInNwYW5cIiwgbnVsbCwgXCJTdWNjZXNzXCIpO1xyXG5cdFx0XHR9XHJcbiAgICAgIFx0XHR9XHJcblx0fSxcclxuXHRhY3Rpb246ZnVuY3Rpb24oKSB7XHJcblx0ICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XHJcblx0ICB2YXIgdHlwZT1hcmdzLnNoaWZ0KCk7XHJcblx0ICB2YXIgcmVzPW51bGwsIHRoYXQ9dGhpcztcclxuXHQgIGlmICh0eXBlPT1cImRlbGV0ZVwiKSB7XHJcblx0ICAgIHRoaXMuZGVsZXRlRmlsZShhcmdzWzBdKTtcclxuXHQgIH0gIGVsc2UgaWYgKHR5cGU9PVwicmVsb2FkXCIpIHtcclxuXHQgIFx0dGhpcy5yZWxvYWQoKTtcclxuXHQgIH0gZWxzZSBpZiAodHlwZT09XCJkaXNtaXNzXCIpIHtcclxuXHQgIFx0dGhpcy5kaXNtaXNzKCk7XHJcblx0ICB9XHJcblx0fVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzPUZpbGVtYW5hZ2VyOyIsIi8qIGVtdWxhdGUgZmlsZXN5c3RlbSBvbiBodG1sNSBicm93c2VyICovXHJcbnZhciBnZXRfaGVhZD1mdW5jdGlvbih1cmwsZmllbGQsY2Ipe1xyXG5cdHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuXHR4aHIub3BlbihcIkhFQURcIiwgdXJsLCB0cnVlKTtcclxuXHR4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdGlmICh0aGlzLnJlYWR5U3RhdGUgPT0gdGhpcy5ET05FKSB7XHJcblx0XHRcdFx0Y2IoeGhyLmdldFJlc3BvbnNlSGVhZGVyKGZpZWxkKSk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0aWYgKHRoaXMuc3RhdHVzIT09MjAwJiZ0aGlzLnN0YXR1cyE9PTIwNikge1xyXG5cdFx0XHRcdFx0Y2IoXCJcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IFxyXG5cdH07XHJcblx0eGhyLnNlbmQoKTtcdFxyXG59XHJcbnZhciBnZXRfZGF0ZT1mdW5jdGlvbih1cmwsY2IpIHtcclxuXHRnZXRfaGVhZCh1cmwsXCJMYXN0LU1vZGlmaWVkXCIsZnVuY3Rpb24odmFsdWUpe1xyXG5cdFx0Y2IodmFsdWUpO1xyXG5cdH0pO1xyXG59XHJcbnZhciBnZXRfc2l6ZT1mdW5jdGlvbih1cmwsIGNiKSB7XHJcblx0Z2V0X2hlYWQodXJsLFwiQ29udGVudC1MZW5ndGhcIixmdW5jdGlvbih2YWx1ZSl7XHJcblx0XHRjYihwYXJzZUludCh2YWx1ZSkpO1xyXG5cdH0pO1xyXG59O1xyXG52YXIgY2hlY2tVcGRhdGU9ZnVuY3Rpb24odXJsLGZuLGNiKSB7XHJcblx0aWYgKCF1cmwpIHtcclxuXHRcdGNiKGZhbHNlKTtcclxuXHRcdHJldHVybjtcclxuXHR9XHJcblx0Z2V0X2RhdGUodXJsLGZ1bmN0aW9uKGQpe1xyXG5cdFx0QVBJLmZzLnJvb3QuZ2V0RmlsZShmbiwge2NyZWF0ZTogZmFsc2UsIGV4Y2x1c2l2ZTogZmFsc2V9LCBmdW5jdGlvbihmaWxlRW50cnkpIHtcclxuXHRcdFx0ZmlsZUVudHJ5LmdldE1ldGFkYXRhKGZ1bmN0aW9uKG1ldGFkYXRhKXtcclxuXHRcdFx0XHR2YXIgbG9jYWxEYXRlPURhdGUucGFyc2UobWV0YWRhdGEubW9kaWZpY2F0aW9uVGltZSk7XHJcblx0XHRcdFx0dmFyIHVybERhdGU9RGF0ZS5wYXJzZShkKTtcclxuXHRcdFx0XHRjYih1cmxEYXRlPmxvY2FsRGF0ZSk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fSxmdW5jdGlvbigpe1xyXG5cdFx0XHRjYihmYWxzZSk7XHJcblx0XHR9KTtcclxuXHR9KTtcclxufVxyXG52YXIgZG93bmxvYWQ9ZnVuY3Rpb24odXJsLGZuLGNiLHN0YXR1c2NiLGNvbnRleHQpIHtcclxuXHQgdmFyIHRvdGFsc2l6ZT0wLGJhdGNoZXM9bnVsbCx3cml0dGVuPTA7XHJcblx0IHZhciBmaWxlRW50cnk9MCwgZmlsZVdyaXRlcj0wO1xyXG5cdCB2YXIgY3JlYXRlQmF0Y2hlcz1mdW5jdGlvbihzaXplKSB7XHJcblx0XHR2YXIgYnl0ZXM9MTAyNCoxMDI0LCBvdXQ9W107XHJcblx0XHR2YXIgYj1NYXRoLmZsb29yKHNpemUgLyBieXRlcyk7XHJcblx0XHR2YXIgbGFzdD1zaXplICVieXRlcztcclxuXHRcdGZvciAodmFyIGk9MDtpPD1iO2krKykge1xyXG5cdFx0XHRvdXQucHVzaChpKmJ5dGVzKTtcclxuXHRcdH1cclxuXHRcdG91dC5wdXNoKGIqYnl0ZXMrbGFzdCk7XHJcblx0XHRyZXR1cm4gb3V0O1xyXG5cdCB9XHJcblx0IHZhciBmaW5pc2g9ZnVuY3Rpb24oKSB7XHJcblx0XHQgcm0oZm4sZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRmaWxlRW50cnkubW92ZVRvKGZpbGVFbnRyeS5maWxlc3lzdGVtLnJvb3QsIGZuLGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHRzZXRUaW1lb3V0KCBjYi5iaW5kKGNvbnRleHQsZmFsc2UpICwgMCkgOyBcclxuXHRcdFx0XHR9LGZ1bmN0aW9uKGUpe1xyXG5cdFx0XHRcdFx0Y29uc29sZS5sb2coXCJmYWlsZWRcIixlKVxyXG5cdFx0XHRcdH0pO1xyXG5cdFx0IH0sdGhpcyk7IFxyXG5cdCB9O1xyXG5cdFx0dmFyIHRlbXBmbj1cInRlbXAua2RiXCI7XHJcblx0XHR2YXIgYmF0Y2g9ZnVuY3Rpb24oYikge1xyXG5cdFx0dmFyIGFib3J0PWZhbHNlO1xyXG5cdFx0dmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG5cdFx0dmFyIHJlcXVlc3R1cmw9dXJsK1wiP1wiK01hdGgucmFuZG9tKCk7XHJcblx0XHR4aHIub3BlbignZ2V0JywgcmVxdWVzdHVybCwgdHJ1ZSk7XHJcblx0XHR4aHIuc2V0UmVxdWVzdEhlYWRlcignUmFuZ2UnLCAnYnl0ZXM9JytiYXRjaGVzW2JdKyctJysoYmF0Y2hlc1tiKzFdLTEpKTtcclxuXHRcdHhoci5yZXNwb25zZVR5cGUgPSAnYmxvYic7ICAgIFxyXG5cdFx0eGhyLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0dmFyIGJsb2I9dGhpcy5yZXNwb25zZTtcclxuXHRcdFx0ZmlsZUVudHJ5LmNyZWF0ZVdyaXRlcihmdW5jdGlvbihmaWxlV3JpdGVyKSB7XHJcblx0XHRcdFx0ZmlsZVdyaXRlci5zZWVrKGZpbGVXcml0ZXIubGVuZ3RoKTtcclxuXHRcdFx0XHRmaWxlV3JpdGVyLndyaXRlKGJsb2IpO1xyXG5cdFx0XHRcdHdyaXR0ZW4rPWJsb2Iuc2l6ZTtcclxuXHRcdFx0XHRmaWxlV3JpdGVyLm9ud3JpdGVlbmQgPSBmdW5jdGlvbihlKSB7XHJcblx0XHRcdFx0XHRpZiAoc3RhdHVzY2IpIHtcclxuXHRcdFx0XHRcdFx0YWJvcnQ9c3RhdHVzY2IuYXBwbHkoY29udGV4dCxbIGZpbGVXcml0ZXIubGVuZ3RoIC8gdG90YWxzaXplLHRvdGFsc2l6ZSBdKTtcclxuXHRcdFx0XHRcdFx0aWYgKGFib3J0KSBzZXRUaW1lb3V0KCBjYi5iaW5kKGNvbnRleHQsZmFsc2UpICwgMCkgO1xyXG5cdFx0XHRcdCBcdH1cclxuXHRcdFx0XHRcdGIrKztcclxuXHRcdFx0XHRcdGlmICghYWJvcnQpIHtcclxuXHRcdFx0XHRcdFx0aWYgKGI8YmF0Y2hlcy5sZW5ndGgtMSkgc2V0VGltZW91dChiYXRjaC5iaW5kKGNvbnRleHQsYiksMCk7XHJcblx0XHRcdFx0XHRcdGVsc2UgICAgICAgICAgICAgICAgICAgIGZpbmlzaCgpO1xyXG5cdFx0XHRcdCBcdH1cclxuXHRcdFx0IFx0fTtcclxuXHRcdFx0fSwgY29uc29sZS5lcnJvcik7XHJcblx0XHR9LGZhbHNlKTtcclxuXHRcdHhoci5zZW5kKCk7XHJcblx0fVxyXG5cclxuXHRnZXRfc2l6ZSh1cmwsZnVuY3Rpb24oc2l6ZSl7XHJcblx0XHR0b3RhbHNpemU9c2l6ZTtcclxuXHRcdGlmICghc2l6ZSkge1xyXG5cdFx0XHRpZiAoY2IpIGNiLmFwcGx5KGNvbnRleHQsW2ZhbHNlXSk7XHJcblx0XHR9IGVsc2Ugey8vcmVhZHkgdG8gZG93bmxvYWRcclxuXHRcdFx0cm0odGVtcGZuLGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0IGJhdGNoZXM9Y3JlYXRlQmF0Y2hlcyhzaXplKTtcclxuXHRcdFx0XHQgaWYgKHN0YXR1c2NiKSBzdGF0dXNjYi5hcHBseShjb250ZXh0LFsgMCwgdG90YWxzaXplIF0pO1xyXG5cdFx0XHRcdCBBUEkuZnMucm9vdC5nZXRGaWxlKHRlbXBmbiwge2NyZWF0ZTogMSwgZXhjbHVzaXZlOiBmYWxzZX0sIGZ1bmN0aW9uKF9maWxlRW50cnkpIHtcclxuXHRcdFx0XHRcdFx0XHRmaWxlRW50cnk9X2ZpbGVFbnRyeTtcclxuXHRcdFx0XHRcdFx0YmF0Y2goMCk7XHJcblx0XHRcdFx0IH0pO1xyXG5cdFx0XHR9LHRoaXMpO1xyXG5cdFx0fVxyXG5cdH0pO1xyXG59XHJcblxyXG52YXIgcmVhZEZpbGU9ZnVuY3Rpb24oZmlsZW5hbWUsY2IsY29udGV4dCkge1xyXG5cdEFQSS5mcy5yb290LmdldEZpbGUoZmlsZW5hbWUsIGZ1bmN0aW9uKGZpbGVFbnRyeSkge1xyXG5cdFx0XHR2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcclxuXHRcdFx0cmVhZGVyLm9ubG9hZGVuZCA9IGZ1bmN0aW9uKGUpIHtcclxuXHRcdFx0XHRcdGlmIChjYikgY2IuYXBwbHkoY2IsW3RoaXMucmVzdWx0XSk7XHJcblx0XHRcdFx0fTsgICAgICAgICAgICBcclxuXHR9LCBjb25zb2xlLmVycm9yKTtcclxufVxyXG52YXIgd3JpdGVGaWxlPWZ1bmN0aW9uKGZpbGVuYW1lLGJ1ZixjYixjb250ZXh0KXtcclxuXHRBUEkuZnMucm9vdC5nZXRGaWxlKGZpbGVuYW1lLCB7Y3JlYXRlOiB0cnVlLCBleGNsdXNpdmU6IHRydWV9LCBmdW5jdGlvbihmaWxlRW50cnkpIHtcclxuXHRcdFx0ZmlsZUVudHJ5LmNyZWF0ZVdyaXRlcihmdW5jdGlvbihmaWxlV3JpdGVyKSB7XHJcblx0XHRcdFx0ZmlsZVdyaXRlci53cml0ZShidWYpO1xyXG5cdFx0XHRcdGZpbGVXcml0ZXIub253cml0ZWVuZCA9IGZ1bmN0aW9uKGUpIHtcclxuXHRcdFx0XHRcdGlmIChjYikgY2IuYXBwbHkoY2IsW2J1Zi5ieXRlTGVuZ3RoXSk7XHJcblx0XHRcdFx0fTsgICAgICAgICAgICBcclxuXHRcdFx0fSwgY29uc29sZS5lcnJvcik7XHJcblx0fSwgY29uc29sZS5lcnJvcik7XHJcbn1cclxuXHJcbnZhciByZWFkZGlyPWZ1bmN0aW9uKGNiLGNvbnRleHQpIHtcclxuXHR2YXIgZGlyUmVhZGVyID0gQVBJLmZzLnJvb3QuY3JlYXRlUmVhZGVyKCk7XHJcblx0dmFyIG91dD1bXSx0aGF0PXRoaXM7XHJcblx0ZGlyUmVhZGVyLnJlYWRFbnRyaWVzKGZ1bmN0aW9uKGVudHJpZXMpIHtcclxuXHRcdGlmIChlbnRyaWVzLmxlbmd0aCkge1xyXG5cdFx0XHRmb3IgKHZhciBpID0gMCwgZW50cnk7IGVudHJ5ID0gZW50cmllc1tpXTsgKytpKSB7XHJcblx0XHRcdFx0aWYgKGVudHJ5LmlzRmlsZSkge1xyXG5cdFx0XHRcdFx0b3V0LnB1c2goW2VudHJ5Lm5hbWUsZW50cnkudG9VUkwgPyBlbnRyeS50b1VSTCgpIDogZW50cnkudG9VUkkoKV0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0QVBJLmZpbGVzPW91dDtcclxuXHRcdGlmIChjYikgY2IuYXBwbHkoY29udGV4dCxbb3V0XSk7XHJcblx0fSwgZnVuY3Rpb24oKXtcclxuXHRcdGlmIChjYikgY2IuYXBwbHkoY29udGV4dCxbbnVsbF0pO1xyXG5cdH0pO1xyXG59XHJcbnZhciBnZXRGaWxlVVJMPWZ1bmN0aW9uKGZpbGVuYW1lKSB7XHJcblx0aWYgKCFBUEkuZmlsZXMgKSByZXR1cm4gbnVsbDtcclxuXHR2YXIgZmlsZT0gQVBJLmZpbGVzLmZpbHRlcihmdW5jdGlvbihmKXtyZXR1cm4gZlswXT09ZmlsZW5hbWV9KTtcclxuXHRpZiAoZmlsZS5sZW5ndGgpIHJldHVybiBmaWxlWzBdWzFdO1xyXG59XHJcbnZhciBybT1mdW5jdGlvbihmaWxlbmFtZSxjYixjb250ZXh0KSB7XHJcblx0dmFyIHVybD1nZXRGaWxlVVJMKGZpbGVuYW1lKTtcclxuXHRpZiAodXJsKSBybVVSTCh1cmwsY2IsY29udGV4dCk7XHJcblx0ZWxzZSBpZiAoY2IpIGNiLmFwcGx5KGNvbnRleHQsW2ZhbHNlXSk7XHJcbn1cclxuXHJcbnZhciBybVVSTD1mdW5jdGlvbihmaWxlbmFtZSxjYixjb250ZXh0KSB7XHJcblx0d2Via2l0UmVzb2x2ZUxvY2FsRmlsZVN5c3RlbVVSTChmaWxlbmFtZSwgZnVuY3Rpb24oZmlsZUVudHJ5KSB7XHJcblx0XHRmaWxlRW50cnkucmVtb3ZlKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRpZiAoY2IpIGNiLmFwcGx5KGNvbnRleHQsW3RydWVdKTtcclxuXHRcdH0sIGNvbnNvbGUuZXJyb3IpO1xyXG5cdH0sICBmdW5jdGlvbihlKXtcclxuXHRcdGlmIChjYikgY2IuYXBwbHkoY29udGV4dCxbZmFsc2VdKTsvL25vIHN1Y2ggZmlsZVxyXG5cdH0pO1xyXG59XHJcbmZ1bmN0aW9uIGVycm9ySGFuZGxlcihlKSB7XHJcblx0Y29uc29sZS5lcnJvcignRXJyb3I6ICcgK2UubmFtZSsgXCIgXCIrZS5tZXNzYWdlKTtcclxufVxyXG52YXIgaW5pdGZzPWZ1bmN0aW9uKGdyYW50ZWRCeXRlcyxjYixjb250ZXh0KSB7XHJcblx0d2Via2l0UmVxdWVzdEZpbGVTeXN0ZW0oUEVSU0lTVEVOVCwgZ3JhbnRlZEJ5dGVzLCAgZnVuY3Rpb24oZnMpIHtcclxuXHRcdEFQSS5mcz1mcztcclxuXHRcdEFQSS5xdW90YT1ncmFudGVkQnl0ZXM7XHJcblx0XHRyZWFkZGlyKGZ1bmN0aW9uKCl7XHJcblx0XHRcdEFQSS5pbml0aWFsaXplZD10cnVlO1xyXG5cdFx0XHRjYi5hcHBseShjb250ZXh0LFtncmFudGVkQnl0ZXMsZnNdKTtcclxuXHRcdH0sY29udGV4dCk7XHJcblx0fSwgZXJyb3JIYW5kbGVyKTtcclxufVxyXG52YXIgaW5pdD1mdW5jdGlvbihxdW90YSxjYixjb250ZXh0KSB7XHJcblx0bmF2aWdhdG9yLndlYmtpdFBlcnNpc3RlbnRTdG9yYWdlLnJlcXVlc3RRdW90YShxdW90YSwgXHJcblx0XHRcdGZ1bmN0aW9uKGdyYW50ZWRCeXRlcykge1xyXG5cdFx0XHRcdGluaXRmcyhncmFudGVkQnl0ZXMsY2IsY29udGV4dCk7XHJcblx0XHR9LCBlcnJvckhhbmRsZXJcclxuXHQpO1xyXG59XHJcbnZhciBxdWVyeVF1b3RhPWZ1bmN0aW9uKGNiLGNvbnRleHQpIHtcclxuXHR2YXIgdGhhdD10aGlzO1xyXG5cdG5hdmlnYXRvci53ZWJraXRQZXJzaXN0ZW50U3RvcmFnZS5xdWVyeVVzYWdlQW5kUXVvdGEoIFxyXG5cdCBmdW5jdGlvbih1c2FnZSxxdW90YSl7XHJcblx0XHRcdGluaXRmcyhxdW90YSxmdW5jdGlvbigpe1xyXG5cdFx0XHRcdGNiLmFwcGx5KGNvbnRleHQsW3VzYWdlLHF1b3RhXSk7XHJcblx0XHRcdH0sY29udGV4dCk7XHJcblx0fSk7XHJcbn1cclxudmFyIEFQST17XHJcblx0aW5pdDppbml0XHJcblx0LHJlYWRkaXI6cmVhZGRpclxyXG5cdCxjaGVja1VwZGF0ZTpjaGVja1VwZGF0ZVxyXG5cdCxybTpybVxyXG5cdCxybVVSTDpybVVSTFxyXG5cdCxnZXRGaWxlVVJMOmdldEZpbGVVUkxcclxuXHQsd3JpdGVGaWxlOndyaXRlRmlsZVxyXG5cdCxyZWFkRmlsZTpyZWFkRmlsZVxyXG5cdCxkb3dubG9hZDpkb3dubG9hZFxyXG5cdCxnZXRfaGVhZDpnZXRfaGVhZFxyXG5cdCxnZXRfZGF0ZTpnZXRfZGF0ZVxyXG5cdCxnZXRfc2l6ZTpnZXRfc2l6ZVxyXG5cdCxnZXREb3dubG9hZFNpemU6Z2V0X3NpemVcclxuXHQscXVlcnlRdW90YTpxdWVyeVF1b3RhXHJcbn1cclxubW9kdWxlLmV4cG9ydHM9QVBJOyIsInZhciBodG1sNWZzPXJlcXVpcmUoXCIuL2h0bWw1ZnNcIik7XHJcbnZhciBFPVJlYWN0LmNyZWF0ZUVsZW1lbnQ7XHJcblxyXG52YXIgaHRtbGZzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xyXG5cdGdldEluaXRpYWxTdGF0ZTpmdW5jdGlvbigpIHsgXHJcblx0XHRyZXR1cm4ge3JlYWR5OmZhbHNlLCBxdW90YTowLHVzYWdlOjAsSW5pdGlhbGl6ZWQ6ZmFsc2UsYXV0b2Nsb3NlOnRoaXMucHJvcHMuYXV0b2Nsb3NlfTtcclxuXHR9LFxyXG5cdGluaXRGaWxlc3lzdGVtOmZ1bmN0aW9uKCkge1xyXG5cdFx0dmFyIHF1b3RhPXRoaXMucHJvcHMucXVvdGF8fDEwMjQqMTAyNCoxMjg7IC8vIGRlZmF1bHQgMTI4TUJcclxuXHRcdHF1b3RhPXBhcnNlSW50KHF1b3RhKTtcclxuXHRcdGh0bWw1ZnMuaW5pdChxdW90YSxmdW5jdGlvbihxKXtcclxuXHRcdFx0dGhpcy5kaWFsb2c9ZmFsc2U7XHJcblx0XHRcdCQodGhpcy5yZWZzLmRpYWxvZzEuZ2V0RE9NTm9kZSgpKS5tb2RhbCgnaGlkZScpO1xyXG5cdFx0XHR0aGlzLnNldFN0YXRlKHtxdW90YTpxLGF1dG9jbG9zZTp0cnVlfSk7XHJcblx0XHR9LHRoaXMpO1xyXG5cdH0sXHJcblx0d2VsY29tZTpmdW5jdGlvbigpIHtcclxuXHRcdHJldHVybiAoXHJcblx0XHRFKFwiZGl2XCIsIHtyZWY6IFwiZGlhbG9nMVwiLCBjbGFzc05hbWU6IFwibW9kYWwgZmFkZVwiLCBpZDogXCJteU1vZGFsXCIsIFwiZGF0YS1iYWNrZHJvcFwiOiBcInN0YXRpY1wifSwgXHJcblx0XHQgICAgRShcImRpdlwiLCB7Y2xhc3NOYW1lOiBcIm1vZGFsLWRpYWxvZ1wifSwgXHJcblx0XHQgICAgICBFKFwiZGl2XCIsIHtjbGFzc05hbWU6IFwibW9kYWwtY29udGVudFwifSwgXHJcblx0XHQgICAgICAgIEUoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJtb2RhbC1oZWFkZXJcIn0sIFxyXG5cdFx0ICAgICAgICAgIEUoXCJoNFwiLCB7Y2xhc3NOYW1lOiBcIm1vZGFsLXRpdGxlXCJ9LCBcIldlbGNvbWVcIilcclxuXHRcdCAgICAgICAgKSwgXHJcblx0XHQgICAgICAgIEUoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJtb2RhbC1ib2R5XCJ9LCBcclxuXHRcdCAgICAgICAgICBcIkJyb3dzZXIgd2lsbCBhc2sgZm9yIHlvdXIgY29uZmlybWF0aW9uLlwiXHJcblx0XHQgICAgICAgICksIFxyXG5cdFx0ICAgICAgICBFKFwiZGl2XCIsIHtjbGFzc05hbWU6IFwibW9kYWwtZm9vdGVyXCJ9LCBcclxuXHRcdCAgICAgICAgICBFKFwiYnV0dG9uXCIsIHtvbkNsaWNrOiB0aGlzLmluaXRGaWxlc3lzdGVtLCB0eXBlOiBcImJ1dHRvblwiLCBcclxuXHRcdCAgICAgICAgICAgIGNsYXNzTmFtZTogXCJidG4gYnRuLXByaW1hcnlcIn0sIFwiSW5pdGlhbGl6ZSBGaWxlIFN5c3RlbVwiKVxyXG5cdFx0ICAgICAgICApXHJcblx0XHQgICAgICApXHJcblx0XHQgICAgKVxyXG5cdFx0ICApXHJcblx0XHQgKTtcclxuXHR9LFxyXG5cdHJlbmRlckRlZmF1bHQ6ZnVuY3Rpb24oKXtcclxuXHRcdHZhciB1c2VkPU1hdGguZmxvb3IodGhpcy5zdGF0ZS51c2FnZS90aGlzLnN0YXRlLnF1b3RhICoxMDApO1xyXG5cdFx0dmFyIG1vcmU9ZnVuY3Rpb24oKSB7XHJcblx0XHRcdGlmICh1c2VkPjUwKSByZXR1cm4gRShcImJ1dHRvblwiLCB7dHlwZTogXCJidXR0b25cIiwgY2xhc3NOYW1lOiBcImJ0biBidG4tcHJpbWFyeVwifSwgXCJBbGxvY2F0ZSBNb3JlXCIpO1xyXG5cdFx0XHRlbHNlIG51bGw7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gKFxyXG5cdFx0RShcImRpdlwiLCB7cmVmOiBcImRpYWxvZzFcIiwgY2xhc3NOYW1lOiBcIm1vZGFsIGZhZGVcIiwgaWQ6IFwibXlNb2RhbFwiLCBcImRhdGEtYmFja2Ryb3BcIjogXCJzdGF0aWNcIn0sIFxyXG5cdFx0ICAgIEUoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJtb2RhbC1kaWFsb2dcIn0sIFxyXG5cdFx0ICAgICAgRShcImRpdlwiLCB7Y2xhc3NOYW1lOiBcIm1vZGFsLWNvbnRlbnRcIn0sIFxyXG5cdFx0ICAgICAgICBFKFwiZGl2XCIsIHtjbGFzc05hbWU6IFwibW9kYWwtaGVhZGVyXCJ9LCBcclxuXHRcdCAgICAgICAgICBFKFwiaDRcIiwge2NsYXNzTmFtZTogXCJtb2RhbC10aXRsZVwifSwgXCJTYW5kYm94IEZpbGUgU3lzdGVtXCIpXHJcblx0XHQgICAgICAgICksIFxyXG5cdFx0ICAgICAgICBFKFwiZGl2XCIsIHtjbGFzc05hbWU6IFwibW9kYWwtYm9keVwifSwgXHJcblx0XHQgICAgICAgICAgRShcImRpdlwiLCB7Y2xhc3NOYW1lOiBcInByb2dyZXNzXCJ9LCBcclxuXHRcdCAgICAgICAgICAgIEUoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJwcm9ncmVzcy1iYXJcIiwgcm9sZTogXCJwcm9ncmVzc2JhclwiLCBzdHlsZToge3dpZHRoOiB1c2VkK1wiJVwifX0sIFxyXG5cdFx0ICAgICAgICAgICAgICAgdXNlZCwgXCIlXCJcclxuXHRcdCAgICAgICAgICAgIClcclxuXHRcdCAgICAgICAgICApLCBcclxuXHRcdCAgICAgICAgICBFKFwic3BhblwiLCBudWxsLCB0aGlzLnN0YXRlLnF1b3RhLCBcIiB0b3RhbCAsIFwiLCB0aGlzLnN0YXRlLnVzYWdlLCBcIiBpbiB1c2VkXCIpXHJcblx0XHQgICAgICAgICksIFxyXG5cdFx0ICAgICAgICBFKFwiZGl2XCIsIHtjbGFzc05hbWU6IFwibW9kYWwtZm9vdGVyXCJ9LCBcclxuXHRcdCAgICAgICAgICBFKFwiYnV0dG9uXCIsIHtvbkNsaWNrOiB0aGlzLmRpc21pc3MsIHR5cGU6IFwiYnV0dG9uXCIsIGNsYXNzTmFtZTogXCJidG4gYnRuLWRlZmF1bHRcIiwgXCJkYXRhLWRpc21pc3NcIjogXCJtb2RhbFwifSwgXCJDbG9zZVwiKSwgXHJcblx0XHQgICAgICAgICAgbW9yZSgpXHJcblx0XHQgICAgICAgIClcclxuXHRcdCAgICAgIClcclxuXHRcdCAgICApXHJcblx0XHQgIClcclxuXHRcdCAgKTtcclxuXHR9LFxyXG5cdGRpc21pc3M6ZnVuY3Rpb24oKSB7XHJcblx0XHR2YXIgdGhhdD10aGlzO1xyXG5cdFx0c2V0VGltZW91dChmdW5jdGlvbigpe1xyXG5cdFx0XHR0aGF0LnByb3BzLm9uUmVhZHkodGhhdC5zdGF0ZS5xdW90YSx0aGF0LnN0YXRlLnVzYWdlKTtcdFxyXG5cdFx0fSwwKTtcclxuXHR9LFxyXG5cdHF1ZXJ5UXVvdGE6ZnVuY3Rpb24oKSB7XHJcblx0XHRpZiAoa3NhbmFnYXAucGxhdGZvcm09PVwiY2hyb21lXCIpIHtcclxuXHRcdFx0aHRtbDVmcy5xdWVyeVF1b3RhKGZ1bmN0aW9uKHVzYWdlLHF1b3RhKXtcclxuXHRcdFx0XHR0aGlzLnNldFN0YXRlKHt1c2FnZTp1c2FnZSxxdW90YTpxdW90YSxpbml0aWFsaXplZDp0cnVlfSk7XHJcblx0XHRcdH0sdGhpcyk7XHRcdFx0XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aGlzLnNldFN0YXRlKHt1c2FnZTozMzMscXVvdGE6MTAwMCoxMDAwKjEwMjQsaW5pdGlhbGl6ZWQ6dHJ1ZSxhdXRvY2xvc2U6dHJ1ZX0pO1xyXG5cdFx0fVxyXG5cdH0sXHJcblx0cmVuZGVyOmZ1bmN0aW9uKCkge1xyXG5cdFx0dmFyIHRoYXQ9dGhpcztcclxuXHRcdGlmICghdGhpcy5zdGF0ZS5xdW90YSB8fCB0aGlzLnN0YXRlLnF1b3RhPHRoaXMucHJvcHMucXVvdGEpIHtcclxuXHRcdFx0aWYgKHRoaXMuc3RhdGUuaW5pdGlhbGl6ZWQpIHtcclxuXHRcdFx0XHR0aGlzLmRpYWxvZz10cnVlO1xyXG5cdFx0XHRcdHJldHVybiB0aGlzLndlbGNvbWUoKTtcdFxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHJldHVybiBFKFwic3BhblwiLCBudWxsLCBcImNoZWNraW5nIHF1b3RhXCIpO1xyXG5cdFx0XHR9XHRcdFx0XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRpZiAoIXRoaXMuc3RhdGUuYXV0b2Nsb3NlKSB7XHJcblx0XHRcdFx0dGhpcy5kaWFsb2c9dHJ1ZTtcclxuXHRcdFx0XHRyZXR1cm4gdGhpcy5yZW5kZXJEZWZhdWx0KCk7IFxyXG5cdFx0XHR9XHJcblx0XHRcdHRoaXMuZGlzbWlzcygpO1xyXG5cdFx0XHR0aGlzLmRpYWxvZz1mYWxzZTtcclxuXHRcdFx0cmV0dXJuIG51bGw7XHJcblx0XHR9XHJcblx0fSxcclxuXHRjb21wb25lbnREaWRNb3VudDpmdW5jdGlvbigpIHtcclxuXHRcdGlmICghdGhpcy5zdGF0ZS5xdW90YSkge1xyXG5cdFx0XHR0aGlzLnF1ZXJ5UXVvdGEoKTtcclxuXHJcblx0XHR9O1xyXG5cdH0sXHJcblx0Y29tcG9uZW50RGlkVXBkYXRlOmZ1bmN0aW9uKCkge1xyXG5cdFx0aWYgKHRoaXMuZGlhbG9nKSAkKHRoaXMucmVmcy5kaWFsb2cxLmdldERPTU5vZGUoKSkubW9kYWwoJ3Nob3cnKTtcclxuXHR9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHM9aHRtbGZzOyIsInZhciBrc2FuYT17XCJwbGF0Zm9ybVwiOlwicmVtb3RlXCJ9O1xyXG5pZiAodHlwZW9mIHdpbmRvdyE9XCJ1bmRlZmluZWRcIikge1xyXG5cdHdpbmRvdy5rc2FuYT1rc2FuYTtcclxuXHRpZiAodHlwZW9mIGtzYW5hZ2FwPT1cInVuZGVmaW5lZFwiKSB7XHJcblx0XHR3aW5kb3cua3NhbmFnYXA9cmVxdWlyZShcIi4va3NhbmFnYXBcIik7IC8vY29tcGF0aWJsZSBsYXllciB3aXRoIG1vYmlsZVxyXG5cdH1cclxufVxyXG5pZiAodHlwZW9mIHByb2Nlc3MgIT1cInVuZGVmaW5lZFwiKSB7XHJcblx0aWYgKHByb2Nlc3MudmVyc2lvbnMgJiYgcHJvY2Vzcy52ZXJzaW9uc1tcIm5vZGUtd2Via2l0XCJdKSB7XHJcbiAgXHRcdGlmICh0eXBlb2Ygbm9kZVJlcXVpcmUhPVwidW5kZWZpbmVkXCIpIGtzYW5hLnJlcXVpcmU9bm9kZVJlcXVpcmU7XHJcbiAgXHRcdGtzYW5hLnBsYXRmb3JtPVwibm9kZS13ZWJraXRcIjtcclxuICBcdFx0d2luZG93LmtzYW5hZ2FwLnBsYXRmb3JtPVwibm9kZS13ZWJraXRcIjtcclxuXHRcdHZhciBrc2FuYWpzPXJlcXVpcmUoXCJmc1wiKS5yZWFkRmlsZVN5bmMoXCJrc2FuYS5qc1wiLFwidXRmOFwiKS50cmltKCk7XHJcblx0XHRrc2FuYS5qcz1KU09OLnBhcnNlKGtzYW5hanMuc3Vic3RyaW5nKDE0LGtzYW5hanMubGVuZ3RoLTEpKTtcclxuXHRcdHdpbmRvdy5rZnM9cmVxdWlyZShcIi4va2ZzXCIpO1xyXG4gIFx0fVxyXG59IGVsc2UgaWYgKHR5cGVvZiBjaHJvbWUhPVwidW5kZWZpbmVkXCIpey8vfSAmJiBjaHJvbWUuZmlsZVN5c3RlbSl7XHJcbi8vXHR3aW5kb3cua3NhbmFnYXA9cmVxdWlyZShcIi4va3NhbmFnYXBcIik7IC8vY29tcGF0aWJsZSBsYXllciB3aXRoIG1vYmlsZVxyXG5cdHdpbmRvdy5rc2FuYWdhcC5wbGF0Zm9ybT1cImNocm9tZVwiO1xyXG5cdHdpbmRvdy5rZnM9cmVxdWlyZShcIi4va2ZzX2h0bWw1XCIpO1xyXG5cdHJlcXVpcmUoXCIuL2xpdmVyZWxvYWRcIikoKTtcclxuXHRrc2FuYS5wbGF0Zm9ybT1cImNocm9tZVwiO1xyXG59IGVsc2Uge1xyXG5cdGlmICh0eXBlb2Yga3NhbmFnYXAhPVwidW5kZWZpbmVkXCIgJiYgdHlwZW9mIGZzIT1cInVuZGVmaW5lZFwiKSB7Ly9tb2JpbGVcclxuXHRcdHZhciBrc2FuYWpzPWZzLnJlYWRGaWxlU3luYyhcImtzYW5hLmpzXCIsXCJ1dGY4XCIpLnRyaW0oKTsgLy9hbmRyb2lkIGV4dHJhIFxcbiBhdCB0aGUgZW5kXHJcblx0XHRrc2FuYS5qcz1KU09OLnBhcnNlKGtzYW5hanMuc3Vic3RyaW5nKDE0LGtzYW5hanMubGVuZ3RoLTEpKTtcclxuXHRcdGtzYW5hLnBsYXRmb3JtPWtzYW5hZ2FwLnBsYXRmb3JtO1xyXG5cdFx0aWYgKHR5cGVvZiBrc2FuYWdhcC5hbmRyb2lkICE9XCJ1bmRlZmluZWRcIikge1xyXG5cdFx0XHRrc2FuYS5wbGF0Zm9ybT1cImFuZHJvaWRcIjtcclxuXHRcdH1cclxuXHR9XHJcbn1cclxudmFyIHRpbWVyPW51bGw7XHJcbnZhciBib290PWZ1bmN0aW9uKGFwcElkLGNiKSB7XHJcblx0a3NhbmEuYXBwSWQ9YXBwSWQ7XHJcblx0aWYgKGtzYW5hZ2FwLnBsYXRmb3JtPT1cImNocm9tZVwiKSB7IC8vbmVlZCB0byB3YWl0IGZvciBqc29ucCBrc2FuYS5qc1xyXG5cdFx0dGltZXI9c2V0SW50ZXJ2YWwoZnVuY3Rpb24oKXtcclxuXHRcdFx0aWYgKGtzYW5hLnJlYWR5KXtcclxuXHRcdFx0XHRjbGVhckludGVydmFsKHRpbWVyKTtcclxuXHRcdFx0XHRpZiAoa3NhbmEuanMgJiYga3NhbmEuanMuZmlsZXMgJiYga3NhbmEuanMuZmlsZXMubGVuZ3RoKSB7XHJcblx0XHRcdFx0XHRyZXF1aXJlKFwiLi9pbnN0YWxsa2RiXCIpKGtzYW5hLmpzLGNiKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0Y2IoKTtcdFx0XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9LDMwMCk7XHJcblx0fSBlbHNlIHtcclxuXHRcdGNiKCk7XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cz17Ym9vdDpib290XHJcblx0LGh0bWxmczpyZXF1aXJlKFwiLi9odG1sZnNcIilcclxuXHQsaHRtbDVmczpyZXF1aXJlKFwiLi9odG1sNWZzXCIpXHJcblx0LGxpdmV1cGRhdGU6cmVxdWlyZShcIi4vbGl2ZXVwZGF0ZVwiKVxyXG5cdCxmaWxlaW5zdGFsbGVyOnJlcXVpcmUoXCIuL2ZpbGVpbnN0YWxsZXJcIilcclxuXHQsZG93bmxvYWRlcjpyZXF1aXJlKFwiLi9kb3dubG9hZGVyXCIpXHJcblx0LGluc3RhbGxrZGI6cmVxdWlyZShcIi4vaW5zdGFsbGtkYlwiKVxyXG59OyIsInZhciBGaWxlaW5zdGFsbGVyPXJlcXVpcmUoXCIuL2ZpbGVpbnN0YWxsZXJcIik7XHJcblxyXG52YXIgZ2V0UmVxdWlyZV9rZGI9ZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgcmVxdWlyZWQ9W107XHJcbiAgICBrc2FuYS5qcy5maWxlcy5tYXAoZnVuY3Rpb24oZil7XHJcbiAgICAgIGlmIChmLmluZGV4T2YoXCIua2RiXCIpPT1mLmxlbmd0aC00KSB7XHJcbiAgICAgICAgdmFyIHNsYXNoPWYubGFzdEluZGV4T2YoXCIvXCIpO1xyXG4gICAgICAgIGlmIChzbGFzaD4tMSkge1xyXG4gICAgICAgICAgdmFyIGRiaWQ9Zi5zdWJzdHJpbmcoc2xhc2grMSxmLmxlbmd0aC00KTtcclxuICAgICAgICAgIHJlcXVpcmVkLnB1c2goe3VybDpmLGRiaWQ6ZGJpZCxmaWxlbmFtZTpkYmlkK1wiLmtkYlwifSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHZhciBkYmlkPWYuc3Vic3RyaW5nKDAsZi5sZW5ndGgtNCk7XHJcbiAgICAgICAgICByZXF1aXJlZC5wdXNoKHt1cmw6a3NhbmEuanMuYmFzZXVybCtmLGRiaWQ6ZGJpZCxmaWxlbmFtZTpmfSk7XHJcbiAgICAgICAgfSAgICAgICAgXHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIHJlcXVpcmVkO1xyXG59XHJcbnZhciBjYWxsYmFjaz1udWxsO1xyXG52YXIgb25SZWFkeT1mdW5jdGlvbigpIHtcclxuXHRjYWxsYmFjaygpO1xyXG59XHJcbnZhciBvcGVuRmlsZWluc3RhbGxlcj1mdW5jdGlvbihrZWVwKSB7XHJcblx0dmFyIHJlcXVpcmVfa2RiPWdldFJlcXVpcmVfa2RiKCkubWFwKGZ1bmN0aW9uKGRiKXtcclxuXHQgIHJldHVybiB7XHJcblx0ICAgIHVybDp3aW5kb3cubG9jYXRpb24ub3JpZ2luK3dpbmRvdy5sb2NhdGlvbi5wYXRobmFtZStkYi5kYmlkK1wiLmtkYlwiLFxyXG5cdCAgICBkYmRiOmRiLmRiaWQsXHJcblx0ICAgIGZpbGVuYW1lOmRiLmZpbGVuYW1lXHJcblx0ICB9XHJcblx0fSlcclxuXHRyZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChGaWxlaW5zdGFsbGVyLCB7cXVvdGE6IFwiNTEyTVwiLCBhdXRvY2xvc2U6ICFrZWVwLCBuZWVkZWQ6IHJlcXVpcmVfa2RiLCBcclxuXHQgICAgICAgICAgICAgICAgIG9uUmVhZHk6IG9uUmVhZHl9KTtcclxufVxyXG52YXIgaW5zdGFsbGtkYj1mdW5jdGlvbihrc2FuYWpzLGNiLGNvbnRleHQpIHtcclxuXHRjb25zb2xlLmxvZyhrc2FuYWpzLmZpbGVzKTtcclxuXHRSZWFjdC5yZW5kZXIob3BlbkZpbGVpbnN0YWxsZXIoKSxkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1haW5cIikpO1xyXG5cdGNhbGxiYWNrPWNiO1xyXG59XHJcbm1vZHVsZS5leHBvcnRzPWluc3RhbGxrZGI7IiwiLy9TaW11bGF0ZSBmZWF0dXJlIGluIGtzYW5hZ2FwXHJcbi8qIFxyXG4gIHJ1bnMgb24gbm9kZS13ZWJraXQgb25seVxyXG4qL1xyXG5cclxudmFyIHJlYWREaXI9ZnVuY3Rpb24ocGF0aCkgeyAvL3NpbXVsYXRlIEtzYW5hZ2FwIGZ1bmN0aW9uXHJcblx0dmFyIGZzPW5vZGVSZXF1aXJlKFwiZnNcIik7XHJcblx0cGF0aD1wYXRofHxcIi4uXCI7XHJcblx0dmFyIGRpcnM9W107XHJcblx0aWYgKHBhdGhbMF09PVwiLlwiKSB7XHJcblx0XHRpZiAocGF0aD09XCIuXCIpIGRpcnM9ZnMucmVhZGRpclN5bmMoXCIuXCIpO1xyXG5cdFx0ZWxzZSB7XHJcblx0XHRcdGRpcnM9ZnMucmVhZGRpclN5bmMoXCIuLlwiKTtcclxuXHRcdH1cclxuXHR9IGVsc2Uge1xyXG5cdFx0ZGlycz1mcy5yZWFkZGlyU3luYyhwYXRoKTtcclxuXHR9XHJcblxyXG5cdHJldHVybiBkaXJzLmpvaW4oXCJcXHVmZmZmXCIpO1xyXG59XHJcbnZhciBsaXN0QXBwcz1mdW5jdGlvbigpIHtcclxuXHR2YXIgZnM9bm9kZVJlcXVpcmUoXCJmc1wiKTtcclxuXHR2YXIga3NhbmFqc2ZpbGU9ZnVuY3Rpb24oZCkge3JldHVybiBcIi4uL1wiK2QrXCIva3NhbmEuanNcIn07XHJcblx0dmFyIGRpcnM9ZnMucmVhZGRpclN5bmMoXCIuLlwiKS5maWx0ZXIoZnVuY3Rpb24oZCl7XHJcblx0XHRcdFx0cmV0dXJuIGZzLnN0YXRTeW5jKFwiLi4vXCIrZCkuaXNEaXJlY3RvcnkoKSAmJiBkWzBdIT1cIi5cIlxyXG5cdFx0XHRcdCAgICYmIGZzLmV4aXN0c1N5bmMoa3NhbmFqc2ZpbGUoZCkpO1xyXG5cdH0pO1xyXG5cdFxyXG5cdHZhciBvdXQ9ZGlycy5tYXAoZnVuY3Rpb24oZCl7XHJcblx0XHR2YXIgY29udGVudD1mcy5yZWFkRmlsZVN5bmMoa3NhbmFqc2ZpbGUoZCksXCJ1dGY4XCIpO1xyXG4gIFx0Y29udGVudD1jb250ZW50LnJlcGxhY2UoXCJ9KVwiLFwifVwiKTtcclxuICBcdGNvbnRlbnQ9Y29udGVudC5yZXBsYWNlKFwianNvbnBfaGFuZGxlcihcIixcIlwiKTtcclxuXHRcdHZhciBvYmo9IEpTT04ucGFyc2UoY29udGVudCk7XHJcblx0XHRvYmouZGJpZD1kO1xyXG5cdFx0b2JqLnBhdGg9ZDtcclxuXHRcdHJldHVybiBvYmo7XHJcblx0fSlcclxuXHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkob3V0KTtcclxufVxyXG5cclxuXHJcblxyXG52YXIga2ZzPXtyZWFkRGlyOnJlYWREaXIsbGlzdEFwcHM6bGlzdEFwcHN9O1xyXG5cclxubW9kdWxlLmV4cG9ydHM9a2ZzOyIsInZhciByZWFkRGlyPWZ1bmN0aW9uKCl7XHJcblx0cmV0dXJuIFtdO1xyXG59XHJcbnZhciBsaXN0QXBwcz1mdW5jdGlvbigpe1xyXG5cdHJldHVybiBbXTtcclxufVxyXG5tb2R1bGUuZXhwb3J0cz17cmVhZERpcjpyZWFkRGlyLGxpc3RBcHBzOmxpc3RBcHBzfTsiLCJ2YXIgYXBwbmFtZT1cImluc3RhbGxlclwiO1xyXG52YXIgc3dpdGNoQXBwPWZ1bmN0aW9uKHBhdGgpIHtcclxuXHR2YXIgZnM9cmVxdWlyZShcImZzXCIpO1xyXG5cdHBhdGg9XCIuLi9cIitwYXRoO1xyXG5cdGFwcG5hbWU9cGF0aDtcclxuXHRkb2N1bWVudC5sb2NhdGlvbi5ocmVmPSBwYXRoK1wiL2luZGV4Lmh0bWxcIjsgXHJcblx0cHJvY2Vzcy5jaGRpcihwYXRoKTtcclxufVxyXG52YXIgZG93bmxvYWRlcj17fTtcclxudmFyIHJvb3RQYXRoPVwiXCI7XHJcblxyXG52YXIgZGVsZXRlQXBwPWZ1bmN0aW9uKGFwcCkge1xyXG5cdGNvbnNvbGUuZXJyb3IoXCJub3QgYWxsb3cgb24gUEMsIGRvIGl0IGluIEZpbGUgRXhwbG9yZXIvIEZpbmRlclwiKTtcclxufVxyXG52YXIgdXNlcm5hbWU9ZnVuY3Rpb24oKSB7XHJcblx0cmV0dXJuIFwiXCI7XHJcbn1cclxudmFyIHVzZXJlbWFpbD1mdW5jdGlvbigpIHtcclxuXHRyZXR1cm4gXCJcIlxyXG59XHJcbnZhciBydW50aW1lX3ZlcnNpb249ZnVuY3Rpb24oKSB7XHJcblx0cmV0dXJuIFwiMS40XCI7XHJcbn1cclxuXHJcbi8vY29weSBmcm9tIGxpdmV1cGRhdGVcclxudmFyIGpzb25wPWZ1bmN0aW9uKHVybCxkYmlkLGNhbGxiYWNrLGNvbnRleHQpIHtcclxuICB2YXIgc2NyaXB0PWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwianNvbnAyXCIpO1xyXG4gIGlmIChzY3JpcHQpIHtcclxuICAgIHNjcmlwdC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHNjcmlwdCk7XHJcbiAgfVxyXG4gIHdpbmRvdy5qc29ucF9oYW5kbGVyPWZ1bmN0aW9uKGRhdGEpIHtcclxuICAgIGlmICh0eXBlb2YgZGF0YT09XCJvYmplY3RcIikge1xyXG4gICAgICBkYXRhLmRiaWQ9ZGJpZDtcclxuICAgICAgY2FsbGJhY2suYXBwbHkoY29udGV4dCxbZGF0YV0pOyAgICBcclxuICAgIH0gIFxyXG4gIH1cclxuICB3aW5kb3cuanNvbnBfZXJyb3JfaGFuZGxlcj1mdW5jdGlvbigpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoXCJ1cmwgdW5yZWFjaGFibGVcIix1cmwpO1xyXG4gICAgY2FsbGJhY2suYXBwbHkoY29udGV4dCxbbnVsbF0pO1xyXG4gIH1cclxuICBzY3JpcHQ9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XHJcbiAgc2NyaXB0LnNldEF0dHJpYnV0ZSgnaWQnLCBcImpzb25wMlwiKTtcclxuICBzY3JpcHQuc2V0QXR0cmlidXRlKCdvbmVycm9yJywgXCJqc29ucF9lcnJvcl9oYW5kbGVyKClcIik7XHJcbiAgdXJsPXVybCsnPycrKG5ldyBEYXRlKCkuZ2V0VGltZSgpKTtcclxuICBzY3JpcHQuc2V0QXR0cmlidXRlKCdzcmMnLCB1cmwpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0uYXBwZW5kQ2hpbGQoc2NyaXB0KTsgXHJcbn1cclxuXHJcbnZhciBrc2FuYWdhcD17XHJcblx0cGxhdGZvcm06XCJub2RlLXdlYmtpdFwiLFxyXG5cdHN0YXJ0RG93bmxvYWQ6ZG93bmxvYWRlci5zdGFydERvd25sb2FkLFxyXG5cdGRvd25sb2FkZWRCeXRlOmRvd25sb2FkZXIuZG93bmxvYWRlZEJ5dGUsXHJcblx0ZG93bmxvYWRpbmdGaWxlOmRvd25sb2FkZXIuZG93bmxvYWRpbmdGaWxlLFxyXG5cdGNhbmNlbERvd25sb2FkOmRvd25sb2FkZXIuY2FuY2VsRG93bmxvYWQsXHJcblx0ZG9uZURvd25sb2FkOmRvd25sb2FkZXIuZG9uZURvd25sb2FkLFxyXG5cdHN3aXRjaEFwcDpzd2l0Y2hBcHAsXHJcblx0cm9vdFBhdGg6cm9vdFBhdGgsXHJcblx0ZGVsZXRlQXBwOiBkZWxldGVBcHAsXHJcblx0dXNlcm5hbWU6dXNlcm5hbWUsIC8vbm90IHN1cHBvcnQgb24gUENcclxuXHR1c2VyZW1haWw6dXNlcm5hbWUsXHJcblx0cnVudGltZV92ZXJzaW9uOnJ1bnRpbWVfdmVyc2lvbixcclxuXHRcclxufVxyXG5cclxuaWYgKHR5cGVvZiBwcm9jZXNzIT1cInVuZGVmaW5lZFwiKSB7XHJcblx0dmFyIGtzYW5hanM9cmVxdWlyZShcImZzXCIpLnJlYWRGaWxlU3luYyhcIi4va3NhbmEuanNcIixcInV0ZjhcIikudHJpbSgpO1xyXG5cdGRvd25sb2FkZXI9cmVxdWlyZShcIi4vZG93bmxvYWRlclwiKTtcclxuXHRjb25zb2xlLmxvZyhrc2FuYWpzKTtcclxuXHQvL2tzYW5hLmpzPUpTT04ucGFyc2Uoa3NhbmFqcy5zdWJzdHJpbmcoMTQsa3NhbmFqcy5sZW5ndGgtMSkpO1xyXG5cdHJvb3RQYXRoPXByb2Nlc3MuY3dkKCk7XHJcblx0cm9vdFBhdGg9cmVxdWlyZShcInBhdGhcIikucmVzb2x2ZShyb290UGF0aCxcIi4uXCIpLnJlcGxhY2UoL1xcXFwvZyxcIi9cIikrJy8nO1xyXG5cdGtzYW5hLnJlYWR5PXRydWU7XHJcbn0gZWxzZXtcclxuXHR2YXIgdXJsPXdpbmRvdy5sb2NhdGlvbi5vcmlnaW4rd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnJlcGxhY2UoXCJpbmRleC5odG1sXCIsXCJcIikrXCJrc2FuYS5qc1wiO1xyXG5cdGpzb25wKHVybCxhcHBuYW1lLGZ1bmN0aW9uKGRhdGEpe1xyXG5cdFx0a3NhbmEuanM9ZGF0YTtcclxuXHRcdGtzYW5hLnJlYWR5PXRydWU7XHJcblx0fSk7XHJcbn1cclxubW9kdWxlLmV4cG9ydHM9a3NhbmFnYXA7IiwidmFyIHN0YXJ0ZWQ9ZmFsc2U7XHJcbnZhciB0aW1lcj1udWxsO1xyXG52YXIgYnVuZGxlZGF0ZT1udWxsO1xyXG52YXIgZ2V0X2RhdGU9cmVxdWlyZShcIi4vaHRtbDVmc1wiKS5nZXRfZGF0ZTtcclxudmFyIGNoZWNrSWZCdW5kbGVVcGRhdGVkPWZ1bmN0aW9uKCkge1xyXG5cdGdldF9kYXRlKFwiYnVuZGxlLmpzXCIsZnVuY3Rpb24oZGF0ZSl7XHJcblx0XHRpZiAoYnVuZGxlZGF0ZSAmJmJ1bmRsZWRhdGUhPWRhdGUpe1xyXG5cdFx0XHRsb2NhdGlvbi5yZWxvYWQoKTtcclxuXHRcdH1cclxuXHRcdGJ1bmRsZWRhdGU9ZGF0ZTtcclxuXHR9KTtcclxufVxyXG52YXIgbGl2ZXJlbG9hZD1mdW5jdGlvbigpIHtcclxuXHRpZiAoc3RhcnRlZCkgcmV0dXJuO1xyXG5cclxuXHR0aW1lcjE9c2V0SW50ZXJ2YWwoZnVuY3Rpb24oKXtcclxuXHRcdGNoZWNrSWZCdW5kbGVVcGRhdGVkKCk7XHJcblx0fSwyMDAwKTtcclxuXHRzdGFydGVkPXRydWU7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzPWxpdmVyZWxvYWQ7IiwiXHJcbnZhciBqc29ucD1mdW5jdGlvbih1cmwsZGJpZCxjYWxsYmFjayxjb250ZXh0KSB7XHJcbiAgdmFyIHNjcmlwdD1kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImpzb25wXCIpO1xyXG4gIGlmIChzY3JpcHQpIHtcclxuICAgIHNjcmlwdC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHNjcmlwdCk7XHJcbiAgfVxyXG4gIHdpbmRvdy5qc29ucF9oYW5kbGVyPWZ1bmN0aW9uKGRhdGEpIHtcclxuICAgIC8vY29uc29sZS5sb2coXCJyZWNlaXZlIGZyb20ga3NhbmEuanNcIixkYXRhKTtcclxuICAgIGlmICh0eXBlb2YgZGF0YT09XCJvYmplY3RcIikge1xyXG4gICAgICBpZiAodHlwZW9mIGRhdGEuZGJpZD09XCJ1bmRlZmluZWRcIikge1xyXG4gICAgICAgIGRhdGEuZGJpZD1kYmlkO1xyXG4gICAgICB9XHJcbiAgICAgIGNhbGxiYWNrLmFwcGx5KGNvbnRleHQsW2RhdGFdKTtcclxuICAgIH0gIFxyXG4gIH1cclxuXHJcbiAgd2luZG93Lmpzb25wX2Vycm9yX2hhbmRsZXI9ZnVuY3Rpb24oKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKFwidXJsIHVucmVhY2hhYmxlXCIsdXJsKTtcclxuICAgIGNhbGxiYWNrLmFwcGx5KGNvbnRleHQsW251bGxdKTtcclxuICB9XHJcblxyXG4gIHNjcmlwdD1kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcclxuICBzY3JpcHQuc2V0QXR0cmlidXRlKCdpZCcsIFwianNvbnBcIik7XHJcbiAgc2NyaXB0LnNldEF0dHJpYnV0ZSgnb25lcnJvcicsIFwianNvbnBfZXJyb3JfaGFuZGxlcigpXCIpO1xyXG4gIHVybD11cmwrJz8nKyhuZXcgRGF0ZSgpLmdldFRpbWUoKSk7XHJcbiAgc2NyaXB0LnNldEF0dHJpYnV0ZSgnc3JjJywgdXJsKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLmFwcGVuZENoaWxkKHNjcmlwdCk7IFxyXG59XHJcbnZhciBydW50aW1lX3ZlcnNpb25fb2s9ZnVuY3Rpb24obWlucnVudGltZSkge1xyXG4gIGlmICghbWlucnVudGltZSkgcmV0dXJuIHRydWU7Ly9ub3QgbWVudGlvbmVkLlxyXG4gIHZhciBtaW49cGFyc2VGbG9hdChtaW5ydW50aW1lKTtcclxuICB2YXIgcnVudGltZT1wYXJzZUZsb2F0KCBrc2FuYWdhcC5ydW50aW1lX3ZlcnNpb24oKXx8XCIxLjBcIik7XHJcbiAgaWYgKG1pbj5ydW50aW1lKSByZXR1cm4gZmFsc2U7XHJcbiAgcmV0dXJuIHRydWU7XHJcbn1cclxuXHJcbnZhciBuZWVkVG9VcGRhdGU9ZnVuY3Rpb24oZnJvbWpzb24sdG9qc29uKSB7XHJcbiAgdmFyIG5lZWRVcGRhdGVzPVtdO1xyXG4gIGZvciAodmFyIGk9MDtpPGZyb21qc29uLmxlbmd0aDtpKyspIHsgXHJcbiAgICB2YXIgdG89dG9qc29uW2ldO1xyXG4gICAgdmFyIGZyb209ZnJvbWpzb25baV07XHJcbiAgICB2YXIgbmV3ZmlsZXM9W10sbmV3ZmlsZXNpemVzPVtdLHJlbW92ZWQ9W107XHJcbiAgICBcclxuICAgIGlmICghdG8pIGNvbnRpbnVlOyAvL2Nhbm5vdCByZWFjaCBob3N0XHJcbiAgICBpZiAoIXJ1bnRpbWVfdmVyc2lvbl9vayh0by5taW5ydW50aW1lKSkge1xyXG4gICAgICBjb25zb2xlLndhcm4oXCJydW50aW1lIHRvbyBvbGQsIG5lZWQgXCIrdG8ubWlucnVudGltZSk7XHJcbiAgICAgIGNvbnRpbnVlOyBcclxuICAgIH1cclxuICAgIGlmICghZnJvbS5maWxlZGF0ZXMpIHtcclxuICAgICAgY29uc29sZS53YXJuKFwibWlzc2luZyBmaWxlZGF0ZXMgaW4ga3NhbmEuanMgb2YgXCIrZnJvbS5kYmlkKTtcclxuICAgICAgY29udGludWU7XHJcbiAgICB9XHJcbiAgICBmcm9tLmZpbGVkYXRlcy5tYXAoZnVuY3Rpb24oZixpZHgpe1xyXG4gICAgICB2YXIgbmV3aWR4PXRvLmZpbGVzLmluZGV4T2YoIGZyb20uZmlsZXNbaWR4XSk7XHJcbiAgICAgIGlmIChuZXdpZHg9PS0xKSB7XHJcbiAgICAgICAgLy9maWxlIHJlbW92ZWQgaW4gbmV3IHZlcnNpb25cclxuICAgICAgICByZW1vdmVkLnB1c2goZnJvbS5maWxlc1tpZHhdKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB2YXIgZnJvbWRhdGU9RGF0ZS5wYXJzZShmKTtcclxuICAgICAgICB2YXIgdG9kYXRlPURhdGUucGFyc2UodG8uZmlsZWRhdGVzW25ld2lkeF0pO1xyXG4gICAgICAgIGlmIChmcm9tZGF0ZTx0b2RhdGUpIHtcclxuICAgICAgICAgIG5ld2ZpbGVzLnB1c2goIHRvLmZpbGVzW25ld2lkeF0gKTtcclxuICAgICAgICAgIG5ld2ZpbGVzaXplcy5wdXNoKHRvLmZpbGVzaXplc1tuZXdpZHhdKTtcclxuICAgICAgICB9ICAgICAgICBcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBpZiAobmV3ZmlsZXMubGVuZ3RoKSB7XHJcbiAgICAgIGZyb20ubmV3ZmlsZXM9bmV3ZmlsZXM7XHJcbiAgICAgIGZyb20ubmV3ZmlsZXNpemVzPW5ld2ZpbGVzaXplcztcclxuICAgICAgZnJvbS5yZW1vdmVkPXJlbW92ZWQ7XHJcbiAgICAgIG5lZWRVcGRhdGVzLnB1c2goZnJvbSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiBuZWVkVXBkYXRlcztcclxufVxyXG52YXIgZ2V0VXBkYXRhYmxlcz1mdW5jdGlvbihhcHBzLGNiLGNvbnRleHQpIHtcclxuICBnZXRSZW1vdGVKc29uKGFwcHMsZnVuY3Rpb24oanNvbnMpe1xyXG4gICAgdmFyIGhhc1VwZGF0ZXM9bmVlZFRvVXBkYXRlKGFwcHMsanNvbnMpO1xyXG4gICAgY2IuYXBwbHkoY29udGV4dCxbaGFzVXBkYXRlc10pO1xyXG4gIH0sY29udGV4dCk7XHJcbn1cclxudmFyIGdldFJlbW90ZUpzb249ZnVuY3Rpb24oYXBwcyxjYixjb250ZXh0KSB7XHJcbiAgdmFyIHRhc2txdWV1ZT1bXSxvdXRwdXQ9W107XHJcbiAgdmFyIG1ha2VjYj1mdW5jdGlvbihhcHApe1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgICAgIGlmICghKGRhdGEgJiYgdHlwZW9mIGRhdGEgPT0nb2JqZWN0JyAmJiBkYXRhLl9fZW1wdHkpKSBvdXRwdXQucHVzaChkYXRhKTtcclxuICAgICAgICBpZiAoIWFwcC5iYXNldXJsKSB7XHJcbiAgICAgICAgICB0YXNrcXVldWUuc2hpZnQoe19fZW1wdHk6dHJ1ZX0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB2YXIgdXJsPWFwcC5iYXNldXJsK1wiL2tzYW5hLmpzXCI7ICAgIFxyXG4gICAgICAgICAgY29uc29sZS5sb2codXJsKTtcclxuICAgICAgICAgIGpzb25wKCB1cmwgLGFwcC5kYmlkLHRhc2txdWV1ZS5zaGlmdCgpLCBjb250ZXh0KTsgICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgfTtcclxuICBhcHBzLmZvckVhY2goZnVuY3Rpb24oYXBwKXt0YXNrcXVldWUucHVzaChtYWtlY2IoYXBwKSl9KTtcclxuXHJcbiAgdGFza3F1ZXVlLnB1c2goZnVuY3Rpb24oZGF0YSl7XHJcbiAgICBvdXRwdXQucHVzaChkYXRhKTtcclxuICAgIGNiLmFwcGx5KGNvbnRleHQsW291dHB1dF0pO1xyXG4gIH0pO1xyXG5cclxuICB0YXNrcXVldWUuc2hpZnQoKSh7X19lbXB0eTp0cnVlfSk7IC8vcnVuIHRoZSB0YXNrXHJcbn1cclxudmFyIGh1bWFuRmlsZVNpemU9ZnVuY3Rpb24oYnl0ZXMsIHNpKSB7XHJcbiAgICB2YXIgdGhyZXNoID0gc2kgPyAxMDAwIDogMTAyNDtcclxuICAgIGlmKGJ5dGVzIDwgdGhyZXNoKSByZXR1cm4gYnl0ZXMgKyAnIEInO1xyXG4gICAgdmFyIHVuaXRzID0gc2kgPyBbJ2tCJywnTUInLCdHQicsJ1RCJywnUEInLCdFQicsJ1pCJywnWUInXSA6IFsnS2lCJywnTWlCJywnR2lCJywnVGlCJywnUGlCJywnRWlCJywnWmlCJywnWWlCJ107XHJcbiAgICB2YXIgdSA9IC0xO1xyXG4gICAgZG8ge1xyXG4gICAgICAgIGJ5dGVzIC89IHRocmVzaDtcclxuICAgICAgICArK3U7XHJcbiAgICB9IHdoaWxlKGJ5dGVzID49IHRocmVzaCk7XHJcbiAgICByZXR1cm4gYnl0ZXMudG9GaXhlZCgxKSsnICcrdW5pdHNbdV07XHJcbn07XHJcblxyXG52YXIgc3RhcnQ9ZnVuY3Rpb24oa3NhbmFqcyxjYixjb250ZXh0KXtcclxuICB2YXIgZmlsZXM9a3NhbmFqcy5uZXdmaWxlc3x8a3NhbmFqcy5maWxlcztcclxuICB2YXIgYmFzZXVybD1rc2FuYWpzLmJhc2V1cmx8fCBcImh0dHA6Ly8xMjcuMC4wLjE6ODA4MC9cIitrc2FuYWpzLmRiaWQrXCIvXCI7XHJcbiAgdmFyIHN0YXJ0ZWQ9a3NhbmFnYXAuc3RhcnREb3dubG9hZChrc2FuYWpzLmRiaWQsYmFzZXVybCxmaWxlcy5qb2luKFwiXFx1ZmZmZlwiKSk7XHJcbiAgY2IuYXBwbHkoY29udGV4dCxbc3RhcnRlZF0pO1xyXG59XHJcbnZhciBzdGF0dXM9ZnVuY3Rpb24oKXtcclxuICB2YXIgbmZpbGU9a3NhbmFnYXAuZG93bmxvYWRpbmdGaWxlKCk7XHJcbiAgdmFyIGRvd25sb2FkZWRCeXRlPWtzYW5hZ2FwLmRvd25sb2FkZWRCeXRlKCk7XHJcbiAgdmFyIGRvbmU9a3NhbmFnYXAuZG9uZURvd25sb2FkKCk7XHJcbiAgcmV0dXJuIHtuZmlsZTpuZmlsZSxkb3dubG9hZGVkQnl0ZTpkb3dubG9hZGVkQnl0ZSwgZG9uZTpkb25lfTtcclxufVxyXG5cclxudmFyIGNhbmNlbD1mdW5jdGlvbigpe1xyXG4gIHJldHVybiBrc2FuYWdhcC5jYW5jZWxEb3dubG9hZCgpO1xyXG59XHJcblxyXG52YXIgbGl2ZXVwZGF0ZT17IGh1bWFuRmlsZVNpemU6IGh1bWFuRmlsZVNpemUsIFxyXG4gIG5lZWRUb1VwZGF0ZTogbmVlZFRvVXBkYXRlICwganNvbnA6anNvbnAsIFxyXG4gIGdldFVwZGF0YWJsZXM6Z2V0VXBkYXRhYmxlcyxcclxuICBzdGFydDpzdGFydCxcclxuICBjYW5jZWw6Y2FuY2VsLFxyXG4gIHN0YXR1czpzdGF0dXNcclxuICB9O1xyXG5tb2R1bGUuZXhwb3J0cz1saXZldXBkYXRlOyIsImZ1bmN0aW9uIG1rZGlyUCAocCwgbW9kZSwgZiwgbWFkZSkge1xyXG4gICAgIHZhciBwYXRoID0gbm9kZVJlcXVpcmUoJ3BhdGgnKTtcclxuICAgICB2YXIgZnMgPSBub2RlUmVxdWlyZSgnZnMnKTtcclxuXHRcclxuICAgIGlmICh0eXBlb2YgbW9kZSA9PT0gJ2Z1bmN0aW9uJyB8fCBtb2RlID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICBmID0gbW9kZTtcclxuICAgICAgICBtb2RlID0gMHgxRkYgJiAofnByb2Nlc3MudW1hc2soKSk7XHJcbiAgICB9XHJcbiAgICBpZiAoIW1hZGUpIG1hZGUgPSBudWxsO1xyXG5cclxuICAgIHZhciBjYiA9IGYgfHwgZnVuY3Rpb24gKCkge307XHJcbiAgICBpZiAodHlwZW9mIG1vZGUgPT09ICdzdHJpbmcnKSBtb2RlID0gcGFyc2VJbnQobW9kZSwgOCk7XHJcbiAgICBwID0gcGF0aC5yZXNvbHZlKHApO1xyXG5cclxuICAgIGZzLm1rZGlyKHAsIG1vZGUsIGZ1bmN0aW9uIChlcikge1xyXG4gICAgICAgIGlmICghZXIpIHtcclxuICAgICAgICAgICAgbWFkZSA9IG1hZGUgfHwgcDtcclxuICAgICAgICAgICAgcmV0dXJuIGNiKG51bGwsIG1hZGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzd2l0Y2ggKGVyLmNvZGUpIHtcclxuICAgICAgICAgICAgY2FzZSAnRU5PRU5UJzpcclxuICAgICAgICAgICAgICAgIG1rZGlyUChwYXRoLmRpcm5hbWUocCksIG1vZGUsIGZ1bmN0aW9uIChlciwgbWFkZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlcikgY2IoZXIsIG1hZGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgbWtkaXJQKHAsIG1vZGUsIGNiLCBtYWRlKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICAvLyBJbiB0aGUgY2FzZSBvZiBhbnkgb3RoZXIgZXJyb3IsIGp1c3Qgc2VlIGlmIHRoZXJlJ3MgYSBkaXJcclxuICAgICAgICAgICAgLy8gdGhlcmUgYWxyZWFkeS4gIElmIHNvLCB0aGVuIGhvb3JheSEgIElmIG5vdCwgdGhlbiBzb21ldGhpbmdcclxuICAgICAgICAgICAgLy8gaXMgYm9ya2VkLlxyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgZnMuc3RhdChwLCBmdW5jdGlvbiAoZXIyLCBzdGF0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgdGhlIHN0YXQgZmFpbHMsIHRoZW4gdGhhdCdzIHN1cGVyIHdlaXJkLlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGxldCB0aGUgb3JpZ2luYWwgZXJyb3IgYmUgdGhlIGZhaWx1cmUgcmVhc29uLlxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlcjIgfHwgIXN0YXQuaXNEaXJlY3RvcnkoKSkgY2IoZXIsIG1hZGUpXHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBjYihudWxsLCBtYWRlKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn1cclxuXHJcbm1rZGlyUC5zeW5jID0gZnVuY3Rpb24gc3luYyAocCwgbW9kZSwgbWFkZSkge1xyXG4gICAgdmFyIHBhdGggPSBub2RlUmVxdWlyZSgncGF0aCcpO1xyXG4gICAgdmFyIGZzID0gbm9kZVJlcXVpcmUoJ2ZzJyk7XHJcbiAgICBpZiAobW9kZSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgbW9kZSA9IDB4MUZGICYgKH5wcm9jZXNzLnVtYXNrKCkpO1xyXG4gICAgfVxyXG4gICAgaWYgKCFtYWRlKSBtYWRlID0gbnVsbDtcclxuXHJcbiAgICBpZiAodHlwZW9mIG1vZGUgPT09ICdzdHJpbmcnKSBtb2RlID0gcGFyc2VJbnQobW9kZSwgOCk7XHJcbiAgICBwID0gcGF0aC5yZXNvbHZlKHApO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgICAgZnMubWtkaXJTeW5jKHAsIG1vZGUpO1xyXG4gICAgICAgIG1hZGUgPSBtYWRlIHx8IHA7XHJcbiAgICB9XHJcbiAgICBjYXRjaCAoZXJyMCkge1xyXG4gICAgICAgIHN3aXRjaCAoZXJyMC5jb2RlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgJ0VOT0VOVCcgOlxyXG4gICAgICAgICAgICAgICAgbWFkZSA9IHN5bmMocGF0aC5kaXJuYW1lKHApLCBtb2RlLCBtYWRlKTtcclxuICAgICAgICAgICAgICAgIHN5bmMocCwgbW9kZSwgbWFkZSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgIC8vIEluIHRoZSBjYXNlIG9mIGFueSBvdGhlciBlcnJvciwganVzdCBzZWUgaWYgdGhlcmUncyBhIGRpclxyXG4gICAgICAgICAgICAvLyB0aGVyZSBhbHJlYWR5LiAgSWYgc28sIHRoZW4gaG9vcmF5ISAgSWYgbm90LCB0aGVuIHNvbWV0aGluZ1xyXG4gICAgICAgICAgICAvLyBpcyBib3JrZWQuXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICB2YXIgc3RhdDtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdCA9IGZzLnN0YXRTeW5jKHApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2F0Y2ggKGVycjEpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnIwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKCFzdGF0LmlzRGlyZWN0b3J5KCkpIHRocm93IGVycjA7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG1hZGU7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IG1rZGlyUC5ta2RpcnAgPSBta2RpclAubWtkaXJQID0gbWtkaXJQO1xyXG4iXX0=
