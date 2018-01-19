import defineBinding from "define-binding"

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
	// big feels this would be better static.
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
			}
		}
		return this
	}
}
export default Message
