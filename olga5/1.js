
			for (const nam in defaults)
			if (!xs[nam]) {
			   xs[nam]={val:defaults, type:`default`, orig:nam}

					if (nam1 == nam2) {
						parval = attr.value
						// warns.push({ 'запрошен': nam, 'найден': attr.name, 'тип': 'точно', val: parval })
						// xs.push({ nam: nam, val: parval, source: 'script' })
						warns.push({ nam: nam, val: parval, source: 'script', 'найден': 'точно' })
						break
					} else
						if (typeof def === 'undefined') {  // ищем лишь если дефалт не задан 'конкретно'
							const len2 = nam2.length
							if (
								(len > len2 && nam.indexOf(nam2) >= 0) ||
								(len2 > len && nam2.indexOf(nam1) >= 0)
							) {
								parval = attr.value
								// warns.push({ 'запрошен': nam, 'найден': attr.name, 'тип': 'похож ?', val: parval })
								// xs.push({ nam: nam, val: parval, source: `script(${attr.name})` })
								warns.push({ nam: nam, val: parval, source: `script(${attr.name})`, 'найден': attr.name })
							}
						}


			const warns = [],
				addpars = {},
				attrnam = 'o5' + partype,
				attr = C.GetAttribute(attrs, attrnam),
				// params = typeof attr === 'undefined' ? [] : SplitParams(attr.value, attrnam, ';,')
				IsFloat = nam => {
					const v = C.consts[nam]
					return v == parseFloat(v)
				},
				SetVal = (nam, val) => {
					if (typeof val !== 'undefined' && val !== null) return val
					if (IsFloat(nam)) return 1
					return ''
				}

			// if (typeof attr !== 'undefined') {
			// 	const params = SplitParams(attr.value, attrnam, ';,')
			// 	for (const nam in params)
			// 		if (!C.readys[nam])
			// 			addpars[nam] = SetVal(nam, params[nam])
			// }

			for (const nam in params)
				if (nam)
??					if (C.readys[nam]) {

					}
					else {
						const attr = C.GetAttribute(attrs, nam),
							def = params[nam]
						let parval = attr ? attr.value : ''
						if (!parval) {
							const nam1 = nam.toUpperCase(),
								len = nam.length
							for (const attr of attrs) {
								const nam2 = attr.name.toUpperCase()

								if (nam1 == nam2) {
									parval = attr.value
									// warns.push({ 'запрошен': nam, 'найден': attr.name, 'тип': 'точно', val: parval })
									// xs.push({ nam: nam, val: parval, source: 'script' })
									warns.push({ nam: nam, val: parval, source: 'script', 'найден': 'точно' })
									break
								} else
									if (typeof def === 'undefined') {  // ищем лишь если дефалт не задан 'конкретно'
										const len2 = nam2.length
										if (
											(len > len2 && nam.indexOf(nam2) >= 0) ||
											(len2 > len && nam2.indexOf(nam1) >= 0)
										) {
											parval = attr.value
											// warns.push({ 'запрошен': nam, 'найден': attr.name, 'тип': 'похож ?', val: parval })
											// xs.push({ nam: nam, val: parval, source: `script(${attr.name})` })
											warns.push({ nam: nam, val: parval, source: `script(${attr.name})`, 'найден': attr.name })
										}
									}
							}
						}
						if (!parval) {
							parval = def
							// warns.push({ 'запрошен': nam, 'найден': ' -', 'тип': 'def', val: parval })
							// xs.push({ nam: nam, val: parval, source: 'default' })
							warns.push({ nam: nam, val: parval, source: 'default', 'найден': 'умолчание' })
						}
						addpars[nam] = SetVal(nam, parval)
					}

			if (warns.length > 0) {
				for (const warn of warns) {
					const nam = warn.nam,
						x = xs.find(x => x.nam == nam),
						p = { val: warn.val, source: warn.source }
					if (x) Object.assign(x, p)
					else xs.push(p)
				}
				if (C.consts.o5debug > 1) {
					console.groupCollapsed(`${modul} : для запрошенных '${partype}' найдены:`)
					console.table(warns)
					console.groupEnd()
				}
			}
			// if (warns.length > 0) {
			// 	// else xs.push({ nam: nam, val: c[nam], source: type })

			// 				// CopyVals(a_rep[p], p_scr[p], 'SCRIPT')
			// 	if (C.consts.o5debug > 1) {
			// 		console.groupCollapsed(` ... трассировка вызовов :`)
			// 		console.table(warns)
			// 		console.groupEnd()
			// 	}
			// 	// C.ConsoleInfo(`${modul} : для запрошенных '${partype}' найдены:`, warns.length, warns)
			// }
			return addpars
