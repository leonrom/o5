/* global window, console, IntersectionObserver */
/*jshint asi:true  */
/*jshint strict:true  */
/*jshint esversion: 6 */
(function () {
    "use strict"

    /**
     * @module o5shp/DoInit
     * Инициализация скроллируемых объектов.
     *
     * Содержит функции:
     * - `Observe(entries)` — обработка появления элементов в области видимости.
     * - `Init()` — первичная инициализация обсерверов.
     */
    let observ;

    const
        olga5_modul = "o5shp",
        modulname = 'DoInit',
        C = window.olga5.C,
        o5debug = C.consts.o5debug,
        fmtOK = "background: blue; color: white;",
        fmtErr = "background: yellow; color: black;",
        mselec = /[A-Z]|[+-]?\d+/g,
        DebugShowRez = aO5s => {
            const
                head = ` после "${Array.from(aO5s).map(aO5 => aO5.a_name).join(', ')}"`,
                rez = []

            for (const aO5 of aO5s)
                rez.push({
                    aO5: aO5.a_name,
                    base: aO5.base.pBase.pO5.name,
                    tagCut:aO5.frms.tagCut,
                    frms: Array.from(aO5.frms.frames).map(f => f.key).join(', ')
                })

            C.ConsoleInfo(`Обработка ${head}`, rez.length, rez)

            rez.length = 0
            for (const { bO5, pBase } of wshp.PBases.PBase) {
                rez.push({
                    base: pBase.pO5.name,
                    pOuts: ' ' + (Array.from(pBase.pOuts.T)).map(pO5 => pO5.name).join(', '),
                    aO5s_T: ' ' + (Array.from(pBase.aO5s.T)).map(aO5 => aO5.a_name).join(', '),
                    aO5s_L: ' ' + (Array.from(pBase.aO5s.L)).map(aO5 => aO5.a_name).join(', '),
                    aO5s_R: ' ' + (Array.from(pBase.aO5s.R)).map(aO5 => aO5.a_name).join(', '),
                    aO5s_B: ' ' + (Array.from(pBase.aO5s.B)).map(aO5 => aO5.a_name).join(', ')
                })
            }
            C.ConsoleInfo(`Базы ${head}`, rez.length, rez)

            rez.length = 0
            for (const { key, frame } of wshp.Frames.Frame) {
                rez.push({
                    key: key,
                    tcn: frame.typ + ':' + frame.cod + ':' + frame.num,
                    pO5: frame.pO5.name,
                    aO5s: frame.aO5s.map(a => a.a_name).join(', '),
                    err: frame.err,
                })
            }
            C.ConsoleInfo(`Фреймы ${head}`, rez.length, rez)
        },

        Init = () => {
            const mtags = C.SelectByClassName(wshp.W.class, olga5_modul)
            let found;

            for (const mtag of mtags) {
                if (
                    !mtag.tag.classList.contains('o5shp_none') &&
                    !mtag.quals.find(qual => !qual.includes('=') && qual.match(/n/i))
                ) {
                    if (!observ)
                        observ = CreateObserver({
                            root: null,
                            threshold: [0, 1],
                            rootMargin: '0px',
                            trackVisibility: false,
                        })
                    observ.observe(mtag.tag, mtag.quals)
                    found = true
                }
            }

            if (!found)
                console.log("%c%s", fmtErr, `В тегах с классом 'olga5_Start' нет объектов '${wshp.W.class}' без class='o5shp_none' и квалификатора ':N'`)
        },

        ReadCls = (aO5, ss) => {
            const cls = aO5.cls

            Object.assign(cls, {           // для повторной инициализации (напр. в тестах)
                level: 0,
                pitch: 'S',
                none: false,
                nofx: false,
                alive: false,
            })
            cls.puts.length = 0 //  : { T: '', L: '', R: '', B: '', },

            const cs = ss.match(mselec)
            for (const c of cs)
                if (!isNaN(c))
                    cls.level = Number(c)
                else
                    switch (c) {
                        case 'A': cls.alive = true; break
                        case 'C':                       // сжимает предыдущий
                        case 'P':                       // сталкивает предыдущий
                        case 'S':                       // сдвигает предыдущий
                        case 'O': cls.pitch = c; break  // наезжает на предыдущий
                        case 'T':
                        case 'L':
                        case 'R':
                        case 'B': cls.puts.push(c); break
                        case 'N': cls.nofx = true; break    // не подвисает, но может сдвигать остальные
                        default: errs.push(`не определён квалиф. '${ql[i]}' в строке "${qual}"`)
                    }

            if (cls.puts.length === 0) cls.puts.push('T')
        },

        ReadAttrs = aO5 => {
            const aquals = aO5.act.quals.split(/[:;]/)

            ReadCls(aO5, aquals[0] || '') // разделяющие запятые там просто игнорируются

            wshp.Frames.MakeFrames(aO5, (aquals[1] || '').split(','))
        }

    const
        Observe = entries => {
            const 
                oO5s = new Set(),
                bBases = new Set()
            for (const entry of entries)
                if (entry.isIntersecting) {
                    const
                        shp = entry.target,
                        el = observ.getel(shp)

                    oO5s.add(new wshp.AO5shp.AO5(shp, el.quals))

                    observ.unobserve(shp)
                }

            let isNew = false
            for (const aO5 of oO5s) {
                if (wshp.PBases.PBase.Attach(aO5))  // если добавилась новая база
                    isNew = true

                ReadAttrs(aO5)
                bBases.add(aO5.base.pBase)

                // для тестирования в frames.html
                window.dispatchEvent(new CustomEvent('o5_containers', { detail: { aO5: aO5, } }))
            }

            if (oO5s.size >0)
                for (const bBase of bBases)
                    bBase.ReorderAO5s()

            if (isNew) {
                wshp.DoChgs.CalcCovers(body.pO5, 'TB')
                wshp.DoChgs.CalcCovers(body.pO5, 'LR')
            }
            if (o5debug > 1)
                DebugShowRez(oO5s)

            oO5s.clear()
        }

    /**
     * создаёт наблюдателя за элементами
     * @function CreateObserver
     */
    function CreateObserver(options) {
        const state = {
            observer: null,
            elements: new Set,
        }

        state.observer = new IntersectionObserver(Observe, options)

        function getel(tag) {
            for (const el of state.elements)
                if (el.tag === tag)
                    return el
        }

        return {
            observe: (tag, quals) => {
                state.elements.add({ tag: tag, quals: quals.join(':') })
                state.observer.observe(tag)
            },
            unobserve: (tag) => {
                state.observer.unobserve(tag)
                const el = getel(tag)   // заменено!
                state.elements.delete(el)

                if (state.elements.length === 0) {
                    state.observer.disconnect()
                    state.observer = null
                    if (o5debug)
                        console.log("%c%s", fmtOK, `observe: `, ` отключено полностью`)
                }
            },
            getel, // экспортируем в объект
            get observedElements() {
                return Array.from(state.elements)
            },
        }
    }
    const wshp = C.AddModuleSub(olga5_modul, modulname, [Init, ReadAttrs])
})();
