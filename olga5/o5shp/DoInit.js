/* global window, document, console, IntersectionObserver */
/*jshint asi:true  */
/*jshint strict:true  */
/*jshint esversion: 6 */
(function () {              // ---------------------------------------------- o5shp/DoInit ---
    "use strict"
    // let debugids = []  // 'shp_text' // 'shp_1÷4' // 'shp-demo' // 'shp_text'        

    const
        olga5_modul = "o5shp",
        // modulname = 'DoInit',
        C = window.olga5.C,
        o5debug = C.consts.o5debug,
        fmt = "background: aquamarine; color: black;",
        Observe0 = (entries, obsrv0) => {
            const obsrvs = []

            for (const entry of entries) {
                const shp = entry.target
                let aO5 = shp.aO5shp

                if (entry.isIntersecting) {
                    if (!aO5) {
                        aO5 = wshp.AO5shp(entry.target)
                        aO5.Resize()

                        wshp.aO5s.push(aO5)
                    }
                    aO5.act.uScroll = true
                    if (entry.intersectionRatio === 1)
                        aO5.act.canFix = true
                    else
                        if (aO5.act.canFix) {
                            const
                                br = entry.boundingClientRect,
                                ir = entry.intersectionRect

                            // wshp.escroll.ScrollAct(true, `подвисло ${aO5.name}`)
                            if (
                                (br.top < ir.top && aO5.cls.dirV === 'U') ||
                                (br.bottom > ir.bottom && aO5.cls.dirV === 'D')
                            ) {
                                wshp.escroll.ScrollAct(true, `подвисаний ${aO5.name}`)
                            }
                        }
                }
                else
                    if (aO5) {
                        aO5.act.uScroll = false
                        aO5.act.canFix = false
                    }

                if (o5debug > 0)
                    obsrvs.push(shp.id + '/' + parseFloat(entry.intersectionRatio).toFixed(2))

            }
            if (o5debug > 0) {
                console.groupCollapsed("%c%s", fmt, `Observe0`, `обработано: `, obsrvs.join(', '))

                console.table(wshp.aO5s.map(aO5 => {
                    return {
                        name: aO5.name,
                        uScroll: aO5.act.uScroll,
                        canFix: aO5.act.canFix,
                    }
                }))
                console.groupEnd()
            }
        },
        DoInit = () => {
            const
                mtags = C.SelectByClassName(wshp.W.class, olga5_modul),
                obsrv0 = new IntersectionObserver(Observe0, {
                    root: null,
                    rootMargin: '0px',
                    threshold: [0.01, 0.99, 1],
                    trackVisibility: false,
                })
<b>canFix</b>
            for (const mtag of mtags)
                if (!mtag.quals.find(qual => qual.match(/\bN/i))) {
                    const shp = mtag.tag

                    shp.aO5quals = mtag.quals.slice()
                    obsrv0.observe(shp)
                    if (o5debug > 1)
                        console.log(`obsrv0: добавлен ${shp.id.padEnd(12)} quals='${mtag.quals.join(', ')}'`)
                    // wshp.shps.push(shp)
                }

            mtags.splice(0, mtags.length)
        },
        wshp = C.ModulAddSub(olga5_modul, DoInit)

    // wshp.shps = [] // это ВСЕ подвисабельные
    wshp.aO5s = [] // это инициированные подвисабельные
})();

