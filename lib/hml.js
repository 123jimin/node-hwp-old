var util = require('util');

var hml = {};

hml.LineType1 = ["None", "Solid", "Dash", "Dot", "DashDot", "DashDotDot", "LongDash", "Circle", "DoubleSlim", "SlimThick", "ThickSlim", "SlimThickSlim"];
hml.LineType2 = ["Solid", "Dash", "Dot", "DashDot", "DashDotDot", "LongDash", "Circle", "DoubleSlim", "SlimThick", "ThickSlim", "SlimThickSlim"];
hml.LineType3 = ["Solid", "Dot", "Thick", "Dash", "DashDot", "DashDotDot"];
hml.LineWidth = ["0.1mm", "0.12mm", "0.15mm", "0.2mm", "0.25mm", "0.3mm", "0.4mm", "0.5mm", "0.6mm", "0.7mm", "1.0mm", "1.5mm", "2.0mm", "3.0mm", "4.0mm", "5.0mm"];
hml.NumberType2 = ["Digit", "CircledDigit", "RomanCapital", "RomanSmall", "LatinCapital", "LatinSmall", "CircledLatinCapital", "CircledLatinSmall", "HangulSyllable", "CircledHangulSyllable", "HangulJamo", "CircledHangulJamo", "HangulPhonetic", "Ideograph", "CircledIdeograph", "DecagonCircle", "DecagonCircleHanja", "Symbol", "UserChar"];
hml.AlignType1 = ["Justify", "Left", "Right", "Center", "Distribute", "DistributeSpace"];
hml.AlignType2 = ["Left", "Center", "Right"];
hml.LangType = ["Hangul", "Latin", "Hanja", "Japanese", "Other", "Symbol", "User"];
hml.LineWrapType = ["Break", "Squeeze", "Keep"];
hml.TextWrapType = ["Square", "Tight", "Through", "TopAndBottom", "BehindText", "InFrontOfText"];

var h = hml.HML = function HML(){
	this.name = ''; this.value = undefined;
	this.child = [];
	this.attr = {};
};
var escapeHTML = hml.escape = function(s){
	s+='';
	for(var ps=false,h='',c,i=0;i<s.length;i++){
		c = s.charCodeAt(i);
		if((c<32||c>127)&&(c<44032||c>55203)) h+='&#'+c+';';
		else if(s[i]==' '&&ps) h+='&#32;';
		else if(s[i]=='"') h+='&quot;';
		else if(s[i]=='&') h+='&amp;';
		else h+=s[i];
		
		if(s[i]==' ') ps=true; else ps=false;
	}
	return h;
};
hml.StringNode = function StringNode(s){
	this.value = s;
	this.isStringNode = true;
};
hml.StringNode.prototype.toHMLString = function toHML(simple, indent){
	return simple?escapeHTML(this.value):indent+escapeHTML(this.value)+'\n';
};

hml.HML.prototype.add = function add(elem){
	this.child.push(elem); this.setCount();
};

hml.HML.prototype.setCount = function(){
	if(this.attr.Count === undefined) return;
	this.attr.Count = this.child.length;
};

hml.HML.prototype.getChild = function getChild(name){
	name = name.toUpperCase();
	for(var i=0;i<this.child.length;i++){
		if(this.child[i].name === name) return this.child[i];
	}
	var o = new hml[name]();
	this.add(o); return o;
};

hml.HML.prototype.go = hml.HML.prototype.findChild = function findChild(name){
	name = name.toUpperCase();
	for(var i=0;i<this.child.length;i++){
		if(this.child[i].name === name) return this.child[i];
	}
	return null;
};

hml.HML.prototype.findChildren = function getChildren(name){
	name = name.toUpperCase();
	return this.child.filter(function(o){
		return o.name === name;
	});
};

hml.HML.prototype.getChildWith = function getChildWith(name, attr_name, attr_val){
	name = name.toUpperCase();
	for(var i=0;i<this.child.length;i++){
		if(this.child[i].name === name && this.child[i].attr[attr_name] === attr_val)
			return this.child[i];
	}
	var o = new hml[name]();
	o.attr[attr_name] = attr_val;
	this.add(o); return o;
};

hml.HML.prototype.findChildWith = function findChildWith(name, attr_name, attr_val){
	name = name.toUpperCase();
	for(var i=0;i<this.child.length;i++){
		if(this.child[i].name === name && this.child[i].attr[attr_name] === attr_val)
			return this.child[i];
	}
	return null;
};


