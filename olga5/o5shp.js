/* global document, window */
/*jshint asi:true  */
/*jshint strict:true  */
/*jshint esversion: 6 */
/*								Алгоритм выполнения скроллинга
										DoScroll

Подготовка => 
	- для всех aO5 посбрасывать
		- новые координаты
	    - отметки фиксации	tryFix
	    - "ближайший" фрейм nPnear

Выполнение =>
	ЕстьСтыковка =>
		- ЕСЛИ НЕТ hidden но ЕСТЬ отметка о fixed то
		    - rez = ЕСЛИ приоритет aO5 меньше чем fO5 ТО -1 иначе
		            ЕСЛИ приоритет aO5 больше чем fO5 ТО +1
		    - если rez!==0 и есть КАСАНИЕ и ЗАТЕНЕНИЕ 
		      и нету "ближайший" фрейм или касание ближе "ближайшего" к fO5 фрейма 
		        - return rez
		- return 0

	БлижайшийФрейм(aO5, x) =>
	    - для всех frames у aO5
	        - ЕСЛИ тег достиг границы фрейма
	            - проверяем (и сохраняем) как "ближайший" фрейм

	НаБлижнемТеге(aO5, x) =>
	    - для fO5 тех, что после aO5 в обратной последоветельности 
	        - ЕСЛИ ЕстьСтыковка < 0 тогда 
	            - отметка фиксации aO5.tryFix[x]= true  (как прижатие к fO5)
	            - запоминаю cO5 = fO5
	            - break 

    	- для fO5 тех, что после aO5  в обратной последоветельности  (т.е. такой же цикл)
	        - если fO5===cO5 
	            - break
	        - ЕСЛИ ЕстьСтыковка > 0  тогда                 
	            - меняю размер fO5
	            - ЕСЛИ для fO5 размер<0 и если НЕ alive то ему
	                - включаем  hidden                 
	            - ИНАЧЕ 
	                - отлючаю hidden  

	НаБлижнемФрейме =>
		ЕСЛИ был найден "ближайший" фрейм
	        - отметка фиксации aO5.tryFix[x]= true на нём

	- перебор по направлениям X
	    - для aO5 всех в прямой последоветельности по X
			БлижайшийФрейм(aO5, x)

	    - для aO5 всех в прямой последоветельности по X
			- НаБлижнемТеге(aO5, x)
	
	        - ЕСЛИ (всё еще) нет отметки фиксации aO5 
				-НаБлижнемФрейме

Фиксация =>
- для aO5 всех в любой последоветельности     
	- естьФиксация = false
	- ЦИКЛ по вариантам фиксации X
    	- ЕСЛИ есть отметки фиксации aO5.tryFix[X]
			- естьФиксация = true
    	    - ЕСЛИ не зафиксирован 
    	        - фиксирую фактически
			- break
    - ЕСЛИ !естьФиксация
        - ЕСЛИ был зафиксирован 
            - расфиксирую фактически

    - ЕСЛИ зафиксирован фактически
        - показываю ShowFix

===========================
убрать
	tryFix		
	stxs
	stixs
*/
(function () {              // ---------------------------------------------- o5shp ---
	"use strict";

	const
		C = window.olga5.C,
		W = {
			modul: 'o5shp',
			Init: ShpInit,
			class: 'olga5_shp',
			incls: {
				// names: ['DoScroll', 'DoResize', 'Boards', 'Frames', 'AO5shp', 'PO5shp', 'DoInit'],
				names: ['DoInit', 'AO5shp'],
				actscript: document.currentScript,
			},
		},
		o5css = `
			.olga5_cart {
				 cursor: pointer;;
			}
		`,
		wshp = C.ModulAdd(W)

	function ShpInit() {

		C.ParamsFill(W, o5css)

		const excls = document.getElementsByClassName('o5shp_none')
		for (const excl of excls) {
			const exs = excl.querySelectorAll('[class *=olga5_shp]')
			for (const ex of exs)
				ex.classList.add('o5shp_none')
		}

		wshp.DoInit.Init()

		C.E.DispatchEvent('o5_scriptDone', W.modul)

		wshp.activated = false 	// признак, что было одно из activateEvents 
		const activateEvents = ['click', 'keyup', 'resize'],
			wd = window, // document
			SetActivated = () => {
				wshp.activated = true
				activateEvents.forEach(activateEvent => wd.removeEventListener(activateEvent, SetActivated))
			}

		activateEvents.forEach(activateEvent => wd.addEventListener(activateEvent, SetActivated))
	}

	wshp.Map = class extends Map {
		constructor(cc = "|") {
			super()
			this.cc = cc
		}
		#normalizeKey(key) { return Array.isArray(key) ? key.join(this.cc) : key }
		set(key, value) { return super.set(this.#normalizeKey(key), value) }
		get(key) { return super.get(this.#normalizeKey(key)) }
		has(key) { return super.has(this.#normalizeKey(key)) }
		delete(key) { return super.delete(this.#normalizeKey(key)) }
	}

	wshp.IntersectionObserver = class extends IntersectionObserver {
		constructor(callback, options) {
			super(callback, options)
			this.tags = new Set() // Используем Set, чтобы не было дубликатов
			this.aO5s = new Set() // все контролируемые aO5
		}
		observe(tag) {
			if (!this.tags.has(tag)) {
				super.observe(tag)
				this.tags.add(tag)
				// const aO5s = tag.pO5.aO5xs.T
				// for (const aO5 of aO5s)
				// 	this.aO5s.add(aO5)
			}
		}
		unobserve(tag) {
			if (this.tags.has(tag)) {
				super.unobserve(tag)
				this.tags.delete(tag)

				this.aO5s.length = 0
				for (const tag of this.tags) {
					const aO5s = tag.pO5.aO5ps.T
					for (const aO5 of aO5s)
						this.aO5s.add(aO5)
				}
			}
		}
		disconnect() {
			super.disconnect()
			this.tags.length = 0
		}
		// getObservedElements() {
		// 	return Array.from(this.tags)
		// }
		// has(tag) {
		// 	return this.tags.has(tag)
		// }
	}

	wshp.ascroll = { isScroll: false, name: 'scroll', fun: null, arg: true },
	wshp.allAO5s = new Set()		// все объекты в документе
	wshp.allPO5s = new Set()		// все объекты в документе
})();
