//////////////////////////////////////////////////////////////////////////////////////// tools
function equal(tag,value,expected){ var t; // asure value is exactly equal to expected
  tests++;
  if(value===expected)
    passed++, vm.showTst(tag+' ok');
  else{
    var tv=typeof value, te=typeof expected;
    t='??? '+tag+' value:'+value+' not equal to expected:'+expected
    vm.showErr(t);
    if(tv==='string')
      t='val len '+value.length+': '+value.split('').map(function(c){
        return c.charCodeAt(0).toString(16);
      }).join(' '), vm.showErr(t);
    if(te==='string')
      t='exp len '+expected.length+': '+expected.split('').map(function(c){
        return c.charCodeAt(0).toString(16);
      }).join(' '), vm.showErr(t);
  }
}
function trm(x){ // ignore all space, \t, or \n in string x
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
	vm.type('primitives:');
	primitives.forEach(function(w){
		if(vm.tob.length+w.length+1>80)vm.cr();
		vm.type(' '+w);
	});
	if(vm.tob)vm.cr();
	vm.type('colons:');
	colons.forEach(function(w){
		if(vm.tob.length+w.length+1>80)vm.cr();
		vm.type(' '+w);
	});
	if(vm.tob)vm.cr();
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
    vm.cr(s);
    prevName=n;
  } while((codeLimit && ip<codeLimit) || n!=='exit');
};
vm.seeWord=function seeWord(w){
	var o= typeof o==='string'?vm.nameWord[w]:w;
	if(typeof o==='object'){
      var n=o.name, x=o.xt, t=typeof x, i=o.immediate?'immediate':'';
		if(t==='function'){
			vm.cr(n+' primitive '+i),vm.cr(x.toString().replace(/</g,'&lt;'));
		} else if(t==='number' && x%1===0){
			vm.cr(n+' colon '+i),vm.seeColon(x);
		}else{
			vm.cr(n+' xt='+x+' ?????');
		}
	}else{
		vm.cr(w+' ?????');
	}
};
vm.seeArray=function seeArray(arr){
	var old=vm.cArea; addr=old.length;
	vm.cArea=vm.cArea.concat(arr);
	vm.seeColon(addr);
	vm.cArea=old;
};
vm.see=function see(x){
	var o=x||vm.nextToken();
	var t=typeof o;
	if(t==='number' && o%1===0){
		vm.seeColon(o);
	} else if(t==='object'){
		vm.seeWord(o);
	} else if(t==='string'){
		vm.seeWord(vm.nameWord[o]);
	} else {
		vm.cr(o+' ?????');
	}
};
//////////////////////////////////////////////////////////////////////////////////////// tools
vm.addWord('code' ,vm.code );
vm.addWord('doLit',vm.doLit);																//	v2
vm.addWord('exit' ,vm.exit );																//	v2
vm.addWord('words',vm.showWords);
vm.addWord('see'  ,vm.see);
vm.addWord('type' ,vm.type);
vm.addWord('cr'   ,vm.cr);
//////////////////////////////////////////////////////////////////////////////////////////// v0
vm.addWord('r1',function(){LED3.write(1);});
vm.addWord('r0',function(){LED3.write(0);});
vm.addWord('g1',function(){LED2.write(1);});
vm.addWord('y1',function(){LED1.write(1);});
vm.addWord('b1',function(){LED4.write(1);});
vm.addWord('g0',function(){LED2.write(0);});
vm.addWord('y0',function(){LED1.write(0);});
vm.addWord('b0',function(){LED4.write(0);});
//////////////////////////////////////////////////////////////////////////////////////////// v1
vm.addWord('.',function(){vm.type(),vm.type(" ");});
vm.addWord('+',function(){var b=vm.dStack.pop();vm.dStack.push(vm.dStack.pop()+b);});
vm.addWord('-',function(){var b=vm.dStack.pop();vm.dStack.push(vm.dStack.pop()-b);});
vm.addWord('*',function(){var b=vm.dStack.pop();vm.dStack.push(vm.dStack.pop()*b);});
vm.addWord('/',function(){var b=vm.dStack.pop();vm.dStack.push(vm.dStack.pop()/b);});
vm.addWord( '1+' ,function(){var s=vm.dStack; s[s.length-1]++;});
vm.addWord( '1-' ,function(){var s=vm.dStack; s[s.length-1]--;});
vm.addWord( '2+' ,function(){var s=vm.dStack; s[s.length-1]+=2;});
vm.addWord( '2-' ,function(){var s=vm.dStack; s[s.length-1]-=2;});
vm.addWord( '2*' ,function(){var s=vm.dStack; s[s.length-1]*=2;});
vm.addWord( '2/' ,function(){var s=vm.dStack; s[s.length-1]/=2;});
vm.addWord( '2%' ,function(){var s=vm.dStack; s[s.length-1]%=2;});
vm.addWord( 'mod',function(){var s=vm.dStack, d=s.pop(); s[s.length-1]%=d;});
vm.addWord('/mod',function(){
	var s=vm.dStack, t=s.length-1,n=t-1,sn=s[n],st=s[t],r=s[n]=sn%st; s[t]=(sn-r)/st;});
