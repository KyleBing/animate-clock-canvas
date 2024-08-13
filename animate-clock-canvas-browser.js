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
        this.isPlayConstantly = true // 默认自动播放

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
            contextClock.fillRect(0, 0, this.configFrame.width, this.configFrame.height)
        }

        this.drawClockPanelHour(contextClock, this.configFrame.center)
        this.drawClockPanelMinutes(contextClock, this.configFrame.center)
        this.drawRefLines(contextClock, this.configFrame.center)
        this.drawCenter(contextClock, this.configFrame.center)
        this.drawPointerSecond(contextClock, this.configFrame.center)
        this.drawPointerMinute(contextClock, this.configFrame.center)
        this.drawPointerHour(contextClock, this.configFrame.center)


        // show timeline
        contextClock.fillStyle = 'black'
        contextClock.font = '30px sans-serf'
        contextClock.fillText(String(this.configClock.timeLine), 20 ,this.configFrame.height - 20)

        if (this.isPlayConstantly) {
            window.requestAnimationFrame(() => {
                this.draw()
            })
        }
    }

    drawRefLines(ctx, center){
        const lineLength = 1000
        ctx.save()
        ctx.beginPath()
        ctx.moveTo(center.x - lineLength/2, center.y)
        ctx.lineTo(center.x + lineLength/2, center.y)
        ctx.moveTo(center.x, center.y - lineLength/2)
        ctx.lineTo(center.x, center.y + lineLength/2)
        ctx.strokeStyle = 'magenta'
        ctx.closePath()
        ctx.stroke()
        ctx.restore()
    }

    // 画时钟表盘: 时
    drawClockPanelHour(ctx, center){
        const lineWidth = 10
        const lineHeight = 50
        const offsetCenter = 300
        ctx.save()
        ctx.translate(center.x, center.y)
        for (let i = 0; i < 12; i++) {
            ctx.rotate(Math.PI / 6)
            ctx.rect(-lineWidth / 2, -offsetCenter, lineWidth, lineHeight)
        }
        ctx.fillStyle = '#2185ff'
        ctx.fill()
        ctx.restore()
    }

    // 画时钟表盘：分钟
    drawClockPanelMinutes(ctx, center){
        const lineWidth = 4
        const lineHeight = 30
        const offsetCenter = 300
        ctx.save()
        ctx.translate(center.x, center.y)
        for (let i = 0; i < 60; i++) {
            ctx.rotate(Math.PI / 30)
            ctx.rect(-lineWidth / 2, -offsetCenter, lineWidth, lineHeight)
        }
        ctx.fillStyle = '#e7e7e7'
        ctx.fill()
        ctx.restore()
    }

    drawCenter(ctx, center){
        const centerRadius = 10
        ctx.save()
        ctx.translate(center.x, center.y)
        ctx.arc(0, 0, centerRadius, 0, Math.PI * 2)
        ctx.fillStyle = '#12ff00'
        ctx.fill()
        ctx.restore()
    }

    drawPointerSecond(ctx, center){
        const ms = new Date().getMilliseconds()
        const seconds = new Date().getSeconds()
        const rotateAngle = Math.PI * 2 * (ms / 1000 / 60 + seconds / 60)  + Math.PI  // 秒 + 毫秒的角度
        const lineWidth = 2
        const lineHeight = 250
        const offsetCenter = 50
        ctx.save()
        ctx.translate(center.x, center.y)
        ctx.rotate(rotateAngle)
        ctx.rect(-lineWidth/2, offsetCenter, lineWidth, lineHeight)
        ctx.fillStyle = '#ff0000'
        ctx.fill()
        ctx.restore()
    }

    drawPointerMinute(ctx, center){
        const seconds = new Date().getMinutes()
        const rotateAngle = Math.PI * 2 * (seconds / 60) + Math.PI  // 秒 + 毫秒的角度
        const lineWidth = 10
        const lineHeight = 150
        const offsetCenter = 50
        ctx.save()
        ctx.translate(center.x, center.y)
        ctx.rotate(rotateAngle)
        ctx.rect(-lineWidth/2, offsetCenter, lineWidth, lineHeight)
        ctx.fillStyle = '#2185ff'
        ctx.fill()
        ctx.restore()
    }

    drawPointerHour(ctx, center){
        const hours = new Date().getHours()
        const rotateAngle = Math.PI * 2 * (hours / 12) + Math.PI // 秒 + 毫秒的角度
        const lineWidth = 20
        const lineHeight = 100
        const offsetCenter = 50
        ctx.save()
        ctx.translate(center.x, center.y)
        ctx.rotate(rotateAngle)
        ctx.rect(-lineWidth/2, offsetCenter, lineWidth, lineHeight)
        ctx.fillStyle = '#ff0000'
        ctx.fill()
        ctx.restore()
    }

}

