var require_kdb=[{filename:"_2048.kdb", url:"http://rawgit.com/samsuanchen/_2048/master/_2048.kdb" , desc:"_2048"}];
var Main = React.createClass({
  mixins:[Require("defaultmain")],
  dbid:"_2048",
  defaultTofind:"",
  require_kdb:require_kdb,
});
module.exports=Main;