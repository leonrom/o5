
function MyPopUp(s1, s2, s3) {
	const
		e = arguments.callee.caller.arguments[0],
		tag = e.target.parentElement,
		trez = tag.parentElement.getElementsByClassName('crez')[0],
		srez = window.olga5.PopUp(s1, s2, s3)

	if (!trez) alert(`что за тег '${t}'  в  MyPopUp() ?`)
	else
		if (srez) trez.innerText = srez
}
function Init() {
	const tsrcs = document.getElementsByClassName('csrc')
	for (const tsrc of tsrcs) {
		const atrs = tsrc.parentElement.attributes
		for (const atr of atrs)
			if (atr.name.match(/onclick/i)) {
				tsrc.innerText = atr.value.replace('MyPopUp', '...')
				break
			}
	}
}
window.addEventListener("DOMContentLoaded", Init)
window.addEventListener("olga5-incls", Init)