hml.HML.prototype.toHMLString = function toHML(simple,indent){
	var e,i,hml='',nl=simple?'':'\n';
	if(!indent){
		indent = '';
		hml = '<?xml version="1.0" encoding="UTF-8" standalone="no" ?>'+nl;
	}
	hml += indent+'<'+this.name;
	for(e in this.attr){
		if(this.attr[e] !== undefined) hml+=' '+e+'="'+escapeHTML(this.attr[e])+'"';
	}
	if(this.child.length>0){
		hml+='>'+nl;
		for(i=0;i<this.child.length;i++) hml+=this.child[i].toHMLString(simple,simple?'':indent+'  ');
		if(this.value) hml+=escapeHTML(this.value);
		hml+=indent+'</'+this.name+'>'+nl;
	}else if(this.value || this.value === ''){
		hml+='>'+escapeHTML(this.value)+'</'+this.name+'>'+nl;
	}else{
		hml+='/>'+nl;
	}
	return hml;
};

util.inherits(hml.DUMMY = function HML_DUMMY(){
	h.call(this);
	this.name = 'DUMMY';
}, h);

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
	this.value = null;
}, h);

util.inherits(hml.SUBJECT = function SUBJECT(){
	h.call(this);
	this.name = 'SUBJECT';
	this.value = null;
}, h);

util.inherits(hml.AUTHOR = function AUTHOR(){
	h.call(this);
	this.name = 'AUTHOR';
	this.value = null;
}, h);

util.inherits(hml.DATE = function DATE(){
	h.call(this);
	this.name = 'DATE';
	this.value = null;
}, h);

util.inherits(hml.KEYWORDS = function KEYWORDS(){
	h.call(this);
	this.name = 'KEYWORDS';
	this.value = null;
}, h);

util.inherits(hml.COMMENTS = function COMMENTS(){
	h.call(this);
	this.name = 'COMMENTS';
	this.value = null;
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
	this.value = null;
	this.attr.Page = 1;
	this.attr.Footnote = 1;
	this.attr.Endnote = 1;
	this.attr.Picture = 1;
	this.attr.Table = 1;
	this.attr.Equation = 1;
	// this.attr.TotalPage = 1;
}, h);

util.inherits(hml.CARETPOS = function CARETPOS(){
	h.call(this);
	this.name = 'CARETPOS';
	this.value = null;
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
	this.value = null;
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
	this.attr.Id = 0;
	this.attr.Type = null;
	this.attr.Name = null;
}, h);

util.inherits(hml.SUBSTFONT = function SUBSTFONT(){
	h.call(this);
	this.name = 'SUBSTFONT';
	this.value = null;
	this.attr.Type = null;
	this.attr.Name = null;
}, h);

util.inherits(hml.TYPEINFO = function TYPEINFO(){
	h.call(this);
	this.name = 'TYPEINFO';
	this.value = null;
	this.attr.FamilyType = null;
	this.attr.SerifStyle = null;
	this.attr.Weight = null;
	this.attr.Proportion = null;
	this.attr.Contrast = null;
	this.attr.StrokeVariation = null;
	this.attr.ArmStyle = null;
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
	this.attr.ThreeD = false;
	this.attr.Shadow = false;
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
	this.value = null;
	this.attr.Type = 'Solid';
	this.attr.Width = '0.12mm';
	this.attr.Color = 0;
}, h);

util.inherits(hml.RIGHTBORDER = function RIGHTBORDER(){
	h.call(this);
	this.name = 'RIGHTBORDER';
	this.value = null;
	this.attr.Type = 'Solid';
	this.attr.Width = '0.12mm';
	this.attr.Color = 0;
}, h);

util.inherits(hml.TOPBORDER = function TOPBORDER(){
	h.call(this);
	this.name = 'TOPBORDER';
	this.value = null;
	this.attr.Type = 'Solid';
	this.attr.Width = '0.12mm';
	this.attr.Color = 0;
}, h);

util.inherits(hml.BOTTOMBORDER = function BOTTOMBORDER(){
	h.call(this);
	this.name = 'BOTTOMBORDER';
	this.value = null;
	this.attr.Type = 'Solid';
	this.attr.Width = '0.12mm';
	this.attr.Color = 0;
}, h);

util.inherits(hml.DIAGONAL = function DIAGONAL(){
	h.call(this);
	this.name = 'DIAGONAL';
	this.value = null;
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
	this.value = null;
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
	this.value = null;
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
	this.attr.UseFontSpace = false;
	this.attr.UseKerning = false;
	this.attr.SymMark = 0;
	this.attr.BorderFillId = null;
}, h);

