/* global document, window, console  */
/* exported olga5_menuPopDn_Click    */
/* jshint asi:true                   */
/* jshint esversion: 6               */
(function () { // ---------------------------------------------- o5pop ---
    let focusTime = 0

    const // phases = ['NONE', 'CAPTURING_PHASE', 'AT_TARGET', 'BUBBLING_PHASE'],                
        pard = window.location.search.match(/(\&|\?|\s)(is|o5)?(-|_)?debug\s*(\s|$|\?|#|&|=\s*\d*)/),
        o5debug = (pard ? (pard[0].match(/=/) ? parseInt(pard[0].match(/\s*\d+/) || 1) : 1) : 2),
        eclr = 'background: yellow; color: black;',
        clrs = { //	копия из CConsole
            'E': `${eclr}border: solid 1px gold;`,
        },
        thisClass = 'olga5_popup',
        cls_Act = thisClass + '-Act',
        cls_errArg = thisClass + '-errArg',
        namo5css = thisClass + '_internal',
        dflts = { // тут все названия дб. в нижнем ренистре !!!
            moes: { text: '', group: '', head: '', },
            sizs: { width: 588, height: 345, left: -22, top: 11, innerwidth: null, innerheight: null, screenx: null, screeny: null, },
            wins: { alwaysraised: 1, alwaysontop: 1, menubar: 0, toolbar: 0, status: 0, resizable: 1, scrollbars: 0, },
        },
        C = window.olga5 ? window.olga5.C : { // заменитель библиотечного
            consts: {
                o5debug: o5debug
            },
            repQuotes: /^\s*((\\')|(\\")|(\\`)|'|"|`)?\s*|\s*((\\')|(\\")|(\\`)|'|"|`)?\s*$/g,
            ConsoleError: (msg, name, errs) => {
                const txt = msg + (name ? ' ' + name + ' ' : '')
                console.groupCollapsed('%c%s', clrs.E, txt)
                if (errs && errs.length > 0) console.table(errs)
                else console.error(txt)
                console.trace("трассировка вызовов :")
                console.groupEnd()
            },
            MakeObjName: obj => (obj ? (
                (obj.id && obj.id.length > 0) ? ('#' + obj.id) : (
                    ('[' + obj.tagName ? obj.tagName : (obj.nodeName ? obj.nodeName : '?') + ']') +
                    '.' + (obj.className ? obj.className : '?'))) : 'НЕОПР?'),
            GetTagsByQueryes: query => document.querySelectorAll(query), // второй аргумент - игнорится
            avtonom: true,
        },
        SetTagError = (tag, txt, errs) => { // добавление и протоколирование НОВЫХ ошибок для тегов
            const
                isnew = tag.title.indexOf(txt) < 0,
                first = tag.title == tag.aO5pop.title // .trim().indexOf('?') != 0

            if (first) tag.title = tag.aO5pop.title + ' ?-> ' + txt
            else if (isnew) tag.title = tag.title + '; ' + txt

            if (isnew) C.ConsoleError(`${txt} для тега : `, C.MakeObjName(tag), errs)
            if (!tag.classList.contains(cls_errArg))
                tag.classList.add(cls_errArg)
        },
        RemoveTagErrors = tag => { // добавление и протоколирование НОВЫХ ошибок для тегов            
            if (tag.classList.contains(cls_errArg)) {
                tag.title = tag.aO5pop.title
                tag.classList.remove(cls_errArg)
            }
        },
        AddPars = (pars, dests, errs, force) => {
            for (const _par in pars) {
                const par = _par.toLowerCase()
                let isp = false
                for (const nam in dflts) { // ['moes', 'sizs', 'wins']
                    const dflt = dflts[nam],
                        dest = dests[nam]
                    if (dflt.hasOwnProperty(par)) {
                        if (force || !dest.hasOwnProperty(par))
                            dest[par] = pars[_par]
                        isp = true
                        break
                    }
                }
                if (!isp)
                    errs.push(`неопределённый параметр '${par}' `)
            }
        },
        CopyPars = (pars, dests, errs, force) => {
            for (const nam in dflts) { // ['moes', 'sizs', 'wins']
                const srcs = pars[nam],
                    dest = dests[nam]
                for (const _par in srcs) { // например 'sizs'
                    const par = _par.toLowerCase()
                    if (force || !dest.hasOwnProperty(par))
                        dest[par] = srcs[_par]
                }
            }
        },
        dlmattr = /[\s'"`]*[,;][\s'"`]*/,
        dlmpar = /[\s'"`]*[:=][\s'"`]*/,
        SplitPars = (spar, pars, refs, errs, tagname) => {
            const ss = spar.split(dlmattr)
            for (const s of ss)
                if (s.trim()) {
                    const uu = s.split(dlmpar),
                        u0 = uu[0].replace(C.repQuotes, '')

                    if (uu.length == 1) refs[u0] = null
                    else {
                        const u1 = uu[1].replace(C.repQuotes, '')
                        let nam = u0.toLowerCase()
                        if (nam == 'id') refs[u1] = null
                        else {
                            if (nam.length == 1) {
                                if (nam == 'g') nam = 'group'
                                if (nam == 'n') nam = 'nocss'
                                else if (nam == 'w') nam = 'width'
                                else if (nam == 'h') nam = 'height'
                                else if (nam == 't') nam = 'top'
                                else if (nam == 'l') nam = 'left'
                            }
                            if (!pars.hasOwnProperty(nam))
                                pars[nam] = u1
                            else
                                errs.push(`для  '${tagname}' повтор параметра '${u0}' (без учета регистра и сокращения)`)
                        }
                    }
                }
                else if (ss.length > 0)
                    errs.push(`для  '${tagname}' отсутствие параметра в массиве параметров`)

            if (errs.length > 0)
                C.ConsoleError(`для  '${tagname}' ошибки при разборе строки аргументов`, spar, errs)
        }

    function GetPops(e, args) {
        'use strict'
        const tag = e.currentTarget,
            eve = e.type,
            CalcTagPars = (eve, tag, args, errs) => {
                if (!tag.aO5pop) {
                    tag.aO5pop = Object.assign({}, {
                        name: C.MakeObjName(tag),
                        title: tag.title,
                        tag: tag,
                        apops: {}
                    })
                    Object.freeze(tag.aO5pop)
                }

                const ap = tag.getAttribute(o5popup),
                    pops = tag.aO5pop.apops[eve] = {
                        tag: tag,
                        eve: eve, //для обратного поиска
                        url: '',
                        act: tag,
                        spar: '', // это просто для истории
                        key: tag.aO5pop.name + '(' + eve + ')' + e.timeStamp, // наименование окна
                        wins: {},
                        moes: {},
                        sizs: {},
                        swins: null,
                        smoes: null, // будут доопределены позже
                    }

                if (eve == click && ap) { // при клике 'o5popup' приоритетнее
                    const mm = ap.match(/\s*[;,]\s*/),
                        i = mm ? mm.index : 9999
                    // ss = ap.split(/\s*;\s*/)
                    pops.spar = ap.substring(i + 1)
                    if (tag.a5pop) {
                        const mtag = tag.a5pop.mtag,
                            popup = mtag.tag.attributes.o5popup
                        let url = ''
                        if (popup) {
                            const pars = mtag.tag.attributes.o5popup.nodeValue.split(/[;,]/)
                            url = pars[0].trim()
                            // if (!mtag.match())
                            pops.spar += ',' + mtag.id
                        }
                        pops.url = url ? url : mtag.tag.getAttribute('href')
                    }
                    else
                        pops.url = ap.substring(0, i).trim()
                } else {
                    const l = args.length,
                        nam = l > 0 ? args[0] : '' // имя объекта, на котором д.б. мигание,
                    pops.url = (l > 1) ? args[1] : ''
                    pops.spar = (l > 2) ? args[2] : ''
                    if (nam) {
                        const istr = typeof nam === 'string',
                            act = istr ? document.getElementById(nam) : nam

                        if (act) pops.act = act
                        else
                            errs.push(`для  '${tag.aO5pop.name}' не найден тег мигания '${istr ? nam : C.MakeObjName(nam)}'`)
                    }
                }

                if (C.DeCodeUrl) {
                    const o5attrs = tag ? C.GetAttrs(tag.attributes) : '',
                        ori = (pops.url || '').replace(C.repQuotes, ''),
                        url = (ori.trim() && !ori.match(/[\/.\\#]/)) ? (document.URL + '?o5nomnu#' + ori) : ori,
                        wref = C.DeCodeUrl(W.urlrfs, url, o5attrs)

                    if (wref.err)
                        errs.push(`Ошибка перекодирования url='${pops.url}':  ${wref.err}`)
                    pops.url = wref.url
                }

                Object.seal(pops)

                if (pops.spar) {
                    const refs = {},
                        pars = {}

                    SplitPars(pops.spar, pars, refs, errs, tag.aO5pop.name)
                    AddPars(pars, pops, errs, false)

                    for (const ref in refs) {
                        let itag = refs[ref]
                        if (!itag) {
                            if (itag !== '') {
                                itag = document.getElementById(ref)
                                if (itag) refs[ref] = itag
                                else {
                                    refs[ref] = '' // чтл бы больше не пытать
                                    errs.push(`для  '${tag.aO5pop.name}' в '${eve}' не найден ссылочный тег с id='${ref}'`)
                                }
                            }
                            if (!itag) continue
                        }
                        let iargs = null,
                            ieve = click
                        const iap = itag.getAttribute(o5popup)
                        if (iap) {
                            const ss = ap ? iap.split(/\s*;\s*/) : ['']
                            iargs = [''].concat(ss)
                        } else
                            for (const iattr of itag.attributes)
                                if (iattr.value.match(/\.*PopUp\s*\(/)) {
                                    iargs = iattr.value.match(/(['"])(.*?)\1/g) // внутри парных кавычек

                                    for (let i = 0; i < iargs.length; i++)
                                        iargs[i] = iargs[i].replace(C.repQuotes, '')
                                    ieve = iattr.name.replace('on', '').toLocaleLowerCase()
                                    break
                                }
                        if (iargs) {
                            CalcTagPars(ieve, itag, iargs, errs)
                            CopyPars(itag.aO5pop.apops[ieve], pops, errs, false)
                        } else {
                            errs.push(`для  '${tag.aO5pop.name}' в '${eve}' у тега с id='${ref}' отсутствует атрибут '${o5popup}'`)
                            refs[ref] = '' // чтл бы больше не пытать
                        }
                    }
                }
                return pops
            }

        let pops = null
        const errs = []

        if (tag.aO5pop && tag.aO5pop.apops && tag.aO5pop.apops[eve]) pops = tag.aO5pop.apops[eve]
        else
            pops = CalcTagPars(eve, tag, args, errs)

        if (pops.swins === null) {
            const doubles = {
                left: 'screenx',
                top: 'screeny',
                width: 'innerwidth',
                height: 'innerheight',
            },
                CalcSummString = nam => {
                    const pars = pops[nam],
                        ss = []
                    for (const par in pars) {
                        const v = ('' + pars[par]).trim(),
                            val = v.match(/[\d.,]+/) ? v : `'${v}'`
                        ss.push(par + '=' + val)
                    }
                    return ss.join(',')
                }

            for (const nam in dflts) { // ['moes', 'sizs', 'wins']
                const pars = dflts[nam],
                    dest = pops[nam]
                for (const _par in pars) { // например 'sizs'
                    const par1 = _par.toLowerCase(),
                        par2 = (nam === 'sizs') ? doubles[par1] : ''
                    if (!dest.hasOwnProperty(par1) && !(par2 && dest.hasOwnProperty(par2))) {
                        const v = pars[_par]
                        if (v !== null) dest[par1] = v
                    }
                }
            }

            CalcSizes(pops.sizs, errs, tag.aO5pop.name) //  для проверки корректности

            pops.swins = CalcSummString('wins')
            pops.smoes = CalcSummString('moes')

            Object.freeze(pops)
            for (const nam in dflts)
                if (dflts.hasOwnProperty(nam))
                    Object.freeze(pops[nam])
        }

        if (errs.length > 0)
            C.ConsoleError(`Ошибки обработки (цепочки) ссылок для тега `, C.MakeObjName(tag), errs)
        return pops
    }

    const wopens = [],
        click = 'click',
        o5popup = 'o5popup',
        aclicks = ['click', 'keyup', 'keydown', 'keypress'],
        DClosePops = () => ClosePops(null),
        W = {
            modul: 'o5pop',
            Init: Popups,
            Done: DClosePops,
            class: thisClass,
            consts: `		
                o5nocss=0;  // 0 - подключаются CSS'ы;
                o5timer=0.7 // интервал мигания ;
                o5params=''  // умалчиваемые для mos, sizs, wins;
			`,
        },
        attrs = document.currentScript.attributes,
        timerms = 1000 * ((attrs && attrs.o5timer) ? parseFloat(attrs.o5timer.value) : 2.1),
        o5css = `
.${thisClass},
.${thisClass + 'C'},
.${cls_Act} {
    cursor: pointer;
}        
.${thisClass}{    
	cursor: pointer;
	color: black;
	background-color: lavender;
	border-radius: 4px;
	border: 1px dashed gray;
}
b.${thisClass},
i.${thisClass},
u.${thisClass},
span.${thisClass},
 .${thisClass} {
    padding-left: 4px;				
    padding-right: 3px;
}
img.${thisClass} {
    border: none;
    background-color: transparent;
    position: relative;
}
.${cls_errArg} {
    opacity:0.5;
}
    /*  мигание вызвавшего тега
    */
.${cls_Act} {
    outline-offset: 2x;
    animation: blink ${timerms}ms infinite linear;
}
@keyframes blink {
    99% {outline: 2px dashed  black;outline-offset: 2x;}
    66% {outline: 3px dashed  white;}
    33% {outline: 2px dashed  black;}
    0% {outline: 3px dashed white;outline-offset: -2x;}
}
`,
        ClosePop = wopen => {
            if (o5debug > 1) console.log(`${W.modul}: ClosePop`.padEnd(22) +
                `${wopen.name}`.padEnd(22))
            if (wopen.time + 444 > (new Date()).getTime()) return

            const act = wopen.pops.act
            if (wopen.text)
                act[act.value ? 'value' : 'innerHTML'] = wopen.text

            if (act.classList.contains(cls_Act)) act.classList.remove(cls_Act)

            if (wopen.win.window && !wopen.win.window.closed) wopen.win.close()

            const i = wopens.indexOf(wopen)
            if (i > -1)
                wopens.splice(i, 1)

            if (wopens.length === 0) {
                window.clearInterval(wopens.tBlink)
                wopens.tBlink = 0
            }
        },
        CloseCloseds = () => {
            let i = wopens.length
            while (i-- > 0) {
                const wopen = wopens[i]
                if (wopen.win && wopen.win.closed) ClosePop(wopen)
            }
        },
        // DoBlinks = isnew => {
        DoBlinks = () => {
            CloseCloseds()
            if (wopens.length === 0) return

            for (const wopen of wopens)
                if (!wopen.noact && wopen.head !== '')
                    try { // тут м.б. ошибку по доступу из другого домена
                        const doc = wopen.win.document
                        if (doc) { // окно наконец-то загрузилось
                            const title = doc.title.trim()
                            if (!wopen.titlD && title) {
                                if (o5debug > 1) console.log(`${W.modul}: DoBlinks загрузилось`)
                                wopen.titlD = title
                                wopen.titlB = wopen.head ? wopen.head : title.replaceAll(/./g, '*') + '*'
                            }
                            doc.title = wopen.titlD == title ? wopen.titlB : wopen.titlD
                        }
                    } catch (e) {
                        wopen.noact = e.message
                        C.ConsoleError('DoBlink: прекращено по причине: "' + e.message + '"')
                    }
            wopens.tBlink = window.setTimeout(DoBlinks, timerms)
        },
        GetCSS = () => {
            const chs = document.head.children
            // let i = 0
            for (const ch of chs) {
                // if (i==14)
                // i=i
                // console.log(i++, ch.nodeName, ch.id, ch.id==namo5css)
                if (ch.nodeName.toUpperCase() == "STYLE" && ch.id == namo5css)
                    return ch
            }
        },
        IncludeCSS = () => { // подключение CSS'ов, встроенных в скрипт  (копия из o5com!.js)                
            let css = GetCSS()
            if (!css) {
                if (o5debug > 0)
                    console.log(`>>  СОЗДАНИЕ CSS   ${thisClass} (для модуля ${W.modul})`)
                const styl = document.createElement('style')
                styl.setAttribute('type', 'text/css')
                styl.id = namo5css
                css = document.head.appendChild(styl)
            } else
                if (o5debug > 0)
                    console.log(`>>  ИНЗМЕНЕНИЕ CSS   ${thisClass} (для модуля ${W.modul}) `)
            css.innerHTML = o5css.replace(/(\/\/.*($|\n))|(\s*($|\n))/g, '\n')
        },
        ClosePops = grp => { // закрыть все с такой группой и анонимные ('группа' типа 0)
            'use strict'
            if (wopens.length === 0) return
            let n = 0,
                i = wopens.length
            while (i-- > 0) {
                const wopen = wopens[i],
                    group = wopen.pops.moes.group

                if (grp == group || grp === null || !group) {      //|| typeof grp == 'event') {
                    ClosePop(wopen)
                    n++
                }
            }
            if (o5debug > 0)
                console.log(`${W.modul}: закрыты ${n} окон группы '${grp === null ? 'всё' : grp}'`)
        },
        CalcSizes = (sizs, errs, tagname) => {
            'use strict'
            const screen = window.screen,
                she = screen.height,
                swi = screen.width,
                GetVal = nam => {
                    const u = sizs[nam] // м.б. как строка так и число
                    if (u) {
                        const isw = nam == 'width' || nam == 'left' || nam == 'innerwidth' || nam == 'screenx',

                            v = parseFloat(u),
                            // va = Math.abs(v),   mperc = /\s*[\d.,]*%\s*/
                            val = (u.match && u.match(/\s*[\d.,]+%\s*/)) ? (0.01 * v * (isw ? swi : she)) : v // размер в пикселах]
                        // val= (u.match && u.match(mperc))?( 0.01 * val * (isw ? swi : she) - 0.5 * (isw ? wi : he)):va
                        return {
                            isw: isw,
                            val: val,
                        }
                    }
                }
            let ss = [],
                wi = 0,
                he = 0,
                dtps = {
                    w: false,
                    h: false,
                    l: false,
                    t: false
                },
                CheckDubl = (nam, m1, m2, x, txt) => {
                    if (nam.match(m1) || nam.match(m2)) {
                        if (dtps[x]) errs.push(`для  '${tagname}' дублирование ` + txt)
                        dtps[x] = true
                    }
                }

            for (const nam of ['width', 'height', 'innerwidth', 'innerheight']) {
                const z = GetVal(nam)
                if (z) {
                    const val = Math.abs(z.val)

                    if (z.isw) wi = val
                    else he = val
                    ss.push(nam + '=' + parseInt(val))
                    if (errs) {
                        CheckDubl = (nam, /width/, /innerwidth/, 'w', 'ширины окна')
                        CheckDubl = (nam, /height/, /innerheight/, 'h', 'высоты окна')
                        if (val < 100) errs.push(`для  '${tagname}' значение '${nam}' меньше 100`)
                    }
                }
            }

            const aW = screen.availWidth,
                aH = screen.availHeight,
                RePos = (val, actW, maxW, minL) => {
                    let x = val
                    if (x > maxW) x = maxW - actW
                    if (x > -1) x = minL + x
                    else x = minL // + x + maxW - actW - 4
                    return x
                }
            for (const nam of ['left', 'top', 'screenx', 'screeny']) {
                const z = GetVal(nam)
                if (z) {
                    const isw = z.isw,
                        v = z.val < 0 ? (isw ? aW + z.val - wi : aH - z.val - he) : z.val,
                        val = RePos(v, isw ? wi : he, isw ? aW : aH, isw ? screen.availLeft : screen.availTop)

                    ss.push(nam + '=' + parseInt(val))
                    if (errs) {
                        CheckDubl = (nam, /left/, /screenx/, 'l', 'левой позиции')
                        CheckDubl = (nam, /top/, /screeny/, 't', 'верхней позиции')
                    }
                }
            }
            return ss.join(',')
        },
        optsFocus = {
            capture: true,
            moja: 'fignia'
        },
        Focus = e => {
            if (wopens.length === 0 || focusTime == e.timeStamp) return

            focusTime = e.timeStamp
            window.setTimeout(() => {
                for (const wopen of wopens)
                    wopen.win.focus()
            }, 1)
            if (o5debug > 1)
                console.log(`${W.modul}: Focus для ${wopens.length} тегов (${e.eventPhase}, ${e.isTrusted ? 'T' : 'f'}, ${e.timeStamp.toFixed(1).padEnd(6)}, ${e.type})`)
        },
        o5nocss = attrs && attrs.o5nocss && attrs.o5nocss.value,
        doneattr = W.modul + '-done'

    function WindowOpen(pops, s) {
        const url = pops.url
        if (url && url.length > 1) {
            // let isref = false
            if (url[0] == '#') {
                const id = url.substring(1),
                    tag = document.getElementById(id)
                if (tag) {

                } else {
                    C.ConsoleError(`PopUp: ссылка на отсутствующие внутренний тег:`, id)
                    return
                }
            }
            return window.open(url, pops.key, s)
        }
    }

    function ShowWin(pops) {
        'use strict'
        if (o5debug > 1) console.log(`${W.modul}: ShowWin`.padEnd(22) +
            `${C.MakeObjName(pops.tag)}`.padEnd(22) +
            `${C.MakeObjName(pops.act)}, '${pops.eve}') `)

        const tag = pops.tag,
            wopen = wopens.find(wopen => wopen.pops.tag == tag && wopen.pops.eve == pops.eve)

        if (wopen) { // повтор события на теге - закрываю всплытое окно!
            ClosePop(wopen)
            return
        }

        ClosePops(pops.moes.group)

        const sizs = CalcSizes(pops.sizs),
            s = sizs + ',' + pops.swins,
            win = WindowOpen(pops, s)
        if (win) {
            const wopen = {
                pops: pops,
                win: win,
                head: pops.moes.head,
                text: '',
                titlD: '',
                titlB: '',
                noact: '',
                name: tag.aO5pop.name,
                time: (new Date()).getTime() // отстройка от "дребезжания"o5contents
            }
            const act = pops.act

            if (pops.moes.text) { // для анонимных - не менять текст
                wopen.text = act.value ? act.value : act.innerHTML
                act[act.value ? 'value' : 'innerHTML'] = pops.moes.text
            }
            RemoveTagErrors(tag)

            wopens.push(wopen)

            if (timerms > 99 && tag.classList.contains(thisClass)) {
                act.classList.add(cls_Act)
                if (wopens.tBlink)
                    window.clearInterval(wopens.tBlink)
                DoBlinks(true)
            }
        } else
            if (!aclicks.includes(pops.eve))
                SetTagError(tag, `создание окна по событию '${pops.ve}'`, [`вероятно следует снять запрет на всплытие окон в браузере`])

        return sizs + ',\n' + pops.swins + ',\n' + pops.smoes
    }

    function PopUp() {
        if (arguments.length < 0 || arguments.length > 3) {
            C.ConsoleError(`PopUp: ошибочное к-во аргументов='${arguments.length}'`, [` у PopUp() их д.б. от 1 до 3)`])
            return '?'
        }

        let caller = arguments.callee
        while (caller.caller)
            caller = caller.caller

        const e = caller.arguments[0],
            pops = GetPops(e, arguments)

        if (e.target.nodeName != "A" || !e.target.hasAttribute('href')) {
            e.cancelBubble = true
            return ShowWin(pops)
        }

    }

    function PopShow() { //  устарешая обёртка  ---- width, height, url
        if (arguments.length == 3 && !isNaN(arguments[0]) && !isNaN(arguments[1])) {
            let caller = arguments.callee
            while (caller.caller)
                caller = caller.caller

            const e = caller.arguments[0],
                pops = GetPops(e, ['', arguments[2], `width=${arguments[0]}, height=${arguments[1]}`])
            e.cancelBubble = true
            return ShowWin(pops)
        } else {
            C.ConsoleError(`PopShow: ошибочно к-во или тип аргументов [${arguments.join(', ')}]`)
            return '?'
        }
    }

    function Popups(e) {
        'use strict'
        if (!C.avtonom)
            if (o5nocss || GetCSS()) C.ParamsFill(W) // CSS сохранилось после автономного создания
            else // иначе - никак, т.к. не известно, кто раньше загрузится
                C.ParamsFill(W, o5css) // CSS пересоздаётся (для Blogger'а)

        if (o5debug > 0) console.log(`========  инициализация '${W.modul}'   ------` +
            `${C.avtonom ? ('автономно по ' + e.type) : 'из библиотеки'}`)

        focusTime = 0

        let o5c = null
        const tags = C.GetTagsByQueryes('[' + o5popup + ']'),
            mids = [],
            o5contents = 'o5contents',
            AskRefTag = (tag0, params) => {
                const mcc = params[0].match(/^\s*id=\s*\w+\b/i)
                if (!mcc) return

                const ss = mcc[0],
                    id = ss.split('=')[1].trim(),
                    mid = mids.find(mid => mid.mtag && mid.mtag.id == id),
                    errid = `========  ссылочный id='${id}'`

                if (!o5c) o5c = document.getElementById(o5contents)
                if (!o5c)
                    return `${errid} не найден контент=${o5contents} <li>`

                let mtag = mid ? mid.mtag : null

                if (!mtag) {
                    for (let i = 0; i < o5c.children.length; i++) {
                        const child = o5c.children[i]
                        let tag = null
                        if (child.id == id) tag = child
                        else tag = child.querySelector('#' + id)
                        if (tag) {
                            mtag = { i: i + 1, tag: tag, id: id }
                            break
                        }
                    }
                    if (!mtag)
                        return `${errid} отсутствует в '${o5contents}'`

                    mids.push(mtag)
                }

                const tag = mtag.tag

                //     mpopup = tag.attributes.o5popup
                // if (!mpopup)
                //     return `${errid} не содержит 'o5popup'`

                // const mparams = mpopup.nodeValue.split(/[;,]/)
                // let mli = tag.parentNode

                // while (mli.nodeName != 'LI')
                //     mli = mli.parentNode

                // if (!mli)
                //     return `${errid} не принадлежит <li>`

                tag0.classList.add(o5contents)
                tag0.title = tag0.title + (tag0.title ? ' ' : '') + tag.innerText
                // let s1 = tag0.innerText,
                //     s2 = (tag0.innerText ? '+' : ''),
                //     s3 = tag0.innerText + (tag0.innerText ? ' ' : '') + `[  ${mtag.i} ]`
                tag0.innerHTML = tag0.innerText + (tag0.innerText ? ' ' : '') + `[&#8202;${mtag.i}&#8202;]`
                tag0.a5pop = { mtag: mtag }
                // tag.attributes.o5popup+=',' + id
            }

        if (tags)
            for (const tag of tags) {
                if (tag.getAttribute(doneattr)) {
                    console.error('%c%s', eclr, `(========  повтор инициализации для id='${tag.id}'`)
                    continue
                }
                tag.setAttribute(doneattr, 'OK')
                const params = tag.attributes.o5popup.nodeValue.split(/[;,]/)
                if (params.length > 0) {
                    let err = AskRefTag(tag, params)
                    if (err) {
                        console.error('%c%s', eclr, err + ` (для id='${tag.id}')`)
                        continue
                    }

                    if (!o5nocss && !tag.classList.contains(thisClass) && !params.find(param => param.match(/\bnocss\b/i)))
                        tag.classList.add(thisClass)

                    tag.addEventListener(click, PopUp)
                }
            }

        for (const eve of ['focus', 'click'])
            window.addEventListener(eve, Focus, optsFocus) // т.е. e.eventPhase ==1

        window.addEventListener(click, ClosePops)

        document.addEventListener('visibilitychange', DClosePops) // для автономной работы

        if (!o5nocss) // т.е. если явно НЕ запрещено    
            IncludeCSS()

        const errs = []
        if (attrs && attrs.o5params) {
            const pars = {},
                refs = {} // тут - refs не нуже
            SplitPars(attrs.o5params, pars, refs, errs)
            AddPars(pars, dflts, errs, false, 'конфиг.')
        }
        if (errs.length > 0)
            C.ConsoleError(`Ошибки формирования параметров окна (из url'а):`, errs.length, errs)

        window.dispatchEvent(new CustomEvent('olga5_sinit', {
            detail: {
                modul: W.modul
            }
        }))
        // C.E.DispatchEvent('olga5_sinit')
    }

    if (C.avtonom) {
		const Find = (scripts, nam) => {
			const mnam = new RegExp('\\b' + nam + '\\b')
			for (const script of scripts) {
				const attributes = script.attributes
				for (const attribute of attributes) {
					if (attribute.value.match(mnam)) return true
				}
			}
		}
		if (Find(document.scripts, 'o5inc.js'))
			window.addEventListener('olga5-incls', W.Init)
		else
			document.addEventListener('DOMContentLoaded', W.Init)

        // document.addEventListener('DOMContentLoaded', W.Init)
        // document.addEventListener('olga5-incls', W.Init)
        if (!window.olga5) window.olga5 = []
        Object.assign(window.olga5, {
            PopUp: PopUp,
            PopShow: PopShow
        })

        if (o5debug)
            console.log(`}---< ${document.currentScript.src.indexOf(`/${W.modul}.`) > 0 ? 'загружен  ' : 'включён   '}:  ${W.modul}.js`)
    } else 
        C.ModulAdd(W)   


})();