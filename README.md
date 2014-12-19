_2048
=====


Array.prototype.insert=function(i,a){
// 例1: [2,3,4].insert(0,1) ==> [1,2,3,4]
// 例2: [1,2,3].insert(4,4) ==> [1,2,3,4]
	this.splice(i,0,a); return this;
}
Array.prototype.delete=function(i){
// 例1: [1,2,3,4].delete(0) ==> [2,3,4]
// 例2: [1,2,3,4].delete(3) ==> [1,2,3]
	this.splice(i,1); return this;
}
Array.prototype.deleteFirst=function(a){
// 例1: [1,2,3,2].deleteFirst(2) ==> [1,3,2]
	this.splice(this.indexOf(a),1); return this;
}
Array.prototype.deleteLast=function(a){
// 例1: [1,2,3,2].deleteLast(2) ==> [1,2,3]
	this.splice(this.lastIndexOf(a),1); return this;
}
Array.prototype.deleteAll=function(a){
// 例1: [1,2,3,2].deleteAll(2) ==> [1,3]
	return this.filter(function(x){return x!==a});
}


如何使用 REGEDIT 修改啟動區?

1. 從左下角 [開始] 按滑鼠右鍵 找到 [執行] 點選

2. 在 開啟對話框 輸入 regedit 然後 按 [確定] 

3. 依序點選 HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Run

4. 右側名稱就是所有電腦一開始會啟動的執行程式

5. 發現有問題的程式就點滑鼠右鍵 然後 [刪除]
