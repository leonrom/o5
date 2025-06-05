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

            for (const entry of entries)
                if (entry.target.pO5.HasFixed()) {
                    wshp.DoInit.TryScrollAct(true, time, 'из Boards')
                    break
                }
        },
        FillScrollable = (aO5) => {
            /*
            Вызывается при инициализации и при DoResize
            */
            const pStrt = aO5.parent.pO5
            if (pStrt.act.time === wshp.tLastScroll) {
                aO5.act.pbase = pStrt.act.pbase
                return
            }

            let pO5, pbase = null;
            for (pO5 of pStrt.pOuts)
                if (pO5.actScroll.V || pO5.actScroll.H) {
                    if (!pbase) {
                        if (pO5.act.time === wshp.tLastScroll)
                            break
                        else {
                            pO5.act.time = wshp.tLastScroll
                            pO5.act.pbase = new wshp.DoResize.PBase(pO5)
                        }
                        pbase = pO5.act.pbase
                    }
                    pbase.scrollPs.add(pO5)
                }

            if (!pbase)     //  т.е. последний в pStrt.pOuts
                pO5.act.pbase = pbase = new wshp.DoResize.PBase(pO5)

            if (pbase.scrollPs.size === 0)  // добавляю внешний (последний) контейнер
                pbase.scrollPs.add(pO5)

            pStrt.act.pbase = aO5.act.pbase = pbase

            for (const pO5 of pbase.scrollPs)
                pO5.ActScroll(wshp.tLastScroll)

            if (o5debug > 1) {
                const parentAdds = []
                for (const pO5 of pbase.scrollPs)
                    parentAdds.push({
                        name: pO5.name,
                        scrollV: pO5.actScroll.V ? 'да' : ' -',
                        scrollH: pO5.actScroll.H ? 'да' : ' -',
                    })
                C.ConsoleInfo(`Скроллируемые в FillScrollable`, 'T=' + wshp.tLastScroll.toFixed(), parentAdds)
            }
        },
        FindBords = (aO5) => {
            
            const pbase = aO5.act.pbase
//             if (!pbase){
//                 pbase = aO5.act.pbase = wshp.DoResize.PBase.FindBase(aO5.parent.pO5)
//                 pbase.baO5s.add(aO5)
// }

            FillScrollable(aO5)

            const
                errs = [],
                scrollPs = pbase.scrollPs

            /*
            нахождение тегов-контейнеров для тех frame, у которых неопределён tag
            и сортировка их по удалённости от aO5
            */
            for (const frame of aO5.frames) {
                if (frame.act.pO5)
                    continue

                let pO5c;
                const
                    clss = frame.clss,
                    t = frame.typ,
                    c = frame.c
                for (const pO5 of scrollPs) {
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

            wshp.PO5shp.InsertaO5s(aO5)

            for (const pO5 of pbase.scrollPs)
                if (!observ.tags.has(pO5.tag))
                    observ.observe(pO5.tag)

            // для тестирования в frames.html
            window.dispatchEvent(new CustomEvent('o5_containers', { detail: { aO5: aO5, } }))
        }

    wshp = C.AddModuleSub(olga5_modul, modulname, [FindBords, FillScrollable])

    observ = new wshp.IntersectionObserver(Observe, {
        root: null,
        threshold: 0,
        rootMargin: '0px',
        trackVisibility: false,
    })
    // }
})();