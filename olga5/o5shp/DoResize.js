/* -global window, console */
/*jshint asi:true  */
/*jshint strict:true  */
/*jshint esversion: 6 */
//!
(function () {              // ---------------------------------------------- o5shp/DoResize ---
    "use strict"
    let wshp = {},
        o5debug = 0,
        firstResize = true,
        debugids = ['head_32']  //  shp_5÷8 'shp_text' // 'shp_1÷4' // 'shp-demo' // 'shp_text'

    const
        olga5_modul = "o5shp",
        modulname = 'DoResize',
        C = window.olga5.C,
        IsInClass = (classList, clss) => {
            for (const cls of clss)
                if (cls !== '' && !classList.contains(cls)) return false
            return true
        },
        FillAsk =  (aO5, ask, act, timeStamp) => {
            const t = ask.typ,
                c = (ask.cod || '').trim(),
                cu = c.toUpperCase(),
                clss = c.split(/[.,]/),
                parents = aO5.prev.pO5.prevs,
                k2 = parents.length

            for (let k = 0; k < k2; k++) {
                const parent = parents[k],
                    pO5 = parent.pO5,
                    final = pO5.isFinal  // || (!ask.fix && pO5.current.aO5shp)

                if (t == 'S' ) {    // && pO5.scroll.tim != timeStamp) {
                    const current = pO5.current

                    Object.assign(pO5.scroll, {
                        tim: timeStamp,
                        yesV: current.offsetWidth > (current.clientWidth + pO5.scroll.dw),
                        yesH: current.offsetHeight > (current.clientHeight + pO5.scroll.dh),
                    })
                }

                ask.ok =
                    (t == 'I' && pO5.id == c && ask.nY-- <= 1) ||
                    (t == 'N' && (cu === '' ? final : (parent.nodeName == cu && ask.nY-- <= 1))) ||
                    (t == 'C' && IsInClass(parent.classList, clss) && ask.nY-- <= 1) ||
                    (t == 'S' && (final || pO5.scroll.yesV)) ||
                    (t == 'B' && (final || (aO5.cls.dirV != 'D' && pO5.cdif.ct) || (aO5.cls.dirV != 'U' && pO5.cdif.cb)))
                // (t == 'B' && (final || (aO5.cls.dirV == 'U' && pO5.cdif.ct) || (aO5.cls.dirV == 'D' && pO5.cdif.cb)))

                if (ask.ok)
                    ask.bords.push(...parents.slice(k, ask.fix ? k + 1 : k2))

                if (ask.ok || final) break
            }

            if (ask.bords.length === 0) {
                const subst = parents[k2 - 1],
                    nam = window.olga5.C.MakeObjName(subst),
                    i = ask.bords.indexOf(nam)

                if (errs.length > 0 && firstResize)
                    C.ConsoleError(`Для тега '${aO5.name}' типа '${act} не найден ${(t + ':' + c)}'` )                    
                // errs.push({ aO5: aO5.name, 'для типа': act, 'не найден': (t + ':' + c), 'подставлен': (i < 0 ? '+ ' : '= ') + nam })
                if (i < 0)
                    ask.bords.push(subst)
            }
        },
        DoResize=(txt)=>{
            o5debug = C.consts.o5debug
    
            // // CalcSizes(aO5s)
            // // FillBlngsAll({ timeStamp: Date.now() + Math.random() })
    
            // if (o5debug > 2)
            // console.log('  >> FillBlngs: aO5s=' + C.MyJoinO5s(aO5s))
            
            // for (const blng of [aO5.oframs, aO5.owners]) {
            //     for (const ask of blng.asks) {
            //         ask.bords.splice(0, ask.bords.length)
            //         Object.assign(ask, { nY: ask.num, ok: false })
            //     }
            //     for (const ask of blng.asks)
            //         FillAsk(aO5, ask, blng.act, timeStamp)
            // }
    
            // const asks = aO5.owners.asks,
            //     allbords = aO5.allbords
    
            // for (const ask of asks) 
            //     for (const bord of ask.bords) 
            //         if (!allbords.includes(bord))
            //             allbords.push(bord)
            // firstResize = false
    
            // C.E.AddEventListener('resize', FillBlngsAll)
            // wshp.OldScroll(wshp.aO5s)
        }    

    wshp = C.ModulAddSub(olga5_modul, modulname, DoResize        )

})();