util.inherits(hml.FONTID = function FONTID(){
	h.call(this);
	this.name = 'FONTID';
	this.value = null;
	this.attr.Hangul = null;
	this.attr.Latin = null;
	this.attr.Hanja = null;
	this.attr.Japanese = null;
	this.attr.Other = null;
	this.attr.Symbol = null;
	this.attr.User = null;
}, h);

util.inherits(hml.RATIO = function RATIO(){
	h.call(this);
	this.name = 'RATIO';
	this.value = null;
	this.attr.Hangul = 100;
	this.attr.Latin = 100;
	this.attr.Hanja = 100;
	this.attr.Japanese = 100;
	this.attr.Other = 100;
	this.attr.Symbol = 100;
	this.attr.User = 100;
}, h);

util.inherits(hml.CHARSPACING = function CHARSPACING(){
	h.call(this);
	this.name = 'CHARSPACING';
	this.value = null;
	this.attr.Hangul = 0;
	this.attr.Latin = 0;
	this.attr.Hanja = 0;
	this.attr.Japanese = 0;
	this.attr.Other = 0;
	this.attr.Symbol = 0;
	this.attr.User = 0;
}, h);

util.inherits(hml.RELSIZE = function RELSIZE(){
	h.call(this);
	this.name = 'RELSIZE';
	this.value = null;
	this.attr.Hangul = 100;
	this.attr.Latin = 100;
	this.attr.Hanja = 100;
	this.attr.Japanese = 100;
	this.attr.Other = 100;
	this.attr.Symbol = 100;
	this.attr.User = 100;
}, h);

util.inherits(hml.CHAROFFSET = function CHAROFFSET(){
	h.call(this);
	this.name = 'CHAROFFSET';
	this.value = null;
	this.attr.Hangul = 0;
	this.attr.Latin = 0;
	this.attr.Hanja = 0;
	this.attr.Japanese = 0;
	this.attr.Other = 0;
	this.attr.Symbol = 0;
	this.attr.User = 0;
}, h);

util.inherits(hml.ITALIC = function ITALIC(){
	h.call(this);
	this.name = 'ITALIC';
	this.value = null;
}, h);

util.inherits(hml.BOLD = function BOLD(){
	h.call(this);
	this.name = 'BOLD';
	this.value = null;
}, h);

util.inherits(hml.UNDERLINE = function UNDERLINE(){
	h.call(this);
	this.name = 'UNDERLINE';
	this.value = null;
	this.attr.Type = 'Bottom';
	this.attr.Shape = 'Solid';
	this.attr.Color = 0;
}, h);

util.inherits(hml.STRIKEOUT = function STRIKEOUT(){
	h.call(this);
	this.name = 'STRIKEOUT';
	this.value = null;
	this.attr.Type = 'Continuous';
	this.attr.Shape = 'Solid';
	this.attr.Color = 0;
}, h);

util.inherits(hml.OUTLINE = function OUTLINE(){
	h.call(this);
	this.name = 'OUTLINE';
	this.value = null;
	this.attr.Type = 'Solid';
}, h);

util.inherits(hml.SHADOW = function SHADOW(){
	h.call(this);
	this.name = 'SHADOW';
	this.value = null;
	this.attr.Type = null;
	this.attr.Color = null;
	this.attr.OffsetX = 10;
	this.attr.OffsetY = 10;
	this.attr.Alpha = null;
}, h);

util.inherits(hml.EMBOSS = function EMBOSS(){
	h.call(this);
	this.name = 'EMBOSS';
}, h);

util.inherits(hml.ENGRAVE = function ENGRAVE(){
	h.call(this);
	this.name = 'ENGRAVE';
}, h);

util.inherits(hml.SUPERSCRIPT = function SUPERSCRIPT(){
	h.call(this);
	this.name = 'SUPERSCRIPT';
}, h);

util.inherits(hml.SUBSCRIPT = function SUBSCRIPT(){
	h.call(this);
	this.name = 'SUBSCRIPT';
}, h);

util.inherits(hml.TABDEFLIST = function TABDEFLIST(){
	h.call(this);
	this.name = 'TABDEFLIST';
	this.attr.Count = null;
}, h);

util.inherits(hml.TABDEF = function TABDEF(){
	h.call(this);
	this.name = 'TABDEF';
	this.attr.Id = null;
	this.attr.AutoTabLeft = false;
	this.attr.AutoTabRight = false;
}, h);

util.inherits(hml.TABITEM = function TABITEM(){
	h.call(this);
	this.name = 'TABITEM';
	this.value = null;
	this.attr.Pos = null;
	this.attr.Type = 'Left';
	this.attr.Leader = 'Solid';
}, h);

