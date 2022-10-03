/* global document, window, console  */
/* exported olga5_menuPopDn_Click    */
/* jshint asi:true                   */
/* jshint esversion: 6               */
(function () {              // ---------------------------------------------- o5pop ---
    const o5callp = 'window.olga5.PopUp'

    if (!window.olga5) window.olga5 = []

    const pard = window.location.search.match(/(\&|\?|\s)is(-|_)debug\s*(\s|$|\?|#|&|=\s*\d*)/)
    let timeStamp = 0,
        o5debug = (pard ? (pard[0].match(/=/) ? parseInt(pard[0].match(/\s*\d+/) || 1) : 1) : 2)

    const phases = ['NONE', 'CAPTURING_PHASE', 'AT_TARGET', 'BUBBLING_PHASE'],
        PopUp = function (e, args) {
            const m2 = 3,
                tag = e.currentTarget,
                n = args.length

            if (o5debug > 1) console.log(`${W.modul}: PopUp`.padEnd(22) +
                `${C.MakeObjName(tag)}`.padEnd(22) +
                `${e.type} ${e.eventPhase}=${phases[e.eventPhase]}` +
                ` ${tag.aO5pop ? 'опр.' : 'НЕопр.'},   ${e.timeStamp} ${timeStamp == e.timeStamp ? ' > повтор события!' : ''}`)

            if (timeStamp == e.timeStamp) return
            // if (closedTag == tag) {
            //     closedTag = null
            //     return
            // }
            // closedTag = null
            timeStamp = e.timeStamp

            if (n < 1 || n > m2) {
                SetTagError(tag, `Ошибочное количество '${n}' аргументов`, `у  PopUp() к-во аргументов ${n} д.б. от 1 до ${m2}`)
                return
            }

            const
                popUp = {
                    tag0: null,
                    GetTag: function () {
                        if (!popUp.tag0)
                            try {
                                popUp.tag0 = document.createElement('span')
                                popUp.tag0.style.display = 'none'
                                popUp.tag0.id = 'o5pop_commonTag'
                                if (o5debug > 0)
                                    console.log(`Создан (без добавления) невидимый тег всплытия  <${popUp.tag0.nodeName}> с id='${popUp.tag0.id}'`)
                            } catch (e) {
                                console.error(`Ошибка создания невидимого тега: "${e.message}"`)
                            }
                        return popUp.tag0
                    },
                },
                x = n < m2 ? '' : args[0],
                act = !x ? popUp.GetTag() : (x.attributes ? x : document.getElementById(x))

            e.aO5popup = true
            e.cancelBubble = true

            ShowWin(tag, act, e.type)
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
    // const pard = window.location.search.match(/(\&|\?|\s)is(-|_)debug\s*(\s|$|\?|#|&|=\s*\d*)/)

    // только в автономном режиме ? с ключом o5auto ?    
    let C = {                // заменитель библиотечного
        consts: {
            o5debug: o5debug// (pard ? (pard[0].match(/=/) ? parseInt(pard[0].match(/\s*\d+/) || 1) : 1) : 2)
        },
        ConsoleError: (msg, name, errs) => {
            const txt = `ОШИБКА:: ` + msg + (name ? '  >' + name + '<' : '')
            if (errs && errs.length > 0) {
                console.groupCollapsed(txt)
                console.table(errs)
                console.trace("трассировка вызовов :")
                console.groupEnd()
            } else
                console.error(txt)
        },
        // MakeObjName: tag => tag.nodeName + '.' + tag.id + '.' + tag.className,        
        MakeObjName: obj =>
            (obj.id && obj.id.length > 0) ? ('#' + obj.id) : (
                ('[' + obj.tagName ? obj.tagName : (obj.nodeName ? obj.nodeName : '?') + ']') +
                '.' + (obj.className ? obj.className : '?')),
        GetTagsByQuery: query => document.querySelectorAll(query), // второй аргумент - игнорится
        // GetTagById: id => document.getElementById(id)
    }
    // if (o5debug > 1) console.log('}---> читаю `o5pop.js`')

    const repQuotes = /^\s*['"`]?\s*|\s*['"`]?\s*$/g, // /^['"`\s()]+|['"`\s()]+$/g,
        defid = 'defid',
        click = 'click',
        o5popup = 'o5popup',
        onclick = 'on' + click,
        aclicks = ['click', 'keyup', 'keydown', 'keypress']

    const wopens = [], // window.olga5.PopUpwopens // массив открытых окон
        W = {
            modul: 'o5pop',
            Init: Popups,
            class: 'olga5_popup',
            consts: `		
                o5nocss=0;  // 0 - подключаются CSS'ы
                o5noclick=0
                o5timer=0.7 // интервал мигания ;
                o5params=''  // умалчиваемые для mos, sizs, wins
			`,
        },
        dflt = {
            moes: { text: '', defid: '', group: '', head: '', },
            sizs: { width: 588, height: 345, top: 11, left: -22, },
            wins: {
                alwaysRaised: 1, alwaysOnTop: 1, menubar: 0, toolbar: 0, status: 0, resizable: 1, scrollbars: 0,
                innerwidth: '', innerheight: '', screenx: '', screeny: ''
            },
        },
        attrs = document.currentScript.attributes,
        timerms = 1000 * ((attrs && attrs.o5timer) ? parseFloat(attrs.o5timer.value) : 2.1),
        cls_Act = W.class + '_Act',
        cls_PopUp = W.class + '_PopUp',
        cls_errArg = W.class + '_errArg',
        namo5css = W.class + '_internal',
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
        SetTagError = (tag, txt, add) => {  // добавление и протоколирование НОВЫХ ошибок для тегов
            const err = '? ' + txt + (add ? ' (' + add + ')' : ''),
                isnew = tag.title.indexOf(err) < 0,
                first = tag.title.trim().indexOf('?') != 0

            if (first) tag.title = err
            else if (isnew) tag.title = tag.title + '; ' + err

            if (isnew) C.ConsoleError(`Для тега '${C.MakeObjName(tag)}' ${txt}: `, add || '')
            tag.classList.add(cls_errArg)
        },
        CloseAddPop = e => {
            const act = e.currentTarget,
                wopen = act.aO5pop_wopen
            if (o5debug > 1) console.log(`${W.modul}: CloseAddPop`.padEnd(22) +
                `${C.MakeObjName(act)}`.padEnd(22))
            ClosePop(wopen)
        },
        ClosePop = wopen => {
            if (o5debug > 1) console.log(`${W.modul}: ClosePop`.padEnd(22) +
                `${wopen.name}`.padEnd(22))
            if (wopen.time + 444 > (new Date()).getTime()) return
            const pop = wopen.pop


            if (pop.act != pop.tag) {
                delete pop.act.aO5pop_wopen
                pop.act.removeEventListener(click, CloseAddPop)
            }

            const tg = pop.act || pop.tag
            if (wopen.text)
                tg[tg.value ? 'value' : 'innerHTML'] = wopen.text
            tg.classList.remove(cls_Act)

            if (wopen.win.window && !wopen.win.window.closed) {
                wopen.win.close()
            }

            const i = wopens.indexOf(wopen)
            if (i > -1) {
                wopens.splice(i, 1)
                if (wopens.length == 0) {
                    window.clearInterval(wopens.tBlink)
                    wopens.tBlink = 0
                }
            }
        },
        DoBlinks = isnew => {
            for (const wopen of wopens) {
                if (!isnew && (!wopen.win.window || wopen.win.window.closed)) // окно 'само' закрылось
                    ClosePop(wopen)
                else
                    if (!wopen.noact && wopen.head !== '') {
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
                    }
            }
            if (wopens.length > 0)
                wopens.tBlink = window.setTimeout(DoBlinks, timerms)
        },
        AddMissing = (ppars, ipars) => {
            for (const ipar in ipars)
                if (typeof ppars[ipar] === 'undefined') ppars[ipar] = ipars[ipar]
        },
        CalcOpts = (pop, str) => {
            const ss = (str || '').replace(repQuotes, '').split(/[,;]/)

            ss.forEach(s => {
                const uu = s.split(/=|:/)
                let nam = uu[0].trim().toLowerCase()
                if (uu[1] && nam.length == 1) {
                    if (nam == 'w') nam = 'width'
                    if (nam == 'h') nam = 'height'
                    if (nam == 't') nam = 'top'
                    if (nam == 'l') nam = 'left'
                }

                if (nam)
                    if (typeof uu[1] !== 'undefined') {
                        const val = uu[1].replace(repQuotes, '')

                        if (dflt.moes.hasOwnProperty(nam)) pop.moes[nam] = val
                        else if (dflt.sizs.hasOwnProperty(nam)) pop.sizs[nam] = val // тут не надо parseInt из-за возм. '%'
                        else if (dflt.wins.hasOwnProperty(nam)) pop.wins[nam] = parseInt(val)
                        else
                            errs.push(`неопределённый параметр '${nam}' для события '${event}'`)
                    }
                    else
                        if (!pop.moes[defid]) pop.moes[defid] = nam
                        else
                            errs.push(`лишний параметр '${nam}' с 'пустым' знфчением для события '${event}'`)
            })
            // if (typeof dflt.moes.css !== 'undefined') pop.moes.css = true
        },
        ConvToValue = (nam, u) => {
            const percentMatch = /\d\s*%\s*$/,
                val = parseFloat(u)
            if (val !== u && u.match(percentMatch))  // тут д.б. именно '!=='
                return val * 0.01 * window.screen[['left', 'width'].includes(nam) ? 'width' : 'height']
            else
                return val
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
                    console.error(`>>  ИНЗМЕНЕНИЕ CSS   ${W.class} (для модуля ${W.modul}) `)
            css.innerHTML = o5css.replace(/(\/\/.*($|\n))|(\s*($|\n))/g, '\n')
        },
        CorrectDefaults = (parms) => {
            const ss = parms ? parms.replace(repQuotes, '').split(/[,;]/) : []
            ss.forEach(s => {
                const uu = s.split(/=|:/),
                    nam = uu[0].trim().toLowerCase(),
                    u = uu[1] ? uu[1].trim() : ''
                if (u) {
                    if (typeof dflt.moes[nam] != 'undefined') dflt.moes[nam] = u
                    else if (typeof dflt.sizs[nam] != 'undefined') dflt.sizs[nam] = ConvToValue(nam, u)
                    else if (typeof dflt.wins[nam] != 'undefined') dflt.wins[nam] = parseInt(u)
                    else
                        C.ConsoleError(`неопределённый параметр окна '${nam}' у сриптового атрибута 'o5params'`)
                }
            })
        },
        remo5 = {
            removed: false,
            Rem: (tag, nam) => {
                const ap = tag.getAttribute(nam)
                if (ap) {
                    const ac = tag.getAttribute(onclick)
                    if (ac) C.ConsoleError(`у тега ${C.MakeObjName(tag)} одновременно атрибуты: ${onclick} и ${o5popup}`)
                    else { // если есть OnClick то o5popup игнорируется
                        const i = ap.indexOf(';'),
                            url = i < 0 ? '' : ap.substring(0, i).replace(repQuotes, ''),
                            str = i < 0 ? ap : ap.substring(i + 1),
                            ss = str.split(/[,;]/)
                        let pars = ''

                        ss.forEach(s => {
                            const uu = s.split(/=|:/),
                                nam = uu[0].trim().toLowerCase(),
                                u = uu.length == 1 ? '' : (':' + uu[1].replace(repQuotes, ''))

                            pars += (pars.length > 0 ? ',' : '') + nam + u
                        })

                        tag.setAttribute(onclick, `${o5callp}(this, '${url}', '${pars.trim()}')`) // это меняю на потом
                        if (i >= 0)
                            tag.classList.add(cls_PopUp)
                        if (url && (nam == 'o5popup') && !tag.classList.contains(W.class))
                            tag.classList.add(W.class)
                    }
                    tag.removeAttribute(nam)
                    return true
                }
            },
            RemAll: (e, doremove) => {
                let n = 0
                if (!remo5.removed || doremove) {
                    for (const nam of ['o5popup', 'o5popupC', 'o5popupc']) {
                        const tags = C.GetTagsByQuery('[' + nam + ']')
                        for (const tag of tags)
                            if (remo5.Rem(tag, nam)) n++
                    }
                    if (n && o5debug > 0)
                        console.log(`${W.modul} для '${e.type}': все ${n} атрибутов o5popup(C) заменеы вызовами PopUp`)
                }
                remo5.removed = true
                return n
            }
        },
        focusAll = {
            tFocus: 0,
            F: wopen => {
                if (o5debug > 1)
                    console.log(`${W.modul}: DoFocus ${wopen.name} (${wopen.win.aO5pop ? wopen.win.aO5pop.name : 'недоступно'})`)
                wopen.win.focus()
            },
            DoFocus: () => {
                let i = 0
                for (const wopen of wopens)
                    if (wopen.win)
                        // window.setTimeout(focusAll.F, 44 + ++i * 22, wopen) // wopen.win.window.focus
                        wopen.win.focus()
            },
            Focus: (e) => {
                if (focusAll.tFocus) {
                    window.clearInterval(focusAll.tFocus)
                    focusAll.tFocus = 0
                }
                if (wopens.length > 0) {
                    // e.cancelBubble = true
                    focusAll.tFocus = window.setTimeout(focusAll.DoFocus, 33)
                    if (o5debug > 1)
                        console.log(`${W.modul}: Focus для ${wopens.length} тегов (${e.eventPhase}, ${e.isTrusted ? 'T' : 'f'}, ${e.timeStamp}, ${e.type})`)
                    // focusAll.DoFocus(e)
                }
            }
        },
        ClosePops = par => {
            const isall = par === null,
                tag = (par instanceof Object) ? par : null,
                grp = (!isall && !tag) ? ('' + par) : null
            let n = 0
            wopens.forEach(wopen => {
                if (isall || (tag && wopen.pop.tag == tag) || (grp != null && wopen.pop.moes.group == grp)) {
                    ClosePop(wopen)
                    n++
                }
            })
        },
        DocClickCapt = e => {
            if (o5debug > 1) console.log(`${W.modul}: DocClick`.padEnd(22) +
                `${C.MakeObjName(e.target)}`.padEnd(22) +
                `${e.type} ${e.eventPhase}=${phases[e.eventPhase]}` +
                ` ${e.timeStamp}`)
            let tag = e.target     //  всплытие окна на первом  'o5popup'  при 'click' всплытие будет по PopUp
            do {
                const wopen = wopens.find(wopen => wopen.pop.tag == tag)
                if (wopen) {
                    ClosePop(wopen)
                    e.cancelBubble = true
                    return
                }
                // if (tag.getAttribute(onclick)) {
                //     pop = tag
                //     break
                // }
                tag = tag.parentElement
            } while (tag && tag.nodeName &&
                !['body', 'html', '#document'].includes(tag.nodeName.toLowerCase()))


            // было при инициализации          remo5.RemAll({ type: 'DocumentClick' }) // выполнилоась замена на 'onClick'    
            /*
            группа - чтобы при открытии окна закрывать другие с такой же группой
                    а при закрытии - не используетсся!
            Если при клике ничего не закрылось, то закрываем анонимные        
            */
            // let n = ClosePops(tag)

            //             const wopen=wopens.find(wopen => wopen.pop.tag == tag &&
            //                 (!wopen.pop.moes.group || wopen.pop.moes.group != 0)  // как-то нелогично  ??????????????????????????????????
            //             )
            //             if(wopen)    {
            //                             ClosePops(wopen.pop.moes.group)
            //                 closedTag = tag
            // }

            if (ClosePops(0))    // закрыть анонимные 
                e.cancelBubble = true
            // при 'pop' это  'cancelBubble' будет сделано в обработчике PopUp  ???

        }

    function ShowWin(tag, act, eve) {
        if (o5debug > 1) console.log(`${W.modul}: ShowWin`.padEnd(22) +
            `${C.MakeObjName(tag)}`.padEnd(22) +
            `${C.MakeObjName(act)}, '${eve}') `)

        const errs = [],
            tags = [],
            CalcAllEves = (tg) => {
                if (o5debug > 1) console.log(`${W.modul}: CalcAllEves`.padEnd(22) +
                    `${C.MakeObjName(tg)}`.padEnd(22) +
                    ` ${tg.aO5pop ? 'повт.' : 'определение-Eve'}`)
                if (tags.includes(tg)) {
                    let s = ''
                    tags.forEach(t => s += t.aO5pop.name + '-> ')
                    C.ConsoleError(`Циклические ссылки на тег: ${s}`)
                    return
                }
                tags.push(tg)

                if (tg.aO5pop)
                    return tg.aO5pop

                tg.aO5pop = { name: C.MakeObjName(tg), tag: tg, pops: {} }
                Object.freeze(tg.aO5pop)

                const aO5 = tg.aO5pop
                for (const attr of tg.attributes) {
                    const name = attr.name.toLowerCase()
                    if (!(name.match(/on\w+/i) && attr.value.match(/window\.olga5\.Pop(Up|Show|Work)\s*\(/i)))
                        continue

                    const ev = name.substring(2)
                    if (!ev || tg.aO5pop[ev]) continue

                    const
                        s = attr.value.replace(/^.*\bPopUp\s*\(\s*|\)$/ig, ''),
                        ss = s.split(/[,;]\s*[`'"]/),
                        n = ss.length,
                        url = ((n < 3 ? ss[0] : ss[1]) || '').replace(repQuotes, ''),
                        pars = n < 2 ? '' : ((n < 3 ? ss[1] : ss[2]) || '').replace(repQuotes, ''),
                        pop = {
                            tag: null,   // должно определяться при вызове
                            act: null,   // -"-
                            eve: ev,
                            url: url,  // м.б. изменится после декодирования
                            pars: '',
                            key: aO5.name + '(' + ev + ')',  // наименование окна
                            moes: {}, sizs: {}, wins: {}, s: '', wopen: null, fixed: false,
                        }
                    Object.seal(pop)
                    if (n != 3)
                        console.log()

                    CalcOpts(pop, pars)

                    for (const moe in pop.moes) {
                        const id = moe == defid ? pop.moes[defid].toLowerCase() : ''
                        if (id && !dflt.moes[id]) {   //  && !['head', 'text', 'group', 'defid'].includes(id)
                            const ref = document.getElementById(id)
                            if (ref) {
                                CalcAllEves(ref)
                                tags.pop()
                                const iO5 = ref.aO5pop
                                for (const ive in iO5.pops) { // собираем недостающее со всех событий
                                    const iop = iO5.pops[ive]
                                    for (const nam in dflt)
                                        AddMissing(pop[nam], iop[nam])
                                }
                            }
                            else
                                errs.push(`для '${ev}' не найден ссылочный id='${id}'`)
                        }
                    }
                    if (!aO5.pops[ev]) aO5.pops[ev] = pop
                    else
                        C.ConsoleError(`Дубль события '${ev}' у тега '${aO5.name}' (оставил первое)`)
                }
                return aO5
            },
            FillParams = (pop) => {
                const screen = window.screen
                let s = ''
                for (const nam in pop.sizs) {
                    let val = ConvToValue(nam, pop.sizs[nam])
                    if (val > -1) {
                        if (nam == 'left') val = screen.availLeft + val
                        else if (nam == 'top') val = screen.availTop + val
                    }
                    else
                        if (nam == 'left') val = screen.availLeft + val + screen.availWidth - pop.sizs.width - 4
                        else if (nam == 'top') val = screen.availTop + val + screen.availHeight - pop.sizs.height - 4
                        else val = -val

                    s += nam + '=' + val + ','
                }
                pop.pars = s + pop.s
            },
            ShowTestRez = () => {
                const tags = C.GetTagsByQuery("*[id]", W.modul)
                tags.forEach(tag => {
                    const xO5 = tag.aO5pop
                    if (xO5 && xO5.newtst) {
                        xO5.newtst = false

                        for (const eve in xO5.pops) {
                            console.log(''.padEnd(6) + ' tag=' + xO5.name + ' eve=' + eve)
                            const pop = xO5.pops[eve]
                            for (const nam in dflt) {
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
            },
            IsUrlNam = u => { return !!(u.trim() && !u.match(/[\/.\\#]/)) }, // копия из CEncode.js
            aO5 = CalcAllEves(tag),
            pop = aO5.pops[eve],
            CloseEvent = e => {
                //window.dispatchEvent(new CustomEvent('o5pop_closed', { detail: { modul: W.modul } }))
                if (window.opener)
                    window.opener.dispatchEvent(new CustomEvent('o5pop_closed', { detail: { modul: W.modul } }))
            }

        Object.assign(pop, { tag: tag, act: act })

        // if (aclicks.includes(eve)) {//   закрытие только последнего с данного тега
        //     let j = wopens.length
        //     while (j-- > 0) {
        //         const wopen = wopens[j]
        //         if (wopen.pop.tag == tag) {
        //             ClosePop(wopen)
        //             return
        //         }
        //     }
        // }
        const wopen = wopens.find(wopen => wopen.pop.tag == tag && wopen.pop.eve == eve)
        if (wopen)
            if (!wopen.win.closed) { //   повтор активного события
                wopen.win.focus()
                return
            }
        ClosePops(pop.moes.group)

        if (!pop.url) { // параметры считаны - можне удалять обработчик!
            tag.removeAttribute('on' + eve)
            return
        }

        if (!pop.fixed) {
            pop.fixed = true
            for (const nam in dflt)
                AddMissing(pop[nam], dflt[nam])

            if (C.DeCodeUrl) {
                const o5attrs = tag ? C.GetAttrs(tag.attributes) : '',
                    ori = (pop.url || '').replace(repQuotes, ''),
                    url = IsUrlNam(ori) ? (document.URL + '?o5nomnu#' + ori) : ori,
                    wref = C.DeCodeUrl(W.urlrfs, url, o5attrs)

                if (wref.err)
                    errs.push(`Ошибка перекодирования url='${pop.url}':  ${wref.err}`)
                pop.url = wref.url
            }
        }

        pop.s = ''
        for (const win in pop.wins)
            if (pop.wins[win] !== '') pop.s += win + '=' + pop.wins[win] + ','

        if (errs.length > 0)
            SetTagError(tag, `Ошибки в декодировании опций`, errs)

        FillParams(pop)
        const win = window.open(pop.url, pop.key, pop.pars)
        if (win) {
            try {
                win.aO5pop = { name: aO5.name, aO5: aO5 }
                // win.onclose = e => {
                //     //window.dispatchEvent(new CustomEvent('o5pop_closed', { detail: { modul: W.modul } }))
                //     if (window.opener){
                //         window.opener.dispatchEvent(new CustomEvent('o5pop_closed', { detail: { modul: W.modul } }))

                //         window.opener.postMessage("message", "*");
                // }}

                if (o5debug > 1) {
                    win.document.onclose = function () {
                        alert(`win.document.onclose: FoFocus ${win.aO5pop.name}`)
                    }
                    win.onfocus = function () {
                        console.log(`win.onfocus: FoFocus ${win.aO5pop.name}`)
                    }
                    win.onresize = function () {
                        console.log(`win.onresize: FoFocus ${win.aO5pop.name}`)
                    }
                    win.onclose = function () {
                        alert(`win.onclose: FoFocus ${win.aO5pop.name}`)
                    }
                    win.onbeforeunload = function () {
                        this.opener.postMessage("message9", "*")
                        // window.console.log(`win.onbeforeunload: FoFocus ${win.aO5pop.name}`)
                    }
                    win.addEventListener('beforeunload', e=>{
                                    window.opener.postMessage("message91", "*")
                                    this.opener.postMessage("message92", "*")
                                    win.opener.postMessage("message93", "*")
                    })
                    win.onunload = function () {
                        this.opener.postMessage("message1", "http://localhost")
                        win.opener.postMessage("message2", "http://localhost")
                        window.postMessage("message3", "http://localhost")
                        win.postMessage("message4", "http://localhost")
                        window.console.log(`win.onunload: FoFocus ${win.aO5pop.name} url=${win.document.URL}`)
                    }
                }
            } catch (e) {
                console.error(`Параметры нового окна недостуны - иной домен!`)
            }
            pop.wopen = {
                pop: pop,
                win: win, head: pop.moes.head, text: '', titlD: '', titlB: '', noact: '', name: aO5.name,
                time: (new Date()).getTime()  // отстройка от "дребезжания"
            }
            const act = pop.act

            if (pop.moes.text) { // для анонимных - не менять текст
                pop.wopen.text = act.value ? act.value : act.innerHTML
                act[act.value ? 'value' : 'innerHTML'] = pop.moes.text
            }

            // focusAll.Focus()
            wopens.push(pop.wopen)

            if (act != tag) {  // теперь закрытие м.б. по обоим тегам
                act.aO5pop_wopen = pop.wopen
                act.addEventListener(click, CloseAddPop)
            }
            if (timerms > 99 && (tag.classList.contains(W.class) || tag.classList.contains(cls_PopUp))) {
                act.classList.add(cls_Act)
                if (wopens.tBlink)
                    window.clearInterval(wopens.tBlink)
                DoBlinks(true)
            }
        }
        else
            if (!aclicks.includes(eve))
                SetTagError(tag, `Ошибка создания окна по событию ${eve}`, `вероятно следует снять запрет на всплытие окон в браузере`)

        if (o5debug > 1) ShowTestRez()
    }

    const nocss = attrs && attrs.o5nocss && attrs.o5nocss.value,
        SetEvents = Fun => {
            // было при инициализации
            // for (const eve of ['click', 'focus', 'resize', 'scroll'])
            //     Fun(eve, remo5.RemAll, { once: true })

            Fun('click', DocClickCapt, { capture: true, once: false })
            Fun('visibilitychange', e => {
                let j = wopens.length
                if (o5debug > 1)
                    console.log(`${W.modul}: закрыть ${j} окон по ${e ? 'event=' + e.type : 'команда от IniSrips'}`)
                if (j > 0)
                    ClosePops(null)
            }, { capture: false })

            for (const eve of ['selectstart', 'focus', 'resize', 'scroll'])
                Fun(eve, focusAll.Focus)
        }

    function Popups(c) {
        const timera = '                                                                <   инициирован ' + W.modul
        console.log(` __________________________________________\n   начало  иниц.:   ${W.modul}`)

        SetEvents(document.removeEventListener)
        SetEvents(document.addEventListener)

        if (attrs.o5noclick && attrs.o5noclick.value && attrs.o5noclick.value != 0) // не закрывть окно
            document.addEventListener('click', e => { e.cancelBubble = true }, { capture: false, once: false })

        window.addEventListener('o5pop_closed', e => {
            e.cancelBubble = true
        })
        window.addEventListener("message", function (event) {
            console.log("received: " + event.data)
        }, false );


        if (c) {
            C = c
            console.time(timera)
            if (nocss || GetCSS()) c.ParamsFill(W)             // CSS сохранилось после автономного создания
            else                            // иначе - никак, т.к. не известно, кто раньше загрузится
                c.ParamsFill(W, o5css)      // CSS пересоздаётся (для Blogger'а)
        }
        o5debug = C.consts.o5debug

        remo5.RemAll({ type: 'Popups(c)' }, true)  // всегда делать при инициализации

        console.timeEnd(timera)
        window.dispatchEvent(new CustomEvent('olga5_sinit', { detail: { modul: W.modul } }))
    }

    if (!nocss)  // т.е. если явно НЕ запрещено    
        IncludeCSS()

    if (attrs && attrs.o5params)
        CorrectDefaults(attrs.o5params.value.trim())

    SetEvents(document.addEventListener)

    window.addEventListener("message", function (event) {
        console.log("received2: " + event.data)
    }, false );

    if (!window.olga5.find(w => w.modul == W.modul)) {
        window.olga5.push(W)
        console.log(`}---< ${document.currentScript.src.indexOf(`/${W.modul}.`) > 0 ? 'загружен  ' : 'включён   '}:  ${W.modul}.js`)
        window.dispatchEvent(new CustomEvent('olga5_sload', { detail: { modul: W.modul } }))
    } else
        console.error(`Повтор загрузки '${W.modul}`)
    // -------------- o5pop
})();
