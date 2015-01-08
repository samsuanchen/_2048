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