util.inherits(hml.NUMBERINGLIST = function NUMBERINGLIST(){
	h.call(this);
	this.name = 'NUMBERINGLIST';
	this.attr.Count = null;
}, h);

util.inherits(hml.NUMBERING = function NUMBERING(){
	h.call(this);
	this.name = 'NUMBERING';
	this.attr.Id = null;
	this.attr.Start = 1;
}, h);

util.inherits(hml.PARAHEAD = function PARAHEAD(){
	h.call(this);
	this.name = 'PARAHEAD';
	this.value = null;
	this.attr.Level = null;
	this.attr.Alignment = 'Left';
	this.attr.UseInstWidth = true;
	this.attr.AutoIndent = true;
	this.attr.WidthAdjust = 0;
	this.attr.TextOffsetType = 'percent';
	this.attr.TextOffset = 50;
	this.attr.NumFormat = 'Digit';
	this.attr.CharShape = null;
}, h);

util.inherits(hml.BULLETLIST = function BULLETLIST(){
	h.call(this);
	this.name = 'BULLETLIST';
	this.attr.Count = null;
}, h);

util.inherits(hml.BULLET = function BULLET(){
	h.call(this);
	this.name = 'BULLET';
	this.attr.Id = null;
	this.attr.Char = null;
	this.attr.Image = false;
}, h);

util.inherits(hml.PARASHAPELIST = function PARASHAPELIST(){
	h.call(this);
	this.name = 'PARASHAPELIST';
	this.attr.Count = null;
}, h);

util.inherits(hml.PARASHAPE = function PARASHAPE(){
	h.call(this);
	this.name = 'PARASHAPE';
	this.attr.Id = null;
	this.attr.Align = 'Justify';
	this.attr.VerAlign = 'Baseline';
	this.attr.HeadingType = 'None';
	this.attr.Heading = null;
	this.attr.Level = 0;
	this.attr.TabDef = null;
	this.attr.BreakLatinWord = 'KeepWord';
	this.attr.BreakNonLatinWord = true;
	this.attr.Condense = 0;
	this.attr.WidowOrphan = false;
	this.attr.KeepWithNext = false;
	this.attr.KeepLines = false;
	this.attr.PageBreakBefore = false;
	this.attr.FontLineHeight = false;
	this.attr.SnapToGrid = true;
	this.attr.LineWrap = 'Break';
	this.attr.AutoSpaceEAsianEng = true;
	this.attr.AutoSpaceEAsianNum = true;
}, h);

util.inherits(hml.PARAMARGIN = function PARAMARGIN(){
	h.call(this);
	this.name = 'PARAMARGIN';
	this.value = null;
	this.attr.Indent = 0;
	this.attr.Left = 0;
	this.attr.Right = 0;
	this.attr.Prev = 0;
	this.attr.Next = 0;
	this.attr.LineSpacingType = 'Percent';
	this.attr.LineSpacing = 160;
}, h);

util.inherits(hml.PARABORDER = function PARABORDER(){
	h.call(this);
	this.name = 'PARABORDER';
	this.value = null;
	this.attr.BorderFill = null;
	this.attr.OffsetLeft = null;
	this.attr.OffsetRight = null;
	this.attr.OffsetTop = null;
	this.attr.OffsetBottom = null;
	this.attr.Connect = false;
	this.attr.IgnoreMargin = false;
}, h);

util.inherits(hml.STYLELIST = function STYLELIST(){
	h.call(this);
	this.name = 'STYLELIST';
	this.attr.Count = null;
}, h);

util.inherits(hml.STYLE = function STYLE(){
	h.call(this);
	this.name = 'STYLE';
	this.value = null;
	this.attr.Id = null;
	this.attr.Type = 'Para';
	this.attr.Name = null;
	this.attr.EngName = null;
	this.attr.ParaShape = null;
	this.attr.CharShape = null;
	this.attr.NextStyle = null;
	this.attr.LangId = null;
	this.attr.LockForm = 0;
}, h);

util.inherits(hml.MEMOSHAPELIST = function MEMOSHAPELIST(){
	h.call(this);
	this.name = 'MEMOSHAPELIST';
	this.attr.Count = null;
}, h);

util.inherits(hml.MEMO = function MEMO(){
	h.call(this);
	this.name = 'MEMO';
	this.value = null;
	this.attr.Id = null;
	this.attr.Width = 0;
	this.attr.LineType = null;
	this.attr.LineColor = null;
	this.attr.FillColor = null;
	this.attr.ActiveColor = null;
	this.attr.MemoType = null;
}, h);

/// BODY
util.inherits(hml.BODY = function BODY(){
	h.call(this);
	this.name = 'BODY';
}, h);

