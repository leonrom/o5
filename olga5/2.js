
dlmtH = d[0] ? d[0] : '§',
dlmtL = d[1] ? d[1] : '¶',
cellD = d[2] ? d[2] : '▸',
cellC = d[3] ? d[3] : '▹',
aligL = d[4] ? d[4] : '↢',
aligC = d[5] ? d[5] : '⇔',
aligR = d[6] ? d[6] : '↣',
schwa = d[7] ? d[7] : 'ₔ',
aligV = d[7] ? d[8] : '☝',
cellD2 = '▶',
mLine = new RegExp('\\s*[\\n' + dlmtL + ']\\s*', 'gm'),
sCell = cellC + cellD + cellD2,
mRepl = new RegExp('\\s*(' + cellC + '|' + cellD + '|' + cellD2 + ')\\s*', 'g'),
mCell = new RegExp('[^' + sCell + ']*(' + cellC + '|' + cellD + '|' + cellD2 + '|$)', 'g'),
mCele = new RegExp('[' + sCell + ']$'),
mAlig = new RegExp('\\s*[' + aligL + aligC + aligR + dlmtH + dlmtL + aligL + aligC + aligR + ']\\s*', 'g'),
mschwa = new RegExp(schwa + '.{1}', 'g'),
Schwa = s => '<sup>' + s.substring(1) + '</sup>'



for (const tag of tags) {
	const ss = tag.innerText.split(mLine),
		isort = parseInt(tag.getAttribute(sel)),
		rows = [],
		nums = []
	let len = 0
	for (const s of ss) {
		if (!s || s.match(/^\s*#/)) continue

		const cells = s.match(mCell),
			sort = isort > 0 ? cells[isort] : '0',
			v = sort.replace(mRepl, ''),
			isH = cells[0] && cells[0][0] == dlmtH

		if (v.length > len) len = v.length

		rows.push(cells)
		nums.push({ i: nums.length, v: v, isH: isH })
	}
	for (const num of nums)
		num.v = num.v.padStart(len)

	nums.sort((r1, r2) => {					
		return (r1.isH && r2.isH ? 0 : (r1.isH ? -1 : (r2.isH ? 1 : r1.v.localeCompare(r2.v))))
	})

	for (const num of nums) {
		const cells = rows[num.i]
	}

	const table = document.createE
	lement('table')

	for (const attr of tag.attributes)
		if (attr.name != sel)
			table.setAttribute(attr.name, attr.value)

	table.innerHTML = rows
	table.style.opacity = 1
	// table.tBodies[0].style.verticalAlign='bottom';

	tag.parentNode.insertBefore(table, tag)
	tag.parentNode.removeChild(tag)
}