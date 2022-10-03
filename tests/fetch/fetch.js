function DoFetch(url, dest) {
    // const
    //     toDataURL1 = url => fetch(url, { mode: 'no-cors' })
    //         .then(response => response.blob())
    //         .then(blob => new Promise((resolve, reject) => {
    //             const reader = new FileReader()
    //             reader.onloadend = () => resolve(reader.result)
    //             reader.onerror = reject
    //             reader.readAsDataURL(blob)
    //         }))

    const toDataURL = url => {
        const f = fetch(url, { mode: 'no-cors' })
            .then(response => {
                const r = response.blob()
                console.log(`response: ok='${response.ok}', type='${response.type}', statusText='${response.statusText}', status='${response.status}'`)
                return r
            })
            .then(blob => {
                console.log(`blob='${blob}'`)
                p = new Promise((resolve, reject) => {
                    const reader = new FileReader()
                    reader.onloadend = () => {
                        console.log(`reader.result='${reader.result}'`)
                        resolve(reader.result)                        
                    }
                    reader.onerror = reject
                    reader.readAsDataURL(blob)
                })
                return p
            })
        return f
    }

    toDataURL(url).then(dataUrl => {
        console.log(`DoFetch data='${dataUrl.substr(0, 44)}'`)
        dest.setAttribute('src', dataUrl)
    }).catch(e => {
        console.error(`Ошибка: ${e.name}`)
    })
}

const b2 = '../..',
    b1 = 'https://rombase.neocities.org/o5'

let n = 1 // д.б. на 'solfedjio.png'

function NextFetch(img) {
    let url = ''
    n++
    switch (n) {
        case 1: url = b1 + '/blog/media/image/solfedjio.png'
            break
        case 2: url = b1 + '/blog/media/image/play.png'
            break
        case 3: url = b1 + '/blog/media/image2/ext2.2.png'
            break
        case 4: url = b1 + '/blog/media/image/logscreen.png'
            break
    }
    if (n == 4) n = 0

    console.log(`DoFetch url='${url}'`)
    DoFetch(url, img)
}

function DoStart() {
    const img = document.getElementById('img1'),
        txt = document.getElementById('txt1')
    img.addEventListener('click', () => NextFetch(img))
    console.log(`DoStart...`)
}