util.inherits(hml.SECTION = function SECTION(){
	h.call(this);
	this.name = 'SECTION';
	this.attr.Id = null
}, h);

util.inherits(hml.P = function P(){
	h.call(this);
	this.name = 'P';
	this.attr.ParaShape = null;
	this.attr.Style = null;
	this.attr.InstId = undefined;
	this.attr.PageBreak = false;
	this.attr.ColumnBreak = false;
}, h);

util.inherits(hml.TEXT = function TEXT(){
	h.call(this);
	this.name = 'TEXT';
	this.attr.CharShape = null
}, h);

util.inherits(hml.CHAR = function CHAR(){
	h.call(this);
	this.name = 'CHAR';
	this.value = null;
	this.attr.Style = undefined;
}, h);

util.inherits(hml.MARKPENBEGIN = function MARKPENBEGIN(){
	h.call(this);
	this.name = 'MARKPENBEGIN';
	this.value = null;
	this.attr.Color = null;
}, h);

util.inherits(hml.MARKPENEND = function MARKPENEND(){
	h.call(this);
	this.name = 'MARKPENEND';
	this.value = null;
}, h);

util.inherits(hml.TITLEMARK = function TITLEMARK(){
	h.call(this);
	this.name = 'TITLEMARK';
	this.value = null;
	this.attr.Ignore = null;
}, h);

util.inherits(hml.TAB = function TAB(){
	h.call(this);
	this.name = 'TAB';
	this.value = null;
}, h);

util.inherits(hml.LINEBREAK = function LINEBREAK(){
	h.call(this);
	this.name = 'LINEBREAK';
	this.value = null;
}, h);

// *sic*
util.inherits(hml.HYPEN = function HYPEN(){
	h.call(this);
	this.name = 'HYPEN';
	this.value = null;
}, h);

util.inherits(hml.NBSPACE = function NBSPACE(){
	h.call(this);
	this.name = 'NBSPACE';
	this.value = null;
}, h);

util.inherits(hml.FWSPACE = function FWSPACE(){
	h.call(this);
	this.name = 'FWSPACE';
	this.value = null;
}, h);

util.inherits(hml.SECDEF = function SECDEF(){
	h.call(this);
	this.name = 'SECDEF';
	this.attr.TextDirection = 0;
	this.attr.SpaceColumns = null;
	this.attr.TabStop = 8000;
	this.attr.OutlineShape = 1;
	this.attr.LineGrid = 0;
	this.attr.CharGrid = 0;
	this.attr.FirstBorder = false;
	this.attr.FirstFill = false;
	this.attr.ExtMasterpageCount = 0;
	this.attr.MemoShapeId = null;
	this.attr.TextVerticalWidthHead = null;
}, h);

util.inherits(hml.PARAMETERSET = function PARAMETERSET(){
	h.call(this);
	this.name = 'PARAMETERSET';
	this.attr.SetId = null;
	this.attr.Count = null;
}, h);

util.inherits(hml.PARAMETERARRAY = function PARAMETERARRAY(){
	h.call(this);
	this.name = 'PARAMETERARRAY';
	this.attr.Count = null;
}, h);

util.inherits(hml.ITEM = function ITEM(){
	h.call(this);
	this.name = 'ITEM';
	this.value = null;
	this.attr.ItemId = null;
	this.attr.Type = null;
}, h);

util.inherits(hml.STARTNUMBER = function STARTNUMBER(){
	h.call(this);
	this.name = 'STARTNUMBER';
	this.value = null;
	this.attr.PageStartsOn = 'Both';
	this.attr.Page = 0;
	this.attr.Figure = 0;
	this.attr.Table = 0;
	this.attr.Equation = 0;
}, h);

util.inherits(hml.HIDE = function HIDE(){
	h.call(this);
	this.name = 'HIDE';
	this.value = null;
	this.attr.Header = false;
	this.attr.Footer = false;
	this.attr.MasterPage = false;
	this.attr.Border = false;
	this.attr.Fill = false;
	this.attr.PageNumPos = false;
	this.attr.EmptyLine = false;
}, h);

util.inherits(hml.PAGEDEF = function PAGEDEF(){
	h.call(this);
	this.name = 'PAGEDEF';
	this.attr.Landscape = 0;
	this.attr.Width = 59528;
	this.attr.Height = 84188;
	this.attr.GutterType = 'LeftOnly';
}, h);

util.inherits(hml.PAGEMARGIN = function PAGEMARGIN(){
	h.call(this);
	this.name = 'PAGEMARGIN';
	this.value = null;
	this.attr.Left = 8504;
	this.attr.Right = 8504;
	this.attr.Top = 5668;
	this.attr.Bottom = 4252;
	this.attr.Header = 4252;
	this.attr.Footer = 4252;
	this.attr.Gutter = 0;
}, h);

