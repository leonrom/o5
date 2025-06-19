/* global window, document, console, IntersectionObserver */
/*jshint asi:true  */
/*jshint strict:true  */
/*jshint esversion: 6 */
//!
(function () {              // ---------------------------------------------- o5shp/Frames ---
    "use strict"

    let wshp, errs;
    const
        olga5_modul = "o5shp",
        modulname = 'Frames',
        C = window.olga5.C,
        o5debug = C.consts.o5debug,
        mdiglit = /[a-zA-Z]+|[+-]*\d+/g,
        msmall = /^[a-z]/,
        f0 = {
            typ: 'n', cod: '', num: 0, cut: true, fix: true, s: 'умолчание?',
            err: `фреймы не найдены/заданы: взяты ближйший с скроллингом`
        },
        // fmtOK = "background: cornsilk; color: black;",
        // fmtErr = "background: yellow; color: black;",   

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

        MakeFrames = (aO5, squals, mframes) => {
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
                            xf = mframes.get(key)
                        if (xf) {
                            xf.fix ||= f.fix; xf.cut ||= f.cut; f.err = ''
                        }
                        else
                            mframes.set(key, new Frame(f))
                    }
                }

            if (mframes.size === 0)
                mframes.set(Frame.Key(f0), new Frame(f0))     //  pbase.bframes.values().next().value)            
        },
        DebugShowRez = aO5 => {
            const rez = []
            for (const frame of aO5.frames) {
                rez.push({
                    frame: frame.act.ibase + '.' + frame.act.pO5.name,
                    str: frame.typ + ':' + frame.cod + ':' + frame.num,
                    fc: frame.fix ? 'fix' : '   ' + frame.cut ? 'cut' : '   ',
                    err: frame.err,
                    aO5s: frame.aO5s.map(a => a.a_name).join(', '),
                    err: frame.err,
                })
            }
            C.ConsoleInfo(`Фреймы у ${aO5.a_name}`, rez.length, rez)

            if (!aO5.base.pO5)
                alert('нету aO5.base.pO5')
        };


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
                    err: '',
                    ibase: 0,
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
        static ReadAttrs(aO5, quals) {
            const mframes = new Map()

            errs = []

            ReadCls(aO5, quals)
            MakeFrames(aO5, quals, mframes)

            wshp.PBases.PBase.StoreFrames(aO5, mframes)

            if (errs.length > 0) {
                const u = aO5.shp.quals ? `c квалиф. "${aO5.shp.quals.join(':')}"` : `(без квалификаторов)`
                C.ConsoleError(`Чтение frames '${aO5.a_name}' ${u} есть ошибки: `, errs.length, errs)
            }

            // для тестирования в frames.html
            window.dispatchEvent(new CustomEvent('o5_containers', { detail: { aO5: aO5, } }))
            
            if (o5debug > 1)
                DebugShowRez(aO5)
        }
    }

    wshp = C.AddModuleSub(olga5_modul, modulname, [Frame])
})();