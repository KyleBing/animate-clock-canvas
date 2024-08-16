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

const CLOCK_ARRAY = {
    LM: ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'],
    ALB: ['1','2','3','4','5','6','7','8','9','10','11','12']
}

const THEME = {
    white: {
        bg: 'white',
        pointerSecond: '#ff0000',
        pointerHourMinute: 'black',
        pointerHourMinuteStroke: 'white',
        colorMain: 'black',
        colorSecond: '#787878',
        referenceLine: 'magenta'   // 参考线
    },
    black: {
        bg: 'black',
        pointerSecond: '#ff0000',
        pointerHourMinute: 'white',
        pointerHourMinuteStroke: 'black',
        colorMain: '#d8d8d8',
        colorSecond: '#9e9e9e',
        referenceLine: 'magenta'   // 参考线
    }
}

class AnimateClockCanvas {
    /**
     * @param theme white | black   主题
     * @param pointerType rounded | pointer   指针类型
     * @param numberType  ALB | LM  数字类型
     * @param isSkipHourLabel 分钟数是否跳过小时数显示
     */
    constructor( theme, pointerType, numberType, isSkipHourLabel ) {
        this.isPlayConstantly = true // 是否一直 draw
        this.isShowDetailInfo = true // 是否显示所有参数值

        this.theme = theme || 'white'
        this.numberType = (numberType || 'ALB').toUpperCase()
        this.pointerType = pointerType || 'rounded'
        this.isSkipHourLabel = isSkipHourLabel === '1'

        this.configFrame = {
            center: {
                x: 600,
                y: 150,
            },
            width : 1200,
            height: 300,
        }

        this.configClock = {
            panelRadius: 600,              // 表盘大小
            widthSecondPointer: 3,         // 秒针 宽度
            widthMinutePointer: 20,        // 分针 宽度
            widthHourPointer: 30,          // 时针 宽度
            pointerCenterOffset: 20,       // 指针 偏离中心距离

            labelFontSizeHour: 60,              // 刻度字体大小：小时
            labelFontSizeMinute: 20,            // 刻度字体大小：分钟

            labelOffsetHour: 30,           // 刻度字体偏移量：小时
            labelOffsetMinute: 110,        // 刻度字体偏移量：分钟

            lengthSplitHour: 80,           // 刻度长度: 时
            lengthSplitMinute: 30,         // 刻度长度: 分
            lengthSplitSecond: 20,         // 刻度长度: 秒

            lineWidthHour: 10,             // 刻度宽：时
            lineWidthMinute: 4,            // 刻度宽：分
            lineWidthSecond: 1,            // 刻度宽：秒

            timeLine: 0,                   // 时间轴

            timeInit: new Date().getTime(),//  初始时间戳
        }

        this.rotateAngleHour = 0
        this.rotateAngleMinute = 0
        this.rotateAngleSecond = 0

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

        }

        if (this.theme) {
            contextClock.fillStyle = THEME[this.theme].bg
            contextClock.fillRect(0, 0, this.configFrame.width, this.configFrame.height)
        }


        this.drawClockPanelSeconds(contextClock, this.configFrame.center)
        this.drawClockPanelMinutes(contextClock, this.configFrame.center)
        this.drawClockPanelHour(contextClock, this.configFrame.center)
        // this.drawRefLines(contextClock, this.configFrame.center)
        // this.drawCenter(contextClock, this.configFrame.center)
        this.drawPointerHour(contextClock, this.configFrame.center)
        this.drawPointerMinute(contextClock, this.configFrame.center)
        this.drawPointerSecond(contextClock, this.configFrame.center)


        // 左下角显示所有参数值
        if (this.isShowDetailInfo){
            this.showAllInfo(contextClock)
        }

