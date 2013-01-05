var OLEDoc = require('ole-doc').OleCompoundDoc;

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var zlib = require('zlib');

var hml = require('./hml.js').hml;
var record = require('./record.js');
var HWPRecord = record.HWPRecord, HWPTAG = record.HWPTAG;

var HWPDocument = function HWPDocument(file){
	EventEmitter.call(this);
	
	var _this = this;
	
	this._file = file;
	this._doc = new OLEDoc(file);
	
	this._hml = undefined;
	this._hwp_meta = null;

	this._doc.on('err', function(err){this.emit('err',err)});
	
	// Read FileHeader
	this._doc.on('ready', function(){
		getBuffer(_this._doc.stream('FileHeader'), function(buffer){
			_this._hml = new hml.HWPML();

			if('HWP Document File' !== buffer.toString('utf8',0,17)){
				_this.emit('err', new Error('Invalid header'));
				return;
			}
			var version = buffer.readUInt32LE(32);
			var meta = {};
			meta.version = [version>>24,0xFF&(version>>16),0xFF&(version>>8),0xFF&version];
			
			var bits = buffer.readUInt32LE(36);
			meta.compressed = bits&0x001;
			meta.encrypted = bits&0x002;
			meta.distributed = bits&0x004;
			// TODO
			if(meta.encrypted || meta.distributed){
				n_this.emit('err', new Error('Can\'t open '+(meta.encrypted?'encrypted':'distributed')+' hwp file'));
				return;
			}
			/*
			meta.hasScript = bits&0x008;
			meta.DRMSecured = bits&0x010;
			meta.hasXMLTemplateStorage = bits&0x020;
			meta.hasHistory = bits&0x040;
			meta.hasSignature = bits&0x080;
			meta.hasCert = bits&0x100;
			meta.hasAdditionalSig = bits&0x200;
			meta.hasDRMCert = bits&0x400;
			meta.isCCL = bits&0x800;
			*/
			_this._hwp_meta = meta;	
			_this._head(function(head){
				_this._hml.add(head);
				_this._body(function(body){
					_this._hml.add(body);
					_this.emit('ready');
				});
			});
		});
	});
	
	this._doc.read();
};
util.inherits(HWPDocument, EventEmitter);

