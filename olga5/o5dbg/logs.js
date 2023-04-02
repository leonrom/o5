/* global window, console, document */
/*jshint asi:true  */
/*jshint esversion: 6*/
(function () {
	'use strict'
	const olga5_modul = 'o5dbg',
		modulname = 'logs'

	if (!window.olga5) window.olga5 = []
	if (!window.olga5[olga5_modul]) window.olga5[olga5_modul] = {}

	const
		DbgLogs = function (name) {
			const oldLog = console.log,
				oldwin = window
			let rez = '-НАШЁЛ',
				err = ''
			try {
				const debug = window.open('about:blank', name)
				if (!debug) {
					console.error(`ошибка создания всплывающенго окна: возможно дан 'http' а не  'httpS' ?- см. настроки браузера`)
					return
				}
				const o5log = debug.document.body

				if (debug.document.title == '') {
					debug.document.title = name
					// o5log.innerText = ''
					o5log.innerHTML = `
<style>
	body{
		background-color: oldlace;
		font-family: monospace;
		font-style: normal;
		font-size: small;
	}
	pre{
    	line-height: 12px;
    	margin: 0 !important;
	}
	pre span{
		margin-left: calc(100% - 7em);
		background-color: gold;
	}
</style>
`
					rez = 'Создал'
				}
				if (o5log) console.log = function () {
					oldLog.apply(console, arguments) // так точнее совпадение временных меток
					const s = Array.prototype.join.call(arguments, ' '),
						dt = new Date(),
						ds = s.trim() == '' || s[0] == '\n' ? '' : (
							(dt.getHours() + ':').padStart(3, '0') +
							(dt.getMinutes() + ':').padStart(3, '0') +
							(dt.getSeconds() + '.').padStart(3, '0') +
							(dt.getMilliseconds() + '').padEnd(3, '0'))
					// o5log.innerText += '\n' + ds + ' ' + s
					o5log.innerHTML += '<pre>' + ds + ' ' + s + '</pre>'
				}
				else err = 'Не удалось инициировать ' + name + ' ?'
			} catch (e) {
				err = 'Ошибка инициализации ' + name + ' по причине: "' + e.message + '"'
			}
			if (err) console.error(err)
			else console.log('\n<span>' + rez + ' ' + name + '</span>')

			oldwin.focus()
		}

	window.olga5[olga5_modul].DbgLogs = DbgLogs
	if (window.location.search.match(/(\&|\?|\s)(is|o5)?(-|_)?debug\s*(\s|$|\?|#|&|=\s*\d*)/))
		console.log(`}===< ${document.currentScript.src.indexOf(`/${olga5_modul}.`) > 0 ? 'дозагружен' : 'подключён '}:  ${olga5_modul}/${modulname}.js`)
})();
