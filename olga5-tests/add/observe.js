// // -------------------------------------------------------        
// const observe1 = new IntersectionObserver(entries => {
//     entries.forEach(entry => {
//         if (entry.isIntersecting) {
//             console.log('Элемент видимый');
//         } else {
//             console.log('Элемент не видимый');
//         }
//     });
// });

// const shp3 = document.getElementById('shp3'); // Замените на ваш элемент
// if (shp3)
//     observe1.observe(shp3);
// // -------------------------------------------------------


function Inito() {
    "use strict";
    const
        callback1 = entries => {
            // entries.forEach(({ isIntersecting, intersectionRatio }) => {
            entries.forEach(entry => {
                let u = ''

                if (entry.isIntersecting) {
                    const r = entry.intersectionRect
                    u = 'видно ' + parseFloat(entry.intersectionRatio).toFixed(2) +
                        ` -- ` +
                        `  t:${r.top.toFixed(1).padStart(5)},`+
                        `  h:${r.height.toFixed(1).padStart(5)},`+
                        `  b:${r.bottom.toFixed(1).padStart(5)},` +
                        ` -- ` +
                        `  l:${r.left.toFixed(1).padStart(5)},`+
                        `  w:${r.width.toFixed(1).padStart(5)},` +
                        `  r:${r.right.toFixed(1).padStart(5)},`
                }
                else
                    u = 'исчез'

                if (u)
                    console.log(`'${entry.target.id}' -> '${u.padEnd(12)}'`)
            })
        },
        callback2 = entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    console.log('Элемент видимый');
                } else {
                    console.log('Элемент не видимый');
                }
            });
        }

    const observe1 = new IntersectionObserver(callback1, {
        // root: document.querySelector('.container'),
        root:document.getElementById('tab3'),
        rootMargin: '0px',
        threshold: [0, 0.2, 0.3, 0.5, 0.6, 0.8, 1],
    })
    const observe2 = new IntersectionObserver(callback2, {
        // root: document.querySelector('.container'),
        root:document.getElementById('main'),
        rootMargin: '0px',
        threshold: [0, 0.2, 0.3, 0.5, 0.6, 0.8, 1],
    })

    const
        nams = ['shp1', 'shp2', 'shp3'],
        // nams = ['shp3'],
        shps = []
    for (const nam of nams) {
        const shp = document.getElementById(nam)
        if (shp) {
            observe1.observe(shp)
            observe2.observe(shp)
            console.log(`добавлен объект '${nam}`)
        }
        else
            console.error(`нет объекта '${nam}`)
    }


    // const observe1 = new IntersectionObserver(entries => {
    //     entries.forEach(entry => {
    //         if (entry.isIntersecting) {
    //             console.log('Элемент видимый');
    //         } else {
    //             console.log('Элемент не видимый');
    //         }
    //     });
    // });

    const shp3 = document.getElementById('shp3'); // Замените на ваш элемент
    if (shp3)
        observe1.observe(shp3);


}
document.addEventListener("DOMContentLoaded", Inito)
