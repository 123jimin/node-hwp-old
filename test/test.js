var HWPDoc = require('../').HWPDocument;
var openThis1 = new HWPDoc('openThis1.hwp');
openThis1.on('ready', function(){
	console.log(openThis1.toHMLString());
});
