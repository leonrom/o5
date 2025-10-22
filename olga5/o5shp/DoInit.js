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
        state = {
            observer: null,
            elements: new Set,
        },
        DebugShowRez = oO5s => {
            const
                head = ` после "${Array.from(oO5s).map(aO5 => aO5.a_name).join(', ')}"`,
                rez = []

            for (const aO5 of oO5s)
                rez.push({
                    aO5: aO5.a_name,
                    tagCut: aO5.frms.tagCut.id,
                    base: aO5.base.pBase.pO5.name,
                    frms: Array.from(aO5.frms.frames).map(f => f.pO5.id).join(', ')
                })

            C.ConsoleInfo(`Обработка ${head}`, rez.length, rez)

            rez.length = 0
            for (const { bO5, pBase } of wshp.PBases.PBase) {
                rez.push({
                    base: pBase.pO5.name,
                    pOuts: ' ' + (Array.from(pBase.pO5.pOuts)).map(pO5 => pO5.name).join(', '),
                    pIncs: ' ' + (Array.from(pBase.pO5.pIncs)).map(pO5 => pO5.name).join(', '),
                    aAll: ' ' + pBase.aAll.map(tag => tag.id).join(', ')
                })
            }
            C.ConsoleInfo(`Базы ${head}`, rez.length, rez)

            rez.length = 0
            for (const { key, frame } of wshp.Frames.Frame) {
                rez.push({
                    key: key,
                    tcn: frame.typ + ':' + frame.cod + ':' + frame.num,
                    pO5: frame.pO5.name,
                    aO5fs: frame.aO5fs.map(a => a.a_name).join(', '),
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
            const
                errs = [],
                cls = aO5.cls,
                puts = cls.puts,
                mselec = /[A-Z]|a-z]|[+-]?\d+/g

            Object.assign(cls, {           // для повторной инициализации (напр. в тестах)
                level: 0,
                pitch: 'S',
                nofx: false,
                alive: false,
            })
            puts.T = puts.L = puts.R = puts.B = false

            const cs = ss.toUpperCase().match(mselec)
            for (const c of cs)
                switch (c) {
                    case 'A': cls.alive = true
                        break
                    case 'C':                // сжимает предыдущий
                    case 'P':                // сталкивает предыдущий
                    case 'S':                // сдвигает предыдущий
                    case 'O': cls.pitch = c  // наезжает на предыдущий
                        break
                    case 'T':
                    case 'L':
                    case 'R':
                    case 'B': puts[c] = true
                        break
                    case 'N': cls.nofx = true; break    // не подвисает, но может сдвигать остальные
                    default:
                        if (!isNaN(c)) cls.level = Number(c)
                        else
                            errs.push(`c='${c}' в "${ss}"`)
                }
            if (!puts.T && !puts.L && !puts.R && !puts.B) puts.T = true
            
            if (errs.length)
                console.log("%c%s", fmtErr, `Для ${aO5.name} не опр. квалиф.: ` + errs.join(', '))
        },

        ReadAttrs = aO5 => {
            const aquals = aO5.act.quals.split(/[:;]/)
            let sclss = 'T', sdivs = '';
            switch (aquals.length) {
                case 0: break
                case 1:
                    if (aquals[0].indexOf('=') < 0) sclss = aquals[0]
                    else sdivs = aquals[0]
                    break
                case 2:
                    sclss = aquals[0]
                    sdivs = aquals[1]
                    break
                default:
                    sclss = aquals[0]
                    sdivs = aquals.slice(1).join(',')
            }

            ReadCls(aO5, sclss) // разделяющие запятые там просто игнорируются

            wshp.Frames.MakeFrames(aO5, sdivs.split(','))
        }

    const
        Observe = entries => {
            const
                oO5s = new Set()
            for (const entry of entries) {
                const shp = entry.target
                let aO5 = shp.aO5shp
                // if (aO5 && aO5.act.isfix ) continue

                // console.error(
                //     (aO5 ? (aO5.a_name + ' ' + (aO5.act.isfix ? 'fix' : 'нет')) : ' -  ') +
                //     `  isIntersecting=${entry.isIntersecting}, intersectionRatio=${entry.intersectionRatio}`)
                if (entry.isIntersecting) {
                    if (!aO5) {
                        const el = observ.getel(shp)
                        aO5 = new wshp.AO5shp.AO5(shp, el.quals)
                        aO5.act.observer = state.observer
                        oO5s.add(aO5)
                    }

                    if (entry.intersectionRatio === 1)  //   && !aO5.act.isfix  (необязательно)
                        aO5.act.ready = true
                }
                else {
                    if (aO5 && !aO5.act.isfix)
                        aO5.act.ready = false
                }
            }

            if (oO5s.size > 0) {
                const bBases = new Set()
                let isNew = false
                for (const aO5 of oO5s) {
                    if (wshp.PBases.PBase.AddToBase(aO5))  // если добавилась новая база
                        isNew = true

                    ReadAttrs(aO5)
                    bBases.add(aO5.base.pBase)

                    // для тестирования в frames.html
                    window.dispatchEvent(new CustomEvent('o5_containers', { detail: { aO5: aO5, } }))
                }

                for (const bBase of bBases)
                    bBase.ReorderAO5s()

                if (isNew)
                    for (const x of 'TL')
                        wshp.DoChgs.SetBorders(x, body.pO5)

                if (o5debug > 1)
                    DebugShowRez(oO5s)
            }
            oO5s.clear()
        }

    /**
     * создаёт наблюдателя за элементами
     * @function CreateObserver
     */
    function CreateObserver(options) {

        state.observer = new IntersectionObserver(Observe, options)

        function getel(tag) {
            for (const el of state.elements)
                if (el.tag === tag)
                    return el
        }

        return {
            observe: (tag, quals) => {
                state.elements.add({ tag: tag, quals: quals ? quals.join(':') : '' })
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
