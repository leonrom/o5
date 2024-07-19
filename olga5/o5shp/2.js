/*
    отработка подвисаний на ближайших границах
*/
const CheckIsUp = (aO5, canPush) => {
    const allbords = aO5.allbords,
        posC = aO5.posC,
        IsConnect = iO5 => {
            const posI = iO5.posW,
                clsI = iO5.cls
            return (
                (posI.left > posC.left && posI.left < posC.right) ||
                (posI.right < posC.right && posI.right > posC.left)
            ) && (
                    (clsI.dirV == 'U' && posI.top < posC.bottom) ||
                    (clsI.dirV == 'D' && posI.bottom > posC.top)
                )
        },
        DoPush = () => {
            //     if (iO5.cls.level <= level){
            //         if(clsI.dirV == 'U'){
            //             const d= posC.bottom-posI.top
            //             posC.height-=d
            //             if (posC.height < 0){
            //                 aO5.act.pushedBy=true
            //             }else{
            //             posC.bottom-=d
            //             posC.paddingTop-=d}
            //         }
            //     }
            //     iO5.DoFixV(aO5)

            //     iO5.act.checkStep = checkStep
            //     n++
            // },
            // DoAttach=()=>{

            if (cls.putV == 'T') {
                const d = iO5.posC.top + iO5.posC.height - posC.top
                if (cls.dirV == 'U' || cls.remo) { //только при движении вверх
                    if (d > 0) {
                        if (cls.level <= iO5.cls.level) {
                            if (cls.pitch == 'P' || iposC.height <= d) HideByO5(iO5)
                            else
                                if (cls.pitch == 'S') {
                                    iposC.height -= d
                                    iposS.top = -d
                                }
                                else
                                    if (cls.pitch == 'C') {
                                        iposC.height -= d
                                        // iposS.height = -d
                                    }
                        } else
                            if (cls.dirV == 'U')
                                aO5.DoFixV(iO5)
                    }
                } else
                    if (cls.dirV == 'D') // никаких просто else - всегда проверять!
                        if (posC.top + posC.height > aO5.located.bo.pos.bottom) {
                            if (cls.level <= iO5.cls.level) iO5.Hide()  // iO5.act.dspl = false
                            else aO5.DoFixV(iO5)
                        }
            } else {//                    if (cls.putV == 'B') { // можно и не проверять,                    
                const posW = aO5.posW
                if (cls.dirV == 'U' && posW.top < aO5.hovered.to.pos.top) {
                    if (cls.level <= iO5.cls.level) HideByO5(iO5)
                    else aO5.DoFixV(iO5)
                } else {
                    const b = aO5.hovered.bo.pos.bottom
                    if (cls.dirV == 'D' && posW.top < b) {
                        if (cls.pitch == 'P' || posW.top + posW.height <= 1 + b) HideByO5(iO5)
                        else {
                            if (cls.pitch == 'S' || cls.pitch == 'C') {
                                iposC.height = iO5.posW.height - (b - posW.top)
                                if (iposC.height <= 1) iO5.Hide()  // iO5.act.dspl = false
                            } else
                                if (posW.top + posW.height <= b) aO5.DoFixV(iO5)
                        }
                    }
                }
            }



            for (const bord of allbords) {
                const iO5s = bord.pO5.aO5s

                for (const iO5 of iO5s)
                    if ((iO5.cls.alive || !iO5.act.isKilled) &&
                        iO5 !== aO5 && !iO5.act.checkup && iO5.act.checkStep !== checkStep)
                        if (IsConnect(iO5)) {
                            if (canPush && iO5.cls.level <= level)
                                DoPush()
                            else
                                if (!canPush && iO5.cls.level > level)
                                    iO5.DoFixV(aO5)
                        }

            }
        },
        CheckPush = (aO5, canPush) => {
            const allbords = aO5.allbords,
                posC = aO5.posC

            for (const bord of allbords) {
                const iO5s = bord.pO5.aO5s

                for (const iO5 of iO5s)
                    if ((iO5.cls.alive || !iO5.act.isKilled) &&
                        iO5 !== aO5 && !iO5.act.checkup && iO5.act.checkStep !== checkStep &&
                        ((canPush && iO5.cls.level <= level) || (!canPush && iO5.cls.level > level))
                    ) {
                        const posI = iO5.posW,
                            clsI = iO5.cls

                        if ((
                            (posI.left > posC.left && posI.left < posC.right) ||
                            (posI.right < posC.right && posI.right > posC.left)
                        ) && (
                                (clsI.dirV == 'U' && posI.top < posC.bottom) ||
                                (clsI.dirV == 'D' && posI.bottom > posC.top)
                            )
                        ) {
                            if (iO5.cls.level <= level) {
                                if (clsI.dirV == 'U') {
                                    const d = posC.bottom - posI.top
                                    posC.height -= d
                                    if (posC.height < 0) {
                                        aO5.act.pushedBy = true
                                    } else {
                                        posC.bottom -= d
                                        posC.paddingTop -= d
                                    }
                                }
                            }
                            iO5.DoFixV(aO5)

                            iO5.act.checkStep = checkStep
                            n++
                        }
                    }
            }
        },
        CheckAttach = (aO5, canPush) => {
            /*
               поиск, кто на него наткнулся
            */
            const allbords = aO5.allbords,
                posC = aO5.posC

            for (const bord of allbords) {
                const iO5s = bord.pO5.aO5s

                for (const iO5 of iO5s)
                    if ((iO5.cls.alive || !iO5.act.isKilled) &&
                        iO5 !== aO5 && !iO5.act.checkup && iO5.act.checkStep !== checkStep &&
                        ((canPush && iO5.cls.level <= level) || (!canPush && iO5.cls.level > level))
                    ) {
                        const posI = iO5.posW,
                            clsI = iO5.cls

                        if ((
                            (posI.left > posC.left && posI.left < posC.right) ||
                            (posI.right < posC.right && posI.right > posC.left)
                        ) && (
                                (clsI.dirV == 'U' && posI.top < posC.bottom) ||
                                (clsI.dirV == 'D' && posI.bottom > posC.top)
                            )
                        ) {
                            if (iO5.cls.level <= level) {
                                if (clsI.dirV == 'U') {
                                    const d = posC.bottom - posI.top
                                    posC.height -= d
                                    if (posC.height < 0) {
                                        aO5.act.pushedBy = true
                                    } else {
                                        posC.bottom -= d
                                        posC.paddingTop -= d
                                    }
                                }
                            }
                            iO5.DoFixV(aO5)

                            iO5.act.checkStep = checkStep
                            n++
                        }
                    }
            }
        }
    }