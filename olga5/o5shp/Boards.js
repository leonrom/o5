
/* global window, console, IntersectionObserver */
/*jshint asi:true  */
/*jshint strict:true  */
/*jshint esversion: 6 */

(function () {              // ---------------------------------------------- o5shp/Boards ---11
	"use strict"

	const
		debugnames = ['moe4'],	//'shp1-2', 
		olga5_modul = "o5shp",
		C = window.olga5.C,
		o5debug = C.consts.o5debug,
		fmtOK = "background: cornsilk; color: black;",
		Boards = aO5 => {
			return true
		},
		wshp = C.ModulAddSub(olga5_modul, Boards),
		AskScroll = parent=>{

// Позиция полосы прокрутки по вертикали (вверх/вниз)
const scrollTop = parent.scrollTop;

// Позиция полосы прокрутки по горизонтали (влево/вправо)
const scrollLeft = parent.scrollLeft;

// Проверка, находится ли полоса прокрутки внизу контейнера
const isScrollAtBottom = (parent.scrollTop + parent.clientHeight) >= parent.scrollHeight;

// Проверка, находится ли полоса прокрутки справа контейнера
const isScrollAtRight = (parent.scrollLeft + parent.clientWidth) >= parent.scrollWidth;

console.log(`Позиция по вертикали: ${scrollTop}, Позиция по горизонтали: ${scrollLeft}`);
console.log(`Полоса прокрутки внизу контейнера: ${isScrollAtBottom}`);
console.log(`Полоса прокрутки справа контейнера: ${isScrollAtRight}`);

// Ширина полосы прокрутки
const scrollbarWidth = parent.offsetWidth - parent.clientWidth;

// Высота полосы прокрутки
const scrollbarHeight = parent.offsetHeight - parent.clientHeight;

console.log(`Ширина полосы прокрутки: ${scrollbarWidth}px, Высота полосы прокрутки: ${scrollbarHeight}px`);
		}


		учитывать наличие скроллина!
		в переборе всех parent рассматривать только те, которые имеют соотв скроллинг
		размер полосы учитывать при сравнении позиций
		наличие скроллинга переопределять только после события Resize()


	wshp.CalcParentsLocates = aO5 => {
		if (aO5.act.time === wshp.timeStamp)
			return

		aO5.act.time = wshp.timeStamp

		if (o5debug > 2)
			console.log("%c%s", fmtOK, `CalcParentsLocates - '${aO5.name}'`)

		let parent = aO5.parent
		do {
			const scope = parent.pO5.scope

			if (scope.time === wshp.timeStamp)
				continue

			scope.time = wshp.timeStamp

			if (parent.isBody)
				Object.assign(scope.pos,
					{ top: 0, left: 0, right: doc.clientWidth, bottom: doc.clientHeight, })
			else {
				const
					isO5 = parent.aO5shp,
					p = parent.getBoundingClientRect()

				Object.assign(scope.pos, {
					top: p.top + scope.add.top,
					left: p.left + scope.add.left,
					right: isO5 ? p.left + p.width : p.left + parent.clientWidth + scope.add.left,
					bottom: isO5 ? p.top + p.height : p.top + parent.clientHeight + scope.add.top,
				})
			}
			
			AskScroll (parent)

			if (o5debug > 2){
				console.log("%c%s", fmtOK, `CalcParentsLocates '${parent.pO5.name.padEnd(12)}' : top=${scope.pos.top}`)
			}
		}
		while (parent = wshp.NextParent(parent))
	}

	wshp.NextParent = parent => {
		if (!parent.pO5.isFinal) {
			if (!parent.parentElement)
				alert('')

			parent = parent.parentElement
			if (!parent.pO5)
				new wshp.PO5(parent)
			return parent
		}
	}

	wshp.FindBords = aO5 => {
		const
			errs = [],
			IsInClass = (classorigs, clss) => {
				if (classorigs.length > 0) {
					for (const cls of clss)
						if (cls && classorigs.indexOf(cls) >= 0)
							return true
				}
				else {
					if (clss.length === 0 ||
						clss.find(cls => cls.trim().length == 0) != null
					)
						return true

					// if (clss.length === 0)
					// 	return true

					// const ce=	clss.find(cls => cls.trim().length == 0)
					// if (ce!=null)					
					// 	return true
				}
			},
			FrameErr = (frame, err) => {
				frame.err = frame.err ? (frame.err + '; ' + err) : err
				errs.push(err)
			},
			mO5s = aO5.parent.pO5.mO5s

		if (o5debug && debugnames.includes(aO5.id))
			console.log('')

		let i = aO5.frames.length
		while (i-- > 0) {  //  тут не канает  "for (const [i, frame] of aO5.frames.entries()) {
			const
				frame = aO5.frames[i],
				cod = (frame.cod || '').trim(),
				t = frame.typ, 				// .toUpperCase(),
				c = cod.trim().toUpperCase(),
				n = frame.num,
				mO5 = mO5s.find(m => m.c === c && m.t === t && m.n === n) || {}

			if (!mO5.tag) {
				Object.assign(mO5, { c: c, t: t, n: n, tag: null, err: '' })
				Object.seal(mO5)

				const clss = (t === 'c') ? cod.split(/\s*[.]\s*/) : null
				let
					k = 0,
					xtag = null

				// if (c == '' && (t === 'n'|| t === 'i')) {
				// 	mO5.tag = body
				// 	if (!body.pO5)
				// 		new wshp.PO5(body)
				// }
				// else {
				let next = aO5.parent,
					parent = next
				do {
					parent = next
					// if (o5debug&&debugnames.includes(aO5.id))
					// 	console.log(parent.id)						
					if (
						(t === 'n' && parent.nodeName == c) ||
						(t === 'i' && parent.id.toUpperCase() == c) ||
						(t === 'c' && IsInClass(parent.pO5.classOrigs, clss))
					)
						if (++k >= n) {
							mO5.tag = parent
							break
						}
						else
							xtag = parent
				}
				while (next = wshp.NextParent(parent))
				// }

				if (c == '' && (t === 'n' || t === 'i'))   // для них и не должно было находиться в цикла
					Object.assign(mO5, {
						tag: parent,
						err: ` контейнер '${t}:${cod}:${n}'- взят верхнего уровня`
					})

				if (!mO5.tag)
					Object.assign(mO5, {
						tag: xtag,
						err: ` контейнер '${t}:${cod}:${n}': ` + (xtag ?
							`найдено ${k} из ${n} - взято: с id='${xtag.id}' и class=[${xtag.className}]` :
							`не найден - ИГНОРИРУЮ`)
					})

				mO5s.push(mO5)
			}
			else
				if (o5debug > 1)
					console.log(`для ${aO5.name} взял готовенький mO5(${c + ':' + t + ':' + n})`, mO5.tag.id)

			if (mO5.tag) {
				const xO5 = mO5.tag.pO5,
					f = aO5.frames.find(f => f.pO5 === xO5)

				if (f && f.pO5) {
					if (frame.fix && !f.fix) f.fix = true
					else
						if (frame.cut && !f.cut) f.cut = true
						else
							mO5.err = `повтор '${f.pO5.name}' ` +
								`для "${f.typ}:${f.cod}:${f.num}" и "${t}:${cod}:${n}" (объединил fix&cut))`
				}
				else
					frame.pO5 = mO5.tag.pO5
			}

			if (mO5.err)
				FrameErr(frame, mO5.err)
		}

		if (errs.length > 0)
			C.ConsoleError(`${aO5.name} - ошибки определения контейеров`, errs.length, errs)

		if (o5debug > 1)
			console.log("%c%s", fmtOK, `${aO5.name.padEnd(12)} `,
				`${aO5.frames.map(frame => frame.pO5 ? frame.pO5.name : 'null').join(', ')}`
			)
		// для тестирования в frames.html
		window.dispatchEvent(new CustomEvent('o5_containers', { detail: { aO5: aO5, } }))
	}

	wshp.ReadAttrs = (aO5, quals) => {   // (aO5, blng, attr) => {
		const
			errs = [],
			cls = aO5.cls,
			mdiglit = /[a-zA-Z]+|\d+/g,
			cls0 = {
				level: 0,
				pitch: '',
				none: false,
				alive: false,
				puts: { T: '', L: '', R: '', B: '', },
			},
			fram0 = { pO5: null, typ: '', cod: '', num: 0, s: '', fix: false, cut: false, err: '' }

		let setdef = true

		aO5.frames.splice(0, aO5.frames.length)
		Object.assign(cls, cls0)    // для повторной инициализации (напр. в тестах)

		if (o5debug && debugnames.includes(aO5.id))
			console.log('')

		for (const qual of quals)
			if (qual.match(/^[a-z]/)) { // с маленькой буквы начинаются описания фреймов
				const ss = qual.split(',')
				for (const s of ss)
					if (s.length > 0) {
						const
							typs = 'cin',
							cc = s.split('='),
							typ = cc[0].trim(), 		// .toUpperCase(),
							uu = (cc[1] || '').split('/'),
							cod = uu[0],
							frame = Object.assign({}, fram0, { typ: typ, cod: cod, s: s, })

						Object.seal(frame)
						if (typs.includes(typ)) {
							let sdf = true
							for (let i = 1; i < uu.length; i++) {
								const pars = uu[i].match(mdiglit)
								if (pars) {
									sdf = false
									for (const par of pars) {
										const n = Number(par)
										if (Number.isInteger(n) && !isNaN(n)) {
											// if (typ !== 'S')    // для Screen номер игнорируется
											frame.num = n
										}
										else {
											if (par.indexOf('f') >= 0) frame.fix = true
											if (par.indexOf('c') >= 0) frame.cut = true
										}
									}
								}
							}

							if (sdf)
								Object.assign(frame, {
									cut: true, fix: true,
									err: `по умолчанию включены 'fix' и 'cut'`
								})
							aO5.frames.push(frame)
						}
						else
							errs.push({ name: aO5.name, qual: qual, err: `тип ссылки '${typ}' не начинается одним из '${typs}'` })
					}
			}
			else {
				const qls = qual.match(mdiglit)
				if (qls)
					for (const ql of qls) {
						if (ql.trim() == '')
							continue

						setdef = false;
						if (!isNaN(ql))
							cls.level = Number(ql)
						else
							for (let i = 0; i < ql.length; i++) {
								const c = ql[i].toUpperCase()
								switch (c) {
									case 'A': cls.alive = true; break
									case 'C':                       // сжимает предыдущий
									case 'P':                       // сталкивает предыдущий
									case 'S':                       // сдвигает предыдущий
									case 'O': cls.pitch = c; break  // наезжает на предыдущий
									case 'T':
									case 'L':
									case 'R':
									case 'B': cls.puts[c] = c; break
									case 'N': cls.none = true; break
									default: errs.push(`не определён квалиф. '${ql[i]}' в строке "${qual[i]}"`)
								}
							}
					}
			}

		if (aO5.frames.length == 0)
			aO5.frames.push(Object.assign({}, fram0, {
				typ: 'i', s: 'умолчание',
				err: `${(quals && quals.length > 0) ? 'не найдены ' : 'не заданы '} фреймы: взяты умалчиваемые значения`
			}))

		if (!cls.pitch.trim()) cls.pitch = 'S'

		if (setdef) {
			cls.pitch = 'S'
			cls.puts.T = 'T'
		}

		if (errs.length > 0) {
			const quals = aO5.shp.aO5quals
			C.ConsoleError(`Для '${aO5.name}' c квалиф. "${quals ? quals.join(':') : '?нету?'}" ошибки: `, errs.length, errs)
		}
	}


})();

