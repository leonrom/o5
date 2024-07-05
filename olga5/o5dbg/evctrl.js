/* global document, window, console*/
/* exported olga5_menuPopDn_Click*/
/*jshint asi:true  */
/*jshint esversion: 6*/
(function () {              // ---------------------------------------------- events ---
	'use strict'
	const W = { modul: 'evcrtl' },
		eventsControl = {
			old: '?',
			Show: (e, src) => {
				const url = document.URL,
					c1 = `background: aqua; color:blue;`,
					qs = document.querySelectorAll("[class *= 'olga5_Start']"),
					st = (qs && qs.length > 0) ? 'ДА ' : '   ',
					rs = document.readyState ? document.readyState[0].toUpperCase() : '?',
					txt = '__' + src + `__>  ` + e.type.padEnd(22) + st + rs + ':' + (url == eventsControl.old ? (url ? ` -"-` : ``) : url).padEnd(55)

				if (e.type == 'transitionrun' && eventsControl.old == url)
					return

				if (e.type == 'readystatechange' && rs == 'C')
					console.log()
				// console.groupCollapsed('%c%s%c%s', c1, `------>   ` + e.type.padEnd(22), c2, st)
				console.groupCollapsed('%c%s', c1, txt)
				eventsControl.old = url
				for (const nam in e)
					if (nam != 'type' && !(e[nam] instanceof Function))
						console.log(nam.padEnd(24), e[nam])
				console.groupEnd()
			},
			Add: () => {
				for (const eve of ['readystatechange', 'visibilitychange', 'DOMContentLoaded', 'transitionrun']) // , 'transitionend'
					document.addEventListener(eve, e => eventsControl.Show(e, 'doc'))
				for (const eve of ['beforeunload', 'message'])
					window.addEventListener(eve, e => eventsControl.Show(e, 'win'))
			}
		},
		lognam = W.modul,
		timera = `}---< включено:  ${lognam}.js`

	console.time(timera)

	eventsControl.Add()

	function listAllEventListeners(e) {
		const allElements = Array.prototype.slice.call(document.querySelectorAll('*'));
		allElements.push(document);
		allElements.push(window);

		const types = [];

		for (let ev in window) {
			if (/^on/.test(ev)) types[types.length] = ev;
		}

		let elements = [];
		for (let i = 0; i < allElements.length; i++) {
			const currentElement = allElements[i];

			// Events attributes
			for (let j = 0; j < types.length; j++) {

				if (typeof currentElement[types[j]] === 'function') {
					elements.push({
						"node": currentElement,
						"type": types[j],
						"func": currentElement[types[j]].toString(),
					});
				}
			}

			// Events defined with addEventListener
			const awin = ['olga5_ready', 'lga5_unload'],
				adoc = ['DOMContentLoaded', 'visibilitychange', 'readystatechange']
			if (typeof currentElement._getEventListeners === 'function') {
				const evts = currentElement._getEventListeners();
				if (Object.keys(evts).length > 0) {
					for (let evt of Object.keys(evts)) {
						for (let k = 0; k < evts[evt].length; k++) {
							let eve = '  ' + evt
							if (evt == 'olga5_unload')
								eve = eve
							if (!/^on/.test(evt))
								if (!currentElement.hasOwnProperty('on' + evt))
									if ((currentElement == Window && awin.indexOf(evt) < 0) ||
										(currentElement == document && adoc.indexOf(evt) < 0))
										eve = '? ' + evt
							elements.push({
								"node": currentElement,
								"type": eve,
								"func": evts[evt][k].listener.toString()
							});
						}
					}
				}
			}

		}
		// return elements.sort();
		console.groupCollapsed('%c%s', `background: green;color:white;`, `перечень слушателей событий ` + e.type)
		console.table(elements)
		console.groupEnd()
	};

	EventTarget.prototype._addEventListener = EventTarget.prototype.addEventListener;

	EventTarget.prototype.addEventListener = function (a, b, c) {
		if (c == undefined) c = false
		else c = c
		this._addEventListener(a, b, c);
		if (!this.eventListenerList) this.eventListenerList = {};
		if (!this.eventListenerList[a]) this.eventListenerList[a] = [];
		this.eventListenerList[a].push({ listener: b, options: c });
	};

	EventTarget.prototype._getEventListeners = function (a) {
		if (!this.eventListenerList) this.eventListenerList = {};
		if (a == undefined) { return this.eventListenerList; }
		return this.eventListenerList[a];
	};

	EventTarget.prototype._removeEventListener = EventTarget.prototype.removeEventListener;
	EventTarget.prototype.removeEventListener = function (a, b, c) {
		if (c == undefined) c = false;
		this._removeEventListener(a, b, c);
		if (!this.eventListenerList) this.eventListenerList = {};
		if (!this.eventListenerList[a]) this.eventListenerList[a] = [];

		for (let i = 0; i < this.eventListenerList[a].length; i++) {
			if (this.eventListenerList[a][i].listener == b, this.eventListenerList[a][i].options == c) {
				this.eventListenerList[a].splice(i, 1);
				break;
			}
		}
		if (this.eventListenerList[a].length == 0) delete this.eventListenerList[a];
	};

	listAllEventListeners({type:'инициализация'})
	window.addEventListener('olga5_ready', listAllEventListeners)	
	console.timeEnd(timera)
})();
