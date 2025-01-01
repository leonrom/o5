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
        // fmtOK = "background: aquamarine; color: black;",
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
                const shp = entry.target
                let aO5 = shp.aO5shp

                if (entry.isIntersecting) {
                    if (!aO5)
                        aO5 = wshp.AO5shp(shp)

                    n += AscScroll(aO5, true)
                }
                else
                    if (aO5 && !aO5.IsFix()) // act.isFix)
                        n += AscScroll(aO5, false)
            }

            if (n > 0)
                wshp.DoScroll(
                    wshp.aO5s.find(aO5 => aO5.act.uScroll || aO5.IsFix()), // act.isFix),
                    `AO5.Observe для "${aO5names.join(', ')}"`
                )

        },
        DoInit = () => {
            const
                mtags = C.SelectByClassName(wshp.W.class, olga5_modul),
                observ = new IntersectionObserver(Observe, {
                    root: null,
                    threshold: 0,
                    rootMargin: '0px',
                    trackVisibility: false,
                }),
                found={n:0,ok:false}

            for (const mtag of mtags){
                found.n++
                // if (!mtag.quals.find(qual => qual.match(/\bN/))) {
                if (!mtag.tag.classList.contains('olga5_shpNone')){
                    const shp = mtag.tag

                    shp.aO5quals = mtag.quals.slice()
                    observ.observe(shp)
                    wshp.shps.push(shp)

                    found.ok=true
                    if (o5debug > 0)
                        console.log(`observ: добавлен ${shp.id.padEnd(12)} quals='${mtag.quals.join(', ')}'`)
                 }
            }

            mtags.splice(0, mtags.length)
            wshp.observ = observ

            if (!found.ok)
                C.ConsoleError(`В тегах с классом 'olga5_Start' нет объектов '${wshp.W.class}' без квалификатора ':N'`, `найдено: ${found.n}`)
        },
        wshp = C.ModulAddSub(olga5_modul, DoInit)

    wshp.shps = []
})();

