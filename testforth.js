var Jeforthvm=require("./jefvm.v3.js");
var vm=new Jeforthvm();
var ext=require("./jefvm.v3_ext.js");
ext(vm);
var tst=require("./jefvm.v3_tst.js");
tst(vm);
