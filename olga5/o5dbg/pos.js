/* global document, window */
/*jshint asi:true  */
/*jshint esversion: 6*/
(function () {              // ---------------------------------------------- o5dbg/pos ---
	'use strict'

	let wshp = {},
		mposPos = null, // объект, в котором позиция мыши
		mposAct = null // текущий двигаемый объект (тот же самый)

	const
		olga5_modul = "o5dbg",
		modulname = 'Pos',
		C = window.olga5.C,
		id = "olga5_mousePos",
		m_borderColorOff = 'lightgray',
		m_borderColorOn = 'red',
		m_borderRadius = '3px',
		m_cursor = 'pointer',
		fmt1 = '     ',
		fmt2 = '    ',
		viewport = { wp: null, W: 0, H: 0 },
		LeftPad = function (mask, text) {
			const m = mask.length,
				s = text + '',
				j = s.length
			if (m <= j) return text
			else return mask.substr(0, m - j) + text
		},
		ShowPos = (e) => {
			if (e) {
				mposPos.pre.innerHTML =
					'B=' + LeftPad(fmt1, e.offsetX.toFixed(0)) + ' ' + LeftPad(fmt2, e.offsetY.toFixed(0)) + ' blck<br/>' +
					'P=' + LeftPad(fmt1, e.pageX.toFixed(0)) + ' ' + LeftPad(fmt2, e.pageY.toFixed(0)) + ' page<br/>' +
					'C=' + LeftPad(fmt1, e.clientX.toFixed(0)) + ' ' + LeftPad(fmt2, e.clientY.toFixed(0)) + ' wndw<br/>' +
					'S=' + LeftPad(fmt1, e.screenX.toFixed(0)) + ' ' + LeftPad(fmt2, e.screenY.toFixed(0)) + ' scrn<br/>' +
					'<span style="font-size: xx-small;font-family: serif;position: relative; top: -7px;">' +
					'чтобы перетащить - захват курсором </span>'
				mposPos.x = e.pageX
				mposPos.y = e.pageY
			} else
				mposPos.x = mposPos.y = 0
		},
		StopMoveAct = (e) => {
			if (mposAct) {
				mposAct.div.style.cursor = m_cursor
				mposAct = null
			}
			ShowPos(e)
		},
		SetVP = () => {
			const wp = window.visualViewport,
				W = wp ? wp.width : window.innerWidth,
				H = wp ? wp.height : window.innerHeight
			Object.assign(viewport, { wp, W, H })
		},
		MyMouseMove = (e) => {
			if (mposAct) mposAct.MoveAct(e.pageX, e.pageY)
			ShowPos(e)
		}

	class Mdiv {
		constructor(div) {
			this.div = div;
			div.style = `
				padding-left:0.5px;
				width: 150px;
				height: 80px;
				background-color: antiquewhite;
				position: fixed;
				bottom: 7px;
				right: 2px;
				opacity: 0.9;
				line-height: 18px;
				z-index: 9999999;
				border: 1px solid ${m_borderColorOff};
				border-radius: ${m_borderRadius};
				cursor: ${m_cursor};
				`;
			this.x = 0;
			this.y = 0;
			this.old = { x: 0, y: 0, L: 0, T: 0 };

			div.addEventListener('mousedown', (e) => {
				const mpos = e.currentTarget.aO5mpos;
				mpos.MoveStart(e.pageX, e.pageY);
			});
			div.addEventListener('mouseenter', (e) => {
				e.currentTarget.style.borderColor = m_borderColorOn;
			});
			div.addEventListener('mouseleave', (e) => {
				e.currentTarget.style.borderColor = m_borderColorOff;
			});
			this.MoveStart = (x, y) => {
				const mpos = this; // e.currentTarget.aO5mpos,
				div = mpos.div;
				div.style.cursor = 'grab';
				mpos.old.L = div.offsetLeft;
				mpos.old.T = div.offsetTop;
				mpos.old.x = x;
				mpos.old.y = y;
				mposAct = mpos;
			};
			this.MoveAct = (x, y) => {
				const mpos = this, div = mpos.div, old = mpos.old, dw = 33, dh = 25, w = div.offsetWidth, h = div.offsetHeight;

				let L = old.L + (x - old.x), T = old.T + (y - old.y);

				if (L + w < dw) L = dw - w;
				if (T + h < dh) T = dh - h;
				if (L + dw > viewport.W) L = viewport.W - dw;
				if (T + dh > viewport.H) T = viewport.H - dh;
				div.style.left = L + 'px';
				div.style.top = T + 'px';
			};
		}
	}

	class Mpos {
		constructor(div) {
			Object.setPrototypeOf(this, Object.assign({}, new Mdiv(div)));
			this.pre = document.createElement('pre');
			this.pre.style = `
				font-family: monospace;
				font-size: 14px;
				display: block;
				white-space: pre;
				margin: 1px;
				margin-left: 3px;
				`;
			div.appendChild(this.pre);
			div.id = "olga5_mousePos";
		}
	}

	wshp = C.ModulAddSub(olga5_modul, modulname, () => {
		const isInitiated = document.getElementById(id)
		console.log(`${olga5_modul}.${modulname} : ` + (isInitiated ? 'игнорируется' : ''))
		if (isInitiated) return

		const div = document.createElement('div')

		document.body.appendChild(div)

		div.aO5mpos = new Mpos(div)
		mposPos = div.aO5mpos

		window.addEventListener('resize', SetVP)
		document.addEventListener('mouselive', StopMoveAct)
		document.addEventListener('mouseup', StopMoveAct)
		document.addEventListener('mousemove', MyMouseMove)
		
		SetVP()
		ShowPos()
	})
})();