util.inherits(hml.FOOTNOTESHAPE = function FOOTNOTESHAPE(){
	h.call(this);
	this.name = 'FOOTNOTESHAPE';
}, h);

util.inherits(hml.ENDNOTESHAPE = function ENDNOTESHAPE(){
	h.call(this);
	this.name = 'ENDNOTESHAPE';
}, h);

util.inherits(hml.AUTONUMFORMAT = function AUTONUMFORMAT(){
	h.call(this);
	this.name = 'AUTONUMFORMAT';
	this.value = null;
	this.attr.Type = 'Digit';
	this.attr.UserChar = undefined;
	this.attr.PrefixChar = undefined;
	this.attr.SuffixChar = ')';
	this.attr.Superscript = false;
}, h);

util.inherits(hml.NOTELINE = function NOTELINE(){
	h.call(this);
	this.name = 'NOTELINE';
	this.value = null;
	this.attr.Length = null;
	this.attr.Type = 'Solid';
	this.attr.Width = '0.12mm';
	this.attr.Color = null;
}, h);

util.inherits(hml.NOTESPACING = function NOTESPACING(){
	h.call(this);
	this.name = 'NOTESPACING';
	this.value = null;
	this.attr.AboveLine = 567;
	this.attr.BelowLine = 567;
	this.attr.BetweenNotes = 850;
}, h);

util.inherits(hml.NOTENUMBERING = function NOTENUMBERING(){
	h.call(this);
	this.name = 'NOTENUMBERING';
	this.value = null;
	this.attr.Type = 'Continuous';
	this.attr.NewNumber = 1;
}, h);

util.inherits(hml.NOTEPLACEMENT = function NOTEPLACEMENT(){
	h.call(this);
	this.name = 'NOTEPLACEMENT';
	this.value = null;
	this.attr.Place = null;
	this.attr.BeneathText = false;
}, h);

util.inherits(hml.PAGEBORDERFILL = function PAGEBORDERFILL(){
	h.call(this);
	this.name = 'PAGEBORDERFILL';
	this.attr.Type = 'Both';
	this.attr.BorderFill = null;
	this.attr.TextBorder = false;
	this.attr.HeaderInside = false;
	this.attr.FooterInside = false;
	this.attr.FillArea = 'Paper';
}, h);

util.inherits(hml.PAGEOFFSET = function PAGEOFFSET(){
	h.call(this);
	this.name = 'PAGEOFFSET';
	this.value = null;
	this.attr.Type = 'Both';
	this.attr.Left = 1417;
	this.attr.Right = 1417;
	this.attr.Top = 1417;
	this.attr.Bottom = 1417;
}, h);

util.inherits(hml.MASTERPAGE = function MASTERPAGE(){
	h.call(this);
	this.name = 'MASTERPAGE';
	this.attr.Type = 'Both';
	this.attr.TextWidth = null;
	this.attr.TextHeight = null;
	this.attr.HasTextRef = false;
	this.attr.HasNumRef = false;
}, h);

util.inherits(hml.PARALIST = function PARALIST(){
	h.call(this);
	this.name = 'PARALIST';
	this.attr.TextDirection = 0;
	this.attr.LineWrap = 'Break';
	this.attr.VertAlign = 'Top';
	this.attr.LinkListID = null;
	this.attr.LinkListIDNext = null;
}, h);

util.inherits(hml.EXT_MASTERPAGE = function EXT_MASTERPAGE(){
	h.call(this);
	this.name = 'EXT_MASTERPAGE';
	this.attr.Type = null;
	this.attr.PageNumber = null;
	this.attr.PageDuplicate = null;
	this.attr.PageFront = null;
}, h);

util.inherits(hml.COLDEF = function COLDEF(){
	h.call(this);
	this.name = 'COLDEF';
	this.attr.Type = 'Newspaper';
	this.attr.Count = 1;
	this.attr.Layout = 'Left';
	this.attr.SameSize = false;
	this.attr.SameGap = 0;
}, h);

util.inherits(hml.COLUMNLINE = function COLUMNLINE(){
	h.call(this);
	this.name = 'COLUMNLINE';
	this.value = null;
	this.attr.Type = 'Solid';
	this.attr.Width = '0.12mm';
	this.attr.Color = null;
}, h);

util.inherits(hml.COLUMNTABLE = function COLUMNTABLE(){
	h.call(this);
	this.name = 'COLUMNTABLE';
}, h);

