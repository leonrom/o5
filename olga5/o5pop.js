/* global document, window, console  */
/* exported olga5_menuPopDn_Click    */
/* jshint asi:true                   */
/* jshint esversion: 6               */
(function () {              // ---------------------------------------------- o5pop ---
    const o5callp = 'window.olga5.PopUp'

    if (!window.olga5) window.olga5 = []

    const pard = window.location.search.match(/(\&|\?|\s)(is|o5)?(-|_)?debug\s*(\s|$|\?|#|&|=\s*\d*)/)
    let o5debug = (pard ? (pard[0].match(/=/) ? parseInt(pard[0].match(/\s*\d+/) || 1) : 1) : 2),
        C = {                // заменитель библиотечного
            consts: { o5debug: o5debug },
            ConsoleError: (msg, name, errs) => {
                const txt = `ОШИБКА:: ` + msg + (name ? '  >' + name + '<' : '')
                console.groupCollapsed(txt)
                if (errs && errs.length > 0) console.table(errs)
                else console.error(txt)
                console.trace("трассировка вызовов :")
                console.groupEnd()
            },
            MakeObjName: obj => obj ? (
                (obj.id && obj.id.length > 0) ? ('#' + obj.id) : (
                    ('[' + obj.tagName ? obj.tagName : (obj.nodeName ? obj.nodeName : '?') + ']') +
                    '.' + (obj.className ? obj.className : '?'))) : 'НЕОПР.',
            GetTagsByQueryes: query => document.querySelectorAll(query), // второй аргумент - игнорится
        }

    const // phases = ['NONE', 'CAPTURING_PHASE', 'AT_TARGET', 'BUBBLING_PHASE'],
        SetTagError = (tag, txt, errs) => {  // добавление и протоколирование НОВЫХ ошибок для тегов
            const
                isnew = tag.title.indexOf(txt) < 0,
                first = tag.title == tag.aO5pop.title       // .trim().indexOf('?') != 0

            if (first) tag.title = tag.aO5pop.title + ' ?-> ' + txt
            else if (isnew) tag.title = tag.title + '; ' + txt

            if (isnew) C.ConsoleError(`${txt} для тега : `, C.MakeObjName(tag), errs)
            if (!tag.classList.contains(cls_errArg))
                tag.classList.add(cls_errArg)
        },
        RemoveTagErrors = tag => {  // добавление и протоколирование НОВЫХ ошибок для тегов            
            if (tag.classList.contains(cls_errArg)) {
                tag.title = tag.aO5pop.title
                tag.classList.remove(cls_errArg)
            }
        },
        SplitArgs = args => {
            const pars = [],
                refs = []

            let iurl = -1
            for (let i = 0; i < 3; i++)
                if (args[i].match && args[i].match(/\/|\+/)) {
                    iurl = i
                    break
                }
            const url = iurl < 0 ? '' : args[iurl],
                x = iurl > 0 ? args[0] : null,
                act = x ? (x.attributes ? x : document.getElementById(x)) : null,
                ss = (args[iurl + 1] || '').split(/;|,/)

            for (const s of ss) {
                const uu = s.split(/=|:/),
                    nam = uu[0].trim()

                if (uu.length > 1)
                    pars.push({ nam: nam, val: (uu[1] || '').replace(repQuotes, '') })
                else
                    refs.push(nam)
            }
            if (x && !act)
                C.ConsoleError(`Не найден сигнальный тег ${x} (url='${url}')`)
            return { url: url, act: act, pars: pars, refs: refs }
        },
        PopUp = function (e, args) {
            const r = SplitArgs(args)
            tag = e.currentTarget

            if (args.length < 1 || args.length > 4)
                C.ConsoleError(`Ошибочное к-во аргументов='${args.length}'`, [` у PopUp() их к-во тут д.б. от 1 до 4)`])

            e.cancelBubble = true

            ShowWin(tag, e.type, { act: r.act, url: r.url, pars: r.pars, refs: r.refs })
        }

    window.olga5.PopUp = function () {
        PopUp(arguments.callee.caller.arguments[0], arguments)
    }
    window.olga5.PopShow = function () { //  устарешая обёртка  ---- nam, width, height, url
        const e = arguments.callee.caller.arguments[0],
            tag = e.currentTarget,
            attr = `on` + e.type,
            n = (arguments.length > 3) ? 1 : 0,
            nam = n > 0 ? arguments[0] : '',
            width = arguments[n + 0],
            height = arguments[n + 1],
            url = arguments[n + 2],
            pars = `width=${width},height=${height}`  // --------------------------------------------------------------------

        tag.removeAttribute(attr)
        tag.setAttribute(attr, `${o5callp}('${nam}', '${url}', '${pars}')`)

        PopUp(e, [nam, url, pars])
    }

    'use strict'

    const repQuotes = /^\s*['"`]?\s*|\s*['"`]?\s*$/g, 
        click = 'click',
        o5popup = 'o5popup',
        aclicks = ['click', 'keyup', 'keydown', 'keypress']

    const wopens = [], // window.olga5.PopUpwopens // массив открытых окон
        DClosePops = () => ClosePops(null),
        W = {
            modul: 'o5pop',
            Init: Popups,
            Done: DClosePops,
            class: 'olga5_popup',
            consts: `		
                o5nocss=0;  // 0 - подключаются CSS'ы
                o5timer=0.7 // интервал мигания ;
                o5params=''  // умалчиваемые для mos, sizs, wins
			`,
        },
        dflts = {
            moes: { text: '', group: '', head: '', },
            sizs: { width: 588, height: 345, top: 11, left: -22, },
            wins: {
                alwaysRaised: 1, alwaysOnTop: 1, menubar: 0, toolbar: 0, status: 0, resizable: 1, scrollbars: 0,
                innerwidth: '', innerheight: '', screenx: '', screeny: ''
            },
        },
        attrs = document.currentScript.attributes,
        timerms = 1000 * ((attrs && attrs.o5timer) ? parseFloat(attrs.o5timer.value) : 2.1),
        cls_Act = W.class + '-Act',
        cls_errArg = W.class + '-errArg',
        namo5css = W.class + '-internal',
        o5css = `
.${W.class},
.${W.class + 'C'},
.${cls_Act} {
    cursor: pointer;
}        
.${W.class}{    
	cursor: pointer;
	color: black;
	background-color: lavender;
	border-radius: 4px;
	border: 1px dashed gray;
}
b.${W.class},
i.${W.class},
u.${W.class},
span.${W.class},
 .${W.class} {
    padding-left: 4px;				
    padding-right: 3px;
}
img.${W.class} {
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
            const pop = wopen.pop

            const tag = pop.act || pop.tag
            if (wopen.text)
                tag[tag.value ? 'value' : 'innerHTML'] = wopen.text

            if (tag.classList.contains(cls_Act))
                tag.classList.remove(cls_Act)

            if (wopen.win.window && !wopen.win.window.closed)
                wopen.win.close()

            const i = wopens.indexOf(wopen)
            if (i > -1)
                wopens.splice(i, 1)

            if (wopens.length == 0) {
                window.clearInterval(wopens.tBlink)
                wopens.tBlink = 0
            }
        },
        CloseCloseds = () => {
            let i = wopens.length
            while (i-- > 0) {
                const wopen = wopens[i]
                if (wopen.win && wopen.win.closed)
                    ClosePop(wopen)
            }
        },
        DoBlinks = isnew => {
            CloseCloseds()
            if (wopens.length == 0) return

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
            for (const ch of chs)
                if (ch.nodeName == "STYLE" && ch.id == namo5css)
                    return ch
        },
        IncludeCSS = () => {// подключение CSS'ов, встроенных в скрипт  (копия из o5common.js)                
            let css = GetCSS()
            if (!css) {
                if (o5debug > 0)
                    console.log(`>>  СОЗДАНИЕ CSS   ${W.class} (для модуля ${W.modul})`)
                const styl = document.createElement('style')
                styl.setAttribute('type', 'text/css')
                styl.id = namo5css
                css = document.head.appendChild(styl)
            } else
                if (o5debug > 0)
                    console.log(`>>  ИНЗМЕНЕНИЕ CSS   ${W.class} (для модуля ${W.modul}) `)
            css.innerHTML = o5css.replace(/(\/\/.*($|\n))|(\s*($|\n))/g, '\n')
        },
        CorrectDefaults = (parms) => {
            const ss = parms ? parms.replace(repQuotes, '').split(/[,;]/) : []
            ss.forEach(s => {
                const uu = s.split(/=|:/),
                    nam = uu[0].trim().toLowerCase(),
                    u = uu[1] ? uu[1].trim() : ''
                if (u) {
                    if (dflts.moes.hasOwnProperty(nam)) dflts.moes[nam] = u
                    else if (dflts.sizs.hasOwnProperty(nam)) dflts.sizs[nam] = u // ConvToValue(nam, u)
                    else if (dflts.wins.hasOwnProperty(nam)) dflts.wins[nam] = parseInt(u)
                    else
                        C.ConsoleError(`неопределённый параметр окна '${nam}' у сриптового атрибута 'o5params'`)
                }
            })
        },
        ClosePops = grp => {    // закрыть все с такой группой и анонимные ('группа' типа 0)
            if (wopens.length == 0) return
            let n = 0,
                i = wopens.length
            while (i-- > 0) {
                const wopen = wopens[i],
                    group = wopen.pop.moes.group

                if (grp == group || !group || grp === null) {
                    ClosePop(wopen)
                    n++
                }
            }
            if (o5debug > 0)
                console.log(`${W.modul}: закрыты ${n} окон группы '${grp === null ? 'всё' : grp}'`)
        },
        CalcAttrs = tag => {
            const ap = tag.getAttribute(o5popup)
            if (!ap) return

            const ss = ap.split(/,|;/),
                pars = [],
                refs = []
            let url = ''

            for (const s of ss)
                if (s.match(/\/|\+/)) url = s
                else {
                    const uu = s.split(/=|:/),
                        nam = uu[0].trim()

                    if (uu.length > 1)
                        pars.push({ nam: nam, val: (uu[1] || '').replace(repQuotes, '') })
                    else
                        refs.push(nam)
                }
            if (!url && !tag.id)
                C.ConsoleError(`Неопределён 'url' для тега ${C.MakeObjName(tag)} с параметрами (${ap})`)
            return { url: url, act: tag, pars: pars, refs: refs }
        },
        AO5 = tag => {
            return { name: C.MakeObjName(tag), title: tag.title, tag: tag, pops: {} }
        },
        fillPop = {
            itags: [],
            AddMissing: (ppars, ipars) => {
                for (const ipar in ipars)
                    if (!ppars.hasOwnProperty(ipar)) ppars[ipar] = ipars[ipar]
            },
            FillRef: tag => {
                const AddTag = (Fun, arg, eve) => {
                    const r = Fun(arg)
                    if (r) {
                        tag.aO5pop = Object.assign({}, AO5(tag)) // { name: C.MakeObjName(tag), tag: tag, pops: {} }
                        tag.aO5pop.pops[o5popup] = fillPop.Fill(tag, { act: r.act, url: r.url, pars: r.pars, refs: r.refs }, eve)
                    }
                }
                AddTag(CalcAttrs, tag, o5popup)

                const ml = /\bolga5\.Pop(Up|Show|Work)\s*\(\s*/,
                    mr = /\s*\)/,
                    mful = new RegExp(ml.source + '\\.*' + mr.source, 'i'),
                    mrep = new RegExp('(' + ml.source + ')|(' + mr.source + ')', 'i')
                for (const attr of tag.attributes) {
                    const feve = attr.name.match(/\bon\w+/i)
                    if (feve) {
                        const exec = attr.value.match(mful)
                        if (exec) {
                            const ss = exec.replace(mrep, '').split(/\s*,\s*/)
                            AddTag(SplitArgs, ss, o5popup, feve.substring(2))
                        }
                    }
                }
            },
            Fill: (tag, add, eve) => {
                if (o5debug > 1) console.log(`${W.modul}: Fill`.padEnd(22) +
                    `${C.MakeObjName(tag)}`.padEnd(22) +
                    ` ${tag.aO5pop ? 'повт.' : 'определение-Eve'}`)
                if (fillPop.itags.includes(tag)) {
                    let s = ''
                    fillPop.itags.forEach(t => s += t.aO5pop.name + '-> ')
                    C.ConsoleError(`Циклические ссылки на тег: ${s}`)
                    return
                }
                fillPop.itags.push(tag)

                const errs = [],
                    aO5 = tag.aO5pop,
                    pop = {
                        tag: tag,
                        act: add.act || tag,
                        url: add.url,           // м.б. изменится после декодирования
                        pars: '',
                        key: aO5.name + '(' + eve + ')',  // наименование окна
                        moes: {}, sizs: {}, wins: {},
                    }

                for (const par of add.pars) {
                    let nam = par.nam.toLowerCase()
                    if (nam) {
                        if (nam.length == 1) {
                            if (nam == 'g') nam = 'group'
                            if (nam == 'n') nam = 'nocss'
                            else if (nam == 'w') nam = 'width'
                            else if (nam == 'h') nam = 'height'
                            else if (nam == 't') nam = 'top'
                            else if (nam == 'l') nam = 'left'
                        }

                        const val = par.val.replace(repQuotes, '')

                        if (dflts.moes.hasOwnProperty(nam)) pop.moes[nam] = val
                        else if (dflts.sizs.hasOwnProperty(nam)) pop.sizs[nam] = val // тут не надо parseInt из-за возм. '%'
                        else if (dflts.wins.hasOwnProperty(nam)) pop.wins[nam] = parseInt(val)
                        else
                            errs.push(`неопределённый параметр '${par.nam}' для события '${eve}'`)
                    }
                    else errs.push(`Отсутствие левой части свойства c val='${par.val}'`)
                }

                for (const nam of add.refs) {
                    const itag = nam.attributes ? nam : document.getElementById(nam)
                    if (itag) {
                        if (!itag.aO5pop)
                            fillPop.FillRef(itag)
                        if (itag.aO5pop)
                            for (const ipop in itag.aO5pop.pops)
                                fillPop.AddMissing(pop.moes, ipop.moes)
                        else
                            errs.push(`Не найдены popup'ы по ссылке ${nam}`)
                    }
                    else
                        if (!nam.match(/head|group|text|nocss/i))
                            errs.push(`для '${eve}' не найден ссылочный ref='${nam}'`)
                }

                for (const nam in dflts)
                    fillPop.AddMissing(pop[nam], dflts[nam])

                if (C.DeCodeUrl) {
                    const o5attrs = tag ? C.GetAttrs(tag.attributes) : '',
                        ori = (pop.url || '').replace(repQuotes, ''),
                        url = (ori.trim() && !ori.match(/[\/.\\#]/)) ? (document.URL + '?o5nomnu#' + ori) : ori,
                        wref = C.DeCodeUrl(W.urlrfs, url, o5attrs)

                    if (wref.err)
                        errs.push(`Ошибка перекодирования url='${pop.url}':  ${wref.err}`)
                    pop.url = wref.url
                }
                if (errs.length > 0)
                    SetTagError(tag, `декодирование опций`, errs)

                let s = ''
                for (const win in pop.wins) {
                    const pw = pop.wins[win]
                    if (pw !== '') s += win + '=' + pw + ','
                }
                pop.pars = s
                return pop
            },
        },
        CalcSizes = pop => {
            const screen = window.screen,
                she = screen.height,
                swi = screen.width,
                RePos = (val, actW, maxW, minL) => {
                    let x = val
                    if (x > maxW) x = maxW - actW
                    if (x > -1) x = minL + x
                    else x = minL           // + x + maxW - actW - 4
                    return x
                },
                GetVal = nam => {
                    const isw = nam === 'width' || nam === 'left',
                        u = pop.sizs[nam],    // м.б. как строка так и число
                        v = parseFloat(u)
                    let val = Math.abs(v)
                    if (u.match && u.match(/\d\s*%\s*$/))
                        val = 0.01 * val * (isw ? swi : she) - 0.5 * (isw ? wi : he)
                    return { isw: isw, v: v, val: val, }
                }
            let s = '',
                wi = 0,
                he = 0

            for (const nam of ['width', 'height']) {
                const z = GetVal(nam)

                if (z.isw) wi = z.val
                else he = z.val
                s += nam + '=' + parseInt(z.val) + ','
            }

            for (const nam of ['left', 'top']) {
                const z = GetVal(nam),
                    aW = screen.availWidth,
                    aH = screen.availHeight

                if (z.v < 0)
                    z.val = z.isw ? aW + z.val - wi : aH - z.val - he

                z.val = RePos(z.val, z.isw ? wi : he, z.isw ? aW : aH, z.isw ? screen.availLeft : screen.availTop)

                s += nam + '=' + parseInt(z.val) + ','
            }
            return s
        },
        ShowTestRez = () => {
            const tags = C.GetTagsByQueryes("*[id]", W.modul)
            tags.forEach(tag => {
                const xO5 = tag.aO5pop
                if (xO5 && xO5.newtst) {
                    xO5.newtst = false

                    for (const eve in xO5.pops) {
                        console.log(''.padEnd(6) + ' tag=' + xO5.name + ' eve=' + eve)
                        const pop = xO5.pops[eve]
                        for (const nam in dflts) {
                            const pps = pop[nam]
                            let s = ''
                            for (const pp in pps)
                                s += pp.padEnd(6) + ': ' + ((typeof pps[pp] === 'undefined' ? '' : pps[pp]) + ', ').padEnd(4)
                            if (s)
                                console.log(''.padEnd(11) + nam + '=>  ' + s)
                        }
                    }
                }
            })
        }

    function ShowWin(tag, eve, add) {
        if (o5debug > 1) console.log(`${W.modul}: ShowWin`.padEnd(22) +
            `${C.MakeObjName(tag)}`.padEnd(22) +
            `${C.MakeObjName(add.act)}, '${eve}') `)

        if (!tag.aO5pop)
            tag.aO5pop = Object.assign({}, AO5(tag)) // { name: C.MakeObjName(tag), tag: tag, pops: {} }

        const aO5 = tag.aO5pop

        if (aO5.pops[eve]) {
            const wopen = wopens.find(wopen => wopen.pop.tag == tag && wopen.eve == eve)

            if (wopen) { // повтор события на теге - закрываю всплытое окно!
                ClosePop(wopen)
                return
            }
        }
        else {
            fillPop.itags.splice(0, fillPop.itags.length)
            aO5.pops[eve] = fillPop.Fill(tag, add, eve)
        }
        const pop = aO5.pops[eve],
            s = CalcSizes(pop)

        ClosePops(pop.moes.group)

        const win = window.open(pop.url, pop.key, pop.pars + s)
        if (win) {
            const wopen = {
                pop: pop,
                eve: eve,
                win: win, head: pop.moes.head, text: '', titlD: '', titlB: '', noact: '', name: tag.aO5pop.name,
                time: (new Date()).getTime()  // отстройка от "дребезжания"
            }
            const act = pop.act

            if (pop.moes.text) { // для анонимных - не менять текст
                wopen.text = act.value ? act.value : act.innerHTML
                act[act.value ? 'value' : 'innerHTML'] = pop.moes.text
            }
            RemoveTagErrors(tag)

            wopens.push(wopen)

            if (timerms > 99 && tag.classList.contains(W.class)) {
                act.classList.add(cls_Act)
                if (wopens.tBlink)
                    window.clearInterval(wopens.tBlink)
                DoBlinks(true)
            }
        }
        else
            if (!aclicks.includes(eve))
                SetTagError(tag, `создание окна по событию '${eve}'`, [`вероятно следует снять запрет на всплытие окон в браузере`])

        if (o5debug > 1) ShowTestRez()
    }

    const o5nocss = attrs && attrs.o5nocss && attrs.o5nocss.value,
        init = {
            focusTime: 0,
            Run: islib => {
                const txt = islib ? 'из ядра библиотеки' : 'по загрузке страницы',
                    htxt = W.modul + '(' + txt + ')'

                const tags = C.GetTagsByQueryes('[' + o5popup + ']'),
                    Focus = e => {
                        if (wopens.length == 0 || init.focusTime == e.timeStamp) return

                        init.focusTime = e.timeStamp
                        window.setTimeout(() => {
                            let i = 0
                            for (const wopen of wopens)
                                wopen.win.focus()
                        }, 1)
                        if (o5debug > 1)
                            console.log(`${W.modul}: Focus для ${wopens.length} тегов (${e.eventPhase}, ${e.isTrusted ? 'T' : 'f'}, ${e.timeStamp.toFixed(1).padEnd(6)}, ${e.type})`)
                    }

                for (const tag of tags) {
                    const r = CalcAttrs(tag)
                    if (!o5nocss) {
                        const params = tag.attributes.o5popup.nodeValue
                        if (!params.match(/\bnocss\b/i) && !tag.classList.contains(W.class))
                            tag.classList.add(W.class)
                    }

                    tag.addEventListener(click, e => {
                        if (r.url) {
                            ShowWin(tag, o5popup, { act: r.act, url: r.url, pars: r.pars, refs: r.refs })
                            e.cancelBubble = true
                        }
                    })
                }

                for (const eve of ['focus', 'click'])
                    window.addEventListener(eve, Focus, { capture: true })  // т.е. e.eventPhase ==1
                for (const eve of ['focus', 'blur', 'resize'])
                    window.addEventListener(eve, Focus, { capture: false })  // т.е. e.eventPhase ==2

                document.addEventListener(click, () => ClosePops(0))

                document.addEventListener('visibilitychange', DClosePops) // для автономной работы

                if (!o5nocss)  // т.е. если явно НЕ запрещено    
                    IncludeCSS()

                if (attrs && attrs.o5params)
                    CorrectDefaults(attrs.o5params.value.trim())
            }
        }

    function Popups(c) {
        if (c) {
            C = c
            o5debug = C.consts.o5debug

            if (o5nocss || GetCSS()) c.ParamsFill(W)    // CSS сохранилось после автономного создания
            else                                        // иначе - никак, т.к. не известно, кто раньше загрузится
                c.ParamsFill(W, o5css)                  // CSS пересоздаётся (для Blogger'а)
        }
        init.Run(true)
        window.dispatchEvent(new CustomEvent('olga5_sinit', { detail: { modul: W.modul } }))
    }

    window.addEventListener("DOMContentLoaded", e => {
		if (!window.olga5.C) // библиотеки-то - НЕТУ
            init.Run()
	})

    if (!window.olga5.find(w => w.modul == W.modul)) {
        window.olga5.push(W)

        if (window.location.search.match(/(\&|\?|\s)(is|o5)?(-|_)?debug\s*(\s|$|\?|#|&|=\s*\d*)/))
            console.log(`}---< ${document.currentScript.src.indexOf(`/${W.modul}.`) > 0 ? 'загружен  ' : 'включён   '}:  ${W.modul}.js`)
        window.dispatchEvent(new CustomEvent('olga5_sload', { detail: { modul: W.modul } }))
    } else
        console.error(`Повтор загрузки '${W.modul}`)
    // -------------- o5pop
})();
