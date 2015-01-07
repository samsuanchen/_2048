(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"C:\\ksana2015\\_2048\\index.js":[function(require,module,exports){
var runtime=require("ksana2015-webruntime");
runtime.boot("_2048",function(){
	var Main=React.createElement(require("./src/main.jsx"));
	ksana.mainComponent=React.render(Main,document.getElementById("main"));
});
},{"./src/main.jsx":"C:\\ksana2015\\_2048\\src\\main.jsx","ksana2015-webruntime":"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\index.js"}],"C:\\ksana2015\\_2048\\src\\main.jsx":[function(require,module,exports){
var kse=require("ksana-search");
var maincomponent = React.createClass({displayName: "maincomponent",
  getInitialState:function() {
  	return {result:[]};
  },
  componentDidMount:function() {
  	kse.search("sample","head",{range:{start:0}},function(err,data){
  		this.setState({result:data.excerpt});
  	},this);
  },
  render: function() {
    return React.createElement("div", null, "Hello ", this.state.result);
  }
});
module.exports=maincomponent;
},{"ksana-search":"C:\\ksana2015\\node_modules\\ksana-search\\index.js"}],"C:\\ksana2015\\node_modules\\ksana-analyzer\\configs.js":[function(require,module,exports){
var tokenizers=require('./tokenizers');
var normalizeTbl=null;
var setNormalizeTable=function(tbl,obj) {
	if (!obj) {
		obj={};
		for (var i=0;i<tbl.length;i++) {
			var arr=tbl[i].split("=");
			obj[arr[0]]=arr[1];
		}
	}
	normalizeTbl=obj;
	return obj;
}
var normalize1=function(token) {
	if (!token) return "";
	token=token.replace(/[ \n\.,，。！．「」：；、]/g,'').trim();
	if (!normalizeTbl) return token;
	if (token.length==1) {
		return normalizeTbl[token] || token;
	} else {
		for (var i=0;i<token.length;i++) {
			token[i]=normalizeTbl[token[i]] || token[i];
		}
		return token;
	}
}
var isSkip1=function(token) {
	var t=token.trim();
	return (t=="" || t=="　" || t=="※" || t=="\n");
}
var normalize_tibetan=function(token) {
	return token.replace(/[།་ ]/g,'').trim();
}

var isSkip_tibetan=function(token) {
	var t=token.trim();
	return (t=="" || t=="　" ||  t=="\n");	
}
var simple1={
	func:{
		tokenize:tokenizers.simple
		,setNormalizeTable:setNormalizeTable
		,normalize: normalize1
		,isSkip:	isSkip1
	}
	
}
var tibetan1={
	func:{
		tokenize:tokenizers.tibetan
		,setNormalizeTable:setNormalizeTable
		,normalize:normalize_tibetan
		,isSkip:isSkip_tibetan
	}
}
module.exports={"simple1":simple1,"tibetan1":tibetan1}
},{"./tokenizers":"C:\\ksana2015\\node_modules\\ksana-analyzer\\tokenizers.js"}],"C:\\ksana2015\\node_modules\\ksana-analyzer\\index.js":[function(require,module,exports){
/* 
  custom func for building and searching ydb

  keep all version
  
  getAPI(version); //return hash of functions , if ver is omit , return lastest
	
  postings2Tree      // if version is not supply, get lastest
  tokenize(text,api) // convert a string into tokens(depends on other api)
  normalizeToken     // stemming and etc
  isSpaceChar        // not a searchable token
  isSkipChar         // 0 vpos

  for client and server side
  
*/
var configs=require("./configs");
var config_simple="simple1";
var optimize=function(json,config) {
	config=config||config_simple;
	return json;
}

var getAPI=function(config) {
	config=config||config_simple;
	var func=configs[config].func;
	func.optimize=optimize;
	if (config=="simple1") {
		//add common custom function here
	} else if (config=="tibetan1") {

	} else throw "config "+config +"not supported";

	return func;
}

module.exports={getAPI:getAPI};
},{"./configs":"C:\\ksana2015\\node_modules\\ksana-analyzer\\configs.js"}],"C:\\ksana2015\\node_modules\\ksana-analyzer\\tokenizers.js":[function(require,module,exports){
var tibetan =function(s) {
	//continuous tsheg grouped into same token
	//shad and space grouped into same token
	var offset=0;
	var tokens=[],offsets=[];
	s=s.replace(/\r\n/g,'\n').replace(/\r/g,'\n');
	var arr=s.split('\n');

	for (var i=0;i<arr.length;i++) {
		var last=0;
		var str=arr[i];
		str.replace(/[།་ ]+/g,function(m,m1){
			tokens.push(str.substring(last,m1)+m);
			offsets.push(offset+last);
			last=m1+m.length;
		});
		if (last<str.length) {
			tokens.push(str.substring(last));
			offsets.push(last);
		}
		if (i===arr.length-1) break;
		tokens.push('\n');
		offsets.push(offset+last);
		offset+=str.length+1;
	}

	return {tokens:tokens,offsets:offsets};
};
var isSpace=function(c) {
	return (c==" ") ;//|| (c==",") || (c==".");
}
var isCJK =function(c) {return ((c>=0x3000 && c<=0x9FFF) 
|| (c>=0xD800 && c<0xDC00) || (c>=0xFF00) ) ;}
var simple1=function(s) {
	var offset=0;
	var tokens=[],offsets=[];
	s=s.replace(/\r\n/g,'\n').replace(/\r/g,'\n');
	arr=s.split('\n');

	var pushtoken=function(t,off) {
		var i=0;
		if (t.charCodeAt(0)>255) {
			while (i<t.length) {
				var c=t.charCodeAt(i);
				offsets.push(off+i);
				tokens.push(t[i]);
				if (c>=0xD800 && c<=0xDFFF) {
					tokens[tokens.length-1]+=t[i]; //extension B,C,D
				}
				i++;
			}
		} else {
			tokens.push(t);
			offsets.push(off);	
		}
	}
	for (var i=0;i<arr.length;i++) {
		var last=0,sp="";
		str=arr[i];
		str.replace(/[_0-9A-Za-z]+/g,function(m,m1){
			while (isSpace(sp=str[last]) && last<str.length) {
				tokens[tokens.length-1]+=sp;
				last++;
			}
			pushtoken(str.substring(last,m1)+m , offset+last);
			offsets.push(offset+last);
			last=m1+m.length;
		});

		if (last<str.length) {
			while (isSpace(sp=str[last]) && last<str.length) {
				tokens[tokens.length-1]+=sp;
				last++;
			}
			pushtoken(str.substring(last), offset+last);
			
		}		
		offsets.push(offset+last);
		offset+=str.length+1;
		if (i===arr.length-1) break;
		tokens.push('\n');
	}

	return {tokens:tokens,offsets:offsets};

};

var simple=function(s) {
	var token='';
	var tokens=[], offsets=[] ;
	var i=0; 
	var lastspace=false;
	var addtoken=function() {
		if (!token) return;
		tokens.push(token);
		offsets.push(i);
		token='';
	}
	while (i<s.length) {
		var c=s.charAt(i);
		var code=s.charCodeAt(i);
		if (isCJK(code)) {
			addtoken();
			token=c;
			if (code>=0xD800 && code<0xDC00) { //high sorragate
				token+=s.charAt(i+1);i++;
			}
			addtoken();
		} else {
			if (c=='&' || c=='<' || c=='?' || c=="," || c=="."
			|| c=='|' || c=='~' || c=='`' || c==';' 
			|| c=='>' || c==':' 
			|| c=='=' || c=='@'  || c=="-" 
			|| c==']' || c=='}'  || c==")" 
			//|| c=='{' || c=='}'|| c=='[' || c==']' || c=='(' || c==')'
			|| code==0xf0b || code==0xf0d // tibetan space
			|| (code>=0x2000 && code<=0x206f)) {
				addtoken();
				if (c=='&' || c=='<'){ // || c=='{'|| c=='('|| c=='[') {
					var endchar='>';
					if (c=='&') endchar=';'
					//else if (c=='{') endchar='}';
					//else if (c=='[') endchar=']';
					//else if (c=='(') endchar=')';

					while (i<s.length && s.charAt(i)!=endchar) {
						token+=s.charAt(i);
						i++;
					}
					token+=endchar;
					addtoken();
				} else {
					token=c;
					addtoken();
				}
				token='';
			} else {
				if (c==" ") {
					token+=c;
					lastspace=true;
				} else {
					if (lastspace) addtoken();
					lastspace=false;
					token+=c;
				}
			}
		}
		i++;
	}
	addtoken();
	return {tokens:tokens,offsets:offsets};
}
module.exports={simple:simple,tibetan:tibetan};
},{}],"C:\\ksana2015\\node_modules\\ksana-database\\bsearch.js":[function(require,module,exports){
var indexOfSorted = function (array, obj, near) { 
  var low = 0,
  high = array.length;
  while (low < high) {
    var mid = (low + high) >> 1;
    if (array[mid]==obj) return mid;
    array[mid] < obj ? low = mid + 1 : high = mid;
  }
  if (near) return low;
  else if (array[low]==obj) return low;else return -1;
};
var indexOfSorted_str = function (array, obj, near) { 
  var low = 0,
  high = array.length;
  while (low < high) {
    var mid = (low + high) >> 1;
    if (array[mid]==obj) return mid;
    (array[mid].localeCompare(obj)<0) ? low = mid + 1 : high = mid;
  }
  if (near) return low;
  else if (array[low]==obj) return low;else return -1;
};


var bsearch=function(array,value,near) {
	var func=indexOfSorted;
	if (typeof array[0]=="string") func=indexOfSorted_str;
	return func(array,value,near);
}
var bsearchNear=function(array,value) {
	return bsearch(array,value,true);
}

module.exports=bsearch;//{bsearchNear:bsearchNear,bsearch:bsearch};
},{}],"C:\\ksana2015\\node_modules\\ksana-database\\index.js":[function(require,module,exports){
var KDE=require("./kde");
//currently only support node.js fs, ksanagap native fs, html5 file system
//use socket.io to read kdb from remote server in future
module.exports=KDE;
},{"./kde":"C:\\ksana2015\\node_modules\\ksana-database\\kde.js"}],"C:\\ksana2015\\node_modules\\ksana-database\\kde.js":[function(require,module,exports){
/* Ksana Database Engine

   2015/1/2 , 
   move to ksana-database
   simplified by removing document support and socket.io support


*/
var pool={},localPool={};
var apppath="";
var bsearch=require("./bsearch");
var Kdb=require('ksana-jsonrom');
var kdbs=[]; //available kdb , id and absolute path
var strsep="\uffff";
var kdblisted=false;
/*
var _getSync=function(paths,opts) {
	var out=[];
	for (var i in paths) {
		out.push(this.getSync(paths[i],opts));	
	}
	return out;
}
*/
var _gets=function(paths,opts,cb) { //get many data with one call

	if (!paths) return ;
	if (typeof paths=='string') {
		paths=[paths];
	}
	var engine=this, output=[];

	var makecb=function(path){
		return function(data){
				if (!(data && typeof data =='object' && data.__empty)) output.push(data);
				engine.get(path,opts,taskqueue.shift());
		};
	};

	var taskqueue=[];
	for (var i=0;i<paths.length;i++) {
		if (typeof paths[i]=="null") { //this is only a place holder for key data already in client cache
			output.push(null);
		} else {
			taskqueue.push(makecb(paths[i]));
		}
	};

	taskqueue.push(function(data){
		output.push(data);
		cb.apply(engine.context||engine,[output,paths]); //return to caller
	});

	taskqueue.shift()({__empty:true}); //run the task
}

var getFileRange=function(i) {
	var engine=this;

	var filesegcount=engine.get(["filesegcount"]);
	if (filesegcount) {
		if (i==0) {
			return {start:0,end:filesegcount[0]-1};
		} else {
			return {start:filesegcount[i-1],end:filesegcount[i]-1};
		}
	}
	//old buggy code
	var filenames=engine.get(["filenames"]);
	var fileoffsets=engine.get(["fileoffsets"]);
	var segoffsets=engine.get(["segoffsets"]);
	var segnames=engine.get(["segnames"]);
	var filestart=fileoffsets[i], fileend=fileoffsets[i+1]-1;

	var start=bsearch(segoffsets,filestart,true);
	//if (segOffsets[start]==fileStart) start--;
	
	//work around for jiangkangyur
	while (segNames[start+1]=="_") start++;

  //if (i==0) start=0; //work around for first file
	var end=bsearch(segoffsets,fileend,true);
	return {start:start,end:end};
}

var getfileseg=function(absoluteseg) {
	var fileoffsets=this.get(["fileoffsets"]);
	var segoffsets=this.get(["segoffsets"]);
	var segoffset=segOffsets[absoluteseg];
	var file=bsearch(fileOffsets,segoffset,true)-1;

	var fileStart=fileoffsets[file];
	var start=bsearch(segoffsets,fileStart,true);	

	var seg=absoluteseg-start-1;
	return {file:file,seg:seg};
}
//return array of object of nfile nseg given segname
var findSeg=function(segname) {
	var segnames=this.get("segnames");
	var out=[];
	for (var i=0;i<segnames.length;i++) {
		if (segnames[i]==segname) {
			var fileseg=getfileseg.apply(this,[i]);
			out.push({file:fileseg.file,seg:fileseg.seg,absseg:i});
		}
	}
	return out;
}
var getFileSegOffsets=function(i) {
	var segoffsets=this.get("segoffsets");
	var range=getFileRange.apply(this,[i]);
	return segoffsets.slice(range.start,range.end+1);
}

var getFileSegNames=function(i) {
	var range=getFileRange.apply(this,[i]);
	var segnames=this.get("segnames");
	return segnames.slice(range.start,range.end+1);
}
var localengine_get=function(path,opts,cb) {
	var engine=this;
	if (typeof opts=="function") {
		cb=opts;
		opts={recursive:false};
	}
	if (!path) {
		if (cb) cb(null);
		return null;
	}

	if (typeof cb!="function") {
		return engine.kdb.get(path,opts);
	}

	if (typeof path=="string") {
		return engine.kdb.get([path],opts,cb);
	} else if (typeof path[0] =="string") {
		return engine.kdb.get(path,opts,cb);
	} else if (typeof path[0] =="object") {
		return _gets.apply(engine,[path,opts,cb]);
	} else {
		engine.kdb.get([],opts,function(data){
			cb(data[0]);//return top level keys
		});
	}
};	

var getPreloadField=function(user) {
	var preload=[["meta"],["filenames"],["fileoffsets"],["segnames"],["segoffsets"],["filesegcount"]];
	//["tokens"],["postingslen"] kse will load it
	if (user && user.length) { //user supply preload
		for (var i=0;i<user.length;i++) {
			if (preload.indexOf(user[i])==-1) {
				preload.push(user[i]);
			}
		}
	}
	return preload;
}
var createLocalEngine=function(kdb,opts,cb,context) {
	var engine={kdb:kdb, queryCache:{}, postingCache:{}, cache:{}};

	if (typeof context=="object") engine.context=context;
	engine.get=localengine_get;

	engine.segOffset=segOffset;
	engine.fileOffset=fileOffset;
	engine.getFileSegNames=getFileSegNames;
	engine.getFileSegOffsets=getFileSegOffsets;
	engine.getFileRange=getFileRange;
	engine.findSeg=findSeg;
	//only local engine allow getSync
	//if (kdb.fs.getSync) engine.getSync=engine.kdb.getSync;
	
	//speedy native functions
	if (kdb.fs.mergePostings) {
		engine.mergePostings=kdb.fs.mergePostings.bind(kdb.fs);
	}
	
	var setPreload=function(res) {
		engine.dbname=res[0].name;
		//engine.customfunc=customfunc.getAPI(res[0].config);
		engine.ready=true;
	}

	var preload=getPreloadField(opts.preload);
	var opts={recursive:true};
	//if (typeof cb=="function") {
		_gets.apply(engine,[ preload, opts,function(res){
			setPreload(res);
			cb.apply(engine.context,[engine]);
		}]);
	//} else {
	//	setPreload(_getSync.apply(engine,[preload,opts]));
	//}
	return engine;
}

var segOffset=function(segname) {
	var engine=this;
	if (arguments.length>1) throw "argument : segname ";

	var segNames=engine.get("segnames");
	var segOffsets=engine.get("segoffsets");

	var i=segNames.indexOf(segname);
	return (i>-1)?segOffsets[i]:0;
}
var fileOffset=function(fn) {
	var engine=this;
	var filenames=engine.get("filenames");
	var offsets=engine.get("fileoffsets");
	var i=filenames.indexOf(fn);
	if (i==-1) return null;
	return {start: offsets[i], end:offsets[i+1]};
}

var folderOffset=function(folder) {
	var engine=this;
	var start=0,end=0;
	var filenames=engine.get("filenames");
	var offsets=engine.get("fileoffsets");
	for (var i=0;i<filenames.length;i++) {
		if (filenames[i].substring(0,folder.length)==folder) {
			if (!start) start=offsets[i];
			end=offsets[i];
		} else if (start) break;
	}
	return {start:start,end:end};
}

 //TODO delete directly from kdb instance
 //kdb.free();
var closeLocal=function(kdbid) {
	var engine=localPool[kdbid];
	if (engine) {
		engine.kdb.free();
		delete localPool[kdbid];
	}
}
var close=function(kdbid) {
	var engine=pool[kdbid];
	if (engine) {
		engine.kdb.free();
		delete pool[kdbid];
	}
}

var getLocalTries=function(kdbfn) {
	if (!kdblisted) {
		kdbs=require("./listkdb")();
		kdblisted=true;
	}

	var kdbid=kdbfn.replace('.kdb','');
	var tries= ["./"+kdbid+".kdb"
	           ,"../"+kdbid+".kdb"
	];

	for (var i=0;i<kdbs.length;i++) {
		if (kdbs[i][0]==kdbid) {
			tries.push(kdbs[i][1]);
		}
	}
	return tries;
}
var openLocalKsanagap=function(kdbid,opts,cb,context) {
	var kdbfn=kdbid;
	var tries=getLocalTries(kdbfn);

	for (var i=0;i<tries.length;i++) {
		if (fs.existsSync(tries[i])) {
			//console.log("kdb path: "+nodeRequire('path').resolve(tries[i]));
			var kdb=new Kdb.open(tries[i],function(err,kdb){
				if (err) {
					cb.apply(context,[err]);
				} else {
					createLocalEngine(kdb,opts,function(engine){
						localPool[kdbid]=engine;
						cb.apply(context||engine.context,[0,engine]);
					},context);
				}
			});
			return null;
		}
	}
	if (cb) cb.apply(context,[kdbid+" not found"]);
	return null;

}
var openLocalNode=function(kdbid,opts,cb,context) {
	var fs=require('fs');
	var tries=getLocalTries(kdbid);

	for (var i=0;i<tries.length;i++) {
		if (fs.existsSync(tries[i])) {

			new Kdb.open(tries[i],function(err,kdb){
				if (err) {
					cb.apply(context||engine.content,[err]);
				} else {
					createLocalEngine(kdb,opts,function(engine){
							localPool[kdbid]=engine;
							cb.apply(context||engine.context,[0,engine]);
					},context);
				}
			});
			return null;
		}
	}
	if (cb) cb.apply(context,[kdbid+" not found"]);
	return null;
}

var openLocalHtml5=function(kdbid,opts,cb,context) {	
	var engine=localPool[kdbid];
	var kdbfn=kdbid;
	if (kdbfn.indexOf(".kdb")==-1) kdbfn+=".kdb";
	new Kdb.open(kdbfn,function(err,handle){
		if (err) {
			cb.apply(context,[err]);
		} else {
			createLocalEngine(handle,opts,function(engine){
				localPool[kdbid]=engine;
				cb.apply(context||engine.context,[0,engine]);
			},context);
		}
	});
}
//omit cb for syncronize open
var openLocal=function(kdbid,opts,cb,context)  {
	if (typeof opts=="function") { //no opts
		if (typeof cb=="object") context=cb;
		cb=opts;
		opts={};
	}

	var engine=localPool[kdbid];
	if (engine) {
		if (cb) cb.apply(context||engine.context,[0,engine]);
		return engine;
	}

	var platform=require("./platform").getPlatform();
	if (platform=="node-webkit" || platform=="node") {
		openLocalNode(kdbid,opts,cb,context);
	} else if (platform=="html5" || platform=="chrome"){
		openLocalHtml5(kdbid,opts,cb,context);		
	} else {
		openLocalKsanagap(kdbid,opts,cb,context);	
	}
}
var setPath=function(path) {
	apppath=path;
	console.log("set path",path)
}

var enumKdb=function(cb,context){
	return kdbs.map(function(k){return k[0]});
}

module.exports={open:openLocal,setPath:setPath, close:closeLocal, enumKdb:enumKdb};
},{"./bsearch":"C:\\ksana2015\\node_modules\\ksana-database\\bsearch.js","./listkdb":"C:\\ksana2015\\node_modules\\ksana-database\\listkdb.js","./platform":"C:\\ksana2015\\node_modules\\ksana-database\\platform.js","fs":false,"ksana-jsonrom":"C:\\ksana2015\\node_modules\\ksana-jsonrom\\index.js"}],"C:\\ksana2015\\node_modules\\ksana-database\\listkdb.js":[function(require,module,exports){
/* return array of dbid and absolute path*/
var listkdb_html5=function() {
	throw "not implement yet";
	require("ksana-jsonrom").html5fs.readdir(function(kdbs){
			cb.apply(this,[kdbs]);
	},context||this);		

}

var listkdb_node=function(){
	var fs=require("fs");
	var path=require("path")
	var parent=path.resolve(process.cwd(),"..");
	var files=fs.readdirSync(parent);
	var output=[];
	files.map(function(f){
		var subdir=parent+path.sep+f;
		var stat=fs.statSync(subdir );
		if (stat.isDirectory()) {
			var subfiles=fs.readdirSync(subdir);
			for (var i=0;i<subfiles.length;i++) {
				var file=subfiles[i];
				var idx=file.indexOf(".kdb");
				if (idx>-1&&idx==file.length-4) {
					output.push([ file.substr(0,file.length-4), subdir+path.sep+file]);
				}
			}
		}
	})
	return output;
}

var listkdb=function() {
	var platform=require("./platform").getPlatform();
	var files=[];
	if (platform=="node" || platform=="node-webkit") {
		files=listkdb_node();
	} else {
		throw "not implement yet";
	}
	return files;
}
module.exports=listkdb;
},{"./platform":"C:\\ksana2015\\node_modules\\ksana-database\\platform.js","fs":false,"ksana-jsonrom":"C:\\ksana2015\\node_modules\\ksana-jsonrom\\index.js","path":false}],"C:\\ksana2015\\node_modules\\ksana-database\\platform.js":[function(require,module,exports){
var getPlatform=function() {
	if (typeof ksanagap=="undefined") {
		platform="node";
	} else {
		platform=ksanagap.platform;
	}
	return platform;
}
module.exports={getPlatform:getPlatform};
},{}],"C:\\ksana2015\\node_modules\\ksana-jsonrom\\html5read.js":[function(require,module,exports){

/* emulate filesystem on html5 browser */
/* emulate filesystem on html5 browser */
var read=function(handle,buffer,offset,length,position,cb) {//buffer and offset is not used
	var xhr = new XMLHttpRequest();
	xhr.open('GET', handle.url , true);
	var range=[position,length+position-1];
	xhr.setRequestHeader('Range', 'bytes='+range[0]+'-'+range[1]);
	xhr.responseType = 'arraybuffer';
	xhr.send();
	xhr.onload = function(e) {
		var that=this;
		setTimeout(function(){
			cb(0,that.response.byteLength,that.response);
		},0);
	}; 
}
var close=function(handle) {}
var fstatSync=function(handle) {
	throw "not implement yet";
}
var fstat=function(handle,cb) {
	throw "not implement yet";
}
var _open=function(fn_url,cb) {
		var handle={};
		if (fn_url.indexOf("filesystem:")==0){
			handle.url=fn_url;
			handle.fn=fn_url.substr( fn_url.lastIndexOf("/")+1);
		} else {
			handle.fn=fn_url;
			var url=API.files.filter(function(f){ return (f[0]==fn_url)});
			if (url.length) handle.url=url[0][1];
			else cb(null);
		}
		cb(handle);
}
var open=function(fn_url,cb) {
		if (!API.initialized) {init(1024*1024,function(){
			_open.apply(this,[fn_url,cb]);
		},this)} else _open.apply(this,[fn_url,cb]);
}
var load=function(filename,mode,cb) {
	open(filename,mode,cb,true);
}
function errorHandler(e) {
	console.error('Error: ' +e.name+ " "+e.message);
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
var API={
	read:read
	,readdir:readdir
	,open:open
	,close:close
	,fstatSync:fstatSync
	,fstat:fstat
}
module.exports=API;
},{}],"C:\\ksana2015\\node_modules\\ksana-jsonrom\\index.js":[function(require,module,exports){
module.exports={
	open:require("./kdb")
	,create:require("./kdbw")
}

},{"./kdb":"C:\\ksana2015\\node_modules\\ksana-jsonrom\\kdb.js","./kdbw":"C:\\ksana2015\\node_modules\\ksana-jsonrom\\kdbw.js"}],"C:\\ksana2015\\node_modules\\ksana-jsonrom\\kdb.js":[function(require,module,exports){
/*
	KDB version 3.0 GPL
	yapcheahshen@gmail.com
	2013/12/28
	asyncronize version of yadb

  remove dependency of Q, thanks to
  http://stackoverflow.com/questions/4234619/how-to-avoid-long-nesting-of-asynchronous-functions-in-node-js

  2015/1/2
  moved to ksanaforge/ksana-jsonrom
  add err in callback for node.js compliant
*/
var Kfs=null;

if (typeof ksanagap=="undefined") {
	Kfs=require('./kdbfs');			
} else {
	if (ksanagap.platform=="ios") {
		Kfs=require("./kdbfs_ios");
	} else if (ksanagap.platform=="node-webkit") {
		Kfs=require("./kdbfs");
	} else if (ksanagap.platform=="chrome") {
		Kfs=require("./kdbfs");
	} else {
		Kfs=require("./kdbfs_android");
	}
		
}


var DT={
	uint8:'1', //unsigned 1 byte integer
	int32:'4', // signed 4 bytes integer
	utf8:'8',  
	ucs2:'2',
	bool:'^', 
	blob:'&',
	utf8arr:'*', //shift of 8
	ucs2arr:'@', //shift of 2
	uint8arr:'!', //shift of 1
	int32arr:'$', //shift of 4
	vint:'`',
	pint:'~',	

	array:'\u001b',
	object:'\u001a' 
	//ydb start with object signature,
	//type a ydb in command prompt shows nothing
}
var verbose=0, readLog=function(){};
var _readLog=function(readtype,bytes) {
	console.log(readtype,bytes,"bytes");
}
if (verbose) readLog=_readLog;
var strsep="\uffff";
var Create=function(path,opts,cb) {
	/* loadxxx functions move file pointer */
	// load variable length int
	if (typeof opts=="function") {
		cb=opts;
		opts={};
	}

	
	var loadVInt =function(opts,blocksize,count,cb) {
		//if (count==0) return [];
		var that=this;

		this.fs.readBuf_packedint(opts.cur,blocksize,count,true,function(o){
			//console.log("vint");
			opts.cur+=o.adv;
			cb.apply(that,[o.data]);
		});
	}
	var loadVInt1=function(opts,cb) {
		var that=this;
		loadVInt.apply(this,[opts,6,1,function(data){
			//console.log("vint1");
			cb.apply(that,[data[0]]);
		}])
	}
	//for postings
	var loadPInt =function(opts,blocksize,count,cb) {
		var that=this;
		this.fs.readBuf_packedint(opts.cur,blocksize,count,false,function(o){
			//console.log("pint");
			opts.cur+=o.adv;
			cb.apply(that,[o.data]);
		});
	}
	// item can be any type (variable length)
	// maximum size of array is 1TB 2^40
	// structure:
	// signature,5 bytes offset, payload, itemlengths
	var getArrayLength=function(opts,cb) {
		var that=this;
		var dataoffset=0;

		this.fs.readUI8(opts.cur,function(len){
			var lengthoffset=len*4294967296;
			opts.cur++;
			that.fs.readUI32(opts.cur,function(len){
				opts.cur+=4;
				dataoffset=opts.cur; //keep this
				lengthoffset+=len;
				opts.cur+=lengthoffset;

				loadVInt1.apply(that,[opts,function(count){
					loadVInt.apply(that,[opts,count*6,count,function(sz){						
						cb({count:count,sz:sz,offset:dataoffset});
					}]);
				}]);
				
			});
		});
	}

	var loadArray = function(opts,blocksize,cb) {
		var that=this;
		getArrayLength.apply(this,[opts,function(L){
				var o=[];
				var endcur=opts.cur;
				opts.cur=L.offset;

				if (opts.lazy) { 
						var offset=L.offset;
						L.sz.map(function(sz){
							o[o.length]=strsep+offset.toString(16)
								   +strsep+sz.toString(16);
							offset+=sz;
						})
				} else {
					var taskqueue=[];
					for (var i=0;i<L.count;i++) {
						taskqueue.push(
							(function(sz){
								return (
									function(data){
										if (typeof data=='object' && data.__empty) {
											 //not pushing the first call
										}	else o.push(data);
										opts.blocksize=sz;
										load.apply(that,[opts, taskqueue.shift()]);
									}
								);
							})(L.sz[i])
						);
					}
					//last call to child load
					taskqueue.push(function(data){
						o.push(data);
						opts.cur=endcur;
						cb.apply(that,[o]);
					});
				}

				if (opts.lazy) cb.apply(that,[o]);
				else {
					taskqueue.shift()({__empty:true});
				}
			}
		])
	}		
	// item can be any type (variable length)
	// support lazy load
	// structure:
	// signature,5 bytes offset, payload, itemlengths, 
	//                    stringarray_signature, keys
	var loadObject = function(opts,blocksize,cb) {
		var that=this;
		var start=opts.cur;
		getArrayLength.apply(this,[opts,function(L) {
			opts.blocksize=blocksize-opts.cur+start;
			load.apply(that,[opts,function(keys){ //load the keys
				if (opts.keys) { //caller ask for keys
					keys.map(function(k) { opts.keys.push(k)});
				}

				var o={};
				var endcur=opts.cur;
				opts.cur=L.offset;
				if (opts.lazy) { 
					var offset=L.offset;
					for (var i=0;i<L.sz.length;i++) {
						//prefix with a \0, impossible for normal string
						o[keys[i]]=strsep+offset.toString(16)
							   +strsep+L.sz[i].toString(16);
						offset+=L.sz[i];
					}
				} else {
					var taskqueue=[];
					for (var i=0;i<L.count;i++) {
						taskqueue.push(
							(function(sz,key){
								return (
									function(data){
										if (typeof data=='object' && data.__empty) {
											//not saving the first call;
										} else {
											o[key]=data; 
										}
										opts.blocksize=sz;
										if (verbose) readLog("key",key);
										load.apply(that,[opts, taskqueue.shift()]);
									}
								);
							})(L.sz[i],keys[i-1])

						);
					}
					//last call to child load
					taskqueue.push(function(data){
						o[keys[keys.length-1]]=data;
						opts.cur=endcur;
						cb.apply(that,[o]);
					});
				}
				if (opts.lazy) cb.apply(that,[o]);
				else {
					taskqueue.shift()({__empty:true});
				}
			}]);
		}]);
	}

	//item is same known type
	var loadStringArray=function(opts,blocksize,encoding,cb) {
		var that=this;
		this.fs.readStringArray(opts.cur,blocksize,encoding,function(o){
			opts.cur+=blocksize;
			cb.apply(that,[o]);
		});
	}
	var loadIntegerArray=function(opts,blocksize,unitsize,cb) {
		var that=this;
		loadVInt1.apply(this,[opts,function(count){
			var o=that.fs.readFixedArray(opts.cur,count,unitsize,function(o){
				opts.cur+=count*unitsize;
				cb.apply(that,[o]);
			});
		}]);
	}
	var loadBlob=function(blocksize,cb) {
		var o=this.fs.readBuf(this.cur,blocksize);
		this.cur+=blocksize;
		return o;
	}	
	var loadbysignature=function(opts,signature,cb) {
		  var blocksize=opts.blocksize||this.fs.size; 
			opts.cur+=this.fs.signature_size;
			var datasize=blocksize-this.fs.signature_size;
			//basic types
			if (signature===DT.int32) {
				opts.cur+=4;
				this.fs.readI32(opts.cur-4,cb);
			} else if (signature===DT.uint8) {
				opts.cur++;
				this.fs.readUI8(opts.cur-1,cb);
			} else if (signature===DT.utf8) {
				var c=opts.cur;opts.cur+=datasize;
				this.fs.readString(c,datasize,'utf8',cb);
			} else if (signature===DT.ucs2) {
				var c=opts.cur;opts.cur+=datasize;
				this.fs.readString(c,datasize,'ucs2',cb);	
			} else if (signature===DT.bool) {
				opts.cur++;
				this.fs.readUI8(opts.cur-1,function(data){cb(!!data)});
			} else if (signature===DT.blob) {
				loadBlob(datasize,cb);
			}
			//variable length integers
			else if (signature===DT.vint) {
				loadVInt.apply(this,[opts,datasize,datasize,cb]);
			}
			else if (signature===DT.pint) {
				loadPInt.apply(this,[opts,datasize,datasize,cb]);
			}
			//simple array
			else if (signature===DT.utf8arr) {
				loadStringArray.apply(this,[opts,datasize,'utf8',cb]);
			}
			else if (signature===DT.ucs2arr) {
				loadStringArray.apply(this,[opts,datasize,'ucs2',cb]);
			}
			else if (signature===DT.uint8arr) {
				loadIntegerArray.apply(this,[opts,datasize,1,cb]);
			}
			else if (signature===DT.int32arr) {
				loadIntegerArray.apply(this,[opts,datasize,4,cb]);
			}
			//nested structure
			else if (signature===DT.array) {
				loadArray.apply(this,[opts,datasize,cb]);
			}
			else if (signature===DT.object) {
				loadObject.apply(this,[opts,datasize,cb]);
			}
			else {
				console.error('unsupported type',signature,opts)
				cb.apply(this,[null]);//make sure it return
				//throw 'unsupported type '+signature;
			}
	}

	var load=function(opts,cb) {
		opts=opts||{}; // this will served as context for entire load procedure
		opts.cur=opts.cur||0;
		var that=this;
		this.fs.readSignature(opts.cur, function(signature){
			loadbysignature.apply(that,[opts,signature,cb])
		});
		return this;
	}
	var CACHE=null;
	var KEY={};
	var ADDRESS={};
	var reset=function(cb) {
		if (!CACHE) {
			load.apply(this,[{cur:0,lazy:true},function(data){
				CACHE=data;
				cb.call(this);
			}]);	
		} else {
			cb.call(this);
		}
	}

	var exists=function(path,cb) {
		if (path.length==0) return true;
		var key=path.pop();
		var that=this;
		get.apply(this,[path,false,function(data){
			if (!path.join(strsep)) return (!!KEY[key]);
			var keys=KEY[path.join(strsep)];
			path.push(key);//put it back
			if (keys) cb.apply(that,[keys.indexOf(key)>-1]);
			else cb.apply(that,[false]);
		}]);
	}

	var getSync=function(path) {
		if (!CACHE) return undefined;	
		var o=CACHE;
		for (var i=0;i<path.length;i++) {
			var r=o[path[i]];
			if (typeof r=="undefined") return null;
			o=r;
		}
		return o;
	}
	var get=function(path,opts,cb) {
		if (typeof path=='undefined') path=[];
		if (typeof path=="string") path=[path];
		//opts.recursive=!!opts.recursive;
		if (typeof opts=="function") {
			cb=opts;node
			opts={};
		}
		var that=this;
		if (typeof cb!='function') return getSync(path);

		reset.apply(this,[function(){
			var o=CACHE;
			if (path.length==0) {
				if (opts.address) {
					cb([0,that.fs.size]);
				} else {
					cb(Object.keys(CACHE));	
				}
				return;
			} 
			
			var pathnow="",taskqueue=[],newopts={},r=null;
			var lastkey="";

			for (var i=0;i<path.length;i++) {
				var task=(function(key,k){

					return (function(data){
						if (!(typeof data=='object' && data.__empty)) {
							if (typeof o[lastkey]=='string' && o[lastkey][0]==strsep) o[lastkey]={};
							o[lastkey]=data; 
							o=o[lastkey];
							r=data[key];
							KEY[pathnow]=opts.keys;								
						} else {
							data=o[key];
							r=data;
						}

						if (typeof r==="undefined") {
							taskqueue=null;
							cb.apply(that,[r]); //return empty value
						} else {							
							if (parseInt(k)) pathnow+=strsep;
							pathnow+=key;
							if (typeof r=='string' && r[0]==strsep) { //offset of data to be loaded
								var p=r.substring(1).split(strsep).map(function(item){return parseInt(item,16)});
								var cur=p[0],sz=p[1];
								newopts.lazy=!opts.recursive || (k<path.length-1) ;
								newopts.blocksize=sz;newopts.cur=cur,newopts.keys=[];
								lastkey=key; //load is sync in android
								if (opts.address && taskqueue.length==1) {
									ADDRESS[pathnow]=[cur,sz];
									taskqueue.shift()(null,ADDRESS[pathnow]);
								} else {
									load.apply(that,[newopts, taskqueue.shift()]);
								}
							} else {
								if (opts.address && taskqueue.length==1) {
									taskqueue.shift()(null,ADDRESS[pathnow]);
								} else {
									taskqueue.shift().apply(that,[r]);
								}
							}
						}
					})
				})
				(path[i],i);
				
				taskqueue.push(task);
			}

			if (taskqueue.length==0) {
				cb.apply(that,[o]);
			} else {
				//last call to child load
				taskqueue.push(function(data,cursz){
					if (opts.address) {
						cb.apply(that,[cursz]);
					} else{
						var key=path[path.length-1];
						o[key]=data; KEY[pathnow]=opts.keys;
						cb.apply(that,[data]);
					}
				});
				taskqueue.shift()({__empty:true});			
			}

		}]); //reset
	}
	// get all keys in given path
	var getkeys=function(path,cb) {
		if (!path) path=[]
		var that=this;
		get.apply(this,[path,false,function(){
			if (path && path.length) {
				cb.apply(that,[KEY[path.join(strsep)]]);
			} else {
				cb.apply(that,[Object.keys(CACHE)]); 
				//top level, normally it is very small
			}
		}]);
	}

	var setupapi=function() {
		this.load=load;
//		this.cur=0;
		this.cache=function() {return CACHE};
		this.key=function() {return KEY};
		this.free=function() {
			CACHE=null;
			KEY=null;
			this.fs.free();
		}
		this.setCache=function(c) {CACHE=c};
		this.keys=getkeys;
		this.get=get;   // get a field, load if needed
		this.exists=exists;
		this.DT=DT;
		
		//install the sync version for node
		//if (typeof process!="undefined") require("./kdb_sync")(this);
		//if (cb) setTimeout(cb.bind(this),0);
		var that=this;
		var err=0;
		if (cb) {
			setTimeout(function(){
				cb(err,that);	
			},0);
		}
	}
	var that=this;
	var kfs=new Kfs(path,opts,function(err){
		if (err) {
			setTimeout(function(){
				cb(err,0);
			},0);
			return null;
		} else {
			that.size=this.size;
			setupapi.call(that);			
		}
	});
	this.fs=kfs;
	return this;
}

Create.datatypes=DT;

if (module) module.exports=Create;
//return Create;

},{"./kdbfs":"C:\\ksana2015\\node_modules\\ksana-jsonrom\\kdbfs.js","./kdbfs_android":"C:\\ksana2015\\node_modules\\ksana-jsonrom\\kdbfs_android.js","./kdbfs_ios":"C:\\ksana2015\\node_modules\\ksana-jsonrom\\kdbfs_ios.js"}],"C:\\ksana2015\\node_modules\\ksana-jsonrom\\kdbfs.js":[function(require,module,exports){
/* node.js and html5 file system abstraction layer*/
try {
	var fs=require("fs");
	var Buffer=require("buffer").Buffer;
} catch (e) {
	var fs=require('./html5read');
	var Buffer=function(){ return ""};
	var html5fs=true; 	
}
var signature_size=1;
var verbose=0, readLog=function(){};
var _readLog=function(readtype,bytes) {
	console.log(readtype,bytes,"bytes");
}
if (verbose) readLog=_readLog;

var unpack_int = function (ar, count , reset) {
   count=count||ar.length;
  var r = [], i = 0, v = 0;
  do {
	var shift = 0;
	do {
	  v += ((ar[i] & 0x7F) << shift);
	  shift += 7;	  
	} while (ar[++i] & 0x80);
	r.push(v); if (reset) v=0;
	count--;
  } while (i<ar.length && count);
  return {data:r, adv:i };
}
var Open=function(path,opts,cb) {
	opts=opts||{};

	var readSignature=function(pos,cb) {
		var buf=new Buffer(signature_size);
		var that=this;
		fs.read(this.handle,buf,0,signature_size,pos,function(err,len,buffer){
			if (html5fs) var signature=String.fromCharCode((new Uint8Array(buffer))[0])
			else var signature=buffer.toString('utf8',0,signature_size);
			cb.apply(that,[signature]);
		});
	}

	//this is quite slow
	//wait for StringView +ArrayBuffer to solve the problem
	//https://groups.google.com/a/chromium.org/forum/#!topic/blink-dev/ylgiNY_ZSV0
	//if the string is always ucs2
	//can use Uint16 to read it.
	//http://updates.html5rocks.com/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
	var decodeutf8 = function (utftext) {
		var string = "";
		var i = 0;
		var c=0,c1 = 0, c2 = 0 , c3=0;
		for (var i=0;i<utftext.length;i++) {
			if (utftext.charCodeAt(i)>127) break;
		}
		if (i>=utftext.length) return utftext;

		while ( i < utftext.length ) {
			c = utftext.charCodeAt(i);
			if (c < 128) {
				string += utftext[i];
				i++;
			} else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			} else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
		}
		return string;
	}

	var readString= function(pos,blocksize,encoding,cb) {
		encoding=encoding||'utf8';
		var buffer=new Buffer(blocksize);
		var that=this;
		fs.read(this.handle,buffer,0,blocksize,pos,function(err,len,buffer){
			readLog("string",len);
			if (html5fs) {
				if (encoding=='utf8') {
					var str=decodeutf8(String.fromCharCode.apply(null, new Uint8Array(buffer)))
				} else { //ucs2 is 3 times faster
					var str=String.fromCharCode.apply(null, new Uint16Array(buffer))	
				}
				
				cb.apply(that,[str]);
			} 
			else cb.apply(that,[buffer.toString(encoding)]);	
		});
	}

	//work around for chrome fromCharCode cannot accept huge array
	//https://code.google.com/p/chromium/issues/detail?id=56588
	var buf2stringarr=function(buf,enc) {
		if (enc=="utf8") 	var arr=new Uint8Array(buf);
		else var arr=new Uint16Array(buf);
		var i=0,codes=[],out=[],s="";
		while (i<arr.length) {
			if (arr[i]) {
				codes[codes.length]=arr[i];
			} else {
				s=String.fromCharCode.apply(null,codes);
				if (enc=="utf8") out[out.length]=decodeutf8(s);
				else out[out.length]=s;
				codes=[];				
			}
			i++;
		}
		
		s=String.fromCharCode.apply(null,codes);
		if (enc=="utf8") out[out.length]=decodeutf8(s);
		else out[out.length]=s;

		return out;
	}
	var readStringArray = function(pos,blocksize,encoding,cb) {
		var that=this,out=null;
		if (blocksize==0) return [];
		encoding=encoding||'utf8';
		var buffer=new Buffer(blocksize);
		fs.read(this.handle,buffer,0,blocksize,pos,function(err,len,buffer){
			if (html5fs) {
				readLog("stringArray",buffer.byteLength);

				if (encoding=='utf8') {
					out=buf2stringarr(buffer,"utf8");
				} else { //ucs2 is 3 times faster
					out=buf2stringarr(buffer,"ucs2");
				}
			} else {
				readLog("stringArray",buffer.length);
				out=buffer.toString(encoding).split('\0');
			} 	
			cb.apply(that,[out]);
		});
	}
	var readUI32=function(pos,cb) {
		var buffer=new Buffer(4);
		var that=this;
		fs.read(this.handle,buffer,0,4,pos,function(err,len,buffer){
			readLog("ui32",len);
			if (html5fs){
				//v=(new Uint32Array(buffer))[0];
				var v=new DataView(buffer).getUint32(0, false)
				cb(v);
			}
			else cb.apply(that,[buffer.readInt32BE(0)]);	
		});		
	}

	var readI32=function(pos,cb) {
		var buffer=new Buffer(4);
		var that=this;
		fs.read(this.handle,buffer,0,4,pos,function(err,len,buffer){
			readLog("i32",len);
			if (html5fs){
				var v=new DataView(buffer).getInt32(0, false)
				cb(v);
			}
			else  	cb.apply(that,[buffer.readInt32BE(0)]);	
		});
	}
	var readUI8=function(pos,cb) {
		var buffer=new Buffer(1);
		var that=this;

		fs.read(this.handle,buffer,0,1,pos,function(err,len,buffer){
			readLog("ui8",len);
			if (html5fs)cb( (new Uint8Array(buffer))[0]) ;
			else  			cb.apply(that,[buffer.readUInt8(0)]);	
			
		});
	}
	var readBuf=function(pos,blocksize,cb) {
		var that=this;
		var buf=new Buffer(blocksize);
		fs.read(this.handle,buf,0,blocksize,pos,function(err,len,buffer){
			readLog("buf",len);
			var buff=new Uint8Array(buffer)
			cb.apply(that,[buff]);
		});
	}
	var readBuf_packedint=function(pos,blocksize,count,reset,cb) {
		var that=this;
		readBuf.apply(this,[pos,blocksize,function(buffer){
			cb.apply(that,[unpack_int(buffer,count,reset)]);	
		}]);
		
	}
	var readFixedArray_html5fs=function(pos,count,unitsize,cb) {
		var func=null;
		if (unitsize===1) {
			func='getUint8';//Uint8Array;
		} else if (unitsize===2) {
			func='getUint16';//Uint16Array;
		} else if (unitsize===4) {
			func='getUint32';//Uint32Array;
		} else throw 'unsupported integer size';

		fs.read(this.handle,null,0,unitsize*count,pos,function(err,len,buffer){
			readLog("fix array",len);
			var out=[];
			if (unitsize==1) {
				out=new Uint8Array(buffer);
			} else {
				for (var i = 0; i < len / unitsize; i++) { //endian problem
				//	out.push( func(buffer,i*unitsize));
					out.push( v=new DataView(buffer)[func](i,false) );
				}
			}

			cb.apply(that,[out]);
		});
	}
	// signature, itemcount, payload
	var readFixedArray = function(pos ,count, unitsize,cb) {
		var func=null;
		var that=this;
		
		if (unitsize* count>this.size && this.size)  {
			console.log("array size exceed file size",this.size)
			return;
		}
		
		if (html5fs) return readFixedArray_html5fs.apply(this,[pos,count,unitsize,cb]);

		var items=new Buffer( unitsize* count);
		if (unitsize===1) {
			func=items.readUInt8;
		} else if (unitsize===2) {
			func=items.readUInt16BE;
		} else if (unitsize===4) {
			func=items.readUInt32BE;
		} else throw 'unsupported integer size';
		//console.log('itemcount',itemcount,'buffer',buffer);

		fs.read(this.handle,items,0,unitsize*count,pos,function(err,len,buffer){
			readLog("fix array",len);
			var out=[];
			for (var i = 0; i < items.length / unitsize; i++) {
				out.push( func.apply(items,[i*unitsize]));
			}
			cb.apply(that,[out]);
		});
	}

	var free=function() {
		//console.log('closing ',handle);
		fs.closeSync(this.handle);
	}
	var setupapi=function() {
		var that=this;
		this.readSignature=readSignature;
		this.readI32=readI32;
		this.readUI32=readUI32;
		this.readUI8=readUI8;
		this.readBuf=readBuf;
		this.readBuf_packedint=readBuf_packedint;
		this.readFixedArray=readFixedArray;
		this.readString=readString;
		this.readStringArray=readStringArray;
		this.signature_size=signature_size;
		this.free=free;
		if (html5fs) {
			var fn=path;
			if (path.indexOf("filesystem:")==0) fn=path.substr(path.lastIndexOf("/"));
			fs.fs.root.getFile(fn,{},function(entry){
			  entry.getMetadata(function(metadata) { 
				that.size=metadata.size;
				if (cb) setTimeout(cb.bind(that),0);
				});
			});
		} else {
			var stat=fs.fstatSync(this.handle);
			this.stat=stat;
			this.size=stat.size;		
			if (cb)	setTimeout(cb.bind(this,0),0);	
		}
	}

	var that=this;
	if (html5fs) {
		fs.open(path,function(h){
			if (!h) {
				if (cb)	setTimeout(cb.bind(null,"file not found:"+path),0);	
			} else {
				that.handle=h;
				that.html5fs=true;
				setupapi.call(that);
				that.opened=true;				
			}
		})
	} else {
		if (fs.existsSync(path)){
			this.handle=fs.openSync(path,'r');//,function(err,handle){
			this.opened=true;
			setupapi.call(this);
		} else {
			if (cb)	setTimeout(cb.bind(null,"file not found:"+path),0);	
			return null;
		}
	}
	return this;
}
module.exports=Open;
},{"./html5read":"C:\\ksana2015\\node_modules\\ksana-jsonrom\\html5read.js","buffer":false,"fs":false}],"C:\\ksana2015\\node_modules\\ksana-jsonrom\\kdbfs_android.js":[function(require,module,exports){
/*
  JAVA can only return Number and String
	array and buffer return in string format
	need JSON.parse
*/
var verbose=0;

var readSignature=function(pos,cb) {
	if (verbose) console.debug("read signature");
	var signature=kfs.readUTF8String(this.handle,pos,1);
	if (verbose) console.debug(signature,signature.charCodeAt(0));
	cb.apply(this,[signature]);
}
var readI32=function(pos,cb) {
	if (verbose) console.debug("read i32 at "+pos);
	var i32=kfs.readInt32(this.handle,pos);
	if (verbose) console.debug(i32);
	cb.apply(this,[i32]);	
}
var readUI32=function(pos,cb) {
	if (verbose) console.debug("read ui32 at "+pos);
	var ui32=kfs.readUInt32(this.handle,pos);
	if (verbose) console.debug(ui32);
	cb.apply(this,[ui32]);
}
var readUI8=function(pos,cb) {
	if (verbose) console.debug("read ui8 at "+pos); 
	var ui8=kfs.readUInt8(this.handle,pos);
	if (verbose) console.debug(ui8);
	cb.apply(this,[ui8]);
}
var readBuf=function(pos,blocksize,cb) {
	if (verbose) console.debug("read buffer at "+pos+ " blocksize "+blocksize);
	var buf=kfs.readBuf(this.handle,pos,blocksize);
	var buff=JSON.parse(buf);
	if (verbose) console.debug("buffer length"+buff.length);
	cb.apply(this,[buff]);	
}
var readBuf_packedint=function(pos,blocksize,count,reset,cb) {
	if (verbose) console.debug("read packed int at "+pos+" blocksize "+blocksize+" count "+count);
	var buf=kfs.readBuf_packedint(this.handle,pos,blocksize,count,reset);
	var adv=parseInt(buf);
	var buff=JSON.parse(buf.substr(buf.indexOf("[")));
	if (verbose) console.debug("packedInt length "+buff.length+" first item="+buff[0]);
	cb.apply(this,[{data:buff,adv:adv}]);	
}


var readString= function(pos,blocksize,encoding,cb) {
	if (verbose) console.debug("readstring at "+pos+" blocksize " +blocksize+" enc:"+encoding);
	if (encoding=="ucs2") {
		var str=kfs.readULE16String(this.handle,pos,blocksize);
	} else {
		var str=kfs.readUTF8String(this.handle,pos,blocksize);	
	}	 
	if (verbose) console.debug(str);
	cb.apply(this,[str]);	
}

var readFixedArray = function(pos ,count, unitsize,cb) {
	if (verbose) console.debug("read fixed array at "+pos+" count "+count+" unitsize "+unitsize); 
	var buf=kfs.readFixedArray(this.handle,pos,count,unitsize);
	var buff=JSON.parse(buf);
	if (verbose) console.debug("array length"+buff.length);
	cb.apply(this,[buff]);	
}
var readStringArray = function(pos,blocksize,encoding,cb) {
	if (verbose) console.log("read String array at "+pos+" blocksize "+blocksize +" enc "+encoding); 
	encoding = encoding||"utf8";
	var buf=kfs.readStringArray(this.handle,pos,blocksize,encoding);
	//var buff=JSON.parse(buf);
	if (verbose) console.debug("read string array");
	var buff=buf.split("\uffff"); //cannot return string with 0
	if (verbose) console.debug("array length"+buff.length);
	cb.apply(this,[buff]);	
}
var mergePostings=function(positions,cb) {
	var buf=kfs.mergePostings(this.handle,JSON.stringify(positions));
	if (!buf || buf.length==0) return [];
	else return JSON.parse(buf);
}

var free=function() {
	//console.log('closing ',handle);
	kfs.close(this.handle);
}
var Open=function(path,opts,cb) {
	opts=opts||{};
	var signature_size=1;
	var setupapi=function() { 
		this.readSignature=readSignature;
		this.readI32=readI32;
		this.readUI32=readUI32;
		this.readUI8=readUI8;
		this.readBuf=readBuf;
		this.readBuf_packedint=readBuf_packedint;
		this.readFixedArray=readFixedArray;
		this.readString=readString;
		this.readStringArray=readStringArray;
		this.signature_size=signature_size;
		this.mergePostings=mergePostings;
		this.free=free;
		this.size=kfs.getFileSize(this.handle);
		if (verbose) console.log("filesize  "+this.size);
		if (cb)	cb.call(this);
	}

	this.handle=kfs.open(path);
	this.opened=true;
	setupapi.call(this);
	return this;
}

module.exports=Open;
},{}],"C:\\ksana2015\\node_modules\\ksana-jsonrom\\kdbfs_ios.js":[function(require,module,exports){
/*
  JSContext can return all Javascript types.
*/
var verbose=1;

var readSignature=function(pos,cb) {
	if (verbose)  ksanagap.log("read signature at "+pos);
	var signature=kfs.readUTF8String(this.handle,pos,1);
	if (verbose)  ksanagap.log(signature+" "+signature.charCodeAt(0));
	cb.apply(this,[signature]);
}
var readI32=function(pos,cb) {
	if (verbose)  ksanagap.log("read i32 at "+pos);
	var i32=kfs.readInt32(this.handle,pos);
	if (verbose)  ksanagap.log(i32);
	cb.apply(this,[i32]);	
}
var readUI32=function(pos,cb) {
	if (verbose)  ksanagap.log("read ui32 at "+pos);
	var ui32=kfs.readUInt32(this.handle,pos);
	if (verbose)  ksanagap.log(ui32);
	cb.apply(this,[ui32]);
}
var readUI8=function(pos,cb) {
	if (verbose)  ksanagap.log("read ui8 at "+pos); 
	var ui8=kfs.readUInt8(this.handle,pos);
	if (verbose)  ksanagap.log(ui8);
	cb.apply(this,[ui8]);
}
var readBuf=function(pos,blocksize,cb) {
	if (verbose)  ksanagap.log("read buffer at "+pos);
	var buf=kfs.readBuf(this.handle,pos,blocksize);
	if (verbose)  ksanagap.log("buffer length"+buf.length);
	cb.apply(this,[buf]);	
}
var readBuf_packedint=function(pos,blocksize,count,reset,cb) {
	if (verbose)  ksanagap.log("read packed int fast, blocksize "+blocksize+" at "+pos);var t=new Date();
	var buf=kfs.readBuf_packedint(this.handle,pos,blocksize,count,reset);
	if (verbose)  ksanagap.log("return from packedint, time" + (new Date()-t));
	if (typeof buf.data=="string") {
		buf.data=eval("["+buf.data.substr(0,buf.data.length-1)+"]");
	}
	if (verbose)  ksanagap.log("unpacked length"+buf.data.length+" time" + (new Date()-t) );
	cb.apply(this,[buf]);
}


var readString= function(pos,blocksize,encoding,cb) {

	if (verbose)  ksanagap.log("readstring at "+pos+" blocksize "+blocksize+" "+encoding);var t=new Date();
	if (encoding=="ucs2") {
		var str=kfs.readULE16String(this.handle,pos,blocksize);
	} else {
		var str=kfs.readUTF8String(this.handle,pos,blocksize);	
	}
	if (verbose)  ksanagap.log(str+" time"+(new Date()-t));
	cb.apply(this,[str]);	
}

var readFixedArray = function(pos ,count, unitsize,cb) {
	if (verbose)  ksanagap.log("read fixed array at "+pos); var t=new Date();
	var buf=kfs.readFixedArray(this.handle,pos,count,unitsize);
	if (verbose)  ksanagap.log("array length "+buf.length+" time"+(new Date()-t));
	cb.apply(this,[buf]);	
}
var readStringArray = function(pos,blocksize,encoding,cb) {
	//if (verbose)  ksanagap.log("read String array "+blocksize +" "+encoding); 
	encoding = encoding||"utf8";
	if (verbose)  ksanagap.log("read string array at "+pos);var t=new Date();
	var buf=kfs.readStringArray(this.handle,pos,blocksize,encoding);
	if (typeof buf=="string") buf=buf.split("\0");
	//var buff=JSON.parse(buf);
	//var buff=buf.split("\uffff"); //cannot return string with 0
	if (verbose)  ksanagap.log("string array length"+buf.length+" time"+(new Date()-t));
	cb.apply(this,[buf]);
}

var mergePostings=function(positions) {
	var buf=kfs.mergePostings(this.handle,positions);
	if (typeof buf=="string") {
		buf=eval("["+buf.substr(0,buf.length-1)+"]");
	}
	return buf;
}
var free=function() {
	////if (verbose)  ksanagap.log('closing ',handle);
	kfs.close(this.handle);
}
var Open=function(path,opts,cb) {
	opts=opts||{};
	var signature_size=1;
	var setupapi=function() { 
		this.readSignature=readSignature;
		this.readI32=readI32;
		this.readUI32=readUI32;
		this.readUI8=readUI8;
		this.readBuf=readBuf;
		this.readBuf_packedint=readBuf_packedint;
		this.readFixedArray=readFixedArray;
		this.readString=readString;
		this.readStringArray=readStringArray;
		this.signature_size=signature_size;
		this.mergePostings=mergePostings;
		this.free=free;
		this.size=kfs.getFileSize(this.handle);
		if (verbose)  ksanagap.log("filesize  "+this.size);
		if (cb)	cb.call(this);
	}

	this.handle=kfs.open(path);
	this.opened=true;
	setupapi.call(this);
	return this;
}

module.exports=Open;
},{}],"C:\\ksana2015\\node_modules\\ksana-jsonrom\\kdbw.js":[function(require,module,exports){
/*
  convert any json into a binary buffer
  the buffer can be saved with a single line of fs.writeFile
*/

var DT={
	uint8:'1', //unsigned 1 byte integer
	int32:'4', // signed 4 bytes integer
	utf8:'8',  
	ucs2:'2',
	bool:'^', 
	blob:'&',
	utf8arr:'*', //shift of 8
	ucs2arr:'@', //shift of 2
	uint8arr:'!', //shift of 1
	int32arr:'$', //shift of 4
	vint:'`',
	pint:'~',	

	array:'\u001b',
	object:'\u001a' 
	//ydb start with object signature,
	//type a ydb in command prompt shows nothing
}
var key_writing="";//for debugging
var pack_int = function (ar, savedelta) { // pack ar into
  if (!ar || ar.length === 0) return []; // empty array
  var r = [],
  i = 0,
  j = 0,
  delta = 0,
  prev = 0;
  
  do {
	delta = ar[i];
	if (savedelta) {
		delta -= prev;
	}
	if (delta < 0) {
	  console.trace('negative',prev,ar[i])
	  throw 'negetive';
	  break;
	}
	
	r[j++] = delta & 0x7f;
	delta >>= 7;
	while (delta > 0) {
	  r[j++] = (delta & 0x7f) | 0x80;
	  delta >>= 7;
	}
	prev = ar[i];
	i++;
  } while (i < ar.length);
  return r;
}
var Kfs=function(path,opts) {
	
	var handle=null;
	opts=opts||{};
	opts.size=opts.size||65536*2048; 
	console.log('kdb estimate size:',opts.size);
	var dbuf=new Buffer(opts.size);
	var cur=0;//dbuf cursor
	
	var writeSignature=function(value,pos) {
		dbuf.write(value,pos,value.length,'utf8');
		if (pos+value.length>cur) cur=pos+value.length;
		return value.length;
	}
	var writeOffset=function(value,pos) {
		dbuf.writeUInt8(Math.floor(value / (65536*65536)),pos);
		dbuf.writeUInt32BE( value & 0xFFFFFFFF,pos+1);
		if (pos+5>cur) cur=pos+5;
		return 5;
	}
	var writeString= function(value,pos,encoding) {
		encoding=encoding||'ucs2';
		if (value=="") throw "cannot write null string";
		if (encoding==='utf8')dbuf.write(DT.utf8,pos,1,'utf8');
		else if (encoding==='ucs2')dbuf.write(DT.ucs2,pos,1,'utf8');
		else throw 'unsupported encoding '+encoding;
			
		var len=Buffer.byteLength(value, encoding);
		dbuf.write(value,pos+1,len,encoding);
		
		if (pos+len+1>cur) cur=pos+len+1;
		return len+1; // signature
	}
	var writeStringArray = function(value,pos,encoding) {
		encoding=encoding||'ucs2';
		if (encoding==='utf8') dbuf.write(DT.utf8arr,pos,1,'utf8');
		else if (encoding==='ucs2')dbuf.write(DT.ucs2arr,pos,1,'utf8');
		else throw 'unsupported encoding '+encoding;
		
		var v=value.join('\0');
		var len=Buffer.byteLength(v, encoding);
		if (0===len) {
			throw "empty string array " + key_writing;
		}
		dbuf.write(v,pos+1,len,encoding);
		if (pos+len+1>cur) cur=pos+len+1;
		return len+1;
	}
	var writeI32=function(value,pos) {
		dbuf.write(DT.int32,pos,1,'utf8');
		dbuf.writeInt32BE(value,pos+1);
		if (pos+5>cur) cur=pos+5;
		return 5;
	}
	var writeUI8=function(value,pos) {
		dbuf.write(DT.uint8,pos,1,'utf8');
		dbuf.writeUInt8(value,pos+1);
		if (pos+2>cur) cur=pos+2;
		return 2;
	}
	var writeBool=function(value,pos) {
		dbuf.write(DT.bool,pos,1,'utf8');
		dbuf.writeUInt8(Number(value),pos+1);
		if (pos+2>cur) cur=pos+2;
		return 2;
	}		
	var writeBlob=function(value,pos) {
		dbuf.write(DT.blob,pos,1,'utf8');
		value.copy(dbuf, pos+1);
		var written=value.length+1;
		if (pos+written>cur) cur=pos+written;
		return written;
	}		
	/* no signature */
	var writeFixedArray = function(value,pos,unitsize) {
		//console.log('v.len',value.length,items.length,unitsize);
		if (unitsize===1) var func=dbuf.writeUInt8;
		else if (unitsize===4)var func=dbuf.writeInt32BE;
		else throw 'unsupported integer size';
		if (!value.length) {
			throw "empty fixed array "+key_writing;
		}
		for (var i = 0; i < value.length ; i++) {
			func.apply(dbuf,[value[i],i*unitsize+pos])
		}
		var len=unitsize*value.length;
		if (pos+len>cur) cur=pos+len;
		return len;
	}

	this.writeI32=writeI32;
	this.writeBool=writeBool;
	this.writeBlob=writeBlob;
	this.writeUI8=writeUI8;
	this.writeString=writeString;
	this.writeSignature=writeSignature;
	this.writeOffset=writeOffset; //5 bytes offset
	this.writeStringArray=writeStringArray;
	this.writeFixedArray=writeFixedArray;
	Object.defineProperty(this, "buf", {get : function(){ return dbuf; }});
	
	return this;
}

var Create=function(path,opts) {
	opts=opts||{};
	var kfs=new Kfs(path,opts);
	var cur=0;

	var handle={};
	
	//no signature
	var writeVInt =function(arr) {
		var o=pack_int(arr,false);
		kfs.writeFixedArray(o,cur,1);
		cur+=o.length;
	}
	var writeVInt1=function(value) {
		writeVInt([value]);
	}
	//for postings
	var writePInt =function(arr) {
		var o=pack_int(arr,true);
		kfs.writeFixedArray(o,cur,1);
		cur+=o.length;
	}
	
	var saveVInt = function(arr,key) {
		var start=cur;
		key_writing=key;
		cur+=kfs.writeSignature(DT.vint,cur);
		writeVInt(arr);
		var written = cur-start;
		pushitem(key,written);
		return written;		
	}
	var savePInt = function(arr,key) {
		var start=cur;
		key_writing=key;
		cur+=kfs.writeSignature(DT.pint,cur);
		writePInt(arr);
		var written = cur-start;
		pushitem(key,written);
		return written;	
	}

	
	var saveUI8 = function(value,key) {
		var written=kfs.writeUI8(value,cur);
		cur+=written;
		pushitem(key,written);
		return written;
	}
	var saveBool=function(value,key) {
		var written=kfs.writeBool(value,cur);
		cur+=written;
		pushitem(key,written);
		return written;
	}
	var saveI32 = function(value,key) {
		var written=kfs.writeI32(value,cur);
		cur+=written;
		pushitem(key,written);
		return written;
	}	
	var saveString = function(value,key,encoding) {
		encoding=encoding||stringencoding;
		key_writing=key;
		var written=kfs.writeString(value,cur,encoding);
		cur+=written;
		pushitem(key,written);
		return written;
	}
	var saveStringArray = function(arr,key,encoding) {
		encoding=encoding||stringencoding;
		key_writing=key;
		try {
			var written=kfs.writeStringArray(arr,cur,encoding);
		} catch(e) {
			throw e;
		}
		cur+=written;
		pushitem(key,written);
		return written;
	}
	
	var saveBlob = function(value,key) {
		key_writing=key;
		var written=kfs.writeBlob(value,cur);
		cur+=written;
		pushitem(key,written);
		return written;
	}

	var folders=[];
	var pushitem=function(key,written) {
		var folder=folders[folders.length-1];	
		if (!folder) return ;
		folder.itemslength.push(written);
		if (key) {
			if (!folder.keys) throw 'cannot have key in array';
			folder.keys.push(key);
		}
	}	
	var open = function(opt) {
		var start=cur;
		var key=opt.key || null;
		var type=opt.type||DT.array;
		cur+=kfs.writeSignature(type,cur);
		cur+=kfs.writeOffset(0x0,cur); // pre-alloc space for offset
		var folder={
			type:type, key:key,
			start:start,datastart:cur,
			itemslength:[] };
		if (type===DT.object) folder.keys=[];
		folders.push(folder);
	}
	var openObject = function(key) {
		open({type:DT.object,key:key});
	}
	var openArray = function(key) {
		open({type:DT.array,key:key});
	}
	var saveInts=function(arr,key,func) {
		func.apply(handle,[arr,key]);
	}
	var close = function(opt) {
		if (!folders.length) throw 'empty stack';
		var folder=folders.pop();
		//jump to lengths and keys
		kfs.writeOffset( cur-folder.datastart, folder.datastart-5);
		var itemcount=folder.itemslength.length;
		//save lengths
		writeVInt1(itemcount);
		writeVInt(folder.itemslength);
		
		if (folder.type===DT.object) {
			//use utf8 for keys
			cur+=kfs.writeStringArray(folder.keys,cur,'utf8');
		}
		written=cur-folder.start;
		pushitem(folder.key,written);
		return written;
	}
	
	
	var stringencoding='ucs2';
	var stringEncoding=function(newencoding) {
		if (newencoding) stringencoding=newencoding;
		else return stringencoding;
	}
	
	var allnumber_fast=function(arr) {
		if (arr.length<5) return allnumber(arr);
		if (typeof arr[0]=='number'
		    && Math.round(arr[0])==arr[0] && arr[0]>=0)
			return true;
		return false;
	}
	var allstring_fast=function(arr) {
		if (arr.length<5) return allstring(arr);
		if (typeof arr[0]=='string') return true;
		return false;
	}	
	var allnumber=function(arr) {
		for (var i=0;i<arr.length;i++) {
			if (typeof arr[i]!=='number') return false;
		}
		return true;
	}
	var allstring=function(arr) {
		for (var i=0;i<arr.length;i++) {
			if (typeof arr[i]!=='string') return false;
		}
		return true;
	}
	var getEncoding=function(key,encs) {
		var enc=encs[key];
		if (!enc) return null;
		if (enc=='delta' || enc=='posting') {
			return savePInt;
		} else if (enc=="variable") {
			return saveVInt;
		}
		return null;
	}
	var save=function(J,key,opts) {
		opts=opts||{};
		
		if (typeof J=="null" || typeof J=="undefined") {
			throw 'cannot save null value of ['+key+'] folders'+JSON.stringify(folders);
			return;
		}
		var type=J.constructor.name;
		if (type==='Object') {
			openObject(key);
			for (var i in J) {
				save(J[i],i,opts);
				if (opts.autodelete) delete J[i];
			}
			close();
		} else if (type==='Array') {
			if (allnumber_fast(J)) {
				if (J.sorted) { //number array is sorted
					saveInts(J,key,savePInt);	//posting delta format
				} else {
					saveInts(J,key,saveVInt);	
				}
			} else if (allstring_fast(J)) {
				saveStringArray(J,key);
			} else {
				openArray(key);
				for (var i=0;i<J.length;i++) {
					save(J[i],null,opts);
					if (opts.autodelete) delete J[i];
				}
				close();
			}
		} else if (type==='String') {
			saveString(J,key);
		} else if (type==='Number') {
			if (J>=0&&J<256) saveUI8(J,key);
			else saveI32(J,key);
		} else if (type==='Boolean') {
			saveBool(J,key);
		} else if (type==='Buffer') {
			saveBlob(J,key);
		} else {
			throw 'unsupported type '+type;
		}
	}
	
	var free=function() {
		while (folders.length) close();
		kfs.free();
	}
	var currentsize=function() {
		return cur;
	}

	Object.defineProperty(handle, "size", {get : function(){ return cur; }});

	var writeFile=function(fn,opts,cb) {
		if (typeof fs=="undefined") {
			var fs=opts.fs||require('fs');	
		}
		var totalbyte=handle.currentsize();
		var written=0,batch=0;
		
		if (typeof cb=="undefined" || typeof opts=="function") {
			cb=opts;
		}
		opts=opts||{};
		batchsize=opts.batchsize||1024*1024*16; //16 MB

		if (fs.existsSync(fn)) fs.unlinkSync(fn);

		var writeCb=function(total,written,cb,next) {
			return function(err) {
				if (err) throw "write error"+err;
				cb(total,written);
				batch++;
				next();
			}
		}

		var next=function() {
			if (batch<batches) {
				var bufstart=batchsize*batch;
				var bufend=bufstart+batchsize;
				if (bufend>totalbyte) bufend=totalbyte;
				var sliced=kfs.buf.slice(bufstart,bufend);
				written+=sliced.length;
				fs.appendFile(fn,sliced,writeCb(totalbyte,written, cb,next));
			}
		}
		var batches=1+Math.floor(handle.size/batchsize);
		next();
	}
	handle.free=free;
	handle.saveI32=saveI32;
	handle.saveUI8=saveUI8;
	handle.saveBool=saveBool;
	handle.saveString=saveString;
	handle.saveVInt=saveVInt;
	handle.savePInt=savePInt;
	handle.saveInts=saveInts;
	handle.saveBlob=saveBlob;
	handle.save=save;
	handle.openArray=openArray;
	handle.openObject=openObject;
	handle.stringEncoding=stringEncoding;
	//this.integerEncoding=integerEncoding;
	handle.close=close;
	handle.writeFile=writeFile;
	handle.currentsize=currentsize;
	return handle;
}

module.exports=Create;
},{"fs":false}],"C:\\ksana2015\\node_modules\\ksana-search\\boolsearch.js":[function(require,module,exports){
/*
  TODO
  and not

*/

// http://jsfiddle.net/neoswf/aXzWw/
var plist=require('./plist');
function intersect(I, J) {
  var i = j = 0;
  var result = [];

  while( i < I.length && j < J.length ){
     if      (I[i] < J[j]) i++; 
     else if (I[i] > J[j]) j++; 
     else {
       result[result.length]=l[i];
       i++;j++;
     }
  }
  return result;
}

/* return all items in I but not in J */
function subtract(I, J) {
  var i = j = 0;
  var result = [];

  while( i < I.length && j < J.length ){
    if (I[i]==J[j]) {
      i++;j++;
    } else if (I[i]<J[j]) {
      while (I[i]<J[j]) result[result.length]= I[i++];
    } else {
      while(J[j]<I[i]) j++;
    }
  }

  if (j==J.length) {
    while (i<I.length) result[result.length]=I[i++];
  }

  return result;
}

var union=function(a,b) {
	if (!a || !a.length) return b;
	if (!b || !b.length) return a;
    var result = [];
    var ai = 0;
    var bi = 0;
    while (true) {
        if ( ai < a.length && bi < b.length) {
            if (a[ai] < b[bi]) {
                result[result.length]=a[ai];
                ai++;
            } else if (a[ai] > b[bi]) {
                result[result.length]=b[bi];
                bi++;
            } else {
                result[result.length]=a[ai];
                result[result.length]=b[bi];
                ai++;
                bi++;
            }
        } else if (ai < a.length) {
            result.push.apply(result, a.slice(ai, a.length));
            break;
        } else if (bi < b.length) {
            result.push.apply(result, b.slice(bi, b.length));
            break;
        } else {
            break;
        }
    }
    return result;
}
var OPERATION={'include':intersect, 'union':union, 'exclude':subtract};

var boolSearch=function(opts) {
  opts=opts||{};
  ops=opts.op||this.opts.op;
  this.docs=[];
	if (!this.phrases.length) return;
	var r=this.phrases[0].docs;
  /* ignore operator of first phrase */
	for (var i=1;i<this.phrases.length;i++) {
		var op= ops[i] || 'union';
		r=OPERATION[op](r,this.phrases[i].docs);
	}
	this.docs=plist.unique(r);
	return this;
}
module.exports={search:boolSearch}
},{"./plist":"C:\\ksana2015\\node_modules\\ksana-search\\plist.js"}],"C:\\ksana2015\\node_modules\\ksana-search\\bsearch.js":[function(require,module,exports){
arguments[4]["C:\\ksana2015\\node_modules\\ksana-database\\bsearch.js"][0].apply(exports,arguments)
},{}],"C:\\ksana2015\\node_modules\\ksana-search\\excerpt.js":[function(require,module,exports){
var plist=require("./plist");

var getPhraseWidths=function (Q,phraseid,vposs) {
	var res=[];
	for (var i in vposs) {
		res.push(getPhraseWidth(Q,phraseid,vposs[i]));
	}
	return res;
}
var getPhraseWidth=function (Q,phraseid,vpos) {
	var P=Q.phrases[phraseid];
	var width=0,varwidth=false;
	if (P.width) return P.width; // no wildcard
	if (P.termid.length<2) return P.termlength[0];
	var lasttermposting=Q.terms[P.termid[P.termid.length-1]].posting;

	for (var i in P.termid) {
		var T=Q.terms[P.termid[i]];
		if (T.op=='wildcard') {
			width+=T.width;
			if (T.wildcard=='*') varwidth=true;
		} else {
			width+=P.termlength[i];
		}
	}
	if (varwidth) { //width might be smaller due to * wildcard
		var at=plist.indexOfSorted(lasttermposting,vpos);
		var endpos=lasttermposting[at];
		if (endpos-vpos<width) width=endpos-vpos+1;
	}

	return width;
}
/* return [vpos, phraseid, phrasewidth, optional_tagname] by slot range*/
var hitInRange=function(Q,startvpos,endvpos) {
	var res=[];
	if (!Q || !Q.rawresult || !Q.rawresult.length) return res;
	for (var i=0;i<Q.phrases.length;i++) {
		var P=Q.phrases[i];
		if (!P.posting) continue;
		var s=plist.indexOfSorted(P.posting,startvpos);
		var e=plist.indexOfSorted(P.posting,endvpos);
		var r=P.posting.slice(s,e+1);
		var width=getPhraseWidths(Q,i,r);

		res=res.concat(r.map(function(vpos,idx){ return [vpos,width[idx],i] }));
	}
	// order by vpos, if vpos is the same, larger width come first.
	// so the output will be
	// <tag1><tag2>one</tag2>two</tag1>
	//TODO, might cause overlap if same vpos and same width
	//need to check tag name
	res.sort(function(a,b){return a[0]==b[0]? b[1]-a[1] :a[0]-b[0]});

	return res;
}

var tagsInRange=function(Q,renderTags,startvpos,endvpos) {
	var res=[];
	if (typeof renderTags=="string") renderTags=[renderTags];

	renderTags.map(function(tag){
		var starts=Q.engine.get(["fields",tag+"_start"]);
		var ends=Q.engine.get(["fields",tag+"_end"]);
		if (!starts) return;

		var s=plist.indexOfSorted(starts,startvpos);
		var e=s;
		while (e<starts.length && starts[e]<endvpos) e++;
		var opentags=starts.slice(s,e);

		s=plist.indexOfSorted(ends,startvpos);
		e=s;
		while (e<ends.length && ends[e]<endvpos) e++;
		var closetags=ends.slice(s,e);

		opentags.map(function(start,idx) {
			res.push([start,closetags[idx]-start,tag]);
		})
	});
	// order by vpos, if vpos is the same, larger width come first.
	res.sort(function(a,b){return a[0]==b[0]? b[1]-a[1] :a[0]-b[0]});

	return res;
}

/*
given a vpos range start, file, convert to filestart, fileend
   filestart : starting file
   start   : vpos start
   showfile: how many files to display
   showpage: how many pages to display

output:
   array of fileid with hits
*/
var getFileWithHits=function(engine,Q,range) {
	var fileOffsets=engine.get("fileOffsets");
	var out=[],filecount=100;
	var start=0 , end=Q.byFile.length;
	Q.excerptOverflow=false;
	if (range.start) {
		var first=range.start ;
		var last=range.end;
		if (!last) last=Number.MAX_SAFE_INTEGER;
		for (var i=0;i<fileOffsets.length;i++) {
			//if (fileOffsets[i]>first) break;
			if (fileOffsets[i]>last) {
				end=i;
				break;
			}
			if (fileOffsets[i]<first) start=i;
		}		
	} else {
		start=range.filestart || 0;
		if (range.maxfile) {
			filecount=range.maxfile;
		} else if (range.showpage) {
			throw "not implement yet"
		}
	}

	var fileWithHits=[],totalhit=0;
	range.maxhit=range.maxhit||1000;

	for (var i=start;i<end;i++) {
		if(Q.byFile[i].length>0) {
			totalhit+=Q.byFile[i].length;
			fileWithHits.push(i);
			range.nextFileStart=i;
			if (fileWithHits.length>=filecount) {
				Q.excerptOverflow=true;
				break;
			}
			if (totalhit>range.maxhit) {
				Q.excerptOverflow=true;
				break;
			}
		}
	}
	if (i>=end) { //no more file
		Q.excerptStop=true;
	}
	return fileWithHits;
}
var resultlist=function(engine,Q,opts,cb) {
	var output=[];
	if (!Q.rawresult || !Q.rawresult.length) {
		cb(output);
		return;
	}

	if (opts.range) {
		if (opts.range.maxhit && !opts.range.maxfile) {
			opts.range.maxfile=opts.range.maxhit;
			opts.range.maxseg=opts.range.maxhit;
		}
		if (!opts.range.maxseg) opts.range.maxseg=100;
		if (!opts.range.end) {
			opts.range.end=Number.MAX_SAFE_INTEGER;
		}
	}
	var fileWithHits=getFileWithHits(engine,Q,opts.range);
	if (!fileWithHits.length) {
		cb(output);
		return;
	}

	var output=[],files=[];//temporary holder for segnames
	for (var i=0;i<fileWithHits.length;i++) {
		var nfile=fileWithHits[i];
		var segoffsets=engine.getFileSegOffsets(nfile);
		var segnames=engine.getFileSegNames(nfile);
		files[nfile]={segoffsets:segoffsets};
		var segwithhit=plist.groupbyposting2(Q.byFile[ nfile ],  segoffsets);
		//if (segoffsets[0]==1)
		//segwithhit.shift(); //the first item is not used (0~Q.byFile[0] )

		for (var j=0; j<segwithhit.length;j++) {
			if (!segwithhit[j].length) continue;
			//var offsets=segwithhit[j].map(function(p){return p- fileOffsets[i]});
			if (segoffsets[j]>opts.range.end) break;
			output.push(  {file: nfile, seg:j,  segname:segnames[j]});
			if (output.length>opts.range.maxseg) break;
		}
	}

	var segpaths=output.map(function(p){
		return ["filecontents",p.file,p.seg];
	});
	//prepare the text
	engine.get(segpaths,function(segs){
		var seq=0;
		if (segs) for (var i=0;i<segs.length;i++) {
			var startvpos=files[output[i].file].segoffsets[output[i].seg-1];
			var endvpos=files[output[i].file].segoffsets[output[i].seg];
			var hl={};

			if (opts.range && opts.range.start  ) {
				if ( startvpos<opts.range.start) startvpos=opts.range.start;
			//	if (endvpos>opts.range.end) endvpos=opts.range.end;
			}
			
			if (opts.nohighlight) {
				hl.text=segs[i];
				hl.hits=hitInRange(Q,startvpos,endvpos);
			} else {
				var o={nocrlf:true,nospan:true,
					text:segs[i],startvpos:startvpos, endvpos: endvpos, 
					Q:Q,fulltext:opts.fulltext};
				hl=highlight(Q,o);
			}
			if (hl.text) {
				output[i].text=hl.text;
				output[i].hits=hl.hits;
				output[i].seq=seq;
				seq+=hl.hits.length;

				output[i].start=startvpos;				
			} else {
				output[i]=null; //remove item vpos less than opts.range.start
			}
		} 
		output=output.filter(function(o){return o!=null});
		cb(output);
	});
}
var injectTag=function(Q,opts){
	var hits=opts.hits;
	var tags=opts.tags;
	if (!tags) tags=[];
	var hitclass=opts.hitclass||'hl';
	var output='',O=[],j=0,k=0;
	var surround=opts.surround||5;

	var tokens=Q.tokenize(opts.text).tokens;
	var vpos=opts.vpos;
	var i=0,previnrange=!!opts.fulltext ,inrange=!!opts.fulltext;
	var hitstart=0,hitend=0,tagstart=0,tagend=0,tagclass="";
	while (i<tokens.length) {
		var skip=Q.isSkip(tokens[i]);
		var hashit=false;
		inrange=opts.fulltext || (j<hits.length && vpos+surround>=hits[j][0] ||
				(j>0 && j<=hits.length &&  hits[j-1][0]+surround*2>=vpos));	

		if (previnrange!=inrange) {
			output+=opts.abridge||"...";
		}
		previnrange=inrange;
		var token=tokens[i];
		if (opts.nocrlf && token=="\n") token="";

		if (inrange && i<tokens.length) {
			if (skip) {
				output+=token;
			} else {
				var classes="";	

				//check hit
				if (j<hits.length && vpos==hits[j][0]) {
					var nphrase=hits[j][2] % 10, width=hits[j][1];
					hitstart=hits[j][0];
					hitend=hitstart+width;
					j++;
				}

				//check tag
				if (k<tags.length && vpos==tags[k][0]) {
					var width=tags[k][1];
					tagstart=tags[k][0];
					tagend=tagstart+width;
					tagclass=tags[k][2];
					k++;
				}

				if (vpos>=hitstart && vpos<hitend) classes=hitclass+" "+hitclass+nphrase;
				if (vpos>=tagstart && vpos<tagend) classes+=" "+tagclass;

				if (classes || !opts.nospan) {
					output+='<span vpos="'+vpos+'"';
					if (classes) classes=' class="'+classes+'"';
					output+=classes+'>';
					output+=token+'</span>';
				} else {
					output+=token;
				}
			}
		}
		if (!skip) vpos++;
		i++; 
	}

	O.push(output);
	output="";

	return O.join("");
}
var highlight=function(Q,opts) {
	if (!opts.text) return {text:"",hits:[]};
	var opt={text:opts.text,
		hits:null,abridge:opts.abridge,vpos:opts.startvpos,
		fulltext:opts.fulltext,renderTags:opts.renderTags,nospan:opts.nospan,nocrlf:opts.nocrlf,
	};

	opt.hits=hitInRange(opts.Q,opts.startvpos,opts.endvpos);
	return {text:injectTag(Q,opt),hits:opt.hits};
}

var getSeg=function(engine,fileid,segid,cb) {
	var fileOffsets=engine.get("fileOffsets");
	var segpaths=["filecontents",fileid,segid];
	var segnames=engine.getFileSegNames(fileid);

	engine.get(segpaths,function(text){
		cb.apply(engine.context,[{text:text,file:fileid,seg:segid,segname:segnames[segid]}]);
	});
}

var getSegSync=function(engine,fileid,segid) {
	var fileOffsets=engine.get("fileoffsets");
	var segpaths=["filecontents",fileid,segid];
	var segnames=engine.getFileSegNames(fileid);

	var text=engine.get(segpaths);
	return {text:text,file:fileid,seg:segid,segname:segnames[segid]};
}

var getRange=function(engine,start,end,cb) {
	var fileoffsets=engine.get("fileoffsets");
	//var pagepaths=["fileContents",];
	//find first page and last page
	//create get paths

}

var getFile=function(engine,fileid,cb) {
	var filename=engine.get("filenames")[fileid];
	var segnames=engine.getFileSegNames(fileid);
	var filestart=engine.get("fileoffsets")[fileid];
	var offsets=engine.getFileSegOffsets(fileid);
	var pc=0;
	engine.get(["fileContents",fileid],true,function(data){
		var text=data.map(function(t,idx) {
			if (idx==0) return ""; 
			var pb='<pb n="'+segnames[idx]+'"></pb>';
			return pb+t;
		});
		cb({texts:data,text:text.join(""),segnames:segnames,filestart:filestart,offsets:offsets,file:fileid,filename:filename}); //force different token
	});
}

var highlightRange=function(Q,startvpos,endvpos,opts,cb){
	//not implement yet
}

var highlightFile=function(Q,fileid,opts,cb) {
	if (typeof opts=="function") {
		cb=opts;
	}

	if (!Q || !Q.engine) return cb(null);

	var segoffsets=Q.engine.getFileSegOffsets(fileid);
	var output=[];	
	//console.log(startvpos,endvpos)
	Q.engine.get(["fileContents",fileid],true,function(data){
		if (!data) {
			console.error("wrong file id",fileid);
		} else {
			for (var i=0;i<data.length-1;i++ ){
				var startvpos=segoffsets[i];
				var endvpos=segoffsets[i+1];
				var pagenames=Q.engine.getFileSegNames(fileid);
				var page=getPageSync(Q.engine, fileid,i+1);
					var opt={text:page.text,hits:null,tag:'hl',vpos:startvpos,
					fulltext:true,nospan:opts.nospan,nocrlf:opts.nocrlf};
				var segname=segnames[i+1];
				opt.hits=hitInRange(Q,startvpos,endvpos);
				var pb='<pb n="'+segname+'"></pb>';
				var withtag=injectTag(Q,opt);
				output.push(pb+withtag);
			}			
		}

		cb.apply(Q.engine.context,[{text:output.join(""),file:fileid}]);
	})
}
var highlightSeg=function(Q,fileid,segid,opts,cb) {
	if (typeof opts=="function") {
		cb=opts;
	}

	if (!Q || !Q.engine) return cb(null);
	var segoffsets=Q.engine.getFileSegOffsets(fileid);
	var startvpos=segoffsets[segid-1];
	var endvpos=segoffsets[segid];
	var pagenames=Q.engine.getFileSegNames(fileid);

	this.getPage(Q.engine,fileid,segid,function(res){
		var opt={text:res.text,hits:null,vpos:startvpos,fulltext:true,
			nospan:opts.nospan,nocrlf:opts.nocrlf};
		opt.hits=hitInRange(Q,startvpos,endvpos);
		if (opts.renderTags) {
			opt.tags=tagsInRange(Q,opts.renderTags,startvpos,endvpos);
		}

		var pagename=pagenames[segid];
		cb.apply(Q.engine.context,[{text:injectTag(Q,opt),page:segid,file:fileid,hits:opt.hits,pagename:pagename}]);
	});
}
module.exports={resultlist:resultlist, 
	hitInRange:hitInRange, 
	highlightSeg:highlightSeg,
	getSeg:getSeg,
	highlightFile:highlightFile,
	getFile:getFile
	//highlightRange:highlightRange,
  //getRange:getRange,
};
},{"./plist":"C:\\ksana2015\\node_modules\\ksana-search\\plist.js"}],"C:\\ksana2015\\node_modules\\ksana-search\\index.js":[function(require,module,exports){
/*
  Ksana Search Engine.

  need a KDE instance to be functional
  
*/
var bsearch=require("./bsearch");
var dosearch=require("./search");

var prepareEngineForSearch=function(engine,cb){
	if (engine.analyzer)return;
	var analyzer=require("ksana-analyzer");
	var config=engine.get("meta").config;
	engine.analyzer=analyzer.getAPI(config);
	engine.get([["tokens"],["postingsLength"]],function(){
		cb();
	});
}

var _search=function(engine,q,opts,cb,context) {
	if (typeof engine=="string") {//browser only
		var kde=require("ksana-database");
		if (typeof opts=="function") { //user didn't supply options
			if (typeof cb=="object")context=cb;
			cb=opts;
			opts={};
		}
		opts.q=q;
		opts.dbid=engine;
		kde.open(opts.dbid,function(err,db){
			if (err) {
				cb(err);
				return;
			}
			console.log("opened",opts.dbid)
			prepareEngineForSearch(db,function(){
				return dosearch(db,q,opts,cb);	
			});
		},context);
	} else {
		prepareEngineForSearch(engine,function(){
			return dosearch(engine,q,opts,cb);	
		});
	}
}

var _highlightPage=function(engine,fileid,pageid,opts,cb){
	if (!opts.q) opts.q=""; 
	_search(engine,opts.q,opts,function(Q){
		api.excerpt.highlightPage(Q,fileid,pageid,opts,cb);
	});	
}
var _highlightRange=function(engine,start,end,opts,cb){

	if (opts.q) {
		_search(engine,opts.q,opts,function(Q){
			api.excerpt.highlightRange(Q,start,end,opts,cb);
		});
	} else {
		prepareEngineForSearch(engine,function(){
			api.excerpt.getRange(engine,start,end,cb);
		});
	}
}
var _highlightFile=function(engine,fileid,opts,cb){
	if (!opts.q) opts.q=""; 
	_search(engine,opts.q,opts,function(Q){
		api.excerpt.highlightFile(Q,fileid,opts,cb);
	});
	/*
	} else {
		api.excerpt.getFile(engine,fileid,function(data) {
			cb.apply(engine.context,[data]);
		});
	}
	*/
}

var vpos2filepage=function(engine,vpos) {
    var pageOffsets=engine.get("pageOffsets");
    var fileOffsets=engine.get(["fileOffsets"]);
    var pageNames=engine.get("pageNames");
    var fileid=bsearch(fileOffsets,vpos+1,true);
    fileid--;
    var pageid=bsearch(pageOffsets,vpos+1,true);
	var range=engine.getFileRange(fileid);
	pageid-=range.start;
    return {file:fileid,page:pageid};
}
var api={
	search:_search
//	,concordance:require("./concordance")
//	,regex:require("./regex")
	,highlightPage:_highlightPage
	,highlightFile:_highlightFile
//	,highlightRange:_highlightRange
	,excerpt:require("./excerpt")
	,vpos2filepage:vpos2filepage
}
module.exports=api;
},{"./bsearch":"C:\\ksana2015\\node_modules\\ksana-search\\bsearch.js","./excerpt":"C:\\ksana2015\\node_modules\\ksana-search\\excerpt.js","./search":"C:\\ksana2015\\node_modules\\ksana-search\\search.js","ksana-analyzer":"C:\\ksana2015\\node_modules\\ksana-analyzer\\index.js","ksana-database":"C:\\ksana2015\\node_modules\\ksana-database\\index.js"}],"C:\\ksana2015\\node_modules\\ksana-search\\plist.js":[function(require,module,exports){

var unpack = function (ar) { // unpack variable length integer list
  var r = [],
  i = 0,
  v = 0;
  do {
	var shift = 0;
	do {
	  v += ((ar[i] & 0x7F) << shift);
	  shift += 7;
	} while (ar[++i] & 0x80);
	r[r.length]=v;
  } while (i < ar.length);
  return r;
}

/*
   arr:  [1,1,1,1,1,1,1,1,1]
   levels: [0,1,1,2,2,0,1,2]
   output: [5,1,3,1,1,3,1,1]
*/

var groupsum=function(arr,levels) {
  if (arr.length!=levels.length+1) return null;
  var stack=[];
  var output=new Array(levels.length);
  for (var i=0;i<levels.length;i++) output[i]=0;
  for (var i=1;i<arr.length;i++) { //first one out of toc scope, ignored
    if (stack.length>levels[i-1]) {
      while (stack.length>levels[i-1]) stack.pop();
    }
    stack.push(i-1);
    for (var j=0;j<stack.length;j++) {
      output[stack[j]]+=arr[i];
    }
  }
  return output;
}
/* arr= 1 , 2 , 3 ,4 ,5,6,7 //token posting
  posting= 3 , 5  //tag posting
  out = 3 , 2, 2
*/
var countbyposting = function (arr, posting) {
  if (!posting.length) return [arr.length];
  var out=[];
  for (var i=0;i<posting.length;i++) out[i]=0;
  out[posting.length]=0;
  var p=0,i=0,lasti=0;
  while (i<arr.length && p<posting.length) {
    if (arr[i]<=posting[p]) {
      while (p<posting.length && i<arr.length && arr[i]<=posting[p]) {
        out[p]++;
        i++;
      }      
    } 
    p++;
  }
  out[posting.length] = arr.length-i; //remaining
  return out;
}

var groupbyposting=function(arr,gposting) { //relative vpos
  if (!gposting.length) return [arr.length];
  var out=[];
  for (var i=0;i<=gposting.length;i++) out[i]=[];
  
  var p=0,i=0,lasti=0;
  while (i<arr.length && p<gposting.length) {
    if (arr[i]<gposting[p]) {
      while (p<gposting.length && i<arr.length && arr[i]<gposting[p]) {
        var start=0;
        if (p>0) start=gposting[p-1];
        out[p].push(arr[i++]-start);  // relative
      }      
    } 
    p++;
  }
  //remaining
  while(i<arr.length) out[out.length-1].push(arr[i++]-gposting[gposting.length-1]);
  return out;
}
var groupbyposting2=function(arr,gposting) { //absolute vpos
  if (!arr || !arr.length) return [];
  if (!gposting.length) return [arr.length];
  var out=[];
  for (var i=0;i<=gposting.length;i++) out[i]=[];
  
  var p=0,i=0,lasti=0;
  while (i<arr.length && p<gposting.length) {
    if (arr[i]<gposting[p]) {
      while (p<gposting.length && i<arr.length && arr[i]<gposting[p]) {
        var start=0;
        if (p>0) start=gposting[p-1]; //absolute
        out[p].push(arr[i++]);
      }      
    } 
    p++;
  }
  //remaining
  while(i<arr.length) out[out.length-1].push(arr[i++]-gposting[gposting.length-1]);
  return out;
}
var groupbyblock2 = function(ar, ntoken,slotshift,opts) {
  if (!ar.length) return [{},{}];
  
  slotshift = slotshift || 16;
  var g = Math.pow(2,slotshift);
  var i = 0;
  var r = {}, ntokens={};
  var groupcount=0;
  do {
    var group = Math.floor(ar[i] / g) ;
    if (!r[group]) {
      r[group] = [];
      ntokens[group]=[];
      groupcount++;
    }
    r[group].push(ar[i] % g);
    ntokens[group].push(ntoken[i]);
    i++;
  } while (i < ar.length);
  if (opts) opts.groupcount=groupcount;
  return [r,ntokens];
}
var groupbyslot = function (ar, slotshift, opts) {
  if (!ar.length)
	return {};
  
  slotshift = slotshift || 16;
  var g = Math.pow(2,slotshift);
  var i = 0;
  var r = {};
  var groupcount=0;
  do {
	var group = Math.floor(ar[i] / g) ;
	if (!r[group]) {
	  r[group] = [];
	  groupcount++;
	}
	r[group].push(ar[i] % g);
	i++;
  } while (i < ar.length);
  if (opts) opts.groupcount=groupcount;
  return r;
}
/*
var identity = function (value) {
  return value;
};
var sortedIndex = function (array, obj, iterator) { //taken from underscore
  iterator || (iterator = identity);
  var low = 0,
  high = array.length;
  while (low < high) {
	var mid = (low + high) >> 1;
	iterator(array[mid]) < iterator(obj) ? low = mid + 1 : high = mid;
  }
  return low;
};*/

var indexOfSorted = function (array, obj) { 
  var low = 0,
  high = array.length-1;
  while (low < high) {
    var mid = (low + high) >> 1;
    array[mid] < obj ? low = mid + 1 : high = mid;
  }
  return low;
};
var plhead=function(pl, pltag, opts) {
  opts=opts||{};
  opts.max=opts.max||1;
  var out=[];
  if (pltag.length<pl.length) {
    for (var i=0;i<pltag.length;i++) {
       k = indexOfSorted(pl, pltag[i]);
       if (k>-1 && k<pl.length) {
        if (pl[k]==pltag[i]) {
          out[out.length]=pltag[i];
          if (out.length>=opts.max) break;
        }
      }
    }
  } else {
    for (var i=0;i<pl.length;i++) {
       k = indexOfSorted(pltag, pl[i]);
       if (k>-1 && k<pltag.length) {
        if (pltag[k]==pl[i]) {
          out[out.length]=pltag[k];
          if (out.length>=opts.max) break;
        }
      }
    }
  }
  return out;
}
/*
 pl2 occur after pl1, 
 pl2>=pl1+mindis
 pl2<=pl1+maxdis
*/
var plfollow2 = function (pl1, pl2, mindis, maxdis) {
  var r = [],i=0;
  var swap = 0;
  
  while (i<pl1.length){
    var k = indexOfSorted(pl2, pl1[i] + mindis);
    var t = (pl2[k] >= (pl1[i] +mindis) && pl2[k]<=(pl1[i]+maxdis)) ? k : -1;
    if (t > -1) {
      r[r.length]=pl1[i];
      i++;
    } else {
      if (k>=pl2.length) break;
      var k2=indexOfSorted (pl1,pl2[k]-maxdis);
      if (k2>i) {
        var t = (pl2[k] >= (pl1[i] +mindis) && pl2[k]<=(pl1[i]+maxdis)) ? k : -1;
        if (t>-1) r[r.length]=pl1[k2];
        i=k2;
      } else break;
    }
  }
  return r;
}

var plnotfollow2 = function (pl1, pl2, mindis, maxdis) {
  var r = [],i=0;
  
  while (i<pl1.length){
    var k = indexOfSorted(pl2, pl1[i] + mindis);
    var t = (pl2[k] >= (pl1[i] +mindis) && pl2[k]<=(pl1[i]+maxdis)) ? k : -1;
    if (t > -1) {
      i++;
    } else {
      if (k>=pl2.length) {
        r=r.concat(pl1.slice(i));
        break;
      } else {
        var k2=indexOfSorted (pl1,pl2[k]-maxdis);
        if (k2>i) {
          r=r.concat(pl1.slice(i,k2));
          i=k2;
        } else break;
      }
    }
  }
  return r;
}
/* this is incorrect */
var plfollow = function (pl1, pl2, distance) {
  var r = [],i=0;

  while (i<pl1.length){
    var k = indexOfSorted(pl2, pl1[i] + distance);
    var t = (pl2[k] === (pl1[i] + distance)) ? k : -1;
    if (t > -1) {
      r.push(pl1[i]);
      i++;
    } else {
      if (k>=pl2.length) break;
      var k2=indexOfSorted (pl1,pl2[k]-distance);
      if (k2>i) {
        t = (pl2[k] === (pl1[k2] + distance)) ? k : -1;
        if (t>-1) {
           r.push(pl1[k2]);
           k2++;
        }
        i=k2;
      } else break;
    }
  }
  return r;
}
var plnotfollow = function (pl1, pl2, distance) {
  var r = [];
  var r = [],i=0;
  var swap = 0;
  
  while (i<pl1.length){
    var k = indexOfSorted(pl2, pl1[i] + distance);
    var t = (pl2[k] === (pl1[i] + distance)) ? k : -1;
    if (t > -1) { 
      i++;
    } else {
      if (k>=pl2.length) {
        r=r.concat(pl1.slice(i));
        break;
      } else {
        var k2=indexOfSorted (pl1,pl2[k]-distance);
        if (k2>i) {
          r=r.concat(pl1.slice(i,k2));
          i=k2;
        } else break;
      }
    }
  }
  return r;
}
var pland = function (pl1, pl2, distance) {
  var r = [];
  var swap = 0;
  
  if (pl1.length > pl2.length) { //swap for faster compare
    var t = pl2;
    pl2 = pl1;
    pl1 = t;
    swap = distance;
    distance = -distance;
  }
  for (var i = 0; i < pl1.length; i++) {
    var k = indexOfSorted(pl2, pl1[i] + distance);
    var t = (pl2[k] === (pl1[i] + distance)) ? k : -1;
    if (t > -1) {
      r.push(pl1[i] - swap);
    }
  }
  return r;
}
var combine=function (postings) {
  var out=[];
  for (var i in postings) {
    out=out.concat(postings[i]);
  }
  out.sort(function(a,b){return a-b});
  return out;
}

var unique = function(ar){
   if (!ar || !ar.length) return [];
   var u = {}, a = [];
   for(var i = 0, l = ar.length; i < l; ++i){
    if(u.hasOwnProperty(ar[i])) continue;
    a.push(ar[i]);
    u[ar[i]] = 1;
   }
   return a;
}



var plphrase = function (postings,ops) {
  var r = [];
  for (var i=0;i<postings.length;i++) {
  	if (!postings[i])  return [];
  	if (0 === i) {
  	  r = postings[0];
  	} else {
      if (ops[i]=='andnot') {
        r = plnotfollow(r, postings[i], i);  
      }else {
        r = pland(r, postings[i], i);  
      }
  	}
  }
  
  return r;
}
//return an array of group having any of pl item
var matchPosting=function(pl,gupl,start,end) {
  start=start||0;
  end=end||-1;
  if (end==-1) end=Math.pow(2, 53); // max integer value

  var count=0, i = j= 0,  result = [] ,v=0;
  var docs=[], freq=[];
  if (!pl) return {docs:[],freq:[]};
  while( i < pl.length && j < gupl.length ){
     if (pl[i] < gupl[j] ){ 
       count++;
       v=pl[i];
       i++; 
     } else {
       if (count) {
        if (v>=start && v<end) {
          docs.push(j);
          freq.push(count);          
        }
       }
       j++;
       count=0;
     }
  }
  if (count && j<gupl.length && v>=start && v<end) {
    docs.push(j);
    freq.push(count);
    count=0;
  }
  else {
    while (j==gupl.length && i<pl.length && pl[i] >= gupl[gupl.length-1]) {
      i++;
      count++;
    }
    if (v>=start && v<end) {
      docs.push(j);
      freq.push(count);      
    }
  } 
  return {docs:docs,freq:freq};
}

var trim=function(arr,start,end) {
  var s=indexOfSorted(arr,start);
  var e=indexOfSorted(arr,end);
  return arr.slice(s,e+1);
}
var plist={};
plist.unpack=unpack;
plist.plphrase=plphrase;
plist.plhead=plhead;
plist.plfollow2=plfollow2;
plist.plnotfollow2=plnotfollow2;
plist.plfollow=plfollow;
plist.plnotfollow=plnotfollow;
plist.unique=unique;
plist.indexOfSorted=indexOfSorted;
plist.matchPosting=matchPosting;
plist.trim=trim;

plist.groupbyslot=groupbyslot;
plist.groupbyblock2=groupbyblock2;
plist.countbyposting=countbyposting;
plist.groupbyposting=groupbyposting;
plist.groupbyposting2=groupbyposting2;
plist.groupsum=groupsum;
plist.combine=combine;
module.exports=plist;
},{}],"C:\\ksana2015\\node_modules\\ksana-search\\search.js":[function(require,module,exports){
/*
var dosearch2=function(engine,opts,cb,context) {
	opts
		nfile,npage  //return a highlighted page
		nfile,[pages] //return highlighted pages 
		nfile        //return entire highlighted file
		abs_npage
		[abs_pages]  //return set of highlighted pages (may cross file)

		filename, pagename
		filename,[pagenames]

		excerpt      //
	    sortBy       //default natural, sortby by vsm ranking

	//return err,array_of_string ,Q  (Q contains low level search result)
}

*/
/* TODO sorted tokens */
var plist=require("./plist");
var boolsearch=require("./boolsearch");
var excerpt=require("./excerpt");
var parseTerm = function(engine,raw,opts) {
	if (!raw) return;
	var res={raw:raw,variants:[],term:'',op:''};
	var term=raw, op=0;
	var firstchar=term[0];
	var termregex="";
	if (firstchar=='-') {
		term=term.substring(1);
		firstchar=term[0];
		res.exclude=true; //exclude
	}
	term=term.trim();
	var lastchar=term[term.length-1];
	term=engine.analyzer.normalize(term);
	
	if (term.indexOf("%")>-1) {
		var termregex="^"+term.replace(/%+/g,".+")+"$";
		if (firstchar=="%") 	termregex=".+"+termregex.substr(1);
		if (lastchar=="%") 	termregex=termregex.substr(0,termregex.length-1)+".+";
	}

	if (termregex) {
		res.variants=expandTerm(engine,termregex);
	}

	res.key=term;
	return res;
}
var expandTerm=function(engine,regex) {
	var r=new RegExp(regex);
	var tokens=engine.get("tokens");
	var postingsLength=engine.get("postingslength");
	if (!postingsLength) postingsLength=[];
	var out=[];
	for (var i=0;i<tokens.length;i++) {
		var m=tokens[i].match(r);
		if (m) {
			out.push([m[0],postingsLength[i]||1]);
		}
	}
	out.sort(function(a,b){return b[1]-a[1]});
	return out;
}
var isWildcard=function(raw) {
	return !!raw.match(/[\*\?]/);
}

var isOrTerm=function(term) {
	term=term.trim();
	return (term[term.length-1]===',');
}
var orterm=function(engine,term,key) {
		var t={text:key};
		if (engine.analyzer.simplifiedToken) {
			t.simplified=engine.analyzer.simplifiedToken(key);
		}
		term.variants.push(t);
}
var orTerms=function(engine,tokens,now) {
	var raw=tokens[now];
	var term=parseTerm(engine,raw);
	if (!term) return;
	orterm(engine,term,term.key);
	while (isOrTerm(raw))  {
		raw=tokens[++now];
		var term2=parseTerm(engine,raw);
		orterm(engine,term,term2.key);
		for (var i in term2.variants){
			term.variants[i]=term2.variants[i];
		}
		term.key+=','+term2.key;
	}
	return term;
}

var getOperator=function(raw) {
	var op='';
	if (raw[0]=='+') op='include';
	if (raw[0]=='-') op='exclude';
	return op;
}
var parsePhrase=function(q) {
	var match=q.match(/(".+?"|'.+?'|\S+)/g)
	match=match.map(function(str){
		var n=str.length, h=str.charAt(0), t=str.charAt(n-1)
		if (h===t&&(h==='"'|h==="'")) str=str.substr(1,n-2)
		return str;
	})
	return match;
}
var tibetanNumber={
	"\u0f20":"0","\u0f21":"1","\u0f22":"2",	"\u0f23":"3",	"\u0f24":"4",
	"\u0f25":"5","\u0f26":"6","\u0f27":"7","\u0f28":"8","\u0f29":"9"
}
var parseNumber=function(raw) {
	var n=parseInt(raw,10);
	if (isNaN(n)){
		var converted=[];
		for (var i=0;i<raw.length;i++) {
			var nn=tibetanNumber[raw[i]];
			if (typeof nn !="undefined") converted[i]=nn;
			else break;
		}
		return parseInt(converted,10);
	} else {
		return n;
	}
}
var parseWildcard=function(raw) {
	var n=parseNumber(raw) || 1;
	var qcount=raw.split('?').length-1;
	var scount=raw.split('*').length-1;
	var type='';
	if (qcount) type='?';
	else if (scount) type='*';
	return {wildcard:type, width: n , op:'wildcard'};
}

var newPhrase=function() {
	return {termid:[],posting:[],raw:'',termlength:[]};
} 
var parseQuery=function(q,sep) {
	if (sep && q.indexOf(sep)>-1) {
		var match=q.split(sep);
	} else {
		var match=q.match(/(".+?"|'.+?'|\S+)/g)
		match=match.map(function(str){
			var n=str.length, h=str.charAt(0), t=str.charAt(n-1)
			if (h===t&&(h==='"'|h==="'")) str=str.substr(1,n-2)
			return str
		})
		//console.log(input,'==>',match)		
	}
	return match;
}
var loadPhrase=function(phrase) {
	/* remove leading and ending wildcard */
	var Q=this;
	var cache=Q.engine.postingCache;
	if (cache[phrase.key]) {
		phrase.posting=cache[phrase.key];
		return Q;
	}
	if (phrase.termid.length==1) {
		if (!Q.terms.length){
			phrase.posting=[];
		} else {
			cache[phrase.key]=phrase.posting=Q.terms[phrase.termid[0]].posting;	
		}
		return Q;
	}

	var i=0, r=[],dis=0;
	while(i<phrase.termid.length) {
	  var T=Q.terms[phrase.termid[i]];
		if (0 === i) {
			r = T.posting;
		} else {
		    if (T.op=='wildcard') {
		    	T=Q.terms[phrase.termid[i++]];
		    	var width=T.width;
		    	var wildcard=T.wildcard;
		    	T=Q.terms[phrase.termid[i]];
		    	var mindis=dis;
		    	if (wildcard=='?') mindis=dis+width;
		    	if (T.exclude) r = plist.plnotfollow2(r, T.posting, mindis, dis+width);
		    	else r = plist.plfollow2(r, T.posting, mindis, dis+width);		    	
		    	dis+=(width-1);
		    }else {
		    	if (T.posting) {
		    		if (T.exclude) r = plist.plnotfollow(r, T.posting, dis);
		    		else r = plist.plfollow(r, T.posting, dis);
		    	}
		    }
		}
		dis += phrase.termlength[i];
		i++;
		if (!r) return Q;
  }
  phrase.posting=r;
  cache[phrase.key]=r;
  return Q;
}
var trimSpace=function(engine,query) {
	if (!query) return "";
	var i=0;
	var isSkip=engine.analyzer.isSkip;
	while (isSkip(query[i]) && i<query.length) i++;
	return query.substring(i);
}
var getSegWithHit=function(fileid,offsets) {
	var Q=this,engine=Q.engine;
	var segWithHit=plist.groupbyposting2(Q.byFile[fileid ], offsets);
	if (segWithHit.length) segWithHit.shift(); //the first item is not used (0~Q.byFile[0] )
	var out=[];
	segWithHit.map(function(p,idx){if (p.length) out.push(idx)});
	return out;
}
var segWithHit=function(fileid) {
	var Q=this,engine=Q.engine;
	var offsets=engine.getFileSegOffsets(fileid);
	return getSegWithHit.apply(this,[fileid,offsets]);
}
var isSimplePhrase=function(phrase) {
	var m=phrase.match(/[\?%^]/);
	return !m;
}

// 發菩提心   ==> 發菩  提心       2 2   
// 菩提心     ==> 菩提  提心       1 2
// 劫劫       ==> 劫    劫         1 1   // invalid
// 因緣所生道  ==> 因緣  所生   道   2 2 1
var splitPhrase=function(engine,simplephrase,bigram) {
	var bigram=bigram||engine.get("meta").bigram||[];
	var tokens=engine.analyzer.tokenize(simplephrase).tokens;
	var loadtokens=[],lengths=[],j=0,lastbigrampos=-1;
	while (j+1<tokens.length) {
		var token=engine.analyzer.normalize(tokens[j]);
		var nexttoken=engine.analyzer.normalize(tokens[j+1]);
		var bi=token+nexttoken;
		var i=plist.indexOfSorted(bigram,bi);
		if (bigram[i]==bi) {
			loadtokens.push(bi);
			if (j+3<tokens.length) {
				lastbigrampos=j;
				j++;
			} else {
				if (j+2==tokens.length){ 
					if (lastbigrampos+1==j ) {
						lengths[lengths.length-1]--;
					}
					lastbigrampos=j;
					j++;
				}else {
					lastbigrampos=j;	
				}
			}
			lengths.push(2);
		} else {
			if (!bigram || lastbigrampos==-1 || lastbigrampos+1!=j) {
				loadtokens.push(token);
				lengths.push(1);				
			}
		}
		j++;
	}

	while (j<tokens.length) {
		var token=engine.analyzer.normalize(tokens[j]);
		loadtokens.push(token);
		lengths.push(1);
		j++;
	}

	return {tokens:loadtokens, lengths: lengths , tokenlength: tokens.length};
}
/* host has fast native function */
var fastPhrase=function(engine,phrase) {
	var phrase_term=newPhrase();
	//var tokens=engine.analyzer.tokenize(phrase).tokens;
	var splitted=splitPhrase(engine,phrase);

	var paths=postingPathFromTokens(engine,splitted.tokens);
//create wildcard

	phrase_term.width=splitted.tokenlength; //for excerpt.js to getPhraseWidth

	engine.get(paths,{address:true},function(postingAddress){ //this is sync
		phrase_term.key=phrase;
		var postingAddressWithWildcard=[];
		for (var i=0;i<postingAddress.length;i++) {
			postingAddressWithWildcard.push(postingAddress[i]);
			if (splitted.lengths[i]>1) {
				postingAddressWithWildcard.push([splitted.lengths[i],0]); //wildcard has blocksize==0 
			}
		}
		engine.postingCache[phrase]=engine.mergePostings(postingAddressWithWildcard);
	});
	return phrase_term;
	// put posting into cache[phrase.key]
}
var slowPhrase=function(engine,terms,phrase) {
	var j=0,tokens=engine.analyzer.tokenize(phrase).tokens;
	var phrase_term=newPhrase();
	var termid=0;
	while (j<tokens.length) {
		var raw=tokens[j], termlength=1;
		if (isWildcard(raw)) {
			if (phrase_term.termid.length==0)  { //skip leading wild card
				j++
				continue;
			}
			terms.push(parseWildcard(raw));
			termid=terms.length-1;
			phrase_term.termid.push(termid);
			phrase_term.termlength.push(termlength);
		} else if (isOrTerm(raw)){
			var term=orTerms.apply(this,[tokens,j]);
			if (term) {
				terms.push(term);
				termid=terms.length-1;
				j+=term.key.split(',').length-1;					
			}
			j++;
			phrase_term.termid.push(termid);
			phrase_term.termlength.push(termlength);
		} else {
			var phrase="";
			while (j<tokens.length) {
				if (!(isWildcard(tokens[j]) || isOrTerm(tokens[j]))) {
					phrase+=tokens[j];
					j++;
				} else break;
			}

			var splitted=splitPhrase(engine,phrase);
			for (var i=0;i<splitted.tokens.length;i++) {

				var term=parseTerm(engine,splitted.tokens[i]);
				var termidx=terms.map(function(a){return a.key}).indexOf(term.key);
				if (termidx==-1) {
					terms.push(term);
					termid=terms.length-1;
				} else {
					termid=termidx;
				}				
				phrase_term.termid.push(termid);
				phrase_term.termlength.push(splitted.lengths[i]);
			}
		}
		j++;
	}
	phrase_term.key=phrase;
	//remove ending wildcard
	var P=phrase_term , T=null;
	do {
		T=terms[P.termid[P.termid.length-1]];
		if (!T) break;
		if (T.wildcard) P.termid.pop(); else break;
	} while(T);		
	return phrase_term;
}
var newQuery =function(engine,query,opts) {
	//if (!query) return;
	opts=opts||{};
	query=trimSpace(engine,query);

	var phrases=query,phrases=[];
	if (typeof query=='string' && query) {
		phrases=parseQuery(query,opts.phrase_sep || "");
	}
	
	var phrase_terms=[], terms=[],variants=[],operators=[];
	var pc=0;//phrase count
	for  (var i=0;i<phrases.length;i++) {
		var op=getOperator(phrases[pc]);
		if (op) phrases[pc]=phrases[pc].substring(1);

		/* auto add + for natural order ?*/
		//if (!opts.rank && op!='exclude' &&i) op='include';
		operators.push(op);

		if (isSimplePhrase(phrases[pc]) && engine.mergePostings ) {
			var phrase_term=fastPhrase(engine,phrases[pc]);
		} else {
			var phrase_term=slowPhrase(engine,terms,phrases[pc]);
		}
		phrase_terms.push(phrase_term);

		if (!engine.mergePostings && phrase_terms[pc].termid.length==0) {
			phrase_terms.pop();
		} else pc++;
	}
	opts.op=operators;

	var Q={dbname:engine.dbname,engine:engine,opts:opts,query:query,
		phrases:phrase_terms,terms:terms
	};
	Q.tokenize=function() {return engine.analyzer.tokenize.apply(engine,arguments);}
	Q.isSkip=function() {return engine.analyzer.isSkip.apply(engine,arguments);}
	Q.normalize=function() {return engine.analyzer.normalize.apply(engine,arguments);}
	Q.segWithHit=segWithHit;

	//Q.getRange=function() {return that.getRange.apply(that,arguments)};
	//API.queryid='Q'+(Math.floor(Math.random()*10000000)).toString(16);
	return Q;
}
var postingPathFromTokens=function(engine,tokens) {
	var alltokens=engine.get("tokens");

	var tokenIds=tokens.map(function(t){ return 1+alltokens.indexOf(t)});
	var postingid=[];
	for (var i=0;i<tokenIds.length;i++) {
		postingid.push( tokenIds[i]); // tokenId==0 , empty token
	}
	return postingid.map(function(t){return ["postings",t]});
}
var loadPostings=function(engine,tokens,cb) {
	var toloadtokens=tokens.filter(function(t){
		return !engine.postingCache[t.key]; //already in cache
	});
	if (toloadtokens.length==0) {
		cb();
		return;
	}
	var postingPaths=postingPathFromTokens(engine,tokens.map(function(t){return t.key}));
	engine.get(postingPaths,function(postings){
		postings.map(function(p,i) { tokens[i].posting=p });
		if (cb) cb();
	});
}
var groupBy=function(Q,posting) {
	phrases.forEach(function(P){
		var key=P.key;
		var docfreq=docfreqcache[key];
		if (!docfreq) docfreq=docfreqcache[key]={};
		if (!docfreq[that.groupunit]) {
			docfreq[that.groupunit]={doclist:null,freq:null};
		}		
		if (P.posting) {
			var res=matchPosting(engine,P.posting);
			P.freq=res.freq;
			P.docs=res.docs;
		} else {
			P.docs=[];
			P.freq=[];
		}
		docfreq[that.groupunit]={doclist:P.docs,freq:P.freq};
	});
	return this;
}
var groupByFolder=function(engine,filehits) {
	var files=engine.get("filenames");
	var prevfolder="",hits=0,out=[];
	for (var i=0;i<filehits.length;i++) {
		var fn=files[i];
		var folder=fn.substring(0,fn.indexOf('/'));
		if (prevfolder && prevfolder!=folder) {
			out.push(hits);
			hits=0;
		}
		hits+=filehits[i].length;
		prevfolder=folder;
	}
	out.push(hits);
	return out;
}
var phrase_intersect=function(engine,Q) {
	var intersected=null;
	var fileoffsets=Q.engine.get("fileoffsets");
	var empty=[],emptycount=0,hashit=0;
	for (var i=0;i<Q.phrases.length;i++) {
		var byfile=plist.groupbyposting2(Q.phrases[i].posting,fileoffsets);
		if (byfile.length) byfile.shift();
		if (byfile.length) byfile.pop();
		byfile.pop();
		if (intersected==null) {
			intersected=byfile;
		} else {
			for (var j=0;j<byfile.length;j++) {
				if (!(byfile[j].length && intersected[j].length)) {
					intersected[j]=empty; //reuse empty array
					emptycount++;
				} else hashit++;
			}
		}
	}

	Q.byFile=intersected;
	Q.byFolder=groupByFolder(engine,Q.byFile);
	var out=[];
	//calculate new rawposting
	for (var i=0;i<Q.byFile.length;i++) {
		if (Q.byFile[i].length) out=out.concat(Q.byFile[i]);
	}
	Q.rawresult=out;
	countFolderFile(Q);
}
var countFolderFile=function(Q) {
	Q.fileWithHitCount=0;
	Q.byFile.map(function(f){if (f.length) Q.fileWithHitCount++});
			
	Q.folderWithHitCount=0;
	Q.byFolder.map(function(f){if (f) Q.folderWithHitCount++});
}

var main=function(engine,q,opts,cb){
	var starttime=new Date();
	var meta=engine.get("meta");
	if (meta.normalize && engine.analyzer.setNormalizeTable) {
		meta.normalizeObj=engine.analyzer.setNormalizeTable(meta.normalize,meta.normalizeObj);
	}
	if (typeof opts=="function") cb=opts;
	opts=opts||{};
	var Q=engine.queryCache[q];
	if (!Q) Q=newQuery(engine,q,opts); 
	if (!Q) {
		engine.searchtime=new Date()-starttime;
		engine.totaltime=engine.searchtime;
		if (engine.context) cb.apply(engine.context,["empty result",{rawresult:[]}]);
		else cb("empty result",{rawresult:[]});
		return;
	};
	engine.queryCache[q]=Q;
	if (Q.phrases.length) {
		loadPostings(engine,Q.terms,function(){
			if (!Q.phrases[0].posting) {
				engine.searchtime=new Date()-starttime;
				engine.totaltime=engine.searchtime

				cb.apply(engine.context,["no such posting",{rawresult:[]}]);
				return;			
			}
			
			if (!Q.phrases[0].posting.length) { //
				Q.phrases.forEach(loadPhrase.bind(Q));
			}
			if (Q.phrases.length==1) {
				Q.rawresult=Q.phrases[0].posting;
			} else {
				phrase_intersect(engine,Q);
			}
			var fileoffsets=Q.engine.get("fileoffsets");
			//console.log("search opts "+JSON.stringify(opts));

			if (!Q.byFile && Q.rawresult && !opts.nogroup) {
				Q.byFile=plist.groupbyposting2(Q.rawresult, fileoffsets);
				Q.byFile.shift();Q.byFile.pop();
				Q.byFolder=groupByFolder(engine,Q.byFile);

				countFolderFile(Q);
			}

			if (opts.range) {
				engine.searchtime=new Date()-starttime;
				excerpt.resultlist(engine,Q,opts,function(data) { 
					//console.log("excerpt ok");
					Q.excerpt=data;
					engine.totaltime=new Date()-starttime;
					cb.apply(engine.context,[0,Q]);
				});
			} else {
				engine.searchtime=new Date()-starttime;
				engine.totaltime=new Date()-starttime;
				cb.apply(engine.context,[0,Q]);
			}
		});
	} else { //empty search
		engine.searchtime=new Date()-starttime;
		engine.totaltime=new Date()-starttime;
		cb.apply(engine.context,[0,Q]);
	};
}

main.splitPhrase=splitPhrase; //just for debug
module.exports=main;
},{"./boolsearch":"C:\\ksana2015\\node_modules\\ksana-search\\boolsearch.js","./excerpt":"C:\\ksana2015\\node_modules\\ksana-search\\excerpt.js","./plist":"C:\\ksana2015\\node_modules\\ksana-search\\plist.js"}],"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\checkbrowser.js":[function(require,module,exports){
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
},{}],"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\downloader.js":[function(require,module,exports){

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
},{"./mkdirp":"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\mkdirp.js","fs":false,"http":false,"path":false}],"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\fileinstaller.js":[function(require,module,exports){
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
},{"./checkbrowser":"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\checkbrowser.js","./html5fs":"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\html5fs.js","./htmlfs":"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\htmlfs.js"}],"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\html5fs.js":[function(require,module,exports){
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
},{}],"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\htmlfs.js":[function(require,module,exports){
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
},{"./html5fs":"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\html5fs.js"}],"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\index.js":[function(require,module,exports){
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
},{"./downloader":"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\downloader.js","./fileinstaller":"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\fileinstaller.js","./html5fs":"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\html5fs.js","./htmlfs":"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\htmlfs.js","./installkdb":"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\installkdb.js","./kfs":"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\kfs.js","./kfs_html5":"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\kfs_html5.js","./ksanagap":"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\ksanagap.js","./livereload":"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\livereload.js","./liveupdate":"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\liveupdate.js","fs":false}],"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\installkdb.js":[function(require,module,exports){
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
},{"./fileinstaller":"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\fileinstaller.js"}],"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\kfs.js":[function(require,module,exports){
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
},{}],"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\kfs_html5.js":[function(require,module,exports){
var readDir=function(){
	return [];
}
var listApps=function(){
	return [];
}
module.exports={readDir:readDir,listApps:listApps};
},{}],"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\ksanagap.js":[function(require,module,exports){
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
},{"./downloader":"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\downloader.js","fs":false,"path":false}],"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\livereload.js":[function(require,module,exports){
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
},{"./html5fs":"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\html5fs.js"}],"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\liveupdate.js":[function(require,module,exports){

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
},{}],"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\mkdirp.js":[function(require,module,exports){
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

},{}]},{},["C:\\ksana2015\\_2048\\index.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uXFwuLlxcVXNlcnNcXGNoZW5cXEFwcERhdGFcXFJvYW1pbmdcXG5wbVxcbm9kZV9tb2R1bGVzXFxicm93c2VyaWZ5XFxub2RlX21vZHVsZXNcXGJyb3dzZXItcGFja1xcX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyY1xcbWFpbi5qc3giLCIuLlxcbm9kZV9tb2R1bGVzXFxrc2FuYS1hbmFseXplclxcY29uZmlncy5qcyIsIi4uXFxub2RlX21vZHVsZXNcXGtzYW5hLWFuYWx5emVyXFxpbmRleC5qcyIsIi4uXFxub2RlX21vZHVsZXNcXGtzYW5hLWFuYWx5emVyXFx0b2tlbml6ZXJzLmpzIiwiLi5cXG5vZGVfbW9kdWxlc1xca3NhbmEtZGF0YWJhc2VcXGJzZWFyY2guanMiLCIuLlxcbm9kZV9tb2R1bGVzXFxrc2FuYS1kYXRhYmFzZVxcaW5kZXguanMiLCIuLlxcbm9kZV9tb2R1bGVzXFxrc2FuYS1kYXRhYmFzZVxca2RlLmpzIiwiLi5cXG5vZGVfbW9kdWxlc1xca3NhbmEtZGF0YWJhc2VcXGxpc3RrZGIuanMiLCIuLlxcbm9kZV9tb2R1bGVzXFxrc2FuYS1kYXRhYmFzZVxccGxhdGZvcm0uanMiLCIuLlxcbm9kZV9tb2R1bGVzXFxrc2FuYS1qc29ucm9tXFxodG1sNXJlYWQuanMiLCIuLlxcbm9kZV9tb2R1bGVzXFxrc2FuYS1qc29ucm9tXFxpbmRleC5qcyIsIi4uXFxub2RlX21vZHVsZXNcXGtzYW5hLWpzb25yb21cXGtkYi5qcyIsIi4uXFxub2RlX21vZHVsZXNcXGtzYW5hLWpzb25yb21cXGtkYmZzLmpzIiwiLi5cXG5vZGVfbW9kdWxlc1xca3NhbmEtanNvbnJvbVxca2RiZnNfYW5kcm9pZC5qcyIsIi4uXFxub2RlX21vZHVsZXNcXGtzYW5hLWpzb25yb21cXGtkYmZzX2lvcy5qcyIsIi4uXFxub2RlX21vZHVsZXNcXGtzYW5hLWpzb25yb21cXGtkYncuanMiLCIuLlxcbm9kZV9tb2R1bGVzXFxrc2FuYS1zZWFyY2hcXGJvb2xzZWFyY2guanMiLCIuLlxcbm9kZV9tb2R1bGVzXFxrc2FuYS1zZWFyY2hcXGV4Y2VycHQuanMiLCIuLlxcbm9kZV9tb2R1bGVzXFxrc2FuYS1zZWFyY2hcXGluZGV4LmpzIiwiLi5cXG5vZGVfbW9kdWxlc1xca3NhbmEtc2VhcmNoXFxwbGlzdC5qcyIsIi4uXFxub2RlX21vZHVsZXNcXGtzYW5hLXNlYXJjaFxcc2VhcmNoLmpzIiwiLi5cXG5vZGVfbW9kdWxlc1xca3NhbmEyMDE1LXdlYnJ1bnRpbWVcXGNoZWNrYnJvd3Nlci5qcyIsIi4uXFxub2RlX21vZHVsZXNcXGtzYW5hMjAxNS13ZWJydW50aW1lXFxkb3dubG9hZGVyLmpzIiwiLi5cXG5vZGVfbW9kdWxlc1xca3NhbmEyMDE1LXdlYnJ1bnRpbWVcXGZpbGVpbnN0YWxsZXIuanMiLCIuLlxcbm9kZV9tb2R1bGVzXFxrc2FuYTIwMTUtd2VicnVudGltZVxcaHRtbDVmcy5qcyIsIi4uXFxub2RlX21vZHVsZXNcXGtzYW5hMjAxNS13ZWJydW50aW1lXFxodG1sZnMuanMiLCIuLlxcbm9kZV9tb2R1bGVzXFxrc2FuYTIwMTUtd2VicnVudGltZVxcaW5kZXguanMiLCIuLlxcbm9kZV9tb2R1bGVzXFxrc2FuYTIwMTUtd2VicnVudGltZVxcaW5zdGFsbGtkYi5qcyIsIi4uXFxub2RlX21vZHVsZXNcXGtzYW5hMjAxNS13ZWJydW50aW1lXFxrZnMuanMiLCIuLlxcbm9kZV9tb2R1bGVzXFxrc2FuYTIwMTUtd2VicnVudGltZVxca2ZzX2h0bWw1LmpzIiwiLi5cXG5vZGVfbW9kdWxlc1xca3NhbmEyMDE1LXdlYnJ1bnRpbWVcXGtzYW5hZ2FwLmpzIiwiLi5cXG5vZGVfbW9kdWxlc1xca3NhbmEyMDE1LXdlYnJ1bnRpbWVcXGxpdmVyZWxvYWQuanMiLCIuLlxcbm9kZV9tb2R1bGVzXFxrc2FuYTIwMTUtd2VicnVudGltZVxcbGl2ZXVwZGF0ZS5qcyIsIi4uXFxub2RlX21vZHVsZXNcXGtzYW5hMjAxNS13ZWJydW50aW1lXFxta2RpcnAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFXQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2ZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDclRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Y0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUM3RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsYUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeGFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsa0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBydW50aW1lPXJlcXVpcmUoXCJrc2FuYTIwMTUtd2VicnVudGltZVwiKTtcclxucnVudGltZS5ib290KFwiXzIwNDhcIixmdW5jdGlvbigpe1xyXG5cdHZhciBNYWluPVJlYWN0LmNyZWF0ZUVsZW1lbnQocmVxdWlyZShcIi4vc3JjL21haW4uanN4XCIpKTtcclxuXHRrc2FuYS5tYWluQ29tcG9uZW50PVJlYWN0LnJlbmRlcihNYWluLGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFpblwiKSk7XHJcbn0pOyIsInZhciBrc2U9cmVxdWlyZShcImtzYW5hLXNlYXJjaFwiKTtcclxudmFyIG1haW5jb21wb25lbnQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6IFwibWFpbmNvbXBvbmVudFwiLFxyXG4gIGdldEluaXRpYWxTdGF0ZTpmdW5jdGlvbigpIHtcclxuICBcdHJldHVybiB7cmVzdWx0OltdfTtcclxuICB9LFxyXG4gIGNvbXBvbmVudERpZE1vdW50OmZ1bmN0aW9uKCkge1xyXG4gIFx0a3NlLnNlYXJjaChcInNhbXBsZVwiLFwiaGVhZFwiLHtyYW5nZTp7c3RhcnQ6MH19LGZ1bmN0aW9uKGVycixkYXRhKXtcclxuICBcdFx0dGhpcy5zZXRTdGF0ZSh7cmVzdWx0OmRhdGEuZXhjZXJwdH0pO1xyXG4gIFx0fSx0aGlzKTtcclxuICB9LFxyXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCBudWxsLCBcIkhlbGxvIFwiLCB0aGlzLnN0YXRlLnJlc3VsdCk7XHJcbiAgfVxyXG59KTtcclxubW9kdWxlLmV4cG9ydHM9bWFpbmNvbXBvbmVudDsiLCJ2YXIgdG9rZW5pemVycz1yZXF1aXJlKCcuL3Rva2VuaXplcnMnKTtcclxudmFyIG5vcm1hbGl6ZVRibD1udWxsO1xyXG52YXIgc2V0Tm9ybWFsaXplVGFibGU9ZnVuY3Rpb24odGJsLG9iaikge1xyXG5cdGlmICghb2JqKSB7XHJcblx0XHRvYmo9e307XHJcblx0XHRmb3IgKHZhciBpPTA7aTx0YmwubGVuZ3RoO2krKykge1xyXG5cdFx0XHR2YXIgYXJyPXRibFtpXS5zcGxpdChcIj1cIik7XHJcblx0XHRcdG9ialthcnJbMF1dPWFyclsxXTtcclxuXHRcdH1cclxuXHR9XHJcblx0bm9ybWFsaXplVGJsPW9iajtcclxuXHRyZXR1cm4gb2JqO1xyXG59XHJcbnZhciBub3JtYWxpemUxPWZ1bmN0aW9uKHRva2VuKSB7XHJcblx0aWYgKCF0b2tlbikgcmV0dXJuIFwiXCI7XHJcblx0dG9rZW49dG9rZW4ucmVwbGFjZSgvWyBcXG5cXC4s77yM44CC77yB77yO44CM44CN77ya77yb44CBXS9nLCcnKS50cmltKCk7XHJcblx0aWYgKCFub3JtYWxpemVUYmwpIHJldHVybiB0b2tlbjtcclxuXHRpZiAodG9rZW4ubGVuZ3RoPT0xKSB7XHJcblx0XHRyZXR1cm4gbm9ybWFsaXplVGJsW3Rva2VuXSB8fCB0b2tlbjtcclxuXHR9IGVsc2Uge1xyXG5cdFx0Zm9yICh2YXIgaT0wO2k8dG9rZW4ubGVuZ3RoO2krKykge1xyXG5cdFx0XHR0b2tlbltpXT1ub3JtYWxpemVUYmxbdG9rZW5baV1dIHx8IHRva2VuW2ldO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRva2VuO1xyXG5cdH1cclxufVxyXG52YXIgaXNTa2lwMT1mdW5jdGlvbih0b2tlbikge1xyXG5cdHZhciB0PXRva2VuLnRyaW0oKTtcclxuXHRyZXR1cm4gKHQ9PVwiXCIgfHwgdD09XCLjgIBcIiB8fCB0PT1cIuKAu1wiIHx8IHQ9PVwiXFxuXCIpO1xyXG59XHJcbnZhciBub3JtYWxpemVfdGliZXRhbj1mdW5jdGlvbih0b2tlbikge1xyXG5cdHJldHVybiB0b2tlbi5yZXBsYWNlKC9b4LyN4LyLIF0vZywnJykudHJpbSgpO1xyXG59XHJcblxyXG52YXIgaXNTa2lwX3RpYmV0YW49ZnVuY3Rpb24odG9rZW4pIHtcclxuXHR2YXIgdD10b2tlbi50cmltKCk7XHJcblx0cmV0dXJuICh0PT1cIlwiIHx8IHQ9PVwi44CAXCIgfHwgIHQ9PVwiXFxuXCIpO1x0XHJcbn1cclxudmFyIHNpbXBsZTE9e1xyXG5cdGZ1bmM6e1xyXG5cdFx0dG9rZW5pemU6dG9rZW5pemVycy5zaW1wbGVcclxuXHRcdCxzZXROb3JtYWxpemVUYWJsZTpzZXROb3JtYWxpemVUYWJsZVxyXG5cdFx0LG5vcm1hbGl6ZTogbm9ybWFsaXplMVxyXG5cdFx0LGlzU2tpcDpcdGlzU2tpcDFcclxuXHR9XHJcblx0XHJcbn1cclxudmFyIHRpYmV0YW4xPXtcclxuXHRmdW5jOntcclxuXHRcdHRva2VuaXplOnRva2VuaXplcnMudGliZXRhblxyXG5cdFx0LHNldE5vcm1hbGl6ZVRhYmxlOnNldE5vcm1hbGl6ZVRhYmxlXHJcblx0XHQsbm9ybWFsaXplOm5vcm1hbGl6ZV90aWJldGFuXHJcblx0XHQsaXNTa2lwOmlzU2tpcF90aWJldGFuXHJcblx0fVxyXG59XHJcbm1vZHVsZS5leHBvcnRzPXtcInNpbXBsZTFcIjpzaW1wbGUxLFwidGliZXRhbjFcIjp0aWJldGFuMX0iLCIvKiBcclxuICBjdXN0b20gZnVuYyBmb3IgYnVpbGRpbmcgYW5kIHNlYXJjaGluZyB5ZGJcclxuXHJcbiAga2VlcCBhbGwgdmVyc2lvblxyXG4gIFxyXG4gIGdldEFQSSh2ZXJzaW9uKTsgLy9yZXR1cm4gaGFzaCBvZiBmdW5jdGlvbnMgLCBpZiB2ZXIgaXMgb21pdCAsIHJldHVybiBsYXN0ZXN0XHJcblx0XHJcbiAgcG9zdGluZ3MyVHJlZSAgICAgIC8vIGlmIHZlcnNpb24gaXMgbm90IHN1cHBseSwgZ2V0IGxhc3Rlc3RcclxuICB0b2tlbml6ZSh0ZXh0LGFwaSkgLy8gY29udmVydCBhIHN0cmluZyBpbnRvIHRva2VucyhkZXBlbmRzIG9uIG90aGVyIGFwaSlcclxuICBub3JtYWxpemVUb2tlbiAgICAgLy8gc3RlbW1pbmcgYW5kIGV0Y1xyXG4gIGlzU3BhY2VDaGFyICAgICAgICAvLyBub3QgYSBzZWFyY2hhYmxlIHRva2VuXHJcbiAgaXNTa2lwQ2hhciAgICAgICAgIC8vIDAgdnBvc1xyXG5cclxuICBmb3IgY2xpZW50IGFuZCBzZXJ2ZXIgc2lkZVxyXG4gIFxyXG4qL1xyXG52YXIgY29uZmlncz1yZXF1aXJlKFwiLi9jb25maWdzXCIpO1xyXG52YXIgY29uZmlnX3NpbXBsZT1cInNpbXBsZTFcIjtcclxudmFyIG9wdGltaXplPWZ1bmN0aW9uKGpzb24sY29uZmlnKSB7XHJcblx0Y29uZmlnPWNvbmZpZ3x8Y29uZmlnX3NpbXBsZTtcclxuXHRyZXR1cm4ganNvbjtcclxufVxyXG5cclxudmFyIGdldEFQST1mdW5jdGlvbihjb25maWcpIHtcclxuXHRjb25maWc9Y29uZmlnfHxjb25maWdfc2ltcGxlO1xyXG5cdHZhciBmdW5jPWNvbmZpZ3NbY29uZmlnXS5mdW5jO1xyXG5cdGZ1bmMub3B0aW1pemU9b3B0aW1pemU7XHJcblx0aWYgKGNvbmZpZz09XCJzaW1wbGUxXCIpIHtcclxuXHRcdC8vYWRkIGNvbW1vbiBjdXN0b20gZnVuY3Rpb24gaGVyZVxyXG5cdH0gZWxzZSBpZiAoY29uZmlnPT1cInRpYmV0YW4xXCIpIHtcclxuXHJcblx0fSBlbHNlIHRocm93IFwiY29uZmlnIFwiK2NvbmZpZyArXCJub3Qgc3VwcG9ydGVkXCI7XHJcblxyXG5cdHJldHVybiBmdW5jO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cz17Z2V0QVBJOmdldEFQSX07IiwidmFyIHRpYmV0YW4gPWZ1bmN0aW9uKHMpIHtcclxuXHQvL2NvbnRpbnVvdXMgdHNoZWcgZ3JvdXBlZCBpbnRvIHNhbWUgdG9rZW5cclxuXHQvL3NoYWQgYW5kIHNwYWNlIGdyb3VwZWQgaW50byBzYW1lIHRva2VuXHJcblx0dmFyIG9mZnNldD0wO1xyXG5cdHZhciB0b2tlbnM9W10sb2Zmc2V0cz1bXTtcclxuXHRzPXMucmVwbGFjZSgvXFxyXFxuL2csJ1xcbicpLnJlcGxhY2UoL1xcci9nLCdcXG4nKTtcclxuXHR2YXIgYXJyPXMuc3BsaXQoJ1xcbicpO1xyXG5cclxuXHRmb3IgKHZhciBpPTA7aTxhcnIubGVuZ3RoO2krKykge1xyXG5cdFx0dmFyIGxhc3Q9MDtcclxuXHRcdHZhciBzdHI9YXJyW2ldO1xyXG5cdFx0c3RyLnJlcGxhY2UoL1vgvI3gvIsgXSsvZyxmdW5jdGlvbihtLG0xKXtcclxuXHRcdFx0dG9rZW5zLnB1c2goc3RyLnN1YnN0cmluZyhsYXN0LG0xKSttKTtcclxuXHRcdFx0b2Zmc2V0cy5wdXNoKG9mZnNldCtsYXN0KTtcclxuXHRcdFx0bGFzdD1tMSttLmxlbmd0aDtcclxuXHRcdH0pO1xyXG5cdFx0aWYgKGxhc3Q8c3RyLmxlbmd0aCkge1xyXG5cdFx0XHR0b2tlbnMucHVzaChzdHIuc3Vic3RyaW5nKGxhc3QpKTtcclxuXHRcdFx0b2Zmc2V0cy5wdXNoKGxhc3QpO1xyXG5cdFx0fVxyXG5cdFx0aWYgKGk9PT1hcnIubGVuZ3RoLTEpIGJyZWFrO1xyXG5cdFx0dG9rZW5zLnB1c2goJ1xcbicpO1xyXG5cdFx0b2Zmc2V0cy5wdXNoKG9mZnNldCtsYXN0KTtcclxuXHRcdG9mZnNldCs9c3RyLmxlbmd0aCsxO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIHt0b2tlbnM6dG9rZW5zLG9mZnNldHM6b2Zmc2V0c307XHJcbn07XHJcbnZhciBpc1NwYWNlPWZ1bmN0aW9uKGMpIHtcclxuXHRyZXR1cm4gKGM9PVwiIFwiKSA7Ly98fCAoYz09XCIsXCIpIHx8IChjPT1cIi5cIik7XHJcbn1cclxudmFyIGlzQ0pLID1mdW5jdGlvbihjKSB7cmV0dXJuICgoYz49MHgzMDAwICYmIGM8PTB4OUZGRikgXHJcbnx8IChjPj0weEQ4MDAgJiYgYzwweERDMDApIHx8IChjPj0weEZGMDApICkgO31cclxudmFyIHNpbXBsZTE9ZnVuY3Rpb24ocykge1xyXG5cdHZhciBvZmZzZXQ9MDtcclxuXHR2YXIgdG9rZW5zPVtdLG9mZnNldHM9W107XHJcblx0cz1zLnJlcGxhY2UoL1xcclxcbi9nLCdcXG4nKS5yZXBsYWNlKC9cXHIvZywnXFxuJyk7XHJcblx0YXJyPXMuc3BsaXQoJ1xcbicpO1xyXG5cclxuXHR2YXIgcHVzaHRva2VuPWZ1bmN0aW9uKHQsb2ZmKSB7XHJcblx0XHR2YXIgaT0wO1xyXG5cdFx0aWYgKHQuY2hhckNvZGVBdCgwKT4yNTUpIHtcclxuXHRcdFx0d2hpbGUgKGk8dC5sZW5ndGgpIHtcclxuXHRcdFx0XHR2YXIgYz10LmNoYXJDb2RlQXQoaSk7XHJcblx0XHRcdFx0b2Zmc2V0cy5wdXNoKG9mZitpKTtcclxuXHRcdFx0XHR0b2tlbnMucHVzaCh0W2ldKTtcclxuXHRcdFx0XHRpZiAoYz49MHhEODAwICYmIGM8PTB4REZGRikge1xyXG5cdFx0XHRcdFx0dG9rZW5zW3Rva2Vucy5sZW5ndGgtMV0rPXRbaV07IC8vZXh0ZW5zaW9uIEIsQyxEXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGkrKztcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dG9rZW5zLnB1c2godCk7XHJcblx0XHRcdG9mZnNldHMucHVzaChvZmYpO1x0XHJcblx0XHR9XHJcblx0fVxyXG5cdGZvciAodmFyIGk9MDtpPGFyci5sZW5ndGg7aSsrKSB7XHJcblx0XHR2YXIgbGFzdD0wLHNwPVwiXCI7XHJcblx0XHRzdHI9YXJyW2ldO1xyXG5cdFx0c3RyLnJlcGxhY2UoL1tfMC05QS1aYS16XSsvZyxmdW5jdGlvbihtLG0xKXtcclxuXHRcdFx0d2hpbGUgKGlzU3BhY2Uoc3A9c3RyW2xhc3RdKSAmJiBsYXN0PHN0ci5sZW5ndGgpIHtcclxuXHRcdFx0XHR0b2tlbnNbdG9rZW5zLmxlbmd0aC0xXSs9c3A7XHJcblx0XHRcdFx0bGFzdCsrO1xyXG5cdFx0XHR9XHJcblx0XHRcdHB1c2h0b2tlbihzdHIuc3Vic3RyaW5nKGxhc3QsbTEpK20gLCBvZmZzZXQrbGFzdCk7XHJcblx0XHRcdG9mZnNldHMucHVzaChvZmZzZXQrbGFzdCk7XHJcblx0XHRcdGxhc3Q9bTErbS5sZW5ndGg7XHJcblx0XHR9KTtcclxuXHJcblx0XHRpZiAobGFzdDxzdHIubGVuZ3RoKSB7XHJcblx0XHRcdHdoaWxlIChpc1NwYWNlKHNwPXN0cltsYXN0XSkgJiYgbGFzdDxzdHIubGVuZ3RoKSB7XHJcblx0XHRcdFx0dG9rZW5zW3Rva2Vucy5sZW5ndGgtMV0rPXNwO1xyXG5cdFx0XHRcdGxhc3QrKztcclxuXHRcdFx0fVxyXG5cdFx0XHRwdXNodG9rZW4oc3RyLnN1YnN0cmluZyhsYXN0KSwgb2Zmc2V0K2xhc3QpO1xyXG5cdFx0XHRcclxuXHRcdH1cdFx0XHJcblx0XHRvZmZzZXRzLnB1c2gob2Zmc2V0K2xhc3QpO1xyXG5cdFx0b2Zmc2V0Kz1zdHIubGVuZ3RoKzE7XHJcblx0XHRpZiAoaT09PWFyci5sZW5ndGgtMSkgYnJlYWs7XHJcblx0XHR0b2tlbnMucHVzaCgnXFxuJyk7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4ge3Rva2Vuczp0b2tlbnMsb2Zmc2V0czpvZmZzZXRzfTtcclxuXHJcbn07XHJcblxyXG52YXIgc2ltcGxlPWZ1bmN0aW9uKHMpIHtcclxuXHR2YXIgdG9rZW49Jyc7XHJcblx0dmFyIHRva2Vucz1bXSwgb2Zmc2V0cz1bXSA7XHJcblx0dmFyIGk9MDsgXHJcblx0dmFyIGxhc3RzcGFjZT1mYWxzZTtcclxuXHR2YXIgYWRkdG9rZW49ZnVuY3Rpb24oKSB7XHJcblx0XHRpZiAoIXRva2VuKSByZXR1cm47XHJcblx0XHR0b2tlbnMucHVzaCh0b2tlbik7XHJcblx0XHRvZmZzZXRzLnB1c2goaSk7XHJcblx0XHR0b2tlbj0nJztcclxuXHR9XHJcblx0d2hpbGUgKGk8cy5sZW5ndGgpIHtcclxuXHRcdHZhciBjPXMuY2hhckF0KGkpO1xyXG5cdFx0dmFyIGNvZGU9cy5jaGFyQ29kZUF0KGkpO1xyXG5cdFx0aWYgKGlzQ0pLKGNvZGUpKSB7XHJcblx0XHRcdGFkZHRva2VuKCk7XHJcblx0XHRcdHRva2VuPWM7XHJcblx0XHRcdGlmIChjb2RlPj0weEQ4MDAgJiYgY29kZTwweERDMDApIHsgLy9oaWdoIHNvcnJhZ2F0ZVxyXG5cdFx0XHRcdHRva2VuKz1zLmNoYXJBdChpKzEpO2krKztcclxuXHRcdFx0fVxyXG5cdFx0XHRhZGR0b2tlbigpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0aWYgKGM9PScmJyB8fCBjPT0nPCcgfHwgYz09Jz8nIHx8IGM9PVwiLFwiIHx8IGM9PVwiLlwiXHJcblx0XHRcdHx8IGM9PSd8JyB8fCBjPT0nficgfHwgYz09J2AnIHx8IGM9PSc7JyBcclxuXHRcdFx0fHwgYz09Jz4nIHx8IGM9PSc6JyBcclxuXHRcdFx0fHwgYz09Jz0nIHx8IGM9PSdAJyAgfHwgYz09XCItXCIgXHJcblx0XHRcdHx8IGM9PSddJyB8fCBjPT0nfScgIHx8IGM9PVwiKVwiIFxyXG5cdFx0XHQvL3x8IGM9PSd7JyB8fCBjPT0nfSd8fCBjPT0nWycgfHwgYz09J10nIHx8IGM9PScoJyB8fCBjPT0nKSdcclxuXHRcdFx0fHwgY29kZT09MHhmMGIgfHwgY29kZT09MHhmMGQgLy8gdGliZXRhbiBzcGFjZVxyXG5cdFx0XHR8fCAoY29kZT49MHgyMDAwICYmIGNvZGU8PTB4MjA2ZikpIHtcclxuXHRcdFx0XHRhZGR0b2tlbigpO1xyXG5cdFx0XHRcdGlmIChjPT0nJicgfHwgYz09JzwnKXsgLy8gfHwgYz09J3snfHwgYz09JygnfHwgYz09J1snKSB7XHJcblx0XHRcdFx0XHR2YXIgZW5kY2hhcj0nPic7XHJcblx0XHRcdFx0XHRpZiAoYz09JyYnKSBlbmRjaGFyPSc7J1xyXG5cdFx0XHRcdFx0Ly9lbHNlIGlmIChjPT0neycpIGVuZGNoYXI9J30nO1xyXG5cdFx0XHRcdFx0Ly9lbHNlIGlmIChjPT0nWycpIGVuZGNoYXI9J10nO1xyXG5cdFx0XHRcdFx0Ly9lbHNlIGlmIChjPT0nKCcpIGVuZGNoYXI9JyknO1xyXG5cclxuXHRcdFx0XHRcdHdoaWxlIChpPHMubGVuZ3RoICYmIHMuY2hhckF0KGkpIT1lbmRjaGFyKSB7XHJcblx0XHRcdFx0XHRcdHRva2VuKz1zLmNoYXJBdChpKTtcclxuXHRcdFx0XHRcdFx0aSsrO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0dG9rZW4rPWVuZGNoYXI7XHJcblx0XHRcdFx0XHRhZGR0b2tlbigpO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHR0b2tlbj1jO1xyXG5cdFx0XHRcdFx0YWRkdG9rZW4oKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0dG9rZW49Jyc7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0aWYgKGM9PVwiIFwiKSB7XHJcblx0XHRcdFx0XHR0b2tlbis9YztcclxuXHRcdFx0XHRcdGxhc3RzcGFjZT10cnVlO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRpZiAobGFzdHNwYWNlKSBhZGR0b2tlbigpO1xyXG5cdFx0XHRcdFx0bGFzdHNwYWNlPWZhbHNlO1xyXG5cdFx0XHRcdFx0dG9rZW4rPWM7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRpKys7XHJcblx0fVxyXG5cdGFkZHRva2VuKCk7XHJcblx0cmV0dXJuIHt0b2tlbnM6dG9rZW5zLG9mZnNldHM6b2Zmc2V0c307XHJcbn1cclxubW9kdWxlLmV4cG9ydHM9e3NpbXBsZTpzaW1wbGUsdGliZXRhbjp0aWJldGFufTsiLCJ2YXIgaW5kZXhPZlNvcnRlZCA9IGZ1bmN0aW9uIChhcnJheSwgb2JqLCBuZWFyKSB7IFxyXG4gIHZhciBsb3cgPSAwLFxyXG4gIGhpZ2ggPSBhcnJheS5sZW5ndGg7XHJcbiAgd2hpbGUgKGxvdyA8IGhpZ2gpIHtcclxuICAgIHZhciBtaWQgPSAobG93ICsgaGlnaCkgPj4gMTtcclxuICAgIGlmIChhcnJheVttaWRdPT1vYmopIHJldHVybiBtaWQ7XHJcbiAgICBhcnJheVttaWRdIDwgb2JqID8gbG93ID0gbWlkICsgMSA6IGhpZ2ggPSBtaWQ7XHJcbiAgfVxyXG4gIGlmIChuZWFyKSByZXR1cm4gbG93O1xyXG4gIGVsc2UgaWYgKGFycmF5W2xvd109PW9iaikgcmV0dXJuIGxvdztlbHNlIHJldHVybiAtMTtcclxufTtcclxudmFyIGluZGV4T2ZTb3J0ZWRfc3RyID0gZnVuY3Rpb24gKGFycmF5LCBvYmosIG5lYXIpIHsgXHJcbiAgdmFyIGxvdyA9IDAsXHJcbiAgaGlnaCA9IGFycmF5Lmxlbmd0aDtcclxuICB3aGlsZSAobG93IDwgaGlnaCkge1xyXG4gICAgdmFyIG1pZCA9IChsb3cgKyBoaWdoKSA+PiAxO1xyXG4gICAgaWYgKGFycmF5W21pZF09PW9iaikgcmV0dXJuIG1pZDtcclxuICAgIChhcnJheVttaWRdLmxvY2FsZUNvbXBhcmUob2JqKTwwKSA/IGxvdyA9IG1pZCArIDEgOiBoaWdoID0gbWlkO1xyXG4gIH1cclxuICBpZiAobmVhcikgcmV0dXJuIGxvdztcclxuICBlbHNlIGlmIChhcnJheVtsb3ddPT1vYmopIHJldHVybiBsb3c7ZWxzZSByZXR1cm4gLTE7XHJcbn07XHJcblxyXG5cclxudmFyIGJzZWFyY2g9ZnVuY3Rpb24oYXJyYXksdmFsdWUsbmVhcikge1xyXG5cdHZhciBmdW5jPWluZGV4T2ZTb3J0ZWQ7XHJcblx0aWYgKHR5cGVvZiBhcnJheVswXT09XCJzdHJpbmdcIikgZnVuYz1pbmRleE9mU29ydGVkX3N0cjtcclxuXHRyZXR1cm4gZnVuYyhhcnJheSx2YWx1ZSxuZWFyKTtcclxufVxyXG52YXIgYnNlYXJjaE5lYXI9ZnVuY3Rpb24oYXJyYXksdmFsdWUpIHtcclxuXHRyZXR1cm4gYnNlYXJjaChhcnJheSx2YWx1ZSx0cnVlKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHM9YnNlYXJjaDsvL3tic2VhcmNoTmVhcjpic2VhcmNoTmVhcixic2VhcmNoOmJzZWFyY2h9OyIsInZhciBLREU9cmVxdWlyZShcIi4va2RlXCIpO1xyXG4vL2N1cnJlbnRseSBvbmx5IHN1cHBvcnQgbm9kZS5qcyBmcywga3NhbmFnYXAgbmF0aXZlIGZzLCBodG1sNSBmaWxlIHN5c3RlbVxyXG4vL3VzZSBzb2NrZXQuaW8gdG8gcmVhZCBrZGIgZnJvbSByZW1vdGUgc2VydmVyIGluIGZ1dHVyZVxyXG5tb2R1bGUuZXhwb3J0cz1LREU7IiwiLyogS3NhbmEgRGF0YWJhc2UgRW5naW5lXHJcblxyXG4gICAyMDE1LzEvMiAsIFxyXG4gICBtb3ZlIHRvIGtzYW5hLWRhdGFiYXNlXHJcbiAgIHNpbXBsaWZpZWQgYnkgcmVtb3ZpbmcgZG9jdW1lbnQgc3VwcG9ydCBhbmQgc29ja2V0LmlvIHN1cHBvcnRcclxuXHJcblxyXG4qL1xyXG52YXIgcG9vbD17fSxsb2NhbFBvb2w9e307XHJcbnZhciBhcHBwYXRoPVwiXCI7XHJcbnZhciBic2VhcmNoPXJlcXVpcmUoXCIuL2JzZWFyY2hcIik7XHJcbnZhciBLZGI9cmVxdWlyZSgna3NhbmEtanNvbnJvbScpO1xyXG52YXIga2Ricz1bXTsgLy9hdmFpbGFibGUga2RiICwgaWQgYW5kIGFic29sdXRlIHBhdGhcclxudmFyIHN0cnNlcD1cIlxcdWZmZmZcIjtcclxudmFyIGtkYmxpc3RlZD1mYWxzZTtcclxuLypcclxudmFyIF9nZXRTeW5jPWZ1bmN0aW9uKHBhdGhzLG9wdHMpIHtcclxuXHR2YXIgb3V0PVtdO1xyXG5cdGZvciAodmFyIGkgaW4gcGF0aHMpIHtcclxuXHRcdG91dC5wdXNoKHRoaXMuZ2V0U3luYyhwYXRoc1tpXSxvcHRzKSk7XHRcclxuXHR9XHJcblx0cmV0dXJuIG91dDtcclxufVxyXG4qL1xyXG52YXIgX2dldHM9ZnVuY3Rpb24ocGF0aHMsb3B0cyxjYikgeyAvL2dldCBtYW55IGRhdGEgd2l0aCBvbmUgY2FsbFxyXG5cclxuXHRpZiAoIXBhdGhzKSByZXR1cm4gO1xyXG5cdGlmICh0eXBlb2YgcGF0aHM9PSdzdHJpbmcnKSB7XHJcblx0XHRwYXRocz1bcGF0aHNdO1xyXG5cdH1cclxuXHR2YXIgZW5naW5lPXRoaXMsIG91dHB1dD1bXTtcclxuXHJcblx0dmFyIG1ha2VjYj1mdW5jdGlvbihwYXRoKXtcclxuXHRcdHJldHVybiBmdW5jdGlvbihkYXRhKXtcclxuXHRcdFx0XHRpZiAoIShkYXRhICYmIHR5cGVvZiBkYXRhID09J29iamVjdCcgJiYgZGF0YS5fX2VtcHR5KSkgb3V0cHV0LnB1c2goZGF0YSk7XHJcblx0XHRcdFx0ZW5naW5lLmdldChwYXRoLG9wdHMsdGFza3F1ZXVlLnNoaWZ0KCkpO1xyXG5cdFx0fTtcclxuXHR9O1xyXG5cclxuXHR2YXIgdGFza3F1ZXVlPVtdO1xyXG5cdGZvciAodmFyIGk9MDtpPHBhdGhzLmxlbmd0aDtpKyspIHtcclxuXHRcdGlmICh0eXBlb2YgcGF0aHNbaV09PVwibnVsbFwiKSB7IC8vdGhpcyBpcyBvbmx5IGEgcGxhY2UgaG9sZGVyIGZvciBrZXkgZGF0YSBhbHJlYWR5IGluIGNsaWVudCBjYWNoZVxyXG5cdFx0XHRvdXRwdXQucHVzaChudWxsKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRhc2txdWV1ZS5wdXNoKG1ha2VjYihwYXRoc1tpXSkpO1xyXG5cdFx0fVxyXG5cdH07XHJcblxyXG5cdHRhc2txdWV1ZS5wdXNoKGZ1bmN0aW9uKGRhdGEpe1xyXG5cdFx0b3V0cHV0LnB1c2goZGF0YSk7XHJcblx0XHRjYi5hcHBseShlbmdpbmUuY29udGV4dHx8ZW5naW5lLFtvdXRwdXQscGF0aHNdKTsgLy9yZXR1cm4gdG8gY2FsbGVyXHJcblx0fSk7XHJcblxyXG5cdHRhc2txdWV1ZS5zaGlmdCgpKHtfX2VtcHR5OnRydWV9KTsgLy9ydW4gdGhlIHRhc2tcclxufVxyXG5cclxudmFyIGdldEZpbGVSYW5nZT1mdW5jdGlvbihpKSB7XHJcblx0dmFyIGVuZ2luZT10aGlzO1xyXG5cclxuXHR2YXIgZmlsZXNlZ2NvdW50PWVuZ2luZS5nZXQoW1wiZmlsZXNlZ2NvdW50XCJdKTtcclxuXHRpZiAoZmlsZXNlZ2NvdW50KSB7XHJcblx0XHRpZiAoaT09MCkge1xyXG5cdFx0XHRyZXR1cm4ge3N0YXJ0OjAsZW5kOmZpbGVzZWdjb3VudFswXS0xfTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiB7c3RhcnQ6ZmlsZXNlZ2NvdW50W2ktMV0sZW5kOmZpbGVzZWdjb3VudFtpXS0xfTtcclxuXHRcdH1cclxuXHR9XHJcblx0Ly9vbGQgYnVnZ3kgY29kZVxyXG5cdHZhciBmaWxlbmFtZXM9ZW5naW5lLmdldChbXCJmaWxlbmFtZXNcIl0pO1xyXG5cdHZhciBmaWxlb2Zmc2V0cz1lbmdpbmUuZ2V0KFtcImZpbGVvZmZzZXRzXCJdKTtcclxuXHR2YXIgc2Vnb2Zmc2V0cz1lbmdpbmUuZ2V0KFtcInNlZ29mZnNldHNcIl0pO1xyXG5cdHZhciBzZWduYW1lcz1lbmdpbmUuZ2V0KFtcInNlZ25hbWVzXCJdKTtcclxuXHR2YXIgZmlsZXN0YXJ0PWZpbGVvZmZzZXRzW2ldLCBmaWxlZW5kPWZpbGVvZmZzZXRzW2krMV0tMTtcclxuXHJcblx0dmFyIHN0YXJ0PWJzZWFyY2goc2Vnb2Zmc2V0cyxmaWxlc3RhcnQsdHJ1ZSk7XHJcblx0Ly9pZiAoc2VnT2Zmc2V0c1tzdGFydF09PWZpbGVTdGFydCkgc3RhcnQtLTtcclxuXHRcclxuXHQvL3dvcmsgYXJvdW5kIGZvciBqaWFuZ2thbmd5dXJcclxuXHR3aGlsZSAoc2VnTmFtZXNbc3RhcnQrMV09PVwiX1wiKSBzdGFydCsrO1xyXG5cclxuICAvL2lmIChpPT0wKSBzdGFydD0wOyAvL3dvcmsgYXJvdW5kIGZvciBmaXJzdCBmaWxlXHJcblx0dmFyIGVuZD1ic2VhcmNoKHNlZ29mZnNldHMsZmlsZWVuZCx0cnVlKTtcclxuXHRyZXR1cm4ge3N0YXJ0OnN0YXJ0LGVuZDplbmR9O1xyXG59XHJcblxyXG52YXIgZ2V0ZmlsZXNlZz1mdW5jdGlvbihhYnNvbHV0ZXNlZykge1xyXG5cdHZhciBmaWxlb2Zmc2V0cz10aGlzLmdldChbXCJmaWxlb2Zmc2V0c1wiXSk7XHJcblx0dmFyIHNlZ29mZnNldHM9dGhpcy5nZXQoW1wic2Vnb2Zmc2V0c1wiXSk7XHJcblx0dmFyIHNlZ29mZnNldD1zZWdPZmZzZXRzW2Fic29sdXRlc2VnXTtcclxuXHR2YXIgZmlsZT1ic2VhcmNoKGZpbGVPZmZzZXRzLHNlZ29mZnNldCx0cnVlKS0xO1xyXG5cclxuXHR2YXIgZmlsZVN0YXJ0PWZpbGVvZmZzZXRzW2ZpbGVdO1xyXG5cdHZhciBzdGFydD1ic2VhcmNoKHNlZ29mZnNldHMsZmlsZVN0YXJ0LHRydWUpO1x0XHJcblxyXG5cdHZhciBzZWc9YWJzb2x1dGVzZWctc3RhcnQtMTtcclxuXHRyZXR1cm4ge2ZpbGU6ZmlsZSxzZWc6c2VnfTtcclxufVxyXG4vL3JldHVybiBhcnJheSBvZiBvYmplY3Qgb2YgbmZpbGUgbnNlZyBnaXZlbiBzZWduYW1lXHJcbnZhciBmaW5kU2VnPWZ1bmN0aW9uKHNlZ25hbWUpIHtcclxuXHR2YXIgc2VnbmFtZXM9dGhpcy5nZXQoXCJzZWduYW1lc1wiKTtcclxuXHR2YXIgb3V0PVtdO1xyXG5cdGZvciAodmFyIGk9MDtpPHNlZ25hbWVzLmxlbmd0aDtpKyspIHtcclxuXHRcdGlmIChzZWduYW1lc1tpXT09c2VnbmFtZSkge1xyXG5cdFx0XHR2YXIgZmlsZXNlZz1nZXRmaWxlc2VnLmFwcGx5KHRoaXMsW2ldKTtcclxuXHRcdFx0b3V0LnB1c2goe2ZpbGU6ZmlsZXNlZy5maWxlLHNlZzpmaWxlc2VnLnNlZyxhYnNzZWc6aX0pO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRyZXR1cm4gb3V0O1xyXG59XHJcbnZhciBnZXRGaWxlU2VnT2Zmc2V0cz1mdW5jdGlvbihpKSB7XHJcblx0dmFyIHNlZ29mZnNldHM9dGhpcy5nZXQoXCJzZWdvZmZzZXRzXCIpO1xyXG5cdHZhciByYW5nZT1nZXRGaWxlUmFuZ2UuYXBwbHkodGhpcyxbaV0pO1xyXG5cdHJldHVybiBzZWdvZmZzZXRzLnNsaWNlKHJhbmdlLnN0YXJ0LHJhbmdlLmVuZCsxKTtcclxufVxyXG5cclxudmFyIGdldEZpbGVTZWdOYW1lcz1mdW5jdGlvbihpKSB7XHJcblx0dmFyIHJhbmdlPWdldEZpbGVSYW5nZS5hcHBseSh0aGlzLFtpXSk7XHJcblx0dmFyIHNlZ25hbWVzPXRoaXMuZ2V0KFwic2VnbmFtZXNcIik7XHJcblx0cmV0dXJuIHNlZ25hbWVzLnNsaWNlKHJhbmdlLnN0YXJ0LHJhbmdlLmVuZCsxKTtcclxufVxyXG52YXIgbG9jYWxlbmdpbmVfZ2V0PWZ1bmN0aW9uKHBhdGgsb3B0cyxjYikge1xyXG5cdHZhciBlbmdpbmU9dGhpcztcclxuXHRpZiAodHlwZW9mIG9wdHM9PVwiZnVuY3Rpb25cIikge1xyXG5cdFx0Y2I9b3B0cztcclxuXHRcdG9wdHM9e3JlY3Vyc2l2ZTpmYWxzZX07XHJcblx0fVxyXG5cdGlmICghcGF0aCkge1xyXG5cdFx0aWYgKGNiKSBjYihudWxsKTtcclxuXHRcdHJldHVybiBudWxsO1xyXG5cdH1cclxuXHJcblx0aWYgKHR5cGVvZiBjYiE9XCJmdW5jdGlvblwiKSB7XHJcblx0XHRyZXR1cm4gZW5naW5lLmtkYi5nZXQocGF0aCxvcHRzKTtcclxuXHR9XHJcblxyXG5cdGlmICh0eXBlb2YgcGF0aD09XCJzdHJpbmdcIikge1xyXG5cdFx0cmV0dXJuIGVuZ2luZS5rZGIuZ2V0KFtwYXRoXSxvcHRzLGNiKTtcclxuXHR9IGVsc2UgaWYgKHR5cGVvZiBwYXRoWzBdID09XCJzdHJpbmdcIikge1xyXG5cdFx0cmV0dXJuIGVuZ2luZS5rZGIuZ2V0KHBhdGgsb3B0cyxjYik7XHJcblx0fSBlbHNlIGlmICh0eXBlb2YgcGF0aFswXSA9PVwib2JqZWN0XCIpIHtcclxuXHRcdHJldHVybiBfZ2V0cy5hcHBseShlbmdpbmUsW3BhdGgsb3B0cyxjYl0pO1xyXG5cdH0gZWxzZSB7XHJcblx0XHRlbmdpbmUua2RiLmdldChbXSxvcHRzLGZ1bmN0aW9uKGRhdGEpe1xyXG5cdFx0XHRjYihkYXRhWzBdKTsvL3JldHVybiB0b3AgbGV2ZWwga2V5c1xyXG5cdFx0fSk7XHJcblx0fVxyXG59O1x0XHJcblxyXG52YXIgZ2V0UHJlbG9hZEZpZWxkPWZ1bmN0aW9uKHVzZXIpIHtcclxuXHR2YXIgcHJlbG9hZD1bW1wibWV0YVwiXSxbXCJmaWxlbmFtZXNcIl0sW1wiZmlsZW9mZnNldHNcIl0sW1wic2VnbmFtZXNcIl0sW1wic2Vnb2Zmc2V0c1wiXSxbXCJmaWxlc2VnY291bnRcIl1dO1xyXG5cdC8vW1widG9rZW5zXCJdLFtcInBvc3RpbmdzbGVuXCJdIGtzZSB3aWxsIGxvYWQgaXRcclxuXHRpZiAodXNlciAmJiB1c2VyLmxlbmd0aCkgeyAvL3VzZXIgc3VwcGx5IHByZWxvYWRcclxuXHRcdGZvciAodmFyIGk9MDtpPHVzZXIubGVuZ3RoO2krKykge1xyXG5cdFx0XHRpZiAocHJlbG9hZC5pbmRleE9mKHVzZXJbaV0pPT0tMSkge1xyXG5cdFx0XHRcdHByZWxvYWQucHVzaCh1c2VyW2ldKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHRyZXR1cm4gcHJlbG9hZDtcclxufVxyXG52YXIgY3JlYXRlTG9jYWxFbmdpbmU9ZnVuY3Rpb24oa2RiLG9wdHMsY2IsY29udGV4dCkge1xyXG5cdHZhciBlbmdpbmU9e2tkYjprZGIsIHF1ZXJ5Q2FjaGU6e30sIHBvc3RpbmdDYWNoZTp7fSwgY2FjaGU6e319O1xyXG5cclxuXHRpZiAodHlwZW9mIGNvbnRleHQ9PVwib2JqZWN0XCIpIGVuZ2luZS5jb250ZXh0PWNvbnRleHQ7XHJcblx0ZW5naW5lLmdldD1sb2NhbGVuZ2luZV9nZXQ7XHJcblxyXG5cdGVuZ2luZS5zZWdPZmZzZXQ9c2VnT2Zmc2V0O1xyXG5cdGVuZ2luZS5maWxlT2Zmc2V0PWZpbGVPZmZzZXQ7XHJcblx0ZW5naW5lLmdldEZpbGVTZWdOYW1lcz1nZXRGaWxlU2VnTmFtZXM7XHJcblx0ZW5naW5lLmdldEZpbGVTZWdPZmZzZXRzPWdldEZpbGVTZWdPZmZzZXRzO1xyXG5cdGVuZ2luZS5nZXRGaWxlUmFuZ2U9Z2V0RmlsZVJhbmdlO1xyXG5cdGVuZ2luZS5maW5kU2VnPWZpbmRTZWc7XHJcblx0Ly9vbmx5IGxvY2FsIGVuZ2luZSBhbGxvdyBnZXRTeW5jXHJcblx0Ly9pZiAoa2RiLmZzLmdldFN5bmMpIGVuZ2luZS5nZXRTeW5jPWVuZ2luZS5rZGIuZ2V0U3luYztcclxuXHRcclxuXHQvL3NwZWVkeSBuYXRpdmUgZnVuY3Rpb25zXHJcblx0aWYgKGtkYi5mcy5tZXJnZVBvc3RpbmdzKSB7XHJcblx0XHRlbmdpbmUubWVyZ2VQb3N0aW5ncz1rZGIuZnMubWVyZ2VQb3N0aW5ncy5iaW5kKGtkYi5mcyk7XHJcblx0fVxyXG5cdFxyXG5cdHZhciBzZXRQcmVsb2FkPWZ1bmN0aW9uKHJlcykge1xyXG5cdFx0ZW5naW5lLmRibmFtZT1yZXNbMF0ubmFtZTtcclxuXHRcdC8vZW5naW5lLmN1c3RvbWZ1bmM9Y3VzdG9tZnVuYy5nZXRBUEkocmVzWzBdLmNvbmZpZyk7XHJcblx0XHRlbmdpbmUucmVhZHk9dHJ1ZTtcclxuXHR9XHJcblxyXG5cdHZhciBwcmVsb2FkPWdldFByZWxvYWRGaWVsZChvcHRzLnByZWxvYWQpO1xyXG5cdHZhciBvcHRzPXtyZWN1cnNpdmU6dHJ1ZX07XHJcblx0Ly9pZiAodHlwZW9mIGNiPT1cImZ1bmN0aW9uXCIpIHtcclxuXHRcdF9nZXRzLmFwcGx5KGVuZ2luZSxbIHByZWxvYWQsIG9wdHMsZnVuY3Rpb24ocmVzKXtcclxuXHRcdFx0c2V0UHJlbG9hZChyZXMpO1xyXG5cdFx0XHRjYi5hcHBseShlbmdpbmUuY29udGV4dCxbZW5naW5lXSk7XHJcblx0XHR9XSk7XHJcblx0Ly99IGVsc2Uge1xyXG5cdC8vXHRzZXRQcmVsb2FkKF9nZXRTeW5jLmFwcGx5KGVuZ2luZSxbcHJlbG9hZCxvcHRzXSkpO1xyXG5cdC8vfVxyXG5cdHJldHVybiBlbmdpbmU7XHJcbn1cclxuXHJcbnZhciBzZWdPZmZzZXQ9ZnVuY3Rpb24oc2VnbmFtZSkge1xyXG5cdHZhciBlbmdpbmU9dGhpcztcclxuXHRpZiAoYXJndW1lbnRzLmxlbmd0aD4xKSB0aHJvdyBcImFyZ3VtZW50IDogc2VnbmFtZSBcIjtcclxuXHJcblx0dmFyIHNlZ05hbWVzPWVuZ2luZS5nZXQoXCJzZWduYW1lc1wiKTtcclxuXHR2YXIgc2VnT2Zmc2V0cz1lbmdpbmUuZ2V0KFwic2Vnb2Zmc2V0c1wiKTtcclxuXHJcblx0dmFyIGk9c2VnTmFtZXMuaW5kZXhPZihzZWduYW1lKTtcclxuXHRyZXR1cm4gKGk+LTEpP3NlZ09mZnNldHNbaV06MDtcclxufVxyXG52YXIgZmlsZU9mZnNldD1mdW5jdGlvbihmbikge1xyXG5cdHZhciBlbmdpbmU9dGhpcztcclxuXHR2YXIgZmlsZW5hbWVzPWVuZ2luZS5nZXQoXCJmaWxlbmFtZXNcIik7XHJcblx0dmFyIG9mZnNldHM9ZW5naW5lLmdldChcImZpbGVvZmZzZXRzXCIpO1xyXG5cdHZhciBpPWZpbGVuYW1lcy5pbmRleE9mKGZuKTtcclxuXHRpZiAoaT09LTEpIHJldHVybiBudWxsO1xyXG5cdHJldHVybiB7c3RhcnQ6IG9mZnNldHNbaV0sIGVuZDpvZmZzZXRzW2krMV19O1xyXG59XHJcblxyXG52YXIgZm9sZGVyT2Zmc2V0PWZ1bmN0aW9uKGZvbGRlcikge1xyXG5cdHZhciBlbmdpbmU9dGhpcztcclxuXHR2YXIgc3RhcnQ9MCxlbmQ9MDtcclxuXHR2YXIgZmlsZW5hbWVzPWVuZ2luZS5nZXQoXCJmaWxlbmFtZXNcIik7XHJcblx0dmFyIG9mZnNldHM9ZW5naW5lLmdldChcImZpbGVvZmZzZXRzXCIpO1xyXG5cdGZvciAodmFyIGk9MDtpPGZpbGVuYW1lcy5sZW5ndGg7aSsrKSB7XHJcblx0XHRpZiAoZmlsZW5hbWVzW2ldLnN1YnN0cmluZygwLGZvbGRlci5sZW5ndGgpPT1mb2xkZXIpIHtcclxuXHRcdFx0aWYgKCFzdGFydCkgc3RhcnQ9b2Zmc2V0c1tpXTtcclxuXHRcdFx0ZW5kPW9mZnNldHNbaV07XHJcblx0XHR9IGVsc2UgaWYgKHN0YXJ0KSBicmVhaztcclxuXHR9XHJcblx0cmV0dXJuIHtzdGFydDpzdGFydCxlbmQ6ZW5kfTtcclxufVxyXG5cclxuIC8vVE9ETyBkZWxldGUgZGlyZWN0bHkgZnJvbSBrZGIgaW5zdGFuY2VcclxuIC8va2RiLmZyZWUoKTtcclxudmFyIGNsb3NlTG9jYWw9ZnVuY3Rpb24oa2RiaWQpIHtcclxuXHR2YXIgZW5naW5lPWxvY2FsUG9vbFtrZGJpZF07XHJcblx0aWYgKGVuZ2luZSkge1xyXG5cdFx0ZW5naW5lLmtkYi5mcmVlKCk7XHJcblx0XHRkZWxldGUgbG9jYWxQb29sW2tkYmlkXTtcclxuXHR9XHJcbn1cclxudmFyIGNsb3NlPWZ1bmN0aW9uKGtkYmlkKSB7XHJcblx0dmFyIGVuZ2luZT1wb29sW2tkYmlkXTtcclxuXHRpZiAoZW5naW5lKSB7XHJcblx0XHRlbmdpbmUua2RiLmZyZWUoKTtcclxuXHRcdGRlbGV0ZSBwb29sW2tkYmlkXTtcclxuXHR9XHJcbn1cclxuXHJcbnZhciBnZXRMb2NhbFRyaWVzPWZ1bmN0aW9uKGtkYmZuKSB7XHJcblx0aWYgKCFrZGJsaXN0ZWQpIHtcclxuXHRcdGtkYnM9cmVxdWlyZShcIi4vbGlzdGtkYlwiKSgpO1xyXG5cdFx0a2RibGlzdGVkPXRydWU7XHJcblx0fVxyXG5cclxuXHR2YXIga2RiaWQ9a2RiZm4ucmVwbGFjZSgnLmtkYicsJycpO1xyXG5cdHZhciB0cmllcz0gW1wiLi9cIitrZGJpZCtcIi5rZGJcIlxyXG5cdCAgICAgICAgICAgLFwiLi4vXCIra2RiaWQrXCIua2RiXCJcclxuXHRdO1xyXG5cclxuXHRmb3IgKHZhciBpPTA7aTxrZGJzLmxlbmd0aDtpKyspIHtcclxuXHRcdGlmIChrZGJzW2ldWzBdPT1rZGJpZCkge1xyXG5cdFx0XHR0cmllcy5wdXNoKGtkYnNbaV1bMV0pO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRyZXR1cm4gdHJpZXM7XHJcbn1cclxudmFyIG9wZW5Mb2NhbEtzYW5hZ2FwPWZ1bmN0aW9uKGtkYmlkLG9wdHMsY2IsY29udGV4dCkge1xyXG5cdHZhciBrZGJmbj1rZGJpZDtcclxuXHR2YXIgdHJpZXM9Z2V0TG9jYWxUcmllcyhrZGJmbik7XHJcblxyXG5cdGZvciAodmFyIGk9MDtpPHRyaWVzLmxlbmd0aDtpKyspIHtcclxuXHRcdGlmIChmcy5leGlzdHNTeW5jKHRyaWVzW2ldKSkge1xyXG5cdFx0XHQvL2NvbnNvbGUubG9nKFwia2RiIHBhdGg6IFwiK25vZGVSZXF1aXJlKCdwYXRoJykucmVzb2x2ZSh0cmllc1tpXSkpO1xyXG5cdFx0XHR2YXIga2RiPW5ldyBLZGIub3Blbih0cmllc1tpXSxmdW5jdGlvbihlcnIsa2RiKXtcclxuXHRcdFx0XHRpZiAoZXJyKSB7XHJcblx0XHRcdFx0XHRjYi5hcHBseShjb250ZXh0LFtlcnJdKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0Y3JlYXRlTG9jYWxFbmdpbmUoa2RiLG9wdHMsZnVuY3Rpb24oZW5naW5lKXtcclxuXHRcdFx0XHRcdFx0bG9jYWxQb29sW2tkYmlkXT1lbmdpbmU7XHJcblx0XHRcdFx0XHRcdGNiLmFwcGx5KGNvbnRleHR8fGVuZ2luZS5jb250ZXh0LFswLGVuZ2luZV0pO1xyXG5cdFx0XHRcdFx0fSxjb250ZXh0KTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pO1xyXG5cdFx0XHRyZXR1cm4gbnVsbDtcclxuXHRcdH1cclxuXHR9XHJcblx0aWYgKGNiKSBjYi5hcHBseShjb250ZXh0LFtrZGJpZCtcIiBub3QgZm91bmRcIl0pO1xyXG5cdHJldHVybiBudWxsO1xyXG5cclxufVxyXG52YXIgb3BlbkxvY2FsTm9kZT1mdW5jdGlvbihrZGJpZCxvcHRzLGNiLGNvbnRleHQpIHtcclxuXHR2YXIgZnM9cmVxdWlyZSgnZnMnKTtcclxuXHR2YXIgdHJpZXM9Z2V0TG9jYWxUcmllcyhrZGJpZCk7XHJcblxyXG5cdGZvciAodmFyIGk9MDtpPHRyaWVzLmxlbmd0aDtpKyspIHtcclxuXHRcdGlmIChmcy5leGlzdHNTeW5jKHRyaWVzW2ldKSkge1xyXG5cclxuXHRcdFx0bmV3IEtkYi5vcGVuKHRyaWVzW2ldLGZ1bmN0aW9uKGVycixrZGIpe1xyXG5cdFx0XHRcdGlmIChlcnIpIHtcclxuXHRcdFx0XHRcdGNiLmFwcGx5KGNvbnRleHR8fGVuZ2luZS5jb250ZW50LFtlcnJdKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0Y3JlYXRlTG9jYWxFbmdpbmUoa2RiLG9wdHMsZnVuY3Rpb24oZW5naW5lKXtcclxuXHRcdFx0XHRcdFx0XHRsb2NhbFBvb2xba2RiaWRdPWVuZ2luZTtcclxuXHRcdFx0XHRcdFx0XHRjYi5hcHBseShjb250ZXh0fHxlbmdpbmUuY29udGV4dCxbMCxlbmdpbmVdKTtcclxuXHRcdFx0XHRcdH0sY29udGV4dCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHRcdFx0cmV0dXJuIG51bGw7XHJcblx0XHR9XHJcblx0fVxyXG5cdGlmIChjYikgY2IuYXBwbHkoY29udGV4dCxba2RiaWQrXCIgbm90IGZvdW5kXCJdKTtcclxuXHRyZXR1cm4gbnVsbDtcclxufVxyXG5cclxudmFyIG9wZW5Mb2NhbEh0bWw1PWZ1bmN0aW9uKGtkYmlkLG9wdHMsY2IsY29udGV4dCkge1x0XHJcblx0dmFyIGVuZ2luZT1sb2NhbFBvb2xba2RiaWRdO1xyXG5cdHZhciBrZGJmbj1rZGJpZDtcclxuXHRpZiAoa2RiZm4uaW5kZXhPZihcIi5rZGJcIik9PS0xKSBrZGJmbis9XCIua2RiXCI7XHJcblx0bmV3IEtkYi5vcGVuKGtkYmZuLGZ1bmN0aW9uKGVycixoYW5kbGUpe1xyXG5cdFx0aWYgKGVycikge1xyXG5cdFx0XHRjYi5hcHBseShjb250ZXh0LFtlcnJdKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGNyZWF0ZUxvY2FsRW5naW5lKGhhbmRsZSxvcHRzLGZ1bmN0aW9uKGVuZ2luZSl7XHJcblx0XHRcdFx0bG9jYWxQb29sW2tkYmlkXT1lbmdpbmU7XHJcblx0XHRcdFx0Y2IuYXBwbHkoY29udGV4dHx8ZW5naW5lLmNvbnRleHQsWzAsZW5naW5lXSk7XHJcblx0XHRcdH0sY29udGV4dCk7XHJcblx0XHR9XHJcblx0fSk7XHJcbn1cclxuLy9vbWl0IGNiIGZvciBzeW5jcm9uaXplIG9wZW5cclxudmFyIG9wZW5Mb2NhbD1mdW5jdGlvbihrZGJpZCxvcHRzLGNiLGNvbnRleHQpICB7XHJcblx0aWYgKHR5cGVvZiBvcHRzPT1cImZ1bmN0aW9uXCIpIHsgLy9ubyBvcHRzXHJcblx0XHRpZiAodHlwZW9mIGNiPT1cIm9iamVjdFwiKSBjb250ZXh0PWNiO1xyXG5cdFx0Y2I9b3B0cztcclxuXHRcdG9wdHM9e307XHJcblx0fVxyXG5cclxuXHR2YXIgZW5naW5lPWxvY2FsUG9vbFtrZGJpZF07XHJcblx0aWYgKGVuZ2luZSkge1xyXG5cdFx0aWYgKGNiKSBjYi5hcHBseShjb250ZXh0fHxlbmdpbmUuY29udGV4dCxbMCxlbmdpbmVdKTtcclxuXHRcdHJldHVybiBlbmdpbmU7XHJcblx0fVxyXG5cclxuXHR2YXIgcGxhdGZvcm09cmVxdWlyZShcIi4vcGxhdGZvcm1cIikuZ2V0UGxhdGZvcm0oKTtcclxuXHRpZiAocGxhdGZvcm09PVwibm9kZS13ZWJraXRcIiB8fCBwbGF0Zm9ybT09XCJub2RlXCIpIHtcclxuXHRcdG9wZW5Mb2NhbE5vZGUoa2RiaWQsb3B0cyxjYixjb250ZXh0KTtcclxuXHR9IGVsc2UgaWYgKHBsYXRmb3JtPT1cImh0bWw1XCIgfHwgcGxhdGZvcm09PVwiY2hyb21lXCIpe1xyXG5cdFx0b3BlbkxvY2FsSHRtbDUoa2RiaWQsb3B0cyxjYixjb250ZXh0KTtcdFx0XHJcblx0fSBlbHNlIHtcclxuXHRcdG9wZW5Mb2NhbEtzYW5hZ2FwKGtkYmlkLG9wdHMsY2IsY29udGV4dCk7XHRcclxuXHR9XHJcbn1cclxudmFyIHNldFBhdGg9ZnVuY3Rpb24ocGF0aCkge1xyXG5cdGFwcHBhdGg9cGF0aDtcclxuXHRjb25zb2xlLmxvZyhcInNldCBwYXRoXCIscGF0aClcclxufVxyXG5cclxudmFyIGVudW1LZGI9ZnVuY3Rpb24oY2IsY29udGV4dCl7XHJcblx0cmV0dXJuIGtkYnMubWFwKGZ1bmN0aW9uKGspe3JldHVybiBrWzBdfSk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzPXtvcGVuOm9wZW5Mb2NhbCxzZXRQYXRoOnNldFBhdGgsIGNsb3NlOmNsb3NlTG9jYWwsIGVudW1LZGI6ZW51bUtkYn07IiwiLyogcmV0dXJuIGFycmF5IG9mIGRiaWQgYW5kIGFic29sdXRlIHBhdGgqL1xyXG52YXIgbGlzdGtkYl9odG1sNT1mdW5jdGlvbigpIHtcclxuXHR0aHJvdyBcIm5vdCBpbXBsZW1lbnQgeWV0XCI7XHJcblx0cmVxdWlyZShcImtzYW5hLWpzb25yb21cIikuaHRtbDVmcy5yZWFkZGlyKGZ1bmN0aW9uKGtkYnMpe1xyXG5cdFx0XHRjYi5hcHBseSh0aGlzLFtrZGJzXSk7XHJcblx0fSxjb250ZXh0fHx0aGlzKTtcdFx0XHJcblxyXG59XHJcblxyXG52YXIgbGlzdGtkYl9ub2RlPWZ1bmN0aW9uKCl7XHJcblx0dmFyIGZzPXJlcXVpcmUoXCJmc1wiKTtcclxuXHR2YXIgcGF0aD1yZXF1aXJlKFwicGF0aFwiKVxyXG5cdHZhciBwYXJlbnQ9cGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksXCIuLlwiKTtcclxuXHR2YXIgZmlsZXM9ZnMucmVhZGRpclN5bmMocGFyZW50KTtcclxuXHR2YXIgb3V0cHV0PVtdO1xyXG5cdGZpbGVzLm1hcChmdW5jdGlvbihmKXtcclxuXHRcdHZhciBzdWJkaXI9cGFyZW50K3BhdGguc2VwK2Y7XHJcblx0XHR2YXIgc3RhdD1mcy5zdGF0U3luYyhzdWJkaXIgKTtcclxuXHRcdGlmIChzdGF0LmlzRGlyZWN0b3J5KCkpIHtcclxuXHRcdFx0dmFyIHN1YmZpbGVzPWZzLnJlYWRkaXJTeW5jKHN1YmRpcik7XHJcblx0XHRcdGZvciAodmFyIGk9MDtpPHN1YmZpbGVzLmxlbmd0aDtpKyspIHtcclxuXHRcdFx0XHR2YXIgZmlsZT1zdWJmaWxlc1tpXTtcclxuXHRcdFx0XHR2YXIgaWR4PWZpbGUuaW5kZXhPZihcIi5rZGJcIik7XHJcblx0XHRcdFx0aWYgKGlkeD4tMSYmaWR4PT1maWxlLmxlbmd0aC00KSB7XHJcblx0XHRcdFx0XHRvdXRwdXQucHVzaChbIGZpbGUuc3Vic3RyKDAsZmlsZS5sZW5ndGgtNCksIHN1YmRpcitwYXRoLnNlcCtmaWxlXSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fSlcclxuXHRyZXR1cm4gb3V0cHV0O1xyXG59XHJcblxyXG52YXIgbGlzdGtkYj1mdW5jdGlvbigpIHtcclxuXHR2YXIgcGxhdGZvcm09cmVxdWlyZShcIi4vcGxhdGZvcm1cIikuZ2V0UGxhdGZvcm0oKTtcclxuXHR2YXIgZmlsZXM9W107XHJcblx0aWYgKHBsYXRmb3JtPT1cIm5vZGVcIiB8fCBwbGF0Zm9ybT09XCJub2RlLXdlYmtpdFwiKSB7XHJcblx0XHRmaWxlcz1saXN0a2RiX25vZGUoKTtcclxuXHR9IGVsc2Uge1xyXG5cdFx0dGhyb3cgXCJub3QgaW1wbGVtZW50IHlldFwiO1xyXG5cdH1cclxuXHRyZXR1cm4gZmlsZXM7XHJcbn1cclxubW9kdWxlLmV4cG9ydHM9bGlzdGtkYjsiLCJ2YXIgZ2V0UGxhdGZvcm09ZnVuY3Rpb24oKSB7XHJcblx0aWYgKHR5cGVvZiBrc2FuYWdhcD09XCJ1bmRlZmluZWRcIikge1xyXG5cdFx0cGxhdGZvcm09XCJub2RlXCI7XHJcblx0fSBlbHNlIHtcclxuXHRcdHBsYXRmb3JtPWtzYW5hZ2FwLnBsYXRmb3JtO1xyXG5cdH1cclxuXHRyZXR1cm4gcGxhdGZvcm07XHJcbn1cclxubW9kdWxlLmV4cG9ydHM9e2dldFBsYXRmb3JtOmdldFBsYXRmb3JtfTsiLCJcclxuLyogZW11bGF0ZSBmaWxlc3lzdGVtIG9uIGh0bWw1IGJyb3dzZXIgKi9cclxuLyogZW11bGF0ZSBmaWxlc3lzdGVtIG9uIGh0bWw1IGJyb3dzZXIgKi9cclxudmFyIHJlYWQ9ZnVuY3Rpb24oaGFuZGxlLGJ1ZmZlcixvZmZzZXQsbGVuZ3RoLHBvc2l0aW9uLGNiKSB7Ly9idWZmZXIgYW5kIG9mZnNldCBpcyBub3QgdXNlZFxyXG5cdHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuXHR4aHIub3BlbignR0VUJywgaGFuZGxlLnVybCAsIHRydWUpO1xyXG5cdHZhciByYW5nZT1bcG9zaXRpb24sbGVuZ3RoK3Bvc2l0aW9uLTFdO1xyXG5cdHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdSYW5nZScsICdieXRlcz0nK3JhbmdlWzBdKyctJytyYW5nZVsxXSk7XHJcblx0eGhyLnJlc3BvbnNlVHlwZSA9ICdhcnJheWJ1ZmZlcic7XHJcblx0eGhyLnNlbmQoKTtcclxuXHR4aHIub25sb2FkID0gZnVuY3Rpb24oZSkge1xyXG5cdFx0dmFyIHRoYXQ9dGhpcztcclxuXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuXHRcdFx0Y2IoMCx0aGF0LnJlc3BvbnNlLmJ5dGVMZW5ndGgsdGhhdC5yZXNwb25zZSk7XHJcblx0XHR9LDApO1xyXG5cdH07IFxyXG59XHJcbnZhciBjbG9zZT1mdW5jdGlvbihoYW5kbGUpIHt9XHJcbnZhciBmc3RhdFN5bmM9ZnVuY3Rpb24oaGFuZGxlKSB7XHJcblx0dGhyb3cgXCJub3QgaW1wbGVtZW50IHlldFwiO1xyXG59XHJcbnZhciBmc3RhdD1mdW5jdGlvbihoYW5kbGUsY2IpIHtcclxuXHR0aHJvdyBcIm5vdCBpbXBsZW1lbnQgeWV0XCI7XHJcbn1cclxudmFyIF9vcGVuPWZ1bmN0aW9uKGZuX3VybCxjYikge1xyXG5cdFx0dmFyIGhhbmRsZT17fTtcclxuXHRcdGlmIChmbl91cmwuaW5kZXhPZihcImZpbGVzeXN0ZW06XCIpPT0wKXtcclxuXHRcdFx0aGFuZGxlLnVybD1mbl91cmw7XHJcblx0XHRcdGhhbmRsZS5mbj1mbl91cmwuc3Vic3RyKCBmbl91cmwubGFzdEluZGV4T2YoXCIvXCIpKzEpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0aGFuZGxlLmZuPWZuX3VybDtcclxuXHRcdFx0dmFyIHVybD1BUEkuZmlsZXMuZmlsdGVyKGZ1bmN0aW9uKGYpeyByZXR1cm4gKGZbMF09PWZuX3VybCl9KTtcclxuXHRcdFx0aWYgKHVybC5sZW5ndGgpIGhhbmRsZS51cmw9dXJsWzBdWzFdO1xyXG5cdFx0XHRlbHNlIGNiKG51bGwpO1xyXG5cdFx0fVxyXG5cdFx0Y2IoaGFuZGxlKTtcclxufVxyXG52YXIgb3Blbj1mdW5jdGlvbihmbl91cmwsY2IpIHtcclxuXHRcdGlmICghQVBJLmluaXRpYWxpemVkKSB7aW5pdCgxMDI0KjEwMjQsZnVuY3Rpb24oKXtcclxuXHRcdFx0X29wZW4uYXBwbHkodGhpcyxbZm5fdXJsLGNiXSk7XHJcblx0XHR9LHRoaXMpfSBlbHNlIF9vcGVuLmFwcGx5KHRoaXMsW2ZuX3VybCxjYl0pO1xyXG59XHJcbnZhciBsb2FkPWZ1bmN0aW9uKGZpbGVuYW1lLG1vZGUsY2IpIHtcclxuXHRvcGVuKGZpbGVuYW1lLG1vZGUsY2IsdHJ1ZSk7XHJcbn1cclxuZnVuY3Rpb24gZXJyb3JIYW5kbGVyKGUpIHtcclxuXHRjb25zb2xlLmVycm9yKCdFcnJvcjogJyArZS5uYW1lKyBcIiBcIitlLm1lc3NhZ2UpO1xyXG59XHJcbnZhciByZWFkZGlyPWZ1bmN0aW9uKGNiLGNvbnRleHQpIHtcclxuXHQgdmFyIGRpclJlYWRlciA9IEFQSS5mcy5yb290LmNyZWF0ZVJlYWRlcigpO1xyXG5cdCB2YXIgb3V0PVtdLHRoYXQ9dGhpcztcclxuXHRcdGRpclJlYWRlci5yZWFkRW50cmllcyhmdW5jdGlvbihlbnRyaWVzKSB7XHJcblx0XHRcdGlmIChlbnRyaWVzLmxlbmd0aCkge1xyXG5cdFx0XHRcdGZvciAodmFyIGkgPSAwLCBlbnRyeTsgZW50cnkgPSBlbnRyaWVzW2ldOyArK2kpIHtcclxuXHRcdFx0XHRcdGlmIChlbnRyeS5pc0ZpbGUpIHtcclxuXHRcdFx0XHRcdFx0b3V0LnB1c2goW2VudHJ5Lm5hbWUsZW50cnkudG9VUkwgPyBlbnRyeS50b1VSTCgpIDogZW50cnkudG9VUkkoKV0pO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRBUEkuZmlsZXM9b3V0O1xyXG5cdFx0XHRpZiAoY2IpIGNiLmFwcGx5KGNvbnRleHQsW291dF0pO1xyXG5cdFx0fSwgZnVuY3Rpb24oKXtcclxuXHRcdFx0aWYgKGNiKSBjYi5hcHBseShjb250ZXh0LFtudWxsXSk7XHJcblx0XHR9KTtcclxufVxyXG52YXIgaW5pdGZzPWZ1bmN0aW9uKGdyYW50ZWRCeXRlcyxjYixjb250ZXh0KSB7XHJcblx0d2Via2l0UmVxdWVzdEZpbGVTeXN0ZW0oUEVSU0lTVEVOVCwgZ3JhbnRlZEJ5dGVzLCAgZnVuY3Rpb24oZnMpIHtcclxuXHRcdEFQSS5mcz1mcztcclxuXHRcdEFQSS5xdW90YT1ncmFudGVkQnl0ZXM7XHJcblx0XHRyZWFkZGlyKGZ1bmN0aW9uKCl7XHJcblx0XHRcdEFQSS5pbml0aWFsaXplZD10cnVlO1xyXG5cdFx0XHRjYi5hcHBseShjb250ZXh0LFtncmFudGVkQnl0ZXMsZnNdKTtcclxuXHRcdH0sY29udGV4dCk7XHJcblx0fSwgZXJyb3JIYW5kbGVyKTtcclxufVxyXG52YXIgaW5pdD1mdW5jdGlvbihxdW90YSxjYixjb250ZXh0KSB7XHJcblx0bmF2aWdhdG9yLndlYmtpdFBlcnNpc3RlbnRTdG9yYWdlLnJlcXVlc3RRdW90YShxdW90YSwgXHJcblx0XHRcdGZ1bmN0aW9uKGdyYW50ZWRCeXRlcykge1xyXG5cdFx0XHRcdGluaXRmcyhncmFudGVkQnl0ZXMsY2IsY29udGV4dCk7XHJcblx0XHR9LCBlcnJvckhhbmRsZXIgXHJcblx0KTtcclxufVxyXG52YXIgQVBJPXtcclxuXHRyZWFkOnJlYWRcclxuXHQscmVhZGRpcjpyZWFkZGlyXHJcblx0LG9wZW46b3BlblxyXG5cdCxjbG9zZTpjbG9zZVxyXG5cdCxmc3RhdFN5bmM6ZnN0YXRTeW5jXHJcblx0LGZzdGF0OmZzdGF0XHJcbn1cclxubW9kdWxlLmV4cG9ydHM9QVBJOyIsIm1vZHVsZS5leHBvcnRzPXtcclxuXHRvcGVuOnJlcXVpcmUoXCIuL2tkYlwiKVxyXG5cdCxjcmVhdGU6cmVxdWlyZShcIi4va2Rid1wiKVxyXG59XHJcbiIsIi8qXHJcblx0S0RCIHZlcnNpb24gMy4wIEdQTFxyXG5cdHlhcGNoZWFoc2hlbkBnbWFpbC5jb21cclxuXHQyMDEzLzEyLzI4XHJcblx0YXN5bmNyb25pemUgdmVyc2lvbiBvZiB5YWRiXHJcblxyXG4gIHJlbW92ZSBkZXBlbmRlbmN5IG9mIFEsIHRoYW5rcyB0b1xyXG4gIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNDIzNDYxOS9ob3ctdG8tYXZvaWQtbG9uZy1uZXN0aW5nLW9mLWFzeW5jaHJvbm91cy1mdW5jdGlvbnMtaW4tbm9kZS1qc1xyXG5cclxuICAyMDE1LzEvMlxyXG4gIG1vdmVkIHRvIGtzYW5hZm9yZ2Uva3NhbmEtanNvbnJvbVxyXG4gIGFkZCBlcnIgaW4gY2FsbGJhY2sgZm9yIG5vZGUuanMgY29tcGxpYW50XHJcbiovXHJcbnZhciBLZnM9bnVsbDtcclxuXHJcbmlmICh0eXBlb2Yga3NhbmFnYXA9PVwidW5kZWZpbmVkXCIpIHtcclxuXHRLZnM9cmVxdWlyZSgnLi9rZGJmcycpO1x0XHRcdFxyXG59IGVsc2Uge1xyXG5cdGlmIChrc2FuYWdhcC5wbGF0Zm9ybT09XCJpb3NcIikge1xyXG5cdFx0S2ZzPXJlcXVpcmUoXCIuL2tkYmZzX2lvc1wiKTtcclxuXHR9IGVsc2UgaWYgKGtzYW5hZ2FwLnBsYXRmb3JtPT1cIm5vZGUtd2Via2l0XCIpIHtcclxuXHRcdEtmcz1yZXF1aXJlKFwiLi9rZGJmc1wiKTtcclxuXHR9IGVsc2UgaWYgKGtzYW5hZ2FwLnBsYXRmb3JtPT1cImNocm9tZVwiKSB7XHJcblx0XHRLZnM9cmVxdWlyZShcIi4va2RiZnNcIik7XHJcblx0fSBlbHNlIHtcclxuXHRcdEtmcz1yZXF1aXJlKFwiLi9rZGJmc19hbmRyb2lkXCIpO1xyXG5cdH1cclxuXHRcdFxyXG59XHJcblxyXG5cclxudmFyIERUPXtcclxuXHR1aW50ODonMScsIC8vdW5zaWduZWQgMSBieXRlIGludGVnZXJcclxuXHRpbnQzMjonNCcsIC8vIHNpZ25lZCA0IGJ5dGVzIGludGVnZXJcclxuXHR1dGY4Oic4JywgIFxyXG5cdHVjczI6JzInLFxyXG5cdGJvb2w6J14nLCBcclxuXHRibG9iOicmJyxcclxuXHR1dGY4YXJyOicqJywgLy9zaGlmdCBvZiA4XHJcblx0dWNzMmFycjonQCcsIC8vc2hpZnQgb2YgMlxyXG5cdHVpbnQ4YXJyOichJywgLy9zaGlmdCBvZiAxXHJcblx0aW50MzJhcnI6JyQnLCAvL3NoaWZ0IG9mIDRcclxuXHR2aW50OidgJyxcclxuXHRwaW50Oid+JyxcdFxyXG5cclxuXHRhcnJheTonXFx1MDAxYicsXHJcblx0b2JqZWN0OidcXHUwMDFhJyBcclxuXHQvL3lkYiBzdGFydCB3aXRoIG9iamVjdCBzaWduYXR1cmUsXHJcblx0Ly90eXBlIGEgeWRiIGluIGNvbW1hbmQgcHJvbXB0IHNob3dzIG5vdGhpbmdcclxufVxyXG52YXIgdmVyYm9zZT0wLCByZWFkTG9nPWZ1bmN0aW9uKCl7fTtcclxudmFyIF9yZWFkTG9nPWZ1bmN0aW9uKHJlYWR0eXBlLGJ5dGVzKSB7XHJcblx0Y29uc29sZS5sb2cocmVhZHR5cGUsYnl0ZXMsXCJieXRlc1wiKTtcclxufVxyXG5pZiAodmVyYm9zZSkgcmVhZExvZz1fcmVhZExvZztcclxudmFyIHN0cnNlcD1cIlxcdWZmZmZcIjtcclxudmFyIENyZWF0ZT1mdW5jdGlvbihwYXRoLG9wdHMsY2IpIHtcclxuXHQvKiBsb2FkeHh4IGZ1bmN0aW9ucyBtb3ZlIGZpbGUgcG9pbnRlciAqL1xyXG5cdC8vIGxvYWQgdmFyaWFibGUgbGVuZ3RoIGludFxyXG5cdGlmICh0eXBlb2Ygb3B0cz09XCJmdW5jdGlvblwiKSB7XHJcblx0XHRjYj1vcHRzO1xyXG5cdFx0b3B0cz17fTtcclxuXHR9XHJcblxyXG5cdFxyXG5cdHZhciBsb2FkVkludCA9ZnVuY3Rpb24ob3B0cyxibG9ja3NpemUsY291bnQsY2IpIHtcclxuXHRcdC8vaWYgKGNvdW50PT0wKSByZXR1cm4gW107XHJcblx0XHR2YXIgdGhhdD10aGlzO1xyXG5cclxuXHRcdHRoaXMuZnMucmVhZEJ1Zl9wYWNrZWRpbnQob3B0cy5jdXIsYmxvY2tzaXplLGNvdW50LHRydWUsZnVuY3Rpb24obyl7XHJcblx0XHRcdC8vY29uc29sZS5sb2coXCJ2aW50XCIpO1xyXG5cdFx0XHRvcHRzLmN1cis9by5hZHY7XHJcblx0XHRcdGNiLmFwcGx5KHRoYXQsW28uZGF0YV0pO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cdHZhciBsb2FkVkludDE9ZnVuY3Rpb24ob3B0cyxjYikge1xyXG5cdFx0dmFyIHRoYXQ9dGhpcztcclxuXHRcdGxvYWRWSW50LmFwcGx5KHRoaXMsW29wdHMsNiwxLGZ1bmN0aW9uKGRhdGEpe1xyXG5cdFx0XHQvL2NvbnNvbGUubG9nKFwidmludDFcIik7XHJcblx0XHRcdGNiLmFwcGx5KHRoYXQsW2RhdGFbMF1dKTtcclxuXHRcdH1dKVxyXG5cdH1cclxuXHQvL2ZvciBwb3N0aW5nc1xyXG5cdHZhciBsb2FkUEludCA9ZnVuY3Rpb24ob3B0cyxibG9ja3NpemUsY291bnQsY2IpIHtcclxuXHRcdHZhciB0aGF0PXRoaXM7XHJcblx0XHR0aGlzLmZzLnJlYWRCdWZfcGFja2VkaW50KG9wdHMuY3VyLGJsb2Nrc2l6ZSxjb3VudCxmYWxzZSxmdW5jdGlvbihvKXtcclxuXHRcdFx0Ly9jb25zb2xlLmxvZyhcInBpbnRcIik7XHJcblx0XHRcdG9wdHMuY3VyKz1vLmFkdjtcclxuXHRcdFx0Y2IuYXBwbHkodGhhdCxbby5kYXRhXSk7XHJcblx0XHR9KTtcclxuXHR9XHJcblx0Ly8gaXRlbSBjYW4gYmUgYW55IHR5cGUgKHZhcmlhYmxlIGxlbmd0aClcclxuXHQvLyBtYXhpbXVtIHNpemUgb2YgYXJyYXkgaXMgMVRCIDJeNDBcclxuXHQvLyBzdHJ1Y3R1cmU6XHJcblx0Ly8gc2lnbmF0dXJlLDUgYnl0ZXMgb2Zmc2V0LCBwYXlsb2FkLCBpdGVtbGVuZ3Roc1xyXG5cdHZhciBnZXRBcnJheUxlbmd0aD1mdW5jdGlvbihvcHRzLGNiKSB7XHJcblx0XHR2YXIgdGhhdD10aGlzO1xyXG5cdFx0dmFyIGRhdGFvZmZzZXQ9MDtcclxuXHJcblx0XHR0aGlzLmZzLnJlYWRVSTgob3B0cy5jdXIsZnVuY3Rpb24obGVuKXtcclxuXHRcdFx0dmFyIGxlbmd0aG9mZnNldD1sZW4qNDI5NDk2NzI5NjtcclxuXHRcdFx0b3B0cy5jdXIrKztcclxuXHRcdFx0dGhhdC5mcy5yZWFkVUkzMihvcHRzLmN1cixmdW5jdGlvbihsZW4pe1xyXG5cdFx0XHRcdG9wdHMuY3VyKz00O1xyXG5cdFx0XHRcdGRhdGFvZmZzZXQ9b3B0cy5jdXI7IC8va2VlcCB0aGlzXHJcblx0XHRcdFx0bGVuZ3Rob2Zmc2V0Kz1sZW47XHJcblx0XHRcdFx0b3B0cy5jdXIrPWxlbmd0aG9mZnNldDtcclxuXHJcblx0XHRcdFx0bG9hZFZJbnQxLmFwcGx5KHRoYXQsW29wdHMsZnVuY3Rpb24oY291bnQpe1xyXG5cdFx0XHRcdFx0bG9hZFZJbnQuYXBwbHkodGhhdCxbb3B0cyxjb3VudCo2LGNvdW50LGZ1bmN0aW9uKHN6KXtcdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0Y2Ioe2NvdW50OmNvdW50LHN6OnN6LG9mZnNldDpkYXRhb2Zmc2V0fSk7XHJcblx0XHRcdFx0XHR9XSk7XHJcblx0XHRcdFx0fV0pO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHR9KTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0dmFyIGxvYWRBcnJheSA9IGZ1bmN0aW9uKG9wdHMsYmxvY2tzaXplLGNiKSB7XHJcblx0XHR2YXIgdGhhdD10aGlzO1xyXG5cdFx0Z2V0QXJyYXlMZW5ndGguYXBwbHkodGhpcyxbb3B0cyxmdW5jdGlvbihMKXtcclxuXHRcdFx0XHR2YXIgbz1bXTtcclxuXHRcdFx0XHR2YXIgZW5kY3VyPW9wdHMuY3VyO1xyXG5cdFx0XHRcdG9wdHMuY3VyPUwub2Zmc2V0O1xyXG5cclxuXHRcdFx0XHRpZiAob3B0cy5sYXp5KSB7IFxyXG5cdFx0XHRcdFx0XHR2YXIgb2Zmc2V0PUwub2Zmc2V0O1xyXG5cdFx0XHRcdFx0XHRMLnN6Lm1hcChmdW5jdGlvbihzeil7XHJcblx0XHRcdFx0XHRcdFx0b1tvLmxlbmd0aF09c3Ryc2VwK29mZnNldC50b1N0cmluZygxNilcclxuXHRcdFx0XHRcdFx0XHRcdCAgICtzdHJzZXArc3oudG9TdHJpbmcoMTYpO1xyXG5cdFx0XHRcdFx0XHRcdG9mZnNldCs9c3o7XHJcblx0XHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdHZhciB0YXNrcXVldWU9W107XHJcblx0XHRcdFx0XHRmb3IgKHZhciBpPTA7aTxMLmNvdW50O2krKykge1xyXG5cdFx0XHRcdFx0XHR0YXNrcXVldWUucHVzaChcclxuXHRcdFx0XHRcdFx0XHQoZnVuY3Rpb24oc3ope1xyXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIChcclxuXHRcdFx0XHRcdFx0XHRcdFx0ZnVuY3Rpb24oZGF0YSl7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKHR5cGVvZiBkYXRhPT0nb2JqZWN0JyAmJiBkYXRhLl9fZW1wdHkpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdCAvL25vdCBwdXNoaW5nIHRoZSBmaXJzdCBjYWxsXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0fVx0ZWxzZSBvLnB1c2goZGF0YSk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0b3B0cy5ibG9ja3NpemU9c3o7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0bG9hZC5hcHBseSh0aGF0LFtvcHRzLCB0YXNrcXVldWUuc2hpZnQoKV0pO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0XHQpO1xyXG5cdFx0XHRcdFx0XHRcdH0pKEwuc3pbaV0pXHJcblx0XHRcdFx0XHRcdCk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHQvL2xhc3QgY2FsbCB0byBjaGlsZCBsb2FkXHJcblx0XHRcdFx0XHR0YXNrcXVldWUucHVzaChmdW5jdGlvbihkYXRhKXtcclxuXHRcdFx0XHRcdFx0by5wdXNoKGRhdGEpO1xyXG5cdFx0XHRcdFx0XHRvcHRzLmN1cj1lbmRjdXI7XHJcblx0XHRcdFx0XHRcdGNiLmFwcGx5KHRoYXQsW29dKTtcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0aWYgKG9wdHMubGF6eSkgY2IuYXBwbHkodGhhdCxbb10pO1xyXG5cdFx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdFx0dGFza3F1ZXVlLnNoaWZ0KCkoe19fZW1wdHk6dHJ1ZX0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XSlcclxuXHR9XHRcdFxyXG5cdC8vIGl0ZW0gY2FuIGJlIGFueSB0eXBlICh2YXJpYWJsZSBsZW5ndGgpXHJcblx0Ly8gc3VwcG9ydCBsYXp5IGxvYWRcclxuXHQvLyBzdHJ1Y3R1cmU6XHJcblx0Ly8gc2lnbmF0dXJlLDUgYnl0ZXMgb2Zmc2V0LCBwYXlsb2FkLCBpdGVtbGVuZ3RocywgXHJcblx0Ly8gICAgICAgICAgICAgICAgICAgIHN0cmluZ2FycmF5X3NpZ25hdHVyZSwga2V5c1xyXG5cdHZhciBsb2FkT2JqZWN0ID0gZnVuY3Rpb24ob3B0cyxibG9ja3NpemUsY2IpIHtcclxuXHRcdHZhciB0aGF0PXRoaXM7XHJcblx0XHR2YXIgc3RhcnQ9b3B0cy5jdXI7XHJcblx0XHRnZXRBcnJheUxlbmd0aC5hcHBseSh0aGlzLFtvcHRzLGZ1bmN0aW9uKEwpIHtcclxuXHRcdFx0b3B0cy5ibG9ja3NpemU9YmxvY2tzaXplLW9wdHMuY3VyK3N0YXJ0O1xyXG5cdFx0XHRsb2FkLmFwcGx5KHRoYXQsW29wdHMsZnVuY3Rpb24oa2V5cyl7IC8vbG9hZCB0aGUga2V5c1xyXG5cdFx0XHRcdGlmIChvcHRzLmtleXMpIHsgLy9jYWxsZXIgYXNrIGZvciBrZXlzXHJcblx0XHRcdFx0XHRrZXlzLm1hcChmdW5jdGlvbihrKSB7IG9wdHMua2V5cy5wdXNoKGspfSk7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHR2YXIgbz17fTtcclxuXHRcdFx0XHR2YXIgZW5kY3VyPW9wdHMuY3VyO1xyXG5cdFx0XHRcdG9wdHMuY3VyPUwub2Zmc2V0O1xyXG5cdFx0XHRcdGlmIChvcHRzLmxhenkpIHsgXHJcblx0XHRcdFx0XHR2YXIgb2Zmc2V0PUwub2Zmc2V0O1xyXG5cdFx0XHRcdFx0Zm9yICh2YXIgaT0wO2k8TC5zei5sZW5ndGg7aSsrKSB7XHJcblx0XHRcdFx0XHRcdC8vcHJlZml4IHdpdGggYSBcXDAsIGltcG9zc2libGUgZm9yIG5vcm1hbCBzdHJpbmdcclxuXHRcdFx0XHRcdFx0b1trZXlzW2ldXT1zdHJzZXArb2Zmc2V0LnRvU3RyaW5nKDE2KVxyXG5cdFx0XHRcdFx0XHRcdCAgICtzdHJzZXArTC5zeltpXS50b1N0cmluZygxNik7XHJcblx0XHRcdFx0XHRcdG9mZnNldCs9TC5zeltpXTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0dmFyIHRhc2txdWV1ZT1bXTtcclxuXHRcdFx0XHRcdGZvciAodmFyIGk9MDtpPEwuY291bnQ7aSsrKSB7XHJcblx0XHRcdFx0XHRcdHRhc2txdWV1ZS5wdXNoKFxyXG5cdFx0XHRcdFx0XHRcdChmdW5jdGlvbihzeixrZXkpe1xyXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIChcclxuXHRcdFx0XHRcdFx0XHRcdFx0ZnVuY3Rpb24oZGF0YSl7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKHR5cGVvZiBkYXRhPT0nb2JqZWN0JyAmJiBkYXRhLl9fZW1wdHkpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdC8vbm90IHNhdmluZyB0aGUgZmlyc3QgY2FsbDtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0b1trZXldPWRhdGE7IFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRvcHRzLmJsb2Nrc2l6ZT1zejtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAodmVyYm9zZSkgcmVhZExvZyhcImtleVwiLGtleSk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0bG9hZC5hcHBseSh0aGF0LFtvcHRzLCB0YXNrcXVldWUuc2hpZnQoKV0pO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0XHQpO1xyXG5cdFx0XHRcdFx0XHRcdH0pKEwuc3pbaV0sa2V5c1tpLTFdKVxyXG5cclxuXHRcdFx0XHRcdFx0KTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdC8vbGFzdCBjYWxsIHRvIGNoaWxkIGxvYWRcclxuXHRcdFx0XHRcdHRhc2txdWV1ZS5wdXNoKGZ1bmN0aW9uKGRhdGEpe1xyXG5cdFx0XHRcdFx0XHRvW2tleXNba2V5cy5sZW5ndGgtMV1dPWRhdGE7XHJcblx0XHRcdFx0XHRcdG9wdHMuY3VyPWVuZGN1cjtcclxuXHRcdFx0XHRcdFx0Y2IuYXBwbHkodGhhdCxbb10pO1xyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmIChvcHRzLmxhenkpIGNiLmFwcGx5KHRoYXQsW29dKTtcclxuXHRcdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRcdHRhc2txdWV1ZS5zaGlmdCgpKHtfX2VtcHR5OnRydWV9KTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1dKTtcclxuXHRcdH1dKTtcclxuXHR9XHJcblxyXG5cdC8vaXRlbSBpcyBzYW1lIGtub3duIHR5cGVcclxuXHR2YXIgbG9hZFN0cmluZ0FycmF5PWZ1bmN0aW9uKG9wdHMsYmxvY2tzaXplLGVuY29kaW5nLGNiKSB7XHJcblx0XHR2YXIgdGhhdD10aGlzO1xyXG5cdFx0dGhpcy5mcy5yZWFkU3RyaW5nQXJyYXkob3B0cy5jdXIsYmxvY2tzaXplLGVuY29kaW5nLGZ1bmN0aW9uKG8pe1xyXG5cdFx0XHRvcHRzLmN1cis9YmxvY2tzaXplO1xyXG5cdFx0XHRjYi5hcHBseSh0aGF0LFtvXSk7XHJcblx0XHR9KTtcclxuXHR9XHJcblx0dmFyIGxvYWRJbnRlZ2VyQXJyYXk9ZnVuY3Rpb24ob3B0cyxibG9ja3NpemUsdW5pdHNpemUsY2IpIHtcclxuXHRcdHZhciB0aGF0PXRoaXM7XHJcblx0XHRsb2FkVkludDEuYXBwbHkodGhpcyxbb3B0cyxmdW5jdGlvbihjb3VudCl7XHJcblx0XHRcdHZhciBvPXRoYXQuZnMucmVhZEZpeGVkQXJyYXkob3B0cy5jdXIsY291bnQsdW5pdHNpemUsZnVuY3Rpb24obyl7XHJcblx0XHRcdFx0b3B0cy5jdXIrPWNvdW50KnVuaXRzaXplO1xyXG5cdFx0XHRcdGNiLmFwcGx5KHRoYXQsW29dKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9XSk7XHJcblx0fVxyXG5cdHZhciBsb2FkQmxvYj1mdW5jdGlvbihibG9ja3NpemUsY2IpIHtcclxuXHRcdHZhciBvPXRoaXMuZnMucmVhZEJ1Zih0aGlzLmN1cixibG9ja3NpemUpO1xyXG5cdFx0dGhpcy5jdXIrPWJsb2Nrc2l6ZTtcclxuXHRcdHJldHVybiBvO1xyXG5cdH1cdFxyXG5cdHZhciBsb2FkYnlzaWduYXR1cmU9ZnVuY3Rpb24ob3B0cyxzaWduYXR1cmUsY2IpIHtcclxuXHRcdCAgdmFyIGJsb2Nrc2l6ZT1vcHRzLmJsb2Nrc2l6ZXx8dGhpcy5mcy5zaXplOyBcclxuXHRcdFx0b3B0cy5jdXIrPXRoaXMuZnMuc2lnbmF0dXJlX3NpemU7XHJcblx0XHRcdHZhciBkYXRhc2l6ZT1ibG9ja3NpemUtdGhpcy5mcy5zaWduYXR1cmVfc2l6ZTtcclxuXHRcdFx0Ly9iYXNpYyB0eXBlc1xyXG5cdFx0XHRpZiAoc2lnbmF0dXJlPT09RFQuaW50MzIpIHtcclxuXHRcdFx0XHRvcHRzLmN1cis9NDtcclxuXHRcdFx0XHR0aGlzLmZzLnJlYWRJMzIob3B0cy5jdXItNCxjYik7XHJcblx0XHRcdH0gZWxzZSBpZiAoc2lnbmF0dXJlPT09RFQudWludDgpIHtcclxuXHRcdFx0XHRvcHRzLmN1cisrO1xyXG5cdFx0XHRcdHRoaXMuZnMucmVhZFVJOChvcHRzLmN1ci0xLGNiKTtcclxuXHRcdFx0fSBlbHNlIGlmIChzaWduYXR1cmU9PT1EVC51dGY4KSB7XHJcblx0XHRcdFx0dmFyIGM9b3B0cy5jdXI7b3B0cy5jdXIrPWRhdGFzaXplO1xyXG5cdFx0XHRcdHRoaXMuZnMucmVhZFN0cmluZyhjLGRhdGFzaXplLCd1dGY4JyxjYik7XHJcblx0XHRcdH0gZWxzZSBpZiAoc2lnbmF0dXJlPT09RFQudWNzMikge1xyXG5cdFx0XHRcdHZhciBjPW9wdHMuY3VyO29wdHMuY3VyKz1kYXRhc2l6ZTtcclxuXHRcdFx0XHR0aGlzLmZzLnJlYWRTdHJpbmcoYyxkYXRhc2l6ZSwndWNzMicsY2IpO1x0XHJcblx0XHRcdH0gZWxzZSBpZiAoc2lnbmF0dXJlPT09RFQuYm9vbCkge1xyXG5cdFx0XHRcdG9wdHMuY3VyKys7XHJcblx0XHRcdFx0dGhpcy5mcy5yZWFkVUk4KG9wdHMuY3VyLTEsZnVuY3Rpb24oZGF0YSl7Y2IoISFkYXRhKX0pO1xyXG5cdFx0XHR9IGVsc2UgaWYgKHNpZ25hdHVyZT09PURULmJsb2IpIHtcclxuXHRcdFx0XHRsb2FkQmxvYihkYXRhc2l6ZSxjYik7XHJcblx0XHRcdH1cclxuXHRcdFx0Ly92YXJpYWJsZSBsZW5ndGggaW50ZWdlcnNcclxuXHRcdFx0ZWxzZSBpZiAoc2lnbmF0dXJlPT09RFQudmludCkge1xyXG5cdFx0XHRcdGxvYWRWSW50LmFwcGx5KHRoaXMsW29wdHMsZGF0YXNpemUsZGF0YXNpemUsY2JdKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlIGlmIChzaWduYXR1cmU9PT1EVC5waW50KSB7XHJcblx0XHRcdFx0bG9hZFBJbnQuYXBwbHkodGhpcyxbb3B0cyxkYXRhc2l6ZSxkYXRhc2l6ZSxjYl0pO1xyXG5cdFx0XHR9XHJcblx0XHRcdC8vc2ltcGxlIGFycmF5XHJcblx0XHRcdGVsc2UgaWYgKHNpZ25hdHVyZT09PURULnV0ZjhhcnIpIHtcclxuXHRcdFx0XHRsb2FkU3RyaW5nQXJyYXkuYXBwbHkodGhpcyxbb3B0cyxkYXRhc2l6ZSwndXRmOCcsY2JdKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlIGlmIChzaWduYXR1cmU9PT1EVC51Y3MyYXJyKSB7XHJcblx0XHRcdFx0bG9hZFN0cmluZ0FycmF5LmFwcGx5KHRoaXMsW29wdHMsZGF0YXNpemUsJ3VjczInLGNiXSk7XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSBpZiAoc2lnbmF0dXJlPT09RFQudWludDhhcnIpIHtcclxuXHRcdFx0XHRsb2FkSW50ZWdlckFycmF5LmFwcGx5KHRoaXMsW29wdHMsZGF0YXNpemUsMSxjYl0pO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2UgaWYgKHNpZ25hdHVyZT09PURULmludDMyYXJyKSB7XHJcblx0XHRcdFx0bG9hZEludGVnZXJBcnJheS5hcHBseSh0aGlzLFtvcHRzLGRhdGFzaXplLDQsY2JdKTtcclxuXHRcdFx0fVxyXG5cdFx0XHQvL25lc3RlZCBzdHJ1Y3R1cmVcclxuXHRcdFx0ZWxzZSBpZiAoc2lnbmF0dXJlPT09RFQuYXJyYXkpIHtcclxuXHRcdFx0XHRsb2FkQXJyYXkuYXBwbHkodGhpcyxbb3B0cyxkYXRhc2l6ZSxjYl0pO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2UgaWYgKHNpZ25hdHVyZT09PURULm9iamVjdCkge1xyXG5cdFx0XHRcdGxvYWRPYmplY3QuYXBwbHkodGhpcyxbb3B0cyxkYXRhc2l6ZSxjYl0pO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdGNvbnNvbGUuZXJyb3IoJ3Vuc3VwcG9ydGVkIHR5cGUnLHNpZ25hdHVyZSxvcHRzKVxyXG5cdFx0XHRcdGNiLmFwcGx5KHRoaXMsW251bGxdKTsvL21ha2Ugc3VyZSBpdCByZXR1cm5cclxuXHRcdFx0XHQvL3Rocm93ICd1bnN1cHBvcnRlZCB0eXBlICcrc2lnbmF0dXJlO1xyXG5cdFx0XHR9XHJcblx0fVxyXG5cclxuXHR2YXIgbG9hZD1mdW5jdGlvbihvcHRzLGNiKSB7XHJcblx0XHRvcHRzPW9wdHN8fHt9OyAvLyB0aGlzIHdpbGwgc2VydmVkIGFzIGNvbnRleHQgZm9yIGVudGlyZSBsb2FkIHByb2NlZHVyZVxyXG5cdFx0b3B0cy5jdXI9b3B0cy5jdXJ8fDA7XHJcblx0XHR2YXIgdGhhdD10aGlzO1xyXG5cdFx0dGhpcy5mcy5yZWFkU2lnbmF0dXJlKG9wdHMuY3VyLCBmdW5jdGlvbihzaWduYXR1cmUpe1xyXG5cdFx0XHRsb2FkYnlzaWduYXR1cmUuYXBwbHkodGhhdCxbb3B0cyxzaWduYXR1cmUsY2JdKVxyXG5cdFx0fSk7XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9XHJcblx0dmFyIENBQ0hFPW51bGw7XHJcblx0dmFyIEtFWT17fTtcclxuXHR2YXIgQUREUkVTUz17fTtcclxuXHR2YXIgcmVzZXQ9ZnVuY3Rpb24oY2IpIHtcclxuXHRcdGlmICghQ0FDSEUpIHtcclxuXHRcdFx0bG9hZC5hcHBseSh0aGlzLFt7Y3VyOjAsbGF6eTp0cnVlfSxmdW5jdGlvbihkYXRhKXtcclxuXHRcdFx0XHRDQUNIRT1kYXRhO1xyXG5cdFx0XHRcdGNiLmNhbGwodGhpcyk7XHJcblx0XHRcdH1dKTtcdFxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Y2IuY2FsbCh0aGlzKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHZhciBleGlzdHM9ZnVuY3Rpb24ocGF0aCxjYikge1xyXG5cdFx0aWYgKHBhdGgubGVuZ3RoPT0wKSByZXR1cm4gdHJ1ZTtcclxuXHRcdHZhciBrZXk9cGF0aC5wb3AoKTtcclxuXHRcdHZhciB0aGF0PXRoaXM7XHJcblx0XHRnZXQuYXBwbHkodGhpcyxbcGF0aCxmYWxzZSxmdW5jdGlvbihkYXRhKXtcclxuXHRcdFx0aWYgKCFwYXRoLmpvaW4oc3Ryc2VwKSkgcmV0dXJuICghIUtFWVtrZXldKTtcclxuXHRcdFx0dmFyIGtleXM9S0VZW3BhdGguam9pbihzdHJzZXApXTtcclxuXHRcdFx0cGF0aC5wdXNoKGtleSk7Ly9wdXQgaXQgYmFja1xyXG5cdFx0XHRpZiAoa2V5cykgY2IuYXBwbHkodGhhdCxba2V5cy5pbmRleE9mKGtleSk+LTFdKTtcclxuXHRcdFx0ZWxzZSBjYi5hcHBseSh0aGF0LFtmYWxzZV0pO1xyXG5cdFx0fV0pO1xyXG5cdH1cclxuXHJcblx0dmFyIGdldFN5bmM9ZnVuY3Rpb24ocGF0aCkge1xyXG5cdFx0aWYgKCFDQUNIRSkgcmV0dXJuIHVuZGVmaW5lZDtcdFxyXG5cdFx0dmFyIG89Q0FDSEU7XHJcblx0XHRmb3IgKHZhciBpPTA7aTxwYXRoLmxlbmd0aDtpKyspIHtcclxuXHRcdFx0dmFyIHI9b1twYXRoW2ldXTtcclxuXHRcdFx0aWYgKHR5cGVvZiByPT1cInVuZGVmaW5lZFwiKSByZXR1cm4gbnVsbDtcclxuXHRcdFx0bz1yO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIG87XHJcblx0fVxyXG5cdHZhciBnZXQ9ZnVuY3Rpb24ocGF0aCxvcHRzLGNiKSB7XHJcblx0XHRpZiAodHlwZW9mIHBhdGg9PSd1bmRlZmluZWQnKSBwYXRoPVtdO1xyXG5cdFx0aWYgKHR5cGVvZiBwYXRoPT1cInN0cmluZ1wiKSBwYXRoPVtwYXRoXTtcclxuXHRcdC8vb3B0cy5yZWN1cnNpdmU9ISFvcHRzLnJlY3Vyc2l2ZTtcclxuXHRcdGlmICh0eXBlb2Ygb3B0cz09XCJmdW5jdGlvblwiKSB7XHJcblx0XHRcdGNiPW9wdHM7bm9kZVxyXG5cdFx0XHRvcHRzPXt9O1xyXG5cdFx0fVxyXG5cdFx0dmFyIHRoYXQ9dGhpcztcclxuXHRcdGlmICh0eXBlb2YgY2IhPSdmdW5jdGlvbicpIHJldHVybiBnZXRTeW5jKHBhdGgpO1xyXG5cclxuXHRcdHJlc2V0LmFwcGx5KHRoaXMsW2Z1bmN0aW9uKCl7XHJcblx0XHRcdHZhciBvPUNBQ0hFO1xyXG5cdFx0XHRpZiAocGF0aC5sZW5ndGg9PTApIHtcclxuXHRcdFx0XHRpZiAob3B0cy5hZGRyZXNzKSB7XHJcblx0XHRcdFx0XHRjYihbMCx0aGF0LmZzLnNpemVdKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0Y2IoT2JqZWN0LmtleXMoQ0FDSEUpKTtcdFxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH0gXHJcblx0XHRcdFxyXG5cdFx0XHR2YXIgcGF0aG5vdz1cIlwiLHRhc2txdWV1ZT1bXSxuZXdvcHRzPXt9LHI9bnVsbDtcclxuXHRcdFx0dmFyIGxhc3RrZXk9XCJcIjtcclxuXHJcblx0XHRcdGZvciAodmFyIGk9MDtpPHBhdGgubGVuZ3RoO2krKykge1xyXG5cdFx0XHRcdHZhciB0YXNrPShmdW5jdGlvbihrZXksayl7XHJcblxyXG5cdFx0XHRcdFx0cmV0dXJuIChmdW5jdGlvbihkYXRhKXtcclxuXHRcdFx0XHRcdFx0aWYgKCEodHlwZW9mIGRhdGE9PSdvYmplY3QnICYmIGRhdGEuX19lbXB0eSkpIHtcclxuXHRcdFx0XHRcdFx0XHRpZiAodHlwZW9mIG9bbGFzdGtleV09PSdzdHJpbmcnICYmIG9bbGFzdGtleV1bMF09PXN0cnNlcCkgb1tsYXN0a2V5XT17fTtcclxuXHRcdFx0XHRcdFx0XHRvW2xhc3RrZXldPWRhdGE7IFxyXG5cdFx0XHRcdFx0XHRcdG89b1tsYXN0a2V5XTtcclxuXHRcdFx0XHRcdFx0XHRyPWRhdGFba2V5XTtcclxuXHRcdFx0XHRcdFx0XHRLRVlbcGF0aG5vd109b3B0cy5rZXlzO1x0XHRcdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHRkYXRhPW9ba2V5XTtcclxuXHRcdFx0XHRcdFx0XHRyPWRhdGE7XHJcblx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdGlmICh0eXBlb2Ygcj09PVwidW5kZWZpbmVkXCIpIHtcclxuXHRcdFx0XHRcdFx0XHR0YXNrcXVldWU9bnVsbDtcclxuXHRcdFx0XHRcdFx0XHRjYi5hcHBseSh0aGF0LFtyXSk7IC8vcmV0dXJuIGVtcHR5IHZhbHVlXHJcblx0XHRcdFx0XHRcdH0gZWxzZSB7XHRcdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0XHRpZiAocGFyc2VJbnQoaykpIHBhdGhub3crPXN0cnNlcDtcclxuXHRcdFx0XHRcdFx0XHRwYXRobm93Kz1rZXk7XHJcblx0XHRcdFx0XHRcdFx0aWYgKHR5cGVvZiByPT0nc3RyaW5nJyAmJiByWzBdPT1zdHJzZXApIHsgLy9vZmZzZXQgb2YgZGF0YSB0byBiZSBsb2FkZWRcclxuXHRcdFx0XHRcdFx0XHRcdHZhciBwPXIuc3Vic3RyaW5nKDEpLnNwbGl0KHN0cnNlcCkubWFwKGZ1bmN0aW9uKGl0ZW0pe3JldHVybiBwYXJzZUludChpdGVtLDE2KX0pO1xyXG5cdFx0XHRcdFx0XHRcdFx0dmFyIGN1cj1wWzBdLHN6PXBbMV07XHJcblx0XHRcdFx0XHRcdFx0XHRuZXdvcHRzLmxhenk9IW9wdHMucmVjdXJzaXZlIHx8IChrPHBhdGgubGVuZ3RoLTEpIDtcclxuXHRcdFx0XHRcdFx0XHRcdG5ld29wdHMuYmxvY2tzaXplPXN6O25ld29wdHMuY3VyPWN1cixuZXdvcHRzLmtleXM9W107XHJcblx0XHRcdFx0XHRcdFx0XHRsYXN0a2V5PWtleTsgLy9sb2FkIGlzIHN5bmMgaW4gYW5kcm9pZFxyXG5cdFx0XHRcdFx0XHRcdFx0aWYgKG9wdHMuYWRkcmVzcyAmJiB0YXNrcXVldWUubGVuZ3RoPT0xKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdEFERFJFU1NbcGF0aG5vd109W2N1cixzel07XHJcblx0XHRcdFx0XHRcdFx0XHRcdHRhc2txdWV1ZS5zaGlmdCgpKG51bGwsQUREUkVTU1twYXRobm93XSk7XHJcblx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRsb2FkLmFwcGx5KHRoYXQsW25ld29wdHMsIHRhc2txdWV1ZS5zaGlmdCgpXSk7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHRcdGlmIChvcHRzLmFkZHJlc3MgJiYgdGFza3F1ZXVlLmxlbmd0aD09MSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHR0YXNrcXVldWUuc2hpZnQoKShudWxsLEFERFJFU1NbcGF0aG5vd10pO1xyXG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0dGFza3F1ZXVlLnNoaWZ0KCkuYXBwbHkodGhhdCxbcl0pO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fSlcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHRcdChwYXRoW2ldLGkpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHRhc2txdWV1ZS5wdXNoKHRhc2spO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZiAodGFza3F1ZXVlLmxlbmd0aD09MCkge1xyXG5cdFx0XHRcdGNiLmFwcGx5KHRoYXQsW29dKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQvL2xhc3QgY2FsbCB0byBjaGlsZCBsb2FkXHJcblx0XHRcdFx0dGFza3F1ZXVlLnB1c2goZnVuY3Rpb24oZGF0YSxjdXJzeil7XHJcblx0XHRcdFx0XHRpZiAob3B0cy5hZGRyZXNzKSB7XHJcblx0XHRcdFx0XHRcdGNiLmFwcGx5KHRoYXQsW2N1cnN6XSk7XHJcblx0XHRcdFx0XHR9IGVsc2V7XHJcblx0XHRcdFx0XHRcdHZhciBrZXk9cGF0aFtwYXRoLmxlbmd0aC0xXTtcclxuXHRcdFx0XHRcdFx0b1trZXldPWRhdGE7IEtFWVtwYXRobm93XT1vcHRzLmtleXM7XHJcblx0XHRcdFx0XHRcdGNiLmFwcGx5KHRoYXQsW2RhdGFdKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0XHR0YXNrcXVldWUuc2hpZnQoKSh7X19lbXB0eTp0cnVlfSk7XHRcdFx0XHJcblx0XHRcdH1cclxuXHJcblx0XHR9XSk7IC8vcmVzZXRcclxuXHR9XHJcblx0Ly8gZ2V0IGFsbCBrZXlzIGluIGdpdmVuIHBhdGhcclxuXHR2YXIgZ2V0a2V5cz1mdW5jdGlvbihwYXRoLGNiKSB7XHJcblx0XHRpZiAoIXBhdGgpIHBhdGg9W11cclxuXHRcdHZhciB0aGF0PXRoaXM7XHJcblx0XHRnZXQuYXBwbHkodGhpcyxbcGF0aCxmYWxzZSxmdW5jdGlvbigpe1xyXG5cdFx0XHRpZiAocGF0aCAmJiBwYXRoLmxlbmd0aCkge1xyXG5cdFx0XHRcdGNiLmFwcGx5KHRoYXQsW0tFWVtwYXRoLmpvaW4oc3Ryc2VwKV1dKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRjYi5hcHBseSh0aGF0LFtPYmplY3Qua2V5cyhDQUNIRSldKTsgXHJcblx0XHRcdFx0Ly90b3AgbGV2ZWwsIG5vcm1hbGx5IGl0IGlzIHZlcnkgc21hbGxcclxuXHRcdFx0fVxyXG5cdFx0fV0pO1xyXG5cdH1cclxuXHJcblx0dmFyIHNldHVwYXBpPWZ1bmN0aW9uKCkge1xyXG5cdFx0dGhpcy5sb2FkPWxvYWQ7XHJcbi8vXHRcdHRoaXMuY3VyPTA7XHJcblx0XHR0aGlzLmNhY2hlPWZ1bmN0aW9uKCkge3JldHVybiBDQUNIRX07XHJcblx0XHR0aGlzLmtleT1mdW5jdGlvbigpIHtyZXR1cm4gS0VZfTtcclxuXHRcdHRoaXMuZnJlZT1mdW5jdGlvbigpIHtcclxuXHRcdFx0Q0FDSEU9bnVsbDtcclxuXHRcdFx0S0VZPW51bGw7XHJcblx0XHRcdHRoaXMuZnMuZnJlZSgpO1xyXG5cdFx0fVxyXG5cdFx0dGhpcy5zZXRDYWNoZT1mdW5jdGlvbihjKSB7Q0FDSEU9Y307XHJcblx0XHR0aGlzLmtleXM9Z2V0a2V5cztcclxuXHRcdHRoaXMuZ2V0PWdldDsgICAvLyBnZXQgYSBmaWVsZCwgbG9hZCBpZiBuZWVkZWRcclxuXHRcdHRoaXMuZXhpc3RzPWV4aXN0cztcclxuXHRcdHRoaXMuRFQ9RFQ7XHJcblx0XHRcclxuXHRcdC8vaW5zdGFsbCB0aGUgc3luYyB2ZXJzaW9uIGZvciBub2RlXHJcblx0XHQvL2lmICh0eXBlb2YgcHJvY2VzcyE9XCJ1bmRlZmluZWRcIikgcmVxdWlyZShcIi4va2RiX3N5bmNcIikodGhpcyk7XHJcblx0XHQvL2lmIChjYikgc2V0VGltZW91dChjYi5iaW5kKHRoaXMpLDApO1xyXG5cdFx0dmFyIHRoYXQ9dGhpcztcclxuXHRcdHZhciBlcnI9MDtcclxuXHRcdGlmIChjYikge1xyXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0Y2IoZXJyLHRoYXQpO1x0XHJcblx0XHRcdH0sMCk7XHJcblx0XHR9XHJcblx0fVxyXG5cdHZhciB0aGF0PXRoaXM7XHJcblx0dmFyIGtmcz1uZXcgS2ZzKHBhdGgsb3B0cyxmdW5jdGlvbihlcnIpe1xyXG5cdFx0aWYgKGVycikge1xyXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0Y2IoZXJyLDApO1xyXG5cdFx0XHR9LDApO1xyXG5cdFx0XHRyZXR1cm4gbnVsbDtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRoYXQuc2l6ZT10aGlzLnNpemU7XHJcblx0XHRcdHNldHVwYXBpLmNhbGwodGhhdCk7XHRcdFx0XHJcblx0XHR9XHJcblx0fSk7XHJcblx0dGhpcy5mcz1rZnM7XHJcblx0cmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbkNyZWF0ZS5kYXRhdHlwZXM9RFQ7XHJcblxyXG5pZiAobW9kdWxlKSBtb2R1bGUuZXhwb3J0cz1DcmVhdGU7XHJcbi8vcmV0dXJuIENyZWF0ZTtcclxuIiwiLyogbm9kZS5qcyBhbmQgaHRtbDUgZmlsZSBzeXN0ZW0gYWJzdHJhY3Rpb24gbGF5ZXIqL1xyXG50cnkge1xyXG5cdHZhciBmcz1yZXF1aXJlKFwiZnNcIik7XHJcblx0dmFyIEJ1ZmZlcj1yZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcjtcclxufSBjYXRjaCAoZSkge1xyXG5cdHZhciBmcz1yZXF1aXJlKCcuL2h0bWw1cmVhZCcpO1xyXG5cdHZhciBCdWZmZXI9ZnVuY3Rpb24oKXsgcmV0dXJuIFwiXCJ9O1xyXG5cdHZhciBodG1sNWZzPXRydWU7IFx0XHJcbn1cclxudmFyIHNpZ25hdHVyZV9zaXplPTE7XHJcbnZhciB2ZXJib3NlPTAsIHJlYWRMb2c9ZnVuY3Rpb24oKXt9O1xyXG52YXIgX3JlYWRMb2c9ZnVuY3Rpb24ocmVhZHR5cGUsYnl0ZXMpIHtcclxuXHRjb25zb2xlLmxvZyhyZWFkdHlwZSxieXRlcyxcImJ5dGVzXCIpO1xyXG59XHJcbmlmICh2ZXJib3NlKSByZWFkTG9nPV9yZWFkTG9nO1xyXG5cclxudmFyIHVucGFja19pbnQgPSBmdW5jdGlvbiAoYXIsIGNvdW50ICwgcmVzZXQpIHtcclxuICAgY291bnQ9Y291bnR8fGFyLmxlbmd0aDtcclxuICB2YXIgciA9IFtdLCBpID0gMCwgdiA9IDA7XHJcbiAgZG8ge1xyXG5cdHZhciBzaGlmdCA9IDA7XHJcblx0ZG8ge1xyXG5cdCAgdiArPSAoKGFyW2ldICYgMHg3RikgPDwgc2hpZnQpO1xyXG5cdCAgc2hpZnQgKz0gNztcdCAgXHJcblx0fSB3aGlsZSAoYXJbKytpXSAmIDB4ODApO1xyXG5cdHIucHVzaCh2KTsgaWYgKHJlc2V0KSB2PTA7XHJcblx0Y291bnQtLTtcclxuICB9IHdoaWxlIChpPGFyLmxlbmd0aCAmJiBjb3VudCk7XHJcbiAgcmV0dXJuIHtkYXRhOnIsIGFkdjppIH07XHJcbn1cclxudmFyIE9wZW49ZnVuY3Rpb24ocGF0aCxvcHRzLGNiKSB7XHJcblx0b3B0cz1vcHRzfHx7fTtcclxuXHJcblx0dmFyIHJlYWRTaWduYXR1cmU9ZnVuY3Rpb24ocG9zLGNiKSB7XHJcblx0XHR2YXIgYnVmPW5ldyBCdWZmZXIoc2lnbmF0dXJlX3NpemUpO1xyXG5cdFx0dmFyIHRoYXQ9dGhpcztcclxuXHRcdGZzLnJlYWQodGhpcy5oYW5kbGUsYnVmLDAsc2lnbmF0dXJlX3NpemUscG9zLGZ1bmN0aW9uKGVycixsZW4sYnVmZmVyKXtcclxuXHRcdFx0aWYgKGh0bWw1ZnMpIHZhciBzaWduYXR1cmU9U3RyaW5nLmZyb21DaGFyQ29kZSgobmV3IFVpbnQ4QXJyYXkoYnVmZmVyKSlbMF0pXHJcblx0XHRcdGVsc2UgdmFyIHNpZ25hdHVyZT1idWZmZXIudG9TdHJpbmcoJ3V0ZjgnLDAsc2lnbmF0dXJlX3NpemUpO1xyXG5cdFx0XHRjYi5hcHBseSh0aGF0LFtzaWduYXR1cmVdKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0Ly90aGlzIGlzIHF1aXRlIHNsb3dcclxuXHQvL3dhaXQgZm9yIFN0cmluZ1ZpZXcgK0FycmF5QnVmZmVyIHRvIHNvbHZlIHRoZSBwcm9ibGVtXHJcblx0Ly9odHRwczovL2dyb3Vwcy5nb29nbGUuY29tL2EvY2hyb21pdW0ub3JnL2ZvcnVtLyMhdG9waWMvYmxpbmstZGV2L3lsZ2lOWV9aU1YwXHJcblx0Ly9pZiB0aGUgc3RyaW5nIGlzIGFsd2F5cyB1Y3MyXHJcblx0Ly9jYW4gdXNlIFVpbnQxNiB0byByZWFkIGl0LlxyXG5cdC8vaHR0cDovL3VwZGF0ZXMuaHRtbDVyb2Nrcy5jb20vMjAxMi8wNi9Ib3ctdG8tY29udmVydC1BcnJheUJ1ZmZlci10by1hbmQtZnJvbS1TdHJpbmdcclxuXHR2YXIgZGVjb2RldXRmOCA9IGZ1bmN0aW9uICh1dGZ0ZXh0KSB7XHJcblx0XHR2YXIgc3RyaW5nID0gXCJcIjtcclxuXHRcdHZhciBpID0gMDtcclxuXHRcdHZhciBjPTAsYzEgPSAwLCBjMiA9IDAgLCBjMz0wO1xyXG5cdFx0Zm9yICh2YXIgaT0wO2k8dXRmdGV4dC5sZW5ndGg7aSsrKSB7XHJcblx0XHRcdGlmICh1dGZ0ZXh0LmNoYXJDb2RlQXQoaSk+MTI3KSBicmVhaztcclxuXHRcdH1cclxuXHRcdGlmIChpPj11dGZ0ZXh0Lmxlbmd0aCkgcmV0dXJuIHV0ZnRleHQ7XHJcblxyXG5cdFx0d2hpbGUgKCBpIDwgdXRmdGV4dC5sZW5ndGggKSB7XHJcblx0XHRcdGMgPSB1dGZ0ZXh0LmNoYXJDb2RlQXQoaSk7XHJcblx0XHRcdGlmIChjIDwgMTI4KSB7XHJcblx0XHRcdFx0c3RyaW5nICs9IHV0ZnRleHRbaV07XHJcblx0XHRcdFx0aSsrO1xyXG5cdFx0XHR9IGVsc2UgaWYoKGMgPiAxOTEpICYmIChjIDwgMjI0KSkge1xyXG5cdFx0XHRcdGMyID0gdXRmdGV4dC5jaGFyQ29kZUF0KGkrMSk7XHJcblx0XHRcdFx0c3RyaW5nICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoKChjICYgMzEpIDw8IDYpIHwgKGMyICYgNjMpKTtcclxuXHRcdFx0XHRpICs9IDI7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0YzIgPSB1dGZ0ZXh0LmNoYXJDb2RlQXQoaSsxKTtcclxuXHRcdFx0XHRjMyA9IHV0ZnRleHQuY2hhckNvZGVBdChpKzIpO1xyXG5cdFx0XHRcdHN0cmluZyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKCgoYyAmIDE1KSA8PCAxMikgfCAoKGMyICYgNjMpIDw8IDYpIHwgKGMzICYgNjMpKTtcclxuXHRcdFx0XHRpICs9IDM7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiBzdHJpbmc7XHJcblx0fVxyXG5cclxuXHR2YXIgcmVhZFN0cmluZz0gZnVuY3Rpb24ocG9zLGJsb2Nrc2l6ZSxlbmNvZGluZyxjYikge1xyXG5cdFx0ZW5jb2Rpbmc9ZW5jb2Rpbmd8fCd1dGY4JztcclxuXHRcdHZhciBidWZmZXI9bmV3IEJ1ZmZlcihibG9ja3NpemUpO1xyXG5cdFx0dmFyIHRoYXQ9dGhpcztcclxuXHRcdGZzLnJlYWQodGhpcy5oYW5kbGUsYnVmZmVyLDAsYmxvY2tzaXplLHBvcyxmdW5jdGlvbihlcnIsbGVuLGJ1ZmZlcil7XHJcblx0XHRcdHJlYWRMb2coXCJzdHJpbmdcIixsZW4pO1xyXG5cdFx0XHRpZiAoaHRtbDVmcykge1xyXG5cdFx0XHRcdGlmIChlbmNvZGluZz09J3V0ZjgnKSB7XHJcblx0XHRcdFx0XHR2YXIgc3RyPWRlY29kZXV0ZjgoU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLCBuZXcgVWludDhBcnJheShidWZmZXIpKSlcclxuXHRcdFx0XHR9IGVsc2UgeyAvL3VjczIgaXMgMyB0aW1lcyBmYXN0ZXJcclxuXHRcdFx0XHRcdHZhciBzdHI9U3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLCBuZXcgVWludDE2QXJyYXkoYnVmZmVyKSlcdFxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHRjYi5hcHBseSh0aGF0LFtzdHJdKTtcclxuXHRcdFx0fSBcclxuXHRcdFx0ZWxzZSBjYi5hcHBseSh0aGF0LFtidWZmZXIudG9TdHJpbmcoZW5jb2RpbmcpXSk7XHRcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0Ly93b3JrIGFyb3VuZCBmb3IgY2hyb21lIGZyb21DaGFyQ29kZSBjYW5ub3QgYWNjZXB0IGh1Z2UgYXJyYXlcclxuXHQvL2h0dHBzOi8vY29kZS5nb29nbGUuY29tL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD01NjU4OFxyXG5cdHZhciBidWYyc3RyaW5nYXJyPWZ1bmN0aW9uKGJ1ZixlbmMpIHtcclxuXHRcdGlmIChlbmM9PVwidXRmOFwiKSBcdHZhciBhcnI9bmV3IFVpbnQ4QXJyYXkoYnVmKTtcclxuXHRcdGVsc2UgdmFyIGFycj1uZXcgVWludDE2QXJyYXkoYnVmKTtcclxuXHRcdHZhciBpPTAsY29kZXM9W10sb3V0PVtdLHM9XCJcIjtcclxuXHRcdHdoaWxlIChpPGFyci5sZW5ndGgpIHtcclxuXHRcdFx0aWYgKGFycltpXSkge1xyXG5cdFx0XHRcdGNvZGVzW2NvZGVzLmxlbmd0aF09YXJyW2ldO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHM9U3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLGNvZGVzKTtcclxuXHRcdFx0XHRpZiAoZW5jPT1cInV0ZjhcIikgb3V0W291dC5sZW5ndGhdPWRlY29kZXV0Zjgocyk7XHJcblx0XHRcdFx0ZWxzZSBvdXRbb3V0Lmxlbmd0aF09cztcclxuXHRcdFx0XHRjb2Rlcz1bXTtcdFx0XHRcdFxyXG5cdFx0XHR9XHJcblx0XHRcdGkrKztcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0cz1TdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsY29kZXMpO1xyXG5cdFx0aWYgKGVuYz09XCJ1dGY4XCIpIG91dFtvdXQubGVuZ3RoXT1kZWNvZGV1dGY4KHMpO1xyXG5cdFx0ZWxzZSBvdXRbb3V0Lmxlbmd0aF09cztcclxuXHJcblx0XHRyZXR1cm4gb3V0O1xyXG5cdH1cclxuXHR2YXIgcmVhZFN0cmluZ0FycmF5ID0gZnVuY3Rpb24ocG9zLGJsb2Nrc2l6ZSxlbmNvZGluZyxjYikge1xyXG5cdFx0dmFyIHRoYXQ9dGhpcyxvdXQ9bnVsbDtcclxuXHRcdGlmIChibG9ja3NpemU9PTApIHJldHVybiBbXTtcclxuXHRcdGVuY29kaW5nPWVuY29kaW5nfHwndXRmOCc7XHJcblx0XHR2YXIgYnVmZmVyPW5ldyBCdWZmZXIoYmxvY2tzaXplKTtcclxuXHRcdGZzLnJlYWQodGhpcy5oYW5kbGUsYnVmZmVyLDAsYmxvY2tzaXplLHBvcyxmdW5jdGlvbihlcnIsbGVuLGJ1ZmZlcil7XHJcblx0XHRcdGlmIChodG1sNWZzKSB7XHJcblx0XHRcdFx0cmVhZExvZyhcInN0cmluZ0FycmF5XCIsYnVmZmVyLmJ5dGVMZW5ndGgpO1xyXG5cclxuXHRcdFx0XHRpZiAoZW5jb2Rpbmc9PSd1dGY4Jykge1xyXG5cdFx0XHRcdFx0b3V0PWJ1ZjJzdHJpbmdhcnIoYnVmZmVyLFwidXRmOFwiKTtcclxuXHRcdFx0XHR9IGVsc2UgeyAvL3VjczIgaXMgMyB0aW1lcyBmYXN0ZXJcclxuXHRcdFx0XHRcdG91dD1idWYyc3RyaW5nYXJyKGJ1ZmZlcixcInVjczJcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHJlYWRMb2coXCJzdHJpbmdBcnJheVwiLGJ1ZmZlci5sZW5ndGgpO1xyXG5cdFx0XHRcdG91dD1idWZmZXIudG9TdHJpbmcoZW5jb2RpbmcpLnNwbGl0KCdcXDAnKTtcclxuXHRcdFx0fSBcdFxyXG5cdFx0XHRjYi5hcHBseSh0aGF0LFtvdXRdKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHR2YXIgcmVhZFVJMzI9ZnVuY3Rpb24ocG9zLGNiKSB7XHJcblx0XHR2YXIgYnVmZmVyPW5ldyBCdWZmZXIoNCk7XHJcblx0XHR2YXIgdGhhdD10aGlzO1xyXG5cdFx0ZnMucmVhZCh0aGlzLmhhbmRsZSxidWZmZXIsMCw0LHBvcyxmdW5jdGlvbihlcnIsbGVuLGJ1ZmZlcil7XHJcblx0XHRcdHJlYWRMb2coXCJ1aTMyXCIsbGVuKTtcclxuXHRcdFx0aWYgKGh0bWw1ZnMpe1xyXG5cdFx0XHRcdC8vdj0obmV3IFVpbnQzMkFycmF5KGJ1ZmZlcikpWzBdO1xyXG5cdFx0XHRcdHZhciB2PW5ldyBEYXRhVmlldyhidWZmZXIpLmdldFVpbnQzMigwLCBmYWxzZSlcclxuXHRcdFx0XHRjYih2KTtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlIGNiLmFwcGx5KHRoYXQsW2J1ZmZlci5yZWFkSW50MzJCRSgwKV0pO1x0XHJcblx0XHR9KTtcdFx0XHJcblx0fVxyXG5cclxuXHR2YXIgcmVhZEkzMj1mdW5jdGlvbihwb3MsY2IpIHtcclxuXHRcdHZhciBidWZmZXI9bmV3IEJ1ZmZlcig0KTtcclxuXHRcdHZhciB0aGF0PXRoaXM7XHJcblx0XHRmcy5yZWFkKHRoaXMuaGFuZGxlLGJ1ZmZlciwwLDQscG9zLGZ1bmN0aW9uKGVycixsZW4sYnVmZmVyKXtcclxuXHRcdFx0cmVhZExvZyhcImkzMlwiLGxlbik7XHJcblx0XHRcdGlmIChodG1sNWZzKXtcclxuXHRcdFx0XHR2YXIgdj1uZXcgRGF0YVZpZXcoYnVmZmVyKS5nZXRJbnQzMigwLCBmYWxzZSlcclxuXHRcdFx0XHRjYih2KTtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlICBcdGNiLmFwcGx5KHRoYXQsW2J1ZmZlci5yZWFkSW50MzJCRSgwKV0pO1x0XHJcblx0XHR9KTtcclxuXHR9XHJcblx0dmFyIHJlYWRVSTg9ZnVuY3Rpb24ocG9zLGNiKSB7XHJcblx0XHR2YXIgYnVmZmVyPW5ldyBCdWZmZXIoMSk7XHJcblx0XHR2YXIgdGhhdD10aGlzO1xyXG5cclxuXHRcdGZzLnJlYWQodGhpcy5oYW5kbGUsYnVmZmVyLDAsMSxwb3MsZnVuY3Rpb24oZXJyLGxlbixidWZmZXIpe1xyXG5cdFx0XHRyZWFkTG9nKFwidWk4XCIsbGVuKTtcclxuXHRcdFx0aWYgKGh0bWw1ZnMpY2IoIChuZXcgVWludDhBcnJheShidWZmZXIpKVswXSkgO1xyXG5cdFx0XHRlbHNlICBcdFx0XHRjYi5hcHBseSh0aGF0LFtidWZmZXIucmVhZFVJbnQ4KDApXSk7XHRcclxuXHRcdFx0XHJcblx0XHR9KTtcclxuXHR9XHJcblx0dmFyIHJlYWRCdWY9ZnVuY3Rpb24ocG9zLGJsb2Nrc2l6ZSxjYikge1xyXG5cdFx0dmFyIHRoYXQ9dGhpcztcclxuXHRcdHZhciBidWY9bmV3IEJ1ZmZlcihibG9ja3NpemUpO1xyXG5cdFx0ZnMucmVhZCh0aGlzLmhhbmRsZSxidWYsMCxibG9ja3NpemUscG9zLGZ1bmN0aW9uKGVycixsZW4sYnVmZmVyKXtcclxuXHRcdFx0cmVhZExvZyhcImJ1ZlwiLGxlbik7XHJcblx0XHRcdHZhciBidWZmPW5ldyBVaW50OEFycmF5KGJ1ZmZlcilcclxuXHRcdFx0Y2IuYXBwbHkodGhhdCxbYnVmZl0pO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cdHZhciByZWFkQnVmX3BhY2tlZGludD1mdW5jdGlvbihwb3MsYmxvY2tzaXplLGNvdW50LHJlc2V0LGNiKSB7XHJcblx0XHR2YXIgdGhhdD10aGlzO1xyXG5cdFx0cmVhZEJ1Zi5hcHBseSh0aGlzLFtwb3MsYmxvY2tzaXplLGZ1bmN0aW9uKGJ1ZmZlcil7XHJcblx0XHRcdGNiLmFwcGx5KHRoYXQsW3VucGFja19pbnQoYnVmZmVyLGNvdW50LHJlc2V0KV0pO1x0XHJcblx0XHR9XSk7XHJcblx0XHRcclxuXHR9XHJcblx0dmFyIHJlYWRGaXhlZEFycmF5X2h0bWw1ZnM9ZnVuY3Rpb24ocG9zLGNvdW50LHVuaXRzaXplLGNiKSB7XHJcblx0XHR2YXIgZnVuYz1udWxsO1xyXG5cdFx0aWYgKHVuaXRzaXplPT09MSkge1xyXG5cdFx0XHRmdW5jPSdnZXRVaW50OCc7Ly9VaW50OEFycmF5O1xyXG5cdFx0fSBlbHNlIGlmICh1bml0c2l6ZT09PTIpIHtcclxuXHRcdFx0ZnVuYz0nZ2V0VWludDE2JzsvL1VpbnQxNkFycmF5O1xyXG5cdFx0fSBlbHNlIGlmICh1bml0c2l6ZT09PTQpIHtcclxuXHRcdFx0ZnVuYz0nZ2V0VWludDMyJzsvL1VpbnQzMkFycmF5O1xyXG5cdFx0fSBlbHNlIHRocm93ICd1bnN1cHBvcnRlZCBpbnRlZ2VyIHNpemUnO1xyXG5cclxuXHRcdGZzLnJlYWQodGhpcy5oYW5kbGUsbnVsbCwwLHVuaXRzaXplKmNvdW50LHBvcyxmdW5jdGlvbihlcnIsbGVuLGJ1ZmZlcil7XHJcblx0XHRcdHJlYWRMb2coXCJmaXggYXJyYXlcIixsZW4pO1xyXG5cdFx0XHR2YXIgb3V0PVtdO1xyXG5cdFx0XHRpZiAodW5pdHNpemU9PTEpIHtcclxuXHRcdFx0XHRvdXQ9bmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGxlbiAvIHVuaXRzaXplOyBpKyspIHsgLy9lbmRpYW4gcHJvYmxlbVxyXG5cdFx0XHRcdC8vXHRvdXQucHVzaCggZnVuYyhidWZmZXIsaSp1bml0c2l6ZSkpO1xyXG5cdFx0XHRcdFx0b3V0LnB1c2goIHY9bmV3IERhdGFWaWV3KGJ1ZmZlcilbZnVuY10oaSxmYWxzZSkgKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGNiLmFwcGx5KHRoYXQsW291dF0pO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cdC8vIHNpZ25hdHVyZSwgaXRlbWNvdW50LCBwYXlsb2FkXHJcblx0dmFyIHJlYWRGaXhlZEFycmF5ID0gZnVuY3Rpb24ocG9zICxjb3VudCwgdW5pdHNpemUsY2IpIHtcclxuXHRcdHZhciBmdW5jPW51bGw7XHJcblx0XHR2YXIgdGhhdD10aGlzO1xyXG5cdFx0XHJcblx0XHRpZiAodW5pdHNpemUqIGNvdW50PnRoaXMuc2l6ZSAmJiB0aGlzLnNpemUpICB7XHJcblx0XHRcdGNvbnNvbGUubG9nKFwiYXJyYXkgc2l6ZSBleGNlZWQgZmlsZSBzaXplXCIsdGhpcy5zaXplKVxyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGlmIChodG1sNWZzKSByZXR1cm4gcmVhZEZpeGVkQXJyYXlfaHRtbDVmcy5hcHBseSh0aGlzLFtwb3MsY291bnQsdW5pdHNpemUsY2JdKTtcclxuXHJcblx0XHR2YXIgaXRlbXM9bmV3IEJ1ZmZlciggdW5pdHNpemUqIGNvdW50KTtcclxuXHRcdGlmICh1bml0c2l6ZT09PTEpIHtcclxuXHRcdFx0ZnVuYz1pdGVtcy5yZWFkVUludDg7XHJcblx0XHR9IGVsc2UgaWYgKHVuaXRzaXplPT09Mikge1xyXG5cdFx0XHRmdW5jPWl0ZW1zLnJlYWRVSW50MTZCRTtcclxuXHRcdH0gZWxzZSBpZiAodW5pdHNpemU9PT00KSB7XHJcblx0XHRcdGZ1bmM9aXRlbXMucmVhZFVJbnQzMkJFO1xyXG5cdFx0fSBlbHNlIHRocm93ICd1bnN1cHBvcnRlZCBpbnRlZ2VyIHNpemUnO1xyXG5cdFx0Ly9jb25zb2xlLmxvZygnaXRlbWNvdW50JyxpdGVtY291bnQsJ2J1ZmZlcicsYnVmZmVyKTtcclxuXHJcblx0XHRmcy5yZWFkKHRoaXMuaGFuZGxlLGl0ZW1zLDAsdW5pdHNpemUqY291bnQscG9zLGZ1bmN0aW9uKGVycixsZW4sYnVmZmVyKXtcclxuXHRcdFx0cmVhZExvZyhcImZpeCBhcnJheVwiLGxlbik7XHJcblx0XHRcdHZhciBvdXQ9W107XHJcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoIC8gdW5pdHNpemU7IGkrKykge1xyXG5cdFx0XHRcdG91dC5wdXNoKCBmdW5jLmFwcGx5KGl0ZW1zLFtpKnVuaXRzaXplXSkpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGNiLmFwcGx5KHRoYXQsW291dF0pO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHR2YXIgZnJlZT1mdW5jdGlvbigpIHtcclxuXHRcdC8vY29uc29sZS5sb2coJ2Nsb3NpbmcgJyxoYW5kbGUpO1xyXG5cdFx0ZnMuY2xvc2VTeW5jKHRoaXMuaGFuZGxlKTtcclxuXHR9XHJcblx0dmFyIHNldHVwYXBpPWZ1bmN0aW9uKCkge1xyXG5cdFx0dmFyIHRoYXQ9dGhpcztcclxuXHRcdHRoaXMucmVhZFNpZ25hdHVyZT1yZWFkU2lnbmF0dXJlO1xyXG5cdFx0dGhpcy5yZWFkSTMyPXJlYWRJMzI7XHJcblx0XHR0aGlzLnJlYWRVSTMyPXJlYWRVSTMyO1xyXG5cdFx0dGhpcy5yZWFkVUk4PXJlYWRVSTg7XHJcblx0XHR0aGlzLnJlYWRCdWY9cmVhZEJ1ZjtcclxuXHRcdHRoaXMucmVhZEJ1Zl9wYWNrZWRpbnQ9cmVhZEJ1Zl9wYWNrZWRpbnQ7XHJcblx0XHR0aGlzLnJlYWRGaXhlZEFycmF5PXJlYWRGaXhlZEFycmF5O1xyXG5cdFx0dGhpcy5yZWFkU3RyaW5nPXJlYWRTdHJpbmc7XHJcblx0XHR0aGlzLnJlYWRTdHJpbmdBcnJheT1yZWFkU3RyaW5nQXJyYXk7XHJcblx0XHR0aGlzLnNpZ25hdHVyZV9zaXplPXNpZ25hdHVyZV9zaXplO1xyXG5cdFx0dGhpcy5mcmVlPWZyZWU7XHJcblx0XHRpZiAoaHRtbDVmcykge1xyXG5cdFx0XHR2YXIgZm49cGF0aDtcclxuXHRcdFx0aWYgKHBhdGguaW5kZXhPZihcImZpbGVzeXN0ZW06XCIpPT0wKSBmbj1wYXRoLnN1YnN0cihwYXRoLmxhc3RJbmRleE9mKFwiL1wiKSk7XHJcblx0XHRcdGZzLmZzLnJvb3QuZ2V0RmlsZShmbix7fSxmdW5jdGlvbihlbnRyeSl7XHJcblx0XHRcdCAgZW50cnkuZ2V0TWV0YWRhdGEoZnVuY3Rpb24obWV0YWRhdGEpIHsgXHJcblx0XHRcdFx0dGhhdC5zaXplPW1ldGFkYXRhLnNpemU7XHJcblx0XHRcdFx0aWYgKGNiKSBzZXRUaW1lb3V0KGNiLmJpbmQodGhhdCksMCk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dmFyIHN0YXQ9ZnMuZnN0YXRTeW5jKHRoaXMuaGFuZGxlKTtcclxuXHRcdFx0dGhpcy5zdGF0PXN0YXQ7XHJcblx0XHRcdHRoaXMuc2l6ZT1zdGF0LnNpemU7XHRcdFxyXG5cdFx0XHRpZiAoY2IpXHRzZXRUaW1lb3V0KGNiLmJpbmQodGhpcywwKSwwKTtcdFxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0dmFyIHRoYXQ9dGhpcztcclxuXHRpZiAoaHRtbDVmcykge1xyXG5cdFx0ZnMub3BlbihwYXRoLGZ1bmN0aW9uKGgpe1xyXG5cdFx0XHRpZiAoIWgpIHtcclxuXHRcdFx0XHRpZiAoY2IpXHRzZXRUaW1lb3V0KGNiLmJpbmQobnVsbCxcImZpbGUgbm90IGZvdW5kOlwiK3BhdGgpLDApO1x0XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0dGhhdC5oYW5kbGU9aDtcclxuXHRcdFx0XHR0aGF0Lmh0bWw1ZnM9dHJ1ZTtcclxuXHRcdFx0XHRzZXR1cGFwaS5jYWxsKHRoYXQpO1xyXG5cdFx0XHRcdHRoYXQub3BlbmVkPXRydWU7XHRcdFx0XHRcclxuXHRcdFx0fVxyXG5cdFx0fSlcclxuXHR9IGVsc2Uge1xyXG5cdFx0aWYgKGZzLmV4aXN0c1N5bmMocGF0aCkpe1xyXG5cdFx0XHR0aGlzLmhhbmRsZT1mcy5vcGVuU3luYyhwYXRoLCdyJyk7Ly8sZnVuY3Rpb24oZXJyLGhhbmRsZSl7XHJcblx0XHRcdHRoaXMub3BlbmVkPXRydWU7XHJcblx0XHRcdHNldHVwYXBpLmNhbGwodGhpcyk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRpZiAoY2IpXHRzZXRUaW1lb3V0KGNiLmJpbmQobnVsbCxcImZpbGUgbm90IGZvdW5kOlwiK3BhdGgpLDApO1x0XHJcblx0XHRcdHJldHVybiBudWxsO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRyZXR1cm4gdGhpcztcclxufVxyXG5tb2R1bGUuZXhwb3J0cz1PcGVuOyIsIi8qXHJcbiAgSkFWQSBjYW4gb25seSByZXR1cm4gTnVtYmVyIGFuZCBTdHJpbmdcclxuXHRhcnJheSBhbmQgYnVmZmVyIHJldHVybiBpbiBzdHJpbmcgZm9ybWF0XHJcblx0bmVlZCBKU09OLnBhcnNlXHJcbiovXHJcbnZhciB2ZXJib3NlPTA7XHJcblxyXG52YXIgcmVhZFNpZ25hdHVyZT1mdW5jdGlvbihwb3MsY2IpIHtcclxuXHRpZiAodmVyYm9zZSkgY29uc29sZS5kZWJ1ZyhcInJlYWQgc2lnbmF0dXJlXCIpO1xyXG5cdHZhciBzaWduYXR1cmU9a2ZzLnJlYWRVVEY4U3RyaW5nKHRoaXMuaGFuZGxlLHBvcywxKTtcclxuXHRpZiAodmVyYm9zZSkgY29uc29sZS5kZWJ1ZyhzaWduYXR1cmUsc2lnbmF0dXJlLmNoYXJDb2RlQXQoMCkpO1xyXG5cdGNiLmFwcGx5KHRoaXMsW3NpZ25hdHVyZV0pO1xyXG59XHJcbnZhciByZWFkSTMyPWZ1bmN0aW9uKHBvcyxjYikge1xyXG5cdGlmICh2ZXJib3NlKSBjb25zb2xlLmRlYnVnKFwicmVhZCBpMzIgYXQgXCIrcG9zKTtcclxuXHR2YXIgaTMyPWtmcy5yZWFkSW50MzIodGhpcy5oYW5kbGUscG9zKTtcclxuXHRpZiAodmVyYm9zZSkgY29uc29sZS5kZWJ1ZyhpMzIpO1xyXG5cdGNiLmFwcGx5KHRoaXMsW2kzMl0pO1x0XHJcbn1cclxudmFyIHJlYWRVSTMyPWZ1bmN0aW9uKHBvcyxjYikge1xyXG5cdGlmICh2ZXJib3NlKSBjb25zb2xlLmRlYnVnKFwicmVhZCB1aTMyIGF0IFwiK3Bvcyk7XHJcblx0dmFyIHVpMzI9a2ZzLnJlYWRVSW50MzIodGhpcy5oYW5kbGUscG9zKTtcclxuXHRpZiAodmVyYm9zZSkgY29uc29sZS5kZWJ1Zyh1aTMyKTtcclxuXHRjYi5hcHBseSh0aGlzLFt1aTMyXSk7XHJcbn1cclxudmFyIHJlYWRVSTg9ZnVuY3Rpb24ocG9zLGNiKSB7XHJcblx0aWYgKHZlcmJvc2UpIGNvbnNvbGUuZGVidWcoXCJyZWFkIHVpOCBhdCBcIitwb3MpOyBcclxuXHR2YXIgdWk4PWtmcy5yZWFkVUludDgodGhpcy5oYW5kbGUscG9zKTtcclxuXHRpZiAodmVyYm9zZSkgY29uc29sZS5kZWJ1Zyh1aTgpO1xyXG5cdGNiLmFwcGx5KHRoaXMsW3VpOF0pO1xyXG59XHJcbnZhciByZWFkQnVmPWZ1bmN0aW9uKHBvcyxibG9ja3NpemUsY2IpIHtcclxuXHRpZiAodmVyYm9zZSkgY29uc29sZS5kZWJ1ZyhcInJlYWQgYnVmZmVyIGF0IFwiK3BvcysgXCIgYmxvY2tzaXplIFwiK2Jsb2Nrc2l6ZSk7XHJcblx0dmFyIGJ1Zj1rZnMucmVhZEJ1Zih0aGlzLmhhbmRsZSxwb3MsYmxvY2tzaXplKTtcclxuXHR2YXIgYnVmZj1KU09OLnBhcnNlKGJ1Zik7XHJcblx0aWYgKHZlcmJvc2UpIGNvbnNvbGUuZGVidWcoXCJidWZmZXIgbGVuZ3RoXCIrYnVmZi5sZW5ndGgpO1xyXG5cdGNiLmFwcGx5KHRoaXMsW2J1ZmZdKTtcdFxyXG59XHJcbnZhciByZWFkQnVmX3BhY2tlZGludD1mdW5jdGlvbihwb3MsYmxvY2tzaXplLGNvdW50LHJlc2V0LGNiKSB7XHJcblx0aWYgKHZlcmJvc2UpIGNvbnNvbGUuZGVidWcoXCJyZWFkIHBhY2tlZCBpbnQgYXQgXCIrcG9zK1wiIGJsb2Nrc2l6ZSBcIitibG9ja3NpemUrXCIgY291bnQgXCIrY291bnQpO1xyXG5cdHZhciBidWY9a2ZzLnJlYWRCdWZfcGFja2VkaW50KHRoaXMuaGFuZGxlLHBvcyxibG9ja3NpemUsY291bnQscmVzZXQpO1xyXG5cdHZhciBhZHY9cGFyc2VJbnQoYnVmKTtcclxuXHR2YXIgYnVmZj1KU09OLnBhcnNlKGJ1Zi5zdWJzdHIoYnVmLmluZGV4T2YoXCJbXCIpKSk7XHJcblx0aWYgKHZlcmJvc2UpIGNvbnNvbGUuZGVidWcoXCJwYWNrZWRJbnQgbGVuZ3RoIFwiK2J1ZmYubGVuZ3RoK1wiIGZpcnN0IGl0ZW09XCIrYnVmZlswXSk7XHJcblx0Y2IuYXBwbHkodGhpcyxbe2RhdGE6YnVmZixhZHY6YWR2fV0pO1x0XHJcbn1cclxuXHJcblxyXG52YXIgcmVhZFN0cmluZz0gZnVuY3Rpb24ocG9zLGJsb2Nrc2l6ZSxlbmNvZGluZyxjYikge1xyXG5cdGlmICh2ZXJib3NlKSBjb25zb2xlLmRlYnVnKFwicmVhZHN0cmluZyBhdCBcIitwb3MrXCIgYmxvY2tzaXplIFwiICtibG9ja3NpemUrXCIgZW5jOlwiK2VuY29kaW5nKTtcclxuXHRpZiAoZW5jb2Rpbmc9PVwidWNzMlwiKSB7XHJcblx0XHR2YXIgc3RyPWtmcy5yZWFkVUxFMTZTdHJpbmcodGhpcy5oYW5kbGUscG9zLGJsb2Nrc2l6ZSk7XHJcblx0fSBlbHNlIHtcclxuXHRcdHZhciBzdHI9a2ZzLnJlYWRVVEY4U3RyaW5nKHRoaXMuaGFuZGxlLHBvcyxibG9ja3NpemUpO1x0XHJcblx0fVx0IFxyXG5cdGlmICh2ZXJib3NlKSBjb25zb2xlLmRlYnVnKHN0cik7XHJcblx0Y2IuYXBwbHkodGhpcyxbc3RyXSk7XHRcclxufVxyXG5cclxudmFyIHJlYWRGaXhlZEFycmF5ID0gZnVuY3Rpb24ocG9zICxjb3VudCwgdW5pdHNpemUsY2IpIHtcclxuXHRpZiAodmVyYm9zZSkgY29uc29sZS5kZWJ1ZyhcInJlYWQgZml4ZWQgYXJyYXkgYXQgXCIrcG9zK1wiIGNvdW50IFwiK2NvdW50K1wiIHVuaXRzaXplIFwiK3VuaXRzaXplKTsgXHJcblx0dmFyIGJ1Zj1rZnMucmVhZEZpeGVkQXJyYXkodGhpcy5oYW5kbGUscG9zLGNvdW50LHVuaXRzaXplKTtcclxuXHR2YXIgYnVmZj1KU09OLnBhcnNlKGJ1Zik7XHJcblx0aWYgKHZlcmJvc2UpIGNvbnNvbGUuZGVidWcoXCJhcnJheSBsZW5ndGhcIitidWZmLmxlbmd0aCk7XHJcblx0Y2IuYXBwbHkodGhpcyxbYnVmZl0pO1x0XHJcbn1cclxudmFyIHJlYWRTdHJpbmdBcnJheSA9IGZ1bmN0aW9uKHBvcyxibG9ja3NpemUsZW5jb2RpbmcsY2IpIHtcclxuXHRpZiAodmVyYm9zZSkgY29uc29sZS5sb2coXCJyZWFkIFN0cmluZyBhcnJheSBhdCBcIitwb3MrXCIgYmxvY2tzaXplIFwiK2Jsb2Nrc2l6ZSArXCIgZW5jIFwiK2VuY29kaW5nKTsgXHJcblx0ZW5jb2RpbmcgPSBlbmNvZGluZ3x8XCJ1dGY4XCI7XHJcblx0dmFyIGJ1Zj1rZnMucmVhZFN0cmluZ0FycmF5KHRoaXMuaGFuZGxlLHBvcyxibG9ja3NpemUsZW5jb2RpbmcpO1xyXG5cdC8vdmFyIGJ1ZmY9SlNPTi5wYXJzZShidWYpO1xyXG5cdGlmICh2ZXJib3NlKSBjb25zb2xlLmRlYnVnKFwicmVhZCBzdHJpbmcgYXJyYXlcIik7XHJcblx0dmFyIGJ1ZmY9YnVmLnNwbGl0KFwiXFx1ZmZmZlwiKTsgLy9jYW5ub3QgcmV0dXJuIHN0cmluZyB3aXRoIDBcclxuXHRpZiAodmVyYm9zZSkgY29uc29sZS5kZWJ1ZyhcImFycmF5IGxlbmd0aFwiK2J1ZmYubGVuZ3RoKTtcclxuXHRjYi5hcHBseSh0aGlzLFtidWZmXSk7XHRcclxufVxyXG52YXIgbWVyZ2VQb3N0aW5ncz1mdW5jdGlvbihwb3NpdGlvbnMsY2IpIHtcclxuXHR2YXIgYnVmPWtmcy5tZXJnZVBvc3RpbmdzKHRoaXMuaGFuZGxlLEpTT04uc3RyaW5naWZ5KHBvc2l0aW9ucykpO1xyXG5cdGlmICghYnVmIHx8IGJ1Zi5sZW5ndGg9PTApIHJldHVybiBbXTtcclxuXHRlbHNlIHJldHVybiBKU09OLnBhcnNlKGJ1Zik7XHJcbn1cclxuXHJcbnZhciBmcmVlPWZ1bmN0aW9uKCkge1xyXG5cdC8vY29uc29sZS5sb2coJ2Nsb3NpbmcgJyxoYW5kbGUpO1xyXG5cdGtmcy5jbG9zZSh0aGlzLmhhbmRsZSk7XHJcbn1cclxudmFyIE9wZW49ZnVuY3Rpb24ocGF0aCxvcHRzLGNiKSB7XHJcblx0b3B0cz1vcHRzfHx7fTtcclxuXHR2YXIgc2lnbmF0dXJlX3NpemU9MTtcclxuXHR2YXIgc2V0dXBhcGk9ZnVuY3Rpb24oKSB7IFxyXG5cdFx0dGhpcy5yZWFkU2lnbmF0dXJlPXJlYWRTaWduYXR1cmU7XHJcblx0XHR0aGlzLnJlYWRJMzI9cmVhZEkzMjtcclxuXHRcdHRoaXMucmVhZFVJMzI9cmVhZFVJMzI7XHJcblx0XHR0aGlzLnJlYWRVSTg9cmVhZFVJODtcclxuXHRcdHRoaXMucmVhZEJ1Zj1yZWFkQnVmO1xyXG5cdFx0dGhpcy5yZWFkQnVmX3BhY2tlZGludD1yZWFkQnVmX3BhY2tlZGludDtcclxuXHRcdHRoaXMucmVhZEZpeGVkQXJyYXk9cmVhZEZpeGVkQXJyYXk7XHJcblx0XHR0aGlzLnJlYWRTdHJpbmc9cmVhZFN0cmluZztcclxuXHRcdHRoaXMucmVhZFN0cmluZ0FycmF5PXJlYWRTdHJpbmdBcnJheTtcclxuXHRcdHRoaXMuc2lnbmF0dXJlX3NpemU9c2lnbmF0dXJlX3NpemU7XHJcblx0XHR0aGlzLm1lcmdlUG9zdGluZ3M9bWVyZ2VQb3N0aW5ncztcclxuXHRcdHRoaXMuZnJlZT1mcmVlO1xyXG5cdFx0dGhpcy5zaXplPWtmcy5nZXRGaWxlU2l6ZSh0aGlzLmhhbmRsZSk7XHJcblx0XHRpZiAodmVyYm9zZSkgY29uc29sZS5sb2coXCJmaWxlc2l6ZSAgXCIrdGhpcy5zaXplKTtcclxuXHRcdGlmIChjYilcdGNiLmNhbGwodGhpcyk7XHJcblx0fVxyXG5cclxuXHR0aGlzLmhhbmRsZT1rZnMub3BlbihwYXRoKTtcclxuXHR0aGlzLm9wZW5lZD10cnVlO1xyXG5cdHNldHVwYXBpLmNhbGwodGhpcyk7XHJcblx0cmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzPU9wZW47IiwiLypcclxuICBKU0NvbnRleHQgY2FuIHJldHVybiBhbGwgSmF2YXNjcmlwdCB0eXBlcy5cclxuKi9cclxudmFyIHZlcmJvc2U9MTtcclxuXHJcbnZhciByZWFkU2lnbmF0dXJlPWZ1bmN0aW9uKHBvcyxjYikge1xyXG5cdGlmICh2ZXJib3NlKSAga3NhbmFnYXAubG9nKFwicmVhZCBzaWduYXR1cmUgYXQgXCIrcG9zKTtcclxuXHR2YXIgc2lnbmF0dXJlPWtmcy5yZWFkVVRGOFN0cmluZyh0aGlzLmhhbmRsZSxwb3MsMSk7XHJcblx0aWYgKHZlcmJvc2UpICBrc2FuYWdhcC5sb2coc2lnbmF0dXJlK1wiIFwiK3NpZ25hdHVyZS5jaGFyQ29kZUF0KDApKTtcclxuXHRjYi5hcHBseSh0aGlzLFtzaWduYXR1cmVdKTtcclxufVxyXG52YXIgcmVhZEkzMj1mdW5jdGlvbihwb3MsY2IpIHtcclxuXHRpZiAodmVyYm9zZSkgIGtzYW5hZ2FwLmxvZyhcInJlYWQgaTMyIGF0IFwiK3Bvcyk7XHJcblx0dmFyIGkzMj1rZnMucmVhZEludDMyKHRoaXMuaGFuZGxlLHBvcyk7XHJcblx0aWYgKHZlcmJvc2UpICBrc2FuYWdhcC5sb2coaTMyKTtcclxuXHRjYi5hcHBseSh0aGlzLFtpMzJdKTtcdFxyXG59XHJcbnZhciByZWFkVUkzMj1mdW5jdGlvbihwb3MsY2IpIHtcclxuXHRpZiAodmVyYm9zZSkgIGtzYW5hZ2FwLmxvZyhcInJlYWQgdWkzMiBhdCBcIitwb3MpO1xyXG5cdHZhciB1aTMyPWtmcy5yZWFkVUludDMyKHRoaXMuaGFuZGxlLHBvcyk7XHJcblx0aWYgKHZlcmJvc2UpICBrc2FuYWdhcC5sb2codWkzMik7XHJcblx0Y2IuYXBwbHkodGhpcyxbdWkzMl0pO1xyXG59XHJcbnZhciByZWFkVUk4PWZ1bmN0aW9uKHBvcyxjYikge1xyXG5cdGlmICh2ZXJib3NlKSAga3NhbmFnYXAubG9nKFwicmVhZCB1aTggYXQgXCIrcG9zKTsgXHJcblx0dmFyIHVpOD1rZnMucmVhZFVJbnQ4KHRoaXMuaGFuZGxlLHBvcyk7XHJcblx0aWYgKHZlcmJvc2UpICBrc2FuYWdhcC5sb2codWk4KTtcclxuXHRjYi5hcHBseSh0aGlzLFt1aThdKTtcclxufVxyXG52YXIgcmVhZEJ1Zj1mdW5jdGlvbihwb3MsYmxvY2tzaXplLGNiKSB7XHJcblx0aWYgKHZlcmJvc2UpICBrc2FuYWdhcC5sb2coXCJyZWFkIGJ1ZmZlciBhdCBcIitwb3MpO1xyXG5cdHZhciBidWY9a2ZzLnJlYWRCdWYodGhpcy5oYW5kbGUscG9zLGJsb2Nrc2l6ZSk7XHJcblx0aWYgKHZlcmJvc2UpICBrc2FuYWdhcC5sb2coXCJidWZmZXIgbGVuZ3RoXCIrYnVmLmxlbmd0aCk7XHJcblx0Y2IuYXBwbHkodGhpcyxbYnVmXSk7XHRcclxufVxyXG52YXIgcmVhZEJ1Zl9wYWNrZWRpbnQ9ZnVuY3Rpb24ocG9zLGJsb2Nrc2l6ZSxjb3VudCxyZXNldCxjYikge1xyXG5cdGlmICh2ZXJib3NlKSAga3NhbmFnYXAubG9nKFwicmVhZCBwYWNrZWQgaW50IGZhc3QsIGJsb2Nrc2l6ZSBcIitibG9ja3NpemUrXCIgYXQgXCIrcG9zKTt2YXIgdD1uZXcgRGF0ZSgpO1xyXG5cdHZhciBidWY9a2ZzLnJlYWRCdWZfcGFja2VkaW50KHRoaXMuaGFuZGxlLHBvcyxibG9ja3NpemUsY291bnQscmVzZXQpO1xyXG5cdGlmICh2ZXJib3NlKSAga3NhbmFnYXAubG9nKFwicmV0dXJuIGZyb20gcGFja2VkaW50LCB0aW1lXCIgKyAobmV3IERhdGUoKS10KSk7XHJcblx0aWYgKHR5cGVvZiBidWYuZGF0YT09XCJzdHJpbmdcIikge1xyXG5cdFx0YnVmLmRhdGE9ZXZhbChcIltcIitidWYuZGF0YS5zdWJzdHIoMCxidWYuZGF0YS5sZW5ndGgtMSkrXCJdXCIpO1xyXG5cdH1cclxuXHRpZiAodmVyYm9zZSkgIGtzYW5hZ2FwLmxvZyhcInVucGFja2VkIGxlbmd0aFwiK2J1Zi5kYXRhLmxlbmd0aCtcIiB0aW1lXCIgKyAobmV3IERhdGUoKS10KSApO1xyXG5cdGNiLmFwcGx5KHRoaXMsW2J1Zl0pO1xyXG59XHJcblxyXG5cclxudmFyIHJlYWRTdHJpbmc9IGZ1bmN0aW9uKHBvcyxibG9ja3NpemUsZW5jb2RpbmcsY2IpIHtcclxuXHJcblx0aWYgKHZlcmJvc2UpICBrc2FuYWdhcC5sb2coXCJyZWFkc3RyaW5nIGF0IFwiK3BvcytcIiBibG9ja3NpemUgXCIrYmxvY2tzaXplK1wiIFwiK2VuY29kaW5nKTt2YXIgdD1uZXcgRGF0ZSgpO1xyXG5cdGlmIChlbmNvZGluZz09XCJ1Y3MyXCIpIHtcclxuXHRcdHZhciBzdHI9a2ZzLnJlYWRVTEUxNlN0cmluZyh0aGlzLmhhbmRsZSxwb3MsYmxvY2tzaXplKTtcclxuXHR9IGVsc2Uge1xyXG5cdFx0dmFyIHN0cj1rZnMucmVhZFVURjhTdHJpbmcodGhpcy5oYW5kbGUscG9zLGJsb2Nrc2l6ZSk7XHRcclxuXHR9XHJcblx0aWYgKHZlcmJvc2UpICBrc2FuYWdhcC5sb2coc3RyK1wiIHRpbWVcIisobmV3IERhdGUoKS10KSk7XHJcblx0Y2IuYXBwbHkodGhpcyxbc3RyXSk7XHRcclxufVxyXG5cclxudmFyIHJlYWRGaXhlZEFycmF5ID0gZnVuY3Rpb24ocG9zICxjb3VudCwgdW5pdHNpemUsY2IpIHtcclxuXHRpZiAodmVyYm9zZSkgIGtzYW5hZ2FwLmxvZyhcInJlYWQgZml4ZWQgYXJyYXkgYXQgXCIrcG9zKTsgdmFyIHQ9bmV3IERhdGUoKTtcclxuXHR2YXIgYnVmPWtmcy5yZWFkRml4ZWRBcnJheSh0aGlzLmhhbmRsZSxwb3MsY291bnQsdW5pdHNpemUpO1xyXG5cdGlmICh2ZXJib3NlKSAga3NhbmFnYXAubG9nKFwiYXJyYXkgbGVuZ3RoIFwiK2J1Zi5sZW5ndGgrXCIgdGltZVwiKyhuZXcgRGF0ZSgpLXQpKTtcclxuXHRjYi5hcHBseSh0aGlzLFtidWZdKTtcdFxyXG59XHJcbnZhciByZWFkU3RyaW5nQXJyYXkgPSBmdW5jdGlvbihwb3MsYmxvY2tzaXplLGVuY29kaW5nLGNiKSB7XHJcblx0Ly9pZiAodmVyYm9zZSkgIGtzYW5hZ2FwLmxvZyhcInJlYWQgU3RyaW5nIGFycmF5IFwiK2Jsb2Nrc2l6ZSArXCIgXCIrZW5jb2RpbmcpOyBcclxuXHRlbmNvZGluZyA9IGVuY29kaW5nfHxcInV0ZjhcIjtcclxuXHRpZiAodmVyYm9zZSkgIGtzYW5hZ2FwLmxvZyhcInJlYWQgc3RyaW5nIGFycmF5IGF0IFwiK3Bvcyk7dmFyIHQ9bmV3IERhdGUoKTtcclxuXHR2YXIgYnVmPWtmcy5yZWFkU3RyaW5nQXJyYXkodGhpcy5oYW5kbGUscG9zLGJsb2Nrc2l6ZSxlbmNvZGluZyk7XHJcblx0aWYgKHR5cGVvZiBidWY9PVwic3RyaW5nXCIpIGJ1Zj1idWYuc3BsaXQoXCJcXDBcIik7XHJcblx0Ly92YXIgYnVmZj1KU09OLnBhcnNlKGJ1Zik7XHJcblx0Ly92YXIgYnVmZj1idWYuc3BsaXQoXCJcXHVmZmZmXCIpOyAvL2Nhbm5vdCByZXR1cm4gc3RyaW5nIHdpdGggMFxyXG5cdGlmICh2ZXJib3NlKSAga3NhbmFnYXAubG9nKFwic3RyaW5nIGFycmF5IGxlbmd0aFwiK2J1Zi5sZW5ndGgrXCIgdGltZVwiKyhuZXcgRGF0ZSgpLXQpKTtcclxuXHRjYi5hcHBseSh0aGlzLFtidWZdKTtcclxufVxyXG5cclxudmFyIG1lcmdlUG9zdGluZ3M9ZnVuY3Rpb24ocG9zaXRpb25zKSB7XHJcblx0dmFyIGJ1Zj1rZnMubWVyZ2VQb3N0aW5ncyh0aGlzLmhhbmRsZSxwb3NpdGlvbnMpO1xyXG5cdGlmICh0eXBlb2YgYnVmPT1cInN0cmluZ1wiKSB7XHJcblx0XHRidWY9ZXZhbChcIltcIitidWYuc3Vic3RyKDAsYnVmLmxlbmd0aC0xKStcIl1cIik7XHJcblx0fVxyXG5cdHJldHVybiBidWY7XHJcbn1cclxudmFyIGZyZWU9ZnVuY3Rpb24oKSB7XHJcblx0Ly8vL2lmICh2ZXJib3NlKSAga3NhbmFnYXAubG9nKCdjbG9zaW5nICcsaGFuZGxlKTtcclxuXHRrZnMuY2xvc2UodGhpcy5oYW5kbGUpO1xyXG59XHJcbnZhciBPcGVuPWZ1bmN0aW9uKHBhdGgsb3B0cyxjYikge1xyXG5cdG9wdHM9b3B0c3x8e307XHJcblx0dmFyIHNpZ25hdHVyZV9zaXplPTE7XHJcblx0dmFyIHNldHVwYXBpPWZ1bmN0aW9uKCkgeyBcclxuXHRcdHRoaXMucmVhZFNpZ25hdHVyZT1yZWFkU2lnbmF0dXJlO1xyXG5cdFx0dGhpcy5yZWFkSTMyPXJlYWRJMzI7XHJcblx0XHR0aGlzLnJlYWRVSTMyPXJlYWRVSTMyO1xyXG5cdFx0dGhpcy5yZWFkVUk4PXJlYWRVSTg7XHJcblx0XHR0aGlzLnJlYWRCdWY9cmVhZEJ1ZjtcclxuXHRcdHRoaXMucmVhZEJ1Zl9wYWNrZWRpbnQ9cmVhZEJ1Zl9wYWNrZWRpbnQ7XHJcblx0XHR0aGlzLnJlYWRGaXhlZEFycmF5PXJlYWRGaXhlZEFycmF5O1xyXG5cdFx0dGhpcy5yZWFkU3RyaW5nPXJlYWRTdHJpbmc7XHJcblx0XHR0aGlzLnJlYWRTdHJpbmdBcnJheT1yZWFkU3RyaW5nQXJyYXk7XHJcblx0XHR0aGlzLnNpZ25hdHVyZV9zaXplPXNpZ25hdHVyZV9zaXplO1xyXG5cdFx0dGhpcy5tZXJnZVBvc3RpbmdzPW1lcmdlUG9zdGluZ3M7XHJcblx0XHR0aGlzLmZyZWU9ZnJlZTtcclxuXHRcdHRoaXMuc2l6ZT1rZnMuZ2V0RmlsZVNpemUodGhpcy5oYW5kbGUpO1xyXG5cdFx0aWYgKHZlcmJvc2UpICBrc2FuYWdhcC5sb2coXCJmaWxlc2l6ZSAgXCIrdGhpcy5zaXplKTtcclxuXHRcdGlmIChjYilcdGNiLmNhbGwodGhpcyk7XHJcblx0fVxyXG5cclxuXHR0aGlzLmhhbmRsZT1rZnMub3BlbihwYXRoKTtcclxuXHR0aGlzLm9wZW5lZD10cnVlO1xyXG5cdHNldHVwYXBpLmNhbGwodGhpcyk7XHJcblx0cmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzPU9wZW47IiwiLypcclxuICBjb252ZXJ0IGFueSBqc29uIGludG8gYSBiaW5hcnkgYnVmZmVyXHJcbiAgdGhlIGJ1ZmZlciBjYW4gYmUgc2F2ZWQgd2l0aCBhIHNpbmdsZSBsaW5lIG9mIGZzLndyaXRlRmlsZVxyXG4qL1xyXG5cclxudmFyIERUPXtcclxuXHR1aW50ODonMScsIC8vdW5zaWduZWQgMSBieXRlIGludGVnZXJcclxuXHRpbnQzMjonNCcsIC8vIHNpZ25lZCA0IGJ5dGVzIGludGVnZXJcclxuXHR1dGY4Oic4JywgIFxyXG5cdHVjczI6JzInLFxyXG5cdGJvb2w6J14nLCBcclxuXHRibG9iOicmJyxcclxuXHR1dGY4YXJyOicqJywgLy9zaGlmdCBvZiA4XHJcblx0dWNzMmFycjonQCcsIC8vc2hpZnQgb2YgMlxyXG5cdHVpbnQ4YXJyOichJywgLy9zaGlmdCBvZiAxXHJcblx0aW50MzJhcnI6JyQnLCAvL3NoaWZ0IG9mIDRcclxuXHR2aW50OidgJyxcclxuXHRwaW50Oid+JyxcdFxyXG5cclxuXHRhcnJheTonXFx1MDAxYicsXHJcblx0b2JqZWN0OidcXHUwMDFhJyBcclxuXHQvL3lkYiBzdGFydCB3aXRoIG9iamVjdCBzaWduYXR1cmUsXHJcblx0Ly90eXBlIGEgeWRiIGluIGNvbW1hbmQgcHJvbXB0IHNob3dzIG5vdGhpbmdcclxufVxyXG52YXIga2V5X3dyaXRpbmc9XCJcIjsvL2ZvciBkZWJ1Z2dpbmdcclxudmFyIHBhY2tfaW50ID0gZnVuY3Rpb24gKGFyLCBzYXZlZGVsdGEpIHsgLy8gcGFjayBhciBpbnRvXHJcbiAgaWYgKCFhciB8fCBhci5sZW5ndGggPT09IDApIHJldHVybiBbXTsgLy8gZW1wdHkgYXJyYXlcclxuICB2YXIgciA9IFtdLFxyXG4gIGkgPSAwLFxyXG4gIGogPSAwLFxyXG4gIGRlbHRhID0gMCxcclxuICBwcmV2ID0gMDtcclxuICBcclxuICBkbyB7XHJcblx0ZGVsdGEgPSBhcltpXTtcclxuXHRpZiAoc2F2ZWRlbHRhKSB7XHJcblx0XHRkZWx0YSAtPSBwcmV2O1xyXG5cdH1cclxuXHRpZiAoZGVsdGEgPCAwKSB7XHJcblx0ICBjb25zb2xlLnRyYWNlKCduZWdhdGl2ZScscHJldixhcltpXSlcclxuXHQgIHRocm93ICduZWdldGl2ZSc7XHJcblx0ICBicmVhaztcclxuXHR9XHJcblx0XHJcblx0cltqKytdID0gZGVsdGEgJiAweDdmO1xyXG5cdGRlbHRhID4+PSA3O1xyXG5cdHdoaWxlIChkZWx0YSA+IDApIHtcclxuXHQgIHJbaisrXSA9IChkZWx0YSAmIDB4N2YpIHwgMHg4MDtcclxuXHQgIGRlbHRhID4+PSA3O1xyXG5cdH1cclxuXHRwcmV2ID0gYXJbaV07XHJcblx0aSsrO1xyXG4gIH0gd2hpbGUgKGkgPCBhci5sZW5ndGgpO1xyXG4gIHJldHVybiByO1xyXG59XHJcbnZhciBLZnM9ZnVuY3Rpb24ocGF0aCxvcHRzKSB7XHJcblx0XHJcblx0dmFyIGhhbmRsZT1udWxsO1xyXG5cdG9wdHM9b3B0c3x8e307XHJcblx0b3B0cy5zaXplPW9wdHMuc2l6ZXx8NjU1MzYqMjA0ODsgXHJcblx0Y29uc29sZS5sb2coJ2tkYiBlc3RpbWF0ZSBzaXplOicsb3B0cy5zaXplKTtcclxuXHR2YXIgZGJ1Zj1uZXcgQnVmZmVyKG9wdHMuc2l6ZSk7XHJcblx0dmFyIGN1cj0wOy8vZGJ1ZiBjdXJzb3JcclxuXHRcclxuXHR2YXIgd3JpdGVTaWduYXR1cmU9ZnVuY3Rpb24odmFsdWUscG9zKSB7XHJcblx0XHRkYnVmLndyaXRlKHZhbHVlLHBvcyx2YWx1ZS5sZW5ndGgsJ3V0ZjgnKTtcclxuXHRcdGlmIChwb3MrdmFsdWUubGVuZ3RoPmN1cikgY3VyPXBvcyt2YWx1ZS5sZW5ndGg7XHJcblx0XHRyZXR1cm4gdmFsdWUubGVuZ3RoO1xyXG5cdH1cclxuXHR2YXIgd3JpdGVPZmZzZXQ9ZnVuY3Rpb24odmFsdWUscG9zKSB7XHJcblx0XHRkYnVmLndyaXRlVUludDgoTWF0aC5mbG9vcih2YWx1ZSAvICg2NTUzNio2NTUzNikpLHBvcyk7XHJcblx0XHRkYnVmLndyaXRlVUludDMyQkUoIHZhbHVlICYgMHhGRkZGRkZGRixwb3MrMSk7XHJcblx0XHRpZiAocG9zKzU+Y3VyKSBjdXI9cG9zKzU7XHJcblx0XHRyZXR1cm4gNTtcclxuXHR9XHJcblx0dmFyIHdyaXRlU3RyaW5nPSBmdW5jdGlvbih2YWx1ZSxwb3MsZW5jb2RpbmcpIHtcclxuXHRcdGVuY29kaW5nPWVuY29kaW5nfHwndWNzMic7XHJcblx0XHRpZiAodmFsdWU9PVwiXCIpIHRocm93IFwiY2Fubm90IHdyaXRlIG51bGwgc3RyaW5nXCI7XHJcblx0XHRpZiAoZW5jb2Rpbmc9PT0ndXRmOCcpZGJ1Zi53cml0ZShEVC51dGY4LHBvcywxLCd1dGY4Jyk7XHJcblx0XHRlbHNlIGlmIChlbmNvZGluZz09PSd1Y3MyJylkYnVmLndyaXRlKERULnVjczIscG9zLDEsJ3V0ZjgnKTtcclxuXHRcdGVsc2UgdGhyb3cgJ3Vuc3VwcG9ydGVkIGVuY29kaW5nICcrZW5jb2Rpbmc7XHJcblx0XHRcdFxyXG5cdFx0dmFyIGxlbj1CdWZmZXIuYnl0ZUxlbmd0aCh2YWx1ZSwgZW5jb2RpbmcpO1xyXG5cdFx0ZGJ1Zi53cml0ZSh2YWx1ZSxwb3MrMSxsZW4sZW5jb2RpbmcpO1xyXG5cdFx0XHJcblx0XHRpZiAocG9zK2xlbisxPmN1cikgY3VyPXBvcytsZW4rMTtcclxuXHRcdHJldHVybiBsZW4rMTsgLy8gc2lnbmF0dXJlXHJcblx0fVxyXG5cdHZhciB3cml0ZVN0cmluZ0FycmF5ID0gZnVuY3Rpb24odmFsdWUscG9zLGVuY29kaW5nKSB7XHJcblx0XHRlbmNvZGluZz1lbmNvZGluZ3x8J3VjczInO1xyXG5cdFx0aWYgKGVuY29kaW5nPT09J3V0ZjgnKSBkYnVmLndyaXRlKERULnV0ZjhhcnIscG9zLDEsJ3V0ZjgnKTtcclxuXHRcdGVsc2UgaWYgKGVuY29kaW5nPT09J3VjczInKWRidWYud3JpdGUoRFQudWNzMmFycixwb3MsMSwndXRmOCcpO1xyXG5cdFx0ZWxzZSB0aHJvdyAndW5zdXBwb3J0ZWQgZW5jb2RpbmcgJytlbmNvZGluZztcclxuXHRcdFxyXG5cdFx0dmFyIHY9dmFsdWUuam9pbignXFwwJyk7XHJcblx0XHR2YXIgbGVuPUJ1ZmZlci5ieXRlTGVuZ3RoKHYsIGVuY29kaW5nKTtcclxuXHRcdGlmICgwPT09bGVuKSB7XHJcblx0XHRcdHRocm93IFwiZW1wdHkgc3RyaW5nIGFycmF5IFwiICsga2V5X3dyaXRpbmc7XHJcblx0XHR9XHJcblx0XHRkYnVmLndyaXRlKHYscG9zKzEsbGVuLGVuY29kaW5nKTtcclxuXHRcdGlmIChwb3MrbGVuKzE+Y3VyKSBjdXI9cG9zK2xlbisxO1xyXG5cdFx0cmV0dXJuIGxlbisxO1xyXG5cdH1cclxuXHR2YXIgd3JpdGVJMzI9ZnVuY3Rpb24odmFsdWUscG9zKSB7XHJcblx0XHRkYnVmLndyaXRlKERULmludDMyLHBvcywxLCd1dGY4Jyk7XHJcblx0XHRkYnVmLndyaXRlSW50MzJCRSh2YWx1ZSxwb3MrMSk7XHJcblx0XHRpZiAocG9zKzU+Y3VyKSBjdXI9cG9zKzU7XHJcblx0XHRyZXR1cm4gNTtcclxuXHR9XHJcblx0dmFyIHdyaXRlVUk4PWZ1bmN0aW9uKHZhbHVlLHBvcykge1xyXG5cdFx0ZGJ1Zi53cml0ZShEVC51aW50OCxwb3MsMSwndXRmOCcpO1xyXG5cdFx0ZGJ1Zi53cml0ZVVJbnQ4KHZhbHVlLHBvcysxKTtcclxuXHRcdGlmIChwb3MrMj5jdXIpIGN1cj1wb3MrMjtcclxuXHRcdHJldHVybiAyO1xyXG5cdH1cclxuXHR2YXIgd3JpdGVCb29sPWZ1bmN0aW9uKHZhbHVlLHBvcykge1xyXG5cdFx0ZGJ1Zi53cml0ZShEVC5ib29sLHBvcywxLCd1dGY4Jyk7XHJcblx0XHRkYnVmLndyaXRlVUludDgoTnVtYmVyKHZhbHVlKSxwb3MrMSk7XHJcblx0XHRpZiAocG9zKzI+Y3VyKSBjdXI9cG9zKzI7XHJcblx0XHRyZXR1cm4gMjtcclxuXHR9XHRcdFxyXG5cdHZhciB3cml0ZUJsb2I9ZnVuY3Rpb24odmFsdWUscG9zKSB7XHJcblx0XHRkYnVmLndyaXRlKERULmJsb2IscG9zLDEsJ3V0ZjgnKTtcclxuXHRcdHZhbHVlLmNvcHkoZGJ1ZiwgcG9zKzEpO1xyXG5cdFx0dmFyIHdyaXR0ZW49dmFsdWUubGVuZ3RoKzE7XHJcblx0XHRpZiAocG9zK3dyaXR0ZW4+Y3VyKSBjdXI9cG9zK3dyaXR0ZW47XHJcblx0XHRyZXR1cm4gd3JpdHRlbjtcclxuXHR9XHRcdFxyXG5cdC8qIG5vIHNpZ25hdHVyZSAqL1xyXG5cdHZhciB3cml0ZUZpeGVkQXJyYXkgPSBmdW5jdGlvbih2YWx1ZSxwb3MsdW5pdHNpemUpIHtcclxuXHRcdC8vY29uc29sZS5sb2coJ3YubGVuJyx2YWx1ZS5sZW5ndGgsaXRlbXMubGVuZ3RoLHVuaXRzaXplKTtcclxuXHRcdGlmICh1bml0c2l6ZT09PTEpIHZhciBmdW5jPWRidWYud3JpdGVVSW50ODtcclxuXHRcdGVsc2UgaWYgKHVuaXRzaXplPT09NCl2YXIgZnVuYz1kYnVmLndyaXRlSW50MzJCRTtcclxuXHRcdGVsc2UgdGhyb3cgJ3Vuc3VwcG9ydGVkIGludGVnZXIgc2l6ZSc7XHJcblx0XHRpZiAoIXZhbHVlLmxlbmd0aCkge1xyXG5cdFx0XHR0aHJvdyBcImVtcHR5IGZpeGVkIGFycmF5IFwiK2tleV93cml0aW5nO1xyXG5cdFx0fVxyXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB2YWx1ZS5sZW5ndGggOyBpKyspIHtcclxuXHRcdFx0ZnVuYy5hcHBseShkYnVmLFt2YWx1ZVtpXSxpKnVuaXRzaXplK3Bvc10pXHJcblx0XHR9XHJcblx0XHR2YXIgbGVuPXVuaXRzaXplKnZhbHVlLmxlbmd0aDtcclxuXHRcdGlmIChwb3MrbGVuPmN1cikgY3VyPXBvcytsZW47XHJcblx0XHRyZXR1cm4gbGVuO1xyXG5cdH1cclxuXHJcblx0dGhpcy53cml0ZUkzMj13cml0ZUkzMjtcclxuXHR0aGlzLndyaXRlQm9vbD13cml0ZUJvb2w7XHJcblx0dGhpcy53cml0ZUJsb2I9d3JpdGVCbG9iO1xyXG5cdHRoaXMud3JpdGVVSTg9d3JpdGVVSTg7XHJcblx0dGhpcy53cml0ZVN0cmluZz13cml0ZVN0cmluZztcclxuXHR0aGlzLndyaXRlU2lnbmF0dXJlPXdyaXRlU2lnbmF0dXJlO1xyXG5cdHRoaXMud3JpdGVPZmZzZXQ9d3JpdGVPZmZzZXQ7IC8vNSBieXRlcyBvZmZzZXRcclxuXHR0aGlzLndyaXRlU3RyaW5nQXJyYXk9d3JpdGVTdHJpbmdBcnJheTtcclxuXHR0aGlzLndyaXRlRml4ZWRBcnJheT13cml0ZUZpeGVkQXJyYXk7XHJcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIFwiYnVmXCIsIHtnZXQgOiBmdW5jdGlvbigpeyByZXR1cm4gZGJ1ZjsgfX0pO1xyXG5cdFxyXG5cdHJldHVybiB0aGlzO1xyXG59XHJcblxyXG52YXIgQ3JlYXRlPWZ1bmN0aW9uKHBhdGgsb3B0cykge1xyXG5cdG9wdHM9b3B0c3x8e307XHJcblx0dmFyIGtmcz1uZXcgS2ZzKHBhdGgsb3B0cyk7XHJcblx0dmFyIGN1cj0wO1xyXG5cclxuXHR2YXIgaGFuZGxlPXt9O1xyXG5cdFxyXG5cdC8vbm8gc2lnbmF0dXJlXHJcblx0dmFyIHdyaXRlVkludCA9ZnVuY3Rpb24oYXJyKSB7XHJcblx0XHR2YXIgbz1wYWNrX2ludChhcnIsZmFsc2UpO1xyXG5cdFx0a2ZzLndyaXRlRml4ZWRBcnJheShvLGN1ciwxKTtcclxuXHRcdGN1cis9by5sZW5ndGg7XHJcblx0fVxyXG5cdHZhciB3cml0ZVZJbnQxPWZ1bmN0aW9uKHZhbHVlKSB7XHJcblx0XHR3cml0ZVZJbnQoW3ZhbHVlXSk7XHJcblx0fVxyXG5cdC8vZm9yIHBvc3RpbmdzXHJcblx0dmFyIHdyaXRlUEludCA9ZnVuY3Rpb24oYXJyKSB7XHJcblx0XHR2YXIgbz1wYWNrX2ludChhcnIsdHJ1ZSk7XHJcblx0XHRrZnMud3JpdGVGaXhlZEFycmF5KG8sY3VyLDEpO1xyXG5cdFx0Y3VyKz1vLmxlbmd0aDtcclxuXHR9XHJcblx0XHJcblx0dmFyIHNhdmVWSW50ID0gZnVuY3Rpb24oYXJyLGtleSkge1xyXG5cdFx0dmFyIHN0YXJ0PWN1cjtcclxuXHRcdGtleV93cml0aW5nPWtleTtcclxuXHRcdGN1cis9a2ZzLndyaXRlU2lnbmF0dXJlKERULnZpbnQsY3VyKTtcclxuXHRcdHdyaXRlVkludChhcnIpO1xyXG5cdFx0dmFyIHdyaXR0ZW4gPSBjdXItc3RhcnQ7XHJcblx0XHRwdXNoaXRlbShrZXksd3JpdHRlbik7XHJcblx0XHRyZXR1cm4gd3JpdHRlbjtcdFx0XHJcblx0fVxyXG5cdHZhciBzYXZlUEludCA9IGZ1bmN0aW9uKGFycixrZXkpIHtcclxuXHRcdHZhciBzdGFydD1jdXI7XHJcblx0XHRrZXlfd3JpdGluZz1rZXk7XHJcblx0XHRjdXIrPWtmcy53cml0ZVNpZ25hdHVyZShEVC5waW50LGN1cik7XHJcblx0XHR3cml0ZVBJbnQoYXJyKTtcclxuXHRcdHZhciB3cml0dGVuID0gY3VyLXN0YXJ0O1xyXG5cdFx0cHVzaGl0ZW0oa2V5LHdyaXR0ZW4pO1xyXG5cdFx0cmV0dXJuIHdyaXR0ZW47XHRcclxuXHR9XHJcblxyXG5cdFxyXG5cdHZhciBzYXZlVUk4ID0gZnVuY3Rpb24odmFsdWUsa2V5KSB7XHJcblx0XHR2YXIgd3JpdHRlbj1rZnMud3JpdGVVSTgodmFsdWUsY3VyKTtcclxuXHRcdGN1cis9d3JpdHRlbjtcclxuXHRcdHB1c2hpdGVtKGtleSx3cml0dGVuKTtcclxuXHRcdHJldHVybiB3cml0dGVuO1xyXG5cdH1cclxuXHR2YXIgc2F2ZUJvb2w9ZnVuY3Rpb24odmFsdWUsa2V5KSB7XHJcblx0XHR2YXIgd3JpdHRlbj1rZnMud3JpdGVCb29sKHZhbHVlLGN1cik7XHJcblx0XHRjdXIrPXdyaXR0ZW47XHJcblx0XHRwdXNoaXRlbShrZXksd3JpdHRlbik7XHJcblx0XHRyZXR1cm4gd3JpdHRlbjtcclxuXHR9XHJcblx0dmFyIHNhdmVJMzIgPSBmdW5jdGlvbih2YWx1ZSxrZXkpIHtcclxuXHRcdHZhciB3cml0dGVuPWtmcy53cml0ZUkzMih2YWx1ZSxjdXIpO1xyXG5cdFx0Y3VyKz13cml0dGVuO1xyXG5cdFx0cHVzaGl0ZW0oa2V5LHdyaXR0ZW4pO1xyXG5cdFx0cmV0dXJuIHdyaXR0ZW47XHJcblx0fVx0XHJcblx0dmFyIHNhdmVTdHJpbmcgPSBmdW5jdGlvbih2YWx1ZSxrZXksZW5jb2RpbmcpIHtcclxuXHRcdGVuY29kaW5nPWVuY29kaW5nfHxzdHJpbmdlbmNvZGluZztcclxuXHRcdGtleV93cml0aW5nPWtleTtcclxuXHRcdHZhciB3cml0dGVuPWtmcy53cml0ZVN0cmluZyh2YWx1ZSxjdXIsZW5jb2RpbmcpO1xyXG5cdFx0Y3VyKz13cml0dGVuO1xyXG5cdFx0cHVzaGl0ZW0oa2V5LHdyaXR0ZW4pO1xyXG5cdFx0cmV0dXJuIHdyaXR0ZW47XHJcblx0fVxyXG5cdHZhciBzYXZlU3RyaW5nQXJyYXkgPSBmdW5jdGlvbihhcnIsa2V5LGVuY29kaW5nKSB7XHJcblx0XHRlbmNvZGluZz1lbmNvZGluZ3x8c3RyaW5nZW5jb2Rpbmc7XHJcblx0XHRrZXlfd3JpdGluZz1rZXk7XHJcblx0XHR0cnkge1xyXG5cdFx0XHR2YXIgd3JpdHRlbj1rZnMud3JpdGVTdHJpbmdBcnJheShhcnIsY3VyLGVuY29kaW5nKTtcclxuXHRcdH0gY2F0Y2goZSkge1xyXG5cdFx0XHR0aHJvdyBlO1xyXG5cdFx0fVxyXG5cdFx0Y3VyKz13cml0dGVuO1xyXG5cdFx0cHVzaGl0ZW0oa2V5LHdyaXR0ZW4pO1xyXG5cdFx0cmV0dXJuIHdyaXR0ZW47XHJcblx0fVxyXG5cdFxyXG5cdHZhciBzYXZlQmxvYiA9IGZ1bmN0aW9uKHZhbHVlLGtleSkge1xyXG5cdFx0a2V5X3dyaXRpbmc9a2V5O1xyXG5cdFx0dmFyIHdyaXR0ZW49a2ZzLndyaXRlQmxvYih2YWx1ZSxjdXIpO1xyXG5cdFx0Y3VyKz13cml0dGVuO1xyXG5cdFx0cHVzaGl0ZW0oa2V5LHdyaXR0ZW4pO1xyXG5cdFx0cmV0dXJuIHdyaXR0ZW47XHJcblx0fVxyXG5cclxuXHR2YXIgZm9sZGVycz1bXTtcclxuXHR2YXIgcHVzaGl0ZW09ZnVuY3Rpb24oa2V5LHdyaXR0ZW4pIHtcclxuXHRcdHZhciBmb2xkZXI9Zm9sZGVyc1tmb2xkZXJzLmxlbmd0aC0xXTtcdFxyXG5cdFx0aWYgKCFmb2xkZXIpIHJldHVybiA7XHJcblx0XHRmb2xkZXIuaXRlbXNsZW5ndGgucHVzaCh3cml0dGVuKTtcclxuXHRcdGlmIChrZXkpIHtcclxuXHRcdFx0aWYgKCFmb2xkZXIua2V5cykgdGhyb3cgJ2Nhbm5vdCBoYXZlIGtleSBpbiBhcnJheSc7XHJcblx0XHRcdGZvbGRlci5rZXlzLnB1c2goa2V5KTtcclxuXHRcdH1cclxuXHR9XHRcclxuXHR2YXIgb3BlbiA9IGZ1bmN0aW9uKG9wdCkge1xyXG5cdFx0dmFyIHN0YXJ0PWN1cjtcclxuXHRcdHZhciBrZXk9b3B0LmtleSB8fCBudWxsO1xyXG5cdFx0dmFyIHR5cGU9b3B0LnR5cGV8fERULmFycmF5O1xyXG5cdFx0Y3VyKz1rZnMud3JpdGVTaWduYXR1cmUodHlwZSxjdXIpO1xyXG5cdFx0Y3VyKz1rZnMud3JpdGVPZmZzZXQoMHgwLGN1cik7IC8vIHByZS1hbGxvYyBzcGFjZSBmb3Igb2Zmc2V0XHJcblx0XHR2YXIgZm9sZGVyPXtcclxuXHRcdFx0dHlwZTp0eXBlLCBrZXk6a2V5LFxyXG5cdFx0XHRzdGFydDpzdGFydCxkYXRhc3RhcnQ6Y3VyLFxyXG5cdFx0XHRpdGVtc2xlbmd0aDpbXSB9O1xyXG5cdFx0aWYgKHR5cGU9PT1EVC5vYmplY3QpIGZvbGRlci5rZXlzPVtdO1xyXG5cdFx0Zm9sZGVycy5wdXNoKGZvbGRlcik7XHJcblx0fVxyXG5cdHZhciBvcGVuT2JqZWN0ID0gZnVuY3Rpb24oa2V5KSB7XHJcblx0XHRvcGVuKHt0eXBlOkRULm9iamVjdCxrZXk6a2V5fSk7XHJcblx0fVxyXG5cdHZhciBvcGVuQXJyYXkgPSBmdW5jdGlvbihrZXkpIHtcclxuXHRcdG9wZW4oe3R5cGU6RFQuYXJyYXksa2V5OmtleX0pO1xyXG5cdH1cclxuXHR2YXIgc2F2ZUludHM9ZnVuY3Rpb24oYXJyLGtleSxmdW5jKSB7XHJcblx0XHRmdW5jLmFwcGx5KGhhbmRsZSxbYXJyLGtleV0pO1xyXG5cdH1cclxuXHR2YXIgY2xvc2UgPSBmdW5jdGlvbihvcHQpIHtcclxuXHRcdGlmICghZm9sZGVycy5sZW5ndGgpIHRocm93ICdlbXB0eSBzdGFjayc7XHJcblx0XHR2YXIgZm9sZGVyPWZvbGRlcnMucG9wKCk7XHJcblx0XHQvL2p1bXAgdG8gbGVuZ3RocyBhbmQga2V5c1xyXG5cdFx0a2ZzLndyaXRlT2Zmc2V0KCBjdXItZm9sZGVyLmRhdGFzdGFydCwgZm9sZGVyLmRhdGFzdGFydC01KTtcclxuXHRcdHZhciBpdGVtY291bnQ9Zm9sZGVyLml0ZW1zbGVuZ3RoLmxlbmd0aDtcclxuXHRcdC8vc2F2ZSBsZW5ndGhzXHJcblx0XHR3cml0ZVZJbnQxKGl0ZW1jb3VudCk7XHJcblx0XHR3cml0ZVZJbnQoZm9sZGVyLml0ZW1zbGVuZ3RoKTtcclxuXHRcdFxyXG5cdFx0aWYgKGZvbGRlci50eXBlPT09RFQub2JqZWN0KSB7XHJcblx0XHRcdC8vdXNlIHV0ZjggZm9yIGtleXNcclxuXHRcdFx0Y3VyKz1rZnMud3JpdGVTdHJpbmdBcnJheShmb2xkZXIua2V5cyxjdXIsJ3V0ZjgnKTtcclxuXHRcdH1cclxuXHRcdHdyaXR0ZW49Y3VyLWZvbGRlci5zdGFydDtcclxuXHRcdHB1c2hpdGVtKGZvbGRlci5rZXksd3JpdHRlbik7XHJcblx0XHRyZXR1cm4gd3JpdHRlbjtcclxuXHR9XHJcblx0XHJcblx0XHJcblx0dmFyIHN0cmluZ2VuY29kaW5nPSd1Y3MyJztcclxuXHR2YXIgc3RyaW5nRW5jb2Rpbmc9ZnVuY3Rpb24obmV3ZW5jb2RpbmcpIHtcclxuXHRcdGlmIChuZXdlbmNvZGluZykgc3RyaW5nZW5jb2Rpbmc9bmV3ZW5jb2Rpbmc7XHJcblx0XHRlbHNlIHJldHVybiBzdHJpbmdlbmNvZGluZztcclxuXHR9XHJcblx0XHJcblx0dmFyIGFsbG51bWJlcl9mYXN0PWZ1bmN0aW9uKGFycikge1xyXG5cdFx0aWYgKGFyci5sZW5ndGg8NSkgcmV0dXJuIGFsbG51bWJlcihhcnIpO1xyXG5cdFx0aWYgKHR5cGVvZiBhcnJbMF09PSdudW1iZXInXHJcblx0XHQgICAgJiYgTWF0aC5yb3VuZChhcnJbMF0pPT1hcnJbMF0gJiYgYXJyWzBdPj0wKVxyXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9XHJcblx0dmFyIGFsbHN0cmluZ19mYXN0PWZ1bmN0aW9uKGFycikge1xyXG5cdFx0aWYgKGFyci5sZW5ndGg8NSkgcmV0dXJuIGFsbHN0cmluZyhhcnIpO1xyXG5cdFx0aWYgKHR5cGVvZiBhcnJbMF09PSdzdHJpbmcnKSByZXR1cm4gdHJ1ZTtcclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9XHRcclxuXHR2YXIgYWxsbnVtYmVyPWZ1bmN0aW9uKGFycikge1xyXG5cdFx0Zm9yICh2YXIgaT0wO2k8YXJyLmxlbmd0aDtpKyspIHtcclxuXHRcdFx0aWYgKHR5cGVvZiBhcnJbaV0hPT0nbnVtYmVyJykgcmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fVxyXG5cdHZhciBhbGxzdHJpbmc9ZnVuY3Rpb24oYXJyKSB7XHJcblx0XHRmb3IgKHZhciBpPTA7aTxhcnIubGVuZ3RoO2krKykge1xyXG5cdFx0XHRpZiAodHlwZW9mIGFycltpXSE9PSdzdHJpbmcnKSByZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9XHJcblx0dmFyIGdldEVuY29kaW5nPWZ1bmN0aW9uKGtleSxlbmNzKSB7XHJcblx0XHR2YXIgZW5jPWVuY3Nba2V5XTtcclxuXHRcdGlmICghZW5jKSByZXR1cm4gbnVsbDtcclxuXHRcdGlmIChlbmM9PSdkZWx0YScgfHwgZW5jPT0ncG9zdGluZycpIHtcclxuXHRcdFx0cmV0dXJuIHNhdmVQSW50O1xyXG5cdFx0fSBlbHNlIGlmIChlbmM9PVwidmFyaWFibGVcIikge1xyXG5cdFx0XHRyZXR1cm4gc2F2ZVZJbnQ7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gbnVsbDtcclxuXHR9XHJcblx0dmFyIHNhdmU9ZnVuY3Rpb24oSixrZXksb3B0cykge1xyXG5cdFx0b3B0cz1vcHRzfHx7fTtcclxuXHRcdFxyXG5cdFx0aWYgKHR5cGVvZiBKPT1cIm51bGxcIiB8fCB0eXBlb2YgSj09XCJ1bmRlZmluZWRcIikge1xyXG5cdFx0XHR0aHJvdyAnY2Fubm90IHNhdmUgbnVsbCB2YWx1ZSBvZiBbJytrZXkrJ10gZm9sZGVycycrSlNPTi5zdHJpbmdpZnkoZm9sZGVycyk7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdHZhciB0eXBlPUouY29uc3RydWN0b3IubmFtZTtcclxuXHRcdGlmICh0eXBlPT09J09iamVjdCcpIHtcclxuXHRcdFx0b3Blbk9iamVjdChrZXkpO1xyXG5cdFx0XHRmb3IgKHZhciBpIGluIEopIHtcclxuXHRcdFx0XHRzYXZlKEpbaV0saSxvcHRzKTtcclxuXHRcdFx0XHRpZiAob3B0cy5hdXRvZGVsZXRlKSBkZWxldGUgSltpXTtcclxuXHRcdFx0fVxyXG5cdFx0XHRjbG9zZSgpO1xyXG5cdFx0fSBlbHNlIGlmICh0eXBlPT09J0FycmF5Jykge1xyXG5cdFx0XHRpZiAoYWxsbnVtYmVyX2Zhc3QoSikpIHtcclxuXHRcdFx0XHRpZiAoSi5zb3J0ZWQpIHsgLy9udW1iZXIgYXJyYXkgaXMgc29ydGVkXHJcblx0XHRcdFx0XHRzYXZlSW50cyhKLGtleSxzYXZlUEludCk7XHQvL3Bvc3RpbmcgZGVsdGEgZm9ybWF0XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdHNhdmVJbnRzKEosa2V5LHNhdmVWSW50KTtcdFxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBlbHNlIGlmIChhbGxzdHJpbmdfZmFzdChKKSkge1xyXG5cdFx0XHRcdHNhdmVTdHJpbmdBcnJheShKLGtleSk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0b3BlbkFycmF5KGtleSk7XHJcblx0XHRcdFx0Zm9yICh2YXIgaT0wO2k8Si5sZW5ndGg7aSsrKSB7XHJcblx0XHRcdFx0XHRzYXZlKEpbaV0sbnVsbCxvcHRzKTtcclxuXHRcdFx0XHRcdGlmIChvcHRzLmF1dG9kZWxldGUpIGRlbGV0ZSBKW2ldO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRjbG9zZSgpO1xyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2UgaWYgKHR5cGU9PT0nU3RyaW5nJykge1xyXG5cdFx0XHRzYXZlU3RyaW5nKEosa2V5KTtcclxuXHRcdH0gZWxzZSBpZiAodHlwZT09PSdOdW1iZXInKSB7XHJcblx0XHRcdGlmIChKPj0wJiZKPDI1Nikgc2F2ZVVJOChKLGtleSk7XHJcblx0XHRcdGVsc2Ugc2F2ZUkzMihKLGtleSk7XHJcblx0XHR9IGVsc2UgaWYgKHR5cGU9PT0nQm9vbGVhbicpIHtcclxuXHRcdFx0c2F2ZUJvb2woSixrZXkpO1xyXG5cdFx0fSBlbHNlIGlmICh0eXBlPT09J0J1ZmZlcicpIHtcclxuXHRcdFx0c2F2ZUJsb2IoSixrZXkpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhyb3cgJ3Vuc3VwcG9ydGVkIHR5cGUgJyt0eXBlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHR2YXIgZnJlZT1mdW5jdGlvbigpIHtcclxuXHRcdHdoaWxlIChmb2xkZXJzLmxlbmd0aCkgY2xvc2UoKTtcclxuXHRcdGtmcy5mcmVlKCk7XHJcblx0fVxyXG5cdHZhciBjdXJyZW50c2l6ZT1mdW5jdGlvbigpIHtcclxuXHRcdHJldHVybiBjdXI7XHJcblx0fVxyXG5cclxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoaGFuZGxlLCBcInNpemVcIiwge2dldCA6IGZ1bmN0aW9uKCl7IHJldHVybiBjdXI7IH19KTtcclxuXHJcblx0dmFyIHdyaXRlRmlsZT1mdW5jdGlvbihmbixvcHRzLGNiKSB7XHJcblx0XHRpZiAodHlwZW9mIGZzPT1cInVuZGVmaW5lZFwiKSB7XHJcblx0XHRcdHZhciBmcz1vcHRzLmZzfHxyZXF1aXJlKCdmcycpO1x0XHJcblx0XHR9XHJcblx0XHR2YXIgdG90YWxieXRlPWhhbmRsZS5jdXJyZW50c2l6ZSgpO1xyXG5cdFx0dmFyIHdyaXR0ZW49MCxiYXRjaD0wO1xyXG5cdFx0XHJcblx0XHRpZiAodHlwZW9mIGNiPT1cInVuZGVmaW5lZFwiIHx8IHR5cGVvZiBvcHRzPT1cImZ1bmN0aW9uXCIpIHtcclxuXHRcdFx0Y2I9b3B0cztcclxuXHRcdH1cclxuXHRcdG9wdHM9b3B0c3x8e307XHJcblx0XHRiYXRjaHNpemU9b3B0cy5iYXRjaHNpemV8fDEwMjQqMTAyNCoxNjsgLy8xNiBNQlxyXG5cclxuXHRcdGlmIChmcy5leGlzdHNTeW5jKGZuKSkgZnMudW5saW5rU3luYyhmbik7XHJcblxyXG5cdFx0dmFyIHdyaXRlQ2I9ZnVuY3Rpb24odG90YWwsd3JpdHRlbixjYixuZXh0KSB7XHJcblx0XHRcdHJldHVybiBmdW5jdGlvbihlcnIpIHtcclxuXHRcdFx0XHRpZiAoZXJyKSB0aHJvdyBcIndyaXRlIGVycm9yXCIrZXJyO1xyXG5cdFx0XHRcdGNiKHRvdGFsLHdyaXR0ZW4pO1xyXG5cdFx0XHRcdGJhdGNoKys7XHJcblx0XHRcdFx0bmV4dCgpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIG5leHQ9ZnVuY3Rpb24oKSB7XHJcblx0XHRcdGlmIChiYXRjaDxiYXRjaGVzKSB7XHJcblx0XHRcdFx0dmFyIGJ1ZnN0YXJ0PWJhdGNoc2l6ZSpiYXRjaDtcclxuXHRcdFx0XHR2YXIgYnVmZW5kPWJ1ZnN0YXJ0K2JhdGNoc2l6ZTtcclxuXHRcdFx0XHRpZiAoYnVmZW5kPnRvdGFsYnl0ZSkgYnVmZW5kPXRvdGFsYnl0ZTtcclxuXHRcdFx0XHR2YXIgc2xpY2VkPWtmcy5idWYuc2xpY2UoYnVmc3RhcnQsYnVmZW5kKTtcclxuXHRcdFx0XHR3cml0dGVuKz1zbGljZWQubGVuZ3RoO1xyXG5cdFx0XHRcdGZzLmFwcGVuZEZpbGUoZm4sc2xpY2VkLHdyaXRlQ2IodG90YWxieXRlLHdyaXR0ZW4sIGNiLG5leHQpKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0dmFyIGJhdGNoZXM9MStNYXRoLmZsb29yKGhhbmRsZS5zaXplL2JhdGNoc2l6ZSk7XHJcblx0XHRuZXh0KCk7XHJcblx0fVxyXG5cdGhhbmRsZS5mcmVlPWZyZWU7XHJcblx0aGFuZGxlLnNhdmVJMzI9c2F2ZUkzMjtcclxuXHRoYW5kbGUuc2F2ZVVJOD1zYXZlVUk4O1xyXG5cdGhhbmRsZS5zYXZlQm9vbD1zYXZlQm9vbDtcclxuXHRoYW5kbGUuc2F2ZVN0cmluZz1zYXZlU3RyaW5nO1xyXG5cdGhhbmRsZS5zYXZlVkludD1zYXZlVkludDtcclxuXHRoYW5kbGUuc2F2ZVBJbnQ9c2F2ZVBJbnQ7XHJcblx0aGFuZGxlLnNhdmVJbnRzPXNhdmVJbnRzO1xyXG5cdGhhbmRsZS5zYXZlQmxvYj1zYXZlQmxvYjtcclxuXHRoYW5kbGUuc2F2ZT1zYXZlO1xyXG5cdGhhbmRsZS5vcGVuQXJyYXk9b3BlbkFycmF5O1xyXG5cdGhhbmRsZS5vcGVuT2JqZWN0PW9wZW5PYmplY3Q7XHJcblx0aGFuZGxlLnN0cmluZ0VuY29kaW5nPXN0cmluZ0VuY29kaW5nO1xyXG5cdC8vdGhpcy5pbnRlZ2VyRW5jb2Rpbmc9aW50ZWdlckVuY29kaW5nO1xyXG5cdGhhbmRsZS5jbG9zZT1jbG9zZTtcclxuXHRoYW5kbGUud3JpdGVGaWxlPXdyaXRlRmlsZTtcclxuXHRoYW5kbGUuY3VycmVudHNpemU9Y3VycmVudHNpemU7XHJcblx0cmV0dXJuIGhhbmRsZTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHM9Q3JlYXRlOyIsIi8qXHJcbiAgVE9ET1xyXG4gIGFuZCBub3RcclxuXHJcbiovXHJcblxyXG4vLyBodHRwOi8vanNmaWRkbGUubmV0L25lb3N3Zi9hWHpXdy9cclxudmFyIHBsaXN0PXJlcXVpcmUoJy4vcGxpc3QnKTtcclxuZnVuY3Rpb24gaW50ZXJzZWN0KEksIEopIHtcclxuICB2YXIgaSA9IGogPSAwO1xyXG4gIHZhciByZXN1bHQgPSBbXTtcclxuXHJcbiAgd2hpbGUoIGkgPCBJLmxlbmd0aCAmJiBqIDwgSi5sZW5ndGggKXtcclxuICAgICBpZiAgICAgIChJW2ldIDwgSltqXSkgaSsrOyBcclxuICAgICBlbHNlIGlmIChJW2ldID4gSltqXSkgaisrOyBcclxuICAgICBlbHNlIHtcclxuICAgICAgIHJlc3VsdFtyZXN1bHQubGVuZ3RoXT1sW2ldO1xyXG4gICAgICAgaSsrO2orKztcclxuICAgICB9XHJcbiAgfVxyXG4gIHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbi8qIHJldHVybiBhbGwgaXRlbXMgaW4gSSBidXQgbm90IGluIEogKi9cclxuZnVuY3Rpb24gc3VidHJhY3QoSSwgSikge1xyXG4gIHZhciBpID0gaiA9IDA7XHJcbiAgdmFyIHJlc3VsdCA9IFtdO1xyXG5cclxuICB3aGlsZSggaSA8IEkubGVuZ3RoICYmIGogPCBKLmxlbmd0aCApe1xyXG4gICAgaWYgKElbaV09PUpbal0pIHtcclxuICAgICAgaSsrO2orKztcclxuICAgIH0gZWxzZSBpZiAoSVtpXTxKW2pdKSB7XHJcbiAgICAgIHdoaWxlIChJW2ldPEpbal0pIHJlc3VsdFtyZXN1bHQubGVuZ3RoXT0gSVtpKytdO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgd2hpbGUoSltqXTxJW2ldKSBqKys7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBpZiAoaj09Si5sZW5ndGgpIHtcclxuICAgIHdoaWxlIChpPEkubGVuZ3RoKSByZXN1bHRbcmVzdWx0Lmxlbmd0aF09SVtpKytdO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxudmFyIHVuaW9uPWZ1bmN0aW9uKGEsYikge1xyXG5cdGlmICghYSB8fCAhYS5sZW5ndGgpIHJldHVybiBiO1xyXG5cdGlmICghYiB8fCAhYi5sZW5ndGgpIHJldHVybiBhO1xyXG4gICAgdmFyIHJlc3VsdCA9IFtdO1xyXG4gICAgdmFyIGFpID0gMDtcclxuICAgIHZhciBiaSA9IDA7XHJcbiAgICB3aGlsZSAodHJ1ZSkge1xyXG4gICAgICAgIGlmICggYWkgPCBhLmxlbmd0aCAmJiBiaSA8IGIubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGlmIChhW2FpXSA8IGJbYmldKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRbcmVzdWx0Lmxlbmd0aF09YVthaV07XHJcbiAgICAgICAgICAgICAgICBhaSsrO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFbYWldID4gYltiaV0pIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdFtyZXN1bHQubGVuZ3RoXT1iW2JpXTtcclxuICAgICAgICAgICAgICAgIGJpKys7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRbcmVzdWx0Lmxlbmd0aF09YVthaV07XHJcbiAgICAgICAgICAgICAgICByZXN1bHRbcmVzdWx0Lmxlbmd0aF09YltiaV07XHJcbiAgICAgICAgICAgICAgICBhaSsrO1xyXG4gICAgICAgICAgICAgICAgYmkrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZiAoYWkgPCBhLmxlbmd0aCkge1xyXG4gICAgICAgICAgICByZXN1bHQucHVzaC5hcHBseShyZXN1bHQsIGEuc2xpY2UoYWksIGEubGVuZ3RoKSk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoYmkgPCBiLmxlbmd0aCkge1xyXG4gICAgICAgICAgICByZXN1bHQucHVzaC5hcHBseShyZXN1bHQsIGIuc2xpY2UoYmksIGIubGVuZ3RoKSk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxudmFyIE9QRVJBVElPTj17J2luY2x1ZGUnOmludGVyc2VjdCwgJ3VuaW9uJzp1bmlvbiwgJ2V4Y2x1ZGUnOnN1YnRyYWN0fTtcclxuXHJcbnZhciBib29sU2VhcmNoPWZ1bmN0aW9uKG9wdHMpIHtcclxuICBvcHRzPW9wdHN8fHt9O1xyXG4gIG9wcz1vcHRzLm9wfHx0aGlzLm9wdHMub3A7XHJcbiAgdGhpcy5kb2NzPVtdO1xyXG5cdGlmICghdGhpcy5waHJhc2VzLmxlbmd0aCkgcmV0dXJuO1xyXG5cdHZhciByPXRoaXMucGhyYXNlc1swXS5kb2NzO1xyXG4gIC8qIGlnbm9yZSBvcGVyYXRvciBvZiBmaXJzdCBwaHJhc2UgKi9cclxuXHRmb3IgKHZhciBpPTE7aTx0aGlzLnBocmFzZXMubGVuZ3RoO2krKykge1xyXG5cdFx0dmFyIG9wPSBvcHNbaV0gfHwgJ3VuaW9uJztcclxuXHRcdHI9T1BFUkFUSU9OW29wXShyLHRoaXMucGhyYXNlc1tpXS5kb2NzKTtcclxuXHR9XHJcblx0dGhpcy5kb2NzPXBsaXN0LnVuaXF1ZShyKTtcclxuXHRyZXR1cm4gdGhpcztcclxufVxyXG5tb2R1bGUuZXhwb3J0cz17c2VhcmNoOmJvb2xTZWFyY2h9IiwidmFyIHBsaXN0PXJlcXVpcmUoXCIuL3BsaXN0XCIpO1xyXG5cclxudmFyIGdldFBocmFzZVdpZHRocz1mdW5jdGlvbiAoUSxwaHJhc2VpZCx2cG9zcykge1xyXG5cdHZhciByZXM9W107XHJcblx0Zm9yICh2YXIgaSBpbiB2cG9zcykge1xyXG5cdFx0cmVzLnB1c2goZ2V0UGhyYXNlV2lkdGgoUSxwaHJhc2VpZCx2cG9zc1tpXSkpO1xyXG5cdH1cclxuXHRyZXR1cm4gcmVzO1xyXG59XHJcbnZhciBnZXRQaHJhc2VXaWR0aD1mdW5jdGlvbiAoUSxwaHJhc2VpZCx2cG9zKSB7XHJcblx0dmFyIFA9US5waHJhc2VzW3BocmFzZWlkXTtcclxuXHR2YXIgd2lkdGg9MCx2YXJ3aWR0aD1mYWxzZTtcclxuXHRpZiAoUC53aWR0aCkgcmV0dXJuIFAud2lkdGg7IC8vIG5vIHdpbGRjYXJkXHJcblx0aWYgKFAudGVybWlkLmxlbmd0aDwyKSByZXR1cm4gUC50ZXJtbGVuZ3RoWzBdO1xyXG5cdHZhciBsYXN0dGVybXBvc3Rpbmc9US50ZXJtc1tQLnRlcm1pZFtQLnRlcm1pZC5sZW5ndGgtMV1dLnBvc3Rpbmc7XHJcblxyXG5cdGZvciAodmFyIGkgaW4gUC50ZXJtaWQpIHtcclxuXHRcdHZhciBUPVEudGVybXNbUC50ZXJtaWRbaV1dO1xyXG5cdFx0aWYgKFQub3A9PSd3aWxkY2FyZCcpIHtcclxuXHRcdFx0d2lkdGgrPVQud2lkdGg7XHJcblx0XHRcdGlmIChULndpbGRjYXJkPT0nKicpIHZhcndpZHRoPXRydWU7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR3aWR0aCs9UC50ZXJtbGVuZ3RoW2ldO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRpZiAodmFyd2lkdGgpIHsgLy93aWR0aCBtaWdodCBiZSBzbWFsbGVyIGR1ZSB0byAqIHdpbGRjYXJkXHJcblx0XHR2YXIgYXQ9cGxpc3QuaW5kZXhPZlNvcnRlZChsYXN0dGVybXBvc3RpbmcsdnBvcyk7XHJcblx0XHR2YXIgZW5kcG9zPWxhc3R0ZXJtcG9zdGluZ1thdF07XHJcblx0XHRpZiAoZW5kcG9zLXZwb3M8d2lkdGgpIHdpZHRoPWVuZHBvcy12cG9zKzE7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gd2lkdGg7XHJcbn1cclxuLyogcmV0dXJuIFt2cG9zLCBwaHJhc2VpZCwgcGhyYXNld2lkdGgsIG9wdGlvbmFsX3RhZ25hbWVdIGJ5IHNsb3QgcmFuZ2UqL1xyXG52YXIgaGl0SW5SYW5nZT1mdW5jdGlvbihRLHN0YXJ0dnBvcyxlbmR2cG9zKSB7XHJcblx0dmFyIHJlcz1bXTtcclxuXHRpZiAoIVEgfHwgIVEucmF3cmVzdWx0IHx8ICFRLnJhd3Jlc3VsdC5sZW5ndGgpIHJldHVybiByZXM7XHJcblx0Zm9yICh2YXIgaT0wO2k8US5waHJhc2VzLmxlbmd0aDtpKyspIHtcclxuXHRcdHZhciBQPVEucGhyYXNlc1tpXTtcclxuXHRcdGlmICghUC5wb3N0aW5nKSBjb250aW51ZTtcclxuXHRcdHZhciBzPXBsaXN0LmluZGV4T2ZTb3J0ZWQoUC5wb3N0aW5nLHN0YXJ0dnBvcyk7XHJcblx0XHR2YXIgZT1wbGlzdC5pbmRleE9mU29ydGVkKFAucG9zdGluZyxlbmR2cG9zKTtcclxuXHRcdHZhciByPVAucG9zdGluZy5zbGljZShzLGUrMSk7XHJcblx0XHR2YXIgd2lkdGg9Z2V0UGhyYXNlV2lkdGhzKFEsaSxyKTtcclxuXHJcblx0XHRyZXM9cmVzLmNvbmNhdChyLm1hcChmdW5jdGlvbih2cG9zLGlkeCl7IHJldHVybiBbdnBvcyx3aWR0aFtpZHhdLGldIH0pKTtcclxuXHR9XHJcblx0Ly8gb3JkZXIgYnkgdnBvcywgaWYgdnBvcyBpcyB0aGUgc2FtZSwgbGFyZ2VyIHdpZHRoIGNvbWUgZmlyc3QuXHJcblx0Ly8gc28gdGhlIG91dHB1dCB3aWxsIGJlXHJcblx0Ly8gPHRhZzE+PHRhZzI+b25lPC90YWcyPnR3bzwvdGFnMT5cclxuXHQvL1RPRE8sIG1pZ2h0IGNhdXNlIG92ZXJsYXAgaWYgc2FtZSB2cG9zIGFuZCBzYW1lIHdpZHRoXHJcblx0Ly9uZWVkIHRvIGNoZWNrIHRhZyBuYW1lXHJcblx0cmVzLnNvcnQoZnVuY3Rpb24oYSxiKXtyZXR1cm4gYVswXT09YlswXT8gYlsxXS1hWzFdIDphWzBdLWJbMF19KTtcclxuXHJcblx0cmV0dXJuIHJlcztcclxufVxyXG5cclxudmFyIHRhZ3NJblJhbmdlPWZ1bmN0aW9uKFEscmVuZGVyVGFncyxzdGFydHZwb3MsZW5kdnBvcykge1xyXG5cdHZhciByZXM9W107XHJcblx0aWYgKHR5cGVvZiByZW5kZXJUYWdzPT1cInN0cmluZ1wiKSByZW5kZXJUYWdzPVtyZW5kZXJUYWdzXTtcclxuXHJcblx0cmVuZGVyVGFncy5tYXAoZnVuY3Rpb24odGFnKXtcclxuXHRcdHZhciBzdGFydHM9US5lbmdpbmUuZ2V0KFtcImZpZWxkc1wiLHRhZytcIl9zdGFydFwiXSk7XHJcblx0XHR2YXIgZW5kcz1RLmVuZ2luZS5nZXQoW1wiZmllbGRzXCIsdGFnK1wiX2VuZFwiXSk7XHJcblx0XHRpZiAoIXN0YXJ0cykgcmV0dXJuO1xyXG5cclxuXHRcdHZhciBzPXBsaXN0LmluZGV4T2ZTb3J0ZWQoc3RhcnRzLHN0YXJ0dnBvcyk7XHJcblx0XHR2YXIgZT1zO1xyXG5cdFx0d2hpbGUgKGU8c3RhcnRzLmxlbmd0aCAmJiBzdGFydHNbZV08ZW5kdnBvcykgZSsrO1xyXG5cdFx0dmFyIG9wZW50YWdzPXN0YXJ0cy5zbGljZShzLGUpO1xyXG5cclxuXHRcdHM9cGxpc3QuaW5kZXhPZlNvcnRlZChlbmRzLHN0YXJ0dnBvcyk7XHJcblx0XHRlPXM7XHJcblx0XHR3aGlsZSAoZTxlbmRzLmxlbmd0aCAmJiBlbmRzW2VdPGVuZHZwb3MpIGUrKztcclxuXHRcdHZhciBjbG9zZXRhZ3M9ZW5kcy5zbGljZShzLGUpO1xyXG5cclxuXHRcdG9wZW50YWdzLm1hcChmdW5jdGlvbihzdGFydCxpZHgpIHtcclxuXHRcdFx0cmVzLnB1c2goW3N0YXJ0LGNsb3NldGFnc1tpZHhdLXN0YXJ0LHRhZ10pO1xyXG5cdFx0fSlcclxuXHR9KTtcclxuXHQvLyBvcmRlciBieSB2cG9zLCBpZiB2cG9zIGlzIHRoZSBzYW1lLCBsYXJnZXIgd2lkdGggY29tZSBmaXJzdC5cclxuXHRyZXMuc29ydChmdW5jdGlvbihhLGIpe3JldHVybiBhWzBdPT1iWzBdPyBiWzFdLWFbMV0gOmFbMF0tYlswXX0pO1xyXG5cclxuXHRyZXR1cm4gcmVzO1xyXG59XHJcblxyXG4vKlxyXG5naXZlbiBhIHZwb3MgcmFuZ2Ugc3RhcnQsIGZpbGUsIGNvbnZlcnQgdG8gZmlsZXN0YXJ0LCBmaWxlZW5kXHJcbiAgIGZpbGVzdGFydCA6IHN0YXJ0aW5nIGZpbGVcclxuICAgc3RhcnQgICA6IHZwb3Mgc3RhcnRcclxuICAgc2hvd2ZpbGU6IGhvdyBtYW55IGZpbGVzIHRvIGRpc3BsYXlcclxuICAgc2hvd3BhZ2U6IGhvdyBtYW55IHBhZ2VzIHRvIGRpc3BsYXlcclxuXHJcbm91dHB1dDpcclxuICAgYXJyYXkgb2YgZmlsZWlkIHdpdGggaGl0c1xyXG4qL1xyXG52YXIgZ2V0RmlsZVdpdGhIaXRzPWZ1bmN0aW9uKGVuZ2luZSxRLHJhbmdlKSB7XHJcblx0dmFyIGZpbGVPZmZzZXRzPWVuZ2luZS5nZXQoXCJmaWxlT2Zmc2V0c1wiKTtcclxuXHR2YXIgb3V0PVtdLGZpbGVjb3VudD0xMDA7XHJcblx0dmFyIHN0YXJ0PTAgLCBlbmQ9US5ieUZpbGUubGVuZ3RoO1xyXG5cdFEuZXhjZXJwdE92ZXJmbG93PWZhbHNlO1xyXG5cdGlmIChyYW5nZS5zdGFydCkge1xyXG5cdFx0dmFyIGZpcnN0PXJhbmdlLnN0YXJ0IDtcclxuXHRcdHZhciBsYXN0PXJhbmdlLmVuZDtcclxuXHRcdGlmICghbGFzdCkgbGFzdD1OdW1iZXIuTUFYX1NBRkVfSU5URUdFUjtcclxuXHRcdGZvciAodmFyIGk9MDtpPGZpbGVPZmZzZXRzLmxlbmd0aDtpKyspIHtcclxuXHRcdFx0Ly9pZiAoZmlsZU9mZnNldHNbaV0+Zmlyc3QpIGJyZWFrO1xyXG5cdFx0XHRpZiAoZmlsZU9mZnNldHNbaV0+bGFzdCkge1xyXG5cdFx0XHRcdGVuZD1pO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmIChmaWxlT2Zmc2V0c1tpXTxmaXJzdCkgc3RhcnQ9aTtcclxuXHRcdH1cdFx0XHJcblx0fSBlbHNlIHtcclxuXHRcdHN0YXJ0PXJhbmdlLmZpbGVzdGFydCB8fCAwO1xyXG5cdFx0aWYgKHJhbmdlLm1heGZpbGUpIHtcclxuXHRcdFx0ZmlsZWNvdW50PXJhbmdlLm1heGZpbGU7XHJcblx0XHR9IGVsc2UgaWYgKHJhbmdlLnNob3dwYWdlKSB7XHJcblx0XHRcdHRocm93IFwibm90IGltcGxlbWVudCB5ZXRcIlxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0dmFyIGZpbGVXaXRoSGl0cz1bXSx0b3RhbGhpdD0wO1xyXG5cdHJhbmdlLm1heGhpdD1yYW5nZS5tYXhoaXR8fDEwMDA7XHJcblxyXG5cdGZvciAodmFyIGk9c3RhcnQ7aTxlbmQ7aSsrKSB7XHJcblx0XHRpZihRLmJ5RmlsZVtpXS5sZW5ndGg+MCkge1xyXG5cdFx0XHR0b3RhbGhpdCs9US5ieUZpbGVbaV0ubGVuZ3RoO1xyXG5cdFx0XHRmaWxlV2l0aEhpdHMucHVzaChpKTtcclxuXHRcdFx0cmFuZ2UubmV4dEZpbGVTdGFydD1pO1xyXG5cdFx0XHRpZiAoZmlsZVdpdGhIaXRzLmxlbmd0aD49ZmlsZWNvdW50KSB7XHJcblx0XHRcdFx0US5leGNlcnB0T3ZlcmZsb3c9dHJ1ZTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAodG90YWxoaXQ+cmFuZ2UubWF4aGl0KSB7XHJcblx0XHRcdFx0US5leGNlcnB0T3ZlcmZsb3c9dHJ1ZTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHRpZiAoaT49ZW5kKSB7IC8vbm8gbW9yZSBmaWxlXHJcblx0XHRRLmV4Y2VycHRTdG9wPXRydWU7XHJcblx0fVxyXG5cdHJldHVybiBmaWxlV2l0aEhpdHM7XHJcbn1cclxudmFyIHJlc3VsdGxpc3Q9ZnVuY3Rpb24oZW5naW5lLFEsb3B0cyxjYikge1xyXG5cdHZhciBvdXRwdXQ9W107XHJcblx0aWYgKCFRLnJhd3Jlc3VsdCB8fCAhUS5yYXdyZXN1bHQubGVuZ3RoKSB7XHJcblx0XHRjYihvdXRwdXQpO1xyXG5cdFx0cmV0dXJuO1xyXG5cdH1cclxuXHJcblx0aWYgKG9wdHMucmFuZ2UpIHtcclxuXHRcdGlmIChvcHRzLnJhbmdlLm1heGhpdCAmJiAhb3B0cy5yYW5nZS5tYXhmaWxlKSB7XHJcblx0XHRcdG9wdHMucmFuZ2UubWF4ZmlsZT1vcHRzLnJhbmdlLm1heGhpdDtcclxuXHRcdFx0b3B0cy5yYW5nZS5tYXhzZWc9b3B0cy5yYW5nZS5tYXhoaXQ7XHJcblx0XHR9XHJcblx0XHRpZiAoIW9wdHMucmFuZ2UubWF4c2VnKSBvcHRzLnJhbmdlLm1heHNlZz0xMDA7XHJcblx0XHRpZiAoIW9wdHMucmFuZ2UuZW5kKSB7XHJcblx0XHRcdG9wdHMucmFuZ2UuZW5kPU51bWJlci5NQVhfU0FGRV9JTlRFR0VSO1xyXG5cdFx0fVxyXG5cdH1cclxuXHR2YXIgZmlsZVdpdGhIaXRzPWdldEZpbGVXaXRoSGl0cyhlbmdpbmUsUSxvcHRzLnJhbmdlKTtcclxuXHRpZiAoIWZpbGVXaXRoSGl0cy5sZW5ndGgpIHtcclxuXHRcdGNiKG91dHB1dCk7XHJcblx0XHRyZXR1cm47XHJcblx0fVxyXG5cclxuXHR2YXIgb3V0cHV0PVtdLGZpbGVzPVtdOy8vdGVtcG9yYXJ5IGhvbGRlciBmb3Igc2VnbmFtZXNcclxuXHRmb3IgKHZhciBpPTA7aTxmaWxlV2l0aEhpdHMubGVuZ3RoO2krKykge1xyXG5cdFx0dmFyIG5maWxlPWZpbGVXaXRoSGl0c1tpXTtcclxuXHRcdHZhciBzZWdvZmZzZXRzPWVuZ2luZS5nZXRGaWxlU2VnT2Zmc2V0cyhuZmlsZSk7XHJcblx0XHR2YXIgc2VnbmFtZXM9ZW5naW5lLmdldEZpbGVTZWdOYW1lcyhuZmlsZSk7XHJcblx0XHRmaWxlc1tuZmlsZV09e3NlZ29mZnNldHM6c2Vnb2Zmc2V0c307XHJcblx0XHR2YXIgc2Vnd2l0aGhpdD1wbGlzdC5ncm91cGJ5cG9zdGluZzIoUS5ieUZpbGVbIG5maWxlIF0sICBzZWdvZmZzZXRzKTtcclxuXHRcdC8vaWYgKHNlZ29mZnNldHNbMF09PTEpXHJcblx0XHQvL3NlZ3dpdGhoaXQuc2hpZnQoKTsgLy90aGUgZmlyc3QgaXRlbSBpcyBub3QgdXNlZCAoMH5RLmJ5RmlsZVswXSApXHJcblxyXG5cdFx0Zm9yICh2YXIgaj0wOyBqPHNlZ3dpdGhoaXQubGVuZ3RoO2orKykge1xyXG5cdFx0XHRpZiAoIXNlZ3dpdGhoaXRbal0ubGVuZ3RoKSBjb250aW51ZTtcclxuXHRcdFx0Ly92YXIgb2Zmc2V0cz1zZWd3aXRoaGl0W2pdLm1hcChmdW5jdGlvbihwKXtyZXR1cm4gcC0gZmlsZU9mZnNldHNbaV19KTtcclxuXHRcdFx0aWYgKHNlZ29mZnNldHNbal0+b3B0cy5yYW5nZS5lbmQpIGJyZWFrO1xyXG5cdFx0XHRvdXRwdXQucHVzaCggIHtmaWxlOiBuZmlsZSwgc2VnOmosICBzZWduYW1lOnNlZ25hbWVzW2pdfSk7XHJcblx0XHRcdGlmIChvdXRwdXQubGVuZ3RoPm9wdHMucmFuZ2UubWF4c2VnKSBicmVhaztcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHZhciBzZWdwYXRocz1vdXRwdXQubWFwKGZ1bmN0aW9uKHApe1xyXG5cdFx0cmV0dXJuIFtcImZpbGVjb250ZW50c1wiLHAuZmlsZSxwLnNlZ107XHJcblx0fSk7XHJcblx0Ly9wcmVwYXJlIHRoZSB0ZXh0XHJcblx0ZW5naW5lLmdldChzZWdwYXRocyxmdW5jdGlvbihzZWdzKXtcclxuXHRcdHZhciBzZXE9MDtcclxuXHRcdGlmIChzZWdzKSBmb3IgKHZhciBpPTA7aTxzZWdzLmxlbmd0aDtpKyspIHtcclxuXHRcdFx0dmFyIHN0YXJ0dnBvcz1maWxlc1tvdXRwdXRbaV0uZmlsZV0uc2Vnb2Zmc2V0c1tvdXRwdXRbaV0uc2VnLTFdO1xyXG5cdFx0XHR2YXIgZW5kdnBvcz1maWxlc1tvdXRwdXRbaV0uZmlsZV0uc2Vnb2Zmc2V0c1tvdXRwdXRbaV0uc2VnXTtcclxuXHRcdFx0dmFyIGhsPXt9O1xyXG5cclxuXHRcdFx0aWYgKG9wdHMucmFuZ2UgJiYgb3B0cy5yYW5nZS5zdGFydCAgKSB7XHJcblx0XHRcdFx0aWYgKCBzdGFydHZwb3M8b3B0cy5yYW5nZS5zdGFydCkgc3RhcnR2cG9zPW9wdHMucmFuZ2Uuc3RhcnQ7XHJcblx0XHRcdC8vXHRpZiAoZW5kdnBvcz5vcHRzLnJhbmdlLmVuZCkgZW5kdnBvcz1vcHRzLnJhbmdlLmVuZDtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0aWYgKG9wdHMubm9oaWdobGlnaHQpIHtcclxuXHRcdFx0XHRobC50ZXh0PXNlZ3NbaV07XHJcblx0XHRcdFx0aGwuaGl0cz1oaXRJblJhbmdlKFEsc3RhcnR2cG9zLGVuZHZwb3MpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHZhciBvPXtub2NybGY6dHJ1ZSxub3NwYW46dHJ1ZSxcclxuXHRcdFx0XHRcdHRleHQ6c2Vnc1tpXSxzdGFydHZwb3M6c3RhcnR2cG9zLCBlbmR2cG9zOiBlbmR2cG9zLCBcclxuXHRcdFx0XHRcdFE6USxmdWxsdGV4dDpvcHRzLmZ1bGx0ZXh0fTtcclxuXHRcdFx0XHRobD1oaWdobGlnaHQoUSxvKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAoaGwudGV4dCkge1xyXG5cdFx0XHRcdG91dHB1dFtpXS50ZXh0PWhsLnRleHQ7XHJcblx0XHRcdFx0b3V0cHV0W2ldLmhpdHM9aGwuaGl0cztcclxuXHRcdFx0XHRvdXRwdXRbaV0uc2VxPXNlcTtcclxuXHRcdFx0XHRzZXErPWhsLmhpdHMubGVuZ3RoO1xyXG5cclxuXHRcdFx0XHRvdXRwdXRbaV0uc3RhcnQ9c3RhcnR2cG9zO1x0XHRcdFx0XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0b3V0cHV0W2ldPW51bGw7IC8vcmVtb3ZlIGl0ZW0gdnBvcyBsZXNzIHRoYW4gb3B0cy5yYW5nZS5zdGFydFxyXG5cdFx0XHR9XHJcblx0XHR9IFxyXG5cdFx0b3V0cHV0PW91dHB1dC5maWx0ZXIoZnVuY3Rpb24obyl7cmV0dXJuIG8hPW51bGx9KTtcclxuXHRcdGNiKG91dHB1dCk7XHJcblx0fSk7XHJcbn1cclxudmFyIGluamVjdFRhZz1mdW5jdGlvbihRLG9wdHMpe1xyXG5cdHZhciBoaXRzPW9wdHMuaGl0cztcclxuXHR2YXIgdGFncz1vcHRzLnRhZ3M7XHJcblx0aWYgKCF0YWdzKSB0YWdzPVtdO1xyXG5cdHZhciBoaXRjbGFzcz1vcHRzLmhpdGNsYXNzfHwnaGwnO1xyXG5cdHZhciBvdXRwdXQ9JycsTz1bXSxqPTAsaz0wO1xyXG5cdHZhciBzdXJyb3VuZD1vcHRzLnN1cnJvdW5kfHw1O1xyXG5cclxuXHR2YXIgdG9rZW5zPVEudG9rZW5pemUob3B0cy50ZXh0KS50b2tlbnM7XHJcblx0dmFyIHZwb3M9b3B0cy52cG9zO1xyXG5cdHZhciBpPTAscHJldmlucmFuZ2U9ISFvcHRzLmZ1bGx0ZXh0ICxpbnJhbmdlPSEhb3B0cy5mdWxsdGV4dDtcclxuXHR2YXIgaGl0c3RhcnQ9MCxoaXRlbmQ9MCx0YWdzdGFydD0wLHRhZ2VuZD0wLHRhZ2NsYXNzPVwiXCI7XHJcblx0d2hpbGUgKGk8dG9rZW5zLmxlbmd0aCkge1xyXG5cdFx0dmFyIHNraXA9US5pc1NraXAodG9rZW5zW2ldKTtcclxuXHRcdHZhciBoYXNoaXQ9ZmFsc2U7XHJcblx0XHRpbnJhbmdlPW9wdHMuZnVsbHRleHQgfHwgKGo8aGl0cy5sZW5ndGggJiYgdnBvcytzdXJyb3VuZD49aGl0c1tqXVswXSB8fFxyXG5cdFx0XHRcdChqPjAgJiYgajw9aGl0cy5sZW5ndGggJiYgIGhpdHNbai0xXVswXStzdXJyb3VuZCoyPj12cG9zKSk7XHRcclxuXHJcblx0XHRpZiAocHJldmlucmFuZ2UhPWlucmFuZ2UpIHtcclxuXHRcdFx0b3V0cHV0Kz1vcHRzLmFicmlkZ2V8fFwiLi4uXCI7XHJcblx0XHR9XHJcblx0XHRwcmV2aW5yYW5nZT1pbnJhbmdlO1xyXG5cdFx0dmFyIHRva2VuPXRva2Vuc1tpXTtcclxuXHRcdGlmIChvcHRzLm5vY3JsZiAmJiB0b2tlbj09XCJcXG5cIikgdG9rZW49XCJcIjtcclxuXHJcblx0XHRpZiAoaW5yYW5nZSAmJiBpPHRva2Vucy5sZW5ndGgpIHtcclxuXHRcdFx0aWYgKHNraXApIHtcclxuXHRcdFx0XHRvdXRwdXQrPXRva2VuO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHZhciBjbGFzc2VzPVwiXCI7XHRcclxuXHJcblx0XHRcdFx0Ly9jaGVjayBoaXRcclxuXHRcdFx0XHRpZiAoajxoaXRzLmxlbmd0aCAmJiB2cG9zPT1oaXRzW2pdWzBdKSB7XHJcblx0XHRcdFx0XHR2YXIgbnBocmFzZT1oaXRzW2pdWzJdICUgMTAsIHdpZHRoPWhpdHNbal1bMV07XHJcblx0XHRcdFx0XHRoaXRzdGFydD1oaXRzW2pdWzBdO1xyXG5cdFx0XHRcdFx0aGl0ZW5kPWhpdHN0YXJ0K3dpZHRoO1xyXG5cdFx0XHRcdFx0aisrO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0Ly9jaGVjayB0YWdcclxuXHRcdFx0XHRpZiAoazx0YWdzLmxlbmd0aCAmJiB2cG9zPT10YWdzW2tdWzBdKSB7XHJcblx0XHRcdFx0XHR2YXIgd2lkdGg9dGFnc1trXVsxXTtcclxuXHRcdFx0XHRcdHRhZ3N0YXJ0PXRhZ3Nba11bMF07XHJcblx0XHRcdFx0XHR0YWdlbmQ9dGFnc3RhcnQrd2lkdGg7XHJcblx0XHRcdFx0XHR0YWdjbGFzcz10YWdzW2tdWzJdO1xyXG5cdFx0XHRcdFx0aysrO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0aWYgKHZwb3M+PWhpdHN0YXJ0ICYmIHZwb3M8aGl0ZW5kKSBjbGFzc2VzPWhpdGNsYXNzK1wiIFwiK2hpdGNsYXNzK25waHJhc2U7XHJcblx0XHRcdFx0aWYgKHZwb3M+PXRhZ3N0YXJ0ICYmIHZwb3M8dGFnZW5kKSBjbGFzc2VzKz1cIiBcIit0YWdjbGFzcztcclxuXHJcblx0XHRcdFx0aWYgKGNsYXNzZXMgfHwgIW9wdHMubm9zcGFuKSB7XHJcblx0XHRcdFx0XHRvdXRwdXQrPSc8c3BhbiB2cG9zPVwiJyt2cG9zKydcIic7XHJcblx0XHRcdFx0XHRpZiAoY2xhc3NlcykgY2xhc3Nlcz0nIGNsYXNzPVwiJytjbGFzc2VzKydcIic7XHJcblx0XHRcdFx0XHRvdXRwdXQrPWNsYXNzZXMrJz4nO1xyXG5cdFx0XHRcdFx0b3V0cHV0Kz10b2tlbisnPC9zcGFuPic7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdG91dHB1dCs9dG9rZW47XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRpZiAoIXNraXApIHZwb3MrKztcclxuXHRcdGkrKzsgXHJcblx0fVxyXG5cclxuXHRPLnB1c2gob3V0cHV0KTtcclxuXHRvdXRwdXQ9XCJcIjtcclxuXHJcblx0cmV0dXJuIE8uam9pbihcIlwiKTtcclxufVxyXG52YXIgaGlnaGxpZ2h0PWZ1bmN0aW9uKFEsb3B0cykge1xyXG5cdGlmICghb3B0cy50ZXh0KSByZXR1cm4ge3RleHQ6XCJcIixoaXRzOltdfTtcclxuXHR2YXIgb3B0PXt0ZXh0Om9wdHMudGV4dCxcclxuXHRcdGhpdHM6bnVsbCxhYnJpZGdlOm9wdHMuYWJyaWRnZSx2cG9zOm9wdHMuc3RhcnR2cG9zLFxyXG5cdFx0ZnVsbHRleHQ6b3B0cy5mdWxsdGV4dCxyZW5kZXJUYWdzOm9wdHMucmVuZGVyVGFncyxub3NwYW46b3B0cy5ub3NwYW4sbm9jcmxmOm9wdHMubm9jcmxmLFxyXG5cdH07XHJcblxyXG5cdG9wdC5oaXRzPWhpdEluUmFuZ2Uob3B0cy5RLG9wdHMuc3RhcnR2cG9zLG9wdHMuZW5kdnBvcyk7XHJcblx0cmV0dXJuIHt0ZXh0OmluamVjdFRhZyhRLG9wdCksaGl0czpvcHQuaGl0c307XHJcbn1cclxuXHJcbnZhciBnZXRTZWc9ZnVuY3Rpb24oZW5naW5lLGZpbGVpZCxzZWdpZCxjYikge1xyXG5cdHZhciBmaWxlT2Zmc2V0cz1lbmdpbmUuZ2V0KFwiZmlsZU9mZnNldHNcIik7XHJcblx0dmFyIHNlZ3BhdGhzPVtcImZpbGVjb250ZW50c1wiLGZpbGVpZCxzZWdpZF07XHJcblx0dmFyIHNlZ25hbWVzPWVuZ2luZS5nZXRGaWxlU2VnTmFtZXMoZmlsZWlkKTtcclxuXHJcblx0ZW5naW5lLmdldChzZWdwYXRocyxmdW5jdGlvbih0ZXh0KXtcclxuXHRcdGNiLmFwcGx5KGVuZ2luZS5jb250ZXh0LFt7dGV4dDp0ZXh0LGZpbGU6ZmlsZWlkLHNlZzpzZWdpZCxzZWduYW1lOnNlZ25hbWVzW3NlZ2lkXX1dKTtcclxuXHR9KTtcclxufVxyXG5cclxudmFyIGdldFNlZ1N5bmM9ZnVuY3Rpb24oZW5naW5lLGZpbGVpZCxzZWdpZCkge1xyXG5cdHZhciBmaWxlT2Zmc2V0cz1lbmdpbmUuZ2V0KFwiZmlsZW9mZnNldHNcIik7XHJcblx0dmFyIHNlZ3BhdGhzPVtcImZpbGVjb250ZW50c1wiLGZpbGVpZCxzZWdpZF07XHJcblx0dmFyIHNlZ25hbWVzPWVuZ2luZS5nZXRGaWxlU2VnTmFtZXMoZmlsZWlkKTtcclxuXHJcblx0dmFyIHRleHQ9ZW5naW5lLmdldChzZWdwYXRocyk7XHJcblx0cmV0dXJuIHt0ZXh0OnRleHQsZmlsZTpmaWxlaWQsc2VnOnNlZ2lkLHNlZ25hbWU6c2VnbmFtZXNbc2VnaWRdfTtcclxufVxyXG5cclxudmFyIGdldFJhbmdlPWZ1bmN0aW9uKGVuZ2luZSxzdGFydCxlbmQsY2IpIHtcclxuXHR2YXIgZmlsZW9mZnNldHM9ZW5naW5lLmdldChcImZpbGVvZmZzZXRzXCIpO1xyXG5cdC8vdmFyIHBhZ2VwYXRocz1bXCJmaWxlQ29udGVudHNcIixdO1xyXG5cdC8vZmluZCBmaXJzdCBwYWdlIGFuZCBsYXN0IHBhZ2VcclxuXHQvL2NyZWF0ZSBnZXQgcGF0aHNcclxuXHJcbn1cclxuXHJcbnZhciBnZXRGaWxlPWZ1bmN0aW9uKGVuZ2luZSxmaWxlaWQsY2IpIHtcclxuXHR2YXIgZmlsZW5hbWU9ZW5naW5lLmdldChcImZpbGVuYW1lc1wiKVtmaWxlaWRdO1xyXG5cdHZhciBzZWduYW1lcz1lbmdpbmUuZ2V0RmlsZVNlZ05hbWVzKGZpbGVpZCk7XHJcblx0dmFyIGZpbGVzdGFydD1lbmdpbmUuZ2V0KFwiZmlsZW9mZnNldHNcIilbZmlsZWlkXTtcclxuXHR2YXIgb2Zmc2V0cz1lbmdpbmUuZ2V0RmlsZVNlZ09mZnNldHMoZmlsZWlkKTtcclxuXHR2YXIgcGM9MDtcclxuXHRlbmdpbmUuZ2V0KFtcImZpbGVDb250ZW50c1wiLGZpbGVpZF0sdHJ1ZSxmdW5jdGlvbihkYXRhKXtcclxuXHRcdHZhciB0ZXh0PWRhdGEubWFwKGZ1bmN0aW9uKHQsaWR4KSB7XHJcblx0XHRcdGlmIChpZHg9PTApIHJldHVybiBcIlwiOyBcclxuXHRcdFx0dmFyIHBiPSc8cGIgbj1cIicrc2VnbmFtZXNbaWR4XSsnXCI+PC9wYj4nO1xyXG5cdFx0XHRyZXR1cm4gcGIrdDtcclxuXHRcdH0pO1xyXG5cdFx0Y2Ioe3RleHRzOmRhdGEsdGV4dDp0ZXh0LmpvaW4oXCJcIiksc2VnbmFtZXM6c2VnbmFtZXMsZmlsZXN0YXJ0OmZpbGVzdGFydCxvZmZzZXRzOm9mZnNldHMsZmlsZTpmaWxlaWQsZmlsZW5hbWU6ZmlsZW5hbWV9KTsgLy9mb3JjZSBkaWZmZXJlbnQgdG9rZW5cclxuXHR9KTtcclxufVxyXG5cclxudmFyIGhpZ2hsaWdodFJhbmdlPWZ1bmN0aW9uKFEsc3RhcnR2cG9zLGVuZHZwb3Msb3B0cyxjYil7XHJcblx0Ly9ub3QgaW1wbGVtZW50IHlldFxyXG59XHJcblxyXG52YXIgaGlnaGxpZ2h0RmlsZT1mdW5jdGlvbihRLGZpbGVpZCxvcHRzLGNiKSB7XHJcblx0aWYgKHR5cGVvZiBvcHRzPT1cImZ1bmN0aW9uXCIpIHtcclxuXHRcdGNiPW9wdHM7XHJcblx0fVxyXG5cclxuXHRpZiAoIVEgfHwgIVEuZW5naW5lKSByZXR1cm4gY2IobnVsbCk7XHJcblxyXG5cdHZhciBzZWdvZmZzZXRzPVEuZW5naW5lLmdldEZpbGVTZWdPZmZzZXRzKGZpbGVpZCk7XHJcblx0dmFyIG91dHB1dD1bXTtcdFxyXG5cdC8vY29uc29sZS5sb2coc3RhcnR2cG9zLGVuZHZwb3MpXHJcblx0US5lbmdpbmUuZ2V0KFtcImZpbGVDb250ZW50c1wiLGZpbGVpZF0sdHJ1ZSxmdW5jdGlvbihkYXRhKXtcclxuXHRcdGlmICghZGF0YSkge1xyXG5cdFx0XHRjb25zb2xlLmVycm9yKFwid3JvbmcgZmlsZSBpZFwiLGZpbGVpZCk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRmb3IgKHZhciBpPTA7aTxkYXRhLmxlbmd0aC0xO2krKyApe1xyXG5cdFx0XHRcdHZhciBzdGFydHZwb3M9c2Vnb2Zmc2V0c1tpXTtcclxuXHRcdFx0XHR2YXIgZW5kdnBvcz1zZWdvZmZzZXRzW2krMV07XHJcblx0XHRcdFx0dmFyIHBhZ2VuYW1lcz1RLmVuZ2luZS5nZXRGaWxlU2VnTmFtZXMoZmlsZWlkKTtcclxuXHRcdFx0XHR2YXIgcGFnZT1nZXRQYWdlU3luYyhRLmVuZ2luZSwgZmlsZWlkLGkrMSk7XHJcblx0XHRcdFx0XHR2YXIgb3B0PXt0ZXh0OnBhZ2UudGV4dCxoaXRzOm51bGwsdGFnOidobCcsdnBvczpzdGFydHZwb3MsXHJcblx0XHRcdFx0XHRmdWxsdGV4dDp0cnVlLG5vc3BhbjpvcHRzLm5vc3Bhbixub2NybGY6b3B0cy5ub2NybGZ9O1xyXG5cdFx0XHRcdHZhciBzZWduYW1lPXNlZ25hbWVzW2krMV07XHJcblx0XHRcdFx0b3B0LmhpdHM9aGl0SW5SYW5nZShRLHN0YXJ0dnBvcyxlbmR2cG9zKTtcclxuXHRcdFx0XHR2YXIgcGI9JzxwYiBuPVwiJytzZWduYW1lKydcIj48L3BiPic7XHJcblx0XHRcdFx0dmFyIHdpdGh0YWc9aW5qZWN0VGFnKFEsb3B0KTtcclxuXHRcdFx0XHRvdXRwdXQucHVzaChwYit3aXRodGFnKTtcclxuXHRcdFx0fVx0XHRcdFxyXG5cdFx0fVxyXG5cclxuXHRcdGNiLmFwcGx5KFEuZW5naW5lLmNvbnRleHQsW3t0ZXh0Om91dHB1dC5qb2luKFwiXCIpLGZpbGU6ZmlsZWlkfV0pO1xyXG5cdH0pXHJcbn1cclxudmFyIGhpZ2hsaWdodFNlZz1mdW5jdGlvbihRLGZpbGVpZCxzZWdpZCxvcHRzLGNiKSB7XHJcblx0aWYgKHR5cGVvZiBvcHRzPT1cImZ1bmN0aW9uXCIpIHtcclxuXHRcdGNiPW9wdHM7XHJcblx0fVxyXG5cclxuXHRpZiAoIVEgfHwgIVEuZW5naW5lKSByZXR1cm4gY2IobnVsbCk7XHJcblx0dmFyIHNlZ29mZnNldHM9US5lbmdpbmUuZ2V0RmlsZVNlZ09mZnNldHMoZmlsZWlkKTtcclxuXHR2YXIgc3RhcnR2cG9zPXNlZ29mZnNldHNbc2VnaWQtMV07XHJcblx0dmFyIGVuZHZwb3M9c2Vnb2Zmc2V0c1tzZWdpZF07XHJcblx0dmFyIHBhZ2VuYW1lcz1RLmVuZ2luZS5nZXRGaWxlU2VnTmFtZXMoZmlsZWlkKTtcclxuXHJcblx0dGhpcy5nZXRQYWdlKFEuZW5naW5lLGZpbGVpZCxzZWdpZCxmdW5jdGlvbihyZXMpe1xyXG5cdFx0dmFyIG9wdD17dGV4dDpyZXMudGV4dCxoaXRzOm51bGwsdnBvczpzdGFydHZwb3MsZnVsbHRleHQ6dHJ1ZSxcclxuXHRcdFx0bm9zcGFuOm9wdHMubm9zcGFuLG5vY3JsZjpvcHRzLm5vY3JsZn07XHJcblx0XHRvcHQuaGl0cz1oaXRJblJhbmdlKFEsc3RhcnR2cG9zLGVuZHZwb3MpO1xyXG5cdFx0aWYgKG9wdHMucmVuZGVyVGFncykge1xyXG5cdFx0XHRvcHQudGFncz10YWdzSW5SYW5nZShRLG9wdHMucmVuZGVyVGFncyxzdGFydHZwb3MsZW5kdnBvcyk7XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIHBhZ2VuYW1lPXBhZ2VuYW1lc1tzZWdpZF07XHJcblx0XHRjYi5hcHBseShRLmVuZ2luZS5jb250ZXh0LFt7dGV4dDppbmplY3RUYWcoUSxvcHQpLHBhZ2U6c2VnaWQsZmlsZTpmaWxlaWQsaGl0czpvcHQuaGl0cyxwYWdlbmFtZTpwYWdlbmFtZX1dKTtcclxuXHR9KTtcclxufVxyXG5tb2R1bGUuZXhwb3J0cz17cmVzdWx0bGlzdDpyZXN1bHRsaXN0LCBcclxuXHRoaXRJblJhbmdlOmhpdEluUmFuZ2UsIFxyXG5cdGhpZ2hsaWdodFNlZzpoaWdobGlnaHRTZWcsXHJcblx0Z2V0U2VnOmdldFNlZyxcclxuXHRoaWdobGlnaHRGaWxlOmhpZ2hsaWdodEZpbGUsXHJcblx0Z2V0RmlsZTpnZXRGaWxlXHJcblx0Ly9oaWdobGlnaHRSYW5nZTpoaWdobGlnaHRSYW5nZSxcclxuICAvL2dldFJhbmdlOmdldFJhbmdlLFxyXG59OyIsIi8qXHJcbiAgS3NhbmEgU2VhcmNoIEVuZ2luZS5cclxuXHJcbiAgbmVlZCBhIEtERSBpbnN0YW5jZSB0byBiZSBmdW5jdGlvbmFsXHJcbiAgXHJcbiovXHJcbnZhciBic2VhcmNoPXJlcXVpcmUoXCIuL2JzZWFyY2hcIik7XHJcbnZhciBkb3NlYXJjaD1yZXF1aXJlKFwiLi9zZWFyY2hcIik7XHJcblxyXG52YXIgcHJlcGFyZUVuZ2luZUZvclNlYXJjaD1mdW5jdGlvbihlbmdpbmUsY2Ipe1xyXG5cdGlmIChlbmdpbmUuYW5hbHl6ZXIpcmV0dXJuO1xyXG5cdHZhciBhbmFseXplcj1yZXF1aXJlKFwia3NhbmEtYW5hbHl6ZXJcIik7XHJcblx0dmFyIGNvbmZpZz1lbmdpbmUuZ2V0KFwibWV0YVwiKS5jb25maWc7XHJcblx0ZW5naW5lLmFuYWx5emVyPWFuYWx5emVyLmdldEFQSShjb25maWcpO1xyXG5cdGVuZ2luZS5nZXQoW1tcInRva2Vuc1wiXSxbXCJwb3N0aW5nc0xlbmd0aFwiXV0sZnVuY3Rpb24oKXtcclxuXHRcdGNiKCk7XHJcblx0fSk7XHJcbn1cclxuXHJcbnZhciBfc2VhcmNoPWZ1bmN0aW9uKGVuZ2luZSxxLG9wdHMsY2IsY29udGV4dCkge1xyXG5cdGlmICh0eXBlb2YgZW5naW5lPT1cInN0cmluZ1wiKSB7Ly9icm93c2VyIG9ubHlcclxuXHRcdHZhciBrZGU9cmVxdWlyZShcImtzYW5hLWRhdGFiYXNlXCIpO1xyXG5cdFx0aWYgKHR5cGVvZiBvcHRzPT1cImZ1bmN0aW9uXCIpIHsgLy91c2VyIGRpZG4ndCBzdXBwbHkgb3B0aW9uc1xyXG5cdFx0XHRpZiAodHlwZW9mIGNiPT1cIm9iamVjdFwiKWNvbnRleHQ9Y2I7XHJcblx0XHRcdGNiPW9wdHM7XHJcblx0XHRcdG9wdHM9e307XHJcblx0XHR9XHJcblx0XHRvcHRzLnE9cTtcclxuXHRcdG9wdHMuZGJpZD1lbmdpbmU7XHJcblx0XHRrZGUub3BlbihvcHRzLmRiaWQsZnVuY3Rpb24oZXJyLGRiKXtcclxuXHRcdFx0aWYgKGVycikge1xyXG5cdFx0XHRcdGNiKGVycik7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblx0XHRcdGNvbnNvbGUubG9nKFwib3BlbmVkXCIsb3B0cy5kYmlkKVxyXG5cdFx0XHRwcmVwYXJlRW5naW5lRm9yU2VhcmNoKGRiLGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0cmV0dXJuIGRvc2VhcmNoKGRiLHEsb3B0cyxjYik7XHRcclxuXHRcdFx0fSk7XHJcblx0XHR9LGNvbnRleHQpO1xyXG5cdH0gZWxzZSB7XHJcblx0XHRwcmVwYXJlRW5naW5lRm9yU2VhcmNoKGVuZ2luZSxmdW5jdGlvbigpe1xyXG5cdFx0XHRyZXR1cm4gZG9zZWFyY2goZW5naW5lLHEsb3B0cyxjYik7XHRcclxuXHRcdH0pO1xyXG5cdH1cclxufVxyXG5cclxudmFyIF9oaWdobGlnaHRQYWdlPWZ1bmN0aW9uKGVuZ2luZSxmaWxlaWQscGFnZWlkLG9wdHMsY2Ipe1xyXG5cdGlmICghb3B0cy5xKSBvcHRzLnE9XCJcIjsgXHJcblx0X3NlYXJjaChlbmdpbmUsb3B0cy5xLG9wdHMsZnVuY3Rpb24oUSl7XHJcblx0XHRhcGkuZXhjZXJwdC5oaWdobGlnaHRQYWdlKFEsZmlsZWlkLHBhZ2VpZCxvcHRzLGNiKTtcclxuXHR9KTtcdFxyXG59XHJcbnZhciBfaGlnaGxpZ2h0UmFuZ2U9ZnVuY3Rpb24oZW5naW5lLHN0YXJ0LGVuZCxvcHRzLGNiKXtcclxuXHJcblx0aWYgKG9wdHMucSkge1xyXG5cdFx0X3NlYXJjaChlbmdpbmUsb3B0cy5xLG9wdHMsZnVuY3Rpb24oUSl7XHJcblx0XHRcdGFwaS5leGNlcnB0LmhpZ2hsaWdodFJhbmdlKFEsc3RhcnQsZW5kLG9wdHMsY2IpO1xyXG5cdFx0fSk7XHJcblx0fSBlbHNlIHtcclxuXHRcdHByZXBhcmVFbmdpbmVGb3JTZWFyY2goZW5naW5lLGZ1bmN0aW9uKCl7XHJcblx0XHRcdGFwaS5leGNlcnB0LmdldFJhbmdlKGVuZ2luZSxzdGFydCxlbmQsY2IpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG59XHJcbnZhciBfaGlnaGxpZ2h0RmlsZT1mdW5jdGlvbihlbmdpbmUsZmlsZWlkLG9wdHMsY2Ipe1xyXG5cdGlmICghb3B0cy5xKSBvcHRzLnE9XCJcIjsgXHJcblx0X3NlYXJjaChlbmdpbmUsb3B0cy5xLG9wdHMsZnVuY3Rpb24oUSl7XHJcblx0XHRhcGkuZXhjZXJwdC5oaWdobGlnaHRGaWxlKFEsZmlsZWlkLG9wdHMsY2IpO1xyXG5cdH0pO1xyXG5cdC8qXHJcblx0fSBlbHNlIHtcclxuXHRcdGFwaS5leGNlcnB0LmdldEZpbGUoZW5naW5lLGZpbGVpZCxmdW5jdGlvbihkYXRhKSB7XHJcblx0XHRcdGNiLmFwcGx5KGVuZ2luZS5jb250ZXh0LFtkYXRhXSk7XHJcblx0XHR9KTtcclxuXHR9XHJcblx0Ki9cclxufVxyXG5cclxudmFyIHZwb3MyZmlsZXBhZ2U9ZnVuY3Rpb24oZW5naW5lLHZwb3MpIHtcclxuICAgIHZhciBwYWdlT2Zmc2V0cz1lbmdpbmUuZ2V0KFwicGFnZU9mZnNldHNcIik7XHJcbiAgICB2YXIgZmlsZU9mZnNldHM9ZW5naW5lLmdldChbXCJmaWxlT2Zmc2V0c1wiXSk7XHJcbiAgICB2YXIgcGFnZU5hbWVzPWVuZ2luZS5nZXQoXCJwYWdlTmFtZXNcIik7XHJcbiAgICB2YXIgZmlsZWlkPWJzZWFyY2goZmlsZU9mZnNldHMsdnBvcysxLHRydWUpO1xyXG4gICAgZmlsZWlkLS07XHJcbiAgICB2YXIgcGFnZWlkPWJzZWFyY2gocGFnZU9mZnNldHMsdnBvcysxLHRydWUpO1xyXG5cdHZhciByYW5nZT1lbmdpbmUuZ2V0RmlsZVJhbmdlKGZpbGVpZCk7XHJcblx0cGFnZWlkLT1yYW5nZS5zdGFydDtcclxuICAgIHJldHVybiB7ZmlsZTpmaWxlaWQscGFnZTpwYWdlaWR9O1xyXG59XHJcbnZhciBhcGk9e1xyXG5cdHNlYXJjaDpfc2VhcmNoXHJcbi8vXHQsY29uY29yZGFuY2U6cmVxdWlyZShcIi4vY29uY29yZGFuY2VcIilcclxuLy9cdCxyZWdleDpyZXF1aXJlKFwiLi9yZWdleFwiKVxyXG5cdCxoaWdobGlnaHRQYWdlOl9oaWdobGlnaHRQYWdlXHJcblx0LGhpZ2hsaWdodEZpbGU6X2hpZ2hsaWdodEZpbGVcclxuLy9cdCxoaWdobGlnaHRSYW5nZTpfaGlnaGxpZ2h0UmFuZ2VcclxuXHQsZXhjZXJwdDpyZXF1aXJlKFwiLi9leGNlcnB0XCIpXHJcblx0LHZwb3MyZmlsZXBhZ2U6dnBvczJmaWxlcGFnZVxyXG59XHJcbm1vZHVsZS5leHBvcnRzPWFwaTsiLCJcclxudmFyIHVucGFjayA9IGZ1bmN0aW9uIChhcikgeyAvLyB1bnBhY2sgdmFyaWFibGUgbGVuZ3RoIGludGVnZXIgbGlzdFxyXG4gIHZhciByID0gW10sXHJcbiAgaSA9IDAsXHJcbiAgdiA9IDA7XHJcbiAgZG8ge1xyXG5cdHZhciBzaGlmdCA9IDA7XHJcblx0ZG8ge1xyXG5cdCAgdiArPSAoKGFyW2ldICYgMHg3RikgPDwgc2hpZnQpO1xyXG5cdCAgc2hpZnQgKz0gNztcclxuXHR9IHdoaWxlIChhclsrK2ldICYgMHg4MCk7XHJcblx0cltyLmxlbmd0aF09djtcclxuICB9IHdoaWxlIChpIDwgYXIubGVuZ3RoKTtcclxuICByZXR1cm4gcjtcclxufVxyXG5cclxuLypcclxuICAgYXJyOiAgWzEsMSwxLDEsMSwxLDEsMSwxXVxyXG4gICBsZXZlbHM6IFswLDEsMSwyLDIsMCwxLDJdXHJcbiAgIG91dHB1dDogWzUsMSwzLDEsMSwzLDEsMV1cclxuKi9cclxuXHJcbnZhciBncm91cHN1bT1mdW5jdGlvbihhcnIsbGV2ZWxzKSB7XHJcbiAgaWYgKGFyci5sZW5ndGghPWxldmVscy5sZW5ndGgrMSkgcmV0dXJuIG51bGw7XHJcbiAgdmFyIHN0YWNrPVtdO1xyXG4gIHZhciBvdXRwdXQ9bmV3IEFycmF5KGxldmVscy5sZW5ndGgpO1xyXG4gIGZvciAodmFyIGk9MDtpPGxldmVscy5sZW5ndGg7aSsrKSBvdXRwdXRbaV09MDtcclxuICBmb3IgKHZhciBpPTE7aTxhcnIubGVuZ3RoO2krKykgeyAvL2ZpcnN0IG9uZSBvdXQgb2YgdG9jIHNjb3BlLCBpZ25vcmVkXHJcbiAgICBpZiAoc3RhY2subGVuZ3RoPmxldmVsc1tpLTFdKSB7XHJcbiAgICAgIHdoaWxlIChzdGFjay5sZW5ndGg+bGV2ZWxzW2ktMV0pIHN0YWNrLnBvcCgpO1xyXG4gICAgfVxyXG4gICAgc3RhY2sucHVzaChpLTEpO1xyXG4gICAgZm9yICh2YXIgaj0wO2o8c3RhY2subGVuZ3RoO2orKykge1xyXG4gICAgICBvdXRwdXRbc3RhY2tbal1dKz1hcnJbaV07XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiBvdXRwdXQ7XHJcbn1cclxuLyogYXJyPSAxICwgMiAsIDMgLDQgLDUsNiw3IC8vdG9rZW4gcG9zdGluZ1xyXG4gIHBvc3Rpbmc9IDMgLCA1ICAvL3RhZyBwb3N0aW5nXHJcbiAgb3V0ID0gMyAsIDIsIDJcclxuKi9cclxudmFyIGNvdW50Ynlwb3N0aW5nID0gZnVuY3Rpb24gKGFyciwgcG9zdGluZykge1xyXG4gIGlmICghcG9zdGluZy5sZW5ndGgpIHJldHVybiBbYXJyLmxlbmd0aF07XHJcbiAgdmFyIG91dD1bXTtcclxuICBmb3IgKHZhciBpPTA7aTxwb3N0aW5nLmxlbmd0aDtpKyspIG91dFtpXT0wO1xyXG4gIG91dFtwb3N0aW5nLmxlbmd0aF09MDtcclxuICB2YXIgcD0wLGk9MCxsYXN0aT0wO1xyXG4gIHdoaWxlIChpPGFyci5sZW5ndGggJiYgcDxwb3N0aW5nLmxlbmd0aCkge1xyXG4gICAgaWYgKGFycltpXTw9cG9zdGluZ1twXSkge1xyXG4gICAgICB3aGlsZSAocDxwb3N0aW5nLmxlbmd0aCAmJiBpPGFyci5sZW5ndGggJiYgYXJyW2ldPD1wb3N0aW5nW3BdKSB7XHJcbiAgICAgICAgb3V0W3BdKys7XHJcbiAgICAgICAgaSsrO1xyXG4gICAgICB9ICAgICAgXHJcbiAgICB9IFxyXG4gICAgcCsrO1xyXG4gIH1cclxuICBvdXRbcG9zdGluZy5sZW5ndGhdID0gYXJyLmxlbmd0aC1pOyAvL3JlbWFpbmluZ1xyXG4gIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbnZhciBncm91cGJ5cG9zdGluZz1mdW5jdGlvbihhcnIsZ3Bvc3RpbmcpIHsgLy9yZWxhdGl2ZSB2cG9zXHJcbiAgaWYgKCFncG9zdGluZy5sZW5ndGgpIHJldHVybiBbYXJyLmxlbmd0aF07XHJcbiAgdmFyIG91dD1bXTtcclxuICBmb3IgKHZhciBpPTA7aTw9Z3Bvc3RpbmcubGVuZ3RoO2krKykgb3V0W2ldPVtdO1xyXG4gIFxyXG4gIHZhciBwPTAsaT0wLGxhc3RpPTA7XHJcbiAgd2hpbGUgKGk8YXJyLmxlbmd0aCAmJiBwPGdwb3N0aW5nLmxlbmd0aCkge1xyXG4gICAgaWYgKGFycltpXTxncG9zdGluZ1twXSkge1xyXG4gICAgICB3aGlsZSAocDxncG9zdGluZy5sZW5ndGggJiYgaTxhcnIubGVuZ3RoICYmIGFycltpXTxncG9zdGluZ1twXSkge1xyXG4gICAgICAgIHZhciBzdGFydD0wO1xyXG4gICAgICAgIGlmIChwPjApIHN0YXJ0PWdwb3N0aW5nW3AtMV07XHJcbiAgICAgICAgb3V0W3BdLnB1c2goYXJyW2krK10tc3RhcnQpOyAgLy8gcmVsYXRpdmVcclxuICAgICAgfSAgICAgIFxyXG4gICAgfSBcclxuICAgIHArKztcclxuICB9XHJcbiAgLy9yZW1haW5pbmdcclxuICB3aGlsZShpPGFyci5sZW5ndGgpIG91dFtvdXQubGVuZ3RoLTFdLnB1c2goYXJyW2krK10tZ3Bvc3RpbmdbZ3Bvc3RpbmcubGVuZ3RoLTFdKTtcclxuICByZXR1cm4gb3V0O1xyXG59XHJcbnZhciBncm91cGJ5cG9zdGluZzI9ZnVuY3Rpb24oYXJyLGdwb3N0aW5nKSB7IC8vYWJzb2x1dGUgdnBvc1xyXG4gIGlmICghYXJyIHx8ICFhcnIubGVuZ3RoKSByZXR1cm4gW107XHJcbiAgaWYgKCFncG9zdGluZy5sZW5ndGgpIHJldHVybiBbYXJyLmxlbmd0aF07XHJcbiAgdmFyIG91dD1bXTtcclxuICBmb3IgKHZhciBpPTA7aTw9Z3Bvc3RpbmcubGVuZ3RoO2krKykgb3V0W2ldPVtdO1xyXG4gIFxyXG4gIHZhciBwPTAsaT0wLGxhc3RpPTA7XHJcbiAgd2hpbGUgKGk8YXJyLmxlbmd0aCAmJiBwPGdwb3N0aW5nLmxlbmd0aCkge1xyXG4gICAgaWYgKGFycltpXTxncG9zdGluZ1twXSkge1xyXG4gICAgICB3aGlsZSAocDxncG9zdGluZy5sZW5ndGggJiYgaTxhcnIubGVuZ3RoICYmIGFycltpXTxncG9zdGluZ1twXSkge1xyXG4gICAgICAgIHZhciBzdGFydD0wO1xyXG4gICAgICAgIGlmIChwPjApIHN0YXJ0PWdwb3N0aW5nW3AtMV07IC8vYWJzb2x1dGVcclxuICAgICAgICBvdXRbcF0ucHVzaChhcnJbaSsrXSk7XHJcbiAgICAgIH0gICAgICBcclxuICAgIH0gXHJcbiAgICBwKys7XHJcbiAgfVxyXG4gIC8vcmVtYWluaW5nXHJcbiAgd2hpbGUoaTxhcnIubGVuZ3RoKSBvdXRbb3V0Lmxlbmd0aC0xXS5wdXNoKGFycltpKytdLWdwb3N0aW5nW2dwb3N0aW5nLmxlbmd0aC0xXSk7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG52YXIgZ3JvdXBieWJsb2NrMiA9IGZ1bmN0aW9uKGFyLCBudG9rZW4sc2xvdHNoaWZ0LG9wdHMpIHtcclxuICBpZiAoIWFyLmxlbmd0aCkgcmV0dXJuIFt7fSx7fV07XHJcbiAgXHJcbiAgc2xvdHNoaWZ0ID0gc2xvdHNoaWZ0IHx8IDE2O1xyXG4gIHZhciBnID0gTWF0aC5wb3coMixzbG90c2hpZnQpO1xyXG4gIHZhciBpID0gMDtcclxuICB2YXIgciA9IHt9LCBudG9rZW5zPXt9O1xyXG4gIHZhciBncm91cGNvdW50PTA7XHJcbiAgZG8ge1xyXG4gICAgdmFyIGdyb3VwID0gTWF0aC5mbG9vcihhcltpXSAvIGcpIDtcclxuICAgIGlmICghcltncm91cF0pIHtcclxuICAgICAgcltncm91cF0gPSBbXTtcclxuICAgICAgbnRva2Vuc1tncm91cF09W107XHJcbiAgICAgIGdyb3VwY291bnQrKztcclxuICAgIH1cclxuICAgIHJbZ3JvdXBdLnB1c2goYXJbaV0gJSBnKTtcclxuICAgIG50b2tlbnNbZ3JvdXBdLnB1c2gobnRva2VuW2ldKTtcclxuICAgIGkrKztcclxuICB9IHdoaWxlIChpIDwgYXIubGVuZ3RoKTtcclxuICBpZiAob3B0cykgb3B0cy5ncm91cGNvdW50PWdyb3VwY291bnQ7XHJcbiAgcmV0dXJuIFtyLG50b2tlbnNdO1xyXG59XHJcbnZhciBncm91cGJ5c2xvdCA9IGZ1bmN0aW9uIChhciwgc2xvdHNoaWZ0LCBvcHRzKSB7XHJcbiAgaWYgKCFhci5sZW5ndGgpXHJcblx0cmV0dXJuIHt9O1xyXG4gIFxyXG4gIHNsb3RzaGlmdCA9IHNsb3RzaGlmdCB8fCAxNjtcclxuICB2YXIgZyA9IE1hdGgucG93KDIsc2xvdHNoaWZ0KTtcclxuICB2YXIgaSA9IDA7XHJcbiAgdmFyIHIgPSB7fTtcclxuICB2YXIgZ3JvdXBjb3VudD0wO1xyXG4gIGRvIHtcclxuXHR2YXIgZ3JvdXAgPSBNYXRoLmZsb29yKGFyW2ldIC8gZykgO1xyXG5cdGlmICghcltncm91cF0pIHtcclxuXHQgIHJbZ3JvdXBdID0gW107XHJcblx0ICBncm91cGNvdW50Kys7XHJcblx0fVxyXG5cdHJbZ3JvdXBdLnB1c2goYXJbaV0gJSBnKTtcclxuXHRpKys7XHJcbiAgfSB3aGlsZSAoaSA8IGFyLmxlbmd0aCk7XHJcbiAgaWYgKG9wdHMpIG9wdHMuZ3JvdXBjb3VudD1ncm91cGNvdW50O1xyXG4gIHJldHVybiByO1xyXG59XHJcbi8qXHJcbnZhciBpZGVudGl0eSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gIHJldHVybiB2YWx1ZTtcclxufTtcclxudmFyIHNvcnRlZEluZGV4ID0gZnVuY3Rpb24gKGFycmF5LCBvYmosIGl0ZXJhdG9yKSB7IC8vdGFrZW4gZnJvbSB1bmRlcnNjb3JlXHJcbiAgaXRlcmF0b3IgfHwgKGl0ZXJhdG9yID0gaWRlbnRpdHkpO1xyXG4gIHZhciBsb3cgPSAwLFxyXG4gIGhpZ2ggPSBhcnJheS5sZW5ndGg7XHJcbiAgd2hpbGUgKGxvdyA8IGhpZ2gpIHtcclxuXHR2YXIgbWlkID0gKGxvdyArIGhpZ2gpID4+IDE7XHJcblx0aXRlcmF0b3IoYXJyYXlbbWlkXSkgPCBpdGVyYXRvcihvYmopID8gbG93ID0gbWlkICsgMSA6IGhpZ2ggPSBtaWQ7XHJcbiAgfVxyXG4gIHJldHVybiBsb3c7XHJcbn07Ki9cclxuXHJcbnZhciBpbmRleE9mU29ydGVkID0gZnVuY3Rpb24gKGFycmF5LCBvYmopIHsgXHJcbiAgdmFyIGxvdyA9IDAsXHJcbiAgaGlnaCA9IGFycmF5Lmxlbmd0aC0xO1xyXG4gIHdoaWxlIChsb3cgPCBoaWdoKSB7XHJcbiAgICB2YXIgbWlkID0gKGxvdyArIGhpZ2gpID4+IDE7XHJcbiAgICBhcnJheVttaWRdIDwgb2JqID8gbG93ID0gbWlkICsgMSA6IGhpZ2ggPSBtaWQ7XHJcbiAgfVxyXG4gIHJldHVybiBsb3c7XHJcbn07XHJcbnZhciBwbGhlYWQ9ZnVuY3Rpb24ocGwsIHBsdGFnLCBvcHRzKSB7XHJcbiAgb3B0cz1vcHRzfHx7fTtcclxuICBvcHRzLm1heD1vcHRzLm1heHx8MTtcclxuICB2YXIgb3V0PVtdO1xyXG4gIGlmIChwbHRhZy5sZW5ndGg8cGwubGVuZ3RoKSB7XHJcbiAgICBmb3IgKHZhciBpPTA7aTxwbHRhZy5sZW5ndGg7aSsrKSB7XHJcbiAgICAgICBrID0gaW5kZXhPZlNvcnRlZChwbCwgcGx0YWdbaV0pO1xyXG4gICAgICAgaWYgKGs+LTEgJiYgazxwbC5sZW5ndGgpIHtcclxuICAgICAgICBpZiAocGxba109PXBsdGFnW2ldKSB7XHJcbiAgICAgICAgICBvdXRbb3V0Lmxlbmd0aF09cGx0YWdbaV07XHJcbiAgICAgICAgICBpZiAob3V0Lmxlbmd0aD49b3B0cy5tYXgpIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0gZWxzZSB7XHJcbiAgICBmb3IgKHZhciBpPTA7aTxwbC5sZW5ndGg7aSsrKSB7XHJcbiAgICAgICBrID0gaW5kZXhPZlNvcnRlZChwbHRhZywgcGxbaV0pO1xyXG4gICAgICAgaWYgKGs+LTEgJiYgazxwbHRhZy5sZW5ndGgpIHtcclxuICAgICAgICBpZiAocGx0YWdba109PXBsW2ldKSB7XHJcbiAgICAgICAgICBvdXRbb3V0Lmxlbmd0aF09cGx0YWdba107XHJcbiAgICAgICAgICBpZiAob3V0Lmxlbmd0aD49b3B0cy5tYXgpIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gb3V0O1xyXG59XHJcbi8qXHJcbiBwbDIgb2NjdXIgYWZ0ZXIgcGwxLCBcclxuIHBsMj49cGwxK21pbmRpc1xyXG4gcGwyPD1wbDErbWF4ZGlzXHJcbiovXHJcbnZhciBwbGZvbGxvdzIgPSBmdW5jdGlvbiAocGwxLCBwbDIsIG1pbmRpcywgbWF4ZGlzKSB7XHJcbiAgdmFyIHIgPSBbXSxpPTA7XHJcbiAgdmFyIHN3YXAgPSAwO1xyXG4gIFxyXG4gIHdoaWxlIChpPHBsMS5sZW5ndGgpe1xyXG4gICAgdmFyIGsgPSBpbmRleE9mU29ydGVkKHBsMiwgcGwxW2ldICsgbWluZGlzKTtcclxuICAgIHZhciB0ID0gKHBsMltrXSA+PSAocGwxW2ldICttaW5kaXMpICYmIHBsMltrXTw9KHBsMVtpXSttYXhkaXMpKSA/IGsgOiAtMTtcclxuICAgIGlmICh0ID4gLTEpIHtcclxuICAgICAgcltyLmxlbmd0aF09cGwxW2ldO1xyXG4gICAgICBpKys7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAoaz49cGwyLmxlbmd0aCkgYnJlYWs7XHJcbiAgICAgIHZhciBrMj1pbmRleE9mU29ydGVkIChwbDEscGwyW2tdLW1heGRpcyk7XHJcbiAgICAgIGlmIChrMj5pKSB7XHJcbiAgICAgICAgdmFyIHQgPSAocGwyW2tdID49IChwbDFbaV0gK21pbmRpcykgJiYgcGwyW2tdPD0ocGwxW2ldK21heGRpcykpID8gayA6IC0xO1xyXG4gICAgICAgIGlmICh0Pi0xKSByW3IubGVuZ3RoXT1wbDFbazJdO1xyXG4gICAgICAgIGk9azI7XHJcbiAgICAgIH0gZWxzZSBicmVhaztcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIHI7XHJcbn1cclxuXHJcbnZhciBwbG5vdGZvbGxvdzIgPSBmdW5jdGlvbiAocGwxLCBwbDIsIG1pbmRpcywgbWF4ZGlzKSB7XHJcbiAgdmFyIHIgPSBbXSxpPTA7XHJcbiAgXHJcbiAgd2hpbGUgKGk8cGwxLmxlbmd0aCl7XHJcbiAgICB2YXIgayA9IGluZGV4T2ZTb3J0ZWQocGwyLCBwbDFbaV0gKyBtaW5kaXMpO1xyXG4gICAgdmFyIHQgPSAocGwyW2tdID49IChwbDFbaV0gK21pbmRpcykgJiYgcGwyW2tdPD0ocGwxW2ldK21heGRpcykpID8gayA6IC0xO1xyXG4gICAgaWYgKHQgPiAtMSkge1xyXG4gICAgICBpKys7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAoaz49cGwyLmxlbmd0aCkge1xyXG4gICAgICAgIHI9ci5jb25jYXQocGwxLnNsaWNlKGkpKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB2YXIgazI9aW5kZXhPZlNvcnRlZCAocGwxLHBsMltrXS1tYXhkaXMpO1xyXG4gICAgICAgIGlmIChrMj5pKSB7XHJcbiAgICAgICAgICByPXIuY29uY2F0KHBsMS5zbGljZShpLGsyKSk7XHJcbiAgICAgICAgICBpPWsyO1xyXG4gICAgICAgIH0gZWxzZSBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gcjtcclxufVxyXG4vKiB0aGlzIGlzIGluY29ycmVjdCAqL1xyXG52YXIgcGxmb2xsb3cgPSBmdW5jdGlvbiAocGwxLCBwbDIsIGRpc3RhbmNlKSB7XHJcbiAgdmFyIHIgPSBbXSxpPTA7XHJcblxyXG4gIHdoaWxlIChpPHBsMS5sZW5ndGgpe1xyXG4gICAgdmFyIGsgPSBpbmRleE9mU29ydGVkKHBsMiwgcGwxW2ldICsgZGlzdGFuY2UpO1xyXG4gICAgdmFyIHQgPSAocGwyW2tdID09PSAocGwxW2ldICsgZGlzdGFuY2UpKSA/IGsgOiAtMTtcclxuICAgIGlmICh0ID4gLTEpIHtcclxuICAgICAgci5wdXNoKHBsMVtpXSk7XHJcbiAgICAgIGkrKztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmIChrPj1wbDIubGVuZ3RoKSBicmVhaztcclxuICAgICAgdmFyIGsyPWluZGV4T2ZTb3J0ZWQgKHBsMSxwbDJba10tZGlzdGFuY2UpO1xyXG4gICAgICBpZiAoazI+aSkge1xyXG4gICAgICAgIHQgPSAocGwyW2tdID09PSAocGwxW2syXSArIGRpc3RhbmNlKSkgPyBrIDogLTE7XHJcbiAgICAgICAgaWYgKHQ+LTEpIHtcclxuICAgICAgICAgICByLnB1c2gocGwxW2syXSk7XHJcbiAgICAgICAgICAgazIrKztcclxuICAgICAgICB9XHJcbiAgICAgICAgaT1rMjtcclxuICAgICAgfSBlbHNlIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gcjtcclxufVxyXG52YXIgcGxub3Rmb2xsb3cgPSBmdW5jdGlvbiAocGwxLCBwbDIsIGRpc3RhbmNlKSB7XHJcbiAgdmFyIHIgPSBbXTtcclxuICB2YXIgciA9IFtdLGk9MDtcclxuICB2YXIgc3dhcCA9IDA7XHJcbiAgXHJcbiAgd2hpbGUgKGk8cGwxLmxlbmd0aCl7XHJcbiAgICB2YXIgayA9IGluZGV4T2ZTb3J0ZWQocGwyLCBwbDFbaV0gKyBkaXN0YW5jZSk7XHJcbiAgICB2YXIgdCA9IChwbDJba10gPT09IChwbDFbaV0gKyBkaXN0YW5jZSkpID8gayA6IC0xO1xyXG4gICAgaWYgKHQgPiAtMSkgeyBcclxuICAgICAgaSsrO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKGs+PXBsMi5sZW5ndGgpIHtcclxuICAgICAgICByPXIuY29uY2F0KHBsMS5zbGljZShpKSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdmFyIGsyPWluZGV4T2ZTb3J0ZWQgKHBsMSxwbDJba10tZGlzdGFuY2UpO1xyXG4gICAgICAgIGlmIChrMj5pKSB7XHJcbiAgICAgICAgICByPXIuY29uY2F0KHBsMS5zbGljZShpLGsyKSk7XHJcbiAgICAgICAgICBpPWsyO1xyXG4gICAgICAgIH0gZWxzZSBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gcjtcclxufVxyXG52YXIgcGxhbmQgPSBmdW5jdGlvbiAocGwxLCBwbDIsIGRpc3RhbmNlKSB7XHJcbiAgdmFyIHIgPSBbXTtcclxuICB2YXIgc3dhcCA9IDA7XHJcbiAgXHJcbiAgaWYgKHBsMS5sZW5ndGggPiBwbDIubGVuZ3RoKSB7IC8vc3dhcCBmb3IgZmFzdGVyIGNvbXBhcmVcclxuICAgIHZhciB0ID0gcGwyO1xyXG4gICAgcGwyID0gcGwxO1xyXG4gICAgcGwxID0gdDtcclxuICAgIHN3YXAgPSBkaXN0YW5jZTtcclxuICAgIGRpc3RhbmNlID0gLWRpc3RhbmNlO1xyXG4gIH1cclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHBsMS5sZW5ndGg7IGkrKykge1xyXG4gICAgdmFyIGsgPSBpbmRleE9mU29ydGVkKHBsMiwgcGwxW2ldICsgZGlzdGFuY2UpO1xyXG4gICAgdmFyIHQgPSAocGwyW2tdID09PSAocGwxW2ldICsgZGlzdGFuY2UpKSA/IGsgOiAtMTtcclxuICAgIGlmICh0ID4gLTEpIHtcclxuICAgICAgci5wdXNoKHBsMVtpXSAtIHN3YXApO1xyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gcjtcclxufVxyXG52YXIgY29tYmluZT1mdW5jdGlvbiAocG9zdGluZ3MpIHtcclxuICB2YXIgb3V0PVtdO1xyXG4gIGZvciAodmFyIGkgaW4gcG9zdGluZ3MpIHtcclxuICAgIG91dD1vdXQuY29uY2F0KHBvc3RpbmdzW2ldKTtcclxuICB9XHJcbiAgb3V0LnNvcnQoZnVuY3Rpb24oYSxiKXtyZXR1cm4gYS1ifSk7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxudmFyIHVuaXF1ZSA9IGZ1bmN0aW9uKGFyKXtcclxuICAgaWYgKCFhciB8fCAhYXIubGVuZ3RoKSByZXR1cm4gW107XHJcbiAgIHZhciB1ID0ge30sIGEgPSBbXTtcclxuICAgZm9yKHZhciBpID0gMCwgbCA9IGFyLmxlbmd0aDsgaSA8IGw7ICsraSl7XHJcbiAgICBpZih1Lmhhc093blByb3BlcnR5KGFyW2ldKSkgY29udGludWU7XHJcbiAgICBhLnB1c2goYXJbaV0pO1xyXG4gICAgdVthcltpXV0gPSAxO1xyXG4gICB9XHJcbiAgIHJldHVybiBhO1xyXG59XHJcblxyXG5cclxuXHJcbnZhciBwbHBocmFzZSA9IGZ1bmN0aW9uIChwb3N0aW5ncyxvcHMpIHtcclxuICB2YXIgciA9IFtdO1xyXG4gIGZvciAodmFyIGk9MDtpPHBvc3RpbmdzLmxlbmd0aDtpKyspIHtcclxuICBcdGlmICghcG9zdGluZ3NbaV0pICByZXR1cm4gW107XHJcbiAgXHRpZiAoMCA9PT0gaSkge1xyXG4gIFx0ICByID0gcG9zdGluZ3NbMF07XHJcbiAgXHR9IGVsc2Uge1xyXG4gICAgICBpZiAob3BzW2ldPT0nYW5kbm90Jykge1xyXG4gICAgICAgIHIgPSBwbG5vdGZvbGxvdyhyLCBwb3N0aW5nc1tpXSwgaSk7ICBcclxuICAgICAgfWVsc2Uge1xyXG4gICAgICAgIHIgPSBwbGFuZChyLCBwb3N0aW5nc1tpXSwgaSk7ICBcclxuICAgICAgfVxyXG4gIFx0fVxyXG4gIH1cclxuICBcclxuICByZXR1cm4gcjtcclxufVxyXG4vL3JldHVybiBhbiBhcnJheSBvZiBncm91cCBoYXZpbmcgYW55IG9mIHBsIGl0ZW1cclxudmFyIG1hdGNoUG9zdGluZz1mdW5jdGlvbihwbCxndXBsLHN0YXJ0LGVuZCkge1xyXG4gIHN0YXJ0PXN0YXJ0fHwwO1xyXG4gIGVuZD1lbmR8fC0xO1xyXG4gIGlmIChlbmQ9PS0xKSBlbmQ9TWF0aC5wb3coMiwgNTMpOyAvLyBtYXggaW50ZWdlciB2YWx1ZVxyXG5cclxuICB2YXIgY291bnQ9MCwgaSA9IGo9IDAsICByZXN1bHQgPSBbXSAsdj0wO1xyXG4gIHZhciBkb2NzPVtdLCBmcmVxPVtdO1xyXG4gIGlmICghcGwpIHJldHVybiB7ZG9jczpbXSxmcmVxOltdfTtcclxuICB3aGlsZSggaSA8IHBsLmxlbmd0aCAmJiBqIDwgZ3VwbC5sZW5ndGggKXtcclxuICAgICBpZiAocGxbaV0gPCBndXBsW2pdICl7IFxyXG4gICAgICAgY291bnQrKztcclxuICAgICAgIHY9cGxbaV07XHJcbiAgICAgICBpKys7IFxyXG4gICAgIH0gZWxzZSB7XHJcbiAgICAgICBpZiAoY291bnQpIHtcclxuICAgICAgICBpZiAodj49c3RhcnQgJiYgdjxlbmQpIHtcclxuICAgICAgICAgIGRvY3MucHVzaChqKTtcclxuICAgICAgICAgIGZyZXEucHVzaChjb3VudCk7ICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuICAgICAgIH1cclxuICAgICAgIGorKztcclxuICAgICAgIGNvdW50PTA7XHJcbiAgICAgfVxyXG4gIH1cclxuICBpZiAoY291bnQgJiYgajxndXBsLmxlbmd0aCAmJiB2Pj1zdGFydCAmJiB2PGVuZCkge1xyXG4gICAgZG9jcy5wdXNoKGopO1xyXG4gICAgZnJlcS5wdXNoKGNvdW50KTtcclxuICAgIGNvdW50PTA7XHJcbiAgfVxyXG4gIGVsc2Uge1xyXG4gICAgd2hpbGUgKGo9PWd1cGwubGVuZ3RoICYmIGk8cGwubGVuZ3RoICYmIHBsW2ldID49IGd1cGxbZ3VwbC5sZW5ndGgtMV0pIHtcclxuICAgICAgaSsrO1xyXG4gICAgICBjb3VudCsrO1xyXG4gICAgfVxyXG4gICAgaWYgKHY+PXN0YXJ0ICYmIHY8ZW5kKSB7XHJcbiAgICAgIGRvY3MucHVzaChqKTtcclxuICAgICAgZnJlcS5wdXNoKGNvdW50KTsgICAgICBcclxuICAgIH1cclxuICB9IFxyXG4gIHJldHVybiB7ZG9jczpkb2NzLGZyZXE6ZnJlcX07XHJcbn1cclxuXHJcbnZhciB0cmltPWZ1bmN0aW9uKGFycixzdGFydCxlbmQpIHtcclxuICB2YXIgcz1pbmRleE9mU29ydGVkKGFycixzdGFydCk7XHJcbiAgdmFyIGU9aW5kZXhPZlNvcnRlZChhcnIsZW5kKTtcclxuICByZXR1cm4gYXJyLnNsaWNlKHMsZSsxKTtcclxufVxyXG52YXIgcGxpc3Q9e307XHJcbnBsaXN0LnVucGFjaz11bnBhY2s7XHJcbnBsaXN0LnBscGhyYXNlPXBscGhyYXNlO1xyXG5wbGlzdC5wbGhlYWQ9cGxoZWFkO1xyXG5wbGlzdC5wbGZvbGxvdzI9cGxmb2xsb3cyO1xyXG5wbGlzdC5wbG5vdGZvbGxvdzI9cGxub3Rmb2xsb3cyO1xyXG5wbGlzdC5wbGZvbGxvdz1wbGZvbGxvdztcclxucGxpc3QucGxub3Rmb2xsb3c9cGxub3Rmb2xsb3c7XHJcbnBsaXN0LnVuaXF1ZT11bmlxdWU7XHJcbnBsaXN0LmluZGV4T2ZTb3J0ZWQ9aW5kZXhPZlNvcnRlZDtcclxucGxpc3QubWF0Y2hQb3N0aW5nPW1hdGNoUG9zdGluZztcclxucGxpc3QudHJpbT10cmltO1xyXG5cclxucGxpc3QuZ3JvdXBieXNsb3Q9Z3JvdXBieXNsb3Q7XHJcbnBsaXN0Lmdyb3VwYnlibG9jazI9Z3JvdXBieWJsb2NrMjtcclxucGxpc3QuY291bnRieXBvc3Rpbmc9Y291bnRieXBvc3Rpbmc7XHJcbnBsaXN0Lmdyb3VwYnlwb3N0aW5nPWdyb3VwYnlwb3N0aW5nO1xyXG5wbGlzdC5ncm91cGJ5cG9zdGluZzI9Z3JvdXBieXBvc3RpbmcyO1xyXG5wbGlzdC5ncm91cHN1bT1ncm91cHN1bTtcclxucGxpc3QuY29tYmluZT1jb21iaW5lO1xyXG5tb2R1bGUuZXhwb3J0cz1wbGlzdDsiLCIvKlxyXG52YXIgZG9zZWFyY2gyPWZ1bmN0aW9uKGVuZ2luZSxvcHRzLGNiLGNvbnRleHQpIHtcclxuXHRvcHRzXHJcblx0XHRuZmlsZSxucGFnZSAgLy9yZXR1cm4gYSBoaWdobGlnaHRlZCBwYWdlXHJcblx0XHRuZmlsZSxbcGFnZXNdIC8vcmV0dXJuIGhpZ2hsaWdodGVkIHBhZ2VzIFxyXG5cdFx0bmZpbGUgICAgICAgIC8vcmV0dXJuIGVudGlyZSBoaWdobGlnaHRlZCBmaWxlXHJcblx0XHRhYnNfbnBhZ2VcclxuXHRcdFthYnNfcGFnZXNdICAvL3JldHVybiBzZXQgb2YgaGlnaGxpZ2h0ZWQgcGFnZXMgKG1heSBjcm9zcyBmaWxlKVxyXG5cclxuXHRcdGZpbGVuYW1lLCBwYWdlbmFtZVxyXG5cdFx0ZmlsZW5hbWUsW3BhZ2VuYW1lc11cclxuXHJcblx0XHRleGNlcnB0ICAgICAgLy9cclxuXHQgICAgc29ydEJ5ICAgICAgIC8vZGVmYXVsdCBuYXR1cmFsLCBzb3J0YnkgYnkgdnNtIHJhbmtpbmdcclxuXHJcblx0Ly9yZXR1cm4gZXJyLGFycmF5X29mX3N0cmluZyAsUSAgKFEgY29udGFpbnMgbG93IGxldmVsIHNlYXJjaCByZXN1bHQpXHJcbn1cclxuXHJcbiovXHJcbi8qIFRPRE8gc29ydGVkIHRva2VucyAqL1xyXG52YXIgcGxpc3Q9cmVxdWlyZShcIi4vcGxpc3RcIik7XHJcbnZhciBib29sc2VhcmNoPXJlcXVpcmUoXCIuL2Jvb2xzZWFyY2hcIik7XHJcbnZhciBleGNlcnB0PXJlcXVpcmUoXCIuL2V4Y2VycHRcIik7XHJcbnZhciBwYXJzZVRlcm0gPSBmdW5jdGlvbihlbmdpbmUscmF3LG9wdHMpIHtcclxuXHRpZiAoIXJhdykgcmV0dXJuO1xyXG5cdHZhciByZXM9e3JhdzpyYXcsdmFyaWFudHM6W10sdGVybTonJyxvcDonJ307XHJcblx0dmFyIHRlcm09cmF3LCBvcD0wO1xyXG5cdHZhciBmaXJzdGNoYXI9dGVybVswXTtcclxuXHR2YXIgdGVybXJlZ2V4PVwiXCI7XHJcblx0aWYgKGZpcnN0Y2hhcj09Jy0nKSB7XHJcblx0XHR0ZXJtPXRlcm0uc3Vic3RyaW5nKDEpO1xyXG5cdFx0Zmlyc3RjaGFyPXRlcm1bMF07XHJcblx0XHRyZXMuZXhjbHVkZT10cnVlOyAvL2V4Y2x1ZGVcclxuXHR9XHJcblx0dGVybT10ZXJtLnRyaW0oKTtcclxuXHR2YXIgbGFzdGNoYXI9dGVybVt0ZXJtLmxlbmd0aC0xXTtcclxuXHR0ZXJtPWVuZ2luZS5hbmFseXplci5ub3JtYWxpemUodGVybSk7XHJcblx0XHJcblx0aWYgKHRlcm0uaW5kZXhPZihcIiVcIik+LTEpIHtcclxuXHRcdHZhciB0ZXJtcmVnZXg9XCJeXCIrdGVybS5yZXBsYWNlKC8lKy9nLFwiLitcIikrXCIkXCI7XHJcblx0XHRpZiAoZmlyc3RjaGFyPT1cIiVcIikgXHR0ZXJtcmVnZXg9XCIuK1wiK3Rlcm1yZWdleC5zdWJzdHIoMSk7XHJcblx0XHRpZiAobGFzdGNoYXI9PVwiJVwiKSBcdHRlcm1yZWdleD10ZXJtcmVnZXguc3Vic3RyKDAsdGVybXJlZ2V4Lmxlbmd0aC0xKStcIi4rXCI7XHJcblx0fVxyXG5cclxuXHRpZiAodGVybXJlZ2V4KSB7XHJcblx0XHRyZXMudmFyaWFudHM9ZXhwYW5kVGVybShlbmdpbmUsdGVybXJlZ2V4KTtcclxuXHR9XHJcblxyXG5cdHJlcy5rZXk9dGVybTtcclxuXHRyZXR1cm4gcmVzO1xyXG59XHJcbnZhciBleHBhbmRUZXJtPWZ1bmN0aW9uKGVuZ2luZSxyZWdleCkge1xyXG5cdHZhciByPW5ldyBSZWdFeHAocmVnZXgpO1xyXG5cdHZhciB0b2tlbnM9ZW5naW5lLmdldChcInRva2Vuc1wiKTtcclxuXHR2YXIgcG9zdGluZ3NMZW5ndGg9ZW5naW5lLmdldChcInBvc3RpbmdzbGVuZ3RoXCIpO1xyXG5cdGlmICghcG9zdGluZ3NMZW5ndGgpIHBvc3RpbmdzTGVuZ3RoPVtdO1xyXG5cdHZhciBvdXQ9W107XHJcblx0Zm9yICh2YXIgaT0wO2k8dG9rZW5zLmxlbmd0aDtpKyspIHtcclxuXHRcdHZhciBtPXRva2Vuc1tpXS5tYXRjaChyKTtcclxuXHRcdGlmIChtKSB7XHJcblx0XHRcdG91dC5wdXNoKFttWzBdLHBvc3RpbmdzTGVuZ3RoW2ldfHwxXSk7XHJcblx0XHR9XHJcblx0fVxyXG5cdG91dC5zb3J0KGZ1bmN0aW9uKGEsYil7cmV0dXJuIGJbMV0tYVsxXX0pO1xyXG5cdHJldHVybiBvdXQ7XHJcbn1cclxudmFyIGlzV2lsZGNhcmQ9ZnVuY3Rpb24ocmF3KSB7XHJcblx0cmV0dXJuICEhcmF3Lm1hdGNoKC9bXFwqXFw/XS8pO1xyXG59XHJcblxyXG52YXIgaXNPclRlcm09ZnVuY3Rpb24odGVybSkge1xyXG5cdHRlcm09dGVybS50cmltKCk7XHJcblx0cmV0dXJuICh0ZXJtW3Rlcm0ubGVuZ3RoLTFdPT09JywnKTtcclxufVxyXG52YXIgb3J0ZXJtPWZ1bmN0aW9uKGVuZ2luZSx0ZXJtLGtleSkge1xyXG5cdFx0dmFyIHQ9e3RleHQ6a2V5fTtcclxuXHRcdGlmIChlbmdpbmUuYW5hbHl6ZXIuc2ltcGxpZmllZFRva2VuKSB7XHJcblx0XHRcdHQuc2ltcGxpZmllZD1lbmdpbmUuYW5hbHl6ZXIuc2ltcGxpZmllZFRva2VuKGtleSk7XHJcblx0XHR9XHJcblx0XHR0ZXJtLnZhcmlhbnRzLnB1c2godCk7XHJcbn1cclxudmFyIG9yVGVybXM9ZnVuY3Rpb24oZW5naW5lLHRva2Vucyxub3cpIHtcclxuXHR2YXIgcmF3PXRva2Vuc1tub3ddO1xyXG5cdHZhciB0ZXJtPXBhcnNlVGVybShlbmdpbmUscmF3KTtcclxuXHRpZiAoIXRlcm0pIHJldHVybjtcclxuXHRvcnRlcm0oZW5naW5lLHRlcm0sdGVybS5rZXkpO1xyXG5cdHdoaWxlIChpc09yVGVybShyYXcpKSAge1xyXG5cdFx0cmF3PXRva2Vuc1srK25vd107XHJcblx0XHR2YXIgdGVybTI9cGFyc2VUZXJtKGVuZ2luZSxyYXcpO1xyXG5cdFx0b3J0ZXJtKGVuZ2luZSx0ZXJtLHRlcm0yLmtleSk7XHJcblx0XHRmb3IgKHZhciBpIGluIHRlcm0yLnZhcmlhbnRzKXtcclxuXHRcdFx0dGVybS52YXJpYW50c1tpXT10ZXJtMi52YXJpYW50c1tpXTtcclxuXHRcdH1cclxuXHRcdHRlcm0ua2V5Kz0nLCcrdGVybTIua2V5O1xyXG5cdH1cclxuXHRyZXR1cm4gdGVybTtcclxufVxyXG5cclxudmFyIGdldE9wZXJhdG9yPWZ1bmN0aW9uKHJhdykge1xyXG5cdHZhciBvcD0nJztcclxuXHRpZiAocmF3WzBdPT0nKycpIG9wPSdpbmNsdWRlJztcclxuXHRpZiAocmF3WzBdPT0nLScpIG9wPSdleGNsdWRlJztcclxuXHRyZXR1cm4gb3A7XHJcbn1cclxudmFyIHBhcnNlUGhyYXNlPWZ1bmN0aW9uKHEpIHtcclxuXHR2YXIgbWF0Y2g9cS5tYXRjaCgvKFwiLis/XCJ8Jy4rPyd8XFxTKykvZylcclxuXHRtYXRjaD1tYXRjaC5tYXAoZnVuY3Rpb24oc3RyKXtcclxuXHRcdHZhciBuPXN0ci5sZW5ndGgsIGg9c3RyLmNoYXJBdCgwKSwgdD1zdHIuY2hhckF0KG4tMSlcclxuXHRcdGlmIChoPT09dCYmKGg9PT0nXCInfGg9PT1cIidcIikpIHN0cj1zdHIuc3Vic3RyKDEsbi0yKVxyXG5cdFx0cmV0dXJuIHN0cjtcclxuXHR9KVxyXG5cdHJldHVybiBtYXRjaDtcclxufVxyXG52YXIgdGliZXRhbk51bWJlcj17XHJcblx0XCJcXHUwZjIwXCI6XCIwXCIsXCJcXHUwZjIxXCI6XCIxXCIsXCJcXHUwZjIyXCI6XCIyXCIsXHRcIlxcdTBmMjNcIjpcIjNcIixcdFwiXFx1MGYyNFwiOlwiNFwiLFxyXG5cdFwiXFx1MGYyNVwiOlwiNVwiLFwiXFx1MGYyNlwiOlwiNlwiLFwiXFx1MGYyN1wiOlwiN1wiLFwiXFx1MGYyOFwiOlwiOFwiLFwiXFx1MGYyOVwiOlwiOVwiXHJcbn1cclxudmFyIHBhcnNlTnVtYmVyPWZ1bmN0aW9uKHJhdykge1xyXG5cdHZhciBuPXBhcnNlSW50KHJhdywxMCk7XHJcblx0aWYgKGlzTmFOKG4pKXtcclxuXHRcdHZhciBjb252ZXJ0ZWQ9W107XHJcblx0XHRmb3IgKHZhciBpPTA7aTxyYXcubGVuZ3RoO2krKykge1xyXG5cdFx0XHR2YXIgbm49dGliZXRhbk51bWJlcltyYXdbaV1dO1xyXG5cdFx0XHRpZiAodHlwZW9mIG5uICE9XCJ1bmRlZmluZWRcIikgY29udmVydGVkW2ldPW5uO1xyXG5cdFx0XHRlbHNlIGJyZWFrO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHBhcnNlSW50KGNvbnZlcnRlZCwxMCk7XHJcblx0fSBlbHNlIHtcclxuXHRcdHJldHVybiBuO1xyXG5cdH1cclxufVxyXG52YXIgcGFyc2VXaWxkY2FyZD1mdW5jdGlvbihyYXcpIHtcclxuXHR2YXIgbj1wYXJzZU51bWJlcihyYXcpIHx8IDE7XHJcblx0dmFyIHFjb3VudD1yYXcuc3BsaXQoJz8nKS5sZW5ndGgtMTtcclxuXHR2YXIgc2NvdW50PXJhdy5zcGxpdCgnKicpLmxlbmd0aC0xO1xyXG5cdHZhciB0eXBlPScnO1xyXG5cdGlmIChxY291bnQpIHR5cGU9Jz8nO1xyXG5cdGVsc2UgaWYgKHNjb3VudCkgdHlwZT0nKic7XHJcblx0cmV0dXJuIHt3aWxkY2FyZDp0eXBlLCB3aWR0aDogbiAsIG9wOid3aWxkY2FyZCd9O1xyXG59XHJcblxyXG52YXIgbmV3UGhyYXNlPWZ1bmN0aW9uKCkge1xyXG5cdHJldHVybiB7dGVybWlkOltdLHBvc3Rpbmc6W10scmF3OicnLHRlcm1sZW5ndGg6W119O1xyXG59IFxyXG52YXIgcGFyc2VRdWVyeT1mdW5jdGlvbihxLHNlcCkge1xyXG5cdGlmIChzZXAgJiYgcS5pbmRleE9mKHNlcCk+LTEpIHtcclxuXHRcdHZhciBtYXRjaD1xLnNwbGl0KHNlcCk7XHJcblx0fSBlbHNlIHtcclxuXHRcdHZhciBtYXRjaD1xLm1hdGNoKC8oXCIuKz9cInwnLis/J3xcXFMrKS9nKVxyXG5cdFx0bWF0Y2g9bWF0Y2gubWFwKGZ1bmN0aW9uKHN0cil7XHJcblx0XHRcdHZhciBuPXN0ci5sZW5ndGgsIGg9c3RyLmNoYXJBdCgwKSwgdD1zdHIuY2hhckF0KG4tMSlcclxuXHRcdFx0aWYgKGg9PT10JiYoaD09PSdcIid8aD09PVwiJ1wiKSkgc3RyPXN0ci5zdWJzdHIoMSxuLTIpXHJcblx0XHRcdHJldHVybiBzdHJcclxuXHRcdH0pXHJcblx0XHQvL2NvbnNvbGUubG9nKGlucHV0LCc9PT4nLG1hdGNoKVx0XHRcclxuXHR9XHJcblx0cmV0dXJuIG1hdGNoO1xyXG59XHJcbnZhciBsb2FkUGhyYXNlPWZ1bmN0aW9uKHBocmFzZSkge1xyXG5cdC8qIHJlbW92ZSBsZWFkaW5nIGFuZCBlbmRpbmcgd2lsZGNhcmQgKi9cclxuXHR2YXIgUT10aGlzO1xyXG5cdHZhciBjYWNoZT1RLmVuZ2luZS5wb3N0aW5nQ2FjaGU7XHJcblx0aWYgKGNhY2hlW3BocmFzZS5rZXldKSB7XHJcblx0XHRwaHJhc2UucG9zdGluZz1jYWNoZVtwaHJhc2Uua2V5XTtcclxuXHRcdHJldHVybiBRO1xyXG5cdH1cclxuXHRpZiAocGhyYXNlLnRlcm1pZC5sZW5ndGg9PTEpIHtcclxuXHRcdGlmICghUS50ZXJtcy5sZW5ndGgpe1xyXG5cdFx0XHRwaHJhc2UucG9zdGluZz1bXTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGNhY2hlW3BocmFzZS5rZXldPXBocmFzZS5wb3N0aW5nPVEudGVybXNbcGhyYXNlLnRlcm1pZFswXV0ucG9zdGluZztcdFxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIFE7XHJcblx0fVxyXG5cclxuXHR2YXIgaT0wLCByPVtdLGRpcz0wO1xyXG5cdHdoaWxlKGk8cGhyYXNlLnRlcm1pZC5sZW5ndGgpIHtcclxuXHQgIHZhciBUPVEudGVybXNbcGhyYXNlLnRlcm1pZFtpXV07XHJcblx0XHRpZiAoMCA9PT0gaSkge1xyXG5cdFx0XHRyID0gVC5wb3N0aW5nO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdCAgICBpZiAoVC5vcD09J3dpbGRjYXJkJykge1xyXG5cdFx0ICAgIFx0VD1RLnRlcm1zW3BocmFzZS50ZXJtaWRbaSsrXV07XHJcblx0XHQgICAgXHR2YXIgd2lkdGg9VC53aWR0aDtcclxuXHRcdCAgICBcdHZhciB3aWxkY2FyZD1ULndpbGRjYXJkO1xyXG5cdFx0ICAgIFx0VD1RLnRlcm1zW3BocmFzZS50ZXJtaWRbaV1dO1xyXG5cdFx0ICAgIFx0dmFyIG1pbmRpcz1kaXM7XHJcblx0XHQgICAgXHRpZiAod2lsZGNhcmQ9PSc/JykgbWluZGlzPWRpcyt3aWR0aDtcclxuXHRcdCAgICBcdGlmIChULmV4Y2x1ZGUpIHIgPSBwbGlzdC5wbG5vdGZvbGxvdzIociwgVC5wb3N0aW5nLCBtaW5kaXMsIGRpcyt3aWR0aCk7XHJcblx0XHQgICAgXHRlbHNlIHIgPSBwbGlzdC5wbGZvbGxvdzIociwgVC5wb3N0aW5nLCBtaW5kaXMsIGRpcyt3aWR0aCk7XHRcdCAgICBcdFxyXG5cdFx0ICAgIFx0ZGlzKz0od2lkdGgtMSk7XHJcblx0XHQgICAgfWVsc2Uge1xyXG5cdFx0ICAgIFx0aWYgKFQucG9zdGluZykge1xyXG5cdFx0ICAgIFx0XHRpZiAoVC5leGNsdWRlKSByID0gcGxpc3QucGxub3Rmb2xsb3cociwgVC5wb3N0aW5nLCBkaXMpO1xyXG5cdFx0ICAgIFx0XHRlbHNlIHIgPSBwbGlzdC5wbGZvbGxvdyhyLCBULnBvc3RpbmcsIGRpcyk7XHJcblx0XHQgICAgXHR9XHJcblx0XHQgICAgfVxyXG5cdFx0fVxyXG5cdFx0ZGlzICs9IHBocmFzZS50ZXJtbGVuZ3RoW2ldO1xyXG5cdFx0aSsrO1xyXG5cdFx0aWYgKCFyKSByZXR1cm4gUTtcclxuICB9XHJcbiAgcGhyYXNlLnBvc3Rpbmc9cjtcclxuICBjYWNoZVtwaHJhc2Uua2V5XT1yO1xyXG4gIHJldHVybiBRO1xyXG59XHJcbnZhciB0cmltU3BhY2U9ZnVuY3Rpb24oZW5naW5lLHF1ZXJ5KSB7XHJcblx0aWYgKCFxdWVyeSkgcmV0dXJuIFwiXCI7XHJcblx0dmFyIGk9MDtcclxuXHR2YXIgaXNTa2lwPWVuZ2luZS5hbmFseXplci5pc1NraXA7XHJcblx0d2hpbGUgKGlzU2tpcChxdWVyeVtpXSkgJiYgaTxxdWVyeS5sZW5ndGgpIGkrKztcclxuXHRyZXR1cm4gcXVlcnkuc3Vic3RyaW5nKGkpO1xyXG59XHJcbnZhciBnZXRTZWdXaXRoSGl0PWZ1bmN0aW9uKGZpbGVpZCxvZmZzZXRzKSB7XHJcblx0dmFyIFE9dGhpcyxlbmdpbmU9US5lbmdpbmU7XHJcblx0dmFyIHNlZ1dpdGhIaXQ9cGxpc3QuZ3JvdXBieXBvc3RpbmcyKFEuYnlGaWxlW2ZpbGVpZCBdLCBvZmZzZXRzKTtcclxuXHRpZiAoc2VnV2l0aEhpdC5sZW5ndGgpIHNlZ1dpdGhIaXQuc2hpZnQoKTsgLy90aGUgZmlyc3QgaXRlbSBpcyBub3QgdXNlZCAoMH5RLmJ5RmlsZVswXSApXHJcblx0dmFyIG91dD1bXTtcclxuXHRzZWdXaXRoSGl0Lm1hcChmdW5jdGlvbihwLGlkeCl7aWYgKHAubGVuZ3RoKSBvdXQucHVzaChpZHgpfSk7XHJcblx0cmV0dXJuIG91dDtcclxufVxyXG52YXIgc2VnV2l0aEhpdD1mdW5jdGlvbihmaWxlaWQpIHtcclxuXHR2YXIgUT10aGlzLGVuZ2luZT1RLmVuZ2luZTtcclxuXHR2YXIgb2Zmc2V0cz1lbmdpbmUuZ2V0RmlsZVNlZ09mZnNldHMoZmlsZWlkKTtcclxuXHRyZXR1cm4gZ2V0U2VnV2l0aEhpdC5hcHBseSh0aGlzLFtmaWxlaWQsb2Zmc2V0c10pO1xyXG59XHJcbnZhciBpc1NpbXBsZVBocmFzZT1mdW5jdGlvbihwaHJhc2UpIHtcclxuXHR2YXIgbT1waHJhc2UubWF0Y2goL1tcXD8lXl0vKTtcclxuXHRyZXR1cm4gIW07XHJcbn1cclxuXHJcbi8vIOeZvOiPqeaPkOW/gyAgID09PiDnmbzoj6kgIOaPkOW/gyAgICAgICAyIDIgICBcclxuLy8g6I+p5o+Q5b+DICAgICA9PT4g6I+p5o+QICDmj5Dlv4MgICAgICAgMSAyXHJcbi8vIOWKq+WKqyAgICAgICA9PT4g5YqrICAgIOWKqyAgICAgICAgIDEgMSAgIC8vIGludmFsaWRcclxuLy8g5Zug57ej5omA55Sf6YGTICA9PT4g5Zug57ejICDmiYDnlJ8gICDpgZMgICAyIDIgMVxyXG52YXIgc3BsaXRQaHJhc2U9ZnVuY3Rpb24oZW5naW5lLHNpbXBsZXBocmFzZSxiaWdyYW0pIHtcclxuXHR2YXIgYmlncmFtPWJpZ3JhbXx8ZW5naW5lLmdldChcIm1ldGFcIikuYmlncmFtfHxbXTtcclxuXHR2YXIgdG9rZW5zPWVuZ2luZS5hbmFseXplci50b2tlbml6ZShzaW1wbGVwaHJhc2UpLnRva2VucztcclxuXHR2YXIgbG9hZHRva2Vucz1bXSxsZW5ndGhzPVtdLGo9MCxsYXN0YmlncmFtcG9zPS0xO1xyXG5cdHdoaWxlIChqKzE8dG9rZW5zLmxlbmd0aCkge1xyXG5cdFx0dmFyIHRva2VuPWVuZ2luZS5hbmFseXplci5ub3JtYWxpemUodG9rZW5zW2pdKTtcclxuXHRcdHZhciBuZXh0dG9rZW49ZW5naW5lLmFuYWx5emVyLm5vcm1hbGl6ZSh0b2tlbnNbaisxXSk7XHJcblx0XHR2YXIgYmk9dG9rZW4rbmV4dHRva2VuO1xyXG5cdFx0dmFyIGk9cGxpc3QuaW5kZXhPZlNvcnRlZChiaWdyYW0sYmkpO1xyXG5cdFx0aWYgKGJpZ3JhbVtpXT09YmkpIHtcclxuXHRcdFx0bG9hZHRva2Vucy5wdXNoKGJpKTtcclxuXHRcdFx0aWYgKGorMzx0b2tlbnMubGVuZ3RoKSB7XHJcblx0XHRcdFx0bGFzdGJpZ3JhbXBvcz1qO1xyXG5cdFx0XHRcdGorKztcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRpZiAoaisyPT10b2tlbnMubGVuZ3RoKXsgXHJcblx0XHRcdFx0XHRpZiAobGFzdGJpZ3JhbXBvcysxPT1qICkge1xyXG5cdFx0XHRcdFx0XHRsZW5ndGhzW2xlbmd0aHMubGVuZ3RoLTFdLS07XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRsYXN0YmlncmFtcG9zPWo7XHJcblx0XHRcdFx0XHRqKys7XHJcblx0XHRcdFx0fWVsc2Uge1xyXG5cdFx0XHRcdFx0bGFzdGJpZ3JhbXBvcz1qO1x0XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdGxlbmd0aHMucHVzaCgyKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGlmICghYmlncmFtIHx8IGxhc3RiaWdyYW1wb3M9PS0xIHx8IGxhc3RiaWdyYW1wb3MrMSE9aikge1xyXG5cdFx0XHRcdGxvYWR0b2tlbnMucHVzaCh0b2tlbik7XHJcblx0XHRcdFx0bGVuZ3Rocy5wdXNoKDEpO1x0XHRcdFx0XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGorKztcclxuXHR9XHJcblxyXG5cdHdoaWxlIChqPHRva2Vucy5sZW5ndGgpIHtcclxuXHRcdHZhciB0b2tlbj1lbmdpbmUuYW5hbHl6ZXIubm9ybWFsaXplKHRva2Vuc1tqXSk7XHJcblx0XHRsb2FkdG9rZW5zLnB1c2godG9rZW4pO1xyXG5cdFx0bGVuZ3Rocy5wdXNoKDEpO1xyXG5cdFx0aisrO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIHt0b2tlbnM6bG9hZHRva2VucywgbGVuZ3RoczogbGVuZ3RocyAsIHRva2VubGVuZ3RoOiB0b2tlbnMubGVuZ3RofTtcclxufVxyXG4vKiBob3N0IGhhcyBmYXN0IG5hdGl2ZSBmdW5jdGlvbiAqL1xyXG52YXIgZmFzdFBocmFzZT1mdW5jdGlvbihlbmdpbmUscGhyYXNlKSB7XHJcblx0dmFyIHBocmFzZV90ZXJtPW5ld1BocmFzZSgpO1xyXG5cdC8vdmFyIHRva2Vucz1lbmdpbmUuYW5hbHl6ZXIudG9rZW5pemUocGhyYXNlKS50b2tlbnM7XHJcblx0dmFyIHNwbGl0dGVkPXNwbGl0UGhyYXNlKGVuZ2luZSxwaHJhc2UpO1xyXG5cclxuXHR2YXIgcGF0aHM9cG9zdGluZ1BhdGhGcm9tVG9rZW5zKGVuZ2luZSxzcGxpdHRlZC50b2tlbnMpO1xyXG4vL2NyZWF0ZSB3aWxkY2FyZFxyXG5cclxuXHRwaHJhc2VfdGVybS53aWR0aD1zcGxpdHRlZC50b2tlbmxlbmd0aDsgLy9mb3IgZXhjZXJwdC5qcyB0byBnZXRQaHJhc2VXaWR0aFxyXG5cclxuXHRlbmdpbmUuZ2V0KHBhdGhzLHthZGRyZXNzOnRydWV9LGZ1bmN0aW9uKHBvc3RpbmdBZGRyZXNzKXsgLy90aGlzIGlzIHN5bmNcclxuXHRcdHBocmFzZV90ZXJtLmtleT1waHJhc2U7XHJcblx0XHR2YXIgcG9zdGluZ0FkZHJlc3NXaXRoV2lsZGNhcmQ9W107XHJcblx0XHRmb3IgKHZhciBpPTA7aTxwb3N0aW5nQWRkcmVzcy5sZW5ndGg7aSsrKSB7XHJcblx0XHRcdHBvc3RpbmdBZGRyZXNzV2l0aFdpbGRjYXJkLnB1c2gocG9zdGluZ0FkZHJlc3NbaV0pO1xyXG5cdFx0XHRpZiAoc3BsaXR0ZWQubGVuZ3Roc1tpXT4xKSB7XHJcblx0XHRcdFx0cG9zdGluZ0FkZHJlc3NXaXRoV2lsZGNhcmQucHVzaChbc3BsaXR0ZWQubGVuZ3Roc1tpXSwwXSk7IC8vd2lsZGNhcmQgaGFzIGJsb2Nrc2l6ZT09MCBcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0ZW5naW5lLnBvc3RpbmdDYWNoZVtwaHJhc2VdPWVuZ2luZS5tZXJnZVBvc3RpbmdzKHBvc3RpbmdBZGRyZXNzV2l0aFdpbGRjYXJkKTtcclxuXHR9KTtcclxuXHRyZXR1cm4gcGhyYXNlX3Rlcm07XHJcblx0Ly8gcHV0IHBvc3RpbmcgaW50byBjYWNoZVtwaHJhc2Uua2V5XVxyXG59XHJcbnZhciBzbG93UGhyYXNlPWZ1bmN0aW9uKGVuZ2luZSx0ZXJtcyxwaHJhc2UpIHtcclxuXHR2YXIgaj0wLHRva2Vucz1lbmdpbmUuYW5hbHl6ZXIudG9rZW5pemUocGhyYXNlKS50b2tlbnM7XHJcblx0dmFyIHBocmFzZV90ZXJtPW5ld1BocmFzZSgpO1xyXG5cdHZhciB0ZXJtaWQ9MDtcclxuXHR3aGlsZSAoajx0b2tlbnMubGVuZ3RoKSB7XHJcblx0XHR2YXIgcmF3PXRva2Vuc1tqXSwgdGVybWxlbmd0aD0xO1xyXG5cdFx0aWYgKGlzV2lsZGNhcmQocmF3KSkge1xyXG5cdFx0XHRpZiAocGhyYXNlX3Rlcm0udGVybWlkLmxlbmd0aD09MCkgIHsgLy9za2lwIGxlYWRpbmcgd2lsZCBjYXJkXHJcblx0XHRcdFx0aisrXHJcblx0XHRcdFx0Y29udGludWU7XHJcblx0XHRcdH1cclxuXHRcdFx0dGVybXMucHVzaChwYXJzZVdpbGRjYXJkKHJhdykpO1xyXG5cdFx0XHR0ZXJtaWQ9dGVybXMubGVuZ3RoLTE7XHJcblx0XHRcdHBocmFzZV90ZXJtLnRlcm1pZC5wdXNoKHRlcm1pZCk7XHJcblx0XHRcdHBocmFzZV90ZXJtLnRlcm1sZW5ndGgucHVzaCh0ZXJtbGVuZ3RoKTtcclxuXHRcdH0gZWxzZSBpZiAoaXNPclRlcm0ocmF3KSl7XHJcblx0XHRcdHZhciB0ZXJtPW9yVGVybXMuYXBwbHkodGhpcyxbdG9rZW5zLGpdKTtcclxuXHRcdFx0aWYgKHRlcm0pIHtcclxuXHRcdFx0XHR0ZXJtcy5wdXNoKHRlcm0pO1xyXG5cdFx0XHRcdHRlcm1pZD10ZXJtcy5sZW5ndGgtMTtcclxuXHRcdFx0XHRqKz10ZXJtLmtleS5zcGxpdCgnLCcpLmxlbmd0aC0xO1x0XHRcdFx0XHRcclxuXHRcdFx0fVxyXG5cdFx0XHRqKys7XHJcblx0XHRcdHBocmFzZV90ZXJtLnRlcm1pZC5wdXNoKHRlcm1pZCk7XHJcblx0XHRcdHBocmFzZV90ZXJtLnRlcm1sZW5ndGgucHVzaCh0ZXJtbGVuZ3RoKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHZhciBwaHJhc2U9XCJcIjtcclxuXHRcdFx0d2hpbGUgKGo8dG9rZW5zLmxlbmd0aCkge1xyXG5cdFx0XHRcdGlmICghKGlzV2lsZGNhcmQodG9rZW5zW2pdKSB8fCBpc09yVGVybSh0b2tlbnNbal0pKSkge1xyXG5cdFx0XHRcdFx0cGhyYXNlKz10b2tlbnNbal07XHJcblx0XHRcdFx0XHRqKys7XHJcblx0XHRcdFx0fSBlbHNlIGJyZWFrO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR2YXIgc3BsaXR0ZWQ9c3BsaXRQaHJhc2UoZW5naW5lLHBocmFzZSk7XHJcblx0XHRcdGZvciAodmFyIGk9MDtpPHNwbGl0dGVkLnRva2Vucy5sZW5ndGg7aSsrKSB7XHJcblxyXG5cdFx0XHRcdHZhciB0ZXJtPXBhcnNlVGVybShlbmdpbmUsc3BsaXR0ZWQudG9rZW5zW2ldKTtcclxuXHRcdFx0XHR2YXIgdGVybWlkeD10ZXJtcy5tYXAoZnVuY3Rpb24oYSl7cmV0dXJuIGEua2V5fSkuaW5kZXhPZih0ZXJtLmtleSk7XHJcblx0XHRcdFx0aWYgKHRlcm1pZHg9PS0xKSB7XHJcblx0XHRcdFx0XHR0ZXJtcy5wdXNoKHRlcm0pO1xyXG5cdFx0XHRcdFx0dGVybWlkPXRlcm1zLmxlbmd0aC0xO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHR0ZXJtaWQ9dGVybWlkeDtcclxuXHRcdFx0XHR9XHRcdFx0XHRcclxuXHRcdFx0XHRwaHJhc2VfdGVybS50ZXJtaWQucHVzaCh0ZXJtaWQpO1xyXG5cdFx0XHRcdHBocmFzZV90ZXJtLnRlcm1sZW5ndGgucHVzaChzcGxpdHRlZC5sZW5ndGhzW2ldKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0aisrO1xyXG5cdH1cclxuXHRwaHJhc2VfdGVybS5rZXk9cGhyYXNlO1xyXG5cdC8vcmVtb3ZlIGVuZGluZyB3aWxkY2FyZFxyXG5cdHZhciBQPXBocmFzZV90ZXJtICwgVD1udWxsO1xyXG5cdGRvIHtcclxuXHRcdFQ9dGVybXNbUC50ZXJtaWRbUC50ZXJtaWQubGVuZ3RoLTFdXTtcclxuXHRcdGlmICghVCkgYnJlYWs7XHJcblx0XHRpZiAoVC53aWxkY2FyZCkgUC50ZXJtaWQucG9wKCk7IGVsc2UgYnJlYWs7XHJcblx0fSB3aGlsZShUKTtcdFx0XHJcblx0cmV0dXJuIHBocmFzZV90ZXJtO1xyXG59XHJcbnZhciBuZXdRdWVyeSA9ZnVuY3Rpb24oZW5naW5lLHF1ZXJ5LG9wdHMpIHtcclxuXHQvL2lmICghcXVlcnkpIHJldHVybjtcclxuXHRvcHRzPW9wdHN8fHt9O1xyXG5cdHF1ZXJ5PXRyaW1TcGFjZShlbmdpbmUscXVlcnkpO1xyXG5cclxuXHR2YXIgcGhyYXNlcz1xdWVyeSxwaHJhc2VzPVtdO1xyXG5cdGlmICh0eXBlb2YgcXVlcnk9PSdzdHJpbmcnICYmIHF1ZXJ5KSB7XHJcblx0XHRwaHJhc2VzPXBhcnNlUXVlcnkocXVlcnksb3B0cy5waHJhc2Vfc2VwIHx8IFwiXCIpO1xyXG5cdH1cclxuXHRcclxuXHR2YXIgcGhyYXNlX3Rlcm1zPVtdLCB0ZXJtcz1bXSx2YXJpYW50cz1bXSxvcGVyYXRvcnM9W107XHJcblx0dmFyIHBjPTA7Ly9waHJhc2UgY291bnRcclxuXHRmb3IgICh2YXIgaT0wO2k8cGhyYXNlcy5sZW5ndGg7aSsrKSB7XHJcblx0XHR2YXIgb3A9Z2V0T3BlcmF0b3IocGhyYXNlc1twY10pO1xyXG5cdFx0aWYgKG9wKSBwaHJhc2VzW3BjXT1waHJhc2VzW3BjXS5zdWJzdHJpbmcoMSk7XHJcblxyXG5cdFx0LyogYXV0byBhZGQgKyBmb3IgbmF0dXJhbCBvcmRlciA/Ki9cclxuXHRcdC8vaWYgKCFvcHRzLnJhbmsgJiYgb3AhPSdleGNsdWRlJyAmJmkpIG9wPSdpbmNsdWRlJztcclxuXHRcdG9wZXJhdG9ycy5wdXNoKG9wKTtcclxuXHJcblx0XHRpZiAoaXNTaW1wbGVQaHJhc2UocGhyYXNlc1twY10pICYmIGVuZ2luZS5tZXJnZVBvc3RpbmdzICkge1xyXG5cdFx0XHR2YXIgcGhyYXNlX3Rlcm09ZmFzdFBocmFzZShlbmdpbmUscGhyYXNlc1twY10pO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dmFyIHBocmFzZV90ZXJtPXNsb3dQaHJhc2UoZW5naW5lLHRlcm1zLHBocmFzZXNbcGNdKTtcclxuXHRcdH1cclxuXHRcdHBocmFzZV90ZXJtcy5wdXNoKHBocmFzZV90ZXJtKTtcclxuXHJcblx0XHRpZiAoIWVuZ2luZS5tZXJnZVBvc3RpbmdzICYmIHBocmFzZV90ZXJtc1twY10udGVybWlkLmxlbmd0aD09MCkge1xyXG5cdFx0XHRwaHJhc2VfdGVybXMucG9wKCk7XHJcblx0XHR9IGVsc2UgcGMrKztcclxuXHR9XHJcblx0b3B0cy5vcD1vcGVyYXRvcnM7XHJcblxyXG5cdHZhciBRPXtkYm5hbWU6ZW5naW5lLmRibmFtZSxlbmdpbmU6ZW5naW5lLG9wdHM6b3B0cyxxdWVyeTpxdWVyeSxcclxuXHRcdHBocmFzZXM6cGhyYXNlX3Rlcm1zLHRlcm1zOnRlcm1zXHJcblx0fTtcclxuXHRRLnRva2VuaXplPWZ1bmN0aW9uKCkge3JldHVybiBlbmdpbmUuYW5hbHl6ZXIudG9rZW5pemUuYXBwbHkoZW5naW5lLGFyZ3VtZW50cyk7fVxyXG5cdFEuaXNTa2lwPWZ1bmN0aW9uKCkge3JldHVybiBlbmdpbmUuYW5hbHl6ZXIuaXNTa2lwLmFwcGx5KGVuZ2luZSxhcmd1bWVudHMpO31cclxuXHRRLm5vcm1hbGl6ZT1mdW5jdGlvbigpIHtyZXR1cm4gZW5naW5lLmFuYWx5emVyLm5vcm1hbGl6ZS5hcHBseShlbmdpbmUsYXJndW1lbnRzKTt9XHJcblx0US5zZWdXaXRoSGl0PXNlZ1dpdGhIaXQ7XHJcblxyXG5cdC8vUS5nZXRSYW5nZT1mdW5jdGlvbigpIHtyZXR1cm4gdGhhdC5nZXRSYW5nZS5hcHBseSh0aGF0LGFyZ3VtZW50cyl9O1xyXG5cdC8vQVBJLnF1ZXJ5aWQ9J1EnKyhNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqMTAwMDAwMDApKS50b1N0cmluZygxNik7XHJcblx0cmV0dXJuIFE7XHJcbn1cclxudmFyIHBvc3RpbmdQYXRoRnJvbVRva2Vucz1mdW5jdGlvbihlbmdpbmUsdG9rZW5zKSB7XHJcblx0dmFyIGFsbHRva2Vucz1lbmdpbmUuZ2V0KFwidG9rZW5zXCIpO1xyXG5cclxuXHR2YXIgdG9rZW5JZHM9dG9rZW5zLm1hcChmdW5jdGlvbih0KXsgcmV0dXJuIDErYWxsdG9rZW5zLmluZGV4T2YodCl9KTtcclxuXHR2YXIgcG9zdGluZ2lkPVtdO1xyXG5cdGZvciAodmFyIGk9MDtpPHRva2VuSWRzLmxlbmd0aDtpKyspIHtcclxuXHRcdHBvc3RpbmdpZC5wdXNoKCB0b2tlbklkc1tpXSk7IC8vIHRva2VuSWQ9PTAgLCBlbXB0eSB0b2tlblxyXG5cdH1cclxuXHRyZXR1cm4gcG9zdGluZ2lkLm1hcChmdW5jdGlvbih0KXtyZXR1cm4gW1wicG9zdGluZ3NcIix0XX0pO1xyXG59XHJcbnZhciBsb2FkUG9zdGluZ3M9ZnVuY3Rpb24oZW5naW5lLHRva2VucyxjYikge1xyXG5cdHZhciB0b2xvYWR0b2tlbnM9dG9rZW5zLmZpbHRlcihmdW5jdGlvbih0KXtcclxuXHRcdHJldHVybiAhZW5naW5lLnBvc3RpbmdDYWNoZVt0LmtleV07IC8vYWxyZWFkeSBpbiBjYWNoZVxyXG5cdH0pO1xyXG5cdGlmICh0b2xvYWR0b2tlbnMubGVuZ3RoPT0wKSB7XHJcblx0XHRjYigpO1xyXG5cdFx0cmV0dXJuO1xyXG5cdH1cclxuXHR2YXIgcG9zdGluZ1BhdGhzPXBvc3RpbmdQYXRoRnJvbVRva2VucyhlbmdpbmUsdG9rZW5zLm1hcChmdW5jdGlvbih0KXtyZXR1cm4gdC5rZXl9KSk7XHJcblx0ZW5naW5lLmdldChwb3N0aW5nUGF0aHMsZnVuY3Rpb24ocG9zdGluZ3Mpe1xyXG5cdFx0cG9zdGluZ3MubWFwKGZ1bmN0aW9uKHAsaSkgeyB0b2tlbnNbaV0ucG9zdGluZz1wIH0pO1xyXG5cdFx0aWYgKGNiKSBjYigpO1xyXG5cdH0pO1xyXG59XHJcbnZhciBncm91cEJ5PWZ1bmN0aW9uKFEscG9zdGluZykge1xyXG5cdHBocmFzZXMuZm9yRWFjaChmdW5jdGlvbihQKXtcclxuXHRcdHZhciBrZXk9UC5rZXk7XHJcblx0XHR2YXIgZG9jZnJlcT1kb2NmcmVxY2FjaGVba2V5XTtcclxuXHRcdGlmICghZG9jZnJlcSkgZG9jZnJlcT1kb2NmcmVxY2FjaGVba2V5XT17fTtcclxuXHRcdGlmICghZG9jZnJlcVt0aGF0Lmdyb3VwdW5pdF0pIHtcclxuXHRcdFx0ZG9jZnJlcVt0aGF0Lmdyb3VwdW5pdF09e2RvY2xpc3Q6bnVsbCxmcmVxOm51bGx9O1xyXG5cdFx0fVx0XHRcclxuXHRcdGlmIChQLnBvc3RpbmcpIHtcclxuXHRcdFx0dmFyIHJlcz1tYXRjaFBvc3RpbmcoZW5naW5lLFAucG9zdGluZyk7XHJcblx0XHRcdFAuZnJlcT1yZXMuZnJlcTtcclxuXHRcdFx0UC5kb2NzPXJlcy5kb2NzO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0UC5kb2NzPVtdO1xyXG5cdFx0XHRQLmZyZXE9W107XHJcblx0XHR9XHJcblx0XHRkb2NmcmVxW3RoYXQuZ3JvdXB1bml0XT17ZG9jbGlzdDpQLmRvY3MsZnJlcTpQLmZyZXF9O1xyXG5cdH0pO1xyXG5cdHJldHVybiB0aGlzO1xyXG59XHJcbnZhciBncm91cEJ5Rm9sZGVyPWZ1bmN0aW9uKGVuZ2luZSxmaWxlaGl0cykge1xyXG5cdHZhciBmaWxlcz1lbmdpbmUuZ2V0KFwiZmlsZW5hbWVzXCIpO1xyXG5cdHZhciBwcmV2Zm9sZGVyPVwiXCIsaGl0cz0wLG91dD1bXTtcclxuXHRmb3IgKHZhciBpPTA7aTxmaWxlaGl0cy5sZW5ndGg7aSsrKSB7XHJcblx0XHR2YXIgZm49ZmlsZXNbaV07XHJcblx0XHR2YXIgZm9sZGVyPWZuLnN1YnN0cmluZygwLGZuLmluZGV4T2YoJy8nKSk7XHJcblx0XHRpZiAocHJldmZvbGRlciAmJiBwcmV2Zm9sZGVyIT1mb2xkZXIpIHtcclxuXHRcdFx0b3V0LnB1c2goaGl0cyk7XHJcblx0XHRcdGhpdHM9MDtcclxuXHRcdH1cclxuXHRcdGhpdHMrPWZpbGVoaXRzW2ldLmxlbmd0aDtcclxuXHRcdHByZXZmb2xkZXI9Zm9sZGVyO1xyXG5cdH1cclxuXHRvdXQucHVzaChoaXRzKTtcclxuXHRyZXR1cm4gb3V0O1xyXG59XHJcbnZhciBwaHJhc2VfaW50ZXJzZWN0PWZ1bmN0aW9uKGVuZ2luZSxRKSB7XHJcblx0dmFyIGludGVyc2VjdGVkPW51bGw7XHJcblx0dmFyIGZpbGVvZmZzZXRzPVEuZW5naW5lLmdldChcImZpbGVvZmZzZXRzXCIpO1xyXG5cdHZhciBlbXB0eT1bXSxlbXB0eWNvdW50PTAsaGFzaGl0PTA7XHJcblx0Zm9yICh2YXIgaT0wO2k8US5waHJhc2VzLmxlbmd0aDtpKyspIHtcclxuXHRcdHZhciBieWZpbGU9cGxpc3QuZ3JvdXBieXBvc3RpbmcyKFEucGhyYXNlc1tpXS5wb3N0aW5nLGZpbGVvZmZzZXRzKTtcclxuXHRcdGlmIChieWZpbGUubGVuZ3RoKSBieWZpbGUuc2hpZnQoKTtcclxuXHRcdGlmIChieWZpbGUubGVuZ3RoKSBieWZpbGUucG9wKCk7XHJcblx0XHRieWZpbGUucG9wKCk7XHJcblx0XHRpZiAoaW50ZXJzZWN0ZWQ9PW51bGwpIHtcclxuXHRcdFx0aW50ZXJzZWN0ZWQ9YnlmaWxlO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Zm9yICh2YXIgaj0wO2o8YnlmaWxlLmxlbmd0aDtqKyspIHtcclxuXHRcdFx0XHRpZiAoIShieWZpbGVbal0ubGVuZ3RoICYmIGludGVyc2VjdGVkW2pdLmxlbmd0aCkpIHtcclxuXHRcdFx0XHRcdGludGVyc2VjdGVkW2pdPWVtcHR5OyAvL3JldXNlIGVtcHR5IGFycmF5XHJcblx0XHRcdFx0XHRlbXB0eWNvdW50Kys7XHJcblx0XHRcdFx0fSBlbHNlIGhhc2hpdCsrO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRRLmJ5RmlsZT1pbnRlcnNlY3RlZDtcclxuXHRRLmJ5Rm9sZGVyPWdyb3VwQnlGb2xkZXIoZW5naW5lLFEuYnlGaWxlKTtcclxuXHR2YXIgb3V0PVtdO1xyXG5cdC8vY2FsY3VsYXRlIG5ldyByYXdwb3N0aW5nXHJcblx0Zm9yICh2YXIgaT0wO2k8US5ieUZpbGUubGVuZ3RoO2krKykge1xyXG5cdFx0aWYgKFEuYnlGaWxlW2ldLmxlbmd0aCkgb3V0PW91dC5jb25jYXQoUS5ieUZpbGVbaV0pO1xyXG5cdH1cclxuXHRRLnJhd3Jlc3VsdD1vdXQ7XHJcblx0Y291bnRGb2xkZXJGaWxlKFEpO1xyXG59XHJcbnZhciBjb3VudEZvbGRlckZpbGU9ZnVuY3Rpb24oUSkge1xyXG5cdFEuZmlsZVdpdGhIaXRDb3VudD0wO1xyXG5cdFEuYnlGaWxlLm1hcChmdW5jdGlvbihmKXtpZiAoZi5sZW5ndGgpIFEuZmlsZVdpdGhIaXRDb3VudCsrfSk7XHJcblx0XHRcdFxyXG5cdFEuZm9sZGVyV2l0aEhpdENvdW50PTA7XHJcblx0US5ieUZvbGRlci5tYXAoZnVuY3Rpb24oZil7aWYgKGYpIFEuZm9sZGVyV2l0aEhpdENvdW50Kyt9KTtcclxufVxyXG5cclxudmFyIG1haW49ZnVuY3Rpb24oZW5naW5lLHEsb3B0cyxjYil7XHJcblx0dmFyIHN0YXJ0dGltZT1uZXcgRGF0ZSgpO1xyXG5cdHZhciBtZXRhPWVuZ2luZS5nZXQoXCJtZXRhXCIpO1xyXG5cdGlmIChtZXRhLm5vcm1hbGl6ZSAmJiBlbmdpbmUuYW5hbHl6ZXIuc2V0Tm9ybWFsaXplVGFibGUpIHtcclxuXHRcdG1ldGEubm9ybWFsaXplT2JqPWVuZ2luZS5hbmFseXplci5zZXROb3JtYWxpemVUYWJsZShtZXRhLm5vcm1hbGl6ZSxtZXRhLm5vcm1hbGl6ZU9iaik7XHJcblx0fVxyXG5cdGlmICh0eXBlb2Ygb3B0cz09XCJmdW5jdGlvblwiKSBjYj1vcHRzO1xyXG5cdG9wdHM9b3B0c3x8e307XHJcblx0dmFyIFE9ZW5naW5lLnF1ZXJ5Q2FjaGVbcV07XHJcblx0aWYgKCFRKSBRPW5ld1F1ZXJ5KGVuZ2luZSxxLG9wdHMpOyBcclxuXHRpZiAoIVEpIHtcclxuXHRcdGVuZ2luZS5zZWFyY2h0aW1lPW5ldyBEYXRlKCktc3RhcnR0aW1lO1xyXG5cdFx0ZW5naW5lLnRvdGFsdGltZT1lbmdpbmUuc2VhcmNodGltZTtcclxuXHRcdGlmIChlbmdpbmUuY29udGV4dCkgY2IuYXBwbHkoZW5naW5lLmNvbnRleHQsW1wiZW1wdHkgcmVzdWx0XCIse3Jhd3Jlc3VsdDpbXX1dKTtcclxuXHRcdGVsc2UgY2IoXCJlbXB0eSByZXN1bHRcIix7cmF3cmVzdWx0OltdfSk7XHJcblx0XHRyZXR1cm47XHJcblx0fTtcclxuXHRlbmdpbmUucXVlcnlDYWNoZVtxXT1RO1xyXG5cdGlmIChRLnBocmFzZXMubGVuZ3RoKSB7XHJcblx0XHRsb2FkUG9zdGluZ3MoZW5naW5lLFEudGVybXMsZnVuY3Rpb24oKXtcclxuXHRcdFx0aWYgKCFRLnBocmFzZXNbMF0ucG9zdGluZykge1xyXG5cdFx0XHRcdGVuZ2luZS5zZWFyY2h0aW1lPW5ldyBEYXRlKCktc3RhcnR0aW1lO1xyXG5cdFx0XHRcdGVuZ2luZS50b3RhbHRpbWU9ZW5naW5lLnNlYXJjaHRpbWVcclxuXHJcblx0XHRcdFx0Y2IuYXBwbHkoZW5naW5lLmNvbnRleHQsW1wibm8gc3VjaCBwb3N0aW5nXCIse3Jhd3Jlc3VsdDpbXX1dKTtcclxuXHRcdFx0XHRyZXR1cm47XHRcdFx0XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdGlmICghUS5waHJhc2VzWzBdLnBvc3RpbmcubGVuZ3RoKSB7IC8vXHJcblx0XHRcdFx0US5waHJhc2VzLmZvckVhY2gobG9hZFBocmFzZS5iaW5kKFEpKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAoUS5waHJhc2VzLmxlbmd0aD09MSkge1xyXG5cdFx0XHRcdFEucmF3cmVzdWx0PVEucGhyYXNlc1swXS5wb3N0aW5nO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHBocmFzZV9pbnRlcnNlY3QoZW5naW5lLFEpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHZhciBmaWxlb2Zmc2V0cz1RLmVuZ2luZS5nZXQoXCJmaWxlb2Zmc2V0c1wiKTtcclxuXHRcdFx0Ly9jb25zb2xlLmxvZyhcInNlYXJjaCBvcHRzIFwiK0pTT04uc3RyaW5naWZ5KG9wdHMpKTtcclxuXHJcblx0XHRcdGlmICghUS5ieUZpbGUgJiYgUS5yYXdyZXN1bHQgJiYgIW9wdHMubm9ncm91cCkge1xyXG5cdFx0XHRcdFEuYnlGaWxlPXBsaXN0Lmdyb3VwYnlwb3N0aW5nMihRLnJhd3Jlc3VsdCwgZmlsZW9mZnNldHMpO1xyXG5cdFx0XHRcdFEuYnlGaWxlLnNoaWZ0KCk7US5ieUZpbGUucG9wKCk7XHJcblx0XHRcdFx0US5ieUZvbGRlcj1ncm91cEJ5Rm9sZGVyKGVuZ2luZSxRLmJ5RmlsZSk7XHJcblxyXG5cdFx0XHRcdGNvdW50Rm9sZGVyRmlsZShRKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYgKG9wdHMucmFuZ2UpIHtcclxuXHRcdFx0XHRlbmdpbmUuc2VhcmNodGltZT1uZXcgRGF0ZSgpLXN0YXJ0dGltZTtcclxuXHRcdFx0XHRleGNlcnB0LnJlc3VsdGxpc3QoZW5naW5lLFEsb3B0cyxmdW5jdGlvbihkYXRhKSB7IFxyXG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhcImV4Y2VycHQgb2tcIik7XHJcblx0XHRcdFx0XHRRLmV4Y2VycHQ9ZGF0YTtcclxuXHRcdFx0XHRcdGVuZ2luZS50b3RhbHRpbWU9bmV3IERhdGUoKS1zdGFydHRpbWU7XHJcblx0XHRcdFx0XHRjYi5hcHBseShlbmdpbmUuY29udGV4dCxbMCxRXSk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0ZW5naW5lLnNlYXJjaHRpbWU9bmV3IERhdGUoKS1zdGFydHRpbWU7XHJcblx0XHRcdFx0ZW5naW5lLnRvdGFsdGltZT1uZXcgRGF0ZSgpLXN0YXJ0dGltZTtcclxuXHRcdFx0XHRjYi5hcHBseShlbmdpbmUuY29udGV4dCxbMCxRXSk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH0gZWxzZSB7IC8vZW1wdHkgc2VhcmNoXHJcblx0XHRlbmdpbmUuc2VhcmNodGltZT1uZXcgRGF0ZSgpLXN0YXJ0dGltZTtcclxuXHRcdGVuZ2luZS50b3RhbHRpbWU9bmV3IERhdGUoKS1zdGFydHRpbWU7XHJcblx0XHRjYi5hcHBseShlbmdpbmUuY29udGV4dCxbMCxRXSk7XHJcblx0fTtcclxufVxyXG5cclxubWFpbi5zcGxpdFBocmFzZT1zcGxpdFBocmFzZTsgLy9qdXN0IGZvciBkZWJ1Z1xyXG5tb2R1bGUuZXhwb3J0cz1tYWluOyIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xyXG4vKlxyXG5jb252ZXJ0IHRvIHB1cmUganNcclxuc2F2ZSAtZyByZWFjdGlmeVxyXG4qL1xyXG52YXIgRT1SZWFjdC5jcmVhdGVFbGVtZW50O1xyXG5cclxudmFyIGhhc2tzYW5hZ2FwPSh0eXBlb2Yga3NhbmFnYXAhPVwidW5kZWZpbmVkXCIpO1xyXG5pZiAoaGFza3NhbmFnYXAgJiYgKHR5cGVvZiBjb25zb2xlPT1cInVuZGVmaW5lZFwiIHx8IHR5cGVvZiBjb25zb2xlLmxvZz09XCJ1bmRlZmluZWRcIikpIHtcclxuXHRcdHdpbmRvdy5jb25zb2xlPXtsb2c6a3NhbmFnYXAubG9nLGVycm9yOmtzYW5hZ2FwLmVycm9yLGRlYnVnOmtzYW5hZ2FwLmRlYnVnLHdhcm46a3NhbmFnYXAud2Fybn07XHJcblx0XHRjb25zb2xlLmxvZyhcImluc3RhbGwgY29uc29sZSBvdXRwdXQgZnVuY2l0b25cIik7XHJcbn1cclxuXHJcbnZhciBjaGVja2ZzPWZ1bmN0aW9uKCkge1xyXG5cdHJldHVybiAobmF2aWdhdG9yICYmIG5hdmlnYXRvci53ZWJraXRQZXJzaXN0ZW50U3RvcmFnZSkgfHwgaGFza3NhbmFnYXA7XHJcbn1cclxudmFyIGZlYXR1cmVjaGVja3M9e1xyXG5cdFwiZnNcIjpjaGVja2ZzXHJcbn1cclxudmFyIGNoZWNrYnJvd3NlciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcclxuXHRnZXRJbml0aWFsU3RhdGU6ZnVuY3Rpb24oKSB7XHJcblxyXG5cdFx0dmFyIG1pc3NpbmdGZWF0dXJlcz10aGlzLmdldE1pc3NpbmdGZWF0dXJlcygpO1xyXG5cdFx0cmV0dXJuIHtyZWFkeTpmYWxzZSwgbWlzc2luZzptaXNzaW5nRmVhdHVyZXN9O1xyXG5cdH0sXHJcblx0Z2V0TWlzc2luZ0ZlYXR1cmVzOmZ1bmN0aW9uKCkge1xyXG5cdFx0dmFyIGZlYXR1cmU9dGhpcy5wcm9wcy5mZWF0dXJlLnNwbGl0KFwiLFwiKTtcclxuXHRcdHZhciBzdGF0dXM9W107XHJcblx0XHRmZWF0dXJlLm1hcChmdW5jdGlvbihmKXtcclxuXHRcdFx0dmFyIGNoZWNrZXI9ZmVhdHVyZWNoZWNrc1tmXTtcclxuXHRcdFx0aWYgKGNoZWNrZXIpIGNoZWNrZXI9Y2hlY2tlcigpO1xyXG5cdFx0XHRzdGF0dXMucHVzaChbZixjaGVja2VyXSk7XHJcblx0XHR9KTtcclxuXHRcdHJldHVybiBzdGF0dXMuZmlsdGVyKGZ1bmN0aW9uKGYpe3JldHVybiAhZlsxXX0pO1xyXG5cdH0sXHJcblx0ZG93bmxvYWRicm93c2VyOmZ1bmN0aW9uKCkge1xyXG5cdFx0d2luZG93LmxvY2F0aW9uPVwiaHR0cHM6Ly93d3cuZ29vZ2xlLmNvbS9jaHJvbWUvXCJcclxuXHR9LFxyXG5cdHJlbmRlck1pc3Npbmc6ZnVuY3Rpb24oKSB7XHJcblx0XHR2YXIgc2hvd01pc3Npbmc9ZnVuY3Rpb24obSkge1xyXG5cdFx0XHRyZXR1cm4gRShcImRpdlwiLCBudWxsLCBtKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiAoXHJcblx0XHQgRShcImRpdlwiLCB7cmVmOiBcImRpYWxvZzFcIiwgY2xhc3NOYW1lOiBcIm1vZGFsIGZhZGVcIiwgXCJkYXRhLWJhY2tkcm9wXCI6IFwic3RhdGljXCJ9LCBcclxuXHRcdCAgICBFKFwiZGl2XCIsIHtjbGFzc05hbWU6IFwibW9kYWwtZGlhbG9nXCJ9LCBcclxuXHRcdCAgICAgIEUoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJtb2RhbC1jb250ZW50XCJ9LCBcclxuXHRcdCAgICAgICAgRShcImRpdlwiLCB7Y2xhc3NOYW1lOiBcIm1vZGFsLWhlYWRlclwifSwgXHJcblx0XHQgICAgICAgICAgRShcImJ1dHRvblwiLCB7dHlwZTogXCJidXR0b25cIiwgY2xhc3NOYW1lOiBcImNsb3NlXCIsIFwiZGF0YS1kaXNtaXNzXCI6IFwibW9kYWxcIiwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIn0sIFwiw5dcIiksIFxyXG5cdFx0ICAgICAgICAgIEUoXCJoNFwiLCB7Y2xhc3NOYW1lOiBcIm1vZGFsLXRpdGxlXCJ9LCBcIkJyb3dzZXIgQ2hlY2tcIilcclxuXHRcdCAgICAgICAgKSwgXHJcblx0XHQgICAgICAgIEUoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJtb2RhbC1ib2R5XCJ9LCBcclxuXHRcdCAgICAgICAgICBFKFwicFwiLCBudWxsLCBcIlNvcnJ5IGJ1dCB0aGUgZm9sbG93aW5nIGZlYXR1cmUgaXMgbWlzc2luZ1wiKSwgXHJcblx0XHQgICAgICAgICAgdGhpcy5zdGF0ZS5taXNzaW5nLm1hcChzaG93TWlzc2luZylcclxuXHRcdCAgICAgICAgKSwgXHJcblx0XHQgICAgICAgIEUoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJtb2RhbC1mb290ZXJcIn0sIFxyXG5cdFx0ICAgICAgICAgIEUoXCJidXR0b25cIiwge29uQ2xpY2s6IHRoaXMuZG93bmxvYWRicm93c2VyLCB0eXBlOiBcImJ1dHRvblwiLCBjbGFzc05hbWU6IFwiYnRuIGJ0bi1wcmltYXJ5XCJ9LCBcIkRvd25sb2FkIEdvb2dsZSBDaHJvbWVcIilcclxuXHRcdCAgICAgICAgKVxyXG5cdFx0ICAgICAgKVxyXG5cdFx0ICAgIClcclxuXHRcdCAgKVxyXG5cdFx0ICk7XHJcblx0fSxcclxuXHRyZW5kZXJSZWFkeTpmdW5jdGlvbigpIHtcclxuXHRcdHJldHVybiBFKFwic3BhblwiLCBudWxsLCBcImJyb3dzZXIgb2tcIilcclxuXHR9LFxyXG5cdHJlbmRlcjpmdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuICAodGhpcy5zdGF0ZS5taXNzaW5nLmxlbmd0aCk/dGhpcy5yZW5kZXJNaXNzaW5nKCk6dGhpcy5yZW5kZXJSZWFkeSgpO1xyXG5cdH0sXHJcblx0Y29tcG9uZW50RGlkTW91bnQ6ZnVuY3Rpb24oKSB7XHJcblx0XHRpZiAoIXRoaXMuc3RhdGUubWlzc2luZy5sZW5ndGgpIHtcclxuXHRcdFx0dGhpcy5wcm9wcy5vblJlYWR5KCk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHQkKHRoaXMucmVmcy5kaWFsb2cxLmdldERPTU5vZGUoKSkubW9kYWwoJ3Nob3cnKTtcclxuXHRcdH1cclxuXHR9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHM9Y2hlY2ticm93c2VyOyIsIlxyXG52YXIgdXNlckNhbmNlbD1mYWxzZTtcclxudmFyIGZpbGVzPVtdO1xyXG52YXIgdG90YWxEb3dubG9hZEJ5dGU9MDtcclxudmFyIHRhcmdldFBhdGg9XCJcIjtcclxudmFyIHRlbXBQYXRoPVwiXCI7XHJcbnZhciBuZmlsZT0wO1xyXG52YXIgYmFzZXVybD1cIlwiO1xyXG52YXIgcmVzdWx0PVwiXCI7XHJcbnZhciBkb3dubG9hZGluZz1mYWxzZTtcclxudmFyIHN0YXJ0RG93bmxvYWQ9ZnVuY3Rpb24oZGJpZCxfYmFzZXVybCxfZmlsZXMpIHsgLy9yZXR1cm4gZG93bmxvYWQgaWRcclxuXHR2YXIgZnMgICAgID0gcmVxdWlyZShcImZzXCIpO1xyXG5cdHZhciBwYXRoICAgPSByZXF1aXJlKFwicGF0aFwiKTtcclxuXHJcblx0XHJcblx0ZmlsZXM9X2ZpbGVzLnNwbGl0KFwiXFx1ZmZmZlwiKTtcclxuXHRpZiAoZG93bmxvYWRpbmcpIHJldHVybiBmYWxzZTsgLy9vbmx5IG9uZSBzZXNzaW9uXHJcblx0dXNlckNhbmNlbD1mYWxzZTtcclxuXHR0b3RhbERvd25sb2FkQnl0ZT0wO1xyXG5cdG5leHRGaWxlKCk7XHJcblx0ZG93bmxvYWRpbmc9dHJ1ZTtcclxuXHRiYXNldXJsPV9iYXNldXJsO1xyXG5cdGlmIChiYXNldXJsW2Jhc2V1cmwubGVuZ3RoLTFdIT0nLycpYmFzZXVybCs9Jy8nO1xyXG5cdHRhcmdldFBhdGg9a3NhbmFnYXAucm9vdFBhdGgrZGJpZCsnLyc7XHJcblx0dGVtcFBhdGg9a3NhbmFnYXAucm9vdFBhdGgrXCIudG1wL1wiO1xyXG5cdHJlc3VsdD1cIlwiO1xyXG5cdHJldHVybiB0cnVlO1xyXG59XHJcblxyXG52YXIgbmV4dEZpbGU9ZnVuY3Rpb24oKSB7XHJcblx0c2V0VGltZW91dChmdW5jdGlvbigpe1xyXG5cdFx0aWYgKG5maWxlPT1maWxlcy5sZW5ndGgpIHtcclxuXHRcdFx0bmZpbGUrKztcclxuXHRcdFx0ZW5kRG93bmxvYWQoKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGRvd25sb2FkRmlsZShuZmlsZSsrKTtcdFxyXG5cdFx0fVxyXG5cdH0sMTAwKTtcclxufVxyXG5cclxudmFyIGRvd25sb2FkRmlsZT1mdW5jdGlvbihuZmlsZSkge1xyXG5cdHZhciB1cmw9YmFzZXVybCtmaWxlc1tuZmlsZV07XHJcblx0dmFyIHRtcGZpbGVuYW1lPXRlbXBQYXRoK2ZpbGVzW25maWxlXTtcclxuXHR2YXIgbWtkaXJwID0gcmVxdWlyZShcIi4vbWtkaXJwXCIpO1xyXG5cdHZhciBmcyAgICAgPSByZXF1aXJlKFwiZnNcIik7XHJcblx0dmFyIGh0dHAgICA9IHJlcXVpcmUoXCJodHRwXCIpO1xyXG5cclxuXHRta2RpcnAuc3luYyhwYXRoLmRpcm5hbWUodG1wZmlsZW5hbWUpKTtcclxuXHR2YXIgd3JpdGVTdHJlYW0gPSBmcy5jcmVhdGVXcml0ZVN0cmVhbSh0bXBmaWxlbmFtZSk7XHJcblx0dmFyIGRhdGFsZW5ndGg9MDtcclxuXHR2YXIgcmVxdWVzdCA9IGh0dHAuZ2V0KHVybCwgZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuXHRcdHJlc3BvbnNlLm9uKCdkYXRhJyxmdW5jdGlvbihjaHVuayl7XHJcblx0XHRcdHdyaXRlU3RyZWFtLndyaXRlKGNodW5rKTtcclxuXHRcdFx0dG90YWxEb3dubG9hZEJ5dGUrPWNodW5rLmxlbmd0aDtcclxuXHRcdFx0aWYgKHVzZXJDYW5jZWwpIHtcclxuXHRcdFx0XHR3cml0ZVN0cmVhbS5lbmQoKTtcclxuXHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7bmV4dEZpbGUoKTt9LDEwMCk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdFx0cmVzcG9uc2Uub24oXCJlbmRcIixmdW5jdGlvbigpIHtcclxuXHRcdFx0d3JpdGVTdHJlYW0uZW5kKCk7XHJcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKXtuZXh0RmlsZSgpO30sMTAwKTtcclxuXHRcdH0pO1xyXG5cdH0pO1xyXG59XHJcblxyXG52YXIgY2FuY2VsRG93bmxvYWQ9ZnVuY3Rpb24oKSB7XHJcblx0dXNlckNhbmNlbD10cnVlO1xyXG5cdGVuZERvd25sb2FkKCk7XHJcbn1cclxudmFyIHZlcmlmeT1mdW5jdGlvbigpIHtcclxuXHRyZXR1cm4gdHJ1ZTtcclxufVxyXG52YXIgZW5kRG93bmxvYWQ9ZnVuY3Rpb24oKSB7XHJcblx0bmZpbGU9ZmlsZXMubGVuZ3RoKzE7Ly9zdG9wXHJcblx0cmVzdWx0PVwiY2FuY2VsbGVkXCI7XHJcblx0ZG93bmxvYWRpbmc9ZmFsc2U7XHJcblx0aWYgKHVzZXJDYW5jZWwpIHJldHVybjtcclxuXHR2YXIgZnMgICAgID0gcmVxdWlyZShcImZzXCIpO1xyXG5cdHZhciBta2RpcnAgPSByZXF1aXJlKFwiLi9ta2RpcnBcIik7XHJcblxyXG5cdGZvciAodmFyIGk9MDtpPGZpbGVzLmxlbmd0aDtpKyspIHtcclxuXHRcdHZhciB0YXJnZXRmaWxlbmFtZT10YXJnZXRQYXRoK2ZpbGVzW2ldO1xyXG5cdFx0dmFyIHRtcGZpbGVuYW1lICAgPXRlbXBQYXRoK2ZpbGVzW2ldO1xyXG5cdFx0bWtkaXJwLnN5bmMocGF0aC5kaXJuYW1lKHRhcmdldGZpbGVuYW1lKSk7XHJcblx0XHRmcy5yZW5hbWVTeW5jKHRtcGZpbGVuYW1lLHRhcmdldGZpbGVuYW1lKTtcclxuXHR9XHJcblx0aWYgKHZlcmlmeSgpKSB7XHJcblx0XHRyZXN1bHQ9XCJzdWNjZXNzXCI7XHJcblx0fSBlbHNlIHtcclxuXHRcdHJlc3VsdD1cImVycm9yXCI7XHJcblx0fVxyXG59XHJcblxyXG52YXIgZG93bmxvYWRlZEJ5dGU9ZnVuY3Rpb24oKSB7XHJcblx0cmV0dXJuIHRvdGFsRG93bmxvYWRCeXRlO1xyXG59XHJcbnZhciBkb25lRG93bmxvYWQ9ZnVuY3Rpb24oKSB7XHJcblx0aWYgKG5maWxlPmZpbGVzLmxlbmd0aCkgcmV0dXJuIHJlc3VsdDtcclxuXHRlbHNlIHJldHVybiBcIlwiO1xyXG59XHJcbnZhciBkb3dubG9hZGluZ0ZpbGU9ZnVuY3Rpb24oKSB7XHJcblx0cmV0dXJuIG5maWxlLTE7XHJcbn1cclxuXHJcbnZhciBkb3dubG9hZGVyPXtzdGFydERvd25sb2FkOnN0YXJ0RG93bmxvYWQsIGRvd25sb2FkZWRCeXRlOmRvd25sb2FkZWRCeXRlLFxyXG5cdGRvd25sb2FkaW5nRmlsZTpkb3dubG9hZGluZ0ZpbGUsIGNhbmNlbERvd25sb2FkOmNhbmNlbERvd25sb2FkLGRvbmVEb3dubG9hZDpkb25lRG93bmxvYWR9O1xyXG5tb2R1bGUuZXhwb3J0cz1kb3dubG9hZGVyOyIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xyXG5cclxuLyogdG9kbyAsIG9wdGlvbmFsIGtkYiAqL1xyXG5cclxudmFyIEh0bWxGUz1yZXF1aXJlKFwiLi9odG1sZnNcIik7XHJcbnZhciBodG1sNWZzPXJlcXVpcmUoXCIuL2h0bWw1ZnNcIik7XHJcbnZhciBDaGVja0Jyb3dzZXI9cmVxdWlyZShcIi4vY2hlY2ticm93c2VyXCIpO1xyXG52YXIgRT1SZWFjdC5jcmVhdGVFbGVtZW50O1xyXG4gIFxyXG5cclxudmFyIEZpbGVMaXN0ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xyXG5cdGdldEluaXRpYWxTdGF0ZTpmdW5jdGlvbigpIHtcclxuXHRcdHJldHVybiB7ZG93bmxvYWRpbmc6ZmFsc2UscHJvZ3Jlc3M6MH07XHJcblx0fSxcclxuXHR1cGRhdGFibGU6ZnVuY3Rpb24oZikge1xyXG4gICAgICAgIHZhciBjbGFzc2VzPVwiYnRuIGJ0bi13YXJuaW5nXCI7XHJcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZG93bmxvYWRpbmcpIGNsYXNzZXMrPVwiIGRpc2FibGVkXCI7XHJcblx0XHRpZiAoZi5oYXNVcGRhdGUpIHJldHVybiAgIEUoXCJidXR0b25cIiwge2NsYXNzTmFtZTogY2xhc3NlcywgXHJcblx0XHRcdFwiZGF0YS1maWxlbmFtZVwiOiBmLmZpbGVuYW1lLCBcImRhdGEtdXJsXCI6IGYudXJsLCBcclxuXHQgICAgICAgICAgICBvbkNsaWNrOiB0aGlzLmRvd25sb2FkXHJcblx0ICAgICAgIH0sIFwiVXBkYXRlXCIpXHJcblx0XHRlbHNlIHJldHVybiBudWxsO1xyXG5cdH0sXHJcblx0c2hvd0xvY2FsOmZ1bmN0aW9uKGYpIHtcclxuICAgICAgICB2YXIgY2xhc3Nlcz1cImJ0biBidG4tZGFuZ2VyXCI7XHJcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZG93bmxvYWRpbmcpIGNsYXNzZXMrPVwiIGRpc2FibGVkXCI7XHJcblx0ICByZXR1cm4gRShcInRyXCIsIG51bGwsIEUoXCJ0ZFwiLCBudWxsLCBmLmZpbGVuYW1lKSwgXHJcblx0ICAgICAgRShcInRkXCIsIG51bGwpLCBcclxuXHQgICAgICBFKFwidGRcIiwge2NsYXNzTmFtZTogXCJwdWxsLXJpZ2h0XCJ9LCBcclxuXHQgICAgICB0aGlzLnVwZGF0YWJsZShmKSwgRShcImJ1dHRvblwiLCB7Y2xhc3NOYW1lOiBjbGFzc2VzLCBcclxuXHQgICAgICAgICAgICAgICBvbkNsaWNrOiB0aGlzLmRlbGV0ZUZpbGUsIFwiZGF0YS1maWxlbmFtZVwiOiBmLmZpbGVuYW1lfSwgXCJEZWxldGVcIilcclxuXHQgICAgICAgIFxyXG5cdCAgICAgIClcclxuXHQgIClcclxuXHR9LCAgXHJcblx0c2hvd1JlbW90ZTpmdW5jdGlvbihmKSB7IFxyXG5cdCAgdmFyIGNsYXNzZXM9XCJidG4gYnRuLXdhcm5pbmdcIjtcclxuXHQgIGlmICh0aGlzLnN0YXRlLmRvd25sb2FkaW5nKSBjbGFzc2VzKz1cIiBkaXNhYmxlZFwiO1xyXG5cdCAgcmV0dXJuIChFKFwidHJcIiwge1wiZGF0YS1pZFwiOiBmLmZpbGVuYW1lfSwgRShcInRkXCIsIG51bGwsIFxyXG5cdCAgICAgIGYuZmlsZW5hbWUpLCBcclxuXHQgICAgICBFKFwidGRcIiwgbnVsbCwgZi5kZXNjKSwgXHJcblx0ICAgICAgRShcInRkXCIsIG51bGwsIFxyXG5cdCAgICAgIEUoXCJzcGFuXCIsIHtcImRhdGEtZmlsZW5hbWVcIjogZi5maWxlbmFtZSwgXCJkYXRhLXVybFwiOiBmLnVybCwgXHJcblx0ICAgICAgICAgICAgY2xhc3NOYW1lOiBjbGFzc2VzLCBcclxuXHQgICAgICAgICAgICBvbkNsaWNrOiB0aGlzLmRvd25sb2FkfSwgXCJEb3dubG9hZFwiKVxyXG5cdCAgICAgIClcclxuXHQgICkpO1xyXG5cdH0sXHJcblx0c2hvd0ZpbGU6ZnVuY3Rpb24oZikge1xyXG5cdC8vXHRyZXR1cm4gPHNwYW4gZGF0YS1pZD17Zi5maWxlbmFtZX0+e2YudXJsfTwvc3Bhbj5cclxuXHRcdHJldHVybiAoZi5yZWFkeSk/dGhpcy5zaG93TG9jYWwoZik6dGhpcy5zaG93UmVtb3RlKGYpO1xyXG5cdH0sXHJcblx0cmVsb2FkRGlyOmZ1bmN0aW9uKCkge1xyXG5cdFx0dGhpcy5wcm9wcy5hY3Rpb24oXCJyZWxvYWRcIik7XHJcblx0fSxcclxuXHRkb3dubG9hZDpmdW5jdGlvbihlKSB7XHJcblx0XHR2YXIgdXJsPWUudGFyZ2V0LmRhdGFzZXRbXCJ1cmxcIl07XHJcblx0XHR2YXIgZmlsZW5hbWU9ZS50YXJnZXQuZGF0YXNldFtcImZpbGVuYW1lXCJdO1xyXG5cdFx0dGhpcy5zZXRTdGF0ZSh7ZG93bmxvYWRpbmc6dHJ1ZSxwcm9ncmVzczowLHVybDp1cmx9KTtcclxuXHRcdHRoaXMudXNlcmJyZWFrPWZhbHNlO1xyXG5cdFx0aHRtbDVmcy5kb3dubG9hZCh1cmwsZmlsZW5hbWUsZnVuY3Rpb24oKXtcclxuXHRcdFx0dGhpcy5yZWxvYWREaXIoKTtcclxuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7ZG93bmxvYWRpbmc6ZmFsc2UscHJvZ3Jlc3M6MX0pO1xyXG5cdFx0XHR9LGZ1bmN0aW9uKHByb2dyZXNzLHRvdGFsKXtcclxuXHRcdFx0XHRpZiAocHJvZ3Jlc3M9PTApIHtcclxuXHRcdFx0XHRcdHRoaXMuc2V0U3RhdGUoe21lc3NhZ2U6XCJ0b3RhbCBcIit0b3RhbH0pXHJcblx0XHRcdCBcdH1cclxuXHRcdFx0IFx0dGhpcy5zZXRTdGF0ZSh7cHJvZ3Jlc3M6cHJvZ3Jlc3N9KTtcclxuXHRcdFx0IFx0Ly9pZiB1c2VyIHByZXNzIGFib3J0IHJldHVybiB0cnVlXHJcblx0XHRcdCBcdHJldHVybiB0aGlzLnVzZXJicmVhaztcclxuXHRcdFx0fVxyXG5cdFx0LHRoaXMpO1xyXG5cdH0sXHJcblx0ZGVsZXRlRmlsZTpmdW5jdGlvbiggZSkge1xyXG5cdFx0dmFyIGZpbGVuYW1lPWUudGFyZ2V0LmF0dHJpYnV0ZXNbXCJkYXRhLWZpbGVuYW1lXCJdLnZhbHVlO1xyXG5cdFx0dGhpcy5wcm9wcy5hY3Rpb24oXCJkZWxldGVcIixmaWxlbmFtZSk7XHJcblx0fSxcclxuXHRhbGxGaWxlc1JlYWR5OmZ1bmN0aW9uKGUpIHtcclxuXHRcdHJldHVybiB0aGlzLnByb3BzLmZpbGVzLmV2ZXJ5KGZ1bmN0aW9uKGYpeyByZXR1cm4gZi5yZWFkeX0pO1xyXG5cdH0sXHJcblx0ZGlzbWlzczpmdW5jdGlvbigpIHtcclxuXHRcdCQodGhpcy5yZWZzLmRpYWxvZzEuZ2V0RE9NTm9kZSgpKS5tb2RhbCgnaGlkZScpO1xyXG5cdFx0dGhpcy5wcm9wcy5hY3Rpb24oXCJkaXNtaXNzXCIpO1xyXG5cdH0sXHJcblx0YWJvcnRkb3dubG9hZDpmdW5jdGlvbigpIHtcclxuXHRcdHRoaXMudXNlcmJyZWFrPXRydWU7XHJcblx0fSxcclxuXHRzaG93UHJvZ3Jlc3M6ZnVuY3Rpb24oKSB7XHJcblx0ICAgICBpZiAodGhpcy5zdGF0ZS5kb3dubG9hZGluZykge1xyXG5cdCAgICAgIHZhciBwcm9ncmVzcz1NYXRoLnJvdW5kKHRoaXMuc3RhdGUucHJvZ3Jlc3MqMTAwKTtcclxuXHQgICAgICByZXR1cm4gKFxyXG5cdCAgICAgIFx0RShcImRpdlwiLCBudWxsLCBcclxuXHQgICAgICBcdFwiRG93bmxvYWRpbmcgZnJvbSBcIiwgdGhpcy5zdGF0ZS51cmwsIFxyXG5cdCAgICAgIEUoXCJkaXZcIiwge2tleTogXCJwcm9ncmVzc1wiLCBjbGFzc05hbWU6IFwicHJvZ3Jlc3MgY29sLW1kLThcIn0sIFxyXG5cdCAgICAgICAgICBFKFwiZGl2XCIsIHtjbGFzc05hbWU6IFwicHJvZ3Jlc3MtYmFyXCIsIHJvbGU6IFwicHJvZ3Jlc3NiYXJcIiwgXHJcblx0ICAgICAgICAgICAgICBcImFyaWEtdmFsdWVub3dcIjogcHJvZ3Jlc3MsIFwiYXJpYS12YWx1ZW1pblwiOiBcIjBcIiwgXHJcblx0ICAgICAgICAgICAgICBcImFyaWEtdmFsdWVtYXhcIjogXCIxMDBcIiwgc3R5bGU6IHt3aWR0aDogcHJvZ3Jlc3MrXCIlXCJ9fSwgXHJcblx0ICAgICAgICAgICAgcHJvZ3Jlc3MsIFwiJVwiXHJcblx0ICAgICAgICAgIClcclxuXHQgICAgICAgICksIFxyXG5cdCAgICAgICAgRShcImJ1dHRvblwiLCB7b25DbGljazogdGhpcy5hYm9ydGRvd25sb2FkLCBcclxuXHQgICAgICAgIFx0Y2xhc3NOYW1lOiBcImJ0biBidG4tZGFuZ2VyIGNvbC1tZC00XCJ9LCBcIkFib3J0XCIpXHJcblx0ICAgICAgICApXHJcblx0ICAgICAgICApO1xyXG5cdCAgICAgIH0gZWxzZSB7XHJcblx0ICAgICAgXHRcdGlmICggdGhpcy5hbGxGaWxlc1JlYWR5KCkgKSB7XHJcblx0ICAgICAgXHRcdFx0cmV0dXJuIEUoXCJidXR0b25cIiwge29uQ2xpY2s6IHRoaXMuZGlzbWlzcywgY2xhc3NOYW1lOiBcImJ0biBidG4tc3VjY2Vzc1wifSwgXCJPa1wiKVxyXG5cdCAgICAgIFx0XHR9IGVsc2UgcmV0dXJuIG51bGw7XHJcblx0ICAgICAgXHRcdFxyXG5cdCAgICAgIH1cclxuXHR9LFxyXG5cdHNob3dVc2FnZTpmdW5jdGlvbigpIHtcclxuXHRcdHZhciBwZXJjZW50PXRoaXMucHJvcHMucmVtYWluUGVyY2VudDtcclxuICAgICAgICAgICByZXR1cm4gKEUoXCJkaXZcIiwgbnVsbCwgRShcInNwYW5cIiwge2NsYXNzTmFtZTogXCJwdWxsLWxlZnRcIn0sIFwiVXNhZ2U6XCIpLCBFKFwiZGl2XCIsIHtjbGFzc05hbWU6IFwicHJvZ3Jlc3NcIn0sIFxyXG5cdFx0ICBFKFwiZGl2XCIsIHtjbGFzc05hbWU6IFwicHJvZ3Jlc3MtYmFyIHByb2dyZXNzLWJhci1zdWNjZXNzIHByb2dyZXNzLWJhci1zdHJpcGVkXCIsIHJvbGU6IFwicHJvZ3Jlc3NiYXJcIiwgc3R5bGU6IHt3aWR0aDogcGVyY2VudCtcIiVcIn19LCBcclxuXHRcdCAgICBcdHBlcmNlbnQrXCIlXCJcclxuXHRcdCAgKVxyXG5cdFx0KSkpO1xyXG5cdH0sXHJcblx0cmVuZGVyOmZ1bmN0aW9uKCkge1xyXG5cdCAgXHRyZXR1cm4gKFxyXG5cdFx0RShcImRpdlwiLCB7cmVmOiBcImRpYWxvZzFcIiwgY2xhc3NOYW1lOiBcIm1vZGFsIGZhZGVcIiwgXCJkYXRhLWJhY2tkcm9wXCI6IFwic3RhdGljXCJ9LCBcclxuXHRcdCAgICBFKFwiZGl2XCIsIHtjbGFzc05hbWU6IFwibW9kYWwtZGlhbG9nXCJ9LCBcclxuXHRcdCAgICAgIEUoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJtb2RhbC1jb250ZW50XCJ9LCBcclxuXHRcdCAgICAgICAgRShcImRpdlwiLCB7Y2xhc3NOYW1lOiBcIm1vZGFsLWhlYWRlclwifSwgXHJcblx0XHQgICAgICAgICAgRShcImg0XCIsIHtjbGFzc05hbWU6IFwibW9kYWwtdGl0bGVcIn0sIFwiRmlsZSBJbnN0YWxsZXJcIilcclxuXHRcdCAgICAgICAgKSwgXHJcblx0XHQgICAgICAgIEUoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJtb2RhbC1ib2R5XCJ9LCBcclxuXHRcdCAgICAgICAgXHRFKFwidGFibGVcIiwge2NsYXNzTmFtZTogXCJ0YWJsZVwifSwgXHJcblx0XHQgICAgICAgIFx0RShcInRib2R5XCIsIG51bGwsIFxyXG5cdFx0ICAgICAgICAgIFx0dGhpcy5wcm9wcy5maWxlcy5tYXAodGhpcy5zaG93RmlsZSlcclxuXHRcdCAgICAgICAgICBcdClcclxuXHRcdCAgICAgICAgICApXHJcblx0XHQgICAgICAgICksIFxyXG5cdFx0ICAgICAgICBFKFwiZGl2XCIsIHtjbGFzc05hbWU6IFwibW9kYWwtZm9vdGVyXCJ9LCBcclxuXHRcdCAgICAgICAgXHR0aGlzLnNob3dVc2FnZSgpLCBcclxuXHRcdCAgICAgICAgICAgdGhpcy5zaG93UHJvZ3Jlc3MoKVxyXG5cdFx0ICAgICAgICApXHJcblx0XHQgICAgICApXHJcblx0XHQgICAgKVxyXG5cdFx0ICApXHJcblx0XHQpO1xyXG5cdH0sXHRcclxuXHRjb21wb25lbnREaWRNb3VudDpmdW5jdGlvbigpIHtcclxuXHRcdCQodGhpcy5yZWZzLmRpYWxvZzEuZ2V0RE9NTm9kZSgpKS5tb2RhbCgnc2hvdycpO1xyXG5cdH1cclxufSk7XHJcbi8qVE9ETyBrZGIgY2hlY2sgdmVyc2lvbiovXHJcbnZhciBGaWxlbWFuYWdlciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcclxuXHRnZXRJbml0aWFsU3RhdGU6ZnVuY3Rpb24oKSB7XHJcblx0XHR2YXIgcXVvdGE9dGhpcy5nZXRRdW90YSgpO1xyXG5cdFx0cmV0dXJuIHticm93c2VyUmVhZHk6ZmFsc2Usbm91cGRhdGU6dHJ1ZSxcdHJlcXVlc3RRdW90YTpxdW90YSxyZW1haW46MH07XHJcblx0fSxcclxuXHRnZXRRdW90YTpmdW5jdGlvbigpIHtcclxuXHRcdHZhciBxPXRoaXMucHJvcHMucXVvdGF8fFwiMTI4TVwiO1xyXG5cdFx0dmFyIHVuaXQ9cVtxLmxlbmd0aC0xXTtcclxuXHRcdHZhciB0aW1lcz0xO1xyXG5cdFx0aWYgKHVuaXQ9PVwiTVwiKSB0aW1lcz0xMDI0KjEwMjQ7XHJcblx0XHRlbHNlIGlmICh1bml0PVwiS1wiKSB0aW1lcz0xMDI0O1xyXG5cdFx0cmV0dXJuIHBhcnNlSW50KHEpICogdGltZXM7XHJcblx0fSxcclxuXHRtaXNzaW5nS2RiOmZ1bmN0aW9uKCkge1xyXG5cdFx0aWYgKGtzYW5hZ2FwLnBsYXRmb3JtIT1cImNocm9tZVwiKSByZXR1cm4gW107XHJcblx0XHR2YXIgbWlzc2luZz10aGlzLnByb3BzLm5lZWRlZC5maWx0ZXIoZnVuY3Rpb24oa2RiKXtcclxuXHRcdFx0Zm9yICh2YXIgaSBpbiBodG1sNWZzLmZpbGVzKSB7XHJcblx0XHRcdFx0aWYgKGh0bWw1ZnMuZmlsZXNbaV1bMF09PWtkYi5maWxlbmFtZSkgcmV0dXJuIGZhbHNlO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fSx0aGlzKTtcclxuXHRcdHJldHVybiBtaXNzaW5nO1xyXG5cdH0sXHJcblx0Z2V0UmVtb3RlVXJsOmZ1bmN0aW9uKGZuKSB7XHJcblx0XHR2YXIgZj10aGlzLnByb3BzLm5lZWRlZC5maWx0ZXIoZnVuY3Rpb24oZil7cmV0dXJuIGYuZmlsZW5hbWU9PWZufSk7XHJcblx0XHRpZiAoZi5sZW5ndGggKSByZXR1cm4gZlswXS51cmw7XHJcblx0fSxcclxuXHRnZW5GaWxlTGlzdDpmdW5jdGlvbihleGlzdGluZyxtaXNzaW5nKXtcclxuXHRcdHZhciBvdXQ9W107XHJcblx0XHRmb3IgKHZhciBpIGluIGV4aXN0aW5nKSB7XHJcblx0XHRcdHZhciB1cmw9dGhpcy5nZXRSZW1vdGVVcmwoZXhpc3RpbmdbaV1bMF0pO1xyXG5cdFx0XHRvdXQucHVzaCh7ZmlsZW5hbWU6ZXhpc3RpbmdbaV1bMF0sIHVybCA6dXJsLCByZWFkeTp0cnVlIH0pO1xyXG5cdFx0fVxyXG5cdFx0Zm9yICh2YXIgaSBpbiBtaXNzaW5nKSB7XHJcblx0XHRcdG91dC5wdXNoKG1pc3NpbmdbaV0pO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIG91dDtcclxuXHR9LFxyXG5cdHJlbG9hZDpmdW5jdGlvbigpIHtcclxuXHRcdGh0bWw1ZnMucmVhZGRpcihmdW5jdGlvbihmaWxlcyl7XHJcbiAgXHRcdFx0dGhpcy5zZXRTdGF0ZSh7ZmlsZXM6dGhpcy5nZW5GaWxlTGlzdChmaWxlcyx0aGlzLm1pc3NpbmdLZGIoKSl9KTtcclxuICBcdFx0fSx0aGlzKTtcclxuXHQgfSxcclxuXHRkZWxldGVGaWxlOmZ1bmN0aW9uKGZuKSB7XHJcblx0ICBodG1sNWZzLnJtKGZuLGZ1bmN0aW9uKCl7XHJcblx0ICBcdHRoaXMucmVsb2FkKCk7XHJcblx0ICB9LHRoaXMpO1xyXG5cdH0sXHJcblx0b25RdW90ZU9rOmZ1bmN0aW9uKHF1b3RhLHVzYWdlKSB7XHJcblx0XHRpZiAoa3NhbmFnYXAucGxhdGZvcm0hPVwiY2hyb21lXCIpIHtcclxuXHRcdFx0Ly9jb25zb2xlLmxvZyhcIm9ucXVvdGVva1wiKTtcclxuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7bm91cGRhdGU6dHJ1ZSxtaXNzaW5nOltdLGZpbGVzOltdLGF1dG9jbG9zZTp0cnVlXHJcblx0XHRcdFx0LHF1b3RhOnF1b3RhLHJlbWFpbjpxdW90YS11c2FnZSx1c2FnZTp1c2FnZX0pO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHQvL2NvbnNvbGUubG9nKFwicXVvdGUgb2tcIik7XHJcblx0XHR2YXIgZmlsZXM9dGhpcy5nZW5GaWxlTGlzdChodG1sNWZzLmZpbGVzLHRoaXMubWlzc2luZ0tkYigpKTtcclxuXHRcdHZhciB0aGF0PXRoaXM7XHJcblx0XHR0aGF0LmNoZWNrSWZVcGRhdGUoZmlsZXMsZnVuY3Rpb24oaGFzdXBkYXRlKSB7XHJcblx0XHRcdHZhciBtaXNzaW5nPXRoaXMubWlzc2luZ0tkYigpO1xyXG5cdFx0XHR2YXIgYXV0b2Nsb3NlPXRoaXMucHJvcHMuYXV0b2Nsb3NlO1xyXG5cdFx0XHRpZiAobWlzc2luZy5sZW5ndGgpIGF1dG9jbG9zZT1mYWxzZTtcclxuXHRcdFx0dGhhdC5zZXRTdGF0ZSh7YXV0b2Nsb3NlOmF1dG9jbG9zZSxcclxuXHRcdFx0XHRxdW90YTpxdW90YSx1c2FnZTp1c2FnZSxmaWxlczpmaWxlcyxcclxuXHRcdFx0XHRtaXNzaW5nOm1pc3NpbmcsXHJcblx0XHRcdFx0bm91cGRhdGU6IWhhc3VwZGF0ZSxcclxuXHRcdFx0XHRyZW1haW46cXVvdGEtdXNhZ2V9KTtcclxuXHRcdH0pO1xyXG5cdH0sICBcclxuXHRvbkJyb3dzZXJPazpmdW5jdGlvbigpIHtcclxuXHQgIHRoaXMudG90YWxEb3dubG9hZFNpemUoKTtcclxuXHR9LCBcclxuXHRkaXNtaXNzOmZ1bmN0aW9uKCkge1xyXG5cdFx0dGhpcy5wcm9wcy5vblJlYWR5KHRoaXMuc3RhdGUudXNhZ2UsdGhpcy5zdGF0ZS5xdW90YSk7XHJcblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcblx0XHRcdHZhciBtb2RhbGluPSQoXCIubW9kYWwuaW5cIik7XHJcblx0XHRcdGlmIChtb2RhbGluLm1vZGFsKSBtb2RhbGluLm1vZGFsKCdoaWRlJyk7XHJcblx0XHR9LDUwMCk7XHJcblx0fSwgXHJcblx0dG90YWxEb3dubG9hZFNpemU6ZnVuY3Rpb24oKSB7XHJcblx0XHR2YXIgZmlsZXM9dGhpcy5taXNzaW5nS2RiKCk7XHJcblx0XHR2YXIgdGFza3F1ZXVlPVtdLHRvdGFsc2l6ZT0wO1xyXG5cdFx0Zm9yICh2YXIgaT0wO2k8ZmlsZXMubGVuZ3RoO2krKykge1xyXG5cdFx0XHR0YXNrcXVldWUucHVzaChcclxuXHRcdFx0XHQoZnVuY3Rpb24oaWR4KXtcclxuXHRcdFx0XHRcdHJldHVybiAoZnVuY3Rpb24oZGF0YSl7XHJcblx0XHRcdFx0XHRcdGlmICghKHR5cGVvZiBkYXRhPT0nb2JqZWN0JyAmJiBkYXRhLl9fZW1wdHkpKSB0b3RhbHNpemUrPWRhdGE7XHJcblx0XHRcdFx0XHRcdGh0bWw1ZnMuZ2V0RG93bmxvYWRTaXplKGZpbGVzW2lkeF0udXJsLHRhc2txdWV1ZS5zaGlmdCgpKTtcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH0pKGkpXHJcblx0XHRcdCk7XHJcblx0XHR9XHJcblx0XHR2YXIgdGhhdD10aGlzO1xyXG5cdFx0dGFza3F1ZXVlLnB1c2goZnVuY3Rpb24oZGF0YSl7XHRcclxuXHRcdFx0dG90YWxzaXplKz1kYXRhO1xyXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7dGhhdC5zZXRTdGF0ZSh7cmVxdWlyZVNwYWNlOnRvdGFsc2l6ZSxicm93c2VyUmVhZHk6dHJ1ZX0pfSwwKTtcclxuXHRcdH0pO1xyXG5cdFx0dGFza3F1ZXVlLnNoaWZ0KCkoe19fZW1wdHk6dHJ1ZX0pO1xyXG5cdH0sXHJcblx0Y2hlY2tJZlVwZGF0ZTpmdW5jdGlvbihmaWxlcyxjYikge1xyXG5cdFx0dmFyIHRhc2txdWV1ZT1bXTtcclxuXHRcdGZvciAodmFyIGk9MDtpPGZpbGVzLmxlbmd0aDtpKyspIHtcclxuXHRcdFx0dGFza3F1ZXVlLnB1c2goXHJcblx0XHRcdFx0KGZ1bmN0aW9uKGlkeCl7XHJcblx0XHRcdFx0XHRyZXR1cm4gKGZ1bmN0aW9uKGRhdGEpe1xyXG5cdFx0XHRcdFx0XHRpZiAoISh0eXBlb2YgZGF0YT09J29iamVjdCcgJiYgZGF0YS5fX2VtcHR5KSkgZmlsZXNbaWR4LTFdLmhhc1VwZGF0ZT1kYXRhO1xyXG5cdFx0XHRcdFx0XHRodG1sNWZzLmNoZWNrVXBkYXRlKGZpbGVzW2lkeF0udXJsLGZpbGVzW2lkeF0uZmlsZW5hbWUsdGFza3F1ZXVlLnNoaWZ0KCkpO1xyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0fSkoaSlcclxuXHRcdFx0KTtcclxuXHRcdH1cclxuXHRcdHZhciB0aGF0PXRoaXM7XHJcblx0XHR0YXNrcXVldWUucHVzaChmdW5jdGlvbihkYXRhKXtcdFxyXG5cdFx0XHRmaWxlc1tmaWxlcy5sZW5ndGgtMV0uaGFzVXBkYXRlPWRhdGE7XHJcblx0XHRcdHZhciBoYXN1cGRhdGU9ZmlsZXMuc29tZShmdW5jdGlvbihmKXtyZXR1cm4gZi5oYXNVcGRhdGV9KTtcclxuXHRcdFx0aWYgKGNiKSBjYi5hcHBseSh0aGF0LFtoYXN1cGRhdGVdKTtcclxuXHRcdH0pO1xyXG5cdFx0dGFza3F1ZXVlLnNoaWZ0KCkoe19fZW1wdHk6dHJ1ZX0pO1xyXG5cdH0sXHJcblx0cmVuZGVyOmZ1bmN0aW9uKCl7XHJcbiAgICBcdFx0aWYgKCF0aGlzLnN0YXRlLmJyb3dzZXJSZWFkeSkgeyAgIFxyXG4gICAgICBcdFx0XHRyZXR1cm4gRShDaGVja0Jyb3dzZXIsIHtmZWF0dXJlOiBcImZzXCIsIG9uUmVhZHk6IHRoaXMub25Ccm93c2VyT2t9KVxyXG4gICAgXHRcdH0gaWYgKCF0aGlzLnN0YXRlLnF1b3RhIHx8IHRoaXMuc3RhdGUucmVtYWluPHRoaXMuc3RhdGUucmVxdWlyZVNwYWNlKSB7ICBcclxuICAgIFx0XHRcdHZhciBxdW90YT10aGlzLnN0YXRlLnJlcXVlc3RRdW90YTtcclxuICAgIFx0XHRcdGlmICh0aGlzLnN0YXRlLnVzYWdlK3RoaXMuc3RhdGUucmVxdWlyZVNwYWNlPnF1b3RhKSB7XHJcbiAgICBcdFx0XHRcdHF1b3RhPSh0aGlzLnN0YXRlLnVzYWdlK3RoaXMuc3RhdGUucmVxdWlyZVNwYWNlKSoxLjU7XHJcbiAgICBcdFx0XHR9XHJcbiAgICAgIFx0XHRcdHJldHVybiBFKEh0bWxGUywge3F1b3RhOiBxdW90YSwgYXV0b2Nsb3NlOiBcInRydWVcIiwgb25SZWFkeTogdGhpcy5vblF1b3RlT2t9KVxyXG4gICAgICBcdFx0fSBlbHNlIHtcclxuXHRcdFx0aWYgKCF0aGlzLnN0YXRlLm5vdXBkYXRlIHx8IHRoaXMubWlzc2luZ0tkYigpLmxlbmd0aCB8fCAhdGhpcy5zdGF0ZS5hdXRvY2xvc2UpIHtcclxuXHRcdFx0XHR2YXIgcmVtYWluPU1hdGgucm91bmQoKHRoaXMuc3RhdGUudXNhZ2UvdGhpcy5zdGF0ZS5xdW90YSkqMTAwKTtcdFx0XHRcdFxyXG5cdFx0XHRcdHJldHVybiBFKEZpbGVMaXN0LCB7YWN0aW9uOiB0aGlzLmFjdGlvbiwgZmlsZXM6IHRoaXMuc3RhdGUuZmlsZXMsIHJlbWFpblBlcmNlbnQ6IHJlbWFpbn0pXHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0c2V0VGltZW91dCggdGhpcy5kaXNtaXNzICwwKTtcclxuXHRcdFx0XHRyZXR1cm4gRShcInNwYW5cIiwgbnVsbCwgXCJTdWNjZXNzXCIpO1xyXG5cdFx0XHR9XHJcbiAgICAgIFx0XHR9XHJcblx0fSxcclxuXHRhY3Rpb246ZnVuY3Rpb24oKSB7XHJcblx0ICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XHJcblx0ICB2YXIgdHlwZT1hcmdzLnNoaWZ0KCk7XHJcblx0ICB2YXIgcmVzPW51bGwsIHRoYXQ9dGhpcztcclxuXHQgIGlmICh0eXBlPT1cImRlbGV0ZVwiKSB7XHJcblx0ICAgIHRoaXMuZGVsZXRlRmlsZShhcmdzWzBdKTtcclxuXHQgIH0gIGVsc2UgaWYgKHR5cGU9PVwicmVsb2FkXCIpIHtcclxuXHQgIFx0dGhpcy5yZWxvYWQoKTtcclxuXHQgIH0gZWxzZSBpZiAodHlwZT09XCJkaXNtaXNzXCIpIHtcclxuXHQgIFx0dGhpcy5kaXNtaXNzKCk7XHJcblx0ICB9XHJcblx0fVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzPUZpbGVtYW5hZ2VyOyIsIi8qIGVtdWxhdGUgZmlsZXN5c3RlbSBvbiBodG1sNSBicm93c2VyICovXHJcbnZhciBnZXRfaGVhZD1mdW5jdGlvbih1cmwsZmllbGQsY2Ipe1xyXG5cdHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuXHR4aHIub3BlbihcIkhFQURcIiwgdXJsLCB0cnVlKTtcclxuXHR4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdGlmICh0aGlzLnJlYWR5U3RhdGUgPT0gdGhpcy5ET05FKSB7XHJcblx0XHRcdFx0Y2IoeGhyLmdldFJlc3BvbnNlSGVhZGVyKGZpZWxkKSk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0aWYgKHRoaXMuc3RhdHVzIT09MjAwJiZ0aGlzLnN0YXR1cyE9PTIwNikge1xyXG5cdFx0XHRcdFx0Y2IoXCJcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IFxyXG5cdH07XHJcblx0eGhyLnNlbmQoKTtcdFxyXG59XHJcbnZhciBnZXRfZGF0ZT1mdW5jdGlvbih1cmwsY2IpIHtcclxuXHRnZXRfaGVhZCh1cmwsXCJMYXN0LU1vZGlmaWVkXCIsZnVuY3Rpb24odmFsdWUpe1xyXG5cdFx0Y2IodmFsdWUpO1xyXG5cdH0pO1xyXG59XHJcbnZhciBnZXRfc2l6ZT1mdW5jdGlvbih1cmwsIGNiKSB7XHJcblx0Z2V0X2hlYWQodXJsLFwiQ29udGVudC1MZW5ndGhcIixmdW5jdGlvbih2YWx1ZSl7XHJcblx0XHRjYihwYXJzZUludCh2YWx1ZSkpO1xyXG5cdH0pO1xyXG59O1xyXG52YXIgY2hlY2tVcGRhdGU9ZnVuY3Rpb24odXJsLGZuLGNiKSB7XHJcblx0aWYgKCF1cmwpIHtcclxuXHRcdGNiKGZhbHNlKTtcclxuXHRcdHJldHVybjtcclxuXHR9XHJcblx0Z2V0X2RhdGUodXJsLGZ1bmN0aW9uKGQpe1xyXG5cdFx0QVBJLmZzLnJvb3QuZ2V0RmlsZShmbiwge2NyZWF0ZTogZmFsc2UsIGV4Y2x1c2l2ZTogZmFsc2V9LCBmdW5jdGlvbihmaWxlRW50cnkpIHtcclxuXHRcdFx0ZmlsZUVudHJ5LmdldE1ldGFkYXRhKGZ1bmN0aW9uKG1ldGFkYXRhKXtcclxuXHRcdFx0XHR2YXIgbG9jYWxEYXRlPURhdGUucGFyc2UobWV0YWRhdGEubW9kaWZpY2F0aW9uVGltZSk7XHJcblx0XHRcdFx0dmFyIHVybERhdGU9RGF0ZS5wYXJzZShkKTtcclxuXHRcdFx0XHRjYih1cmxEYXRlPmxvY2FsRGF0ZSk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fSxmdW5jdGlvbigpe1xyXG5cdFx0XHRjYihmYWxzZSk7XHJcblx0XHR9KTtcclxuXHR9KTtcclxufVxyXG52YXIgZG93bmxvYWQ9ZnVuY3Rpb24odXJsLGZuLGNiLHN0YXR1c2NiLGNvbnRleHQpIHtcclxuXHQgdmFyIHRvdGFsc2l6ZT0wLGJhdGNoZXM9bnVsbCx3cml0dGVuPTA7XHJcblx0IHZhciBmaWxlRW50cnk9MCwgZmlsZVdyaXRlcj0wO1xyXG5cdCB2YXIgY3JlYXRlQmF0Y2hlcz1mdW5jdGlvbihzaXplKSB7XHJcblx0XHR2YXIgYnl0ZXM9MTAyNCoxMDI0LCBvdXQ9W107XHJcblx0XHR2YXIgYj1NYXRoLmZsb29yKHNpemUgLyBieXRlcyk7XHJcblx0XHR2YXIgbGFzdD1zaXplICVieXRlcztcclxuXHRcdGZvciAodmFyIGk9MDtpPD1iO2krKykge1xyXG5cdFx0XHRvdXQucHVzaChpKmJ5dGVzKTtcclxuXHRcdH1cclxuXHRcdG91dC5wdXNoKGIqYnl0ZXMrbGFzdCk7XHJcblx0XHRyZXR1cm4gb3V0O1xyXG5cdCB9XHJcblx0IHZhciBmaW5pc2g9ZnVuY3Rpb24oKSB7XHJcblx0XHQgcm0oZm4sZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRmaWxlRW50cnkubW92ZVRvKGZpbGVFbnRyeS5maWxlc3lzdGVtLnJvb3QsIGZuLGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHRzZXRUaW1lb3V0KCBjYi5iaW5kKGNvbnRleHQsZmFsc2UpICwgMCkgOyBcclxuXHRcdFx0XHR9LGZ1bmN0aW9uKGUpe1xyXG5cdFx0XHRcdFx0Y29uc29sZS5sb2coXCJmYWlsZWRcIixlKVxyXG5cdFx0XHRcdH0pO1xyXG5cdFx0IH0sdGhpcyk7IFxyXG5cdCB9O1xyXG5cdFx0dmFyIHRlbXBmbj1cInRlbXAua2RiXCI7XHJcblx0XHR2YXIgYmF0Y2g9ZnVuY3Rpb24oYikge1xyXG5cdFx0dmFyIGFib3J0PWZhbHNlO1xyXG5cdFx0dmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG5cdFx0dmFyIHJlcXVlc3R1cmw9dXJsK1wiP1wiK01hdGgucmFuZG9tKCk7XHJcblx0XHR4aHIub3BlbignZ2V0JywgcmVxdWVzdHVybCwgdHJ1ZSk7XHJcblx0XHR4aHIuc2V0UmVxdWVzdEhlYWRlcignUmFuZ2UnLCAnYnl0ZXM9JytiYXRjaGVzW2JdKyctJysoYmF0Y2hlc1tiKzFdLTEpKTtcclxuXHRcdHhoci5yZXNwb25zZVR5cGUgPSAnYmxvYic7ICAgIFxyXG5cdFx0eGhyLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0dmFyIGJsb2I9dGhpcy5yZXNwb25zZTtcclxuXHRcdFx0ZmlsZUVudHJ5LmNyZWF0ZVdyaXRlcihmdW5jdGlvbihmaWxlV3JpdGVyKSB7XHJcblx0XHRcdFx0ZmlsZVdyaXRlci5zZWVrKGZpbGVXcml0ZXIubGVuZ3RoKTtcclxuXHRcdFx0XHRmaWxlV3JpdGVyLndyaXRlKGJsb2IpO1xyXG5cdFx0XHRcdHdyaXR0ZW4rPWJsb2Iuc2l6ZTtcclxuXHRcdFx0XHRmaWxlV3JpdGVyLm9ud3JpdGVlbmQgPSBmdW5jdGlvbihlKSB7XHJcblx0XHRcdFx0XHRpZiAoc3RhdHVzY2IpIHtcclxuXHRcdFx0XHRcdFx0YWJvcnQ9c3RhdHVzY2IuYXBwbHkoY29udGV4dCxbIGZpbGVXcml0ZXIubGVuZ3RoIC8gdG90YWxzaXplLHRvdGFsc2l6ZSBdKTtcclxuXHRcdFx0XHRcdFx0aWYgKGFib3J0KSBzZXRUaW1lb3V0KCBjYi5iaW5kKGNvbnRleHQsZmFsc2UpICwgMCkgO1xyXG5cdFx0XHRcdCBcdH1cclxuXHRcdFx0XHRcdGIrKztcclxuXHRcdFx0XHRcdGlmICghYWJvcnQpIHtcclxuXHRcdFx0XHRcdFx0aWYgKGI8YmF0Y2hlcy5sZW5ndGgtMSkgc2V0VGltZW91dChiYXRjaC5iaW5kKGNvbnRleHQsYiksMCk7XHJcblx0XHRcdFx0XHRcdGVsc2UgICAgICAgICAgICAgICAgICAgIGZpbmlzaCgpO1xyXG5cdFx0XHRcdCBcdH1cclxuXHRcdFx0IFx0fTtcclxuXHRcdFx0fSwgY29uc29sZS5lcnJvcik7XHJcblx0XHR9LGZhbHNlKTtcclxuXHRcdHhoci5zZW5kKCk7XHJcblx0fVxyXG5cclxuXHRnZXRfc2l6ZSh1cmwsZnVuY3Rpb24oc2l6ZSl7XHJcblx0XHR0b3RhbHNpemU9c2l6ZTtcclxuXHRcdGlmICghc2l6ZSkge1xyXG5cdFx0XHRpZiAoY2IpIGNiLmFwcGx5KGNvbnRleHQsW2ZhbHNlXSk7XHJcblx0XHR9IGVsc2Ugey8vcmVhZHkgdG8gZG93bmxvYWRcclxuXHRcdFx0cm0odGVtcGZuLGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0IGJhdGNoZXM9Y3JlYXRlQmF0Y2hlcyhzaXplKTtcclxuXHRcdFx0XHQgaWYgKHN0YXR1c2NiKSBzdGF0dXNjYi5hcHBseShjb250ZXh0LFsgMCwgdG90YWxzaXplIF0pO1xyXG5cdFx0XHRcdCBBUEkuZnMucm9vdC5nZXRGaWxlKHRlbXBmbiwge2NyZWF0ZTogMSwgZXhjbHVzaXZlOiBmYWxzZX0sIGZ1bmN0aW9uKF9maWxlRW50cnkpIHtcclxuXHRcdFx0XHRcdFx0XHRmaWxlRW50cnk9X2ZpbGVFbnRyeTtcclxuXHRcdFx0XHRcdFx0YmF0Y2goMCk7XHJcblx0XHRcdFx0IH0pO1xyXG5cdFx0XHR9LHRoaXMpO1xyXG5cdFx0fVxyXG5cdH0pO1xyXG59XHJcblxyXG52YXIgcmVhZEZpbGU9ZnVuY3Rpb24oZmlsZW5hbWUsY2IsY29udGV4dCkge1xyXG5cdEFQSS5mcy5yb290LmdldEZpbGUoZmlsZW5hbWUsIGZ1bmN0aW9uKGZpbGVFbnRyeSkge1xyXG5cdFx0XHR2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcclxuXHRcdFx0cmVhZGVyLm9ubG9hZGVuZCA9IGZ1bmN0aW9uKGUpIHtcclxuXHRcdFx0XHRcdGlmIChjYikgY2IuYXBwbHkoY2IsW3RoaXMucmVzdWx0XSk7XHJcblx0XHRcdFx0fTsgICAgICAgICAgICBcclxuXHR9LCBjb25zb2xlLmVycm9yKTtcclxufVxyXG52YXIgd3JpdGVGaWxlPWZ1bmN0aW9uKGZpbGVuYW1lLGJ1ZixjYixjb250ZXh0KXtcclxuXHRBUEkuZnMucm9vdC5nZXRGaWxlKGZpbGVuYW1lLCB7Y3JlYXRlOiB0cnVlLCBleGNsdXNpdmU6IHRydWV9LCBmdW5jdGlvbihmaWxlRW50cnkpIHtcclxuXHRcdFx0ZmlsZUVudHJ5LmNyZWF0ZVdyaXRlcihmdW5jdGlvbihmaWxlV3JpdGVyKSB7XHJcblx0XHRcdFx0ZmlsZVdyaXRlci53cml0ZShidWYpO1xyXG5cdFx0XHRcdGZpbGVXcml0ZXIub253cml0ZWVuZCA9IGZ1bmN0aW9uKGUpIHtcclxuXHRcdFx0XHRcdGlmIChjYikgY2IuYXBwbHkoY2IsW2J1Zi5ieXRlTGVuZ3RoXSk7XHJcblx0XHRcdFx0fTsgICAgICAgICAgICBcclxuXHRcdFx0fSwgY29uc29sZS5lcnJvcik7XHJcblx0fSwgY29uc29sZS5lcnJvcik7XHJcbn1cclxuXHJcbnZhciByZWFkZGlyPWZ1bmN0aW9uKGNiLGNvbnRleHQpIHtcclxuXHR2YXIgZGlyUmVhZGVyID0gQVBJLmZzLnJvb3QuY3JlYXRlUmVhZGVyKCk7XHJcblx0dmFyIG91dD1bXSx0aGF0PXRoaXM7XHJcblx0ZGlyUmVhZGVyLnJlYWRFbnRyaWVzKGZ1bmN0aW9uKGVudHJpZXMpIHtcclxuXHRcdGlmIChlbnRyaWVzLmxlbmd0aCkge1xyXG5cdFx0XHRmb3IgKHZhciBpID0gMCwgZW50cnk7IGVudHJ5ID0gZW50cmllc1tpXTsgKytpKSB7XHJcblx0XHRcdFx0aWYgKGVudHJ5LmlzRmlsZSkge1xyXG5cdFx0XHRcdFx0b3V0LnB1c2goW2VudHJ5Lm5hbWUsZW50cnkudG9VUkwgPyBlbnRyeS50b1VSTCgpIDogZW50cnkudG9VUkkoKV0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0QVBJLmZpbGVzPW91dDtcclxuXHRcdGlmIChjYikgY2IuYXBwbHkoY29udGV4dCxbb3V0XSk7XHJcblx0fSwgZnVuY3Rpb24oKXtcclxuXHRcdGlmIChjYikgY2IuYXBwbHkoY29udGV4dCxbbnVsbF0pO1xyXG5cdH0pO1xyXG59XHJcbnZhciBnZXRGaWxlVVJMPWZ1bmN0aW9uKGZpbGVuYW1lKSB7XHJcblx0aWYgKCFBUEkuZmlsZXMgKSByZXR1cm4gbnVsbDtcclxuXHR2YXIgZmlsZT0gQVBJLmZpbGVzLmZpbHRlcihmdW5jdGlvbihmKXtyZXR1cm4gZlswXT09ZmlsZW5hbWV9KTtcclxuXHRpZiAoZmlsZS5sZW5ndGgpIHJldHVybiBmaWxlWzBdWzFdO1xyXG59XHJcbnZhciBybT1mdW5jdGlvbihmaWxlbmFtZSxjYixjb250ZXh0KSB7XHJcblx0dmFyIHVybD1nZXRGaWxlVVJMKGZpbGVuYW1lKTtcclxuXHRpZiAodXJsKSBybVVSTCh1cmwsY2IsY29udGV4dCk7XHJcblx0ZWxzZSBpZiAoY2IpIGNiLmFwcGx5KGNvbnRleHQsW2ZhbHNlXSk7XHJcbn1cclxuXHJcbnZhciBybVVSTD1mdW5jdGlvbihmaWxlbmFtZSxjYixjb250ZXh0KSB7XHJcblx0d2Via2l0UmVzb2x2ZUxvY2FsRmlsZVN5c3RlbVVSTChmaWxlbmFtZSwgZnVuY3Rpb24oZmlsZUVudHJ5KSB7XHJcblx0XHRmaWxlRW50cnkucmVtb3ZlKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRpZiAoY2IpIGNiLmFwcGx5KGNvbnRleHQsW3RydWVdKTtcclxuXHRcdH0sIGNvbnNvbGUuZXJyb3IpO1xyXG5cdH0sICBmdW5jdGlvbihlKXtcclxuXHRcdGlmIChjYikgY2IuYXBwbHkoY29udGV4dCxbZmFsc2VdKTsvL25vIHN1Y2ggZmlsZVxyXG5cdH0pO1xyXG59XHJcbmZ1bmN0aW9uIGVycm9ySGFuZGxlcihlKSB7XHJcblx0Y29uc29sZS5lcnJvcignRXJyb3I6ICcgK2UubmFtZSsgXCIgXCIrZS5tZXNzYWdlKTtcclxufVxyXG52YXIgaW5pdGZzPWZ1bmN0aW9uKGdyYW50ZWRCeXRlcyxjYixjb250ZXh0KSB7XHJcblx0d2Via2l0UmVxdWVzdEZpbGVTeXN0ZW0oUEVSU0lTVEVOVCwgZ3JhbnRlZEJ5dGVzLCAgZnVuY3Rpb24oZnMpIHtcclxuXHRcdEFQSS5mcz1mcztcclxuXHRcdEFQSS5xdW90YT1ncmFudGVkQnl0ZXM7XHJcblx0XHRyZWFkZGlyKGZ1bmN0aW9uKCl7XHJcblx0XHRcdEFQSS5pbml0aWFsaXplZD10cnVlO1xyXG5cdFx0XHRjYi5hcHBseShjb250ZXh0LFtncmFudGVkQnl0ZXMsZnNdKTtcclxuXHRcdH0sY29udGV4dCk7XHJcblx0fSwgZXJyb3JIYW5kbGVyKTtcclxufVxyXG52YXIgaW5pdD1mdW5jdGlvbihxdW90YSxjYixjb250ZXh0KSB7XHJcblx0bmF2aWdhdG9yLndlYmtpdFBlcnNpc3RlbnRTdG9yYWdlLnJlcXVlc3RRdW90YShxdW90YSwgXHJcblx0XHRcdGZ1bmN0aW9uKGdyYW50ZWRCeXRlcykge1xyXG5cdFx0XHRcdGluaXRmcyhncmFudGVkQnl0ZXMsY2IsY29udGV4dCk7XHJcblx0XHR9LCBlcnJvckhhbmRsZXJcclxuXHQpO1xyXG59XHJcbnZhciBxdWVyeVF1b3RhPWZ1bmN0aW9uKGNiLGNvbnRleHQpIHtcclxuXHR2YXIgdGhhdD10aGlzO1xyXG5cdG5hdmlnYXRvci53ZWJraXRQZXJzaXN0ZW50U3RvcmFnZS5xdWVyeVVzYWdlQW5kUXVvdGEoIFxyXG5cdCBmdW5jdGlvbih1c2FnZSxxdW90YSl7XHJcblx0XHRcdGluaXRmcyhxdW90YSxmdW5jdGlvbigpe1xyXG5cdFx0XHRcdGNiLmFwcGx5KGNvbnRleHQsW3VzYWdlLHF1b3RhXSk7XHJcblx0XHRcdH0sY29udGV4dCk7XHJcblx0fSk7XHJcbn1cclxudmFyIEFQST17XHJcblx0aW5pdDppbml0XHJcblx0LHJlYWRkaXI6cmVhZGRpclxyXG5cdCxjaGVja1VwZGF0ZTpjaGVja1VwZGF0ZVxyXG5cdCxybTpybVxyXG5cdCxybVVSTDpybVVSTFxyXG5cdCxnZXRGaWxlVVJMOmdldEZpbGVVUkxcclxuXHQsd3JpdGVGaWxlOndyaXRlRmlsZVxyXG5cdCxyZWFkRmlsZTpyZWFkRmlsZVxyXG5cdCxkb3dubG9hZDpkb3dubG9hZFxyXG5cdCxnZXRfaGVhZDpnZXRfaGVhZFxyXG5cdCxnZXRfZGF0ZTpnZXRfZGF0ZVxyXG5cdCxnZXRfc2l6ZTpnZXRfc2l6ZVxyXG5cdCxnZXREb3dubG9hZFNpemU6Z2V0X3NpemVcclxuXHQscXVlcnlRdW90YTpxdWVyeVF1b3RhXHJcbn1cclxubW9kdWxlLmV4cG9ydHM9QVBJOyIsInZhciBodG1sNWZzPXJlcXVpcmUoXCIuL2h0bWw1ZnNcIik7XHJcbnZhciBFPVJlYWN0LmNyZWF0ZUVsZW1lbnQ7XHJcblxyXG52YXIgaHRtbGZzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xyXG5cdGdldEluaXRpYWxTdGF0ZTpmdW5jdGlvbigpIHsgXHJcblx0XHRyZXR1cm4ge3JlYWR5OmZhbHNlLCBxdW90YTowLHVzYWdlOjAsSW5pdGlhbGl6ZWQ6ZmFsc2UsYXV0b2Nsb3NlOnRoaXMucHJvcHMuYXV0b2Nsb3NlfTtcclxuXHR9LFxyXG5cdGluaXRGaWxlc3lzdGVtOmZ1bmN0aW9uKCkge1xyXG5cdFx0dmFyIHF1b3RhPXRoaXMucHJvcHMucXVvdGF8fDEwMjQqMTAyNCoxMjg7IC8vIGRlZmF1bHQgMTI4TUJcclxuXHRcdHF1b3RhPXBhcnNlSW50KHF1b3RhKTtcclxuXHRcdGh0bWw1ZnMuaW5pdChxdW90YSxmdW5jdGlvbihxKXtcclxuXHRcdFx0dGhpcy5kaWFsb2c9ZmFsc2U7XHJcblx0XHRcdCQodGhpcy5yZWZzLmRpYWxvZzEuZ2V0RE9NTm9kZSgpKS5tb2RhbCgnaGlkZScpO1xyXG5cdFx0XHR0aGlzLnNldFN0YXRlKHtxdW90YTpxLGF1dG9jbG9zZTp0cnVlfSk7XHJcblx0XHR9LHRoaXMpO1xyXG5cdH0sXHJcblx0d2VsY29tZTpmdW5jdGlvbigpIHtcclxuXHRcdHJldHVybiAoXHJcblx0XHRFKFwiZGl2XCIsIHtyZWY6IFwiZGlhbG9nMVwiLCBjbGFzc05hbWU6IFwibW9kYWwgZmFkZVwiLCBpZDogXCJteU1vZGFsXCIsIFwiZGF0YS1iYWNrZHJvcFwiOiBcInN0YXRpY1wifSwgXHJcblx0XHQgICAgRShcImRpdlwiLCB7Y2xhc3NOYW1lOiBcIm1vZGFsLWRpYWxvZ1wifSwgXHJcblx0XHQgICAgICBFKFwiZGl2XCIsIHtjbGFzc05hbWU6IFwibW9kYWwtY29udGVudFwifSwgXHJcblx0XHQgICAgICAgIEUoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJtb2RhbC1oZWFkZXJcIn0sIFxyXG5cdFx0ICAgICAgICAgIEUoXCJoNFwiLCB7Y2xhc3NOYW1lOiBcIm1vZGFsLXRpdGxlXCJ9LCBcIldlbGNvbWVcIilcclxuXHRcdCAgICAgICAgKSwgXHJcblx0XHQgICAgICAgIEUoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJtb2RhbC1ib2R5XCJ9LCBcclxuXHRcdCAgICAgICAgICBcIkJyb3dzZXIgd2lsbCBhc2sgZm9yIHlvdXIgY29uZmlybWF0aW9uLlwiXHJcblx0XHQgICAgICAgICksIFxyXG5cdFx0ICAgICAgICBFKFwiZGl2XCIsIHtjbGFzc05hbWU6IFwibW9kYWwtZm9vdGVyXCJ9LCBcclxuXHRcdCAgICAgICAgICBFKFwiYnV0dG9uXCIsIHtvbkNsaWNrOiB0aGlzLmluaXRGaWxlc3lzdGVtLCB0eXBlOiBcImJ1dHRvblwiLCBcclxuXHRcdCAgICAgICAgICAgIGNsYXNzTmFtZTogXCJidG4gYnRuLXByaW1hcnlcIn0sIFwiSW5pdGlhbGl6ZSBGaWxlIFN5c3RlbVwiKVxyXG5cdFx0ICAgICAgICApXHJcblx0XHQgICAgICApXHJcblx0XHQgICAgKVxyXG5cdFx0ICApXHJcblx0XHQgKTtcclxuXHR9LFxyXG5cdHJlbmRlckRlZmF1bHQ6ZnVuY3Rpb24oKXtcclxuXHRcdHZhciB1c2VkPU1hdGguZmxvb3IodGhpcy5zdGF0ZS51c2FnZS90aGlzLnN0YXRlLnF1b3RhICoxMDApO1xyXG5cdFx0dmFyIG1vcmU9ZnVuY3Rpb24oKSB7XHJcblx0XHRcdGlmICh1c2VkPjUwKSByZXR1cm4gRShcImJ1dHRvblwiLCB7dHlwZTogXCJidXR0b25cIiwgY2xhc3NOYW1lOiBcImJ0biBidG4tcHJpbWFyeVwifSwgXCJBbGxvY2F0ZSBNb3JlXCIpO1xyXG5cdFx0XHRlbHNlIG51bGw7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gKFxyXG5cdFx0RShcImRpdlwiLCB7cmVmOiBcImRpYWxvZzFcIiwgY2xhc3NOYW1lOiBcIm1vZGFsIGZhZGVcIiwgaWQ6IFwibXlNb2RhbFwiLCBcImRhdGEtYmFja2Ryb3BcIjogXCJzdGF0aWNcIn0sIFxyXG5cdFx0ICAgIEUoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJtb2RhbC1kaWFsb2dcIn0sIFxyXG5cdFx0ICAgICAgRShcImRpdlwiLCB7Y2xhc3NOYW1lOiBcIm1vZGFsLWNvbnRlbnRcIn0sIFxyXG5cdFx0ICAgICAgICBFKFwiZGl2XCIsIHtjbGFzc05hbWU6IFwibW9kYWwtaGVhZGVyXCJ9LCBcclxuXHRcdCAgICAgICAgICBFKFwiaDRcIiwge2NsYXNzTmFtZTogXCJtb2RhbC10aXRsZVwifSwgXCJTYW5kYm94IEZpbGUgU3lzdGVtXCIpXHJcblx0XHQgICAgICAgICksIFxyXG5cdFx0ICAgICAgICBFKFwiZGl2XCIsIHtjbGFzc05hbWU6IFwibW9kYWwtYm9keVwifSwgXHJcblx0XHQgICAgICAgICAgRShcImRpdlwiLCB7Y2xhc3NOYW1lOiBcInByb2dyZXNzXCJ9LCBcclxuXHRcdCAgICAgICAgICAgIEUoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJwcm9ncmVzcy1iYXJcIiwgcm9sZTogXCJwcm9ncmVzc2JhclwiLCBzdHlsZToge3dpZHRoOiB1c2VkK1wiJVwifX0sIFxyXG5cdFx0ICAgICAgICAgICAgICAgdXNlZCwgXCIlXCJcclxuXHRcdCAgICAgICAgICAgIClcclxuXHRcdCAgICAgICAgICApLCBcclxuXHRcdCAgICAgICAgICBFKFwic3BhblwiLCBudWxsLCB0aGlzLnN0YXRlLnF1b3RhLCBcIiB0b3RhbCAsIFwiLCB0aGlzLnN0YXRlLnVzYWdlLCBcIiBpbiB1c2VkXCIpXHJcblx0XHQgICAgICAgICksIFxyXG5cdFx0ICAgICAgICBFKFwiZGl2XCIsIHtjbGFzc05hbWU6IFwibW9kYWwtZm9vdGVyXCJ9LCBcclxuXHRcdCAgICAgICAgICBFKFwiYnV0dG9uXCIsIHtvbkNsaWNrOiB0aGlzLmRpc21pc3MsIHR5cGU6IFwiYnV0dG9uXCIsIGNsYXNzTmFtZTogXCJidG4gYnRuLWRlZmF1bHRcIiwgXCJkYXRhLWRpc21pc3NcIjogXCJtb2RhbFwifSwgXCJDbG9zZVwiKSwgXHJcblx0XHQgICAgICAgICAgbW9yZSgpXHJcblx0XHQgICAgICAgIClcclxuXHRcdCAgICAgIClcclxuXHRcdCAgICApXHJcblx0XHQgIClcclxuXHRcdCAgKTtcclxuXHR9LFxyXG5cdGRpc21pc3M6ZnVuY3Rpb24oKSB7XHJcblx0XHR2YXIgdGhhdD10aGlzO1xyXG5cdFx0c2V0VGltZW91dChmdW5jdGlvbigpe1xyXG5cdFx0XHR0aGF0LnByb3BzLm9uUmVhZHkodGhhdC5zdGF0ZS5xdW90YSx0aGF0LnN0YXRlLnVzYWdlKTtcdFxyXG5cdFx0fSwwKTtcclxuXHR9LFxyXG5cdHF1ZXJ5UXVvdGE6ZnVuY3Rpb24oKSB7XHJcblx0XHRpZiAoa3NhbmFnYXAucGxhdGZvcm09PVwiY2hyb21lXCIpIHtcclxuXHRcdFx0aHRtbDVmcy5xdWVyeVF1b3RhKGZ1bmN0aW9uKHVzYWdlLHF1b3RhKXtcclxuXHRcdFx0XHR0aGlzLnNldFN0YXRlKHt1c2FnZTp1c2FnZSxxdW90YTpxdW90YSxpbml0aWFsaXplZDp0cnVlfSk7XHJcblx0XHRcdH0sdGhpcyk7XHRcdFx0XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aGlzLnNldFN0YXRlKHt1c2FnZTozMzMscXVvdGE6MTAwMCoxMDAwKjEwMjQsaW5pdGlhbGl6ZWQ6dHJ1ZSxhdXRvY2xvc2U6dHJ1ZX0pO1xyXG5cdFx0fVxyXG5cdH0sXHJcblx0cmVuZGVyOmZ1bmN0aW9uKCkge1xyXG5cdFx0dmFyIHRoYXQ9dGhpcztcclxuXHRcdGlmICghdGhpcy5zdGF0ZS5xdW90YSB8fCB0aGlzLnN0YXRlLnF1b3RhPHRoaXMucHJvcHMucXVvdGEpIHtcclxuXHRcdFx0aWYgKHRoaXMuc3RhdGUuaW5pdGlhbGl6ZWQpIHtcclxuXHRcdFx0XHR0aGlzLmRpYWxvZz10cnVlO1xyXG5cdFx0XHRcdHJldHVybiB0aGlzLndlbGNvbWUoKTtcdFxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHJldHVybiBFKFwic3BhblwiLCBudWxsLCBcImNoZWNraW5nIHF1b3RhXCIpO1xyXG5cdFx0XHR9XHRcdFx0XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRpZiAoIXRoaXMuc3RhdGUuYXV0b2Nsb3NlKSB7XHJcblx0XHRcdFx0dGhpcy5kaWFsb2c9dHJ1ZTtcclxuXHRcdFx0XHRyZXR1cm4gdGhpcy5yZW5kZXJEZWZhdWx0KCk7IFxyXG5cdFx0XHR9XHJcblx0XHRcdHRoaXMuZGlzbWlzcygpO1xyXG5cdFx0XHR0aGlzLmRpYWxvZz1mYWxzZTtcclxuXHRcdFx0cmV0dXJuIG51bGw7XHJcblx0XHR9XHJcblx0fSxcclxuXHRjb21wb25lbnREaWRNb3VudDpmdW5jdGlvbigpIHtcclxuXHRcdGlmICghdGhpcy5zdGF0ZS5xdW90YSkge1xyXG5cdFx0XHR0aGlzLnF1ZXJ5UXVvdGEoKTtcclxuXHJcblx0XHR9O1xyXG5cdH0sXHJcblx0Y29tcG9uZW50RGlkVXBkYXRlOmZ1bmN0aW9uKCkge1xyXG5cdFx0aWYgKHRoaXMuZGlhbG9nKSAkKHRoaXMucmVmcy5kaWFsb2cxLmdldERPTU5vZGUoKSkubW9kYWwoJ3Nob3cnKTtcclxuXHR9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHM9aHRtbGZzOyIsInZhciBrc2FuYT17XCJwbGF0Zm9ybVwiOlwicmVtb3RlXCJ9O1xyXG5pZiAodHlwZW9mIHdpbmRvdyE9XCJ1bmRlZmluZWRcIikge1xyXG5cdHdpbmRvdy5rc2FuYT1rc2FuYTtcclxuXHRpZiAodHlwZW9mIGtzYW5hZ2FwPT1cInVuZGVmaW5lZFwiKSB7XHJcblx0XHR3aW5kb3cua3NhbmFnYXA9cmVxdWlyZShcIi4va3NhbmFnYXBcIik7IC8vY29tcGF0aWJsZSBsYXllciB3aXRoIG1vYmlsZVxyXG5cdH1cclxufVxyXG5pZiAodHlwZW9mIHByb2Nlc3MgIT1cInVuZGVmaW5lZFwiKSB7XHJcblx0aWYgKHByb2Nlc3MudmVyc2lvbnMgJiYgcHJvY2Vzcy52ZXJzaW9uc1tcIm5vZGUtd2Via2l0XCJdKSB7XHJcbiAgXHRcdGlmICh0eXBlb2Ygbm9kZVJlcXVpcmUhPVwidW5kZWZpbmVkXCIpIGtzYW5hLnJlcXVpcmU9bm9kZVJlcXVpcmU7XHJcbiAgXHRcdGtzYW5hLnBsYXRmb3JtPVwibm9kZS13ZWJraXRcIjtcclxuICBcdFx0d2luZG93LmtzYW5hZ2FwLnBsYXRmb3JtPVwibm9kZS13ZWJraXRcIjtcclxuXHRcdHZhciBrc2FuYWpzPXJlcXVpcmUoXCJmc1wiKS5yZWFkRmlsZVN5bmMoXCJrc2FuYS5qc1wiLFwidXRmOFwiKS50cmltKCk7XHJcblx0XHRrc2FuYS5qcz1KU09OLnBhcnNlKGtzYW5hanMuc3Vic3RyaW5nKDE0LGtzYW5hanMubGVuZ3RoLTEpKTtcclxuXHRcdHdpbmRvdy5rZnM9cmVxdWlyZShcIi4va2ZzXCIpO1xyXG4gIFx0fVxyXG59IGVsc2UgaWYgKHR5cGVvZiBjaHJvbWUhPVwidW5kZWZpbmVkXCIpey8vfSAmJiBjaHJvbWUuZmlsZVN5c3RlbSl7XHJcbi8vXHR3aW5kb3cua3NhbmFnYXA9cmVxdWlyZShcIi4va3NhbmFnYXBcIik7IC8vY29tcGF0aWJsZSBsYXllciB3aXRoIG1vYmlsZVxyXG5cdHdpbmRvdy5rc2FuYWdhcC5wbGF0Zm9ybT1cImNocm9tZVwiO1xyXG5cdHdpbmRvdy5rZnM9cmVxdWlyZShcIi4va2ZzX2h0bWw1XCIpO1xyXG5cdHJlcXVpcmUoXCIuL2xpdmVyZWxvYWRcIikoKTtcclxuXHRrc2FuYS5wbGF0Zm9ybT1cImNocm9tZVwiO1xyXG59IGVsc2Uge1xyXG5cdGlmICh0eXBlb2Yga3NhbmFnYXAhPVwidW5kZWZpbmVkXCIgJiYgdHlwZW9mIGZzIT1cInVuZGVmaW5lZFwiKSB7Ly9tb2JpbGVcclxuXHRcdHZhciBrc2FuYWpzPWZzLnJlYWRGaWxlU3luYyhcImtzYW5hLmpzXCIsXCJ1dGY4XCIpLnRyaW0oKTsgLy9hbmRyb2lkIGV4dHJhIFxcbiBhdCB0aGUgZW5kXHJcblx0XHRrc2FuYS5qcz1KU09OLnBhcnNlKGtzYW5hanMuc3Vic3RyaW5nKDE0LGtzYW5hanMubGVuZ3RoLTEpKTtcclxuXHRcdGtzYW5hLnBsYXRmb3JtPWtzYW5hZ2FwLnBsYXRmb3JtO1xyXG5cdFx0aWYgKHR5cGVvZiBrc2FuYWdhcC5hbmRyb2lkICE9XCJ1bmRlZmluZWRcIikge1xyXG5cdFx0XHRrc2FuYS5wbGF0Zm9ybT1cImFuZHJvaWRcIjtcclxuXHRcdH1cclxuXHR9XHJcbn1cclxudmFyIHRpbWVyPW51bGw7XHJcbnZhciBib290PWZ1bmN0aW9uKGFwcElkLGNiKSB7XHJcblx0a3NhbmEuYXBwSWQ9YXBwSWQ7XHJcblx0aWYgKGtzYW5hZ2FwLnBsYXRmb3JtPT1cImNocm9tZVwiKSB7IC8vbmVlZCB0byB3YWl0IGZvciBqc29ucCBrc2FuYS5qc1xyXG5cdFx0dGltZXI9c2V0SW50ZXJ2YWwoZnVuY3Rpb24oKXtcclxuXHRcdFx0aWYgKGtzYW5hLnJlYWR5KXtcclxuXHRcdFx0XHRjbGVhckludGVydmFsKHRpbWVyKTtcclxuXHRcdFx0XHRpZiAoa3NhbmEuanMgJiYga3NhbmEuanMuZmlsZXMgJiYga3NhbmEuanMuZmlsZXMubGVuZ3RoKSB7XHJcblx0XHRcdFx0XHRyZXF1aXJlKFwiLi9pbnN0YWxsa2RiXCIpKGtzYW5hLmpzLGNiKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0Y2IoKTtcdFx0XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9LDMwMCk7XHJcblx0fSBlbHNlIHtcclxuXHRcdGNiKCk7XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cz17Ym9vdDpib290XHJcblx0LGh0bWxmczpyZXF1aXJlKFwiLi9odG1sZnNcIilcclxuXHQsaHRtbDVmczpyZXF1aXJlKFwiLi9odG1sNWZzXCIpXHJcblx0LGxpdmV1cGRhdGU6cmVxdWlyZShcIi4vbGl2ZXVwZGF0ZVwiKVxyXG5cdCxmaWxlaW5zdGFsbGVyOnJlcXVpcmUoXCIuL2ZpbGVpbnN0YWxsZXJcIilcclxuXHQsZG93bmxvYWRlcjpyZXF1aXJlKFwiLi9kb3dubG9hZGVyXCIpXHJcblx0LGluc3RhbGxrZGI6cmVxdWlyZShcIi4vaW5zdGFsbGtkYlwiKVxyXG59OyIsInZhciBGaWxlaW5zdGFsbGVyPXJlcXVpcmUoXCIuL2ZpbGVpbnN0YWxsZXJcIik7XHJcblxyXG52YXIgZ2V0UmVxdWlyZV9rZGI9ZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgcmVxdWlyZWQ9W107XHJcbiAgICBrc2FuYS5qcy5maWxlcy5tYXAoZnVuY3Rpb24oZil7XHJcbiAgICAgIGlmIChmLmluZGV4T2YoXCIua2RiXCIpPT1mLmxlbmd0aC00KSB7XHJcbiAgICAgICAgdmFyIHNsYXNoPWYubGFzdEluZGV4T2YoXCIvXCIpO1xyXG4gICAgICAgIGlmIChzbGFzaD4tMSkge1xyXG4gICAgICAgICAgdmFyIGRiaWQ9Zi5zdWJzdHJpbmcoc2xhc2grMSxmLmxlbmd0aC00KTtcclxuICAgICAgICAgIHJlcXVpcmVkLnB1c2goe3VybDpmLGRiaWQ6ZGJpZCxmaWxlbmFtZTpkYmlkK1wiLmtkYlwifSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHZhciBkYmlkPWYuc3Vic3RyaW5nKDAsZi5sZW5ndGgtNCk7XHJcbiAgICAgICAgICByZXF1aXJlZC5wdXNoKHt1cmw6a3NhbmEuanMuYmFzZXVybCtmLGRiaWQ6ZGJpZCxmaWxlbmFtZTpmfSk7XHJcbiAgICAgICAgfSAgICAgICAgXHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIHJlcXVpcmVkO1xyXG59XHJcbnZhciBjYWxsYmFjaz1udWxsO1xyXG52YXIgb25SZWFkeT1mdW5jdGlvbigpIHtcclxuXHRjYWxsYmFjaygpO1xyXG59XHJcbnZhciBvcGVuRmlsZWluc3RhbGxlcj1mdW5jdGlvbihrZWVwKSB7XHJcblx0dmFyIHJlcXVpcmVfa2RiPWdldFJlcXVpcmVfa2RiKCkubWFwKGZ1bmN0aW9uKGRiKXtcclxuXHQgIHJldHVybiB7XHJcblx0ICAgIHVybDp3aW5kb3cubG9jYXRpb24ub3JpZ2luK3dpbmRvdy5sb2NhdGlvbi5wYXRobmFtZStkYi5kYmlkK1wiLmtkYlwiLFxyXG5cdCAgICBkYmRiOmRiLmRiaWQsXHJcblx0ICAgIGZpbGVuYW1lOmRiLmZpbGVuYW1lXHJcblx0ICB9XHJcblx0fSlcclxuXHRyZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChGaWxlaW5zdGFsbGVyLCB7cXVvdGE6IFwiNTEyTVwiLCBhdXRvY2xvc2U6ICFrZWVwLCBuZWVkZWQ6IHJlcXVpcmVfa2RiLCBcclxuXHQgICAgICAgICAgICAgICAgIG9uUmVhZHk6IG9uUmVhZHl9KTtcclxufVxyXG52YXIgaW5zdGFsbGtkYj1mdW5jdGlvbihrc2FuYWpzLGNiLGNvbnRleHQpIHtcclxuXHRjb25zb2xlLmxvZyhrc2FuYWpzLmZpbGVzKTtcclxuXHRSZWFjdC5yZW5kZXIob3BlbkZpbGVpbnN0YWxsZXIoKSxkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1haW5cIikpO1xyXG5cdGNhbGxiYWNrPWNiO1xyXG59XHJcbm1vZHVsZS5leHBvcnRzPWluc3RhbGxrZGI7IiwiLy9TaW11bGF0ZSBmZWF0dXJlIGluIGtzYW5hZ2FwXHJcbi8qIFxyXG4gIHJ1bnMgb24gbm9kZS13ZWJraXQgb25seVxyXG4qL1xyXG5cclxudmFyIHJlYWREaXI9ZnVuY3Rpb24ocGF0aCkgeyAvL3NpbXVsYXRlIEtzYW5hZ2FwIGZ1bmN0aW9uXHJcblx0dmFyIGZzPW5vZGVSZXF1aXJlKFwiZnNcIik7XHJcblx0cGF0aD1wYXRofHxcIi4uXCI7XHJcblx0dmFyIGRpcnM9W107XHJcblx0aWYgKHBhdGhbMF09PVwiLlwiKSB7XHJcblx0XHRpZiAocGF0aD09XCIuXCIpIGRpcnM9ZnMucmVhZGRpclN5bmMoXCIuXCIpO1xyXG5cdFx0ZWxzZSB7XHJcblx0XHRcdGRpcnM9ZnMucmVhZGRpclN5bmMoXCIuLlwiKTtcclxuXHRcdH1cclxuXHR9IGVsc2Uge1xyXG5cdFx0ZGlycz1mcy5yZWFkZGlyU3luYyhwYXRoKTtcclxuXHR9XHJcblxyXG5cdHJldHVybiBkaXJzLmpvaW4oXCJcXHVmZmZmXCIpO1xyXG59XHJcbnZhciBsaXN0QXBwcz1mdW5jdGlvbigpIHtcclxuXHR2YXIgZnM9bm9kZVJlcXVpcmUoXCJmc1wiKTtcclxuXHR2YXIga3NhbmFqc2ZpbGU9ZnVuY3Rpb24oZCkge3JldHVybiBcIi4uL1wiK2QrXCIva3NhbmEuanNcIn07XHJcblx0dmFyIGRpcnM9ZnMucmVhZGRpclN5bmMoXCIuLlwiKS5maWx0ZXIoZnVuY3Rpb24oZCl7XHJcblx0XHRcdFx0cmV0dXJuIGZzLnN0YXRTeW5jKFwiLi4vXCIrZCkuaXNEaXJlY3RvcnkoKSAmJiBkWzBdIT1cIi5cIlxyXG5cdFx0XHRcdCAgICYmIGZzLmV4aXN0c1N5bmMoa3NhbmFqc2ZpbGUoZCkpO1xyXG5cdH0pO1xyXG5cdFxyXG5cdHZhciBvdXQ9ZGlycy5tYXAoZnVuY3Rpb24oZCl7XHJcblx0XHR2YXIgY29udGVudD1mcy5yZWFkRmlsZVN5bmMoa3NhbmFqc2ZpbGUoZCksXCJ1dGY4XCIpO1xyXG4gIFx0Y29udGVudD1jb250ZW50LnJlcGxhY2UoXCJ9KVwiLFwifVwiKTtcclxuICBcdGNvbnRlbnQ9Y29udGVudC5yZXBsYWNlKFwianNvbnBfaGFuZGxlcihcIixcIlwiKTtcclxuXHRcdHZhciBvYmo9IEpTT04ucGFyc2UoY29udGVudCk7XHJcblx0XHRvYmouZGJpZD1kO1xyXG5cdFx0b2JqLnBhdGg9ZDtcclxuXHRcdHJldHVybiBvYmo7XHJcblx0fSlcclxuXHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkob3V0KTtcclxufVxyXG5cclxuXHJcblxyXG52YXIga2ZzPXtyZWFkRGlyOnJlYWREaXIsbGlzdEFwcHM6bGlzdEFwcHN9O1xyXG5cclxubW9kdWxlLmV4cG9ydHM9a2ZzOyIsInZhciByZWFkRGlyPWZ1bmN0aW9uKCl7XHJcblx0cmV0dXJuIFtdO1xyXG59XHJcbnZhciBsaXN0QXBwcz1mdW5jdGlvbigpe1xyXG5cdHJldHVybiBbXTtcclxufVxyXG5tb2R1bGUuZXhwb3J0cz17cmVhZERpcjpyZWFkRGlyLGxpc3RBcHBzOmxpc3RBcHBzfTsiLCJ2YXIgYXBwbmFtZT1cImluc3RhbGxlclwiO1xyXG52YXIgc3dpdGNoQXBwPWZ1bmN0aW9uKHBhdGgpIHtcclxuXHR2YXIgZnM9cmVxdWlyZShcImZzXCIpO1xyXG5cdHBhdGg9XCIuLi9cIitwYXRoO1xyXG5cdGFwcG5hbWU9cGF0aDtcclxuXHRkb2N1bWVudC5sb2NhdGlvbi5ocmVmPSBwYXRoK1wiL2luZGV4Lmh0bWxcIjsgXHJcblx0cHJvY2Vzcy5jaGRpcihwYXRoKTtcclxufVxyXG52YXIgZG93bmxvYWRlcj17fTtcclxudmFyIHJvb3RQYXRoPVwiXCI7XHJcblxyXG52YXIgZGVsZXRlQXBwPWZ1bmN0aW9uKGFwcCkge1xyXG5cdGNvbnNvbGUuZXJyb3IoXCJub3QgYWxsb3cgb24gUEMsIGRvIGl0IGluIEZpbGUgRXhwbG9yZXIvIEZpbmRlclwiKTtcclxufVxyXG52YXIgdXNlcm5hbWU9ZnVuY3Rpb24oKSB7XHJcblx0cmV0dXJuIFwiXCI7XHJcbn1cclxudmFyIHVzZXJlbWFpbD1mdW5jdGlvbigpIHtcclxuXHRyZXR1cm4gXCJcIlxyXG59XHJcbnZhciBydW50aW1lX3ZlcnNpb249ZnVuY3Rpb24oKSB7XHJcblx0cmV0dXJuIFwiMS40XCI7XHJcbn1cclxuXHJcbi8vY29weSBmcm9tIGxpdmV1cGRhdGVcclxudmFyIGpzb25wPWZ1bmN0aW9uKHVybCxkYmlkLGNhbGxiYWNrLGNvbnRleHQpIHtcclxuICB2YXIgc2NyaXB0PWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwianNvbnAyXCIpO1xyXG4gIGlmIChzY3JpcHQpIHtcclxuICAgIHNjcmlwdC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHNjcmlwdCk7XHJcbiAgfVxyXG4gIHdpbmRvdy5qc29ucF9oYW5kbGVyPWZ1bmN0aW9uKGRhdGEpIHtcclxuICAgIGlmICh0eXBlb2YgZGF0YT09XCJvYmplY3RcIikge1xyXG4gICAgICBkYXRhLmRiaWQ9ZGJpZDtcclxuICAgICAgY2FsbGJhY2suYXBwbHkoY29udGV4dCxbZGF0YV0pOyAgICBcclxuICAgIH0gIFxyXG4gIH1cclxuICB3aW5kb3cuanNvbnBfZXJyb3JfaGFuZGxlcj1mdW5jdGlvbigpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoXCJ1cmwgdW5yZWFjaGFibGVcIix1cmwpO1xyXG4gICAgY2FsbGJhY2suYXBwbHkoY29udGV4dCxbbnVsbF0pO1xyXG4gIH1cclxuICBzY3JpcHQ9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XHJcbiAgc2NyaXB0LnNldEF0dHJpYnV0ZSgnaWQnLCBcImpzb25wMlwiKTtcclxuICBzY3JpcHQuc2V0QXR0cmlidXRlKCdvbmVycm9yJywgXCJqc29ucF9lcnJvcl9oYW5kbGVyKClcIik7XHJcbiAgdXJsPXVybCsnPycrKG5ldyBEYXRlKCkuZ2V0VGltZSgpKTtcclxuICBzY3JpcHQuc2V0QXR0cmlidXRlKCdzcmMnLCB1cmwpO1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0uYXBwZW5kQ2hpbGQoc2NyaXB0KTsgXHJcbn1cclxuXHJcbnZhciBrc2FuYWdhcD17XHJcblx0cGxhdGZvcm06XCJub2RlLXdlYmtpdFwiLFxyXG5cdHN0YXJ0RG93bmxvYWQ6ZG93bmxvYWRlci5zdGFydERvd25sb2FkLFxyXG5cdGRvd25sb2FkZWRCeXRlOmRvd25sb2FkZXIuZG93bmxvYWRlZEJ5dGUsXHJcblx0ZG93bmxvYWRpbmdGaWxlOmRvd25sb2FkZXIuZG93bmxvYWRpbmdGaWxlLFxyXG5cdGNhbmNlbERvd25sb2FkOmRvd25sb2FkZXIuY2FuY2VsRG93bmxvYWQsXHJcblx0ZG9uZURvd25sb2FkOmRvd25sb2FkZXIuZG9uZURvd25sb2FkLFxyXG5cdHN3aXRjaEFwcDpzd2l0Y2hBcHAsXHJcblx0cm9vdFBhdGg6cm9vdFBhdGgsXHJcblx0ZGVsZXRlQXBwOiBkZWxldGVBcHAsXHJcblx0dXNlcm5hbWU6dXNlcm5hbWUsIC8vbm90IHN1cHBvcnQgb24gUENcclxuXHR1c2VyZW1haWw6dXNlcm5hbWUsXHJcblx0cnVudGltZV92ZXJzaW9uOnJ1bnRpbWVfdmVyc2lvbixcclxuXHRcclxufVxyXG5cclxuaWYgKHR5cGVvZiBwcm9jZXNzIT1cInVuZGVmaW5lZFwiKSB7XHJcblx0dmFyIGtzYW5hanM9cmVxdWlyZShcImZzXCIpLnJlYWRGaWxlU3luYyhcIi4va3NhbmEuanNcIixcInV0ZjhcIikudHJpbSgpO1xyXG5cdGRvd25sb2FkZXI9cmVxdWlyZShcIi4vZG93bmxvYWRlclwiKTtcclxuXHRjb25zb2xlLmxvZyhrc2FuYWpzKTtcclxuXHQvL2tzYW5hLmpzPUpTT04ucGFyc2Uoa3NhbmFqcy5zdWJzdHJpbmcoMTQsa3NhbmFqcy5sZW5ndGgtMSkpO1xyXG5cdHJvb3RQYXRoPXByb2Nlc3MuY3dkKCk7XHJcblx0cm9vdFBhdGg9cmVxdWlyZShcInBhdGhcIikucmVzb2x2ZShyb290UGF0aCxcIi4uXCIpLnJlcGxhY2UoL1xcXFwvZyxcIi9cIikrJy8nO1xyXG5cdGtzYW5hLnJlYWR5PXRydWU7XHJcbn0gZWxzZXtcclxuXHR2YXIgdXJsPXdpbmRvdy5sb2NhdGlvbi5vcmlnaW4rd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnJlcGxhY2UoXCJpbmRleC5odG1sXCIsXCJcIikrXCJrc2FuYS5qc1wiO1xyXG5cdGpzb25wKHVybCxhcHBuYW1lLGZ1bmN0aW9uKGRhdGEpe1xyXG5cdFx0a3NhbmEuanM9ZGF0YTtcclxuXHRcdGtzYW5hLnJlYWR5PXRydWU7XHJcblx0fSk7XHJcbn1cclxubW9kdWxlLmV4cG9ydHM9a3NhbmFnYXA7IiwidmFyIHN0YXJ0ZWQ9ZmFsc2U7XHJcbnZhciB0aW1lcj1udWxsO1xyXG52YXIgYnVuZGxlZGF0ZT1udWxsO1xyXG52YXIgZ2V0X2RhdGU9cmVxdWlyZShcIi4vaHRtbDVmc1wiKS5nZXRfZGF0ZTtcclxudmFyIGNoZWNrSWZCdW5kbGVVcGRhdGVkPWZ1bmN0aW9uKCkge1xyXG5cdGdldF9kYXRlKFwiYnVuZGxlLmpzXCIsZnVuY3Rpb24oZGF0ZSl7XHJcblx0XHRpZiAoYnVuZGxlZGF0ZSAmJmJ1bmRsZWRhdGUhPWRhdGUpe1xyXG5cdFx0XHRsb2NhdGlvbi5yZWxvYWQoKTtcclxuXHRcdH1cclxuXHRcdGJ1bmRsZWRhdGU9ZGF0ZTtcclxuXHR9KTtcclxufVxyXG52YXIgbGl2ZXJlbG9hZD1mdW5jdGlvbigpIHtcclxuXHRpZiAoc3RhcnRlZCkgcmV0dXJuO1xyXG5cclxuXHR0aW1lcjE9c2V0SW50ZXJ2YWwoZnVuY3Rpb24oKXtcclxuXHRcdGNoZWNrSWZCdW5kbGVVcGRhdGVkKCk7XHJcblx0fSwyMDAwKTtcclxuXHRzdGFydGVkPXRydWU7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzPWxpdmVyZWxvYWQ7IiwiXHJcbnZhciBqc29ucD1mdW5jdGlvbih1cmwsZGJpZCxjYWxsYmFjayxjb250ZXh0KSB7XHJcbiAgdmFyIHNjcmlwdD1kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImpzb25wXCIpO1xyXG4gIGlmIChzY3JpcHQpIHtcclxuICAgIHNjcmlwdC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHNjcmlwdCk7XHJcbiAgfVxyXG4gIHdpbmRvdy5qc29ucF9oYW5kbGVyPWZ1bmN0aW9uKGRhdGEpIHtcclxuICAgIC8vY29uc29sZS5sb2coXCJyZWNlaXZlIGZyb20ga3NhbmEuanNcIixkYXRhKTtcclxuICAgIGlmICh0eXBlb2YgZGF0YT09XCJvYmplY3RcIikge1xyXG4gICAgICBpZiAodHlwZW9mIGRhdGEuZGJpZD09XCJ1bmRlZmluZWRcIikge1xyXG4gICAgICAgIGRhdGEuZGJpZD1kYmlkO1xyXG4gICAgICB9XHJcbiAgICAgIGNhbGxiYWNrLmFwcGx5KGNvbnRleHQsW2RhdGFdKTtcclxuICAgIH0gIFxyXG4gIH1cclxuXHJcbiAgd2luZG93Lmpzb25wX2Vycm9yX2hhbmRsZXI9ZnVuY3Rpb24oKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKFwidXJsIHVucmVhY2hhYmxlXCIsdXJsKTtcclxuICAgIGNhbGxiYWNrLmFwcGx5KGNvbnRleHQsW251bGxdKTtcclxuICB9XHJcblxyXG4gIHNjcmlwdD1kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcclxuICBzY3JpcHQuc2V0QXR0cmlidXRlKCdpZCcsIFwianNvbnBcIik7XHJcbiAgc2NyaXB0LnNldEF0dHJpYnV0ZSgnb25lcnJvcicsIFwianNvbnBfZXJyb3JfaGFuZGxlcigpXCIpO1xyXG4gIHVybD11cmwrJz8nKyhuZXcgRGF0ZSgpLmdldFRpbWUoKSk7XHJcbiAgc2NyaXB0LnNldEF0dHJpYnV0ZSgnc3JjJywgdXJsKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLmFwcGVuZENoaWxkKHNjcmlwdCk7IFxyXG59XHJcbnZhciBydW50aW1lX3ZlcnNpb25fb2s9ZnVuY3Rpb24obWlucnVudGltZSkge1xyXG4gIGlmICghbWlucnVudGltZSkgcmV0dXJuIHRydWU7Ly9ub3QgbWVudGlvbmVkLlxyXG4gIHZhciBtaW49cGFyc2VGbG9hdChtaW5ydW50aW1lKTtcclxuICB2YXIgcnVudGltZT1wYXJzZUZsb2F0KCBrc2FuYWdhcC5ydW50aW1lX3ZlcnNpb24oKXx8XCIxLjBcIik7XHJcbiAgaWYgKG1pbj5ydW50aW1lKSByZXR1cm4gZmFsc2U7XHJcbiAgcmV0dXJuIHRydWU7XHJcbn1cclxuXHJcbnZhciBuZWVkVG9VcGRhdGU9ZnVuY3Rpb24oZnJvbWpzb24sdG9qc29uKSB7XHJcbiAgdmFyIG5lZWRVcGRhdGVzPVtdO1xyXG4gIGZvciAodmFyIGk9MDtpPGZyb21qc29uLmxlbmd0aDtpKyspIHsgXHJcbiAgICB2YXIgdG89dG9qc29uW2ldO1xyXG4gICAgdmFyIGZyb209ZnJvbWpzb25baV07XHJcbiAgICB2YXIgbmV3ZmlsZXM9W10sbmV3ZmlsZXNpemVzPVtdLHJlbW92ZWQ9W107XHJcbiAgICBcclxuICAgIGlmICghdG8pIGNvbnRpbnVlOyAvL2Nhbm5vdCByZWFjaCBob3N0XHJcbiAgICBpZiAoIXJ1bnRpbWVfdmVyc2lvbl9vayh0by5taW5ydW50aW1lKSkge1xyXG4gICAgICBjb25zb2xlLndhcm4oXCJydW50aW1lIHRvbyBvbGQsIG5lZWQgXCIrdG8ubWlucnVudGltZSk7XHJcbiAgICAgIGNvbnRpbnVlOyBcclxuICAgIH1cclxuICAgIGlmICghZnJvbS5maWxlZGF0ZXMpIHtcclxuICAgICAgY29uc29sZS53YXJuKFwibWlzc2luZyBmaWxlZGF0ZXMgaW4ga3NhbmEuanMgb2YgXCIrZnJvbS5kYmlkKTtcclxuICAgICAgY29udGludWU7XHJcbiAgICB9XHJcbiAgICBmcm9tLmZpbGVkYXRlcy5tYXAoZnVuY3Rpb24oZixpZHgpe1xyXG4gICAgICB2YXIgbmV3aWR4PXRvLmZpbGVzLmluZGV4T2YoIGZyb20uZmlsZXNbaWR4XSk7XHJcbiAgICAgIGlmIChuZXdpZHg9PS0xKSB7XHJcbiAgICAgICAgLy9maWxlIHJlbW92ZWQgaW4gbmV3IHZlcnNpb25cclxuICAgICAgICByZW1vdmVkLnB1c2goZnJvbS5maWxlc1tpZHhdKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB2YXIgZnJvbWRhdGU9RGF0ZS5wYXJzZShmKTtcclxuICAgICAgICB2YXIgdG9kYXRlPURhdGUucGFyc2UodG8uZmlsZWRhdGVzW25ld2lkeF0pO1xyXG4gICAgICAgIGlmIChmcm9tZGF0ZTx0b2RhdGUpIHtcclxuICAgICAgICAgIG5ld2ZpbGVzLnB1c2goIHRvLmZpbGVzW25ld2lkeF0gKTtcclxuICAgICAgICAgIG5ld2ZpbGVzaXplcy5wdXNoKHRvLmZpbGVzaXplc1tuZXdpZHhdKTtcclxuICAgICAgICB9ICAgICAgICBcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBpZiAobmV3ZmlsZXMubGVuZ3RoKSB7XHJcbiAgICAgIGZyb20ubmV3ZmlsZXM9bmV3ZmlsZXM7XHJcbiAgICAgIGZyb20ubmV3ZmlsZXNpemVzPW5ld2ZpbGVzaXplcztcclxuICAgICAgZnJvbS5yZW1vdmVkPXJlbW92ZWQ7XHJcbiAgICAgIG5lZWRVcGRhdGVzLnB1c2goZnJvbSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiBuZWVkVXBkYXRlcztcclxufVxyXG52YXIgZ2V0VXBkYXRhYmxlcz1mdW5jdGlvbihhcHBzLGNiLGNvbnRleHQpIHtcclxuICBnZXRSZW1vdGVKc29uKGFwcHMsZnVuY3Rpb24oanNvbnMpe1xyXG4gICAgdmFyIGhhc1VwZGF0ZXM9bmVlZFRvVXBkYXRlKGFwcHMsanNvbnMpO1xyXG4gICAgY2IuYXBwbHkoY29udGV4dCxbaGFzVXBkYXRlc10pO1xyXG4gIH0sY29udGV4dCk7XHJcbn1cclxudmFyIGdldFJlbW90ZUpzb249ZnVuY3Rpb24oYXBwcyxjYixjb250ZXh0KSB7XHJcbiAgdmFyIHRhc2txdWV1ZT1bXSxvdXRwdXQ9W107XHJcbiAgdmFyIG1ha2VjYj1mdW5jdGlvbihhcHApe1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgICAgIGlmICghKGRhdGEgJiYgdHlwZW9mIGRhdGEgPT0nb2JqZWN0JyAmJiBkYXRhLl9fZW1wdHkpKSBvdXRwdXQucHVzaChkYXRhKTtcclxuICAgICAgICBpZiAoIWFwcC5iYXNldXJsKSB7XHJcbiAgICAgICAgICB0YXNrcXVldWUuc2hpZnQoe19fZW1wdHk6dHJ1ZX0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB2YXIgdXJsPWFwcC5iYXNldXJsK1wiL2tzYW5hLmpzXCI7ICAgIFxyXG4gICAgICAgICAgY29uc29sZS5sb2codXJsKTtcclxuICAgICAgICAgIGpzb25wKCB1cmwgLGFwcC5kYmlkLHRhc2txdWV1ZS5zaGlmdCgpLCBjb250ZXh0KTsgICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgfTtcclxuICBhcHBzLmZvckVhY2goZnVuY3Rpb24oYXBwKXt0YXNrcXVldWUucHVzaChtYWtlY2IoYXBwKSl9KTtcclxuXHJcbiAgdGFza3F1ZXVlLnB1c2goZnVuY3Rpb24oZGF0YSl7XHJcbiAgICBvdXRwdXQucHVzaChkYXRhKTtcclxuICAgIGNiLmFwcGx5KGNvbnRleHQsW291dHB1dF0pO1xyXG4gIH0pO1xyXG5cclxuICB0YXNrcXVldWUuc2hpZnQoKSh7X19lbXB0eTp0cnVlfSk7IC8vcnVuIHRoZSB0YXNrXHJcbn1cclxudmFyIGh1bWFuRmlsZVNpemU9ZnVuY3Rpb24oYnl0ZXMsIHNpKSB7XHJcbiAgICB2YXIgdGhyZXNoID0gc2kgPyAxMDAwIDogMTAyNDtcclxuICAgIGlmKGJ5dGVzIDwgdGhyZXNoKSByZXR1cm4gYnl0ZXMgKyAnIEInO1xyXG4gICAgdmFyIHVuaXRzID0gc2kgPyBbJ2tCJywnTUInLCdHQicsJ1RCJywnUEInLCdFQicsJ1pCJywnWUInXSA6IFsnS2lCJywnTWlCJywnR2lCJywnVGlCJywnUGlCJywnRWlCJywnWmlCJywnWWlCJ107XHJcbiAgICB2YXIgdSA9IC0xO1xyXG4gICAgZG8ge1xyXG4gICAgICAgIGJ5dGVzIC89IHRocmVzaDtcclxuICAgICAgICArK3U7XHJcbiAgICB9IHdoaWxlKGJ5dGVzID49IHRocmVzaCk7XHJcbiAgICByZXR1cm4gYnl0ZXMudG9GaXhlZCgxKSsnICcrdW5pdHNbdV07XHJcbn07XHJcblxyXG52YXIgc3RhcnQ9ZnVuY3Rpb24oa3NhbmFqcyxjYixjb250ZXh0KXtcclxuICB2YXIgZmlsZXM9a3NhbmFqcy5uZXdmaWxlc3x8a3NhbmFqcy5maWxlcztcclxuICB2YXIgYmFzZXVybD1rc2FuYWpzLmJhc2V1cmx8fCBcImh0dHA6Ly8xMjcuMC4wLjE6ODA4MC9cIitrc2FuYWpzLmRiaWQrXCIvXCI7XHJcbiAgdmFyIHN0YXJ0ZWQ9a3NhbmFnYXAuc3RhcnREb3dubG9hZChrc2FuYWpzLmRiaWQsYmFzZXVybCxmaWxlcy5qb2luKFwiXFx1ZmZmZlwiKSk7XHJcbiAgY2IuYXBwbHkoY29udGV4dCxbc3RhcnRlZF0pO1xyXG59XHJcbnZhciBzdGF0dXM9ZnVuY3Rpb24oKXtcclxuICB2YXIgbmZpbGU9a3NhbmFnYXAuZG93bmxvYWRpbmdGaWxlKCk7XHJcbiAgdmFyIGRvd25sb2FkZWRCeXRlPWtzYW5hZ2FwLmRvd25sb2FkZWRCeXRlKCk7XHJcbiAgdmFyIGRvbmU9a3NhbmFnYXAuZG9uZURvd25sb2FkKCk7XHJcbiAgcmV0dXJuIHtuZmlsZTpuZmlsZSxkb3dubG9hZGVkQnl0ZTpkb3dubG9hZGVkQnl0ZSwgZG9uZTpkb25lfTtcclxufVxyXG5cclxudmFyIGNhbmNlbD1mdW5jdGlvbigpe1xyXG4gIHJldHVybiBrc2FuYWdhcC5jYW5jZWxEb3dubG9hZCgpO1xyXG59XHJcblxyXG52YXIgbGl2ZXVwZGF0ZT17IGh1bWFuRmlsZVNpemU6IGh1bWFuRmlsZVNpemUsIFxyXG4gIG5lZWRUb1VwZGF0ZTogbmVlZFRvVXBkYXRlICwganNvbnA6anNvbnAsIFxyXG4gIGdldFVwZGF0YWJsZXM6Z2V0VXBkYXRhYmxlcyxcclxuICBzdGFydDpzdGFydCxcclxuICBjYW5jZWw6Y2FuY2VsLFxyXG4gIHN0YXR1czpzdGF0dXNcclxuICB9O1xyXG5tb2R1bGUuZXhwb3J0cz1saXZldXBkYXRlOyIsImZ1bmN0aW9uIG1rZGlyUCAocCwgbW9kZSwgZiwgbWFkZSkge1xyXG4gICAgIHZhciBwYXRoID0gbm9kZVJlcXVpcmUoJ3BhdGgnKTtcclxuICAgICB2YXIgZnMgPSBub2RlUmVxdWlyZSgnZnMnKTtcclxuXHRcclxuICAgIGlmICh0eXBlb2YgbW9kZSA9PT0gJ2Z1bmN0aW9uJyB8fCBtb2RlID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICBmID0gbW9kZTtcclxuICAgICAgICBtb2RlID0gMHgxRkYgJiAofnByb2Nlc3MudW1hc2soKSk7XHJcbiAgICB9XHJcbiAgICBpZiAoIW1hZGUpIG1hZGUgPSBudWxsO1xyXG5cclxuICAgIHZhciBjYiA9IGYgfHwgZnVuY3Rpb24gKCkge307XHJcbiAgICBpZiAodHlwZW9mIG1vZGUgPT09ICdzdHJpbmcnKSBtb2RlID0gcGFyc2VJbnQobW9kZSwgOCk7XHJcbiAgICBwID0gcGF0aC5yZXNvbHZlKHApO1xyXG5cclxuICAgIGZzLm1rZGlyKHAsIG1vZGUsIGZ1bmN0aW9uIChlcikge1xyXG4gICAgICAgIGlmICghZXIpIHtcclxuICAgICAgICAgICAgbWFkZSA9IG1hZGUgfHwgcDtcclxuICAgICAgICAgICAgcmV0dXJuIGNiKG51bGwsIG1hZGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzd2l0Y2ggKGVyLmNvZGUpIHtcclxuICAgICAgICAgICAgY2FzZSAnRU5PRU5UJzpcclxuICAgICAgICAgICAgICAgIG1rZGlyUChwYXRoLmRpcm5hbWUocCksIG1vZGUsIGZ1bmN0aW9uIChlciwgbWFkZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlcikgY2IoZXIsIG1hZGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgbWtkaXJQKHAsIG1vZGUsIGNiLCBtYWRlKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICAvLyBJbiB0aGUgY2FzZSBvZiBhbnkgb3RoZXIgZXJyb3IsIGp1c3Qgc2VlIGlmIHRoZXJlJ3MgYSBkaXJcclxuICAgICAgICAgICAgLy8gdGhlcmUgYWxyZWFkeS4gIElmIHNvLCB0aGVuIGhvb3JheSEgIElmIG5vdCwgdGhlbiBzb21ldGhpbmdcclxuICAgICAgICAgICAgLy8gaXMgYm9ya2VkLlxyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgZnMuc3RhdChwLCBmdW5jdGlvbiAoZXIyLCBzdGF0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgdGhlIHN0YXQgZmFpbHMsIHRoZW4gdGhhdCdzIHN1cGVyIHdlaXJkLlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGxldCB0aGUgb3JpZ2luYWwgZXJyb3IgYmUgdGhlIGZhaWx1cmUgcmVhc29uLlxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlcjIgfHwgIXN0YXQuaXNEaXJlY3RvcnkoKSkgY2IoZXIsIG1hZGUpXHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBjYihudWxsLCBtYWRlKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn1cclxuXHJcbm1rZGlyUC5zeW5jID0gZnVuY3Rpb24gc3luYyAocCwgbW9kZSwgbWFkZSkge1xyXG4gICAgdmFyIHBhdGggPSBub2RlUmVxdWlyZSgncGF0aCcpO1xyXG4gICAgdmFyIGZzID0gbm9kZVJlcXVpcmUoJ2ZzJyk7XHJcbiAgICBpZiAobW9kZSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgbW9kZSA9IDB4MUZGICYgKH5wcm9jZXNzLnVtYXNrKCkpO1xyXG4gICAgfVxyXG4gICAgaWYgKCFtYWRlKSBtYWRlID0gbnVsbDtcclxuXHJcbiAgICBpZiAodHlwZW9mIG1vZGUgPT09ICdzdHJpbmcnKSBtb2RlID0gcGFyc2VJbnQobW9kZSwgOCk7XHJcbiAgICBwID0gcGF0aC5yZXNvbHZlKHApO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgICAgZnMubWtkaXJTeW5jKHAsIG1vZGUpO1xyXG4gICAgICAgIG1hZGUgPSBtYWRlIHx8IHA7XHJcbiAgICB9XHJcbiAgICBjYXRjaCAoZXJyMCkge1xyXG4gICAgICAgIHN3aXRjaCAoZXJyMC5jb2RlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgJ0VOT0VOVCcgOlxyXG4gICAgICAgICAgICAgICAgbWFkZSA9IHN5bmMocGF0aC5kaXJuYW1lKHApLCBtb2RlLCBtYWRlKTtcclxuICAgICAgICAgICAgICAgIHN5bmMocCwgbW9kZSwgbWFkZSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgIC8vIEluIHRoZSBjYXNlIG9mIGFueSBvdGhlciBlcnJvciwganVzdCBzZWUgaWYgdGhlcmUncyBhIGRpclxyXG4gICAgICAgICAgICAvLyB0aGVyZSBhbHJlYWR5LiAgSWYgc28sIHRoZW4gaG9vcmF5ISAgSWYgbm90LCB0aGVuIHNvbWV0aGluZ1xyXG4gICAgICAgICAgICAvLyBpcyBib3JrZWQuXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICB2YXIgc3RhdDtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdCA9IGZzLnN0YXRTeW5jKHApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2F0Y2ggKGVycjEpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnIwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKCFzdGF0LmlzRGlyZWN0b3J5KCkpIHRocm93IGVycjA7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG1hZGU7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IG1rZGlyUC5ta2RpcnAgPSBta2RpclAubWtkaXJQID0gbWtkaXJQO1xyXG4iXX0=
