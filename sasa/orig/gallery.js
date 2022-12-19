function Gallery() {
    const pics = document.getElementsByClassName('col-md-2'),
        base = document.baseURI,
        ss=[''],
        us=['']
    console.log('загружен', base)
    let n=0
    for (const pic of pics) {
        const src = pic.getAttribute('data-src'),
            qs = pic.querySelector('div[itemprop]'),
            prop = qs ? qs.innerText : '',
            u=(++n +'').padStart(3,'0')
        ss.push(u+'.' + prop.padEnd(66), base + src)
        us.push('wget2 ' + base + src)
    }

    console.log(ss.join('\n'))
    console.log(us.join('\n'))
}