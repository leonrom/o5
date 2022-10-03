const
			// const s2 = s0.split(/\/?\.\./g),
			// 	is2 = s2.length > 0
			// let rez = ''
			// if (is2)
			// 	for (const u of s2) {
			// 		const i = rez.lastIndexOf('/')
			// 		if (rez) rez = rez.substr(0, i) + ((u && u[0] != '/') ? ('/' + u) : u)
			// 		else rez = u
			// 	}

			// const s1 = (is2 ? rez : s0).split(/\.\/?/g)
			// rez = ''
			// if (s1.length > 0) {
			// 	for (const u of s1)
			// 		s = ((s && s[s.length - 1] != '/') ? (s + '/') : s) + u
			// }
			// return rez
DelBacks1 = (s0) => {
	const s2s = s0.split(/\/?\.\./g)
	let s = ''
	if (s2s.length > 1)
		for (const s2 of s2s)
			if (s) s = s.substr(0,s.lastIndexOf('/')) + ((s2 && s2[0] != '/') ? ('/' + s2) : s2)
			else s = s2

	const s1s = ((s2s.length > 0) ? s : s0).split(/\.\//g)
	if (s1s.length > 1){
		s = ''
		for (const s1 of s1s)
			s = ((s && s[s.length - 1] != '/') ? (s + '/') : s) + s1
	}
	return s
},
	DelBacks2 = (s0) => {
		let mrk = '..',
			L = mrk.length - 1,
			s = s0,
			i = s.indexOf(mrk)
		while (i > 0) {
			const sR = s.substr(i + L),
				s2 = s.substr(0, i - 1),
				i1 = s2.lastIndexOf('/')
			if (i1 >= 0) {
				s = s2.substr(0, i1) + sR
				i = s.indexOf(mrk)
			}
			else {
				console.error(`Ошибка удаления '../' в строке ${s0}`)
				i = -1
			}
		}
		mrk = './'
		i = s.indexOf(mrk)
		while (i > 0) {
			s = s.substr(0, i) + s.substr(i + mrk.length)
			i = s.indexOf(mrk)
		}
		return s
	}
const 
	TestDelBacks = () => {
		let u = ''
		u = '/../'; console.log('-  ', u, '  =>  ', DelBacks(u))
		u = '../'; console.log('-  ', u, '  =>  ', DelBacks(u))
		u = 'bbb/../'; console.log('-  ', u, '  =>  ', DelBacks(u))
		u = '/bbb/../'; console.log('+  ', u, '  =>  ', DelBacks(u))
		u = 'bbb/..'; console.log('-  ', u, '  =>  ', DelBacks(u))
		u = '/bbb/..'; console.log('+  ', u, '  =>  ', DelBacks(u))
		u = 'bbb....'; console.log('-  ', u, '  =>  ', DelBacks(u))
		u = '/bbb....'; console.log('+  ', u, '  =>  ', DelBacks(u))
		u = 'aaa/bbb/../'; console.log('+  ', u, '  =>  ', DelBacks(u))
		u = 'xxx./yyy/aaa/bbb/../ccc'; console.log('+  ', u, '  =>  ', DelBacks(u))
		u = 'xxx/./yyy/aaa/bbb/../../ccc'; console.log('+  ', u, '  =>  ', DelBacks(u))
		u = 'xxx./yyy./aaa/bbb/..ccc'; console.log('+  ', u, '  =>  ', DelBacks(u))
		u = 'xxx/./yyy/./aaa/bbb/....ccc'; console.log('+  ', u, '  =>  ', DelBacks(u))
		u = 'xxx/yyy/aaa/bbb..ccc'; console.log('+  ', u, '  =>  ', DelBacks(u))
		u = 'xxx/yyy/aaa/bbb..../ccc'; console.log('+  ', u, '  =>  ', DelBacks(u))
		u = 'xxx/yyy/aaa/bbb/../ddd../ccc'; console.log('+  ', u, '  =>  ', DelBacks(u))
		u = 'xxx/yyy/aaa/bbb/../ddd/../ccc'; console.log('+  ', u, '  =>  ', DelBacks(u))
	}

TestDelBacks()