util.inherits(hml.COLUMN = function COLUMN(){
	h.call(this);
	this.name = 'COLUMN';
	this.value = null;
	this.attr.Width = null;
	this.attr.Gap = null;
}, h);

util.inherits(hml.TABLE = function TABLE(){
	h.call(this);
	this.name = 'TABLE';
	this.attr.PageBreak = 'Cell';
	this.attr.RepeatHeader = true;
	this.attr.RowCount = null;
	this.attr.ColCount = null;
	this.attr.CellSpacing = 0;
	this.attr.BorderFill = null;
}, h);

util.inherits(hml.SHAPEOBJECT = function SHAPEOBJECT(){
	h.call(this);
	this.name = 'SHAPEOBJECT';
	this.attr.InstId = null;
	this.attr.ZOrder = 0;
	this.attr.NumberingType = 'None';
	this.attr.TextWrap = null;
	this.attr.TextFlow = 'BothSides';
	this.attr.Lock = false;
}, h);

util.inherits(hml.SIZE = function SIZE(){
	h.call(this);
	this.name = 'SIZE';
	this.value = null;
	this.attr.Width = null;
	this.attr.Height = null;
	this.attr.WidthRelTo = 'Absolute';
	this.attr.HeightRelTo = 'Absolute';
	this.attr.Protect = false;
}, h);

util.inherits(hml.POSITION = function POSITION(){
	h.call(this);
	this.name = 'POSITION';
	this.value = null;
	this.attr.TreatAsChar = null;
	this.attr.AffectLSpacing = false;
	this.attr.VertRelTo = null;
	this.attr.VertAlign = null;
	this.attr.HorzRelTo = null;
	this.attr.HorzAlign = null;
	this.attr.VertOffset = 0;
	this.attr.HorzOffset = 0;
	this.attr.FlowWithText = false;
	this.attr.AllowOverlap = false;
	this.attr.HoldAnchorAndSO = false;
}, h);

util.inherits(hml.OUTSIDEMARGIN = function OUTSIDEMARGIN(){
	h.call(this);
	this.name = 'OUTSIDEMARGIN';
	this.value = null;
	this.attr.Left = null;
	this.attr.Right = null;
	this.attr.Top = null;
	this.attr.Bottom = null;
}, h);

util.inherits(hml.CAPTION = function CAPTION(){
	h.call(this);
	this.name = 'CAPTION';
	this.attr.Side = 'Left';
	this.attr.FullSize = false;
	this.attr.Width = null;
	this.attr.Gap = 850;
	this.attr.LastWidth = null;
}, h);

util.inherits(hml.SHAPECOMMENT = function SHAPECOMMENT(){
	h.call(this);
	this.name = 'SHAPECOMMENT';
	this.value = null;
}, h);

util.inherits(hml.INSIDEMARGIN = function INSIDEMARGIN(){
	h.call(this);
	this.name = 'INSIDEMARGIN';
	this.value = null;
	this.attr.Left = null;
	this.attr.Right = null;
	this.attr.Top = null;
	this.attr.Bottom = null;
}, h);

util.inherits(hml.CELLZONELIST = function CELLZONELIST(){
	h.call(this);
	this.name = 'CELLZONELIST';
	this.attr.Count = null;
}, h);

util.inherits(hml.CELLZONE = function CELLZONE(){
	h.call(this);
	this.name = 'CELLZONE';
	this.value = null;
	this.attr.StartRowAddr = null;
	this.attr.StartColAddr = null;
	this.attr.EndRowAddr = null;
	this.attr.EndColAddr = null;
	this.attr.BorderFill = null;
}, h);

util.inherits(hml.ROW = function ROW(){
	h.call(this);
	this.name = 'ROW';
}, h);

util.inherits(hml.CELL = function CELL(){
	h.call(this);
	this.name = 'CELL';
	this.attr.Name = null;
	this.attr.ColAddr = null;
	this.attr.RowAddr = null;
	this.attr.ColSpan = 1;
	this.attr.RowSpan = 1;
	this.attr.Width = null;
	this.attr.Height = null;
	this.attr.Header = false;
	this.attr.HasMargin = false;
	this.attr.Protect = false;
	this.attr.Editable = false;
	this.attr.Dirty = false;
	this.attr.BorderFill = null;
}, h);

util.inherits(hml.CELLMARGIN = function CELLMARGIN(){
	h.call(this);
	this.name = 'CELLMARGIN';
	this.value = null;
	this.attr.Left = null;
	this.attr.Right = null;
	this.attr.Top = null;
	this.attr.Bottom = null;
}, h);