// Get HML HEAD
HWPDocument.prototype._head = function _head(callback){
	var meta = this._hwp_meta;
	var _this = this;
	var head = new hml.HEAD();
	// DOCSUMMARY
	var summary = head.getChild('DOCSUMMARY');
	getPropSet(this._doc.stream('\x05HwpSummaryInformation'), function(set){
		if(set[0x02]) summary.getChild('TITLE').value = set[0x02];
		if(set[0x03]) summary.getChild('SUBJECT').value = set[0x03];
		if(set[0x04]) summary.getChild('AUTHOR').value = set[0x04];
		if(set[0x05]) summary.getChild('KEYWORDS').value = set[0x05];
		if(set[0x06]) summary.getChild('COMMENTS').value = set[0x06];
		if(set[0x14]) summary.getChild('DATE').value = set[0x14];
		// DOCSETTING, MAPPINGTABLE
		var setting = head.getChild('DOCSETTING');
		getRawBuffer(meta, _this._doc.stream('DocInfo'), function(buffer){
			var languages = ["Hangul", "Latin", "Hanja", "Japanese", "Other", "Symbol", "User"];
			var alignType1 = ["Justify", "Left", "Right", "Center", "Distribute", "DistributeSpace"];
			var alignType2 = ["Left", "Center", "Right"];
			var lineType1 = ["Solid", "Dash", "Dot", "DashDot", "DashDotDot", "LongDash", "Circle", "DoubleSlim", "SlimThick", "ThickSlim", "SlimThickSlim", "None"];
			var lineType2 = ["Solid", "Dash", "Dot", "DashDot", "DashDotDot", "LongDash", "Circle", "DoubleSlim", "SlimThick", "ThickSlim", "SlimThickSlim"];
			var lineType3 = ["Solid", "Dot", "Thick", "Dash", "DashDot", "DashDotDot"];
			var lineWidth = ["0.1mm", "0.12mm", "0.15mm", "0.2mm", "0.25mm", "0.3mm", "0.4mm", "0.5mm", "0.6mm", "0.7mm", "1.0mm", "1.5mm", "2.0mm", "3.0mm", "4.0mm", "5.0mm"];
			var lineWrapType = ["Break", "Squeeze", "Keep"], textWrapType = ["Square", "Tight", "Through", "TopAndBottom", "BehindText", "InFrontOfText"];
			var docInfoTree = HWPRecord.getTree(0, buffer);
			for(var i=0;i<docInfoTree.length;i++){
				var record = docInfoTree[i];
				switch(record.tag){
					case HWPTAG.DOCUMENT_PROPERTIES:
						head.attr.SecCnt = record.data.readUInt16LE(0);
						var beginNumber = setting.getChild('BEGINNUMBER');
						beginNumber.attr.Page = record.data.readUInt16LE(2);
						beginNumber.attr.Footnote = record.data.readUInt16LE(4);
						beginNumber.attr.Endnote = record.data.readUInt16LE(6);
						beginNumber.attr.Picture = record.data.readUInt16LE(8);
						beginNumber.attr.Table = record.data.readUInt16LE(10);
						beginNumber.attr.Equation = record.data.readUInt16LE(12);
						var caretPos = setting.getChild('CARETPOS');
						caretPos.attr.List = record.data.readUInt32LE(14);
						caretPos.attr.Para = record.data.readUInt32LE(18);
						caretPos.attr.Pos = record.data.readUInt32LE(22);
						break;
					// MAPPINGTABLE
					case HWPTAG.ID_MAPPINGS:
						var mappingTable = head.getChild('MAPPINGTABLE');
						var numFonts = [], amount = 0, fontInd = 0, fontElement = mappingTable.getChild('FACENAMELIST');
						var charShapeID = 0, paraShapeID = 0, styleID = 0;
						for(var j=0;j<7;j++) numFonts[j] = record.data.readUInt32LE(4+j*4);
						for(var j=0;j<record.child.length;j++){
							var c = record.child[j];
							switch(c.tag){
								case HWPTAG.BIN_DATA:
									// TODO : BIN_DATA
									break;
								case HWPTAG.FACE_NAME:
									var fontTypes = ["rep", "ttf", "hft"];
									while(fontInd<6 && numFonts[fontInd]==amount){
										fontInd++; amount = 0;
									}
									var fontface = fontElement.getChildWith('FONTFACE', 'Lang', languages[fontInd]);
									var font = new hml.FONT();
									font.attr.Id = amount;
								
									var infos = c.data.readUInt8(0);
									var hasSubst = infos&0x80, hasShape = infos&0x40, hasDefault = infos&0x20, fonttype = infos&3;
									var len1, len2, len3, offset = 3;
									len1 = c.data.readUInt16LE(1);
									font.attr.Name = readUTF16(c.data, offset, len1*2); offset += len1*2;
									font.attr.Type = fontTypes[fonttype];
								
									if(hasSubst){
										var subst = font.getChild("SUBSTFONT");
										subst.attr.Type = fontTypes[c.data.readUInt8(offset)]; offset++;
										len2 = c.data.readUInt16LE(offset); offset+=2;
										subst.attr.Name = readUTF16(c.data, offset, len2*2); offset += len2*2;
									}
									if(hasShape){
										var typeInfo = font.getChild("TYPEINFO");
										typeInfo.attr.FamilyType = c.data.readUInt8(offset++);
										typeInfo.attr.SerifStyle = c.data.readUInt8(offset++);
										typeInfo.attr.Weight = c.data.readUInt8(offset++);
										typeInfo.attr.Proportion = c.data.readUInt8(offset++);
										typeInfo.attr.Contrast = c.data.readUInt8(offset++);
										typeInfo.attr.StrokeVariation = c.data.readUInt8(offset++);
										typeInfo.attr.ArmStyle = c.data.readUInt8(offset++);
										typeInfo.attr.Letterform = c.data.readUInt8(offset++);
										typeInfo.attr.Midline = c.data.readUInt8(offset++);
										typeInfo.attr.XHeight = c.data.readUInt8(offset++);
									}
									if(hasDefault){
										// TODO : Default Font Type
										len3 = c.data.readUInt16LE(offset); offset+=2;
										// console.log(readUTF16(c.data, offset, len3*2));
									}
									fontface.add(font);
									amount++;
									break;
								case HWPTAG.BORDER_FILL:
									var borderFillList = mappingTable.getChild('BORDERFILLLIST');
									// TODO : BORDER_FILL
									break;
								case HWPTAG.CHAR_SHAPE:
									var charShapeList = mappingTable.getChild('CHARSHAPELIST');
									var charShape = new hml.CHARSHAPE();
									
									var fontID = charShape.getChild('FONTID');
									var ratio = charShape.getChild('RATIO');
									var charSpacing = charShape.getChild('CHARSPACING');
									var relSize = charShape.getChild('RELSIZE');
									var charOffset = charShape.getChild('CHAROFFSET');
									
									charShapeList.add(charShape);
									charShape.attr.Id = charShapeID++;
									
									for(var i=0;i<7;i++){
										fontID.attr[languages[i]] = c.data.readUInt16LE(i*2);
										ratio.attr[languages[i]] = c.data.readUInt8(14+i);
										charSpacing.attr[languages[i]] = c.data.readInt8(21+i);
										relSize.attr[languages[i]] = c.data.readUInt8(28+i);
										charOffset.attr[languages[i]] = c.data.readInt8(35+i);
									}
									
									charShape.attr.Height = c.data.readInt32LE(42);
									
									var prop = c.data.readUInt32LE(46);
									if(prop&0x00000001) charShape.getChild('ITALIC');
									if(prop&0x00000002) charShape.getChild('BOLD');
									var oType = (prop>>8)&0x7;
									if(oType){
										var outline = charShape.getChild('OUTLINE');
										outline.attr.Type = lineType3[oType-1];
									}
									var uType,sType = (prop>>11)&0x3;
									if(sType){
										var shadow = charShape.getChild('SHADOW');
										shadow.attr.Type = ["Drop", "Cont"][sType-1];
										shadow.attr.OffsetX = c.data.readInt8(50);
										shadow.attr.OffsetY = c.data.readInt8(51);
										shadow.attr.Color = c.data.readUInt32LE(64);
									}
									if(prop&0x00002000) charShape.getChild('EMBOSS');
									if(prop&0x00004000) charShape.getChild('ENGRAVE');
									if(prop&0x00008000) charShape.getChild('SUPERSCRIPT');
									if(prop&0x00010000) charShape.getChild('SUBSCRIPT');
									sType = (prop>>18)&0x7;
									uType = (prop>>2)&0x3;
									if(uType&&!sType){
										var underline = charShape.getChild('UNDERLINE');
										underline.attr.Type = ['Bottom', 'Center', 'Top'][uType-1];
										underline.attr.Shape = lineType2[(prop>>4)&0xF];
										underline.attr.Color = c.data.readUInt32LE(56);
									}
									if(sType){
										var strike = charShape.getChild('STRIKEOUT');
										strike.attr.Shape = lineType2[(prop>>26)&0xF];
										strike.attr.Color = c.data.readUInt32LE(70);
									}
									charShape.attr.SymMark = (prop>>21)&0xF;
									charShape.attr.UseFontSpace = !!((prop>>25)&0x1);
									charShape.attr.UseKerning = !!((prop>>30)&0x1);
									charShape.attr.TextColor = c.data.readUInt32LE(52);
									charShape.attr.ShadeColor = c.data.readUInt32LE(60);
									charShape.attr.BorderFillId = c.data.readUInt16LE(68);
									break;
								case HWPTAG.TAB_DEF:
									// TODO : TAB_DEF
									break;
								case HWPTAG.NUMBERING:
									// TODO : NUMBERING
									break;
								case HWPTAG.BULLET:
									// TODO : BULLET
									break;
								case HWPTAG.PARA_SHAPE:
									var paraShapeList = mappingTable.getChild('PARASHAPELIST');
									var paraShape = new hml.PARASHAPE();
									
									var paraMargin = paraShape.getChild('PARAMARGIN');
									var paraBorder = paraShape.getChild('PARABORDER');
									
									paraShapeList.add(paraShape);
									paraShape.attr.Id = paraShapeID++;
									
									var prop1 = c.data.readUInt32LE(0);
									paraMargin.attr.LineSpacingType = ["Percent", "Fixed", "BetweenLines", "AtLeast"][prop1&0x7];
									paraShape.attr.Align = alignType1[(prop1>>2)&0x7];
									paraShape.attr.BreakLatinWord = ["KeepWord", "Hyphenation", "BreakWord"][(prop1>>5)&0x3];
									paraShape.attr.BreakNonLatinWord = !!((prop1>>7)&0x1);
									paraShape.attr.SnapToGrid = !!((prop1>>8)&0x1);
									paraShape.attr.Condense = (prop1>>9)&0x7F;
									paraShape.attr.WidowOrphan = !!((prop1>>16)&0x1);
									paraShape.attr.KeepWithNext = !!((prop1>>17)&0x1);
									paraShape.attr.KeepLines = !!((prop1>>18)&0x1);
									paraShape.attr.PageBreakBefore = !!((prop1>>19)&0x1);
									paraShape.attr.VerAlign = ["Baseline", "Top", "Center", "Bottom"][(prop1>>20)&0x3];
									paraShape.attr.FontLineHeight = !!((prop1>>22)&0x1);
									paraShape.attr.HeadingType = ["None", "Outline", "Number", "Bullet"][(prop1>>23)&0x3];
									paraShape.attr.Level = (prop1>>25)&0x7;
									paraBorder.attr.Connect = !!((prop1>>28)&0x1);
									paraBorder.attr.IgnoreMargin = !!((prop1>>29)&0x1);
									
									paraMargin.attr.Left = c.data.readInt32LE(4);
									paraMargin.attr.Right = c.data.readInt32LE(8);
									paraMargin.attr.Indent = c.data.readInt32LE(12);
									paraMargin.attr.Prev = c.data.readInt32LE(16);
									paraMargin.attr.Next = c.data.readInt32LE(20);
									paraMargin.attr.LineSpacing = c.data.readInt32LE(24);
									
									paraShape.attr.TabDef = c.data.readUInt16LE(28);
									paraShape.attr.Heading = c.data.readUInt16LE(30);
									
									paraBorder.attr.BorderFill = c.data.readUInt16LE(32);
									paraBorder.attr.OffsetLeft = c.data.readInt16LE(34);
									paraBorder.attr.OffsetRight = c.data.readInt16LE(36);
									paraBorder.attr.OffsetTop = c.data.readInt16LE(38);
									paraBorder.attr.OffsetBottom = c.data.readInt16LE(40);
									
									var prop2 = c.data.readUInt32LE(42);
									paraShape.attr.LineWrap = lineWrapType[prop2&0x3];
									paraShape.attr.AutoSpaceEAsianEng = !!((prop2>>4)&0x1);
									paraShape.attr.AutoSpaceEAsianNum = !!((prop2>>5)&0x1);
									
									var prop3 = c.data.readUInt32LE(46);
									paraMargin.attr.LineSpacingType = ["Percent", "Fixed", "BetweenLines", "AtLeast"][prop3&0x1F];
									
									// TODO : c.data.readUInt32LE(50) : paraMargin.attr.LineSpacing
									break;
								case HWPTAG.STYLE:
									var styleList = mappingTable.getChild('STYLELIST');
									var style = new hml.STYLE();
									
									styleList.add(style);
									style.attr.Id = styleID++;
									
									var len1 = c.data.readUInt16LE(0);
									var offset = 2;
									style.attr.Name = readUTF16(c.data, 2, len1*2);
									offset += len1*2;
									
									var len2 = c.data.readUInt16LE(offset);
									style.attr.EngName = readUTF16(c.data, offset+2, len2*2);
									offset += 2+len2*2;
									
									var prop = c.data.readUInt8(offset); offset++;
									style.attr.Type = ["Para", "Char"][prop&0x7];
									
									style.attr.NextStyle = c.data.readUInt8(offset); offset++;
									style.attr.LangId = c.data.readInt16LE(offset); offset+=2;
									
									style.attr.ParaShape = c.data.readUInt16LE(offset); offset+=2;
									style.attr.CharShape = c.data.readUInt16LE(offset); offset+=2;
									
									// TODO : style.attr.LockForm : ?
									break;
							}
						}
						break;
				}
			}
			callback(head);
		});
	});
};
	