vm.addWord('and',function(){vm.dStack.push(vm.dStack.pop()&vm.dStack.pop());});
vm.addWord('or' ,function(){vm.dStack.push(vm.dStack.pop()|vm.dStack.pop());});
vm.addWord('xor',function(){vm.dStack.push(vm.dStack.pop()^vm.dStack.pop());});
vm.addWord('hex'    ,function(){vm.base=16;});
vm.addWord('decimal',function(){vm.base=10;});
vm.addWord('binary' ,function(){vm.base= 2;});
vm.addWord('.r',function(){
	var m=vm.dStack.pop(),n=""+vm.dStack.pop();vm.type("         ".substr(0,m-n.length)+n);});
//////////////////////////////////////////////////////////////////////////////////////////// v2
vm.addWord(':',function(){
	vm.newName=vm.nextToken(),vm.newXt=vm.cArea.length,vm.compiling=1;});
vm.addWord('immediate',function(){vm.words[vm.words.length-1].immediate=1;});
vm.addWord(';',function(){
	vm.compileCode("exit"),vm.compiling=0;vm.addWord(vm.newName,vm.newXt);},'immediate');
vm.addWord('r@',function(){vm.dStack.push(vm.rStack[vm.rStack.length-1]);});
vm.addWord('i' ,function(){vm.dStack.push(vm.rStack[vm.rStack.length-1].i);});
vm.addWord('>r',function(){vm.rStack.push(vm.dStack.pop());});
vm.addWord('for',function(){
	if(vm.compiling){
		vm.compileCode(">r");vm.dStack.push({name:"for",at:vm.cArea.length}); return;
	}
	var nTib=vm.nTib,i=vm.dStack.pop();vm.rStack.push({name:"for",nTib:nTib,i:i});
},'immediate');
vm.addWord('doNext',function(){
	var i=vm.rStack.pop();
	if(i){vm.rStack.push(i-1),vm.ip+=vm.cArea[vm.ip];}
	else vm.ip++;});
vm.addWord('next',function(){ var o; // why this was broken ??????????????????
	if(vm.compiling) o=vm.dStack.pop();
	else o=vm.rStack[vm.rStack.length-1];
	var	t=typeof o;
	if(t!=="object" || o.name!=="for"){
		vm.panic("no for to match next"); return;
	}
	if(vm.compiling){
		vm.compileCode("doNext",o.at-vm.cArea.length-1); return;
	}
	if(--o.i>=0)vm.nTib=o.nTib;
	else        vm.rStack.pop();
},'immediate');
vm.addWord('next',function(){ var o;
	if(vm.compiling) o=vm.dStack.pop();
	else o=vm.rStack[vm.rStack.length-1];
	var	t=typeof o;
	if(t!=="object" || o.name!=="for"){
		vm.panic("no for to match next"); return;
	}
	if(vm.compiling){
		vm.compileCode("doNext",o.at-vm.cArea.length-1); return;
	}
	if(--o.i>=0)vm.nTib=o.nTib;
	else        vm.rStack.pop();
},'immediate');
vm.addWord('drop',function(){vm.dStack.pop();});
vm.addWord('dup',function(){vm.dStack.push(vm.dStack[vm.dStack.length-1]);});
vm.addWord('over',function(){vm.dStack.push(vm.dStack[vm.dStack.length-2]);});
vm.addWord('emit',function(){vm.type(String.fromCharCode(vm.dStack.pop()));});
vm.addWord('branch',function(){vm.ip+=vm.cArea[vm.ip];});
vm.addWord('zBranch',function(){
	if(vm.dStack.pop())vm.ip++; else vm.ip+=vm.cArea[vm.ip];});
