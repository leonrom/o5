/* global window, document, console */
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
        MakeFrames = (aO5, ss) => {
            const
                errs = [],
                typs = 'cins',
                frms = aO5.frms,
                pBase = aO5.base.pBase,
                tagBase = pBase.pO5.tag,
                TagCheck = (t, typ, cod) => {
                    const
                        IsInClass = (cs, cod) => {
                            for (const c of cs)
                                if (c.toUpperCase == cod)
                                    return true
                        }
                    switch (typ) {
                        case 'n': return t.nodeName === cod
                        case 'i': return t.id.toUpperCase() === cod
                        case 'c': return IsInClass(t.classList, cod)
                    }
                }

            // удаляю старое использование
            for (const [key, frame] of Frame.frames) {
                const i = frame.aO5fs.indexOf(aO5)
                if (i >= 0) {
                    frame.aO5fs.splice(i, 1)
                    if (frame.aO5fs.length === 0)
                        Frame.frames.delete(key)
                }
            }
            // pBase.tagCuts.clear()  // а вот и НЕ надо очищать!
            frms.frames.clear()
            frms.tagCut = null

            // добавляю aO5  к frames
            for (const s of ss) {
                if (!s) continue

                const
                    cc = s.includes('=') ? s.split('=') : ['i', s],  // считаем, что это значение для id                
                    uu = (cc[1] || '').split('/'),
                    cod = (uu[0] || '').trim().toUpperCase(),
                    par = (uu[1] || '').trim(),
                    iscut = par.match(/c/i),
                    isfix = !iscut || par.match(/f/i)

                let
                    typ = cc[0].trim().toLowerCase(),
                    num = par.replace(/[fc]/gi, '') || 0 // 'f' уже не используется и игнорируется                    

                if (!typs.includes(typ)) {
                    errs.push(`тип ссылки '${typ}' не начинается одним из '${typs}' заменен на 'i'`)
                    typ = 'i'
                } 
                if (!Number.isInteger(num) || isNaN(num)) {
                    errs.push(`непонятное значение для num='${uu[1]}' (после символа '/'). Взято 0`)
                    nim = 0
                }

                if (iscut) {
                    let tag = frms.tagCut
                    if (!tag) {
                        let own = aO5.shp, n = num
                        do {
                            own = own.parentNode
                            if (TagCheck(own, typ, cod)) {
                                tag = own
                                if (--n <= 0)
                                    break
                            }
                        }
                        while (own !== tagBase)

                        if (!tag) {
                            errs.push(`${aO5.name}: не найден 'внутренний' контейнер для "${s}" . Взял '${tagBase.pO5.name}'`)
                            tag = tagBase
                        }
                        else if (n > 0)
                            errs.push(`взял ${n}-й тег (вместо ${n0} для  "${s}") `)

                        frms.tagCut = tag
                        if (!tag.pO5)
                            new wshp.PO5shp.PO5(tag, window.getComputedStyle(tag))
                    }
                    else
                        errs.push(`несколько cut-квалификаторов (т.е. содержащих '/c')`)
                }

                if (isfix) {
                    const key = pBase.idn + ':' + typ + ',' + cod + ',' + num
                    let frame = Frame.frames.get(key)                    
                    if (!frame) {
                        let own = pBase.pO5.tag, n = num, tag;
                        do {
                            if (TagCheck(own, typ, cod)) {
                                tag = own
                                if (--n <= 0)
                                    break
                            }
                            own = own.parentNode
                        }
                        while (own.nodeName !== 'HTML')

                        if (!tag) {
                            errs.push(`${aO5.name}: не найден 'внешний' контейнер для typ=${typ} и cod=${cod}. Взял base='${pO5.name}'`)
                            tag = pO5.tag
                        }
                        else if (n > 0)
                            errs.push(`взял ${n}-й тег (вместо ${n0} для typ=${typ} и cod=${cod}) `)

                        frame = new Frame(key, typ, cod, num, tag.pO5)

                        Frame.frames.set(key, frame)

                        if (o5debug)
                            console.log(`Определил (и добавил в base.frames) фрейм "${key} на ${frame.pO5.name}" `)
                    }

                    frame.aO5fs.push(aO5)
                    frms.frames.add(frame)
                }
            }
            if (!frms.tagCut)
                frms.tagCut = tagBase

            pBase.tagCuts.add(frms.tagCut)

            if (errs.length)
                C.ConsoleError(`Ошибки определения фреймов для ${aO5.a_name}:`, errs.length, errs)
        }

    class Frame {
        static frames = new Map()
        constructor(key, typ, cod, num, pO5) {
            Object.assign(this, {
                typ: typ,
                cod: cod,
                num: num,
                pO5: pO5,
                aO5fs: [], // кто его использует
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