/**
 * 时钟
 * Clock Canvas
 * @author: KyleBing(kylebing@163.com)
 * @github: https://github.com/KyleBing/animate-clock-canvas
 * @date-init: 2024-08-12
 * @date-update: 2024-08-12
 * @version: v0.0.1
 * @platform: NPM
 */

class AnimateClockCanvas {
    /**
     * @param bgColor 背景颜色
     */
    constructor( bgColor ) {
        this.isPlaying = true // 默认自动播放

        this.configFrame = {
            center: {
                x: 600,
                y: 150,
            },
            width : 1200,
            height: 300,
            bgColor: bgColor
        }
        this.configClock = {
            timeLine: 0,                           // 时间线

            timeInit: new Date().getTime(),
            movement: 1,                           // 运动速度
        }
        this.date = null

        this.init()

        window.onresize = () => {
            this.configFrame.height = innerHeight * 2
            this.configFrame.width = innerWidth * 2
            this.configFrame.center = {
                x: this.configFrame.width/2,
                y: this.configFrame.height/2
            }
            let clockLayer = document.getElementById('clockLayer')
            this.updateFrameAttribute(clockLayer)
        }
    }

    play(){
        if (this.isPlaying){

        } else {
            this.isPlaying = true
            this.draw()
        }
    }
    stop(){
        this.isPlaying = false
    }

    moveDown(){
        this.configClock.flowDirection = -1
    }
    moveUp(){
        this.configClock.flowDirection = 1
    }

    updateFrameAttribute(clockLayer){
        clockLayer.setAttribute('id', 'clockLayer')
        clockLayer.setAttribute('width', this.configFrame.width)
        clockLayer.setAttribute('height', this.configFrame.height)
        clockLayer.style.width = `${this.configFrame.width / 2}px`
        clockLayer.style.height = `${this.configFrame.height / 2}px`
        clockLayer.style.zIndex = '-3'
        clockLayer.style.userSelect = 'none'
        clockLayer.style.position = 'fixed'
        clockLayer.style.top = '0'
        clockLayer.style.left = '0'
    }


    init(){
        this.configFrame.height = innerHeight * 2
        this.configFrame.width = innerWidth * 2
        this.configFrame.center = {
            x: this.configFrame.width/2,
            y: this.configFrame.height/2
        }

        let clockLayer = document.createElement("canvas")
        this.updateFrameAttribute(clockLayer)
        document.documentElement.append(clockLayer)
        this.configClock.timeLine =  0
        this.date = new Date()

        this.draw()
    }

    draw() {
        // 建立自己的时间参考线，消除使用系统时间时导致的切换程序后时间紊乱的情况
        this.configClock.timeLine = this.configClock.timeLine + 1

        // create clock
        let canvasClock = document.getElementById('clockLayer')
        let contextClock = canvasClock.getContext('2d')
        contextClock.clearRect(0, 0, this.configFrame.width, this.configFrame.height)



        // 背景，没有 bgColor 的时候，背景就是透明的
        if (this.configFrame.bgColor){
            contextClock.fillStyle = this.configFrame.bgColor
            contextClock.fillRect(0,0,this.configFrame.width, this.configFrame.height)
        }

        this.drawClockPanel(contextClock, this.configFrame.center)
        this.drawCenter(contextClock, this.configFrame.center)
        this.drawPointer(contextClock, this.configFrame.center)

        if (this.isPlaying) {
            window.requestAnimationFrame(() => {
                this.draw()
            })
        }
    }

    // 画时钟表盘
    drawClockPanel(ctx, center){
        const lineWidth = 10
        const lineHeight = 50
        const offsetCenter = 200
        ctx.save()
        ctx.translate(center.x, center.y)

        for (let i = 0; i < 12; i++) {
            ctx.rect(-lineWidth/2, offsetCenter, lineWidth, lineHeight)
            ctx.rotate(Math.PI * 30 / 180)
        }
        ctx.fillStyle = '#2185ff'
        ctx.fill()
        ctx.restore()
    }

    drawPointer(ctx, center){
        const seconds = this.date.getSeconds()
        const rotateAngle = Math.PI * 2 * (seconds/60)
        const lineWidth = 10
        const lineHeight = 30
        const offsetCenter = 100
        ctx.save()
        ctx.translate(center.x, center.y)

        for (let i = 0; i < 12; i++) {
            ctx.rect(-lineWidth/2, offsetCenter, lineWidth, lineHeight)
            ctx.rotate(rotateAngle)
        }
        ctx.fillStyle = '#00ec1f'
        ctx.fill()
        ctx.restore()
    }

    drawCenter(ctx, center){
        ctx.save()
        ctx.translate(center.x, center.y)
        ctx.arc(0,0,20,0,Math.PI * 2)
        ctx.fillStyle = '#ff0064'
        ctx.fill()
    }
}

