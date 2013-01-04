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
	this.child = [];
	if(this.size === 4095){
		this.size = buffer.readUInt32LE(offset);
		offset += 4;
	}
	this.data = new Buffer(this.size);
	buffer.copy(this.data, 0, offset, offset+this.size);
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
