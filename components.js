import {SvgPlus} from "./SvgPlus/4.js"

export class GridIcon extends SvgPlus {
    constructor(i) {
        super("grid-icon")
        if ("video" in i){
            this.innerHTML = `<video autoplay playsinline muted loop> <source src="${i.video}" type="video/mp4"> </video>`;
            this.createChild("img", {src: "./images/blank.svg", alt: i.name});
        } else {
            let styles = { "background-image": `url('${i.img}')`}
            if ("size" in i) styles["background-size"] = i.size;
            if ("position" in i) styles["background-position"] = i.position;
            this.createChild("img", {
                src: "./images/blank.svg",
                alt: i.name,
                styles: styles
            })
        }

        if ("text" in i) {
            let {text} = i;
            let font = 1;
            if (text.length > 9) font -= (text.length - 9) * 0.04;
            this.createChild("div", {content: i.text, class: "text-banner", style: {"font-size": font+"em"}})
        }
    }
}

export class ElementCarousel extends SvgPlus {
    onconnect() {
        let main = this.innerHTML;
        this.innerHTML = "";
        this.main = this.createChild("main", {content: main});
        this.acting = false;
        this.xv = 0;
        this.goal = null;
        this.selectedi = 0;
        let iconbox = this.createChild("div", {class: "icon-box"});
        let j = 0;
        this.icons = [...this.main.children].map(c => {
            return iconbox.createChild("span", {content: "●", style: {opacity: j++ == 0 ? 1 : 0.5}})
        })

       
        this.setNextTimeout();

        let lastTouch = null;
        this.ontouchmove = (e) => {
            this.acting = true;
            this.goal = null;
            let touch = e.touches[0];
            let dx = 0;
            if (lastTouch !== null) {
                dx = touch.clientX - lastTouch.clientX;
                let dy = touch.clientY - lastTouch.clientY;
                
                if (Math.abs(dx/dy) > 2 ) {
                    clearTimeout(this.nextID);
                    this.xv = -dx
                    e.preventDefault();
                }
            }
            lastTouch = touch;
        }

        this.ontouchend = (e) => {
            lastTouch = null;
            this.acting = false;
            this.setNextTimeout()
        }

        this.updateScroll();
    }


    get sx(){
        return this.main.scrollLeft;
    }
    set sx(x){
        if (x < 0) x = 0;
        if (x > this.main.scrollWidth) x = this.main.scrollWidth;
        this.main.scrollLeft = x;
    }


    setNextTimeout(){
        clearTimeout(this.nextID)
        this.nextID = setTimeout(() => {
            this.goalI += 1;
            this.setNextTimeout();
        }, 4000)
    }


    
    getElementXPosition(el) {
        let x = 0;

        for (let element of this.main.children) {
            if (element.isSameNode(el)) {
                // x += element.clientWidth / 2;
                return x;
            } else {
                x += element.clientWidth;
            }
        }
        return null;
    }
    updateGoal(){
        let xpos = [...this.main.children].map(c => this.getElementXPosition(c));
        let mini = -1;
        let sx = this.sx;
        console.log(this.xv);
        for (let i = 0; i < xpos.length; i++) {
            if (((xpos[i] >= sx && this.xv > 0) || (xpos[i] <= sx && this.xv <= 0)) && mini == -1) mini = i;
            if (((xpos[i] >= sx && this.xv > 0) || (xpos[i] <= sx && this.xv <= 0)) && Math.abs(xpos[i] - sx) < Math.abs(xpos[mini] - sx)) mini = i;
        }
        this.goal = xpos[mini];
        this.selectedi = mini;
        let i = 0;
        for (let icon of this.icons) icon.styles = {opacity: i++ == mini ? 1 : 0.5}
    }

    set goalI(i) {
        i = i % this.main.children.length;
        let goal = this.getElementXPosition(this.main.children[i]);
        this.selectedi = i;
        this.goal = goal;
        let j = 0;
        for (let icon of this.icons) icon.styles = {opacity: j++ == i ? 1 : 0.5}
    }
    get goalI(){return this.selectedi;}

    async updateScroll(){

        let minv = 0.5;
        let stop = false;
        while (!stop) {
            for (let el of this.main.children) {
                el.style.setProperty("--w", `${this.clientWidth}px`);
            }

            let vel =this.xv;
            this.xv *= 0.87;
            this.sx += vel;
            if (this.sx == 0 || this.sx == this.main.scrollWidth) this.xv = 0;
            if (!this.acting && this.xv < minv && this.goal == null) {
                console.log(this.sx);
                this.updateGoal();
            }
            if (this.goal != null) {
                let dx = (this.goal - this.sx);
                let dir = dx > 0 ? 1 : -1;
                dx = dir * Math.sqrt(Math.abs(dx));
                // if (Math.abs(dx) < 1) dx = dx / Math.abs(dx);
                this.sx = this.sx + dx

                if (Math.abs(this.goal - this.sx) < 3) this.sx =this.goal;
            }
   
            await new Promise((resolve, reject) => {window.requestAnimationFrame(resolve)})
 
        }
    }
}


export class PhotoGrid extends SvgPlus {
    set value(value){
        this.innerHTML = "";
        for (let item of value.items) {
            this.appendChild(new GridIcon(item))
        }
    }
}


SvgPlus.defineHTMLElement(PhotoGrid);
SvgPlus.defineHTMLElement(ElementCarousel);