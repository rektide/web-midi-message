import defineBinding from "define-binding"

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

export class Message{
	constructor( kvs, options){
		options= options|| {}
		this.kvs= kvs
		this.defaults= options.defaults|| {}
		for( var i in moduleDefaults){
			defineBinding( this.defaults, i, moduleDefaults) // sett
		}
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
	toBytes(){
		var
		  defaults= this.defaults|| {},
		  output= [],
		  missing= []
		for( var kv of this.kvs){
			var
			  extra= kv.extra&& (this[ kv.extra]|| defaults[ kv.extra]),
			  value= kv.value+ extra
			if( val=== undefined){
				missing.push( kv.name)
				continue
			}
			output.push( val)
		}
		if( missing.length){
			throw new Error("Missing properties "+ missing.join(", "))
		}
		return output
	}
	// big feels this would be better static.
	fromBytes( bytes){
		var tryLoad= (indexKv,indexBytes)=>{
			var
			  kv= this.kvs[ indexKv],
			  bite= bytes[ indexBytes=== undefined? indexBytes: indexKv],
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

		// iterate forward until "variable"
		for( var i in this.kvs){
			if( !load( i)){
				return false
			}
			var kv= this.kvs[ i]
			if( kv.variable){
				variable= i
				break
			}
		}
		if( variable){
			// iterate backwards
			// walk backwards
			for( var i= this.kvs.length- 1; i> variable; --i){
				var varlen= this.bytes.length- this.kvs.length
				if( !load( i, i+ varlen)){
					return false
				}
			}
		}
		return this
	}
}
export default Message
