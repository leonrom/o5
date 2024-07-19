        // CutBounds = (aO5) => {
        //     const putV = aO5.cls.putV,
        //         act = aO5.act,
        //         posC = aO5.posC,
        //         top = aO5.located.to.pos.top,
        //         bT = (putV == 'T') ? Math.max(aO5.hovered.to.located.to.pos.top, top) : top,
        //         bot = aO5.located.bo.pos.bottom,
        //         bB = (putV == 'B') ? Math.min(aO5.hovered.bo.located.bo.pos.bottom, bot) : bot,
        //         bL = aO5.located.le.pos.left, // эти два - без выпендрёжа
        //         bR = aO5.located.ri.pos.right

        //     if (debugids.includes(aO5.id))
        //         if (debugids); // контрольный останов
        //     if (bT > bB || bL >= bR) {
        //         // if (act.wasClick && act.dspl)
        //         //     aO5.SetClick(false)
        //         // aO5.Hide()
        //     } else {
        //         // if (aO5.fix.putV) 
        //         {
        //             if (posC.top < bT) {
        //                 const d = bT - posC.top
        //                 if (posC.height <= d) aO5.Hide()
        //                 else {
        //                     posC.top = bT
        //                     posC.height -= d
        //                     aO5.posS.top -= d
        //                 }
        //             }
        //             if (act.dspl && posC.top + posC.height > bB) {
        //                 if (posC.top >= bB) aO5.Hide()
        //                 else posC.height -= posC.top + posC.height - bB
        //             }
        //         }
        //         if (act.dspl && bL > posC.left) {
        //             const d = bL - posC.left
        //             if (d >= posC.width) aO5.Hide()
        //             else {
        //                 posC.left = bL
        //                 posC.width -= d
        //                 aO5.posS.left -= d
        //             }
        //         }
        //         if (posC.left + posC.width > bR) {
        //             if (posC.left >= bR) aO5.Hide()
        //             else
        //                 posC.width -= (posC.left + posC.width - bR)
        //         }
        //     }
        // },
        // CheckIsUp = function (k, aO5s) {
        //     const aO5 = aO5s[k],
        //         cls = aO5.cls,
        //         posC = aO5.posC,
        //         minIndex = aO5s[0].cls.zIndex - 1,
        //         HideByO5 = (iO5) => {
        //             iO5.Hide()  // iO5.act.dspl = false
        //             iO5.act.pushedBy = aO5
        //             iO5.cart.style.zIndex = minIndex
        //         }
        //     let i = k
        //     while (--i >= 0) {
        //         const iO5 = aO5s[i],
        //             iposC = iO5.posC,
        //             iposS = iO5.posS
        //         if (cls.putV != iO5.cls.putV || posC.left + posC.width < iposC.left || posC.left > iposC.left + iposC.width || !iO5.act.dspl)
        //             continue
        //         if (cls.putV == 'T') {
        //             const d = iO5.posC.top + iO5.posC.height - posC.top
        //             if (cls.dirV == 'U' || cls.remo) { //только при движении вверх
        //                 if (d > 0) {
        //                     if (cls.level <= iO5.cls.level) {
        //                         if (cls.pitch == 'P' || iposC.height <= d) HideByO5(iO5)
        //                         else
        //                             if (cls.pitch == 'S') {
        //                                 iposC.height -= d
        //                                 iposS.top = -d
        //                             }
        //                             else
        //                                 if (cls.pitch == 'C') {
        //                                     iposC.height -= d
        //                                     // iposS.height = -d
        //                                 }
        //                     } else
        //                         if (cls.dirV == 'U')
        //                             aO5.DoFixV(iO5)
        //                 }
        //             } else
        //                 if (cls.dirV == 'D') // никаких просто else - всегда проверять!
        //                     if (posC.top + posC.height > aO5.located.bo.pos.bottom) {
        //                         if (cls.level <= iO5.cls.level) iO5.Hide()  // iO5.act.dspl = false
        //                         else aO5.DoFixV(iO5)
        //                     }
        //         } else {//                    if (cls.putV == 'B') { // можно и не проверять,                    
        //             const posW = aO5.posW
        //             if (cls.dirV == 'U' && posW.top < aO5.hovered.to.pos.top) {
        //                 if (cls.level <= iO5.cls.level) HideByO5(iO5)
        //                 else aO5.DoFixV(iO5)
        //             } else {
        //                 const b = aO5.hovered.bo.pos.bottom
        //                 if (cls.dirV == 'D' && posW.top < b) {
        //                     if (cls.pitch == 'P' || posW.top + posW.height <= 1 + b) HideByO5(iO5)
        //                     else {
        //                         if (cls.pitch == 'S' || cls.pitch == 'C') {
        //                             iposC.height = iO5.posW.height - (b - posW.top)
        //                             if (iposC.height <= 1) iO5.Hide()  // iO5.act.dspl = false
        //                         } else
        //                             if (posW.top + posW.height <= b) aO5.DoFixV(iO5)
        //                     }
        //                 }
        //             }
        //         }
        //     }
        // },
