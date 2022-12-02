function Imgs() {
	const a = document.createElement('a'),
		FullUrl = (url) => {
			if (url.match(/https?:/i)) return url
			else {
				a.href = url
				return a.href
			}
		},
		GetImgForRef = (maps, ref) => new Promise((Resolve, Reject) => {
			if (!ref) {
				const err = `Неопределённая ref-ссылка`
				console.error(`olga5_Imgs ` + err)
				Reject(err)
			}

			const url = FullUrl(ref),
				map = maps.get(url)

			if (map) Resolve({ img: map.img, new: false })
			else {
				/*	https://codeengineered.com/blog/09/12/performance-comparison-documentcreateelementimg-vs-new-image/
				For now I’m going to continue to use document.createElement('img'). 
				Not only is this the w3c recommendation but it’s the faster method in IE8, the version users are slowly starting to adopt.
				*/
				console.log(`olga5_Imgs создание нового для url=${url}`)

				const nimg = document.createElement('img')

				nimg.crossOrigin = null
				nimg.importance = 'high'
				nimg.loading = 'eager'

				nimg.addEventListener('load', () => {
					if (C.o5debug < 0)
					console.log(`olga5_Imgs загружен url=${url}`)
					Resolve({ img: nimg, new: true })
				}, { once: true })

				nimg.addEventListener('error', (e) => {
					console.error(`olga5_Imgs : для url=${url}- ошибка ${e.message}`)
					Reject(`Ошибка подключения ссылки`)
				}, { once: true })

				maps.set(url, { img: nimg, err: '' })
				nimg.src = url
			}
		}),
		RegiBySrc = (maps, img) => new Promise((Resolve, Reject) => {
			if (img && img.src) {
				const src = img.src,
					url = FullUrl(src),
					s = url == src ? '' : `(src=${src})`

				if (maps.get(url))
					console.log(`olga5_Imgs повтор url=${url} для img.id='${img.id}' ${s}`)
				else {
					maps.set(url, { img: img.cloneNode(true), err: '' })
					console.log(`olga5_Imgs добавлен img.id='${img.id}' с url=${url} ${s}`)
				}
			}
			else
				console.error(`olga5_Imgs : попытка добавить` + (img ? `пустой src для img.id='${img.id}'` : `пустой  <img>`))
		})

	class Imgs {
		constructor() { this.maps = new Map() }
		regiBySrc = (img) => RegiBySrc(this.maps, img)
		getImgForRef = (ref) => GetImgForRef(this.maps, ref)
	}
	return new Imgs()
}

function SrcImgs() {
	/*//					попытка прочитать canvas
function StoreTo(img) {
	const canvas = document.createElement('canvas')
	document.body.appendChild(canvas)
	const c = canvas
	Object.assign(c, { height: img.naturalHeight, width: img.naturalWidth })
	const ctx = c.getContext('2d')
	try {
		ctx.drawImage(img, 0, 0, c.width, c.height)
		const blob = c.toDataURL()
		console.log(`id='${img.id}' blob=${blob ? (blob.length > 44 ? blob.substr(0, 44) + '...' : blob) : 'неопр.?'}`)
	} catch (e) {
		console.error(`id='${img.id}' blob=?- недопустимый img-тип объекта (см. olga5_BasesF.Allowed())`)
	}
}
*/
	const
		EventsOn = (tag) => {
			const events = tag.aO5snd.events
			for (const event of events)
				tag.addEventListener(event.event, event.fun)
		},
		EventsOff = (tag) => {
			const events = tag.aO5snd.events
			for (const event of events)
				tag.removeEventListener(event.event, event.fun)
		},
		FillNewImg = (newimg, img, cod) => {
			Object.assign(newimg, {
				id: img.id ? (img.id + '_' + (cod ? cod : 'stop')) : '',
				style: img.style,
				className: img.className,
				aO5snd: Object.assign({}, img.aO5snd),
			})
			const aO5 = newimg.aO5snd
			aO5.snd = newimg
			aO5.id = newimg.id
			EventsOn(newimg)
		},
		SwitchSrc = (imgs, img, toPlay) => {
			const aO5 = img.aO5snd,
				image=aO5.image,
				isPlay = (toPlay != null && typeof toPlay != 'undefined') ? toPlay : !aO5.sound.isPlay,
				Swithch = (actimg, pasimg) => {
					pasimg.style.display = 'none'
					actimg.style.display = aO5.parms.dspl
					EventsOn(actimg)
					EventsOff(pasimg)
					aO5.sound.isPlay = isPlay
				}
			if (!image.img_play) return

			if (image.play) {
				if (isPlay) Swithch(image.play, img)
				else Swithch(image.stop, img)
			} else
				if (!image.ini.stop && !image.ini.play) {
					image.ini.play = true
					imgs.getImgForRef(image.img_play).then(nimg => {
						const newimg = nimg.new ? nimg.img : nimg.img.cloneNode(true)
						FillNewImg(newimg, img)
						newimg.aO5snd.image.play = newimg
						newimg.style.display = 'none'
						img.parentNode.insertBefore(newimg, img.nextSibling)
						Swithch(newimg, img)
						image.ini.play = false // отя, в общем-то не нужно
					})
				}
		},
		ReplaceImg = (newimg, img) => {
			img.parentNode.insertBefore(newimg, img.nextSibling)
			img.parentNode.removeChild(img)
			newimg.aO5snd.snd = newimg
			newimg.aO5snd.image.stop = newimg
		},
		ImgForRef = (imgs, img, ref) => { // подставить новый nimg вместо img c 'недествительным' src				
			img.aO5snd.image.ini.stop = true	
			imgs.getImgForRef(ref, img).then(nimg => {
				const newimg = nimg.new ? nimg.img : nimg.img.cloneNode(true)
				FillNewImg(newimg, img, 'play')
				ReplaceImg(newimg, img)
				img.aO5snd.image.ini.stop = false
			})
		}

	class SrcImgs {
		constructor() { this.imgs = Imgs() }
		regiBySrc = (img) => {
			this.imgs.regiBySrc(img)
			img.aO5snd.image.stop = img
		}
		imgForRef = (img, ref) => ImgForRef(this.imgs, img, ref)
		switchSrc = (img, play) => SwitchSrc(this.imgs, img, play)
		fillNewImg = (newimg, img) => FillNewImg(newimg, img)
		replaceImg = (cimg, img) => ReplaceImg(cimg, img)
	}
	return new SrcImgs()
}