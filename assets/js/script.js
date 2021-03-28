function animationNotes() {

    const TWO_PI = 2 * Math.PI;
    const canvas = document.querySelector(`.start__canvas`);
    const ctx = canvas.getContext(`2d`);

    let w, h, mouse, dots, dotsCenter;
    let dotsNow = 0;
    const arrNotesImg = document.querySelectorAll('.note');
    let numNotesImg = 0;

    const config = {
        dotMinSize: 0.2,
        dotMaxSize: 0.7,
        sphereRad: 400,
        bigDotRad: 0.5,
        mouseSize: 130,
        massFactor: 0.05,
        defColor: `rgba(152, 196, 226, 0.9)`,
        smooth: 0.85,
        maxDots: 500,
        centerMassFactor: 0.05
    };

    class Dot {
        constructor(position, type, image) {
            this.pos = {x: position.x, y: position.y};
            this.vel = {x: 0, y: 0};
            this.size = type === 'note' ? random(config.dotMinSize, config.dotMaxSize) : config.bigDotRad;
            this.mass = type === 'center' ? config.centerMassFactor : this.size * config.massFactor;
            this.img = image ? image : false;
            this.rad = type === 'note' ? this.size * this.img.width : false;

        }

        draw(x, y) {
            this.pos.x = x || this.pos.x + this.vel.x;
            this.pos.y = y || this.pos.y + this.vel.y;
            createNote(this.pos.x, this.pos.y, this.img, this.size);
            // createCircle(this.pos.x, this.pos.y, this.rad);
        }
    }

    function updateDots() {
        for (let i = 1; i < dots.length; i++) {
            let acc = {x: 0, y: 0};

            function centerAcc() {
                let [a, b] = [dots[i], dotsCenter[i]];
                let delta = {x: b.pos.x - a.pos.x, y: b.pos.y - a.pos.y};

                acc.x += delta.x * 0.5;
                acc.y += delta.y * 0.5;
            }

            function cursorAcc() {
                let [a, b] = [dots[i], dots[0]];
                let delta = {x: b.pos.x - a.pos.x, y: b.pos.y - a.pos.y};
                let dist = Math.sqrt(delta.x * delta.x + delta.y * delta.y);
                let force = (dist - config.sphereRad) / dist * (b.mass);

                dist < config.mouseSize ? force = (dist - config.mouseSize) * b.mass : force = a.mass;

                acc.x += delta.x * force;
                acc.y += delta.y * force;
            }

            centerAcc();
            cursorAcc();

            dots[i].vel.x = dots[i].vel.x * config.smooth + acc.x * dots[i].mass;
            dots[i].vel.y = dots[i].vel.y * config.smooth + acc.y * dots[i].mass;

        }

        dots.map(e => {
            if (e === dots[0]) {
                e.draw(mouse.x, mouse.y);
            } else {
                e.draw();
            }
        });

        dotsCenter.map(e => {
                if (e === dotsCenter[0]) {
                } else {
                    e.draw();
                }
            }
        );
    }

    function createCircle(x, y, rad) {
        if (rad) {
            let delta = {x: x - mouse.x, y: y - mouse.y};
            let dist = Math.sqrt(delta.x * delta.x + delta.y * delta.y);
            dist = dist < 1 ? 1 : dist;


            let grdRad = 5000 / dist > rad ? rad : 5000 / dist;
            let grd = ctx.createRadialGradient(x, y, 0, x, y, grdRad);

            grd.addColorStop(0, 'rgb(152, 196, 226)');
            grd.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.beginPath();
            ctx.arc(x, y, rad, 0, TWO_PI);
            ctx.fillStyle = grd;
            ctx.closePath();
            ctx.fill();
        }
    }

    function createNote(x, y, img, sizeImg) {
        if (img) {
            let delta = {x: x - mouse.x, y: y - mouse.y};
            let dist = Math.sqrt(delta.x * delta.x + delta.y * delta.y);
            dist = dist < config.mouseSize ? 0 : dist - config.mouseSize;

            let size = {w: img.width * sizeImg, h: img.height * sizeImg};
            let position = {x: x - size.w / 2, y: y - size.h / 2};


            let alfa = dist / w * 4 > 0.95 ? 0.95 : dist / w * 4;
            ctx.globalAlpha = 1 - alfa;

            ctx.drawImage(img, position.x, position.y, size.w, size.h);
        }
    }

    function random(min, max) {
        return min + Math.random() * (max - min);
    }


    function randomInteger(min, max) {
        let rand = min + Math.random() * (max + 1 - min);
        return Math.floor(rand);
    }

    function getRandomCenterScreen(w, h) {
        let weightArr = [
            [0, w]
        ];
        let heightArr = [
            [0, h * 0.6],
            [0, h * 0.6],
            [0, h * 0.6],
            [0, h * 0.6],
            [0, h * 0.6],
            [0, h * 0.6],
            [0, h * 0.6],
            [0, h * 0.6],
            [0, h * 0.6],
            [0, h * 0.6],
            [0, h * 0.6],
            [0, h * 0.6],
            [0, h * 0.6],
            [0, h * 0.6],
            [0, h * 0.6],
            [0, h * 0.6],
            [0, h * 0.6],
            [0, h * 0.6],
            [h * 0.6, h * 0.7],
            [h * 0.7, h * 0.8]
        ];
        let rangeW = randomInteger(0, weightArr.length - 1);
        let rangeH = randomInteger(0, heightArr.length - 1);
        let weight = random(weightArr[rangeW][0], weightArr[rangeW][1]);
        let height = random(heightArr[rangeH][0], heightArr[rangeH][1]);
        return {weight, height};
    }


    function init() {
        w = canvas.width = canvas.clientWidth;
        h = canvas.height = canvas.clientHeight;

        mouse = {x: w / 2, y: h / 2, down: false};
        dots = [];
        dotsCenter = [false];
        dots.push(new Dot({x: w / 2, y: h / 2}, 'cursor'));
    }


    function loop() {
        ctx.clearRect(0, 0, w, h);

        while (dotsNow < config.maxDots) {
            let position = {x: getRandomCenterScreen(w, h).weight, y: getRandomCenterScreen(w, h).height};
            let img = arrNotesImg[numNotesImg];
            numNotesImg++;
            numNotesImg = numNotesImg === arrNotesImg.length ? 0 : numNotesImg;
            dots.push(new Dot({x: mouse.x, y: mouse.y}, 'note', img));
            dotsCenter.push(new Dot(position, 'center'));
            dotsNow++;
        }

        updateDots();

        window.requestAnimationFrame(loop);
    }

    init();
    loop();

    function setPos(e) {
        if (e.target.closest('.start__wrap')) {
            let bounding = e.target.closest('.start__wrap').getBoundingClientRect();
            [mouse.x, mouse.y] = [e.layerX + bounding.left, e.layerY + bounding.top + pageYOffset];
        } else if (e.target.closest('.header') && !e.target.closest('.nav__list a')) {
            let bounding = e.target.closest('.header').getBoundingClientRect();
            [mouse.x, mouse.y] = [e.layerX + bounding.left, e.layerY + bounding.top + pageYOffset];
        } else if (e.target.closest('.nav__list a')) {
            let bounding = e.target.closest('.nav__list a').getBoundingClientRect();
            [mouse.x, mouse.y] = [e.layerX + bounding.left, e.layerY + bounding.top + pageYOffset];
        } else if (e.target.closest('.player')) {
            [mouse.x, mouse.y] = [e.x, e.y + pageYOffset];
        } else if (e.target === canvas) {
            [mouse.x, mouse.y] = [e.layerX, e.layerY];
        } else if (e.target.closest('.song__play')) {
            let bounding = e.target.closest('.song__play').getBoundingClientRect();
            [mouse.x, mouse.y] = [e.layerX + bounding.left, e.layerY + bounding.top + pageYOffset];
        } else if (e.target.closest('.song')) {
            let bounding = e.target.closest('.song').getBoundingClientRect();
            [mouse.x, mouse.y] = [e.layerX + bounding.left, e.layerY + bounding.top + pageYOffset];
        } else if (e.target.closest('.catalog form')) {
            let bounding = e.target.closest('.catalog form').getBoundingClientRect();
            [mouse.x, mouse.y] = [e.layerX + bounding.left, e.layerY + bounding.top + pageYOffset];
        } else if (e.target.closest('.catalog')) {
            let bounding = e.target.closest('.catalog').getBoundingClientRect();
            [mouse.x, mouse.y] = [e.layerX + bounding.left, e.layerY + bounding.top + pageYOffset];
        }
    }


    // canvas.addEventListener(`mousemove`, setPos);
    document.addEventListener(`mousemove`, setPos);
}

window.onload = function () {
    animationNotes()
};

