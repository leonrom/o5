/* global document, window, console*/
/* exported olga5_menuPopDn_Click*/
/*jshint asi:true  */
/*jshint esversion: 6*/
(function () { // ====================================================================================================
	'use strict'
	const CheckUrl = function (url) {

		const adr = url.replace(/^https?:\/\//, 'wss://')
		let socket = null

				let aa=new Promise(function(resolve, reject) {
				    var ws = new WebSocket(adr);
				    ws.onerror = function(e) {
				       reject("couldn't connect " + this.url)
				    }
				}).catch(function(err) {
				    // console.log("Catch handler sees: ", err)
				});

		// const adr = url.replace(/^http(?=s?:\/)/, 'ws')
		try {
			console.log("url=" + url);
			socket = new WebSocket(adr)
		} catch (e) {
			console.log("? socket " + e.message);
		}
		if (socket) {
			socket.onopen = function () {
				console.log("Соединение установлено.");
			};

			socket.onclose = (e)=> {
				// if (e.wasClean) {
				// 	console.log('Соединение закрыто чисто ' + e.currentTarget.url);
				// } else {
				// 	console.log('Обрыв соединения ' + e.currentTarget.url); // например, "убит" процесс сервера
				// }
				console.log('Код: ' + e.code + ' причина: ' + e.reason + ' ' + e.currentTarget.url);
			};

			socket.onmessage = function (e) {
				console.log("Получены данные " + e.data + ' ' + e.currentTarget.url);
			};

			socket.onerror = function (e) {
				console.log("Ошибка " + e.currentTarget.readyState + ' ' + e.currentTarget.url);
			};
		}
		// try {
		// 	socket.send("Привет");
		// } catch (err) {
		// 	console.log("catch " + err.message);
		// 	return -1
		// }
	}

	CheckUrl('http://second/fil.js')
	CheckUrl('https://rombase.h1n.ru/o5/olga5/o5common.js')
	CheckUrl('https://olga-5.blogspot.com/2020/02')
	CheckUrl('https://www.websocket.org/echo.html')
})();
