const byteMask= 0xFF

/**
  create a mask of all bits in the byte right of first bit
*/
export function extraMask( bite, kv){
	var extraMask= kv.extraMask
	if( extraMask=== undefined){
		// tempted to be more algorithmic, but this heuristic holds
		extraMask= kv.value? 0xF: 0xFF
	}
	//if( !extraMask){
	//	extraMask= bite
	//	var prev
	//	do{
	//		prev= extraMask
	//		extraMask= extraMask| ( extraMask<< 1)
	//		extraMask= extraMask& byteMask
	//	}while( extraMask!= prev)
	//}
	return bite& extraMask& byteMask
}

/**
  The loading or loaded "./listen-for.js" method. This method has another dependency, so it is quarantined off & loaded as a dynamic-import.
*/
let _listenFor

/**
  Structured representation of a MIDIMessage
*/
export class Message{
	constructor( kvs, options){
		options= options|| {}
		this.kvs= kvs
		this.defaults= options.defaults|| {}
		this.loadDefaults()
		if( options.bytes){
			this.fromBytes( options.bytes)
		}
	}
	loadDefaults(){
		for( var kv of this.kvs){
			var val= kv.value!== undefined? kv.value: this.defaults[ kv.name]|| 0
			if( val!== undefined){
				this[ kv.name]= val
			}
			if( kv.extra){
				this[ kv.extra]= this.defaults[ kv.extra]|| 0
			}
		}
	}
	assign( options){
		Object.assign( this, options)
	}
	/**
	  Return a new byte-array equivalent to this structured representation.
	*/
	toBytes(){
		var
		  defaults= this.defaults|| {},
		  output= [],
		  missing= []
		for( var kv of this.kvs){
			var
			  extra= kv.extra&& (this[ kv.extra]|| defaults[ kv.extra])|| 0,
			  value= kv.value+ extra
			if( value=== undefined){
				missing.push( kv.name)
				continue
			}
			output.push( value)
		}
		if( missing.length){
			throw new Error("Missing properties "+ missing.join(", "))
		}
		return output
	}
	/**
	  Load the given byte array into this instance.
	  If unexpected data is encountered during loading, return false and leave this instance in a dirty undefined state.
	*/
	fromBytes( bytes){
		var tryLoad= (indexKv,indexBytes)=>{
			var
			  kv= this.kvs[ indexKv],
			  bite= bytes[ indexBytes=== undefined? indexKv: indexBytes],
			  checkValue= bite
			this[ kv.name]= bite
			if( kv.extra){
				var
				  mask= extraMask( bite, kv),
				  inverse= mask^ byteMask,
				  extra= bite& mask
				this[ kv.extra]= extra
				// remove "extra" such that we can check against value
				checkValue&= inverse
			}
			return checkValue=== kv.value
		}

		var offset= 0
		for( var i in this.kvs){
			i= Number.parseInt( i) // ?
			if( !tryLoad( i, offset+ i)){
				return false
			}
			var kv= this.kvs[ i]
			if( kv.variable){
				offset= bytes.length- this.kvs.length
				this[ kv.name]= bytes.slice( i, bytes.length- this.kvs.length+ i+ 1)
			}
		}
		return this
	}

	/**
	  Static factory method for subclasses of Message, for an array of bytees.
	*/
	static fromBytes( bytes){
		var instance= new this()
		if( !instance.fromBytes( bytes)){
			throw new Error( "Invalid bytes")
		}
		return instance
	}
	/**
	  Listen to an EventTarget for the first instance of a subclass of Message.
	  Note that this method uses dynamic-import to load listen-for and it's dependencies on the fly.
	*/
	static async listenFor( eventTarget, name, byteReader){
		// start _listenFor dynamic-import if we don't have it
		if( !_listenFor){
			// save wip dynamic-import into module scope for anyone else coming along while we're still loading it
			_listenFor= import( "./listen-for.js")
		}
		// check if _listenFor is loaded
		if( _listenFor.then){
			// wait for _listenFor to load, & save it
			_listenFor= (await _listenFor).default
		}
		// run loaded _listenFor
		return _listenFor( this, eventTarget, name, byteReader)
	}
}
export default Message
