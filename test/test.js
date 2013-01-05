var HWPDoc = require('../').HWPDocument;
var openThis1 = new HWPDoc('Style.hwp');
openThis1.on('ready', function(){
	console.log(openThis1.toHMLString());
});
