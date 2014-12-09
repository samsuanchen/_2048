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
	$('#mainbox')[0].style.background='white';
	nomore=score=time=0,paint();
}
function go(){
	if(!nomore)
		btnGo.innerText='重新 esc', hint.innerText='手 滑動 或 按鍵';
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
			$('#mainbox')[0].style.background='#ffc';
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
$("#mainbox").swipe({ // 手指 在表格中 可向 上下左右 滑動
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
function paint() { // 更新畫面
	boxs.forEach(function(b,i){
		var L=locations[i], index=L===0?0:(L.toString(2).length-1);
		b.innerText=L?L:"";
		b.style.background=colors[index];
	});
	$("#score").text("得分" + score);
	if(score>max) max = score, localStorage.setItem('max2048',max);
	$("#max").text("最高" + max);
	isEnd();
}
vm.exec(
 'code get function(){/* get ( obj <attr> -- val ) 例: box1 get id */'+
 'var a=vm.dStack.pop(),t=vm.nextToken();'+
 'var v=Array.isArray(a)?a.map(function(o){return o?o[t]:""}):a[t];'+
 'vm.dStack.push(v);}end-code'
);
// set ( val obj <attr> -- ) // 例如: val box1 set attr 
vm.exec(
 'code set function(){vm.dStack.pop()[vm.nextToken()]=vm.dStack.pop();}end-code'
);