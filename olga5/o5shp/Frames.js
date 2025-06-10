/* global window, document, console, IntersectionObserver */
/*jshint asi:true  */
/*jshint strict:true  */
/*jshint esversion: 6 */
//!
(function () {              // ---------------------------------------------- o5shp/Frames ---
    "use strict"

    let wshp;
    const
        olga5_modul = "o5shp",
        modulname = 'Frames',
        C = window.olga5.C,
        // o5debug = C.consts.o5debug,
        mdiglit = /[a-zA-Z]+|[+-]*\d+/g,
        msmall = /^[a-z]/,
        errs = [],
        frames = new Map(),
        f0 = {
            typ: 'n', cod: '', num: 0, cut: true, fix: true, s: 'умолчание?',
            err: `${(quals && quals.length > 0) ? 'не найдены ' : 'не заданы '} фреймы: взяты ближйший с скроллингом`
        }
    // fmtOK = "background: cornsilk; color: black;",
    // fmtErr = "background: yellow; color: black;",   

    /**
     * Представление одного "фрейма" с параметрами подвеса.
     */
    class Frame {
        key = ''        // чтобы видеть первым
        constructor(frame) {
            Object.assign(this, frame, {
                aO5s: [], // кто его использует
                act: {
                    pO5: null,
                    xO5: null,
                    time: -1,
                    err:'',
                    n: 0,
                },
                c: frame.cod.toUpperCase(),
                clss: (frame.typ === 'c') ? frame.cod.split(/\s*[.]\s*/) : ''
            })
            this.nears = { frame: this, } // чтобы печатать в отладке

            const
                names = ['fix', 'cut', 'out'],
                n0 = { v: NaN, p: null },
                xs = 'TLRB'

            for (const name of names) {
                const near = this.nears[name] = {}
                for (const x of xs) {
                    near[x] = Object.assign({}, n0)
                    Object.seal(near[x])  // seal
                }
                Object.freeze(this.nears[name])
            }
            Object.freeze(this.nears)

            Object.seal(this.act)
            Object.freeze(this)
        }
        static Key(f) {
            return f.typ + ',' + f.cod + ',' + f.num;
        }
    }

    /**
     * Читает и парсит квалификаторы класса (вида `AL2TR`) в объект aO5.cls
     * 
     * @param {Object} aO5 - объект-приёмник (должен иметь `cls`)
     * @param {string[]} quals - массив строк-квалификаторов
     */
    ReadCls = (aO5, quals) => {
        const cls = aO5.cls
        let setdef = true
        Object.assign(cls, {           // для повторной инициализации (напр. в тестах)
            level: 0,
            pitch: '',
            none: false,
            alive: false,
            puts: { T: '', L: '', R: '', B: '', },
        })

        let typ = 'i'
        for (const qual of quals)
            if (!qual.match(msmall)) {  // с больших букв начинаются зарактеристики подвисабельного объекта
                const qls = qual.match(mdiglit)
                if (qls)
                    for (const ql of qls) {
                        if (ql.trim() === '')
                            continue

                        setdef = false;
                        if (!isNaN(ql))
                            cls.level = Number(ql)
                        else
                            for (let i = 0; i < ql.length; i++) {
                                const c = ql[i].toUpperCase()
                                switch (c) {
                                    case 'A': cls.alive = true; break
                                    case 'C':                       // сжимает предыдущий
                                    case 'P':                       // сталкивает предыдущий
                                    case 'S':                       // сдвигает предыдущий
                                    case 'O': cls.pitch = c; break  // наезжает на предыдущий
                                    case 'T':
                                    case 'L':
                                    case 'R':
                                    case 'B': cls.puts[c] = c; break
                                    case 'N': cls.nofx = true; break    // не подвисает, но может сдвигать остальные
                                    default: errs.push(`не определён квалиф. '${ql[i]}' в строке "${qual}"`)
                                }
                            }
                    }
            }

        if (setdef) {
            cls.pitch = 'S'
            cls.puts.T = 'T'
        }
        else if (!(cls.pitch || '').trim())
            cls.pitch = 'S'
    },

        /** 
         * нахождение тегов-контейнеров для тех frame, у которых неопределён tag            
         * и сортировка их по удалённости от aO5
        */
        StoreToBase = aO5 => {
            const
                pbase = aO5.base.pbase,
                IsInClass = (pO5, clss) => {
                    const classOrigs = pO5.classOrigs
                    if (classOrigs.length > 0) {
                        for (const cls of clss)
                            if (cls && classOrigs.indexOf(cls) >= 0)
                                return true
                    }
                    else {
                        if (clss.length === 0 || clss.find(cls => cls.trim().length == 0) != null)
                            return true
                    }
                }

            // удаляю старое использование
            for (const [key, f] of frames) {
                const i = f.aO5s.indexOf(aO5)
                if (i >= 0) {
                    f.aO5s.splice(i, 1)
                    if (s.aO5s.length === 0)
                        frames.delete(key)
                }
            }

            // добавляю новый фрейм в базу
            aO5.frames.clear()

            for (const [key, f] of frames) {
                const 
                    frame = pbase.bframes.get(key) || wshp.PBase.AddFrame(new Frame(f))

                if (!frame) {

                    frame = new Frame(f)

                    let pO5c;
                    const
                        clss = frame.clss,
                        t = frame.typ,
                        c = frame.c

                    for (const pO5 of pbase.pO5.pOuts) {
                        pO5c = pO5
                        if (
                            (t === 's' && (pO5.actScroll.V || pO5.actScroll.H)) ||
                            (t === 'n' && pO5.tag.nodeName == c) ||
                            (t === 'i' && pO5.tag.id.toUpperCase() == c) ||
                            (t === 'c' && IsInClass(pO5, clss))
                        )
                            if (--frame.act.n > 0) frame.act.xO5 = pO5
                            else
                                frame.act.pO5 = pO5

                        if (frame.act.pO5 || pO5.final)
                            break
                    }

                    let err;
                    if (!frame.act.pO5) {
                        if (frame.act.xO5) {
                            frame.act.pO5 = frame.act.xO5
                            err = `взял ${frame.act.n}-й тег (вместо ${frame.num}) для фрейма "${frame.s}"`
                        }
                        else {
                            frame.act.pO5 = pO5c
                            err = `среди скроллиремых нет тега для фрейма "${frame.s}" - взял ${pO5c.name}`
                        }
                        errs.push(err)
                    }

                    if (o5debug)
                        console.log(`Определил (и добавил в bframes) фрейм "${frame.key} на ${frame.act.pO5.name}" ` +
                            (err ? `с ошибкой: ${err}` : ``))

                    if (errs.length)
                        C.ConsoleError(`Ошибки определения фреймов для ${aO5.a_name}:`, errs.length, errs)

                    pbase.bframes.set(key, frame)
                }

                frame.aO5s.push(aO5)
                aO5.frames.add(frame)
            }
        },
        MakeFrames = (aO5, squals) => {
            const
                quals = squals.split(':'),
                        typs = 'cins'

            for (const qual of quals)
                if (qual.match(msmall)) { // с маленькой буквы начинаются описания фреймов
                    const ss = qual.split(',')

                    for (const s of ss) {
                        if (!s) continue

                        const
                            cc = s.includes('=') ? s.split('=') : ['i', s],  // считаем, что это значение для id
                            typ = cc[0].trim().toLowerCase(),
                            uu = (cc[1] || '').split('/'),
                            f = {
                                cut: false, fix: false, num: 0, err: '', typ: typ,
                                cod: (uu[0] || '').trim(),
                                s: s
                            }

                        if (!typs.includes(typ))
                            errs.push({ name: aO5.a_name, qual: qual, err: `тип ссылки '${typ}' не начинается одним из '${typs}'` })
                        else
                            if (uu.length > 1) {    //  && !uu[1].trim()
                                for (let i = 1; i < uu.length; i++) {
                                    const pars = uu[i].match(mdiglit)
                                    if (pars)
                                        for (const par of pars) {
                                            const n = Number(par)
                                            if (Number.isInteger(n) && !isNaN(n)) {
                                                if (f.typ !== 'w')    // для 'window' номер игнорируется
                                                    f.num = n
                                            }
                                            else {
                                                if (par.indexOf('f') >= 0) f.fix = true
                                                if (par.indexOf('c') >= 0) f.cut = true
                                            }
                                        }
                                }

                                if (!f.fix || !f.cut) {
                                    let s = ``
                                    if (!f.fix) s = `не задан 'fix' (не подвисает); ` + (f.cut ? '.' : ', ')
                                    if (!f.cut) s += `не задан 'cut' (не обрезается).`
                                    Object.assign(f, { err: s, })
                                }
                            }
                            else
                                Object.assign(f, { cut: true, fix: true, err: `для ${s} по умолчанию вкл. 'fix' и 'cut'`, })

                        const
                            key = f.key = Frame.Key(f),
                            xf = frames.get(key)
                        if (xf) {
                            xf.fix ||= f.fix; xf.cut ||= f.cut; f.err = ''
                        }
                        else
                            frames.set(key, f)
                    }
                }

            if (frames.size === 0)
                frames.set(Frame.Key(f0), new Frame(f0))     //  pbase.bframes.values().next().value)            
        }

    const ReadAttrs = (aO5, quals) => {
        errs.splice()
        frames.clear()

        ReadCls(aO5, quals)
        MakeFrames(aO5, quals)
        StoreToBase(aO5)

        if (errs.length > 0) {
            const u = aO5.shp.quals ? `c квалиф. "${aO5.shp.quals.join(':')}"` : `(без квалификаторов)`
            C.ConsoleError(`Чтение frames '${aO5.a_name}' ${u} есть ошибки: `, errs.length, errs)
        }
    }

    wshp = C.AddModuleSub(olga5_modul, modulname, [ReadAttrs])
})();