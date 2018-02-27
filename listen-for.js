import Message from "./Message.js"
import once from "eventtarget-once"

export function listenFor( messageKlass, eventTarget, name, byteReader){
	if( messageKlass=== Message){
		// only a derived type will have kv's to load bytes with
		throw new Error( "Expected a derived type")
	}
	if( !byteReader){
		// default to `msg.data`, which is where we expect bytes from a MIDIMessageEvent.
		byteReader= msg=> msg.data
	}

	// create an instance of this messageKlass
	var instance= new messageKlass()
	// read messages until we resolve the first instance of this messageKlass
	return once( eventTarget, name, { filter})

	// load this event's bytes into the instance, or fail
	function filter( evt){
		var
		  bytes= byteReader( evt),
		  success= instance.fromBytes( bytes)
		if( !success){
			return false
		}
		return instance
	}
}
export default listenFor
