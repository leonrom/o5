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
        Observe = (entries) => {
            const
                aO5names = [],
                AscScroll = (aO5, act) => {
                    aO5.act.uScroll = act
                    if (o5debug > 0)
                        aO5names.push((act ? '+' : '-') + aO5.name)
                    return 1
                }
            let n = 0

            for (const entry of entries) {
                const
                    shp = entry.target
                let
                    aO5 = shp.aO5shp

                if (entry.isIntersecting) {
                    if (!aO5) 
                        aO5 = wshp.AO5shp(shp)
                    
                    n += AscScroll(aO5, true)
                }
                else
                    if (aO5 && !aO5.act.isFix)
                        n += AscScroll(aO5, false)
            }

            if (n > 0) {
                const
                    isScroll = wshp.aO5s.find(aO5 => aO5.act.uScroll || aO5.act.isFix)

                if (o5debug > 0 && aO5names.length > 0)
                    console.log("%c%s", fmt, `EventListener` +
                        ` ${wshp.isScroll === isScroll ? ' (повт) ' : '        '}: ${isScroll ? 'START' : 'stop '} `,
                        `для ${aO5names.join(', ')}`)

                wshp.DoScroll(isScroll)
            }
        },
        DoInit = () => {
            const
                mtags = C.SelectByClassName(wshp.W.class, olga5_modul),
                observ = new IntersectionObserver(Observe, {
                    root: null,
                    threshold: 0,
                    rootMargin: '0px',
                    trackVisibility: false,
                })

            for (const mtag of mtags)
                if (!mtag.quals.find(qual => qual.match(/\bN/i))) {
                    const shp = mtag.tag

                    shp.aO5quals = mtag.quals.slice()
                    observ.observe(shp)
                    if (o5debug > 1)
                        console.log(`observ: добавлен ${shp.id.padEnd(12)} quals='${mtag.quals.join(', ')}'`)
                    // wshp.shps.push(shp)
                }

            mtags.splice(0, mtags.length)
            wshp.observ = observ
        },
        wshp = C.ModulAddSub(olga5_modul, DoInit)

})();

