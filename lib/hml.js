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

util.inherits(hml.CARETPOS = function CARETPOS(){
	h.call(this);
	this.name = 'CARETPOS';
	this.attr.List = null;
	this.attr.Para = null;
	this.attr.Pos = null;
}, h);

// MAPPINGTABLE
util.inherits(hml.MAPPINGTABLE = function MAPPINGTABLE(){
	h.call(this);
	this.name = 'MAPPINGTABLE';
}, h);

util.inherits(hml.BINDATALIST = function BINDATALIST(){
	h.call(this);
	this.name = 'BINDATALIST';
	this.attr.Count = 0;
}, h);

util.inherits(hml.BINITEM = function BINITEM(){
	h.call(this);
	this.name = 'BINITEM';
	this.attr.Type = null;
	this.attr.APath = undefined;
	this.attr.RPath = undefined;
	this.attr.BinData = undefined;
	this.attr.Format = undefined;
}, h);

util.inherits(hml.FACENAMELIST = function FACENAMELIST(){
	h.call(this);
	this.name = 'FACENAMELIST';
}, h);

util.inherits(hml.FONTFACE = function FONTFACE(){
	h.call(this);
	this.name = 'FONTFACE';
	this.attr.Lang = null;
	this.attr.Count = null;
}, h);

util.inherits(hml.FONT = function FONT(){
	h.call(this);
	this.name = 'FONT';
	this.attr.Id = null;
	this.attr.Type = null;
	this.attr.Name = null;
}, h);

util.inherits(hml.SUBSTFONT = function SUBSTFONT(){
	h.call(this);
	this.name = 'SUBSTFONT';
	this.attr.Type = null;
	this.attr.Name = null;
}, h);

util.inherits(hml.TYPEINFO = function TYPEINFO(){
	h.call(this);
	this.name = 'TYPEINFO';
	this.attr.FamilyType = null;
	this.attr.SerifStyle = null;
	this.attr.Weight = null;
	this.attr.Proportion = null;
	this.attr.Contrast = null;
	this.attr.StrokeVariation = null;
	this.attr.ArmStype = null;
	this.attr.Letterform = null;
	this.attr.Midline = null;
	this.attr.XHeight = null;
}, h);

util.inherits(hml.BORDERFILLLIST = function BORDERFILLLIST(){
	h.call(this);
	this.name = 'BORDERFILLLIST';
	this.Count = null;
}, h);

util.inherits(hml.BORDERFILL = function BORDERFILL(){
	h.call(this);
	this.name = 'BORDERFILL';
	this.attr.Id = null;
	this.attr.ThreeD = 'false';
	this.attr.Shadow = 'false';
	this.attr.Slash = 0;
	this.attr.BackSlash = 0;
	this.attr.CrookedSlash = 0;
	this.attr.CounterSlash = 0;
	this.attr.CounterBackSlash = 0;
	this.attr.BreakCellSeparateLine = 0;
}, h);

util.inherits(hml.LEFTBORDER = function LEFTBORDER(){
	h.call(this);
	this.name = 'LEFTBORDER';
	this.attr.Type = 'Solid';
	this.attr.Width = '0.12mm';
	this.attr.Color = 0;
}, h);

util.inherits(hml.RIGHTBORDER = function RIGHTBORDER(){
	h.call(this);
	this.name = 'RIGHTBORDER';
	this.attr.Type = 'Solid';
	this.attr.Width = '0.12mm';
	this.attr.Color = 0;
}, h);

util.inherits(hml.TOPBORDER = function TOPBORDER(){
	h.call(this);
	this.name = 'TOPBORDER';
	this.attr.Type = 'Solid';
	this.attr.Width = '0.12mm';
	this.attr.Color = 0;
}, h);

util.inherits(hml.BOTTOMBORDER = function BOTTOMBORDER(){
	h.call(this);
	this.name = 'BOTTOMBORDER';
	this.attr.Type = 'Solid';
	this.attr.Width = '0.12mm';
	this.attr.Color = 0;
}, h);

util.inherits(hml.DIAGONAL = function DIAGONAL(){
	h.call(this);
	this.name = 'DIAGONAL';
	this.attr.Type = 'Solid';
	this.attr.Width = '0.12mm';
	this.attr.Color = 0;
}, h);

util.inherits(hml.FILLBRUSH = function FILLBRUSH(){
	h.call(this);
	this.name = 'FILLBRUSH';
}, h);

util.inherits(hml.WINDOWBRUSH = function WINDOWBRUSH(){
	h.call(this);
	this.name = 'WINDOWBRUSH';
	this.attr.FaceColor = null;
	this.attr.HatchColor = null;
	this.attr.HatchStyle = null;
	this.attr.Alpha = null;
}, h);

util.inherits(hml.GRADATION = function GRADATION(){
	h.call(this);
	this.name = 'GRADATION';
	this.attr.Type = null;
	this.attr.Angle = 90;
	this.attr.CenterX = 0;
	this.attr.CenterY = 0;
	this.attr.Step = 50;
	this.attr.ColorNum = 2;
	this.attr.StepCenter = 50;
	this.attr.Alpha = null;
}, h);

util.inherits(hml.COLOR = function COLOR(){
	h.call(this);
	this.name = 'COLOR';
	this.attr.Value = null;
}, h);

util.inherits(hml.IMAGEBRUSH = function IMAGEBRUSH(){
	h.call(this);
	this.name = 'IMAGEBRUSH';
	this.attr.Mode = 'Tile';
}, h);

util.inherits(hml.IMAGE = function IMAGE(){
	h.call(this);
	this.name = 'IMAGE';
	this.attr.Bright = 0;
	this.attr.Contrast = 0;
	this.attr.Effect = null;
	this.attr.BinItem = null;
	this.attr.Alpha = null;
}, h);

util.inherits(hml.CHARSHAPELIST = function CHARSHAPELIST(){
	h.call(this);
	this.name = 'CHARSHAPELIST';
	this.attr.Count = null;
}, h);

util.inherits(hml.CHARSHAPE = function CHARSHAPE(){
	h.call(this);
	this.name = 'CHARSHAPE';
	this.attr.Id = null;
	this.attr.Height = 1000;
	this.attr.TextColor = 0;
	this.attr.ShadeColor = 4294967295;
	this.attr.UseFontSpace = 'false';
	this.attr.UseKerning = 'false';
	this.attr.SymMark = 0;
	this.attr.BorderFillId = null;
}, h);

util.inherits(hml.FONTID = function FONTID(){
	h.call(this);
	this.name = 'FONTID';
	this.attr.Hangul = null;
	this.attr.Latin = null;
	this.attr.Hanja = null;
	this.attr.Japanese = null;
	this.attr.Other = null;
	this.attr.Symbol = null;
	this.attr.User = null;
}, h);

exports.hml = hml;
