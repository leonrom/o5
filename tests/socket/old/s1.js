/* global document, window, console*/
/* exported olga5_menuPopDn_Click*/
/*jshint asi:true  */
/*jshint esversion: 6*/
(function () { // ====================================================================================================
	'use strict'
	let isCheckUrl = false
	const CheckUrl = function (url) {
		const img = document.createElement('img'),
			Done = (img) => {
				if (img.parentNode){
					img.parentNode.removeChild(img)
					console.log('удалил img=' + img.src)
				}else {
					console.error('не удалил ' + img.src)
				}
			},
			OnLoad = (e, img) => {
				console.log('OK ' + e.message + ':  ' + img.src);
				Done(img)
			},
			OnError = (e, img) => {
				console.error('ошибочка: ' + e.message + ':  ' + img.src);
				Done(img)
			}

		img.src = url //+ '/xxx.jpeg'
		img.style.dicplay = 'none'
		img.onerror = function (e) { OnError(e, img) }
		if (img.readyState) img.onreadystatechange = function (e) { OnLoad(e, url) }
		else img.onload = function (e) { OnLoad(e, img) }

		try {
			document.body.appendChild(img)
		} catch (err) {
			console.error('ошибка создания тега &lt;img&gt;');
		}
	},
	DbgCheckUrls=()=>{
		if (isCheckUrl) return
		isCheckUrl = true
		CheckUrl('http://second/play1.png')
		CheckUrl('https://second/play2.png')
		CheckUrl('https://rombase.h1n.ru/o5/2020/media/image/play.png')
		CheckUrl('https://rombase.h1n.ru/o5/2020/media/image/playX.png')
	}

	for (const eve of ['message', 'DOMContentLoaded']) {
		window.addEventListener(eve, DbgCheckUrls)
	}
})();
