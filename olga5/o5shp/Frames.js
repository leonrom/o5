/* global window, document, console, IntersectionObserver */
/*jshint asi:true  */
/*jshint strict:true  */
/*jshint esversion: 6 */
//!!
(function () {              // ---------------------------------------------- o5shp/Frames ---
    "use strict"

    let wshp;
    const
        olga5_modul = "o5shp",
        modulname = 'Frames',
        C = window.olga5.C,
        o5debug = C.consts.o5debug,
        mdiglit = /[a-zA-Z]+|[+-]*\d+/g,
        IsInClass = (pO5, clss) => {
            const classOrigs = pO5.classOrigs
            if (classOrigs.length > 0) {
                for (const cls of clss)
                    if (cls && classOrigs.indexOf(cls) >= 0)
                        return true
            }
            else
                if (clss.length === 0 || clss.find(cls => cls.trim().length == 0) != null)
                    return true
            return false
        },
        FillFrame = (frame, pOuts, s) => {
            let pO5c = null
            const
                clss = (frame.typ === 'c') ? frame.cod.split(/\s*[.]\s*/) : [],
                t = frame.typ,
                c = frame.cod

            let n = frame.num

            for (const pO5 of pOuts) {
                pO5c = pO5
                if (
                    (t === 'i' && pO5.tag.id.toUpperCase() === c) ||
                    (t === 's' && (pO5.scrls.V || pO5.scrls.H)) ||
                    (t === 'n' && pO5.tag.nodeName === c) ||
                    (t === 'c' && IsInClass(pO5, clss))
                )
                    if (--n > 0) frame.xO5 = pO5
                    else
                        frame.pO5 = pO5

                if (frame.pO5 || pO5.final)
                    break
            }

            if (!frame.pO5) {
                if (frame.xO5) {
                    frame.pO5 = frame.xO5
                    frame.err = `взял ${n}-й тег (вместо ${frame.num}) для фрейма "${s}"`
                }
                else {
                    frame.pO5 = pO5c
                    frame.err = `среди скроллиремых нет тега для фрейма "${s}" - взял ${pO5c.name}`
                }
            }

        },
        MakeFrames = (aO5, ss) => {

            // удаляю старое использование
            for (const [key, frame] of Frame.frames) {
                const i = frame.aO5s.indexOf(aO5)
                if (i >= 0) {
                    frame.aO5s.splice(i, 1)
                    if (frame.aO5s.length === 0)
                        Frame.frames.delete(key)
                }
            }
            aO5.frms.clear()

            const
                errs = [],
                typs = 'cins',
                idn = aO5.base.pbase.idn,
                pOuts = aO5.base.bO5.pOuts

            // добавляю aO5  к frames
            for (const s of ss)
                if (s) {
                    const
                        cc = s.includes('=') ? s.split('=') : ['i', s],  // считаем, что это значение для id                
                        uu = (cc[1] || '').split('/'),
                        cod = (uu[0] || '').trim().toUpperCase()
                    let
                        typ = cc[0].trim().toLowerCase(),
                        num = 0,
                        fix = false,
                        cut = false

                    if (!typs.includes(typ)) {
                        errs.push(`тип ссылки '${typ}' не начинается одним из '${typs}' заменен на 'i'`)
                        typ = 'i'
                    }
                    if (uu.length > 1) {    //  && !uu[1].trim()
                        for (let i = 1; i < uu.length; i++) {
                            const pars = uu[i].match(mdiglit)
                            if (pars)
                                for (const par of pars) {
                                    const n = Number(par)
                                    if (Number.isInteger(n) && !isNaN(n)) {
                                        if (typ !== 'w')    // для 'window' номер игнорируется
                                            num = n
                                    }
                                    else {
                                        if (par.indexOf('f') >= 0) fix = true
                                        if (par.indexOf('c') >= 0) cut = true
                                    }
                                }
                        }

                        if (!fix && !cut)
                            errs.push(`не задан ни 'fix' (не подвисает), ни 'cut' (не обрезается).`)
                    }

                    const key = idn+','+typ + ',' + cod + ',' + num

                    let frame = Frame.frames.get(key)

                    if (!frame) {
                        frame = new Frame(key, typ, cod, num)

                        FillFrame(frame, pOuts, s)
                        Frame.frames.set(key, frame)
                        if (frame.err)
                            errs.push(frame.err)
                        if (o5debug)
                            console.log(`Определил (и добавил в base.frames) фрейм "${key} на ${frame.pO5.name}" `)
                    }

                    frame.aO5s.push(aO5)
                    aO5.frms.add({ key: key, cut: cut, fix: fix, pO5:frame.pO5 })
                }

            // формирую список на которых aO5 может фиксироваться
            for (const x of 'TLRB') {
                aO5.pCouldFixs[x].length = 0
                if (aO5.cls.puts.includes(x))
                    for (const frm of aO5.frms)
                        if (frm.fix) 
                            for (const p of pOuts)
                                if (frm.pO5 === p) {
                                    aO5.pCouldFixs[x].push(p)
                                    break
                                }                        
            }

            if (errs.length)
                C.ConsoleError(`Ошибки определения фреймов для ${aO5.a_name}:`, errs.length, errs)
        }

    class Frame {
        static frames = new Map()
        constructor(key, typ, cod, num) {
            Object.assign(this, {
                typ: typ,
                cod: cod,
                num: num,
                pO5: null,
                xO5: null,
                err: '',
                n: 0,
                aO5s: [], // кто его использует
            })
            Object.seal(this)
        }

        // делаем класс итерируемым
        static *[Symbol.iterator]() {
            for (const [key, frame] of this.frames.entries()) {
                yield { key, frame };
            }
        }
    }

    wshp = C.AddModuleSub(olga5_modul, modulname, [Frame, MakeFrames])
})();