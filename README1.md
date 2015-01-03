#jefvm

**jefvm** is a **jef** (javascript easy forth or jeforth) **vm** (virtual machine). Once jefvm is loaded, we have vm, an instance of jefvm.  We could use javascript to define jef words, the instructions, to be executed.

A. 用 vm 如何執行 符式程序?
-------------------------

將 符式程序 tib 字串 當作 輸入參數, 呼叫 vm.exec。

語法: **vm.exec(tib)**

作用: vm.exec 解析 輸入參數 tib 字串, 進入 源碼解譯 迴圈, 區隔 不含空格的字串 token 來逐一解讀。

      1.     若是 此 token 為 指令名稱 則:
      1.1.      執行 此指令 (或將 此指令 編成 comiled code 放到 cArea)。
      2.     若是 此 token 可解讀 為 資料 則:
      2.1.      將 此資料 放上 **vm.dStack** (或將 此資料 編成 comiled code 放到 cArea)。
      3.     若否 則: 視為錯誤 停止逐一解讀。

例01: 用 vm.exec 執行 code, 定義 binary 指令。 使執行 binary 後, 可解讀 token 為 二進制整數。

	  vm.exec('code binary function(){ vm.base=2 } end-code');

例02: 用 vm.exec 執行 code, 定義 decimal 指令。 使執行 decimal 後, 可解讀 token 為 十進制整數。

	  vm.exec('code decimal function(){ vm.base=10 } end-code');

例03: 用 vm.exec 執行 code, 定義 hex 指令。 使執行 hex 後, 可解讀 token 為 十六進制整數。

	  例03: vm.exec('code hex function(){ vm.base=16 } end-code');

B. vm 預設可正確解讀 作為資料 的 token 格式 有六種
-----------------------------------------------

	  1. 整數 例如: 0 150 -3 等 (十進制)。
	  2. 實數 例如: 3.1416 -.5 5e3 69.3e-2 等 (十進制)。
	  3. 英文雙引號所夾可含空格的字串 例如: "hello" "I am happy!" 等。
	  4. 英文單引號所夾不含空格的字串 例如: 'hello' ('hello' 與 "hello" 代表 相同字串) 。
	  5. $後隨十六進制的整數 例如: $ff00 $61 等。
	  6. vm.base 指定 進制基數 的 整數 例如: decimal 127 hex 7f binary 1111111 (三個數相同)。

C. vm 還可 解讀 其他外加的 token 格式
-----------------------------------

我們可以設定 vm.extData 為 自定的 javascript 程序, 用以 解讀 token, 回傳 對應的資料。

語法: **vm.extData=function (token){ if( ... ) return ... }**

