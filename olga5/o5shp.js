/* global document, window */
/*jshint asi:true  */
/*jshint strict:true  */
/*jshint esversion: 6 */

(function () {              // ---------------------------------------------- o5shp ---
	"use strict";

	const
		C = window.olga5.C,
		W = {
			modul: 'o5shp',
			Init: ShpInit,
			class: 'olga5_shp',
			incls: {
				names: ['DoInit', 'PBords', 'AO5shp', 'PO5shp', 'Frames', 'DoChgs'],
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
	}    
})();
