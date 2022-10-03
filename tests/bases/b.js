
function AddEventListener(tag, event, fun) {
    tag.addEventListener(event, fun)
    tag.aO5snd.events.push({ event: event, fun: fun })
}

function DoStart() {
    const tags = [],
        imgs = SrcImgs()
    for (let i = 1; i < 10; i++) {
        const tag = document.getElementById('' + i)
        if (!tag) continue

        tag.aO5snd = {
            id: tag.id,
            snd: tags[i],
            src: tag.getAttribute('src'),
            data_src: tag.dataset['src'],
            _src: tag.getAttribute('_src'),
            sound: { audio: null, errIs: false, isPlay: false },
            parms: { dspl: tag.style.display },
            image: { stop: null, play: null, img_play: tag.getAttribute('img_play'), ini:{stop: false, play: false} },
            events: [],
        }

        if (tag.aO5snd.data_src) imgs.imgForRef(tag, tag.aO5snd.data_src)
        else if (tag.aO5snd._src) imgs.imgForRef(tag, tag.aO5snd._src)
        else if (tag.aO5snd.src) imgs.regiBySrc(tag)
        else console.error(`img-тег 'id=${tag.id}' не имеет ни одного адресного атрибута`)

        AddEventListener(tag, 'click', (e) => {
            imgs.switchSrc(e.target) //, e.target.aO5snd.play.image)
            // ? искать ближайший тег для события !!            
        })
        tags[i] = tag
    }
}