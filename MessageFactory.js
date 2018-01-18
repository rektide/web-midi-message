import Message from "./Message"

export function MessageFactory( kvs, staticDefaults){
	var klass= class extends Message {
		constructor( vals, defaults){
			super( kvs, defaults)
			Object.assign( this, staticDefaults, defaults, this, vals) // i dunno i'm making this defaults stuff up
		}
	}
	// thought of these statics working on a static fromBytes impl
	klass.kvs= kvs
	klass.staticDefaults= staticDefaults
	return klass
}
export default MessageFactory