vm.addWord('if',function(){
	if(vm.compiling){
		vm.compileCode("zBranch",0);
		vm.dStack.push({name:"if",at:vm.cArea.length-1});return;
	}
	if(vm.dStack.pop)return;
	var e=vm.tib.substr(vm.nTib).indexOf("else");
	var t=vm.tib.substr(vm.nTib).indexOf("then");
	if(e){
		if(t && t<e)
			vm.nTib+=t+4; // zbranch to then
		else
			vm.nTib+=e+4; // zbranch to else
	} else if(t)
		vm.nTib+=t+4; // zbranch to then
	else
		vm.panic("no else or then to match if");
},'immediate');
vm.addWord('else',function () {var t;
  if(vm.compiling){
   var o=vm.dStack.pop();t=typeof o;
   if(t!=="object" || o.name!="if"){
        vm.panic("there is no if to match else");return;
   }
   var i=o.at; vm.compileCode("branch",0);
   vm.dStack.push({name:"else",at:vm.cArea.length-1});
   vm.cArea[i]=vm.cArea.length-i;return;
  }
  t=vm.tib.substr(vm.nTib).indexOf("then");
  if(t) vm.nTib+=t+4; // branch to then
  else vm.panic("there is no then to match else");
},'immediate');
vm.addWord('then',function () {
  if(!vm.compiling) return;
  var o=vm.dStack.pop(),t=typeof o, n=o.name;
  if(t!=="object" || (n!="if" && n!="else" && n!="aft")){
        vm.panic("no if, else, aft to match then");return;
  }
  var i=o.at; vm.cArea[i]=vm.cArea.length-i;
},'immediate');
vm.addWord('aft',function () {var t;
  if(vm.compiling){
   var s=vm.dStack,o=s[s.length-1];t=typeof o;
   if(t!=="object" || o.name!=="for"){
        vm.panic("no for to match aft");return;
   }
   var i=o.at;
   vm.compileCode("zBranch",0);
   vm.dStack.push({name:"aft",at:vm.cArea.length-1});
   return;
  }
  t=vm.tib.substr(vm.nTib).indexOf("then");
  if(t) vm.nTib+=t+4; // branch to then
  else vm.panic("there is no then to match aft");
},'immediate');
vm.addWord('?dup',function () {var s=vm.dStack, d=s[s.length-1]; if(d)s.push(d);});
vm.addWord('0=',function () {var s=vm.dStack,m=s.length-1; s[m]=!s[m];});
vm.addWord('begin',function () {
  if(vm.compiling){
        vm.dStack.push({name:"begin",at:vm.cArea.length-1});
        return;
  }
  vm.rStack.push({name:"begin",nTib:vm.nTib});
},'immediate');
vm.addWord('again',function () {    var o;
  if(vm.compiling)
        o=vm.dStack.pop();
  else
        o=vm.rStack[vm.rStack.length-1];
  var    t=typeof o;
  if(t!=="object" || o.name!=="begin"){
        vm.panic("no begin to match again");
        return;
  }
  if(vm.compiling){
        var i=o.at;
        vm.compileCode( "branch", i-vm.cArea.length);
        return;
  }
  vm.nTib=o.nTib;
},'immediate');
vm.addWord('until',function () {    var o;
  if(vm.compiling)
        o=vm.dStack.pop();
  else
        o=vm.rStack[vm.rStack.length-1];
  var    t=typeof o;
  if(t!=="object" || o.name!=="begin"){
        vm.panic("no begin to match until");
        return;
  }
  if(vm.compiling){
        var i=o.at;
        vm.compileCode( "zBranch", i-vm.cArea.length);
        return;
  }
  if(vm.dStack.pop()) vm.rStack.pop();
  else vm.nTib=o.nTib;
},'immediate');
vm.addWord('while',function () {    var s,o;
  s=vm.dStack,o=s[s.length-1],t=typeof o;
  if(t!=="object" || o.name!=="begin"){
        vm.panic("no begin to match while");return;
  }
  var i=o.at; vm.compileCode("zBranch",0);
  vm.dStack.push({name:"while",at:vm.cArea.length-1});
},'immediate');
vm.addWord('repeat',function () {
  var o=vm.dStack.pop(),t=typeof o;
  if(t!=="object" || o.name!=="while"){
        vm.panic("no while to match repeat");return;
  }
  var i=o.at; o=vm.dStack.pop(),t=typeof o;
  if(t!=="object" || o.name!=="begin"){
        vm.panic("no begin to match repeat");return;
  }
  vm.compileCode("branch",o.at-vm.cArea.length);
  vm.cArea[i]=vm.cArea.length-i;
},'immediate');
//////////////////////////////////////////////////////////////////////////////////////////// v3
vm.addWord('ms',function (n) {
  var m= n===undefined ? vm.dStack.pop() : n;
  vm.waiting=1, setTimeout(vm.resumeExec,m);
});
vm.addWord('append',function(){var d,t,o,a,v;
  d=vm.dStack.pop(), t=vm.nextToken(), vm[t]=o=d.append(t), a=vm.nextToken();
  while(a){
	t=vm.nextToken();
    if(a==='text')o.text(' '+t);
    else o.attr(a,t);
	if(vm.c==='\n')break;
	a=vm.nextToken();
  }
});

