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
	var vm		=this;
    var error	= 0	;	// flag to abort source code interpreting
	var words	=[0];	// collect all words defined
	var nameWord={ };	// nameWord[name]=word
	var ip		= 0 ;	// instruction pointer to run high level colon definition		//	v2
	var cArea	=[0];	// code area to hold high level colon definition				//	v2
	var rStack	=[ ];	// return stack to return from high level colon definition		//	v2
	var dStack	=[ ];	// data stack													//	v1
		vm.base	=10 ;	// number conversion base										//	v1
	var clear=vm.clear=function(){ // clear data stack									//	v1
		dStack=vm.dStack=[];															//	v1
	};
	vm.out='';																			//	v1
	vm.uob='';	// user output buffer 				// 20141209 sam
	var cr=vm.cr=function(msg){ var t=msg;	// get t=msg to print
		if(t===undefined){
			t=vm.tob;
			vm.uob+=vm.uob?'\r\n':'', vm.uob+=t;	// 20141209 sam
			vm.lastTob=t, vm.tob='';	// if no msg, get t=tob and clear tob
		}
		console.log(t);								// print t (fixed)
	};
	var intToString=function(t){
		return typeof(t)==='number' && t%1===0 && vm.base!==10 ? t.toString(vm.base) : t;
	}
	var type=vm.type=function(msg){	// send msg to terminal output buffer
		var a=msg||dStack.pop();					// pop from data stack if no msg
		a= Array.isArray(a) ? a.map(function(t){return intToString(t)}).join(' ') : intToString(a);	//	v1
		vm.tob+=a;									// append t to terminal output buffer
    };
    function showErr(msg){var m=msg;
		if(vm.err) m='<'+vm.err+'>'+m+'</'+vm.err+'>'; cr(m);
    }
    function showTst(msg){var m=msg;
		if(vm.tst) m='<'+vm.tst+'>'+m+'</'+vm.tst+'>'; cr(m);
    }
    function showOk (msg){var m=msg;
		if(vm.ok ) m='<'+vm.ok +'>'+m+'</'+vm.ok +'>'; cr(m);
    }
    function showInp(msg){var m=msg;
		if(vm.inp) m='<'+vm.inp+'>'+m+'</'+vm.inp+'>'; cr(m);
    }
	function panic(msg){	// clear tob, show error msg, and abort
		showErr(msg),error=msg,vm.compiling=0; }
    function nextChar(){	// get a char  from tib
        return vm.nTib<vm.tib.length ? vm.tib.charAt(vm.nTib++) : '';	// get null if eoi
    }
    function nextToken(){	// get a token from tib
		vm.token=''; var c=nextChar();
        while (c===' '||c==='\t'||c==='\r') c=nextChar();	// skip white-space
        while (c){
			if(c===' '||c==='\t'||c==='\r'||c==='\n')break;	// break if white-space
			vm.token+=c, c=nextChar();							// pick up none-white-space
		}
	//	if(c==='\n')vm.nTib--;
		vm.c=c;
        return vm.token;
    }
    function compile(v) {	// compile v to code area									//	v2
		var c= v===undefined ? vm.cArea[vm.ip++] : v;									//	v2
	//	cr('compile '+JSON.stringify(c));			// for tracing only					//	v2
		vm.cArea.push(c);																//	v2
    }																					//	v2
    function compileCode(name,v) {	// compile named word to code area					//	v2
		var n= name===undefined ? nextToken() : name;									//	v2
		var w=vm.nameWord[n];															//	v2
		compile(w);																		//	v2
		if(v!==undefined)vm.compile(v);                                                 //	v2
    }																					//	v2
    function resumeCall() {	// resume inner loop interpreting of compiled code			//	v3
		while(vm.ip && !vm.waiting){													//	v3
			var w=vm.cArea[vm.ip];														//	v3
		//	cr(vm.ip+': '+w.name+' '+vm.dStack);										//	v3
			vm.ip++, execute(w);														//	v3
		}																				//	v3
	//	if(vm.ip) cr('wait at '+vm.ip);													//	v3
    }																					//	v3
    function call(addr) {	// interpret compiled code at addr of cArea					//	v2
	//	cr(vm.ip+' --> rStack '+vm.rStack.length+': '+vm.rStack.join());				//	v2
		vm.rStack.push(vm.ip), vm.ip=addr;												//	v2
		resumeCall();																	//	v3
    }																					//	v2
    function exit() {	// return from colon definition									//	v2
		vm.ip=vm.rStack.pop();// pop ip from return stack								//	v2
	//	cr(vm.ip+' <-- rStack '+vm.rStack.length+': '+vm.rStack.join());				//	v2
    }																					//	v2
    function execute(w){            // execute or compile a word
		var immediate=w.immediate, compiling=immediate?0:vm.compiling;					//	v2
	//	var s=(compiling?'compile':'execute')+' word ';	// for tracing only				//	v2
		if(typeof w==='object'){
			if(compiling){																//	v2
			//	cr('compile '+w.name);         // for tracing only          			//	v2
				compile(w);																//	v2
			} else {																	//	v2
				var x=w.xt, t=typeof x;
			//	s+=w.id+':\t'+w.name;					// for tracing only
				if(t==="function"){
				//	cr(s+' primitive');					// for tracing only
					x();				// execute function x directly
				} else if(t==="number"){												//	v2
				//	cr(s+' colon at '+x);				// for tracing only				//	v2
					call(x);			// execute colon definition at x				//	v2
				} else {
					panic('error execute:\t'+w.name+' w.xt='+x+' ????');// xt undefined
				}
			}																			//	v2
		} else {
          panic('error execute:\t'+w+' ????');						// w is not a word
		}
    }
    function extData(tkn){
    }
    function extQuotedStr(tkn){
    	var c=tkn.charAt(0);
		if(c==='"'){																	//	v1
			t=vm.tib.substr(0,vm.nTib-1);												//	v1
			var L=Math.max(t.lastIndexOf(' '),t.lastIndexOf('\t'))+1;	// current "	//	v1
			t=vm.tib.substr(L+1);										// rest tib		//	v1
			var i=t.indexOf(c);											// next    "	//	v1
			var p=t.charAt(i-1);										// prev char	//	v1
			n=t.charAt(i+1);											// next char	//	v1
			if(i>=0 && p!=='\\' && (n===' '||n==='\t'||n==='\r'||n==='\n'||n==='')){	//	v1
				vm.nTib=L+i+2, t=vm.tib.substr(L+1,i);									//	v1
				return t;				// "abc" return string abc ( alow space	)		//	v1
			}																			//	v1
		}																				//	v1
		if(c==="'" && c===tkn.charAt(tkn.length-1)){									//	v1
			return tkn.substr(1,tkn.length-2);		// 'abc' return string abc no space //	v1
		}
		return extData(tkn);
	}
    function extNum(tkn){
		if(tkn.charAt(0)==='$'){
			n=parseInt(tkn.substr(1),16);
			if('$'+n.toString(16)===tkn) return n;	// hexa decimal integer number
		}
		if(vm.base===10){
	    	n=parseFloat(tkn);
			if(n.toString()===tkn) return n; 		// decimal floating number
		} else {
			n=parseInt(tkn,vm.base);
			if(n.toString(vm.base)===tkn) return n; // any based integer numbe
		}
    }																					//	v1
	function resumeExec(){		// resume outer source code interpreting loop			//	v3
        vm.waiting=0;                                                                   //  v3
        if(vm.ip){																		//	v3
        //  cr('resumeCall at ',vm.ip);
            resumeCall();		// resume inner compiled code interpreting				//	v3
        }																				//	v3
    //  cr('resume times',++vm.rTimes);	// for tracing only                 			//	v3
    	var tkn,n;
        do{	vm.token=tkn=nextToken();	// get a token
			if (tkn) {					// break if no more
				var w=nameWord[tkn];	// get word if token is already defined
				if (w) execute(w);		// execute or compile the word
				else {	n=extNum(tkn);													//	v1
					if(n===undefined)
						n=extQuotedStr(tkn);											//	v1
					if(n===undefined)
						n=vm.extData(tkn);												//	v1
					if(n===undefined){													//	v1
						panic("? "+vm.token+" undefined"); return; // token undefined
					}																	//	v1
					if(vm.compiling){													//	v2
					//	cr('compile doLit '+n);
						compileCode('doLit',n);											//	v2
	                }else																//	v2
						dStack.push(n);													//	v1
				}
			}
		//	cr('dStack ===> '+dStack.length+':\t['+dStack.join()+']');					//	v1
        } while(!vm.waiting && vm.nTib<vm.tib.length);
		if(!vm.waiting && !vm.compiling){
			var ok=' ok';
			if(vm.ok) ok=' <'+vm.ok+'>'+ok+'</'+vm.ok+'>';								//	v3
			cr(ok);
			console.log(vm.out), vm.out='';
		}
    }
    var lastCmd='';
    function exec(cmd){		// source code interpreting
    	if(cmd!==lastCmd)
			lastCmd=cmd, vm.cmds.push(cmd), vm.iCmd=vm.cmds.length;	// for tracing only
		if(vm.inp)vm.showInp(cmd);
		else cr('source input '+vm.cmds.length+':\t'+cmd);			// for tracing only
		error=0, vm.tib=cmd, vm.nTib=0, vm.tob=vm.uob='';		// 20141209 sam
		resumeExec(), vm.error=error;					// 20141209 sam	//	v3 
        return vm.uob+vm.tob;				// return vm.uob 	// 20141209 sam
	}
	function addWord(name,xt,immediate){	// 
		var id=words.length, w={name:name,xt:xt,id:id}; words.push(w), nameWord[name]=w;
		if(immediate)w.immediate=1;
		cr('defined '+id+': '+name+(typeof xt==='function'? ' as primitive' : ''));
	}
	var endCode='end-code';
	function code(){ // code <name> d( -- )	// low level definition as a new word
		var i,t;
		vm.newName=nextToken();
		t=vm.tib.substr(vm.nTib),i=t.indexOf(endCode),vm.nTib+=i+endCode.length;
		if(i<0){
			panic("missing end-code for low level "+vm.token+" definition");
			return;
		}
		var txt='('+t.substr(0,i)+')';
		var newXt=eval(txt);//eval(txt);
		addWord(vm.newName,newXt);
	}
	function doLit(){ // doLit ( -- n ) //												//	v2
		vm.dStack.push(vm.cArea[vm.ip++]);												//	v2
	}																					//	v2
	vm.cmds=[];
	vm.iCmd=-1;
	vm.showErr=showErr;
	vm.showTst=showTst;
	vm.showOk =showOk ;
	vm.showInp=showInp;
	vm.panic=panic        ;																//	v2
	vm.nextToken=nextToken;																//	v2
	vm.compileCode=compileCode;															//	v2
	vm.compile=compile    ;																//	v2
	vm.nameWord=nameWord  ;																//	v2
	vm.ip=ip              ;																//	v2
	vm.cArea=cArea        ;																//	v2
	vm.rStack=rStack      ;																//	v2
	vm.dStack=dStack      ;																//	v1
	vm.extData=extData    ;																//	v3
	vm.rTimes	= 0 ;	// resume times													//	v3
	vm.waiting	= 0 ;	// flag of   waiting mode										//	v3
	vm.compiling= 0 ;	// flag of compiling mode										//	v2
	vm.resumeExec=resumeExec;                                                           //  v3
	vm.tob		=''	;	// initial terminal output buffer
    vm.tib		=''	;	// initial terminal  input buffer (source code)
    vm.nTib		= 0	;	// offset of tib processed
	vm.exec	=exec         ;
	vm.words=words        ;
	vm.code =code         ;
	vm.doLit=doLit        ;
	vm.exit =exit         ;
	vm.addWord=addWord    ;
}
window.vm=new JeForthVM();
//  vm is now creaded and ready to use.