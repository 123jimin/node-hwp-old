var OLEDoc = require('ole-doc').OleCompoundDoc;

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var zlib = require('zlib');

var hml = require('./hml.js').hml;
var record = require('./record.js');
var HWPRecord = record.HWPRecord, HWPTAG = record.HWPTAG;

var DUMMY = new hml.DUMMY();

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
			// TODO : Open encrypted or distributed files
			if(meta.encrypted || meta.distributed){
				n_this.emit('err', new Error('Can\'t open '+(meta.encrypted?'encrypted':'distributed')+' hwp file'));
				return;
			}
			/* TODO_SOMEDAY : find good names
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
		// TODO : Fill forbidden characters
		// DOCSETTING, MAPPINGTABLE
		var setting = head.getChild('DOCSETTING');
		getRawBuffer(meta, _this._doc.stream('DocInfo'), function(buffer){
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
						var borderFillID = 1, charShapeID = 0, paraShapeID = 0, styleID = 0;
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
									var fontface = fontElement.getChildWith('FONTFACE', 'Lang', hml.LangType[fontInd]);
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
										// TODO_SOMEDAY : Default Font Type
										len3 = c.data.readUInt16LE(offset); offset+=2;
										readUTF16(c.data, offset, len3*2);
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
										fontID.attr[hml.LangType[i]] = c.data.readUInt16LE(i*2);
										ratio.attr[hml.LangType[i]] = c.data.readUInt8(14+i);
										charSpacing.attr[hml.LangType[i]] = c.data.readInt8(21+i);
										relSize.attr[hml.LangType[i]] = c.data.readUInt8(28+i);
										charOffset.attr[hml.LangType[i]] = c.data.readInt8(35+i);
									}
									
									charShape.attr.Height = c.data.readInt32LE(42);
									
									var prop = c.data.readUInt32LE(46);
									if(prop&0x00000001) charShape.getChild('ITALIC');
									if(prop&0x00000002) charShape.getChild('BOLD');
									var oType = (prop>>8)&0x7;
									if(oType){
										var outline = charShape.getChild('OUTLINE');
										outline.attr.Type = hml.LineType3[oType-1];
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
										underline.attr.Shape = hml.LineType2[(prop>>4)&0xF];
										underline.attr.Color = c.data.readUInt32LE(56);
									}
									if(sType){
										var strike = charShape.getChild('STRIKEOUT');
										strike.attr.Shape = hml.LineType2[(prop>>26)&0xF];
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
									paraShape.attr.Align = hml.AlignType1[(prop1>>2)&0x7];
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
									paraShape.attr.LineWrap = hml.LineWrapType[prop2&0x3];
									paraShape.attr.AutoSpaceEAsianEng = !!((prop2>>4)&0x1);
									paraShape.attr.AutoSpaceEAsianNum = !!((prop2>>5)&0x1);
									
									// After H2007
									if(c.data.length >= 54){
										var prop3 = c.data.readUInt32LE(46);
										paraMargin.attr.LineSpacingType = ["Percent", "Fixed", "BetweenLines", "AtLeast"][prop3&0x1F];
										paraMargin.attr.LineSpacing = c.data.readUInt32LE(50);
									}
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
									
									// TODO_SOMEDAY : style.attr.LockForm : ?
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
	var numSections = this._hml.getChild('HEAD').attr.SecCnt;
	
	this._sections(callback, body, this._doc.storage(this._hwp_meta.distributed?'ViewText':'BodyText'), 0, numSections);
};

// Get HML Sections
HWPDocument.prototype._sections = function _sections(callback, body, storage, cid, mid){
	var _this = this;
	if(cid == mid){
		callback(body); return;
	}
	getRawBuffer(this._hwp_meta, storage.stream('Section'+cid), function(buffer){
		var section = new hml.SECTION();
		var tree = HWPRecord.getTree(0, buffer);
		_this._getHMLs(section, tree);
		section.attr.Id = cid;
		body.add(section);
		_this._sections(callback, body, storage, cid+1, mid);
	});
};

// Get HMLs from body record
HWPDocument.prototype._getHMLs = function _getHMLs(p,rs){
	for(var i=0;i<rs.length;i++){
		p.add(this._getHML(p,rs[i]));
	}
	return;
}

// GET HML from body record
HWPDocument.prototype._getHML = function _getHML(pa,r){
	var node = DUMMY;
	switch(r.tag){
		case HWPTAG.PARA_HEADER:
			node = new hml.P();
			// TODO_SOMEDAY : do something with text and control_mask
			var text = r.data.readUInt32LE(0);
			var control_mask = r.data.readUInt32LE(4);
			
			node.attr.ParaShape = r.data.readUInt16LE(8);
			node.attr.Style = r.data.readUInt8(10);
			var breaks = r.data.readUInt8(11);
			// TODO_SOMEDAY : 0x01 & 0x02 -> ???
			node.attr.PageBreak = !!(breaks&0x04);
			node.attr.ColumnBreak = !!(breaks&0x08);
			
			node.attr.InstId = r.data.readUInt32LE(18) || undefined;
			
			// TODO : improve these codes
			var o = {};
			for(var i=0;i<r.child.length;i++){
				var t = r.child[i].tag;
				if(!o[t]) o[t] = [];
				o[t].push(r.child[i]);
			}
			if(o[HWPTAG.PARA_TEXT]){
				if(o[HWPTAG.PARA_TEXT].length>=2)
					throw new Error("TODO : Handle the case where Text.length >= 2");
				if(!o[HWPTAG.PARA_CHAR_SHAPE])
					throw new Error("TODO : Handle the case where there's no CharShape");
				if(o[HWPTAG.PARA_CHAR_SHAPE].length>=2)
					throw new Error("TODO : Handle the case where CharShape.length >= 2");
				
				var lastInd = {};
				var getControl = function getControl(id){
					var i,a = o[HWPTAG.CTRL_HEADER] || [];
					for(i=(lastInd[id]!==undefined?lastInd[id]+1:0);i<a.length;i++)
						if(a[i].data.readUInt32LE(0) === id){
							lastInd[id] = i;
							return a[i];
						}
					throw new Error("Can't find Control Header! (id="+id.toString(16)+")");
				};
				
				var textData = o[HWPTAG.PARA_TEXT][0].data;
				var charShapeData = o[HWPTAG.PARA_CHAR_SHAPE][0].data;
				var curShape = 0, buf = [], text = new hml.TEXT();
				var curChar = new hml.CHAR();
				var flushBuffer = function flushBuffer(full){
					if(buf.length>0){
						curChar.add(new hml.StringNode(
							String.fromCharCode.apply(String,buf)
						));
					}
					if(full){
						if(curChar.child.length || curChar.value){
							for(var s='',i=0;i<curChar.child.length;i++){
								if(curChar.child[i].isStringNode===true){
									s += curChar.child[i].value;
								}else break;
							}
							if(curChar.child.length === i){
								curChar.value = s;
								curChar.child = [];
							}
							text.add(curChar);
						}
						curChar = new hml.CHAR();
					}
					buf = [];
				};
				var inChar = 0, c;
				text.attr.CharShape = charShapeData.readUInt32LE(4);
				for(i=0;i<textData.length;i+=2){
					c = textData.readUInt16LE(i);
					if(inChar){
						if(c==inChar){
							switch(c){
								case 1: case 2: case 3: case 11: case 12:
								case 14: case 15: case 16: case 17: case 18:
								case 21: case 22: case 23:
									var header = this._getHMLFromCHeader(getControl(buf[0]+(buf[1]<<16)));
									if(header) text.add(header);
									buf = [];
									break;
								default:
									// TODO
									console.log(c, buf);
							}
							buf = []; inChar = 0;
						}else buf.push(c);
					}else{
						if(curShape != charShapeData.length/8-1 && i/2>=charShapeData.readUInt32LE((curShape+1)*8)){
							flushBuffer(true);
							node.add(text); curShape++;
							text = new hml.TEXT();
							text.attr.CharShape = charShapeData.readUInt32LE(curShape*8+4);
						}
						switch(c){
							case 0:
								break;
							case 10: // line break
								buf.push(10);
								break;
							case 13: // TODO : para break
								break;
							case 24: // hypen (sic)
								flushBuffer();
								curChar.add(new hml.HYPEN());
								break;
							case 25: case 26: case 27: case 28: case 29:
								// reserved
								break;
							case 30: // nbspace
								flushBuffer();
								curChar.add(new hml.NBSPACE());
								break;
							case 31: // fwspace
								flushBuffer();
								curChar.add(new hml.FWSPACE());
								break;
							default:
								if(c<32){
									// inline, extended
									flushBuffer(true);
									inChar = c;
								}else{
									buf.push(c);
								}
						}
					}
				}
				flushBuffer(true);
				node.add(text);
			}
			break;
		case HWPTAG.PAGE_DEF:
			node = new hml.PAGEDEF();
			var margin = node.getChild('PAGEMARGIN');
			node.attr.Width = r.data.readUInt32LE(0);
			node.attr.Height = r.data.readUInt32LE(4);
			margin.attr.Left = r.data.readUInt32LE(8);
			margin.attr.Right = r.data.readUInt32LE(12);
			margin.attr.Top = r.data.readUInt32LE(16);
			margin.attr.Bottom = r.data.readUInt32LE(20);
			margin.attr.Header = r.data.readUInt32LE(24);
			margin.attr.Footer = r.data.readUInt32LE(28);
			margin.attr.Gutter = r.data.readUInt32LE(32);
			var prop = r.data.readUInt32LE(36);
			node.attr.Landscape = prop&0x1;
			node.attr.GutterType = ["LeftOnly","LeftRight","TopBottom"][(prop>>1)&0x3];
			break;
		case HWPTAG.FOOTNOTE_SHAPE:
			var isFootNote = !pa.findChild('FOOTNOTESHAPE');
			node = isFootNote?new hml.FOOTNOTESHAPE():new hml.ENDNOTESHAPE();
			
			var autoNumFormat = node.getChild('AUTONUMFORMAT');
			var noteline = node.getChild('NOTELINE');
			var noteSpacing = node.getChild('NOTESPACING');
			var noteNumbering = node.getChild('NOTENUMBERING');
			var notePlacement = node.getChild('NOTEPLACEMENT');
			
			var prop = r.data.readUInt32LE(0);
			var numberType = prop&0xFF;
			if(numberType<=16) autoNumFormat.attr.Type = hml.NumberType2[numberType];
			else autoNumFormat.attr.Type = hml.NumberType2[numberType-0x80+15];
			var location = (prop>>8)&0x3;
			if(isFootNote){
				notePlacement.attr.Place = ["EachColumn","MergedColumn","RightMostColumn"][location];
			}else{
				notePlacement.attr.Place = ["EndOfDocument","EndOfSection"][location];
			}
			noteNumbering.attr.Type = ["Continuous","OnSection","OnPage"][(prop>>10)&0x3];
			autoNumFormat.attr.Superscript = !!((prop>>12)&0x1);
			notePlacement.attr.BeneathText = !!((prop>>13)&0x1);
			var userChar = r.data.readUInt16LE(4);
			if(userChar) autoNumFormat.attr.UserChar = String.fromCharCode(userChar);
			var prefixChar = r.data.readUInt16LE(6);
			if(prefixChar) autoNumFormat.attr.PrefixChar = String.fromCharCode(prefixChar);
			var suffixChar = r.data.readUInt16LE(8);
			if(suffixChar) autoNumFormat.attr.SuffixChar = String.fromCharCode(suffixChar);
			noteNumbering.attr.NewNumber = r.data.readUInt16LE(10);
			var notelineLength = r.data.readUInt32LE(12);
			// TODO : find values for 2cm, Column/3, and Column.
			switch(notelineLength){
				case 0xFFFFFFFF: noteline.attr.Length = '5cm'; break;
				default: noteline.attr.Length = notelineLength;
			}
			noteSpacing.attr.AboveLine = r.data.readUInt16LE(16);
			noteSpacing.attr.BelowLine = r.data.readUInt16LE(18);
			noteSpacing.attr.BetweenNotes = r.data.readUInt16LE(20);
			noteline.attr.Type = hml.LineType1[r.data.readUInt8(22)];
			noteline.attr.Width = hml.LineWidth[r.data.readUInt8(23)];
			noteline.attr.Color = r.data.readUInt32LE(24);
			break;
		case HWPTAG.PAGE_BORDER_FILL:
			// TODO : (Ext_)Masterpage?
			var type = pa.findChildren('PAGEBORDERFILL').length;
			node = new hml.PAGEBORDERFILL();
			var pageOffset = node.getChild('PAGEOFFSET');
			node.attr.Type = ["Both", "Even", "Odd"][type];
			
			var prop = r.data.readUInt32LE(0);
			node.attr.TextBorder = !!(prop&0x1); // TODO : find out whether this is inversed.
			node.attr.HeaderInside = !!(prop&0x2);
			node.attr.FooterInside = !!(prop&0x4);
			node.attr.FillArea = ["Paper", "Page", "Border"][(prop>>3)&0x3];
			pageOffset.attr.Left = r.data.readUInt16LE(4);
			pageOffset.attr.Right = r.data.readUInt16LE(6);
			pageOffset.attr.Top = r.data.readUInt16LE(8);
			pageOffset.attr.Bottom = r.data.readUInt16LE(10);
			var borderFillID = r.data.readUInt16LE(12);
			if(borderFillID) pageOffset.attr.BorderFill = borderFillID;
			break;
		default:
			// TODO : add more!
	}
	return node;
};

HWPDocument.prototype._getHMLFromCHeader = function _getHMLFromCHeader(ch){
	var s = String.fromCharCode(ch.data[3],ch.data[2],ch.data[1],ch.data[0]);
	var node;
	switch(s){
		case 'secd':
			node = new hml.SECDEF();
			var startNumber = node.getChild('STARTNUMBER');
			var hide = node.getChild('HIDE');
			this._getHMLs(node, ch.child);
			
			var prop = ch.data.readUInt32LE(4);
			hide.attr.Header = !!(prop&0x1);
			hide.attr.Footer = !!((prop>>1)&0x1);
			hide.attr.MasterPage = !!((prop>>2)&0x1);
			hide.attr.Border = !!((prop>>4)&0x1);
			hide.attr.Fill = !!((prop>>4)&0x1);
			hide.attr.PageNumPos = !!((prop>>5)&0x1);
			node.attr.FirstBorder = !!((prop>>8)&0x1);
			node.attr.FirstFill = !!((prop>>9)&0x1);
			node.attr.TextDirection = ((prop>>16)&0x7);
			hide.attr.EmptyLine = !!((prop>>19)&0x1);
			startNumber.attr.PageStartsOn = ["Both","Even","Odd"][(prop>>20)&0x3];
			// TODO_SOMEDAY : ? = (prop>>22)&0x1
			node.attr.SpaceColumns = ch.data.readUInt16LE(8);
			node.attr.LineGrid = ch.data.readUInt16LE(10);
			node.attr.CharGrid = ch.data.readUInt16LE(12);
			node.attr.TabStop = ch.data.readUInt32LE(14);
			node.attr.OutlineShape = ch.data.readUInt16LE(18);
			startNumber.attr.Page = ch.data.readUInt16LE(20);
			startNumber.attr.Figure = ch.data.readUInt16LE(22);
			startNumber.attr.Table = ch.data.readUInt16LE(24);
			startNumber.attr.Equation = ch.data.readUInt16LE(26);
			break;
		case 'cold':
			// TODO : coldef
			break;
		default:
			// TODO : fill more types
	}
	return node;
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
