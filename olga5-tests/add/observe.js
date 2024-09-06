function Inito() {
    "use strict";
    const
        callback1 = (entries, observP) => {
            entries.forEach(entry => {
                let u = ''

                if (entry.isIntersecting) {
                    const r = entry.intersectionRect
                    u = 'видно ' + parseFloat(entry.intersectionRatio).toFixed(2) +
                        ` : ` +
                        `  t:${r.top.toFixed(1).padStart(5)},` +
                        `  h:${r.height.toFixed(1).padStart(5)},` +
                        `  b:${r.bottom.toFixed(1).padStart(5)},` +
                        ` -- ` +
                        `  l:${r.left.toFixed(1).padStart(5)},` +
                        `  w:${r.width.toFixed(1).padStart(5)},` +
                        `  r:${r.right.toFixed(1).padStart(5)},`
                }
                else
                    u = 'исчез'

                if (u)
                    console.log(`'${observP.root ? observP.root.id : 'окно'}': '${entry.target.id}' -> ${u.padEnd(12)}`)
            })
        }

    const
        threshold1 = [0, 0.2, 0.3, 0.5, 0.6, 0.8, 1],
        threshold = [0.01],
        obs_tab2 = new IntersectionObserver(callback1, {
            root: document.getElementById('tab2'),
            rootMargin: '0px',
            threshold: threshold,
        }),
        obs_tab3 = new IntersectionObserver(callback1, {
            root: document.getElementById('tab3'),
            rootMargin: '0px',
            threshold: threshold,
        }),
        obs_main = new IntersectionObserver(callback1, {
            root: document.getElementById('main'),
            rootMargin: '0px',
            threshold: threshold,
        }),
        obs_root = new IntersectionObserver(callback1, {
            //    root:document.getElementById('main'),
            rootMargin: '0px',
            threshold: threshold,
        }),
        shp1 = document.getElementById('shp1'),
        shp2 = document.getElementById('shp2'),
        shp3 = document.getElementById('shp3')

    obs_tab3.observe(shp3)
    obs_main.observe(shp3)
    obs_root.observe(shp3)

    //    obs_main.observe(shp2)
    //    obs_root.observe(shp2)

    //    obs_root.observe(shp1)

    // const
    //     nams = ['shp1', 'shp2', 'shp3'],
    //     shps = []
    // for (const nam of nams) {
    //     const shp = document.getElementById(nam)
    //     if (shp) {
    //         shps.push(shp)

    //         obs_tab3.observe(shp)
    //         obs_main.observe(shp)

    //         console.log(`добавлен объект '${nam}`)
    //     }
    //     else
    //         console.error(`нет объекта '${nam}`)
    // }
}

document.addEventListener("DOMContentLoaded", Inito)
