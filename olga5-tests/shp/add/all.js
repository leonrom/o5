const
    shpX_SetWindow = (w0, h0) => {
        "use strict"
        if (window.name.indexOf('olga5_popup_') < 0) // если НЕ было открыто из родителя ---
            return

        const aw = window.screen.availWidth,
            ah = window.screen.availHeight,
            w = aw > w0 ? w0 : aw,
            h = ah > h0 ? h0 : ah

        window.resizeTo(w, h)
        window.moveTo(aw - w - 5, 5)
        console.log(markout + `PopUp: w0=${w0}, aw=${aw}, w=${w}, aw - w=${aw - w}`)

        window.olga5.C.E.AddEventListener('beforeunload', function () {
            window.opener.postMessage(window.name, '*');
        })
        document.addEventListener('blur', function () {
            window.focus()
        })

        const show1 = '***',
            nam = window.document.title,
            focusTimer = window.setInterval(function () {
                try {
                    window.document.title = (window.document.title == show1) ? nam : show1
                } catch (e) {
                    console.log(markout + 'Прекращено `focusTimer`, причина: ' + e.message);
                    window.clearInterval(focusTimer);
                }
            }, 888)
        return true
    },
    shpX_ChgDirPos = cb => {
        "use strict";

        const sDoff = 10514, // '&#8673;', //'<b>&uarr;</b>',
            sDon = 8613, // '&#8675;', //'<b>&darr;</b>',
            sFoff = 8868,
            sFon = 8869

        if (cb) {
            const t = cb.id.substr(0, 1), // тип 'd' или 'p'
                nom = cb.id.substr(5), // номер строки, т.е. номер shp
                shp = document.getElementById('shp' + nom),
                cls = shp.aO5shp.cls
            if (t == 'd') cls.dirV = cb.innerHTML.charCodeAt(0) == sDon ? 'U' : 'D'
            if (t == 'p') cls.putV = cb.innerHTML.charCodeAt(0) == sFon ? 'T' : 'B'
        }

        const shps = document.querySelectorAll("[id ^= shp]"),
            dmarks = document.querySelectorAll("[id ^= dmark]"),
            pmarks = document.querySelectorAll("[id ^= pmark]")

        for (const ishp in shps) { // не заморачиваюсь: отображение каждый раз пересчитыать для всех
            const shp = shps[ishp]
            if (!shp.aO5shp || !shp.id || shp.id.indexOf('_') >= 0) continue

            const cls = shp.aO5shp.cls,
                k = shp.id.substr(3)

            for (const dmark of dmarks) {
                if (dmark.id.substr(5) == k) {
                    const down = cls.dirV == 'D'
                    dmark.innerHTML = '&#' + (down ? sDon : sDoff) + ';'
                    dmark.title = "направление начала залипания= " + (down ? 'Снизу' : 'Верх')
                    break
                }
            }
            for (const pmark of pmarks) {
                if (pmark.id.substr(5) == k) {
                    const bottom = cls.putV == 'B'
                    pmark.innerHTML = '&#' + (bottom ? sFon : sFoff) + ';'
                    pmark.title = "место залипания= " + (bottom ? 'НИЗ' : 'ВЕРХ')
                    break
                }
            }
        }
    },
    shpX_BordNames = () => {
        "use strict"
        const wshp = window.olga5.o5shp
        if (!wshp) return

        const tshpsp = document.getElementById('tshpsp'),
            pitches = { 'O': 'ver', 'S': 'hift', 'P': 'ush', 'C': 'lench' },
            dirput = { 'T': 'op', 'B': 'ottom', 'U': 'p', 'D': 'own', '': '' },
            Sid = (t, pO5) => {
                const nam = pO5 ? (pO5.id ? pO5.id : (pO5.current.nodeName)) : '?'
                return ' <i>' + t + '</i>=' + nam + ', '
            }

        for (const aO5 of wshp.aO5s) {
            const ps = aO5.shp.getElementsByTagName('p'),
                cls = aO5.cls,
                o = aO5.owner, //.botNam,
                f = aO5.ofram, //.botNam,
                // s1 = ' к.=' + (cls.alive ? ':<b>A</b>live' : '') + (cls.level > 0 ? ':<b>' + cls.level + '</b>' : '0'),
                // s2 = ':<b>' + cls.dirV + '</b>' + dirput[cls.dirV],
                // s3 = ':<b>' + cls.putV + '</b>' + dirput[cls.putV],
                s = '[<b><u>' + aO5.id + '</u></b>]/' +
                    aO5.cls.level +
                    ' к.=' + (cls.alive ? ':<b>A</b>live' : '') +
                    (cls.level > 0 ? ':<b>' + cls.level + '</b>' : '0') +
                    ':<b>' + cls.dirV + '</b>' + dirput[cls.dirV] +
                    ':<b>' + cls.putV + '</b>' + dirput[cls.putV] +
                    ':<b>' + cls.pitch + '</b>' + pitches[cls.pitch] +
                    '<br/>&nbsp;o5ofram= ' + aO5.ofram.attr +
                    '<br/>&nbsp;o5owner= ' + aO5.owner.attr +
                    '<br/>f: ' + Sid('t', f.to) + Sid('b', f.bo) + Sid('l', f.le) + Sid('r', f.ri) +
                    '<br/>o: ' + Sid('t', o.to) + Sid('b', o.bo) + Sid('l', o.le) + Sid('r', o.ri)

            if (ps && ps.length > 0)
                ps[0].innerHTML = s
            else
                console.log(markout + "%c%s", fmtErr, `alltst.js->shpX_BordNames(): объект ${aO5.name} `, ` не содержит тег <p>`)
            // if (aO5.aO5s.length > 0) FillDescription(aO5.aO5s)
        }
    },    
 C2a=cb=> {
    shpX_ChgDirPos(cb)
    window.olga5.o5shp.DoResize(`CC2a(${cb})`)
}