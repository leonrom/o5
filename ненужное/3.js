
for (const tag of tags) {
	const ss = tag.innerText.split(mLine)
	let rows = ''
	for (const s of ss) {
		if (!s || s.match(/^\s*#/)) continue

		const cells = s.match(mCell),
			td = cells[0] && cells[0].match(mHlmt) ? 'th' : 'td'

		let row = '',
			txt = '',
			cspan = 0

		for (const cell of cells) {

			const mCs = cell.match(mRepl),
				mC = mCs && mCs.length > 0 ? mCs[0].trim() : null,
				u = cell.replace(mRepl, '')  // в объединённой ячейке объединяем отдельные слова. Чтобы раздельно - через &nbsp;						
			// if (u.indexOf('знамя')>=0)
			// console.log()
			if (!mC && !u) continue

			txt += u

			const len = mC ? mC.length - 1 : 0
			if (mC && mC[len] == cellC) cspan++
			else {
				row += '<' + td
				if (len > 0)
					row += ' class="cellD_' + parseInt(mC.substring(0, len)) + '"'  // специфический класс - для НЕ-индикации поцзиционированиякурсора

				if (cspan) row += ` colspan=${cspan + 1}`

				const mA = txt.match(mAlig)
				if (mA) {
					const align = (mA[0] == aligL ? 'left' : (mA[0] == aligC ? 'center' : 'right'))
					row += ` style="text-align:${align};"`
					txt = txt.replace(mAlig, '') //все вычистил, сработал лишь первый
				}

				row += '>' + txt.replace(mschwa, Schwa) + '</' + td + '>'
				txt = ''
				cspan = 0
			}

		}
		rows += '<tr>' + row + '</tr>\n'
	}
	const table = document.createElement('table')

	for (const attr of tag.attributes)
		if (attr.name != sel)
			table.setAttribute(attr.name, attr.value)

	table.innerHTML = rows
	table.style.opacity = 1
	// table.tBodies[0].style.verticalAlign='bottom';

	tag.parentNode.insertBefore(table, tag)
	tag.parentNode.removeChild(tag)
}