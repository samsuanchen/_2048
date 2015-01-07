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
		'code Xmi function(){ /* Xmi ( -- Xmin ) */\n'+
		' vm.dStack.push(parseInt(c1.getAttribute("r")));}end-code\n'+"
		'code Xma function(){ /* Xma ( -- Xmax ) */\n'+
		' vm.dStack.push(svg.clientWidth-parseInt(c1.getAttribute("r")));}end-code\n'+
		'code xmi function(){ /* xmi ( -- xmin ) */\n'+
		' vm.dStack.push(parseInt(c2.getAttribute("r")));}end-code\n'+
		'code xma function(){ /* xma ( -- xmax ) */\n'+
		' vm.dStack.push(svg.clientWidth-parseInt(c2.getAttribute("r")));}end-code\n'+
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
}
function go(){
	halt();
	if(!nomore) btnGo.innerText='重新 esc', hint.innerText='手 滑動 或 按鍵';
	locations=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]; // 每格起始分數 0
	$('#score')[0].style.background='white';
	$('#mainbox')[0].style.background='white';
	nomore=score=0, time=300, newNumber(), newNumber(), paint();
	tGo=setInterval(function (){
		$("#time").html("剩餘<br/>"+ time-- +"秒");
		if(time<0) noMore();
	},1000); // show time
	vm.exec.apply(vm,["Xmi Cx! 1 Dx! begin 20 ms Dx@ Cx+! Cx@ Xmi < Cx@ Xma > or if 0 Dx@ - Dx! then again"])
	vm.exec.apply(vm,["xmi cx! 1 dx! begin 15 ms dx@ cx+! cx@ xmi < cx@ xma > or if 0 dx@ - dx! then again"])
}
window._2048={init:init,halt:halt,go:go,toUp:toUp,toLeft:toLeft,toRight:toRight,toDown:toDown};
window.x=function(cmd){vm.exec.apply(vm,[cmd])} // 例: x("#f00 c2 set fill")

module.exports=_2048;
