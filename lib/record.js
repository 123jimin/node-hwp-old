const BEGIN = 0x010;

var HWPTAG = {
	'DOCUMENT_PROPERTIES': BEGIN,
	'ID_MAPPINGS': BEGIN+1,
	'BIN_DATA': BEGIN+2,
	'FACE_NAME': BEGIN+3,
	'BORDER_FILL': BEGIN+4,
	'CHAR_SHAPE': BEGIN+5,
	'TAB_DEF': BEGIN+6,
	'NUMBERING': BEGIN+7,
	'BULLET': BEGIN+8,
	'PARA_SHAPE': BEGIN+9,
	'STYLE': BEGIN+10,
	'DOC_DATA': BEGIN+11,
	'DISTRIBUTE_DOC_DATA': BEGIN+12,
	// 13 : RESERVED
	'COMPATIBLE_DOCUMENT': BEGIN+14,
	'LAYOUT_COMPATIBILITY': BEGIN+15,
	
	'PARA_HEADER': BEGIN+50,
	'PARA_TEXT': BEGIN+51,
	'PARA_CHAR_SHAPE': BEGIN+52,
	'PARA_LINE_SEG': BEGIN+53,
	'PARA_RANGE_TAG': BEGIN+54,
	'CTRL_HEADER': BEGIN+55,
	'LIST_HEADER': BEGIN+56,
	'PAGE_DEF': BEGIN+57,
	'FOOTNOTE_SHAPE': BEGIN+58,
	'PAGE_BORDER_FILL': BEGIN+59,
	'SHAPE_COMPONENT': BEGIN+60,
	'TABLE': BEGIN+61,
	'SHAPE_COMPONENT_LINE': BEGIN+62,
	'SHAPE_COMPONENT_RECTANBLE': BEGIN+63,
	'SHAPE_COMPONENT_ELLIPSE': BEGIN+64,
	'SHAPE_COMPONENT_ARC': BEGIN+65,
	'SHAPE_COMPONENT_POLYGON': BEGIN+66,
	'SHAPE_COMPONENT_CURVE': BEGIN+67,
	'SHAPE_COMPONENT_OLE': BEGIN+68,
	'SHAPE_COMPONENT_PICTURE': BEGIN+69,
	'SHAPE_COMPONENT_CONTAINER': BEGIN+70,
	'CTRL_DATA': BEGIN+71,
	'EQEDIT': BEGIN+72,
	// 73 : RESERVED
	'SHAPE_COMPONENT_TEXTART': BEGIN+74,
	'FORM_OBJECT': BEGIN+75,
	'MEMO_SHAPE': BEGIN+76,
	'MEMO_LIST': BEGIN+77,
	
	'FORBIDDEN_CHAR': BEGIN+78,
	
	'CHART_DATA': BEGIN+79,
	'SHAPE_COMPONENT_UNKNOWN': BEGIN+99
};


var HWPRecord = function HWPRecord(offset, buffer){
	var header = buffer.readUInt32LE(offset); offset += 4;
	this.tag = header&0x3FF;
	this.level = (header>>10)&0x3FF;
	this.size = header>>20;
	this.child = [];
	if(this.size === 4095){
		this.size = buffer.readUInt32LE(offset);
		offset += 4;
	}
	this.data = buffer.slice(offset, offset+this.size);
	this._offset = offset+this.size;
};

HWPRecord.getTree = function getTree(offset, buffer){
	var records_flat = [];
	while(offset<buffer.length){
		var record = new HWPRecord(offset, buffer);
		offset = record._offset;
		records_flat.push(record);
	}
	var prv = records_flat[0], records = [prv];
	for(var i=1;i<records_flat.length;i++){
		var record = records_flat[i];
		if(record.level == 0){
			prv = record;
			records.push(prv);
		}else{
			while(prv.level >= record.level){
				prv = prv.parent;
				if(!prv) throw new Error('Invalid record root');
			}
			prv.child.push(record);
			record.parent = prv;
			prv = record;
		}
	}
	return records;
};

exports.HWPRecord = HWPRecord;
exports.HWPTAG = HWPTAG;