例04: 設定 vm.extData 可使 #nnn 格式的 token 解讀為 rgb 色碼

	  vm.extData=function (token){
	    if( token.match(/^#[0-9a-f]{3}/) ) return token
	  }

例05: 設定 vm.extData 還可使 #nnnn 格式的 token 解讀為特別的 rgba 色碼

	  vm.extData=function (token){
	    if( token.match(/^#[0-9a-f]{3}/) ) return token
	    if( token.match(/^#[0-9a-f]{4}/) )
	      return			      'rgba(' +
	        parseInt(token.charAt(1),16)*255/15 + ',' + // 紅光度 0 ~ f 對應轉為 0 ~ 255
	        parseInt(token.charAt(2),16)*255/15 + ',' + // 綠光度 0 ~ f 對應轉為 0 ~ 255
	        parseInt(token.charAt(3),16)*255/15 + ',' + // 藍光度 0 ~ f 對應轉為 0 ~ 255
	        parseInt(token.charAt(4),16)    /15 + ')'   // 遮透度 0 ~ f 對應轉為 0 ~   1
      }

註: 若 token 是 #nnn 格式, 其中 n 都是十六進制的一位整數, 就直接回傳 token 字串。若 token 是較特別的 #nnnn 格式, 其中 n 都是十六進制一位整數, 就將前三個 n 都分別轉為對應 0 ~ 255 的 rgb 顏色光度, 並將第四個 n 轉為對應 0 ~ 1 的 遮透度, 組成正確的 rgba 格式字串 回傳。

D. vm 中 每個 指令 word 物件 的主要 屬性
--------------------------------------
1. word.id **指令序號** (在 words 指令集 中的 非 0 序號)
2. word.name **指令名稱** (可包含任何 unicode 特殊符號與中文)
3. word.xt **執行程序** (javascript function) 或 **編碼位置** (cArea 序號)
4. word.immediate **編譯中也執行**
5. word.compileOnly	**編譯中才執行**

E. vm 可用相關 資源
-------------------
1. 對應指令 **nameWord** 物件。
   例如: word=vm.nameWord['binary'] 可取得 指令名稱 binary 最後定義的 指令 word 物件。
2. 指令集 **words** 陣列。
   蒐集所有的 指令 word 物件 (含所有同名指令)。
3. 資料堆疊 **dStack** 陣列。
   vm.dStack.length 為 堆疊項數, d=vm.dStack.pop() 從堆頂取出 d, vm.dStack.push(d) 將 d 放上堆頂。
4. 回返堆疊 **rStack** 陣列。
   vm.rStack.length 為 堆疊項數, r=vm.rStack.pop() 從堆頂取出 r, vm.rStack.push(r) 將 r 放上堆頂。
5. 編碼區 **cArea** 陣列。
   vm.ip 為 編碼執行 指標, 實為 vm.cArea 項目 序號。
6. 輸出字串 **tob** 字串。
7. 輸入字串 **tib** 字串。
   vm.nTib 為 輸入解析 指標, 實為 vm.tib 字符 序號。
   vm.nextToken() 可用以在 vm.tib 上 vm.nTib 位置 取得隨後 token。
8. 輸入紀錄 **cmds** 陣列, 其項目 實為 逐次的 輸入字串 tib。
   vm.iCmd 為  輸入選取 指標, 實為 vm.cmds 項目 序號。

F. vm 可 檢視/更改 相關機制
---------------------------
1. vm.base	整數進制基數
2. vm.compiling 編譯狀態
3. vm.erroe	錯誤訊息
4. vm.waiting	暫停旗標
   跳出 源碼解譯/編碼執行 迴圈, 等候 指定 ms 秒數 或 源碼單步 後續執行
5. vm.resumeExec()
   依 vm.ip, vm.cArea, vm.rStack, vm.nTib, vm.tib, vm.dStack 回復 後續執行

---------
##version 0

Once **jefvm.v0.js** is loaded via [espruino web ide](https://www.google.com.tw/url?sa=t&rct=j&q=&esrc=s&source=web&cd=1&cad=rja&uact=8&ved=0CCEQFjAA&url=https%3AFFchrome.google.comFwebstoreFdetailFespruino-web-ideFbleoifhkdalbjfbobjackfdifdneehpo&ei=3ngfVIa7Mc3q8AX884CIAQ&usg=AFQjCNHyNk_XkpLYJ6DNByefI7znAP5lgg&sig2=XZR5mUsyb8sJv3U7rR9YkQ "%3"), we have **vm**, an instance of jefvm. **vm.words** is implemented as a collecting list of all jef words. Each jef word is an object having atributes at leaset **name**, **id**, and **xt**. **name** is a string including any kind of characters except space. **id** is a positive integer which is actually the index of **vm.words**. **xt** is the javascript function to be executed. Initially, this list had only the jef word **code** as **vm.words[1]**. Then we could call the function **vm.exec** to interpret a quoted string (with **single quotes** or **double quotes**) executing **code** to define many more jef words in javascript to execute.

1. For example, we could **define** a jef word **r1** to turn on red led (the LED3 on discovery board) with **single quotes** as follows.
    ```
    vm.exec('code r1 function(){ LED3.write(1); } end-code');
    ```

2. we could then **execute** the jef word **r1** to turn on the red led as follows.
    ```
    vm.exec('r1');
    ```

3. In the same way, we could define other jef words g1, b1, y1 to turn on green led, blue led, yellow led, respectively.
    ```
    vm.exec('code g1 function(){LED2.write(1);}end-code');
    vm.exec('code b1 function(){LED4.write(1);}end-code');
    vm.exec('code y1 function(){LED1.write(1);}end-code');
    ```
    
4. In the same way, **r0** cound be defined to turn off red led. And other jef words g0, b0, y0 could be defined, to turn off green, blue, yellow leds as follows.
    ```
    vm.exec('code r0 function(){LED3.write(0);}end-code');
    vm.exec('code g0 function(){LED2.write(0);}end-code');
    vm.exec('code b0 function(){LED4.write(0);}end-code');
    vm.exec('code y0 function(){LED1.write(0);}end-code');
    ```

---------
##version 1

**jefvm.v1** implemented **vm.dStack** as data stack passing numbers and strings to be processed among words. **vm.clear()** could be used to clear vm.dstack. Many jef words could be defined to compute, to convert, and to print the data. Also, jefvm.v1 implemented **vm.tob**, the terminal output buffer, to print data. While printing, **vm.type()** is used to pop the top of vm.dstack and append it to vm.tob. Latter, **vm.cr()** is used to print vm.tob and clear vm.tob. As well, jefvm.v1 implemented **vm.base** for number conversion.

1. For example, we could put **numbers**, such as 123, 4.56, -10, and hexadecimal 41, on data stack as follows.
    ```
    vm.exec('123 4.56 -10 $41');
    ```

2. we could put **strings** using **double quotes**, such as "abc" and "def 123", on data stack as follows.
    ```
    vm.exec('"abc" "def 123"');
    ```

3. another way to put a **string** using **single quotes** (but without space) on data stack, such as 'ghi'.
    ```
    vm.exec("'ghi'");
    ```

4. We could take **vm.type** as a new jef word **type** to pop string or number (automatically converted to string) and append it to vm.tob, the terminal output buffer. In the same way, we could take **vm.cr** as a new jef word **cr** to print out vm.tob and clear vm.tob.
    ```
    vm.addword('type',vm.type);
    vm.addword('cr'  ,vm.cr  );
    ```

5. We could define a new jef word **.** (**dot**) to type top of data stack and one more space as follows.
    ```
    vm.exec('code . function(){vm.type(), vm.type(" ");} end-code');
    ```

6. Then, we could test the jef words **type** and **.** (**dot**) sending the string '52 5 ' to vm.tob as follows.
    ```
    vm.exec('5 type 2 . 5 .');
    ```

7. We could define **arithmatic operations** +, -, *, and / as jef words. Each of them pops two items (numbers or strings) from data stack and push back the computational result to data stack.
    ```
    vm.exec(
    'code + function(){                                        '+
    '  var b=vm.dStack.pop();vm.dStack.push(vm.dStack.pop()+b);'+
    '} end-code                                                '+
    'code - function(){                                        '+
    '  var b=vm.dStack.pop();vm.dStack.push(vm.dStack.pop()-b);'+
    '} end-code                                                '+
    'code * function(){                                        '+
    '  var b=vm.dStack.pop();vm.dStack.push(vm.dStack.pop()*b);'+
    '} end-code                                                '+
    'code / function(){                                        '+
    '  var b=vm.dStack.pop();vm.dStack.push(vm.dStack.pop()/b);'+
    '} end-code                                                ');
    ```

8. We could test the **arithmatic operations** as follows to get 'abc defghi 3' as vm.tob.
    ```
    vm.exec('"abc def" ' + "'ghi' + . 2.23 0.23 - 3 * 2 / .");
    ```
   
9. We could define **hex**, **decimal**, **binary** as jef words to change **vm.base**, the number convertion base, so that hexadecimal or bainary numbers could be entered or printed easily.
    ```
    vm.exec('code hex     function(){vm.base=16;} end-code');
    vm.exec('code decimal function(){vm.base=10;} end-code');
    vm.exec('code binary  function(){vm.base= 2;} end-code');
    ```
   
10. We could test conversion of decimal 128 to get hexadecimal string '80'.
    ```
    vm.exec('decimal 128 hex . decimal');
    ```

11. We could test conversion of hexadecimal 100 to get decimal string '256'.
    ```
    vm.exec('hex 100 decimal .');
    ```

12. We could test conversion of decimal 11 to get binary string '1011'.
    ```
    vm.exec('decimal 11 binary . decimal');
    ```

13. We could define a new jef word **.r** (called 'dot r') to pop w and n from data stack and print n **right aligned** in a field of m characters wide.
    ```
    vm.exec(
    'code .r function(){							'+
    '  var w=vm.dStack.pop(), n=""+vm.dStack.pop(); '+
    '  vm.type("         ".substr(0,w-n.length)+n)  '+
    '} end-code                                     ');
    ```

14. We could try **.r** as follows to get '  5 10 15' as vm.tob.
    ```
    vm.exec('5 3 .r 10 3 .r 15 3 .r');
    ```

---------
##version 2

**jefvm.v2** implemented **vm.cArea** as code area, a list to hold all the compiled codes of high level colon definitions, in which all jef words are called just by names. Also it implemented **vm.ip** and **vm.rStack** as instrction pointer and return stack for inner interpreting to execute the compiled codes of jef words in high level colon definitions. **vm.call(addr)** is used to call the compiled codes at **addr** in vm.cArea (previous vm.ip will be pushed onto return stack first, then vm.ip will be set to addr). Also the following control flow words were implemented:

        flag if ... then
        flag if ... else ... then
        n for ... next
        begin ... again
        begin ... flag until
        begin ... flag while ... repeat

1. Firstly, **compiled codes** doing '3 .r' could be set at 1 in **vm.cArea** as follows, where **vm.nameWord['doLit']** is used to get the jef word of **doLit**, which will push its following 3 onto data stack at run time, **vm.nameWord['.r']**  is used to get the jef word of **.r**, **vm.nameWord['exit']** is used to get the jef word of **exit** which will finish high level calling and pop back previous vm.ip from return stack.

    ```
    vm.cArea=[ 0,vm.nameWord['doLit'],3,vm.nameWord['.r'],vm.nameWord['exit'] ];
    ```
 and defined as high level word t as follows.

    ```
    vm.addWord('t',1);
    ```
2. We could then try **t** as follows to get the same result as previous test.
    ```
    vm.exec('5 t 10 t 15 t');
    ```

3. Actually, we could define **:** (**colon**) and **;** (**semicolon**) to define high level definition in which any existig word could be called by name. In the following, the word **immediate** is defined as well. It is used here to declare the word **;** (semicolon) as an immediate word so that it will not be compiled but compile **exit** and close the high level definition as follows.
    ```
    vm.exec(
	    'code : function colon(){						' +
	    '  vm.newName=vm.nextToken(),					' +
	    '  vm.newXt=vm.cArea.length,vm.compiling=1;    	' +
	    '} end-code    									' +
	    'code immediate function immediate(){			' +
	    '  vm.words[vm.words.length-1].immediate=1;		' +
	    '} end-code    									' +
	    'code ; function semicolon(){					' +
	    '  vm.compileCode("exit"),vm.compiling=0,		' +
	    '  vm.addWord(vm.newName,vm.newXt);    			' +
	    '} end-code immediate                           '
    );
    vm.exec(': x 3 .r ;');
    ```

4. The compiled code of **x** is exactly the same as **t**. So we could try **x** as follows to get the same result as previous test.
    ```
    vm.exec('5 x 10 x 15 x');
    ```



