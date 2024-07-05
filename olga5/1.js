
// const c = mm[i] ? mm[i][mm[i].length - 1] : ''
// if (sCell.indexOf(c) >= 0 || mm[i]) {



let rows = ''
for (const s of ss) {
	if (!s || s[0] == '#') continue

	const mm = s.match(mCell)

	let row = '',
		txt = '',
		cspan = 0,
		ralign = ''

	for (let i = 0; i < mm.length; i++)
		if (mm[i]) {
			const m = mm[i],
				len = m.length - 1,
				e = m.charAt(len),
				// k = m.charCodeAt(len),

				u = (m.match(mCele) ? m.substring(0, len).trim() : m).replace(mschwa, Schwa)
			/*
			ₔ(.{1})
			 Kₔahr-  ▸ₔam-   ▸an,   ▸const c = mm[i] ? mm[i][mm[i].length - 1] : ''
// if (sCell.indexOf(c) >= 0 || mm[i]) {

ır-   ▸kₔı-  ▸ma     ▸bₔir   ▸gül…
			https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace
			*/

			if (u == aligL) ralign = 'left'
			else if (u == aligC) ralign = 'center'
			else if (u == aligR) ralign = 'right'
			else {
				txt += u  // в объединённой ячейке объединяем отдельные слова. Чтобы раздельно - через &nbsp;						
				cspan++

				if (e != cellC) {
					row += '<td'
					if (e == cellD2) row += ' class="cellD2"'  // специфический класс - для НЕ-индикации поцзиционированиякурсора
					if (cspan > 1) row += ` colspan=${cspan}`

					const mA = u.match(mAlig)
					if (mA) {
						const align = (mA[0] == aligL ? 'left' : (mA[0] == aligC ? 'center' : 'right'))

						row += ` style="text-align:${align};"`
						txt = txt.replace(mAlig, '') //все вычистил, сработал лишь первый
					}

					row += '>' + txt + '</td>'
					txt = ''
					cspan = 0
				}
			}
		}
	if (ralign) ralign = ' style= "text-align: ' + ralign + ';"'
	rows += '<tr' + ralign + '>' + row + '</tr>\n'
}