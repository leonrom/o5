/* -global document, window*/
/* exported olga5_menuPopDn_Click*/
/*jshint asi:true  */
/*jshint esversion: 6*/
(function () {              // ---------------------------------------------- o5com/CEncode ---
	'use strict'
	const olga5_modul = 'o5com',
		modulname = 'CEncode',
		C = window.olga5.C,
		DelBacks = (s0) => {
			// const s00 = s0
			let n = 0
			const mrkN = '\n',
				mrk2 = '..'
			do {
				let l = s0.length,
					m = s0.match(/\.\.[^\/]/)
				if (m) s0 = s0.substr(0, m.index + 2) + '/' + s0.substr(m.index + 2)
				m = s0.match(/[^\/]\.\./)
				if (m) s0 = s0.substr(0, m.index + 1) + '/' + s0.substr(m.index + 1)
				if (l == s0.length) break
			} while (n++ < 99)

			const s2s = s0.split('/')
				// tt = []
			for (let i = 0; i < s2s.length; i++)
				if (s2s[i] == mrk2) {
					let j = i
					while (j-- > 0)
						if (s2s[j] != mrkN && s2s[j] != mrk2 && s2s[j] != '') {
							s2s[j] = mrkN
							s2s[i] = ''
							break
						}
				}

			let i = s2s.length
			while (i-- > 0)
				if (s2s[i] == mrkN || (i > 0 && s2s[i] == '' && s2s[i - 1] == ''))
					s2s.splice(i, 1)

			let s = s2s.join('/').replaceAll(/\/\.\//g, '/')
			return s.replaceAll(/[^:]\/\/+/g, (u) => { return u.substr(0, 2) })
		},
		// IsUrlNam = u => { return !!(u.trim() && !u.match(/[\/.\\#]/)) },
		IsUrlNam = u => {
			const isurl = !!(u && u.trim() && !u.match(/[\/.\\#]/))
			return isurl
		},
		IsFullUrl = url => {
			return url.match(/^https?:/i) ||
				url.match(/^\s*\/*\s*(((\d{1,3}\.){3}\d{1,3})|localhost)\//i)
		},
		DeCodeUrl = function (urlrfs, url, o5attrs = null) { // старое DeCodeUrl
			if (url.match(/^\s*data:/)) {
				return { url: url.trim(), err: '', num: 0 }
			}
			// if (url.match('myTunes-icon'))					
			// 	console.log(121212)				
			const errs = [],
				parts = [],
				Replace4320 = u =>
					u.replaceAll(/(&#43;)/g, '+').replaceAll(/(%20|&nbsp;)/g, ' ').trim(), // давать в такой очерёдностии, иначе снова вернёт %20 !,
				IsCompaund = orig => orig && (orig.includes('+') || IsUrlNam(orig)),
				SplitRefs = (s, refs = null) => {
					s.split('+').forEach(sprt => {
						const prt = sprt.replace(C.repQuotes, ''),	// trim(),
							isnam = IsUrlNam(prt),
							ref = isnam ? C.Repname(prt) : prt

						if (isnam) parts.num++
						if (refs && refs.find(r => ref == r))
							errs.push(`цикл. ссылки ${refs.join('->')}=>${ref};`)
						else {
							const attr = (isnam && o5attrs) ? C.GetAttribute(o5attrs, ref) : null

							if (attr) {
								if (!refs) refs = []
								refs.push(ref)
								SplitRefs(attr, refs)
							}
							else if (isnam) {
								if (urlrfs[ref]) SplitRefs(urlrfs[ref], refs)
								else
									errs.push(`неопр.: '${prt}` + (prt != ref ? ` (т.е. '${ref})` : ''))
							}
							else
								parts.push(ref)
						}
					})
				},
				ss = url.split('?'),
				orig = Replace4320(ss[0].trim()),
				ret = { url: url, err: '', num: 0 }

			if (IsCompaund(orig)) {
				Object.assign(parts, { num: 0, rght: ss[1] ? ('?' + ss[1]) : '' })

				SplitRefs(orig)

				let urld = ''
				for (const part of parts)
					if (urld && part && urld[urld.length - 1] != '/' && part[0] != '/') urld = urld + '/' + part
					else urld = ((urld ? urld : '') + (part ? part : ''))
				// console.log(orig, urld)
				if (urld) {
					if (!IsFullUrl(urld)) {
						if (parts[0] == '') urld = C.urlrfs._url_olga5 + urld
						else urld = C.urlrfs._url_html + urld
						if (!IsFullUrl(urld)) {  // если всё еще нету
							const hr = new window.URL(window.location).href
							urld = hr.substring(0, hr.lastIndexOf('/') + 1) + urld
						}
					}
					urld = DelBacks(urld) + parts.rght
				}
				Object.assign(ret, {
					url: urld,
					err: errs.length > 0 ? errs.join(', ') : (urld ? '' : `пустой 'url'`),
					num: parts.num
				})
			}
			return ret
		},
		TagDes = (tag, ref, errs = null) => {
			const
				regExp1 = /(.*(\/|\+)\s*)|(!*\.js\s*$)/g,
				regExp2 = /(\s*\+\s*)+/g
			for (const code of ['data-', '_', '']) {
				const from = code + ref,
					attr = tag.attributes[from]
				if (attr) {
					const orig = attr.nodeValue

					return {
						code: code,
						from: from,
						modul: orig.replace(regExp1, ''),
						orig: orig,
						trans: !!(orig.match(regExp2) || IsUrlNam(orig)),
					}
				}
			}
			if (errs)
				errs.push({ tag: C.MakeObjName(tag), ref: ref, txt: 'не определены атрибуты' })
		}

	C.ModulAddSub(olga5_modul, modulname, () => {
		Object.assign(C, {
			DelBacks: DelBacks,
			IsFullUrl: IsFullUrl,
			DeCodeUrl: DeCodeUrl,
			TagDes: TagDes,
		})
		return true
	}
	)
})();
