const BEGIN = 0x010;

var HWPTAG = {
	'DOCUMENT_PROPERTIES': BEGIN,
	'ID_MAPPINGS': BEGIN+1,
	'BIN_DATA': BEGIN+2
};


var HWPRecord = function HWPRecord(offset, buffer){
	var header = buffer.readUInt32LE(offset); offset += 4;
	this.tag = header&0x3FF;
	this.level = (header>>10)&0x3FF;
	this.size = header>>20;
	if(this.size === 4095){
		this.size = buffer.readUInt32LE(offset);
		offset += 4;
	}
	this.data = new Buffer(this.size);
	buffer.copy(this.data, 0, offset, offset+this.size);
	this._offset = offset+this.size;
};

HWPRecord.getTree = function getTree(offset, buffer){

};

exports.HWPRecord = HWPRecord;
exports.HWPTAG = HWPTAG;
