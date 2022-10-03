
	// function TestDelBacks() {
	// 	let u = ''
	// 	u = 'http://localhost/o5/olga5-tests/../blog/media/image/play.png'; console.log('-  ', u, '  =>  ', DelBacks(u))
	// 	u = '/../'; console.log('-  ', u, '  =>  ', DelBacks(u))
	// 	u = '../'; console.log('-  ', u, '  =>  ', DelBacks(u))
	// 	u = 'bbb/../'; console.log('-  ', u, '  =>  ', DelBacks(u))
	// 	u = '/bbb/../'; console.log('+  ', u, '  =>  ', DelBacks(u))
	// 	u = 'bbb/..'; console.log('-  ', u, '  =>  ', DelBacks(u))
	// 	u = '/bbb/..'; console.log('+  ', u, '  =>  ', DelBacks(u))
	// 	u = 'bbb....'; console.log('-  ', u, '  =>  ', DelBacks(u))
	// 	u = '/bbb....'; console.log('+  ', u, '  =>  ', DelBacks(u))
	// 	u = 'aaa/bbb/../'; console.log('+  ', u, '  =>  ', DelBacks(u))
	// 	u = 'xxx./yyy/aaa/bbb/../ccc'; console.log('+  ', u, '  =>  ', DelBacks(u))
	// 	u = 'xxx/./yyy/aaa/bbb/../../ccc'; console.log('+  ', u, '  =>  ', DelBacks(u))
	// 	u = '../../xxx./yyy/aaa/bbb/../ccc'; console.log('+  ', u, '  =>  ', DelBacks(u))
	// 	u = '../xxx/./yyy/aaa/bbb/../../ccc'; console.log('+  ', u, '  =>  ', DelBacks(u))
	// 	u = 'xxx./yyy./aaa/bbb/..ccc'; console.log('+  ', u, '  =>  ', DelBacks(u))
	// 	u = 'xxx/./yyy/./aaa/bbb/....ccc'; console.log('+  ', u, '  =>  ', DelBacks(u))
	// 	u = 'http://xxx.//yyy./aaa/bbb/..ccc'; console.log('+  ', u, '  =>  ', DelBacks(u))
	// 	u = '//xxx/./yyy/./aaa/bbb/....ccc'; console.log('+  ', u, '  =>  ', DelBacks(u))
	// 	u = 'xxx/yyy/aaa/bbb..ccc'; console.log('+  ', u, '  =>  ', DelBacks(u))
	// 	u = 'xxx/yyy/aaa/bbb..../ccc'; console.log('+  ', u, '  =>  ', DelBacks(u))
	// 	u = 'xxx/yyy/aaa/bbb/../ddd../ccc'; console.log('+  ', u, '  =>  ', DelBacks(u))
	// 	u = 'xxx/yyy/aaa/bbb/../ddd/../ccc'; console.log('+  ', u, '  =>  ', DelBacks(u))
	// }
	// TestDelBacks()


		// let isFirst = true,
	// 	upars = {},
	// 	GetParamVal = (nam) => {
	// 		const nams = nam.split('_'),
	// 			pardExp = new RegExp('(\\&|\\?|\\s)' + nams[0] + '(-|_)' + nams[1] + '\\s*(\\s|$|\\?|#|&|=\\s*\\d*)', 'ig'),
	// 			pard = window.location.search.match(pardExp)
	// 		return pard ? (pard[0].match(/=/) ? parseInt(pard[0].match(/\s*\d+/) || 1) : 1) : -1
	// 	},
	// 	cmd_debug = GetParamVal('o5debug')
	// -------------------------