var hml = require('../hml.js').hml;

var hmlsToHTML = function(nodes){
	for(var h='',i=0;i<nodes.length;i++) h+=hmlToHTML(nodes[i]);
	return h;
};
var hmlToHTML = function(node){
	var html = '';
	switch(node.name){
		case 'P':
			html += '<p class="paraShape'+node.attr.ParaShape+' paraStyle'+node.attr.Style+'">';
			html += hmlsToHTML(node.child);
			html += '</p>';
			break;
		case 'TEXT':
			html += '<span class="charShape'+node.attr.CharShape+'">';
			html += hmlsToHTML(node.child);
			html += '</span>';
			break;
		case 'CHAR':
			html += hml.escape(node.value);
			break;
		case 'SECDEF': case 'COLDEF':
			break;
		default:
			// TODO :
	}
	return html;
};
var getColor = function(c){
	c = +c;
	return 'rgb('+(c&0xFF)+','+((c>>8)&0xFF)+','+((c>>16)&0xFF)+')';
};
exports.convert = function(htmlDoc){
	var i,html = '<!DOCTYPE html>\n';
	html += '<html><head><meta charset="utf-8"/><meta name="generator" content="node-hwp"/>';
	var hmlDoc = htmlDoc.getHML();
	html += '<title>'+hml.escape(hmlDoc.go('head').go('docsummary').go('title').value)+'</title>';
	
	var mappingTable = hmlDoc.go('head').go('mappingtable');
	var faceNameList = mappingTable.go('facenamelist').child;
	var charShapeList = mappingTable.go('charshapelist').child;
	var paraShapeList = mappingTable.go('parashapelist').child;
	
	var body = hmlDoc.go('body');
	
	html += '<style>p{margin:0;padding:0;}body{background-color:#CCC;padding-top:0;}';
	html += '.section{margin:auto;background-color:white;box-shadow:0 0 10px #666;}';
	for(i=0;i<charShapeList.length;i++){
		var charShape = charShapeList[i];
		var fontSize = (charShape.attr.Height/100)*(charShape.go('relsize').attr.Hangul/100);
		var underline = charShape.findChild('underline');
		var strikeout = charShape.findChild('strikeout');
		html += '.charShape'+charShape.attr.Id+'{';
		html += 'font-family:"'+faceNameList[0].child[+charShape.go('fontid').attr.Hangul].attr.Name+'";';
		html += 'font-size:'+fontSize+'pt;';
		html += 'color:'+getColor(charShape.attr.TextColor)+';';
		html += 'letter-spacing:'+charShape.go('charspacing').attr.Hangul+'%;';
		if(underline){
			html += 'text-decoration:underline;';
			html += '-moz-text-decoration-color:'+getColor(underline.attr.Color)+';';
		}
		if(strikeout){
			html += 'text-decoration:line-through;';
			html += '-moz-text-decoration-color:'+getColor(strikeout.attr.Color)+';';
		}
		if(charShape.findChild('bold')){
			html += 'font-weight:bold;';
		}
		if(charShape.findChild('italic')){
			html += 'font-style:italic;';
		}
		html += '}';
	}
	for(i=0;i<paraShapeList.length;i++){
		var paraShape = paraShapeList[i];
		html += '.paraShape'+paraShape.attr.Id+'{';
		var paraMargin = paraShape.go('paramargin');
		html += 'margin: '+(paraMargin.attr.Prev/100)+'pt '+(paraMargin.attr.Right/100)+'pt '+(paraMargin.attr.Next/100)+'pt '+(paraMargin.attr.Left/100)+'pt;';
		/*
		switch(paraMargin.attr.LineSpacingType){
			case 'Percent':
				html += 'line-height:';
				html += paraMargin.attr.LineSpacing/100;
				html += 'em;';
				break;
		}
		*/
		html += '}';
	}
	for(i=0;i<body.child.length;i++){
		var section = body.child[i];
		var secDef = section.go('p').go('text').go('secdef');
		var pageDef = secDef.go('pagedef');
		var pageMargin = pageDef.go('pagemargin');
		html += '#section'+section.attr.Id+'{';
		html += 'width:'+((pageDef.attr.Width-pageMargin.attr.Left-pageMargin.attr.Right)/100)+'pt;';
		html += 'padding:'+((pageMargin.attr.Top+pageMargin.attr.Header)/100)+'pt '+(pageMargin.attr.Right/100)+'pt '+((pageMargin.attr.Bottom+pageMargin.attr.Footer)/100)+'pt '+(pageMargin.attr.Left/100)+'pt;';
		html += '}';
	}
	html += '</style>';
	
	html += '</head><body>';
	
	for(i=0;i<body.child.length;i++){
		var section = body.child[i];
		html += '<div id="section'+section.attr.Id+'" class="section">';
		html += hmlsToHTML(section.child);
		html += '</div>';
	}
	
	html += '</body></html>';
	return html;
};
