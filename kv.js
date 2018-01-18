/**
  @param value - the matching part of the byte
  @param name - the general description for this byte
  @param extra - description of the free bits in this byte. if name is null, assume entire byte is this description.
  @param more - a bundle of additional options to set
  @param more.label - description if this is a particular static value of a byte
  @param more.variable - true if this might represent a variable number of bytes
  @param more.extraMask - the mask for extra. default: 0xFF if !value, else 0xF0
*/
export function kv( value, name, extra, more){
	more= more|| {}
	const noName= name=== undefined|| name=== null
	if( noName&& extra!== undefined){
		name= extra
	}
	if( name=== null){
		name= undefined
	}
	if( extra=== null){
		extra= undefined
	}
	return { value, name, extra, ...more}
}
export default kv
