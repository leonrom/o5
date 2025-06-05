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
        o5debug = C.consts.o5debug,
        mdiglit = /[a-zA-Z]+|[+-]*\d+/g,
        msmall = /^[a-z]/,
        errs = []
    // fmtOK = "background: cornsilk; color: black;",
    // fmtErr = "background: yellow; color: black;",   

    class Frame {
        key = ''        // чтобы видеть первым
        constructor(frame) {
            Object.assign(this, frame, {
                aO5s: [], // кто его использует
                act: {
                    pO5: null,
                    xO5: null,
                    time: -1,
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
    }

    const ReadCls = (aO5, quals) => {
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
        else if (!cls.pitch.trim())
            cls.pitch = 'S'
    }

    const ReadFrames = (aO5, quals) => {
        const
            frames = new Set(),
            pbase = aO5.act.pbase,
            Key = f => f.typ + ',' + f.cod + ',' + f.num

        if (pbase.bframes.size === 0) {   // для неуказанных фреймов                 
            const f0 = {
                typ: 'n',       // окно браузера
                cod: '',
                num: 0,
                cut: true,
                fix: true,
                s: 'умолчание?',
                err: `${(quals && quals.length > 0) ? 'не найдены ' : 'не заданы '} фреймы: взяты ближйший с скроллингом`
            }
            f0.key = Key(f0)
            pbase.bframes.add(new Frame(f0))
        }

        for (const qual of quals)
            if (qual.match(msmall)) { // с маленькой буквы начинаются описания фреймов
                const ss = qual.split(','),
                    typs = 'cins'

                for (let s of ss) {
                    if (s.length === 0) continue

                    if (!s.includes('=')) // считаем, что это значение для id
                        s = `i=${s}`

                    const cc = s.split('=')

                    const typ = cc[0].trim().toLowerCase()

                    if (!typs.includes(typ)) {
                        errs.push({ name: aO5.a_name, qual: qual, err: `тип ссылки '${typ}' не начинается одним из '${typs}'` })
                        continue
                    }

                    const
                        uu = (cc[1] || '').split('/'),
                        f = {
                            cut: false, fix: false, num: 0, err: '',
                            typ: typ,
                            cod: (uu[0] || '').trim(),
                            s: s,
                        }

                    if (uu.length > 1) {    //  && !uu[1].trim()
                        for (let i = 1; i < uu.length; i++) {
                            const pars = uu[i].match(mdiglit)
                            if (pars) {
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

                    const key = f.key = Key(f)
                    let xf;
                    for (const frame of frames)
                        if (frame.key === key) {
                            xf = frame
                            break
                        }

                    if (xf) {
                        if (f.fix) xf.fix = true
                        if (f.cut) xf.cut = true
                        f.err = ''
                    }
                    else
                        frames.push(f)
                }
            }

        if (frames.size === 0)
            frames.add(pbase.bframes.values().next().value)

        aO5.frames.clear()
        for (const frame of frames) {
            const key = frame.key
            // let f = pbase.bframes.find(f => f.key === key)
            let f;
            for (const bframe of pbase.bframes)
                if (bframe.key === key) {
                    f = bframe
                    break
                }
            if (!f) {
                f = new Frame(frame)
                pbase.bframes.add(f)
            }
            f.aO5s.push(aO5)
            aO5.frames.add(f)
        }
    }

    const ReadAttrs = (aO5, quals) => {
        errs.splice()

        ReadCls(aO5, quals)
        ReadFrames(aO5, quals)

        if (errs.length > 0) {
            const u = aO5.shp.quals ? `c квалиф. "${aO5.shp.quals.join(':')}"` : `(без квалификаторов)`
            C.ConsoleError(`Чтение frames '${aO5.a_name}' ${u} есть ошибки: `, errs.length, errs)
        }
    }

    wshp = C.AddModuleSub(olga5_modul, modulname, [ReadAttrs])

})();