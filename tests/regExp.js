
		TagsByClassName = (start, cls) => {
			// const smatch = /\bolga5_snd(\s*:\s*(([`'"])(.*?)\3|[^`'":\s]*))*/,
			const smatch = new RegExp(`\\b` + cls +  `(\\s*:\\s*(([\`'"])(.*?)\\3|[^\`'":\\s]*))*`, 'i'),
			// const smatch = new RegExp(`\\b` + cls + `(\\s*:\\s*(([\`'"])(.*?)\\3|[^\`'":\\s]))*`, 'i'),
			// const smatch = new RegExp(`\\b` + cls + `(\\s*:\\s*(([\`'"])(.*?)\\3|\\w+))*`, 'ig'),
				sels = start.querySelectorAll("[class *= '" + cls + "']"),
				tags = []
				/*тесты:  	\b(olga5_snd\s*)(((:\s*([`'"])(.*?)\5)|(:\s*\S+))\s*)*
							\bolga5_snd(\s*:\s*(([`'"])(.*?)\3|\S+))*    тут (в JS) это '\S+' сбивается на символе '+', а '\w' - на рус. буквах
							\bolga5_snd(\s*:\s*(([`'"])(.*?)\3|[^`'":\s]*))*
aaa olga5_snd: Loop :A :'sounds + /gitme.mp3' bbb:O
aaa olga5_snd: A :' sounds + /gitme.mp3': L bbb:O
aaa olga5_snd: ' sounds + /gitme.mp3': L bbb:O
aaa olga5_snd bbb:0
 olga5_snd 

					тесты:	:\s*(([`'"])(.*?)\2|[^`'"\s])
							:\s*(([`'"])(.*?)\2|[^`'":]*)
olga5_snd: L :A:'ёй-sounds_2 + /gitme.mp3'
olga5_snd: L юю :Aяя :  '  ёй-sounds_2 + /gitme.mp3   '					
				*/

			for (const tag of sels) {
				const ms = tag.className.match(smatch)
				if (ms) {
					const m = ms[0]
					// ВСЕГДА убираю квалификаторы из наименований класса
					tag.className = tag.className.replace(m, cls)	// первый класс подменяю
					for (let i = 1; i < ms.length; i++) 			// а остальные - удаляю!
						tag.className = tag.className.replace(ms[i], '')

					const ss = m.match(/:\s*(([`'"])(.*?)\2|[^`'":]*)/gm),
						quals = []
					if (ss)
						for (const s of ss)
							quals.push(s.replace(/^\s*:\s*|\s*$/g, '')) // кавычки пока оставляю

					console.log(`TagsByClassName: id='${tag.id}',  '${m}', ms=${ms}`)
					tags.push({ tag: tag, quals: quals, origcls: m.trim() })
				}
			}
			return tags
		}