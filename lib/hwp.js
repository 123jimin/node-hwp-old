var OLEDoc = require('ole-doc').OleCompoundDoc;

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var zlib = require('zlib');

var hml = require('./hml.js').hml;
var HWPRecord = require('./record.js').HWPRecord;

var HWPDocument = function HWPDocument(file){
	EventEmitter.call(this);
	
	var _this = this;
	
	this._file = file;
	var odoc = this._doc = new OLEDoc(file);
	
	this._hml = undefined;
	this._hwp_meta = null;

	this._doc.on('err', function(err){this.emit('err',err)});
	
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

	var getRaw = function(buffer, callback){
		if(_this._hwp_meta.compressed){
			zlib.inflateRaw(buffer, function(x, rbuffer){
				callback(rbuffer);
			});
		}else callback(buffer);
	};

	var getRawBuffer = function(stream, callback){
		getBuffer(stream, function(buffer){
			getRaw(buffer, callback);
		});
	};

	// Read FileHeader
	this._doc.on('ready', function(){
		getBuffer(odoc.stream('FileHeader'), function(buffer){
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
				n_this.emit('err', new Error('Can\'t open encrypted or distributed hwp file'));
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
			_head(function(head){
				_this._hml.add(head);
				_this.emit('ready');
			});
		});
	});
	
	// Get HML HEAD
	var _head = function _head(callback){
		var head = new hml.HEAD();
		// DOCSETTING
		var setting = new hml.DOCSETTING();
		getRawBuffer(odoc.stream('DocInfo'), function(buffer){
			// console.log(HWPRecord.getTree(0, buffer));
		});
	};

	this._doc.read();
};
util.inherits(HWPDocument, EventEmitter);

HWPDocument.prototype.toHMLString = function(){
	return this._hml.toHMLString();
};

exports.HWPDocument = HWPDocument;
