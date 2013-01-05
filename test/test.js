var HWPDoc = require('../').HWPDocument;
var openThis1 = new HWPDoc('Style.hwp');
console.time('HWP -> HML');
openThis1.on('ready', function(){
	console.log(openThis1.toHMLString());
	console.timeEnd('HWP -> HML');
});
