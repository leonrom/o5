/* global window, document, console, IntersectionObserver */
/*jshint asi:true  */
/*jshint strict:true  */
/*jshint esversion: 6 */
//!
(function () {              // ---------------------------------------------- o5shp/PBases ---
    "use strict"

    let wshp, observ, ibase = 0

    const
        olga5_modul = "o5shp",
        modulname = 'PBases',
        C = window.olga5.C,
        o5debug = C.consts.o5debug
    /**
* база - скроллируемый контейнер, содержащий общую информацию для подвисабельных объектов
*/
    class PBase {
        static #pbases = new Map()
        constructor(pO5) {
            this.pO5 = pO5             // ссылка на скроллируемый контейнер
            this.aO5s = new Set()      // все эти будут проверяться на "натыкание"
            this.frames = new Map()   // mO5s = new wshp.Map()

            Object.seal(this)
            Object.seal(this.act)

            Object.freeze(this)

            PBase.#pbases.set(pO5, this)
        }
        static Get(pO5) {
            return PBase.#pbases.get(pO5)
        }
        static Attach(aO5) {
            // ищу ближайший контейнер с рамкой или отличным фоном             
            const
                CurColor = pO5 => {
                    if (pO5 && pO5.color !== 'transparent' && pO5.color !== 'rgba(0, 0, 0, 0)')
                        return pO5.color
                },
                FindNearest = pAlls => {
                    for (const pOut of pAlls) {
                        const b = pOut.borders
                        if (b.top || b.left || b.right || b.bottom)
                            return pOut
                        else {
                            const pNex = pOut.tag.parentElement.pO5
                            if (!pNex)
                                return pOut

                            const curColor = CurColor(pOut)
                            if (curColor && curColor !== CurColor(pNex))
                                return pOut
                        }
                    }
                }

            // подключаем (и создаём) pbase
            const
                pO5 = FindNearest(aO5.parent.pO5.pAlls),
                pbase = PBase.Get(pO5) || new PBase(pO5)   // там же и set()

            Object.assign(aO5.base, { pO5, pbase })
            pbase.aO5s.add(aO5)
        }
        /** 
         * нахождение тегов-контейнеров для тех frame, у которых неопределён tag            
         * и сортировка их по удалённости от aO5
        */
        static StoreFrames(aO5, mframes) {
            const
                errs = [],
                pbase = aO5.base.pbase,
                // frames=pbase.frames,
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
                },
                FillStoreFrame = (key, frame) => {
                    let pO5c;
                    const
                        clss = frame.clss,
                        t = frame.typ,
                        c = frame.c

                    let n = frame.num

                    for (const pO5 of pbase.pO5.pOuts) {
                        pO5c = pO5
                        if (
                            (t === 's' && (pO5.scrls.V || pO5.scrls.H)) ||
                            (t === 'n' && pO5.tag.nodeName == c) ||
                            (t === 'i' && pO5.tag.id.toUpperCase() == c) ||
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
                            frame.err = `взял ${n}-й тег (вместо ${frame.num}) для фрейма "${frame.s}"`
                        }
                        else {
                            frame.pO5 = pO5c
                            frame.err = `среди скроллиремых нет тега для фрейма "${frame.s}" - взял ${pO5c.name}`
                        }
                        errs.push(frame.err)
                    }

                    if (o5debug)
                        console.log(`Определил (и добавил в base.frames) фрейм "${frame.key} на ${frame.pO5.name}" ` +
                            (frame.err ? `с ошибкой: ${frame.err}` : ``))

                    frame.ibase = ++ibase
                    pbase.frames.set(key, frame)
                    return frame
                }

            // удаляю старое использование
            for (const [key, f] of pbase.frames) {
                const i = f.aO5s.indexOf(aO5)
                if (i >= 0) {
                    f.aO5s.splice(i, 1)
                    if (f.aO5s.length === 0)
                        pbase.frames.delete(key)
                }
            }

            // добавляю новый фрейм в базу
            aO5.frames.clear()

            for (const [key, f] of mframes) {
                const frame = pbase.frames.get(key) || FillStoreFrame(key, f)

                frame.aO5s.push(aO5)
                aO5.frames.add(frame)
            }

            // формирую список на которых aO5 может фиксироваться
            for (const x of 'TLRB') {
                aO5.pCouldFixs[x].length = 0
                for (const p of pbase.pO5.pOuts) 
                    for (const frame of aO5.frames)
                        if (frame.fix && frame.pO5 === p) {
                            aO5.pCouldFixs[x].push(p)
                            break
                        }
            }

            if (errs.length)
                C.ConsoleError(`Ошибки определения фреймов для ${aO5.a_name}:`, errs.length, errs)
        }
    }

    wshp = C.AddModuleSub(olga5_modul, modulname, [PBase])
})();