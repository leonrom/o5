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
            // удаляю старое использование
            for (const [key, frame] of Frame.frames) {
                const i = frame.aO5s.indexOf(aO5)
                if (i >= 0) {
                    frame.aO5s.splice(i, 1)
                    if (frame.aO5s.length === 0)
                        Frame.frames.delete(key)
                }
            }
            aO5.frms.frames.clear()
            aO5.frms.tagCut = null

            const
                errs = [],
                typs = 'cins',
                pBase = aO5.base.pBase,
                IsInClass = (cs, cod) => {
                    for (const c of cs)
                        if (c.toUpperCase == cod)
                            return true
                },
                FindTag = (ts, typ, cod, n0) => {
                    let tag = null, n = n0
                    for (const t of ts)
                        if (
                            (typ === 'n' && t.nodeName === cod) ||
                            (typ === 'i' && t.id.toUpperCase() === cod) ||
                            (typ === 'c' && IsInClass(t.classList, cod))
                        ) {
                            tag = t
                            if (--n <= 0)
                                break
                        }
                    if (!tag)
                        errs.push(`не найден тег для typ=${typ}  и cod=${cod}`)
                    else
                        if (n > 0)
                            errs.push(`взял ${n}-й тег (вместо ${n0}) `)
                    return tag || ts[0]
                }

            // добавляю aO5  к frames
            for (const s of ss) {
                if (!s) continue

                const
                    cc = s.includes('=') ? s.split('=') : ['i', s],  // считаем, что это значение для id                
                    uu = (cc[1] || '').split('/'),
                    cod = (uu[0] || '').trim().toUpperCase(),
                    par = (uu[1] || '').trim(),
                    cuts = par.match(/c/i)

                let typ = cc[0].trim().toLowerCase()
                if (!typs.includes(typ)) {
                    errs.push(`тип ссылки '${typ}' не начинается одним из '${typs}' заменен на 'i'`)
                    typ = 'i'
                }

                if (cuts) {
                    let tag = aO5.frms.tagCut
                    if (!tag) {
                        tag = aO5.frms.tagCut = FindTag(pBase.tagsIn, typ, cod, 0)
                        if (!tag.pO5)
                            new wshp.PO5shp.PO5(tag, window.getComputedStyle(tag))
                        
                        if (!tag) {
                            errs.push(`Нет тега для key=${key} среди внутренних_тегов - игнорирую`)
                            continue
                        }
                    }
                    else
                        errs.push(`несколько cut-квалификаторов (т.е. содержащих '/c')`)
                }
                else {
                    const num = par.replace(/[fc]/gi, '') || 0 // 'f' уже не используется и игнорируется                    
                    if (!Number.isInteger(num) || isNaN(num)) {
                        errs.push(`непонятное значение для num='${uu[1]}' (после символа '/')`)
                        continue
                    }
                    const key = pBase.idn + ':' + typ + ',' + cod + ',' + num

                    let frame = Frame.frames.get(key)
                    if (!frame) {
                        let tag = FindTag(pBase.pO5.tagsOut, typ, cod, num)

                        if (!tag) {
                            errs.push(`Нет тега для key=${key} среди внешних_ скролл_тегов - игнорирую`)
                            continue
                        }

                        frame = new Frame(key, typ, cod, num, tag.pO5)

                        Frame.frames.set(key, frame)

                        if (o5debug)
                            console.log(`Определил (и добавил в base.frames) фрейм "${key} на ${frame.pO5.name}" `)
                    }

                    frame.aO5s.push(aO5)
                    aO5.frms.frames.add(frame)
                }
            }
            if (!aO5.frms.tagCut)
                aO5.frms.tagCut = aO5.base.pBase.pO5.tag

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