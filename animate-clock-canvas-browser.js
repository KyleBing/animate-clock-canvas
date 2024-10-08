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

const WEEK_MAP = {
    '1': '周一',
    '2': '周二',
    '3': '周三',
    '4': '周四',
    '5': '周五',
    '6': '周六',
    '0': '周日',
}

const PRESETS = [
    {
        dateFontSize: 40,              // 日期、星期字体大小
        labelFontSizeHour: 80,         // 刻度字体大小：小时
        labelFontSizeMinute: 20,       // 刻度字体大小：分钟
        labelOffsetHour: 30,           // 刻度字体偏移量：小时
        labelOffsetMinute: 125,        // 刻度字体偏移量：分钟

        panelRadius: 600,              // 表盘大小
        widthSecondPointer: 3,         // 秒针 宽度
        widthMinutePointer: 20,        // 分针 宽度
        widthHourPointer: 30,          // 时针 宽度
        pointerCenterOffset: 40,       // 指针 偏离中心距离

        radiusCenter: 4,               // 中心黑点的大小

        lengthSplitHour: 80,           // 刻度长度: 时
        lengthSplitMinute: 30,         // 刻度长度: 分
        lengthSplitSecond: 20,         // 刻度长度: 秒

        lineWidthHour: 10,             // 刻度宽：时
        lineWidthMinute: 4,            // 刻度宽：分
        lineWidthSecond: 1,            // 刻度宽：秒
    },
    {
        dateFontSize: 40,              // 日期、星期字体大小
        labelFontSizeHour: 80,         // 刻度字体大小：小时
        labelFontSizeMinute: 20,       // 刻度字体大小：分钟
        labelOffsetHour: -180,         // 刻度字体偏移量：小时
        labelOffsetMinute: 30,         // 刻度字体偏移量：分钟

        panelRadius: 600,              // 表盘大小
        widthSecondPointer: 3,         // 秒针 宽度
        widthMinutePointer: 20,        // 分针 宽度
        widthHourPointer: 30,          // 时针 宽度
        pointerCenterOffset: 40,       // 指针 偏离中心距离

        radiusCenter: 4,               // 中心黑点的大小

        lengthSplitHour: 80,           // 刻度长度: 时
        lengthSplitMinute: 30,         // 刻度长度: 分
        lengthSplitSecond: 20,         // 刻度长度: 秒

        lineWidthHour: 10,             // 刻度宽：时
        lineWidthMinute: 4,            // 刻度宽：分
        lineWidthSecond: 1,            // 刻度宽：秒
    },
]

const THEME = {
    white: {
        bg: 'white',
        colorPointerSecond: '#ff0000',
        colorPointerHour: '#000000',
        colorPointerMinute: '#000000',
        colorScaleSecond: '#787878',
        colorMain: 'black',
        referenceLine: 'magenta'   // 参考线
    },
    black: {
        bg: 'black',
        colorPointerSecond: '#ff0000',
        colorPointerHour: '#ffffff',
        colorPointerMinute: '#ffffff',
        colorScaleSecond: '#9e9e9e',
        colorMain: '#d8d8d8',
        referenceLine: 'magenta'   // 参考线
    }
}

