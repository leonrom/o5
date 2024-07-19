/* -global window, document, console */
/*jshint asi:true  */
/*jshint strict:true  */
/*jshint esversion: 6 */
(function () {              // ---------------------------------------------- o5shp/DoInit ---
    "use strict"
    // let debugids = []  // 'shp_text' // 'shp_1÷4' // 'shp-demo' // 'shp_text'        

    const
        olga5_modul = "o5shp",
        modulname = 'DoInit',
        C = window.olga5.C,
        o5debug = C.consts.o5debug,
        Finish = () => {
            const hash = C.save.hash
            if (hash) { // делать именно когда загружен документ (например - тут)
                const tag = document.getElementById(hash)
                if (tag) tag.scrollIntoView({ alignToTop: true, block: 'start', behavior: "auto" })
                else
                    C.ConsoleError(`Неопределён hash= '${hash}' в адресной строке`)
            }
        },
        DbgDoResize = e => { // для отладки  !!!!!!!!!!!!!!!!!!
            if (e.timeStamp > wshp.etimeStamp + 0.1)
                if (!e.target.classList.contains(wshp.W.class))
                    wshp.DoResize('из DbgDoResize ')
            wshp.etimeStamp = e.timeStamp
        },
        DoScroll = e => {
            const pO5 = (e.target == document ? document.body : e.target).pO5
            if (pO5) {
                if (wshp.W.consts.o5debug > 2)
                    console.log(e)
                const aO5s = (pO5.owns.own ? pO5.owns.own : wshp).aO5s

                // document.removeEventListener('scroll', DoScroll, true)

                wshp.DoScroll(aO5s, e.timeStamp)

                // document.addEventListener('scroll', DoScroll, true)
            }
        },
        DecodeType = (quals) => {
            const cls = {
                level: 0, kill: false, remo: false, pitch: 'S', alive: false,
                dirV: 'U', putV: 'T', none: false, cartopacity: 1,
            }
            const errs = []
            for (const qual of quals) {
                const tt = qual.replaceAll(/-/g, '=').split('='),
                    c = tt[0].substr(0, 1).toUpperCase()

                if (c != '' && !isNaN(c)) cls.level = Number(c)
                else if (c === 'N') cls.none = true
                else if (c === 'K') cls.kill = true
                else if (c === 'R') cls.remo = true
                else if (c === 'C') cls.pitch = 'C' // сжимает предыдущий
                else if (c === 'P') cls.pitch = 'P' // сталкивает предыдущий
                else if (c === 'S') cls.pitch = 'S' // сдвигает предыдущий
                else if (c === 'O') cls.pitch = 'O' // наезжает на предыдущий
                else if (c === 'A') cls.alive = true
                else if (c === 'D' || c === 'U') cls.dirV = c
                else if (c === 'B' || c === 'T') cls.putV = c
                else errs.push(`'${c}'`)
            }
            // if (cls.kill) cls.remo = false
            // if (!cls.dirV && !cls.kill && !cls.remo) cls.dirV = 'U'

            Object.freeze(cls)
            return { cls: cls, err: errs.length ? (`неопр. коды: ` + errs.join(', ')) : '' }
        },
        ClearO5s = (aO5s) => { // рекурсия
            if (aO5s && aO5s.length > 0) {
                for (const aO5 of aO5s)
                    ClearO5s(aO5.aO5s)
                aO5s.splice(0, aO5s.length)
            }
        },
        SetLevelsAll = (aO5s) => { // сортировки и формирование
            let aO5str = ''
            const
                SetLevels = (aO5s, nest) => {
                    if (typeof wshp.nests[nest] === 'undefined') wshp.nests[nest] = []
                    if (o5debug > 2) console.log('  >> SetLevels (' + nest + '): aO5s=' + C.MyJoinO5s(aO5s));
                    for (const aO5 of aO5s) {
                        aO5.cls.nest = nest // только для показа в тестах
                        wshp.nests[nest].push(aO5)
                    }
                    aO5s.nest = nest
                    const       //slevel = ''.padEnd(nest * 4),
                        pr1 = '[(<\\',
                        pr2 = '])>/'
                    aO5str += (nest > 3 ? '|' : pr1[nest]) + nest + ' '
                    for (const aO5 of aO5s) {
                        aO5str += aO5.name + (aO5.aO5s.length > 0 ? ':' : ' ')
                        if (aO5.aO5s.length > 0) SetLevels(aO5.aO5s, nest + 1)
                    }
                    aO5str += (nest > 3 ? '|' : pr2[nest]) + ' '
                }

            SetLevels(aO5s, 0)

            if (o5debug > 1)
                console.log(" >> SetLevelsAll " + ('' + Date.now()).substr(-6) + ", вложенности объектов: \n\t  " + aO5str)
            return aO5str
        },
        ReadAttrsAll = (aO5s) => {
            let Error = C.ConsoleError

            const errs = []
            const
                atribs = [
                    { atr: 'olga5_frames', cod: 'hovered', def: 's' },
                    { atr: 'olga5_owners', cod: 'located', def: 'b' }],
                AddNew = (asks, ask) => {
                    const a = Object.assign({}, ask);
                    Object.seal(a);
                    asks.push(a);
                },
                ReadAttrs = (aO5s, atrib) => {
                    // if (o5debug > 1) console.log('  >> ReadAttrs (' + atrib.cod + ') для объектов [' + C.MyJoinO5s(aO5s) + ']');
                    let prevN = '' // значене этого атрибута у предыдущего тега
                    const typs = 'CINSB'

                    for (const aO5 of aO5s) { // определение вложенностей shp's друг в друга
                        const shp = aO5.shp,
                            atrX = shp.getAttribute(atrib.atr),
                            atrN = atrX || (shp.attributes.olga5_repeat ? prevN : ''),
                            attr = atrN.length > 0 ? atrN : atrib.def,
                            code = atrib.cod

                        if (atrN) prevN = atrN

                        const
                            blng = aO5[code],
                            ss = attr ? attr.split(/[,;]/g) : ['']

                        blng.asks.splice(0, blng.asks.length)
                        blng.attr = attr

                        let i = ss.length
                        while (--i >= 0) {
                            const s = ss[i].trim()
                            if (s.length > 0) {
                                const
                                    cc = s.split(':'),
                                    u = cc[0].trim(),
                                    t = u.length > 0 ? u[0].toUpperCase() : '?'
                                if (typs.includes(t)) {
                                    const cod = cc.length > 1 ? cc[1].trim() : '',
                                        num = cc.length > 2 ? C.C.MyRound(cc[2]) : 1,
                                        fix = cc.length > 2 ? cc[2].toUpperCase() == 'F' : false

                                    AddNew(blng.asks, { typ: t, cod: cod, num: num, nY: num, ok: false, fix: fix, bords: [] })
                                }
                                else
                                    errs.push({ name: aO5.name, str: s, err: "тип ссылки не начинается одним из '" + typs + "'" })
                            }
                        }

                        if (aO5[atrib.cod].asks.length === 0) {
                            AddNew(aO5[atrib.cod].asks, { typ: atrib.def.toUpperCase(), cod: '', num: 1, nY: 1, ok: false, fix: false, bords: [] })
                            errs.push({ name: aO5.name, str: attr, err: "нету [id, класс, тип, к-во]" })
                            Error = C.ConsoleAlert
                        }

                        if (aO5.aO5s.length > 0)
                            ReadAttrs(aO5.aO5s, atrib)
                    }
                }

            for (const atrib of atribs) {
                ReadAttrs(aO5s, atrib)
            }
            if (errs.length > 0)
                Error("Ошибки в атрибутах  для тегов", errs.length, errs)
        },
        SortAll = (aO5s, zIndex) => { // сортировка и индексация
            const nest = aO5s.nest

            if (o5debug > 2)
                console.log('  >> яSortAll (' + nest + '): aO5s=' + C.MyJoinO5s(aO5s))

            for (const aO5 of aO5s) {
                const b = aO5.shdw.getBoundingClientRect()
                Object.assign(aO5.posW, { top: b.top, left: b.left })
            }
            aO5s.sort((a1, a2) => { // для вызовов (для работы)
                const i1 = Math.round(parseFloat(a1.posW.top)),
                    i2 = Math.round(parseFloat(a2.posW.top))
                return (i1 != i2) ? (i1 - i2) : (a1.cls.level - a2.cls.level)
            })

            // let z = zIndex
            for (const aO5 of aO5s) {
                Object.assign(aO5.cls, { zIndex: ++zIndex, aO5o: aO5s })
                // aO5.cls.aO5o= aO5s
                // aO5.cls.zIndex = zIndex
                for (const aO5 of aO5s)
                    if (aO5.aO5s.length > 0)
                        SortAll(aO5.aO5s, zIndex)
            }

        }

    const
        wshp = C.ModulAddSub(olga5_modul, modulname, () => {
            const       // timeInit = Date.now() + Math.random(),
                mtags = C.SelectByClassName(wshp.W.class, olga5_modul),
                errs = []

            wshp.aO5str = ''
            ClearO5s(wshp.aO5s)

            for (const mtag of mtags) {
                const dt = DecodeType(mtag.quals),
                    shp = mtag.tag

                if (dt.err) errs.push({ shp: C.MakeObjName(shp), className: mtag.origcls, err: dt.err })

                if (!dt.cls.none && !mtag.tag.classList.contains('olga5_shp_none')) {
                    const aO5 = wshp.AO5shp(shp, dt.cls),
                        pO5 = wshp.PO5shp(aO5)

                    if (pO5)
                        (pO5.owns.own || wshp).aO5s.push(aO5)
                }
            }

            if (errs.length > 0) C.ConsoleError("Ошибки классов подвисабельных объектов", errs.length, errs)

            wshp.aO5str = SetLevelsAll(wshp.aO5s)

            if (o5debug > 0) {
                const sels = []

                for (const mtag of mtags)
                    sels.push({ name: C.MakeObjName(mtag.tag), origcls: mtag.origcls, class: mtag.tag.className, quals: mtag.quals.join(', '), })

                if (sels.length > 0) C.ConsoleInfo(`o5shp: найдены селекторы:`, sels.length, sels)

                for (const start of C.page.starts)
                    start.addEventListener('click', DbgDoResize)
            }

            if (wshp.aO5s.length > 0) {

                ReadAttrsAll(wshp.aO5s)
                SortAll(wshp.aO5s, 10000 + (wshp.aO5s.nest + 1) * 100)
                wshp.DoResize('из DoInit')

                C.E.AddEventListener('resize', wshp.DoResize)
                document.addEventListener('scroll', DoScroll, true)
            }

            Finish()

            errs.splice(0, errs.length)
            mtags.splice(0, mtags.length)
        })

    Object.assign(wshp, {
        name: 'страница',
        aO5s: [],
        nests: [],
        wasResize: false,
        aO5str: '', // строка рез. вложенности (для демок  и отладки)
        etimeStamp: 0,
    })
})();

