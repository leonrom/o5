/* global document, window, console*/
/* exported olga5_menuPopDn_Click*/
/*jshint asi:true  */
/*jshint esversion: 6*/
(function () {              // ---------------------------------------------- o5mnu ---
	'use strict'
	const
		C = window.olga5.C,
		W = {
			modul: 'o5mnu',
			Init: Init,
			class: 'olga5_menu',
			consts: 'o5menudef=; scrollY=-18'
		},
		class_empty = W.class + '_empty',
		class_small = W.class + '_small',
		o5css = `
.${W.class} {
    margin: 0 !important;
    padding: 0 !important;
    font-size: small;
    height: min-content;
    width: max-content;
    z-index: 1111111;
    top: 1px;
    right: 1px;
    position: unset; /* будут присвоено ниже */
    display: initial; 
}
.${W.class}.Left {left: 1px; right:''}

/*.${class_small} {
	width: 144px;
	text-align: center ! important;
	text-align: -moz-center;
	text-align: -webkit-center;
	font-size: smaller ! important;
	line-height: 11px ! important;
}*/

.${W.class} ul {
    margin: 0;
    padding: 0;
    border-radius: 2px;
    display: grid;    /* иначе переносит строки последующего пункта при открытии подменю */
}

.${W.class} li {
    display: block;
    color: white;
    background: gray;
    height: 1.5em;
    text-align: left;
	text-align: -webkit-left;
	text-align: -moz-left;
    border-bottom: 0.01em solid lightseagreen;
    padding: 1px 5px 1px 2px;
    cursor: pointer;
    font-family: sans-serif;
    font-size: small;
    margin-bottom: 0 !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
}

.${W.class} li>ul {
    position: absolute;
    top: unset;
    display: none;
    padding: 0;
    margin: 0;
    border: 1px solid darkgrey;
    outline: 1px solid white;
    float: right;
}
.${W.class}.Left li>ul {float: left;}

.${W.class}>li {
    background-color: white;
    border: none;
    border-radius: 8px;
    background-color: transparent;	
	text-align: right;
	text-align: -moz-right;
	text-align: -webkit-right;
	// text-align: -moz-left;
}

.${W.class}.Left>li {
    text-align: left;
	text-align: -webkit-left;
	text-align: -moz-left;
}

.${W.class}>li>ul {
    outline: 1px solid bisque;
    top: 0.5em;
    position: relative;
    right: 0.1em;
}

.${W.class}>li>ul {left: 0.1em;}
.${W.class}>li>ul>li>ul { right: 3.1em; margin-top: -4px;}
.${W.class}>li>ul>li>ul>li>ul { right: 6.1em; margin-top: -3px;}
.${W.class}>li>ul>li>ul>li>ul>li>ul { right: 9.1em; margin-top: -3px;}
.${W.class}>li>ul>li>ul>li>ul>li>ul>li>ul { right: 12.1em; margin-top: -3px;}
.${W.class}.Left>li>ul {left: 0.1em;}
.${W.class}.Left>li>ul>li>ul { left: 3.1em; margin-top: -4px;}
.${W.class}.Left>li>ul>li>ul>li>ul {left: 6.1em; margin-top: -3px;}
.${W.class}.Left>li>ul>li>ul>li>ul>li>ul {left: 9.1em; margin-top: -3px;}
.${W.class}.Left>li>ul>li>ul>li>ul>li>ul>li>ul {left: 12.1em; margin-top: -3px;}

.${W.class} li>span {
    display: flex;
    padding-left: 6px;
    height: 100%;
    align-items: center;
    width: max-content;
    justify-content: flex-start;
    overflow: hidden;
}

.${W.class}>li>span {
    border: 1px solid darkgray;
    border-radius: 8px;
    color: black;
    background-color: yellow;
    padding: 3px 4px 2px 4px;
    justify-content: center;
    height: min-content;
	// width: -moz-min-content;
	width: fit-content;
}

.${W.class} li:hover {
    color: black;
    background-color: lavender;
}

.${W.class}>li:hover {
    background: transparent;
    height: 3em;
}

.${W.class}>li:hover>span {
    color: white;
    background: gray;
    border: 0.01em solid lightseagreen;
    padding-bottom: 4px;
}

.${W.class} li:hover>ul,
.${W.class} li>ul:hover {
    display: block;
}

.${W.class} li:active>ul {    /* для корректного "гашения" - д.б. ПОСЛЕДНИМ ! */
    display: none;
}
.main-outer {
    background-color: ghostwhite;
    border: 1px solid navajowhite;
}

.${class_empty} {
    height: 2px ! important;
    background-color: aqua ! important;
}

.olga5-menuhidden{
	display:none;
}
`,

		// const phases = ['NONE', 'CAPTURING_PHASE', 'AT_TARGET', 'BUBBLING_PHASE',]
		win = { target: '_self', resize: true, scrollX: 0, scrollY: -18, }, // blockclick: false, timclick: 0 },
		Target = function (e) {
			let target = e.toElement || e.target
			while (target && !target.o5menus) target = target.parentElement
			return target
		},
		OnMnu = function (e) {
			const target = Target(e)
			if (target && !target.o5menus.ready) target.o5menus.ready = true
		},
		GoTo = function (o5menus) {
			const tag = document.getElementById(o5menus.ref)
			if (tag) {
				tag.scrollIntoView({ block: o5menus.block, behavior: "smooth" })
				return true
				// if (win.scrollY != 0) window.scrollBy(0, win.scrollY)
			} else
				C.ConsoleError("GoTo: не определён тег в текущем окне: ", o5menus.ref)
		},
		DoMnu = e => {
			if (C.consts.o5debug)
				console.log('DoMnu: ' + e.type + ' ' + e.eventPhase + ' ' + e.timeStamp.toFixed(1).padEnd(6))
			const target = Target(e)
			if (target && target.o5menus.ready) {
				const o5menus = target.o5menus
				o5menus.ready = false

				let ok = true
				if (o5menus.isext) window.open(o5menus.ref, win.target)
				else
					ok = GoTo(o5menus)

				if (ok && win.resize) {
					if (window.olga5.o5shp)
						window.olga5.o5shp.DoResize('из o5mnu')
				}
				win.blockclick = true
				e.cancelBubble = true
			}
		},
		Clear = e => {
			if (C.consts.o5debug)
				console.log('Clear: ' + e.type + ' ' + e.eventPhase + ' ' + e.timeStamp.toFixed(1).padEnd(6) +
					' ' + (win.blockclick ? 'очищаю' : ''))
			if (win.blockclick) {
				win.blockclick = false
				e.cancelBubble = true
			}
			// // win.timclick = e.timeStamp
			// e.cancelBubble = true
		},
		MnuInit = function (items) {
			if (C.consts.o5nomnu > 0) return

			const proc = 'MnuInit',
				errs = []
			if (!items || !items[0]) errs.push(`${proc}: не определеныа структура меню`)
			if (errs.length == 0) {
				const uls = [],
					item0 = items[0],
					base = item0.base || ''

				const id = item0.id || ''
				if (id && document.getElementById(id)) errs.push(`${proc}: повтор создания меню с id='${id}'`)

				if (item0.target) {
					win.target = item0.target
					win.resize = false
				}
				if (W.consts.scrollY) win.scrollY = parseInt(W.consts.scrollY)

				let ul = document.createElement("ul")

				ul.id = id
				ul.className = W.class
				if (item0.right) ul.style.right = item0.right
				else if (item0.left) {
					ul.style.left = item0.left
					ul.classList.add('Left')
				}
				if (item0.top) ul.style.top = item0.top

				let owner = document.body
				if (item0.owner) {
					if (typeof item0.owner === 'object') owner = item0.owner
					else {
						const own = item0.owner.trim(),
							xwner = (!own || own.match(/\.body\b/)) ? document.body : document.querySelector(own)

						if (xwner) owner = xwner
						else
							C.ConsoleError(`${proc}: нет owner'а для '${own}'`)
					}
				}
				if (item0.position) ul.style.position = item0.position
				else if (!item0.owner) ul.style.position = 'fixed'
				else ul.style.position = 'absolute'

				if (ul.style.position == 'absolute') {
					const nst = window.getComputedStyle(owner),
						position = nst.getPropertyValue('position')
					if (position != 'absolute')
						C.ConsoleError(`${proc}: контейнер ${C.MakeObjName(owner)} для меню '${C.MakeObjName(ul)}' имеет position='${position}' (не ''absolute)`)
				}
				if (item0.noremov) owner.insertBefore(ul, owner.firstChild)  // НЕ удаляется по закрытии страницы (owner.appendChild(ul))				
				else
					C.page.InsertBefore(owner, ul, owner.firstChild)

				ul.addEventListener('mousedown', DoMnu, true)
				ul.addEventListener('click', DoMnu, true)
				// window.addEventListener('click', Clear, true)
				C.E.AddEventListener('click', Clear, true)

				uls[0] = ul
				const blc = (item0.block || 's')[0].toLowerCase(),
					block = blc == 's' ? 'start' : (blc == 'e' ? 'end' : (blc == 'n' ? 'nearesr' : 'center'))

				let m = 0
				for (const item of items) {
					const li = document.createElement('li')

					// li.addEventListener('click', Clear, true) 
					li.style.zIndex = 99999
					li.o5menus = { isext: true, block: block }
					if (item.ref) {
						const ref = item.ref || '',
							wl = window.location
						if (ref.length == 0) li.o5menus.ref = wl.origin + wl.pathname
						else if (C.IsFullUrl(ref)) li.o5menus.ref = ref // (ref.match(/^\s*(https?:)\/\//)) li.o5menus.ref = ref
						else if (ref.match(/\.html?($|\?|&|#)/)) li.o5menus.ref = base + ref
						else {
							li.o5menus.ref = ref[0] == '#' ? ref.substr(1) : ref
							li.o5menus.isext = false
						}
					}

					if (item.title) li.title = item.title
					if (item.class) li.classList.add(item.class)
					if (item.style) li.style = item.style

					if (m == 0)
						li.onmouseover = OnMnu

					ul.appendChild(li)

					if (item.span && item.span != '') {
						const span = document.createElement('span')
						span.innerText = item.span
						li.appendChild(span)
					} else
						li.classList.add(class_empty)

					if (item.add) {
						ul = document.createElement("ul")
						ul.style.width = item.add
						li.appendChild(ul)
						uls[++m] = ul
					} else if (item.ret) {
						m = m - item.ret
						if (m < 0) {
							errs.push('m: item.ret=' + item.ret + ', ')
							m = 0
						}
						ul = uls[m]
					}
				}
			}
			if (errs.length > 0)
				C.ConsoleError("${proc}: ошибки создания меню: ", errs.length, errs)
		}

	function Init() {
		const
			InitByText = (menu, tag) => {// если есть такой атрибут}
				const regval = /^["'`;{\s]*|["'`},\s]*$/g,
					lis = menu.match(/{[^}]*}/g) || [],
					items = [],
					errs = []

				for (const li of lis) {
					const pairs = li.match(/[^,]+(,|})/g),
						item = {}
					for (const pair of pairs) {
						try {
							const i = pair.indexOf(':'),
								nam = pair.substr(0, i).replaceAll(regval, ''),
								val = pair.substr(i + 1).replaceAll(regval, '')
							item[nam] = val
						} catch (err) {
							errs.push({ li: li, pair: pair })
						}
					}
					items.push(item)
				}
				if (errs.length > 0)
					C.ConsoleError("Init: ошибки в строках атрибута 'o5menudef': ", errs.length, errs)

				MnuInit(items)
			}

		if (C.consts.o5nomnu > 0) C.ConsoleInfo(`Меню отключено по o5nomnu=${C.consts.o5nomnu}`)
		else {
			if (!W.isReady) {
				C.ParamsFill(W, o5css)
				window.olga5.Menu = MnuInit
			}

			const menu = (W.consts['o5menudef'] || '').trim()
			if (menu)	// если есть такой атрибут}
				InitByText(menu)

			const tags = C.GetTagsByClassNames('olga5-menuhidden', W.modul)
			if (tags)
				tags.forEach(tag => {
					InitByText(tag.innerText.trim(), tag)
				})
		}
		// window.dispatchEvent(new CustomEvent('olga5_sinit', { detail: { modul: W.modul } }))
		C.E.DispatchEvent('olga5_sinit', W.modul)
	}

	C.ModulAdd(W)
})();
