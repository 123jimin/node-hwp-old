var util = require('util');

var hml = {};

var h = hml.HML = function HML(){
	this.name = ''; this.value = null;
	this.child = [];
	this.attr = {};
};

hml.TEXT = function TEXT(){
	this.text = "";
};

hml.HML.prototype.add = function add(elem){
	this.child.push(elem);
};

hml.HML.prototype.toHMLString = function toHML(){
	var e,i,hml = '<'+this.name;
	for(e in this.attr){
		hml+' '+e+'="'+this.attr[e]+'"';
	}
	hml+='>';
	for(i=0;i<this.child.length;i++) hml+=this.child[i].toHMLString();
	if(this.value) hml+=this.value;
	hml+='</'+this.name+'>';
	return hml;
};

hml.TEXT.prototype.toHML = function toHML(){
	return this.text;
};

util.inherits(hml.HWPML = function HML_HWPML(){
	h.call(this);
	this.name = 'HWPML';
	this.attr.Version = '2.8';
	this.attr.SubVersion = '8.0.0.0';
	this.attr.Style2 = 'embed';
}, h);

/// HEAD
util.inherits(hml.HEAD = function HML_HEAD(){
	h.call(this);
	this.name = 'HEAD';
	this.attr.SecCnt = null;
}, h);

// DOCSUMMARY
util.inherits(hml.DOCSUMMARY = function HML_DOCSUMMARY(){
	h.call(this);
	this.name = 'DOCSUMMARY';
}, h);

util.inherits(hml.TITLE = function TITLE(){
	h.call(this);
	this.name = 'TITLE';
}, h);

util.inherits(hml.SUBJECT = function SUBJECT(){
	h.call(this);
	this.name = 'SUBJECT';
}, h);

util.inherits(hml.AUTHOR = function AUTHOR(){
	h.call(this);
	this.name = 'AUTHOR';
}, h);

util.inherits(hml.DATE = function DATE(){
	h.call(this);
	this.name = 'DATE';
}, h);

util.inherits(hml.KEYWORDS = function KEYWORDS(){
	h.call(this);
	this.name = 'KEYWORDS';
}, h);

util.inherits(hml.COMMENTS = function COMMENTS(){
	h.call(this);
	this.name = 'COMMENTS';
}, h);

util.inherits(hml.FORBIDDENSTRING = function FORBIDDENSTRING(){
	h.call(this);
	this.name = 'FORBIDDENSTRING';
}, h);

util.inherits(hml.FORBIDDEN = function FORBIDDEN(){
	h.call(this);
	this.name = 'FORBIDDEN';
	this.value = null;
	this.attr.id = null;
}, h);

// DOCSETTING
util.inherits(hml.DOCSETTING = function DOCSETTING(){
	h.call(this);
	this.name = 'DOCSETTING';
}, h);

util.inherits(hml.BEGINNUMBER = function BEGINNUMBER(){
	h.call(this);
	this.name = 'BEGINNUMBER';
	this.attr.Page = 1;
	this.attr.Footnote = 1;
	this.attr.Endnote = 1;
	this.attr.Picture = 1;
	this.attr.Table = 1;
	this.attr.Equation = 1;
	this.attr.TotalPage = 1;
}, h);

exports.hml = hml;