util.inherits(hml.PICTURE = function PICTURE(){
	h.call(this);
	this.name = 'PICTURE';
	this.attr.Reverse = false;
}, h);

util.inherits(hml.SHAPECOMPONENT = function SHAPECOMPONENT(){
	h.call(this);
	this.name = 'SHAPECOMPONENT';
	this.attr.HRef = null;
	this.attr.XPos = 0;
	this.attr.YPos = 0
	this.attr.GroupLevel = 0;
	this.attr.OriWidth = null;
	this.attr.OriHeight = null;
	this.attr.CurWidth = null;
	this.attr.CurHeight = null;
	this.attr.HorzFlip = false;
	this.attr.VertFlip = false;
	this.attr.InstId = null;
}, h);

util.inherits(hml.ROTATIONINFO = function ROTATIONINFO(){
	h.call(this);
	this.name = 'ROTATIONINFO';
	this.value = null;
	this.attr.Angle = 0;
	this.attr.CenterX = null;
	this.attr.CenterY = null;
}, h);

util.inherits(hml.RENDERINGINFO = function RENDERINGINFO(){
	h.call(this);
	this.name = 'RENDERINGINFO';
}, h);

util.inherits(hml.TRANSMATRIX = function TRANSMATRIX(){
	h.call(this);
	this.name = 'TRANSMATRIX';
	this.value = null;
	this.attr.E1 = null;
	this.attr.E2 = null;
	this.attr.E3 = null;
	this.attr.E4 = null;
	this.attr.E5 = null;
	this.attr.E6 = null;
}, h);

util.inherits(hml.SCAMATRIX = function SCAMATRIX(){
	h.call(this);
	this.name = 'SCAMATRIX';
	this.value = null;
	this.attr.E1 = null;
	this.attr.E2 = null;
	this.attr.E3 = null;
	this.attr.E4 = null;
	this.attr.E5 = null;
	this.attr.E6 = null;
}, h);

util.inherits(hml.ROTMATRIX = function ROTMATRIX(){
	h.call(this);
	this.name = 'ROTMATRIX';
	this.value = null;
	this.attr.E1 = null;
	this.attr.E2 = null;
	this.attr.E3 = null;
	this.attr.E4 = null;
	this.attr.E5 = null;
	this.attr.E6 = null;
}, h);

util.inherits(hml.LINESHAPE = function LINESHAPE(){
	h.call(this);
	this.name = 'LINESHAPE';
	this.value = null;
	this.attr.Color = null;
	this.attr.Width = null;
	this.attr.Style = 'Solid';
	this.attr.EndCap = 'Flat';
	this.attr.HeadStyle = 'Normal';
	this.attr.TailStyle = 'Normal';
	this.attr.HeadSize = 'SmallSmall';
	this.attr.TailSize = 'SmallSmall';
	this.attr.OutlineStyle = 'Normal';
	this.attr.Alpha = null;
}, h);

util.inherits(hml.IMAGERECT = function IMAGERECT(){
	h.call(this);
	this.name = 'IMAGERECT';
	this.value = null;
	this.attr.X0 = null;
	this.attr.Y0 = null;
	this.attr.X1 = null;
	this.attr.Y1 = null;
	this.attr.X2 = null;
	this.attr.Y2 = null;
}, h);

util.inherits(hml.IMAGECLIP = function IMAGECLIP(){
	h.call(this);
	this.name = 'IMAGECLIP';
	this.value = null;
	this.attr.Left = null;
	this.attr.Top = null;
	this.attr.Right = null;
	this.attr.Bottom = null;
}, h);

util.inherits(hml.EFFECTS = function EFFECTS(){
	h.call(this);
	this.name = 'EFFECTS';
}, h);

util.inherits(hml.SHADOWEFFECT = function SHADOWEFFECT(){
	h.call(this);
	this.name = 'SHADOWEFFECT';
	this.attr.Style = null;
	this.attr.Alpha = null;
	this.attr.Radius = null;
	this.attr.Direction = null;
	this.attr.Distance = null;
	this.attr.AlignStyle = null;
	this.attr.SkewX = null;
	this.attr.SkewY = null;
	this.attr.ScaleX = null;
	this.attr.ScaleY = null;
	this.attr.RotationStyle = null;
}, h);

util.inherits(hml.GLOW = function GLOW(){
	h.call(this);
	this.name = 'GLOW';
	this.attr.Alpha = null;
	this.attr.Radius = null;
}, h);

util.inherits(hml.SOFTEDGE = function SOFTEDGE(){
	h.call(this);
	this.name = 'SOFTEDGE';
	this.value = null;
	this.attr.Radius = null;
}, h);

exports.hml = hml;