// Get HML Body
HWPDocument.prototype._body = function _body(callback){
	var body = new hml.BODY();
	callback(body);
};

HWPDocument.prototype.toHMLString = function(){
	return this._hml.toHMLString();
};

var getBuffer = function(stream, callback){
	var buffers = [];
	stream.on('data', function(buffer){
		buffers.push(buffer);
	});
	stream.on('end', function(){
		callback(Buffer.concat(buffers));
	});
	stream.resume();
};

var readUTF16 = function(buffer, ind, len){
	for(var s='',i=ind;i<ind+len;i+=2){
		s+=String.fromCharCode(buffer.readUInt16LE(i));
	}
	return s;
};

var getRaw = function(meta, buffer, callback){
	if(meta.compressed){
		zlib.inflateRaw(buffer, function(x, rbuffer){
			callback(rbuffer);
		});
	}else callback(buffer);
};

var getRawBuffer = function(meta, stream, callback){
	getBuffer(stream, function(buffer){
		getRaw(meta, buffer, callback);
	});
};

// From bitbucket.org/decalage/olefileio_pl
var getPropSet = function(stream, callback){
	getBuffer(stream, function(buffer){
		var set = {};
		var numProps = buffer.readUInt32LE(0x34);
		for(var i=0;i<numProps;i++){
			var id = buffer.readUInt32LE(0x38+i*8);
			var offset = buffer.readUInt32LE(0x3C+i*8)+0x30;
			var type = buffer.readUInt32LE(offset);
			var count, value;
			switch(type){
				case 1: // VT_NULL
					value = null;
					break;
				case 2: // VT_I2
					value = buffer.readInt16LE(offset+4);
					break;
				case 18: // VT_UI2
					value = buffer.readUInt16LE(offset+4);
					break;
				case 3: case 10: // VT_I4, VT_ERROR
				case 19: // VT_UI4
					value = buffer.readUInt32LE(offset+4);
					break;
				case 8: case 30: // VT_BSTR, VT_LPSTR
					count = buffer.readUInt32LE(offset+4);
					value = buffer.toString('ascii', offset+8, offset+8+count-1);
					break;
				case 65: // VT_BLOB
					count = buffer.readUInt32LE(offset+4);
					value = buffer.slice(offset+8, offset+8+count);
					break;
				case 31: // VT_LPWSTR
					count = buffer.readUInt32LE(offset+4);
					value = readUTF16(buffer, offset+8, count*2);
					if(value[value.length-1] === '\u0000')
						value = value.slice(0,-1);
					break;
				case 64: // VT_FILETIME
					value = buffer.readUInt32LE(offset+4)/1e7;
					value += buffer.readUInt32LE(offset+8)*429.4967296;
					value -= 134774*86400;
					value = new Date(value*1000);
					break;
			}
			set[id] = value;
		}
		callback(set);
	});
};

exports.HWPDocument = HWPDocument;
