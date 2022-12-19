/*
 <img alt="" title="" itemprop="contentUrl"
    style="width: 100%"
    data-lightbox="/uploads/s/m/o/i/moipxfgziw0x/img/full_UWquGAUp.jpeg"
    src="/uploads/s/m/o/i/moipxfgziw0x/img/autocrop/7abb850a5cb418be9d7e5da11015c737.jpeg"
    loading="lazy" decoding="async">
*/

function Main() {
    const pics = document.getElementsByTagName('img'),
        base = document.baseURI,
        ss=[''],
        us=['']
    console.log('загружен', base)
    let n=0
    for (const pic of pics) {
        const src = pic.getAttribute('data-lightbox'),
            alt = pic.getAttribute('alt'),
            title = pic.getAttribute('title'),
            u=(++n +'').padStart(3,'0')
        ss.push(u+'.' + alt.padEnd(66)+'.'+title, base + src)
        us.push('wget2 ' + base + src)
    }

    console.log(ss.join('\n'))
    console.log(us.join('\n'))
}