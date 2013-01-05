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
	this.child.push(elem); this.setCount();
};

hml.HML.prototype.setCount = function(){
	if(this.attr.Count === undefined) return;
	this.attr.Count = this.child.length;
};

hml.HML.prototype.getChild = function getChild(name){
	for(var i=0;i<this.child.length;i++){
		if(this.child[i].name === name) return this.child[i];
	}
	var o = new hml[name]();
	this.add(o); return o;
};

hml.HML.prototype.getChildWith = function getChildWith(name, attr_name, attr_val){
	for(var i=0;i<this.child.length;i++){
		if(this.child[i].name === name && this.child[i].attr[attr_name] === attr_val)
			return this.child[i];
	}
	var o = new hml[name]();
	o.attr[attr_name] = attr_val;
	this.add(o); return o;
};

hml.HML.prototype.toHMLString = function toHML(simple,indent){
	var e,i,hml='',nl=simple?'':'\n';
	if(!indent){
		indent = '';
		hml = '<?xml version="1.0" encoding="UTF-8" standalone="no" ?>'+nl;
	}
	hml += indent+'<'+this.name;
	for(e in this.attr){
		hml+=' '+e+'="'+this.attr[e]+'"';
	}
	if(this.child.length>0){
		hml+='>'+nl;
		for(i=0;i<this.child.length;i++) hml+=this.child[i].toHMLString(simple,simple?'':indent+'  ');
		if(this.value) hml+=this.value;
		hml+=indent+'</'+this.name+'>'+nl;
	}else if(this.value){
		hml+='>'+this.value+'</'+this.name+'>'+nl;
	}else{
		hml+='/>'+nl;
	}
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
	this.attr.LockForm = null;
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

exports.hml = hml;
