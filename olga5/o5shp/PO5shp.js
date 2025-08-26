/* global window, document, console, CustomEvent */
/*jshint asi:true  */
/*jshint strict:true  */
/*jshint esversion: 6 */

(function () {              // ---------------------------------------------- o5shp/PO5shp ---11
    "use strict"
    let wshp;
    const
        olga5_modul = "o5shp",
        modulname = 'PO5shp',
        C = window.olga5.C,
        o5debug = C.consts.o5debug,
        fmtErr = "background: yellow; color: black;",
        fmtOK = "background: aquamarine; color: black;",
        saved = {
            last: {
                top: 0, left: 0, height: 0, width: 0,
                sV: 0, sH: 0, rV: 0, rH: 0,
                pO5: null,
                time: 0
            },
            dm: { V: 2, H: 2, dt: 100 },
            Act: (pO5, typ) => {
                const
                    scrll = pO5.scrll,
                    sl = saved.last

                if (sl.pO5 && sl.pO5 !== pO5) { // заканчиваю предыдущую цепочку скроллингов
                    if (o5debug > 2)
                        console.log("%c%s", fmtErr, `scroll ${sl.pO5.id}: `, ' закончил!')

                    Object.assign(scrll, {
                        time: sl.time,
                        top: sl.top, left: sl.left, height: 0, width: 0
                    })
                    wshp.DoChgs.MakeScroll(sl.sV || sl.rV, sl.sH || sl.rH, sl.pO5)
                    sl.pO5 = null
                }

                const
                    el = pO5.el,
                    dm = saved.dm,
                    now = performance.now(),
                    sV = el.scrollTop - scrll.top,
                    sH = el.scrollLeft - scrll.left,
                    rH = el.clientWidth - scrll.width,
                    rV = el.clientHeight - scrll.height,
                    dt = now - scrll.time >= dm.dt,
                    strt = scrll.time === 0,
                    typS = typ === 'S'

                if (
                    (Math.abs(sV) >= dm.V || dt) ||
                    (Math.abs(sH) >= dm.H || dt) ||
                    (Math.abs(rV) >= dm.V || dt) ||
                    (Math.abs(rH) >= dm.H || dt) ||
                    strt
                ) {
                    if (o5debug > 2)
                        console.log("%c%s", fmtErr, `saved ${pO5.id}: `, typ === 'S' ? 'скроллинг' : 'размеры'
                            `sV=${sV}, sH=${sH}, rV=${rV}, rH=${rH},- sT=${el.scrollTop}, aT=${scrll.top}, sL=${el.scrollLeft}, aL=${scrll.left}, `
                        )

                    Object.assign(scrll, {
                        time: now,
                        top: el.scrollTop, left: el.scrollLeft, width: el.clientWidth, height: el.clientHeight
                    })

                    wshp.DoChgs.MakeScroll(
                        strt ? 0.1 : (typS ? sV : (rV ? 0.1 : 0)),
                        strt ? 0.1 : (typS ? sH : (rH ? 0.1 : 0)),
                        pO5
                    )
                    sl.pO5 = null
                }
                else
                    if (sV || sH || rH || rH) {
                        Object.assign(sl, {
                            pO5: pO5,
                            time: now,
                            sV: sV, sH: sH, rV: rV, rH: rH,
                            top: el.scrollTop, left: el.scrollLeft, height: el.clientHeight, width: el.clientWidth
                        })
                    }
            },
            Resize: entries => {
                let n, p;
                for (const e of entries) { // ищу самый внешний контейнер
                    const
                        pO5 = e.target.pO5,
                        z = pO5.pOuts.size
                    if (n < z || !p) {
                        n = z
                        p = pO5
                    }
                }
                if (p)
                    saved.Act(p, 'R')
            }
        },
        ro = new ResizeObserver(saved.Resize)

    class PO5 {
        constructor(tag) {
            if (tag.pO5)
                C.ConsoleAlert(`Повтор создания 'pO5' для контейнера id='${tag.id}' [${tag.className.trim()}]`)

            const
                ibody = tag.nodeName == 'BODY',
                final = tag.classList.contains('olga5_Start'),
                nst = window.getComputedStyle(tag),
                classList = Array.from(tag.classList),
                el = ibody ? document.documentElement : tag

            el.pO5 = this
            tag.pO5 = this

            Object.assign(this, {
                el: el,     //   tag и el различаются только у1 тега body
                tag: tag,
                id: tag.id,
                ibody: ibody,
                final: final,
                classOrigs: classList,
                name: C.MakeObjName(tag),
                
                pOuts: [],         //  (скроллируемые pO5) все скроллируемых внешних контейнеров
                pAlls: new Set(),  //  (все pO5) список всех внешних  контейнеров
                pIncs: new Set(),  //  (скроллируемые pO5) все скроллируемых вложенных контейнеров 

                aAlls: new Set(),  // список 'всех' подвисабельных тегов (всл. влож. контейн.)
                aOwns: new Set(),  // список только 'своих' подвисабельных тегов
                aOuts: new Set(),  // список только 'чужих' подвисабельных тегов

                borders: {
                    top: parseFloat(nst.borderTopWidth),
                    left: parseFloat(nst.borderLeftWidth),
                    right: parseFloat(nst.borderRightWidth),
                    bottom: parseFloat(nst.borderBottomWidth),
                    bgColor: nst.backgroundColor
                },
                scrls: {
                    H: final || nst.overflow === 'auto' || nst.overflowX === 'auto' || nst.overflow === 'scroll' || nst.overflowX === 'scroll',
                    V: final || nst.overflow === 'auto' || nst.overflowY === 'auto' || nst.overflow === 'scroll' || nst.overflowY === 'scroll',
                },
                scrll: { // позиции скроллинга, видимые границы , текущие границы,  изменение границ от предыдущего              
                    time: -1,
                    top: el.scrollTop,
                    left: el.scrollLeft,
                    width: el.clientWidth,
                    height: el.clientHeight,
                },                
                covers: { // въезжание вложенных контейнеров
                    T: 0, L: 0, R: 0, B: 0,
                    act: { isChg: false, start:true, T: 0, L: 0, R: 0, B: 0 },
                },
                scops: {    //   координаты рабочей зоны контейнера
                    T: 0, L: 0, R: 0, B: 0
                },
            })
            for (const x of 'TLRB'){
                this.covers[x] = new Map()
                this.covers.act[x] = {mp:null, mv:NaN}
                Object.freeze(this.covers[x])
            }

            // добавляю сам себя
            this.pOuts.push(this)
            this.pAlls.add(this)
            this.pIncs.add(this)

            for (const nam of ['aOwns', 'aOuts',  'scrll', 'scops'])  // 'aAlls', 'pOuts', 'pIncs',
                Object.seal(this[nam])

            Object.freeze(this.scrls)
            Object.freeze(this.covers)
            Object.freeze(this.borders)
            Object.freeze(this)

            this.CalcScope()

            if (this.scrls.H || this.scrls.V) {
                ro.observe(el);
                (ibody ? window : el).addEventListener('scroll', () => {
                    saved.Act(this, 'S')
                })
            }

            if (o5debug > 1)
                console.log(`PO5 создано ${this.name}`)
        }
        name = ''    // еще и тут - чтобы сразу видеть в отладчике
        CalcScope() {   // видимост,- пересчитывается при скроллине в DoChgsconst
            const
                tag = this.tag,
                de = document.documentElement,
                p = this.ibody ?
                    { top: 0, left: 0, right: de.clientWidth, bottom: de.clientHeight } :
                    tag.getBoundingClientRect(),
                b = this.borders,
                atTo = tag.clientTop > b.top,         // полоса - вверху
                atLe = tag.clientLeft > b.left,       // полоса - слев       
                top = p.top + b.top + (atTo ? (tag.offsetHeight - tag.clientHeight) : 0),
                left = p.left + b.left + (atLe ? (tag.offsetWidth - tag.clientWidth) : 0)

            Object.assign(this.scops, {
                T: top,
                L: left,
                R: left + (this.ibody ? de.clientWidth : tag.clientWidth),
                B: top + (this.ibody ? de.clientHeight : tag.clientHeight)
            })
        }
    }

    wshp = C.AddModuleSub(olga5_modul, modulname, [PO5])
})();
