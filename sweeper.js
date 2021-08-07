// constants

var xf = 16
var yf = 16
var mines = 40

var stdfont = 'helvetica'
var undisc = '#999999'
var flg = '#14cc00'
var empty = '#dddddd'
var hlmine = '#111111'
var fflg = '#ff0000'
var txt = '#505050'
var intfrac = 0.25

// \constants

var width = window.innerWidth
var height = window.innerHeight
var len = Math.trunc(Math.min(width / (xf + 10), height / (yf + 10)))
var interval = intfrac * len
var rfrac = 1 / (1 + intfrac)

var canvas = document.getElementById("sweeperCanvas")
var ctx = canvas.getContext("2d")
//canvas.style.width = window.innerWidth + "px"
//canvas.style.height = window.innerHeight + "px"
var field = []
var gamestate = 'playing'
var flags = 0

canvas.width = width
canvas.height = height

fontsize = len - 10
ctx.font = fontsize + 'px ' + stdfont

class Sector {
    constructor(mine, discovered, flagged) {
        this.mine = mine
        this.discovered = discovered
        this.flagged = flagged
    } 
}

function init() {
    for(let x = 0; x < xf; x++) {
        field[x] = []
        for(let y = 0; y < yf; y++)
            field[x][y] = new Sector(false, false, false)
    }
    for(let i = 0; i < mines; i++) {
        xc = Math.trunc(Math.random() * xf)
        yc = Math.trunc(Math.random() * yf)
        if(field[xc][yc].mine)
            --i
        field[xc][yc].mine = true
        console.log(i + ": " + "x = " + xc + "y = " + yc);
    }
}

function getNumber(x, y) {
    result = 0
    for(let xc = Math.max(x - 1, 0); xc <= Math.min(x + 1, xf - 1); xc++)
        for(let yc = Math.max(y - 1, 0); yc <= Math.min(y + 1, xf - 1); yc++)
            if(!(x == xc && y == yc) && field[xc][yc].mine)
                result++
    return result
}

function draw() {
    hl = (gamestate != 'playing');
    ctx.clearRect(0, 0, width, height)
    ctx.textAlign = 'left'
    if(gamestate == 'won')
        ctx.fillStyle = flg
    else if(gamestate == 'lost')
        ctx.fillStyle = fflg
    else
        ctx.fillStyle = txt
    ctx.fillText('Flags: ' + flags + '/' + mines, len + interval, ctx.measureText('Flags: ').actualBoundingBoxAscent + interval)
    for(let x = 0; x < xf; x++)
        for(let y = 0; y < yf; y++) {
            if(field[x][y].discovered) {
                num = getNumber(x, y)
                if(num != 0) {
                    ctx.fillStyle = textColor(num);
                    ctx.fillRect((x + 1) * (len + interval), (y + 1) * (len + interval), len, len)
                    ctx.fillStyle = txt;
                    ctx.textAlign = "center"
                    ctx.fillText(num, (x + 1) * (len + interval) + len / 2,
                        (y + 1) * (len + interval) + len / 2 + ctx.measureText(num).actualBoundingBoxAscent / 2)
                }
                else {
                    ctx.fillStyle = empty;
                    ctx.fillRect((x + 1) * (len + interval), (y + 1) * (len + interval), len, len)
                }
            }
            else if(field[x][y].flagged) {
                ctx.fillStyle = flg
                ctx.fillRect((x + 1) * (len + interval), (y + 1) * (len + interval), len, len)
            }
            else {
                ctx.fillStyle = undisc
                ctx.fillRect((x + 1) * (len + interval), (y + 1) * (len + interval), len, len)
            }
            if(hl) {
                if(field[x][y].mine && !field[x][y].flagged) {
                    ctx.fillStyle = hlmine
                    ctx.fillRect((x + 1) * (len + interval), (y + 1) * (len + interval), len, len)
                }
                else if(!field[x][y].mine && field[x][y].flagged) {
                    ctx.fillStyle = fflg
                    ctx.fillRect((x + 1) * (len + interval), (y + 1) * (len + interval), len, len)
                }
            }
        }
}

function check() {
    for(let x = 0; x < xf; x++)
        for(let y = 0; y < yf; y++)
            if(!field[x][y].discovered && !field[x][y].flagged || field[x][y].mine && !field[x][y].flagged)
                return false
    return true
}

function textColor(num) {
    greenValue = (255 - 36 * (num - 1)).toString(16)
    if(greenValue.length < 2)
        greenValue = '0' + greenValue
    return '#ff' + greenValue + '00'
}

init()
draw()

function win() {
    gamestate = 'won'
    alert("congrats, you won")
}

function lose() {
    gamestate = 'lost'
    alert("you lost")
}

function discover(x, y) {
    if(!field[x][y].flagged && field[x][y].mine) {
        lose()
        return null
    }   
    if(!field[x][y].flagged) {
        field[x][y].discovered = true;
        if(getNumber(x, y) == 0) {
            for(let xc = Math.max(x - 1, 0); xc <= Math.min(x + 1, xf - 1); xc++)
                for(let yc = Math.max(y - 1, 0); yc <= Math.min(y + 1, xf - 1); yc++)
                    if(!(x == xc && y == yc) && (!field[xc][yc].discovered)) {
                        if(field[xc][yc].flagged)
                            flag(xc, yc);
                        discover(xc, yc);
                    }
        }
    }

}

function flag(x, y) {
    if(!field[x][y].discovered) {
        if(field[x][y].flagged) {
            field[x][y].flagged = false
            flags--
        }
        else if(flags < mines) {
            field[x][y].flagged = true
            flags++
        }
    }
}

function click(event) {
    if(gamestate != 'playing') {
        return null;
    }
    const rect = canvas.getBoundingClientRect()
    const x = (event.clientX - rect.left - len - 10) / (len + interval)
    const y = (event.clientY - rect.top - len - 10) / (len + interval)
    if((x > 0) && (y > 0) && (x % 1 < rfrac) && (y % 1 < rfrac)) {
        xc = Math.trunc(x)
        yc = Math.trunc(y)
        if(event.button == 0)
            discover(xc, yc)
        else if(event.button == 2)
            flag(xc, yc)
    }
    if(check())
        win()
    draw()
}

canvas.addEventListener('mousedown', function(e) {
    click(e)
})

canvas.addEventListener('contextmenu', event => event.preventDefault())
