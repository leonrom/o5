function Init1() {
    const nams = ['strt', 'main', 'tab2', 'tbod', 'shp1', 'shp2', 'shp3'],
        divs = [],
        nsts = [],
        recs = []

    for (const nam of nams) {
        const div = document.getElementById(nam),
            nst = window.getComputedStyle(div),
            rec = div.getBoundingClientRect(),
            gval = (ask) => { return nst.getPropertyValue(ask) },
            putw = (val) => { return ('' + Math.round(parseFloat(val)).toFixed(1)).padStart(7) },
            n = { width: putw(gval('width')), height: putw(gval('height')) },
            r = { width: putw(rec.width), height: putw(rec.height) }
        console.log(nam + ' => width:  nst=' + n.width + ', rec=' + r.width + ' ' + ((n.width - r.width) + '').padStart(7) +
            ' ...   height: nst=' + n.height + ', rec=' + r.height + ' ' + ((n.height - r.height) + '').padStart(7) +
            ', client_h='+putw(div.clientHeight)+', offset_h='+putw(div.offsetHeight))
    }

    let nst = null,
        rec = null,
        val = 0,
        nam = 'shp2'
        
    const div = document.getElementById(nam)
        n=11111

    nam = 'getComputedStyle'
    console.time(nam)
    for (let i = 0; i < n; i++) {
        nst = window.getComputedStyle(div)
        val = nst.getPropertyValue('height')
    }
    console.timeEnd(nam)

    nam = 'getComputedStyl1'
    console.time(nam)
    for (let i = 0; i < n; i++) {
        nst = window.getComputedStyle(div)
        val = nst.height
    }
    console.timeEnd(nam)

    nam = 'getComputedStyl2'
    console.time(nam)
    for (let i = 0; i < n; i++) {
        nst = window.getComputedStyle(div)
    }
    console.timeEnd(nam)


    nam = 'getBoundingClientRect'
    console.time(nam)
    for (let i = 0; i < n; i++) {
        rec = div.getBoundingClientRect()
    }
    console.timeEnd(nam)
}