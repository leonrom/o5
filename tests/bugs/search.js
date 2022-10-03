OnScroll = function (e) {
    if (wshp.wasResize) { //  && !wshp.extraInit) {
        const pO5 = e.target.pO5
        if (pO5) {
            const aO5s = (pO5.owns.own ? pO5.owns.own: wshp).aO5s
            wshp.DoScroll(aO5s, e.timeStamp)
        }
    }
}

In my js-code:
OnScroll = function (e) {
    if (wshp.wasResize) { //  && !wshp.extraInit) {
        const pO5 = e.target.pO5
        if (pO5) {
            const aO5s = (pO5.owns.own ? pO5.owns.own: wshp).aO5s
            wshp.DoScroll(aO5s, e.timeStamp)
        }
    }
}

"Find in folder..." found  2 lines with DIFFERENT matches:
1. const aO5s = (pO5.owns.own ? pO5.owns.own: wshp).aO5s
2. aO5s = (pO5.owns.own ? pO5.owns.own: wshp).aO5s