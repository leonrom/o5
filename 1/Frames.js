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

            const
                errs = [],
                typs = 'cins',
                pBase = aO5.base.pBase,
                // pOuts = pBase.pO5.pOuts,
                // pIncs = pBase.pO5.pIncs,
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
                    par = (uu[1] || '').replace(/f/gi, ''),  // 'f' уже не используется и игнорируется                    
                    cut = par.match(/c/i)
                let
                    typ = cc[0].trim().toLowerCase(),
                    num = 0

                if (!typs.includes(typ)) {
                    errs.push(`тип ссылки '${typ}' не начинается одним из '${typs}' заменен на 'i'`)
                    typ = 'i'
                }

                aO5.frms.tagCut = cut ? FindTag(pBase.tagsIn.concat(pBase.pO5), typ, cod, 0) : pBase.tagsIn[0]

                if (!cut) {
                    const n = Number(par)
                    if (Number.isInteger(n) && !isNaN(n))
                        num = n
                    else
                        errs.push(`непонятный квалификатор '${uu[1]}' (после символа '/')`)

                    const key = pBase.idn + ',' + typ + ',' + cod + ',' + num

                    let frame = Frame.frames.get(key)

                    if (!frame) {
                        const
                            tag = FindTag(pBase.pOuts.T.map(p => p.tag), typ, cod, num)

                        frame = new Frame(key, typ, cod, num, tag.pO5)

                        Frame.frames.set(key, frame)

                        if (o5debug)
                            console.log(`Определил (и добавил в base.frames) фрейм "${key} на ${frame.pO5.name}" `)
                    }

                    frame.aO5s.push(aO5)
                    aO5.frms.frames.add(frame)
                }
            }

            // for (const frame of aO5.frms.frames)  // формирую список на которых aO5 может фиксироваться
            //     for (const p of pOuts)
            //         if (frame.pO5 === p) {
            //             aO5.pFixsOn.push(p)
            //             break
            //         }

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