export function new_eval(str) {
	return new Function('return ' + str)()
}
