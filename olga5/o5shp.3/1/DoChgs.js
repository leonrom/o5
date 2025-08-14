/* global window, document, console, IntersectionObserver */
/*jshint asi:true  */
/*jshint strict:true  */
/*jshint esversion: 6 */
//!
(function () {              // ---------------------------------------------- o5shp/Boards ---
    "use strict"

    let wshp, observ;

    const
        olga5_modul = "o5shp",
        modulname = 'Boards',
        C = window.olga5.C,
        o5debug = C.consts.o5debug,
        fmtOK = "background: cornsilk; color: black;",
        fmtErr = "background: yellow; color: black;",
        Observe = entries => {
            /*
            наблюдение за всеми frames всех aO5
            */
            const time = performance.now()

            if (entry.isIntersecting ) 
                wshp.DoChgs.TryActScroll(true)
            else
            if (!entry.isIntersecting ){
                // ????????????????????????????????????????????????????
                wshp.DoChgs.TryActScroll(false)
            }
        },
        
            /** 
             * нахождение тегов-контейнеров для тех frame, у которых неопределён tag            
             * и сортировка их по удалённости от aO5
            */
        FindBords = (aO5) => {
            const errs = []

            for (const frame of aO5.frames) {
                if (frame.act.pO5)
                    continue

                let pO5c;
                const
                    clss = frame.clss,
                    t = frame.typ,
                    c = frame.c
                for (const pO5 of aO5.base.pO5.pOuts) {
                    pO5c = pO5
                    if (
                        (t === 's' && (pO5.actScroll.V || pO5.actScroll.H)) ||
                        (t === 'n' && pO5.tag.nodeName == c) ||
                        (t === 'i' && pO5.tag.id.toUpperCase() == c) ||
                        (t === 'c' && pO5.IsInClass(clss))
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
                        err ? `с ошибкой: ${err}` : ``)

                if (errs.length)
                    C.ConsoleError(`Ошибки определения фреймов для ${aO5.a_name}:`, errs.length, errs)
            }

            // for (const pO5 of aO5.base.pO5.pOuts)
            //     if (!observ.tags.has(pO5.tag))
            //         observ.observe(pO5.tag)

            // для тестирования в frames.html
            window.dispatchEvent(new CustomEvent('o5_containers', { detail: { aO5: aO5, } }))
        },
        CalcPO5base = (time, pbase, xs) => {
            pbase.act.time === time

            // Пересчет Границ Контейнеров
            const rez = [],
                padd = [] // массив тех контейнеров, границы которых надо пересчитать
            let pN;
            for (const pO5 of pbase.pO5.pOuts)
                if (scrls.V || scrls.H) {
                    if (pO5.scops.time === time) { // значит этот и последующие уже определены
                        pN = pO5
                        break
                    }
                    pO5.CalcScrollScope(time, 'TLRB')
                    padd.push(pO5)
                }

            // Зоны видимости
            for (let i = padd.length - 1; i >= 0; i--) {
                const pO5 = padd[i]
                let chg = ''
                for (const x of xs) {
                    if (pN) {
                        const
                            v = pO5.scops[x],
                            vN = pN.visis[x].v,
                            itl = 'TL'.includes(x)
                        if ((vN > v && itl) || (vN < v && !itl)) {
                            Object.assign(pO5.visis[x], { p: pN, v: vN })

                            if (o5debug)
                                chg += `${pN.name}:${x}=${vN}, `
                        }
                    }
                }
                if (o5debug)
                    rez.push({ pO5: pO5.name, chg: chg })
                visis = pO5.visis
            }
            if (o5debug && rez.length > 0)
                C.ConsoleInfo(`Пересчитал границы для pbase=${pbase.pO5.name}`, rez.length, rez)
        }

    wshp = C.AddModuleSub(olga5_modul, modulname, [FindBords, CalcPO5base])  // , FillScrollable

    observ = new wshp.IntersectionObserver(Observe, {
        root: null,
        threshold: 0,
        rootMargin: '0px',
        trackVisibility: false,
    })
    // }
})();