class AnimateClockCanvas {
    /**
     * @param theme             white | black      主题
     * @param pointerType       rounded | pointer  指针类型
     * @param numberType        ALB | LM           数字类型
     * @param isSkipHourLabel   0 | 1              分钟数是否跳过小时数显示
     * @param isZoomSecond      0 | 1              是否放大实时秒数
     * @param isShowDetailInfo  0 | 1              是否显示所有参数值
     * @param isShowWeekDate    0 | 1              是否显示日期、星期
     * @param isShowShadow      0 | 1              是否显示指针阴影
     * @param preset            0                  预制的几种表盘类型
     */
    constructor(
        theme, pointerType, numberType, isSkipHourLabel,
        isZoomSecond, isShowDetailInfo = '1', isShowWeekDate = '1' ,
        isShowShadow = '1', preset = '0'
    ) {
        this.isPlayConstantly = true // 是否一直 draw

        this.theme = theme || 'white'
        this.numberType = (numberType || 'ALB').toUpperCase()
        this.pointerType = pointerType || 'rounded'             // 指针类型
        this.isSkipHourLabel = isSkipHourLabel === '1'          // 分钟数是否跳过小时数显示
        this.isZoomSecond = isZoomSecond === '1'                // 是否放大实时秒数
        this.isShowDetailInfo = isShowDetailInfo === '0'        // 是否显示所有参数值
        this.isShowWeekDate = isShowWeekDate === '1'            // 是否显示日期、星期
        this.isShowShadow = isShowShadow === '1'                // 是否显示指针阴影
        this.preset = preset || '0'                // 是否显示指针阴影

        this.panelRadius = 600 // 基尺寸

        this.configFrame = {
            center: {
                x: 600,
                y: 150,
            },
            width : 1200,
            height: 300,
        }

        this.configClock = PRESETS[Number(this.preset)]

        // TIMELINE
        this.timeLine = 0                   // 时间轴

        this.rotateAngleHour = 0
        this.rotateAngleMinute = 0
        this.rotateAngleSecond = 0

        this.init()

        window.onresize = () => {
            this.refreshSizes()

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

    // 更新尺寸数据
    refreshSizes(){
        this.configFrame.height = innerHeight * 2
        this.configFrame.width = innerWidth * 2
        this.configFrame.center = {
            x: this.configFrame.width/2,
            y: this.configFrame.height/2
        }
        this.panelRadius = Math.min(this.configFrame.width, this.configFrame.height)/2 * (5/7)
        this.updateAllSizeWithPanelRadiusSize(this.panelRadius)
    }

    // 根据屏幕尺寸，计算对应比例的
    updateAllSizeWithPanelRadiusSize(finalRadiusSize){
        this.configClock = JSON.parse(JSON.stringify(PRESETS[this.preset]))
        const baseRadius = 600 // 表盘是基于这个尺寸进行缩放的
        const ratio = finalRadiusSize / baseRadius
        if (finalRadiusSize > 100){
            for (let key in this.configClock){
                if (key === 'panelRadius'){
                    this.configClock.panelRadius = finalRadiusSize
                } else {
                    this.configClock[key] = PRESETS[this.preset][key] * ratio
                }
            }
        }
    }

    init(){
        this.refreshSizes()

        let clockLayer = document.createElement("canvas")
        this.updateFrameAttribute(clockLayer)
        document.documentElement.append(clockLayer)
        this.timeLine =  0
        this.draw()
    }

    draw() {
        // 建立自己的时间参考线，消除使用系统时间时导致的切换程序后时间紊乱的情况
        this.timeLine = this.timeLine + 1

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


        // 表盘
        this.drawClockPanelSeconds(contextClock, this.configFrame.center)
        this.drawClockPanelMinutes(contextClock, this.configFrame.center)
        this.drawClockPanelHour(contextClock, this.configFrame.center)

        // 参考线
        // this.drawRefLines(contextClock, this.configFrame.center)

        // 日期、星期
        if (this.isShowWeekDate){
            this.drawWeekAndDate(contextClock, this.configFrame.center)
        }

        // 指针
        this.drawPointerHour(contextClock, this.configFrame.center)
        this.drawPointerMinute(contextClock, this.configFrame.center)
        this.drawPointerSecond(contextClock, this.configFrame.center)

        // 中心点
        this.drawCenter(contextClock, this.configFrame.center)


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
        const fontSize = 26
        ctx.font = `${fontSize - 3}px Galvji`

        const infos = [
            `Key F: Toggle full screen mode`,
            `Rotation Hour:  rad ${this.rotateAngleHour}`,
            `Rotation Minute:  rad ${this.rotateAngleMinute}`,
            `Rotation Second:  rad ${this.rotateAngleSecond}`,
            `Timeline: ${this.timeLine}`
        ]
        infos.forEach((item , index) => {
            ctx.fillText(item, 30 ,this.configFrame.height - ( 20 + fontSize * index ) - 20 )
        })
    }

    // 展示日期、星期
    drawWeekAndDate(ctx, center){
        ctx.save()
        const fontSize = this.configClock.dateFontSize
        ctx.font = `${fontSize}px Galvji`
        ctx.textBaseline = 'middle'  // 文字纵向居中 绘制
        const weekString = WEEK_MAP[new Date().getDay()]
        const dateString = String(new Date().getDate())
        // 星期
        ctx.fillStyle = THEME[this.theme].colorPointerSecond
        ctx.fillText(weekString, center.x + this.configClock.panelRadius / 2 ,center.y)
        // 日期
        ctx.fillStyle = THEME[this.theme].colorMain
        ctx.fillText(dateString, center.x + this.configClock.panelRadius / 2 - (fontSize + 15) ,center.y)
        ctx.restore()
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

    // 表盘刻度: 时
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

    // 表盘刻度：分钟
    drawClockPanelMinutes(ctx, center){
        const lineHeight = this.configClock.lengthSplitMinute
        const offsetCenter = this.configClock.panelRadius
        const seconds = new Date().getSeconds()
        const ms = new Date().getMilliseconds()

        ctx.save()
        ctx.translate(center.x, center.y)
        ctx.fillStyle = THEME[this.theme].colorScaleSecond
        for (let i = 0; i < 60; i++) {

            let fontSize = this.configClock.labelFontSizeMinute
            if (this.isZoomSecond){
                // 放大实时秒数
                const distance1 = Math.abs((seconds + ms / 1000) - (i + 1))  // 距离当前秒数的距离
                const distance2 = seconds + ms / 1000
                const distance = Math.min(distance1, distance2)
                if (distance < 1.5){
                    fontSize = (2.5 - distance) * fontSize
                } else {

                }
            }

            ctx.rotate(Math.PI / 30)
            ctx.fillRect(-this.configClock.lineWidthMinute / 2, -offsetCenter, this.configClock.lineWidthMinute, lineHeight)
            ctx.textAlign = 'center'
            ctx.font = `${fontSize}px Galvji`

            if (this.isSkipHourLabel){
                if ((i + 1) % 5 !== 0) {
                    ctx.fillText(i + 1, 0, -offsetCenter - this.configClock.labelOffsetMinute,)
                }
            } else {
                ctx.fillText(i + 1, 0, -offsetCenter - this.configClock.labelOffsetMinute,)
            }

        }
        ctx.restore()
    }
    // 表盘刻度：秒
    drawClockPanelSeconds(ctx, center){
        const lineHeight = this.configClock.lengthSplitSecond
        const offsetCenter = this.configClock.panelRadius
        ctx.save()
        ctx.translate(center.x, center.y)
        ctx.fillStyle = THEME[this.theme].colorScaleSecond
        for (let i = 0; i < 300; i++) {
            ctx.rotate(Math.PI * 2 / 300)
            ctx.fillRect(-this.configClock.lineWidthSecond / 2, -offsetCenter, this.configClock.lineWidthSecond, lineHeight)
        }
        ctx.restore()
    }

    drawCenter(ctx, center){
        ctx.save()
        ctx.translate(center.x, center.y)
        ctx.beginPath()
        ctx.arc(0, 0, this.configClock.radiusCenter, 0, Math.PI * 2)
        ctx.closePath()
        ctx.fillStyle = 'black' // 中心点恒为黑色
        ctx.fill()
        ctx.restore()
    }

    // 时针
    drawPointerHour(ctx, center){
        const seconds = new Date().getSeconds()
        const minutes = new Date().getMinutes()
        const hours = new Date().getHours()
        const rotateAngle = Math.PI * 2 * (hours / 12) + Math.PI +  Math.PI / 6 * ((minutes + seconds/60) / 60) // 秒 + 毫秒的角度
        this.rotateAngleHour = rotateAngle
        const lineWidth = this.configClock.widthHourPointer
        const lineHeight = this.configClock.panelRadius * (3/6)
        ctx.save()

        // 时针阴影
        if (this.isShowShadow){
            ctx.shadowColor = 'rgba(0,0,0,0.3)'
            ctx.shadowBlur = 2
            ctx.shadowOffsetX = 1
            ctx.shadowOffsetY = 2
        }

        ctx.translate(center.x, center.y)
        ctx.rotate(rotateAngle)
        ctx.fillStyle = THEME[this.theme].colorPointerHour
        ctx.strokeWidth = 1

        const pointLeftTop = [-lineWidth/2, this.configClock.pointerCenterOffset]
        const pointRightBottom = [lineWidth, lineHeight]
        switch (this.pointerType){
            case 'pointer':
                // 尖指针时
                ctx.beginPath()
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
                ctx.beginPath()
                ctx.fillRect(...pointLeftTop, ...pointRightBottom, [lineWidth,lineWidth,lineWidth,lineWidth])
                ctx.fill()
                break
            case 'rounded':
            default:
                // 圆形指针时
                ctx.beginPath()
                ctx.roundRect(...pointLeftTop, ...pointRightBottom, [lineWidth,lineWidth,lineWidth,lineWidth])
                break
        }

        // TODO： 时针在 pointer 模式下显示不正常。
        // 指针需要使用 Path 绘制，不能用色块，因为有阴影的存在，会显示不正常。
        ctx.closePath()
        // 画连接件
        // 圆心
        ctx.arc(0, 0, this.configClock.widthHourPointer/2, 0, Math.PI * 2)
        // 圆心与指针的连接
        ctx.rect(-this.configClock.widthMinutePointer*(1/4), 0, this.configClock.widthMinutePointer*(2/4), this.configClock.pointerCenterOffset + 10)
        ctx.fill()
        ctx.restore()
    }

    // 分针
    drawPointerMinute(ctx, center){
        const ms = new Date().getMilliseconds()
        const seconds = new Date().getSeconds()
        const minutes = new Date().getMinutes()
        const rotateAngle = Math.PI * 2 * (minutes / 60) + Math.PI   + Math.PI / 30 * ( ms / 1000 / 60 + seconds / 60)     // 秒 + 毫秒的角度
        this.rotateAngleMinute = rotateAngle
        const lineWidth = this.configClock.widthMinutePointer
        const lineHeight = this.configClock.panelRadius * (5/6)
        ctx.save()

        // 分针阴影
        if (this.isShowShadow){
            ctx.shadowColor = 'rgba(0,0,0,0.3)'
            ctx.shadowBlur = 5
            ctx.shadowOffsetX = 2
            ctx.shadowOffsetY = 3
        }

        ctx.translate(center.x, center.y)
        ctx.rotate(rotateAngle)
        ctx.fillStyle = THEME[this.theme].colorPointerMinute

        ctx.beginPath()

        const pointLeftTop = [-lineWidth/2, this.configClock.pointerCenterOffset,]
        const pointRightBottom = [lineWidth, lineHeight]
        switch (this.pointerType){
            case 'pointer':
                // 尖指针时
                ctx.beginPath()
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
                ctx.closePath()
                ctx.fill()
                break
            case 'rect':
                ctx.beginPath()
                ctx.fillRect(...pointLeftTop, ...pointRightBottom, [lineWidth,lineWidth,lineWidth,lineWidth])
                ctx.closePath()
                ctx.fill()
                break
            case 'rounded':
            default:
                // 圆形指针时
                ctx.beginPath()
                ctx.roundRect(...pointLeftTop, ...pointRightBottom, [lineWidth,lineWidth,lineWidth,lineWidth])
                break
        }

        // 画连接件
        // 圆心
        ctx.arc(0, 0, this.configClock.widthMinutePointer/2, 0, Math.PI * 2)
        // 圆心与指针的连接
        ctx.rect(-this.configClock.widthMinutePointer*(1/4), 0, this.configClock.widthMinutePointer*(2/4), this.configClock.pointerCenterOffset + 10)
        ctx.fill()
        ctx.closePath()

        ctx.restore()
    }

    // 秒针
    drawPointerSecond(ctx, center){
        const ms = new Date().getMilliseconds()
        const seconds = new Date().getSeconds()
        const rotateAngle = Math.PI * 2 * (ms / 1000 / 60 + seconds / 60)  + Math.PI  // 秒 + 毫秒的角度
        this.rotateAngleSecond = rotateAngle
        const lineWidth = this.configClock.widthSecondPointer
        const lineHeight = this.configClock.panelRadius * (6/6) + this.configClock.pointerCenterOffset * 3
        ctx.save()

        // 秒针阴影
        if (this.isShowShadow){
            ctx.shadowColor = 'rgba(0,0,0,0.2)'
            ctx.shadowBlur = 5
            ctx.shadowOffsetX = 3
            ctx.shadowOffsetY = 5
        }

        ctx.translate(center.x, center.y)
        ctx.rotate(rotateAngle)
        ctx.fillStyle = THEME[this.theme].colorPointerSecond
        ctx.beginPath()
        ctx.rect(-lineWidth/2, -this.configClock.pointerCenterOffset*2, lineWidth, lineHeight)

        // 圆心
        ctx.arc(0, 0, this.configClock.widthMinutePointer/2, 0, Math.PI * 2)
        // 圆心与指针的连接
        ctx.rect(-lineWidth, -this.configClock.pointerCenterOffset * 2, lineWidth*2, this.configClock.pointerCenterOffset * 3.5)
        ctx.closePath()
        ctx.fill()

        ctx.restore()
    }
}