        if (this.isPlayConstantly) {
            window.requestAnimationFrame(() => {
                this.draw()
            })
        }
    }

    // 打印输出所有参数值
    showAllInfo(ctx){
        ctx.fillStyle = 'gray'
        const fontSize = 30
        ctx.font = `${fontSize - 3}px Galvji`
        ctx.fillText(`Rotation Hour:  rad ${this.rotateAngleHour}`, 30 ,this.configFrame.height - ( 20 + fontSize * 1 ) )
        ctx.fillText(`Rotation Minute:  rad ${this.rotateAngleMinute}`, 30 ,this.configFrame.height - ( 20 + fontSize * 2 ) )
        ctx.fillText(`Rotation Second:  rad ${this.rotateAngleSecond}`, 30 ,this.configFrame.height - ( 20 + fontSize * 3 ) )
        ctx.fillText(`Timeline: ${this.configClock.timeLine}`, 30 ,this.configFrame.height - ( 20 + fontSize * 4 ) )
    }

    drawRefLines(ctx, center){
        const lineLength = this.configClock.panelRadius * 3
        ctx.save()
        ctx.beginPath()
        ctx.moveTo(center.x - lineLength/2, center.y)
        ctx.lineTo(center.x + lineLength/2, center.y)
        ctx.moveTo(center.x, center.y - lineLength/2)
        ctx.lineTo(center.x, center.y + lineLength/2)
        ctx.strokeStyle = THEME[this.theme].referenceLine
        ctx.closePath()
        ctx.stroke()
        ctx.restore()
    }

    // 画时钟表盘: 时
    drawClockPanelHour(ctx, center){
        const lineHeight = this.configClock.lengthSplitHour
        const offsetCenter = this.configClock.panelRadius
        ctx.save()
        ctx.translate(center.x, center.y)
        ctx.fillStyle = THEME[this.theme].colorMain
        for (let i = 0; i < 12; i++) {
            ctx.rotate(Math.PI / 6)
            ctx.fillRect(-this.configClock.lineWidthHour / 2, -offsetCenter, this.configClock.lineWidthHour, lineHeight)
            ctx.textAlign = 'center'
            ctx.font = `${this.configClock.labelFontSizeHour}px Galvji`
            ctx.fillText(CLOCK_ARRAY[this.numberType][i], 0, -offsetCenter - this.configClock.labelOffsetHour,)
        }
        ctx.restore()
    }

    // 画时钟表盘：分钟
    drawClockPanelMinutes(ctx, center){
        const lineHeight = this.configClock.lengthSplitMinute
        const offsetCenter = this.configClock.panelRadius
        ctx.save()
        ctx.translate(center.x, center.y)
        ctx.fillStyle = THEME[this.theme].colorSecond
        for (let i = 0; i < 60; i++) {
            ctx.rotate(Math.PI / 30)
            ctx.fillRect(-this.configClock.lineWidthMinute / 2, -offsetCenter, this.configClock.lineWidthMinute, lineHeight)
            ctx.textAlign = 'center'
            ctx.font = `${this.configClock.labelFontSizeMinute}px Galvji`
            if (this.isSkipHourLabel){
                if ((i+1)%5!==0){
                    ctx.fillText(i + 1, 0, -offsetCenter - this.configClock.labelOffsetMinute,)
                }
            } else {
                ctx.fillText(i + 1, 0, -offsetCenter - this.configClock.labelOffsetMinute,)
            }

        }
        ctx.restore()
    }
    // 画时钟表盘：秒
    drawClockPanelSeconds(ctx, center){
        const lineHeight = this.configClock.lengthSplitSecond
        const offsetCenter = this.configClock.panelRadius
        ctx.save()
        ctx.translate(center.x, center.y)
        ctx.fillStyle = THEME[this.theme].colorSecond
        for (let i = 0; i < 300; i++) {
            ctx.rotate(Math.PI * 2 / 300)
            ctx.fillRect(-this.configClock.lineWidthSecond / 2, -offsetCenter, this.configClock.lineWidthSecond, lineHeight)
        }
        ctx.restore()
    }

    drawCenter(ctx, center){
        const centerRadius = 3
        ctx.save()
        ctx.translate(center.x, center.y)
        ctx.arc(0, 0, centerRadius, 0, Math.PI * 2)
        ctx.closePath()
        ctx.fillStyle = THEME[this.theme].colorMain
        ctx.fill()
        ctx.restore()
    }

    // 秒针动作
    drawPointerSecond(ctx, center){
        const ms = new Date().getMilliseconds()
        const seconds = new Date().getSeconds()
        const rotateAngle = Math.PI * 2 * (ms / 1000 / 60 + seconds / 60)  + Math.PI  // 秒 + 毫秒的角度
        this.rotateAngleSecond = rotateAngle
        const lineWidth = this.configClock.widthSecondPointer
        const lineHeight = this.configClock.panelRadius * (6/6)
        ctx.save()
        ctx.translate(center.x, center.y)
        ctx.rotate(rotateAngle)
        ctx.fillStyle = THEME[this.theme].pointerSecond
        ctx.fillRect(-lineWidth/2, this.configClock.pointerCenterOffset, lineWidth, lineHeight)
        ctx.restore()
    }

    // 分针动作
    drawPointerMinute(ctx, center){
        const ms = new Date().getMilliseconds()
        const seconds = new Date().getSeconds()
        const minutes = new Date().getMinutes()
        const rotateAngle = Math.PI * 2 * (minutes / 60) + Math.PI   + Math.PI / 30 * ( ms / 1000 / 60 + seconds / 60)     // 秒 + 毫秒的角度
        this.rotateAngleMinute = rotateAngle
        const lineWidth = this.configClock.widthMinutePointer
        const lineHeight = this.configClock.panelRadius * (5/6)
        ctx.save()
        ctx.translate(center.x, center.y)
        ctx.rotate(rotateAngle)
        ctx.fillStyle = THEME[this.theme].pointerHourMinute
        ctx.strokeStyle = THEME[this.theme].pointerHourMinuteStroke

        ctx.beginPath()

        const pointLeftTop = [-lineWidth/2, this.configClock.pointerCenterOffset,]
        const pointRightBottom = [lineWidth, lineHeight]
        switch (this.pointerType){
            case 'pointer':
                // 尖指针时
                const radius = lineWidth/2
                const pointA = [-radius, this.configClock.pointerCenterOffset + radius]
                const pointB = [0, lineHeight +  radius  + this.configClock.pointerCenterOffset]
                const pointC = [radius, this.configClock.pointerCenterOffset + radius]
                const pointD = [0, this.configClock.pointerCenterOffset]
                ctx.moveTo(...pointA)
                ctx.lineTo(...pointB)
                ctx.lineTo(...pointC)
                ctx.lineTo(...pointD)
                ctx.lineTo(...pointA)
                break
            case 'rect':
                ctx.fillRect(...pointLeftTop, ...pointRightBottom, [lineWidth,lineWidth,lineWidth,lineWidth])
                break
            case 'rounded':
            default:
                // 圆形指针时
                ctx.roundRect(...pointLeftTop, ...pointRightBottom, [lineWidth,lineWidth,lineWidth,lineWidth])
                break
        }

        ctx.closePath()
        ctx.fill()
        ctx.stroke()
        ctx.restore()
    }

    // 时针动作
    drawPointerHour(ctx, center){
        const seconds = new Date().getSeconds()
        const minutes = new Date().getMinutes()
        const hours = new Date().getHours()
        const rotateAngle = Math.PI * 2 * (hours / 12) + Math.PI +  Math.PI / 6 * ((minutes + seconds/60) / 60) // 秒 + 毫秒的角度
        this.rotateAngleHour = rotateAngle
        const lineWidth = this.configClock.widthHourPointer
        const lineHeight = this.configClock.panelRadius * (3/6)
        ctx.save()
        ctx.translate(center.x, center.y)
        ctx.rotate(rotateAngle)
        ctx.fillStyle = THEME[this.theme].pointerHourMinute
        ctx.strokeStyle = THEME[this.theme].pointerHourMinuteStroke
        ctx.strokeWidth = 1
        ctx.beginPath()

        const pointLeftTop = [-lineWidth/2, this.configClock.pointerCenterOffset]
        const pointRightBottom = [lineWidth, lineHeight]
        switch (this.pointerType){
            case 'pointer':
                // 尖指针时
                const radius = lineWidth/2
                const pointA = [-radius, this.configClock.pointerCenterOffset + radius]
                const pointB = [0, lineHeight +  radius  + this.configClock.pointerCenterOffset]
                const pointC = [radius, this.configClock.pointerCenterOffset + radius]
                const pointD = [0, this.configClock.pointerCenterOffset]
                ctx.moveTo(...pointA)
                ctx.lineTo(...pointB)
                ctx.lineTo(...pointC)
                ctx.lineTo(...pointD)
                ctx.lineTo(...pointA)
                break
            case 'rect':
                ctx.fillRect(...pointLeftTop, ...pointRightBottom, [lineWidth,lineWidth,lineWidth,lineWidth])
                break
            case 'rounded':
            default:
                // 圆形指针时
                ctx.roundRect(...pointLeftTop, ...pointRightBottom, [lineWidth,lineWidth,lineWidth,lineWidth])
        }
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
        ctx.restore()
    }

}

