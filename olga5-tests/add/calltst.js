/* global console, window */
/* exported shp_WinOpen*/
/* exported shp_Init, Init0, Init1, Init2, Init3 */
/* exported shp1_ChangeContainers(), shp2_ChangeContainers(), shp3_ChangeContainers(), */

/*jshint asi:true  */
/*jshint strict:true  */
/*jshint esversion: 6 */

function shp_WinOpen(nam) {
	"use strict";
	const shp_DelWnd = (txt, key) => {
		// alert('исправить по olga5_popup')  !!!!!!!!!!!!!!!!!!!!!!!
			const wnd = window.olga5_popup

			console.log(txt + ': ' + (wnd ? ('wnd=yes, key=`' + wnd.key + '`') : 'wnd=NO, key=`' + key + '`'))
			if (wnd && (key == wnd.key || key === '')) {
				// console.log('test-shp:: shp_DelWnd удаляю  `' + txt + '/' + key + '` ');
				if (wnd.focusTimer) {
					window.clearInterval(wnd.focusTimer)
					wnd.focusTimer = null
				}
				if (wnd.open) {
					if (wnd.nam) {
						const btn = window.document.getElementById(wnd.nam)
						btn.value = 'показать'
						btn.style.color = ''
						btn.style.backgroundColor = ''
					}
					wnd.open = false
					wnd.win.close()
					return wnd.nam
				}
			}
		},
		onmessage = (e) => {
			shp_DelWnd('Закрылось окно', e.data)
		}

	if (!nam || nam == '') {
		if (typeof window.addEventListener != 'undefined')
			window.addEventListener('message', onmessage, false)
		else if (typeof window.attachEvent != 'undefined')
			window.attachEvent('onmessage', onmessage)

		window.addEventListener('beforeunload', function () {
			shp_DelWnd('window -> beforeunload', '')
		})
		// window.document.addEventListener('visibilitychange', function () {
		// 	shp_DelWnd('document -> visibilitychange', '')
		// })
		window.addEventListener('olga5_done', function () {
			shp_DelWnd('window -> olga5_done', '')
		})
		window.addEventListener('pageshow', function () {
			shp_DelWnd('window -> pageshow', '')
		})
	} else {
		const old = shp_DelWnd('родительское окно', '')
		if (old == nam) {
			console.log('test-shp:: shp_WinOpen  `' + nam + '` - только закрыл');
			return
		} else
			console.log('test-shp:: shp_WinOpen  `' + nam + '` - открываю...:');

		const key = 'olga5_test_' + nam,
			win = window.open(nam + '.html', key,
				"left=99999,top=111,width=111,height=111,alwaysRaised=1,alwaysOnTop=1");

		console.log('test-shp:: создано окно `' + nam + '` на ' + window.document.baseURI);

		window.olga5_popup = { // д.б. перед win.focus()..
			nam: nam,
			win: win,
			key: key,
			open: true,
			focusTimer: window.setInterval(function () {
				try {
					const btn = window.document.getElementById(nam),
						is1 = btn.style.color != ''
					btn.value = 'закрыть'
					btn.style.color = is1 ? '' : 'white'
					btn.style.backgroundColor = is1 ? '' : 'darkgray'
				} catch (e) {
					console.log('Прекращено `focusTimer`, причина: ' + e.message);
					window.clearInterval(window.olga5_popup.focusTimer);
				}
			}, 888)
		}
		if (win)
			win.focus()
	}
}
