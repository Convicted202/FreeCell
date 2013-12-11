var comConst = {
    IMAGE_SOURCES : [
        "/2.png",  "/3.png",
        "/4.png",  "/5.png",
        "/6.png",  "/7.png",
        "/8.png",  "/9.png",
        "/10.png", "/J.png",
        "/Q.png",  "/K.png",
        "/A.png"
    ],
    FOLDER_SOURCES : {
        "hearts"   : 0,
        "diamonds" : 1, 
        "clubs"    : 2,
        "spades"   : 3
    },
    CARD_VAL : {
        TWO     : 2,  THREE   : 3,
        FOUR    : 4,  FIVE    : 5,
        SIX     : 6,  SEVEN   : 7,
        EIGHT   : 8,  NINE    : 9,
        TEN     : 10, JACK    : 11,
        QUEEN   : 12, KING    : 13,
        ACE     : 14
    },
    CARD_WIDTH : 100,
    CARD_HEIGHT : 150,
    CARD_VERT_MARGIN : 30,
    CARD_AREA_TOP : 200,
    CANV_WIDTH : 1050,
    CANV_HEIGHT : 700,
    CARD_INSER_ANIM_SPEED : 50,
    eps : 0.01
};

function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


var images = [];


/* 
defining animation functions
*/
window.requestAnimFrame = (function() {
    return  window.requestAnimationFrame       || 
            window.webkitRequestAnimationFrame || 
            window.mozRequestAnimationFrame    || 
            window.oRequestAnimationFrame      || 
            window.msRequestAnimationFrame     || 
            function(/* function */ callback, /* DOMElement */ element){
                window.setTimeout(callback, 1000 / 60);
            };
})();

window.cancelAnimationFrame = (function() {
    return  window.cancelAnimationFrame     ||
            window.mozCancelAnimationFrame  ||
            function(id) {
                clearTimeout(id);
            };
})();

/*
preload all images
*/
function initImages (sources, folders, callback) {
    var images = {},
        loadedImages = 0,
        numImages = 0,
        imSrc, fdSrc;
    // get num of sources
    for (fdSrc in folders) {
        for(imSrc in sources) {
            numImages++;
        }
    }
    for (fdSrc in folders) {
        for(imSrc in sources) {
        images[folders[fdSrc] + imSrc] = new Image();
        images[folders[fdSrc] + imSrc].onload = function() {
            if(++loadedImages >= numImages) {
                try {
                    callback(images);
                } catch (exception) {
                }
            }
        };
        images[folders[fdSrc] + imSrc].src = fdSrc + sources[imSrc];
        }
    }
    
}

function initializeLogic() {
var canvas = document.getElementById("canvas"),
    context = canvas.getContext("2d"),
    dom = new DOM(0, 0, 20, 100, 150),
    freecell = new DOM(0, 0, 20, 100, 150),
    cards = [],
    allCards = new Cards(context),
    go = null;
    
    canvas.width = comConst.CANV_WIDTH;
    canvas.height = comConst.CANV_HEIGHT;

    context.fillStyle = "#50915e";
    context.fillRect(0, 0, comConst.CANV_WIDTH, comConst.CANV_HEIGHT);

    dom.move(new State(canvas.width - dom.getWidth() - 20, 10));
//    dom.linkContext(context);
    dom.draw(context);
    
    freecell.move(new State(20, 10));
//    freecell.linkContext(context);
    freecell.draw(context);
    
    //Array.prototype.push.call(cards, new Card(1, comConst.CARD_VAL.ACE, 7, 0));
//    cards[0].linkContext(context);
    //cards[0].draw(context);
    //allCards.draw(context);
    
    go = new gameObject (freecell, dom, allCards, "#50915e");
    go.initBuffer (new Dimension(comConst.CANV_WIDTH, comConst.CANV_HEIGHT));
    
    allCards.generateSequence();
   // allCards.animateNestInsert(context, new State(0, comConst.CARD_AREA_TOP), go);
    allCards.moveToNests(new State(0, comConst.CARD_AREA_TOP - 100), go);
    //cards[0].animateMoveTo(context, new State(300, 300), go);
}

function init(){
    initImages(comConst.IMAGE_SOURCES, comConst.FOLDER_SOURCES, function (img) {
//        for (var im in img) {
//            context.drawImage(img[im], 50, 50, 100, 150);
//        }
        images = img;
        initializeLogic();
    });
    
    //drawDomPlaceholder(context, 50, 50, 100, 150);
}



/**
 * Draws a rounded rectangle using the current state of the canvas. 
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} x The top left x coordinate
 * @param {Number} y The top left y coordinate 
 * @param {Number} width The width of the rectangle 
 * @param {Number} height The height of the rectangle
 * @param {Number} radius The corner radius. Defaults to 5;
 * @param {Boolean} fill Whether to fill the rectangle. Defaults to false.
 * @param {Boolean} stroke Whether to stroke the rectangle. Defaults to true.
 */
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof radius === "undefined") {
        radius = 5;
    }
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (stroke) {
        ctx.stroke();
    }
    if (fill) {
        ctx.fill();
    }        
}

function State (x, y, active) {
    this.x      = x || 0;
    this.y      = y || 0;
    //this.active = active && (active instanceof Boolean) || false;
}

function Dimension (width, height) {
    this.width = width || 0;
    this.height = height || 0;
}

/*
represents one card placeholder in the DOM 
*/
function DOMPlaceholder (x, y, width, height) {
    this.position = new State(x, y);
    this.dimension = new Dimension(width, height);
//    this.ctx = null;
    this.cards = [];
    this.hasCards = function () {
        return this.cards && this.cards.length !== 0 ;
    }
    this.drawPlaceholder = function (ctx) {
        ctx.rect(this.position.x, this.position.y, this.dimension.width, this.dimension.height);
        ctx.shadowColor = "#000";
        ctx.shadowBlur = 5;
        ctx.fillStyle = "#58a468";
        roundRect(ctx, this.position.x, this.position.y, this.dimension.width, this.dimension.height, 10, true, false);
    }
    this.draw = function (ctx) {
        if (!this.cards || this.cards.length === 0) {
            this.drawPlaceholder(ctx);
        } else {
            this.cards[this.cards.length - 1].draw(ctx);
        }       
    }
    this.move = function (state) {
        this.position = state;
    }
//    this.linkContext = function (context) {
//        this.ctx = context;
//    }
}

/* represents either a DOM and a free cell container
*/
function DOM (x, y, precision, cardWidth, cardHeight) {
    this.phPre = precision;
    this.phDim = new Dimension(cardWidth, cardHeight);
    this.position = new State(x, y);
    this.DOMPlaceholders = (function (that) {
        var dps = [], 
            ps,
            i;
        
        for (i = 0; i < 4; i++) {
            Array.prototype.push.call(dps, 
                                    new DOMPlaceholder(x + (that.phPre + that.phDim.width) * i,
                                                      y,
                                                      that.phDim.width,
                                                      that.phDim.height));
        }
        return dps;
    })(this);
    /*
    redraws all placeholders sequentially
    */
    this.draw = function (ctx) {
        var ph,
            len = this.DOMPlaceholders.length;
        
        for (ph = 0; ph < len; ph++) {
            this.DOMPlaceholders[ph].draw(ctx);
        }
    }
    this.getWidth = function () {
        return this.position.x + this.phDim.width * 4 + this.phPre * 3;
    }
    this.move = function (state) {
        var i,
            ph;
        
        for (i = 0; i < 4; i++) {
            ph = this.DOMPlaceholders[i];
            ph.move(new State(state.x + (ph.position.x - this.position.x),
                             state.y + (ph.position.y - this.position.y)));
        }
            
        this.position = state;
    }
//    this.linkContext = function (ctx) {
//        this.DOMPlaceholders.map(function (el) {
//            el.linkContext(ctx);
//        });
//    }
}

function gameObject (freecell, DOM, cards, backgroundColor) {
    this.freeCell = freecell;
    this.DOM = DOM;
    this.cards = cards;
    
    this.bgColor = backgroundColor;
    
    this.bufferCanvas = null;
    this.context = null;
    
    this.initBuffer = function (dimensions) {
        this.bufferCanvas = document.createElement("canvas");
        this.bufferCanvas.width = dimensions.width;
        this.bufferCanvas.height = dimensions.height;
        this.context = this.bufferCanvas.getContext("2d");
    }
    
    this.drawBG = function (ctx) {
        ctx.fillStyle = this.bgColor;
        ctx.fillRect(0, 0, comConst.CANV_WIDTH, comConst.CANV_HEIGHT);
    }
}

function Card (lear, value, column, row) {
    var root = this,
        animId = null,
        diff = null,
        animationPos = {
            startPos  : null,
            endPos    : null,
            animFrame : null,
            diff      : null // 0 - changing x's ; 1 - changing y's
        };
    
    this.lear = lear;
    this.value = value;
    this.column = column;
    this.row = row
    this.state = null
    this.pos = null;
    this.isMoving = false;
//    this.ctx = null;
    this.setPosition = function (x, y) {
        this.pos = new State(x, y);
    }
    this.draw = function (ctx) {
        ctx.drawImage(images['' + this.lear + (this.value - 2)], this.pos.x, this.pos.y, comConst.CARD_WIDTH, comConst.CARD_HEIGHT);
        this.state = new State(this.pos.x, this.pos.y);
    }
    this.getDiffs = function (amount) {
        var x, y;
        amount = amount * animationPos.animFrame;
        if (Math.abs(animationPos.startPos.x - animationPos.endPos.x) < comConst.eps && Math.abs(animationPos.startPos.y - animationPos.endPos.y) < comConst.eps ||
           Math.abs(this.pos.x - animationPos.endPos.x) < comConst.eps && Math.abs(this.pos.y - animationPos.endPos.y) < comConst.eps) {
            return false;
        }
        if (animationPos.diff === 0) {
            x = animationPos.startPos.x + amount;
            if (x > animationPos.endPos.x) {
                x = animationPos.endPos.x;
                animationPos.diff = 1;
                return new State(animationPos.endPos.x, animationPos.endPos.y);
            }
            y = amount * (animationPos.endPos.y - animationPos.startPos.y) / (animationPos.endPos.x - animationPos.startPos.x) + animationPos.startPos.y;
        } else {
            y = animationPos.startPos.y + amount;
            if (y > animationPos.endPos.y) {
                y = animationPos.endPos.y;
                animationPos.diff = 0;
                return new State(animationPos.endPos.x, animationPos.endPos.y);
            }
            x = amount * (animationPos.endPos.x - animationPos.startPos.x) / (animationPos.endPos.y - animationPos.startPos.y) + animationPos.startPos.x;
        }
//        if (this.value == 11) debugger;
        return new State(x, y);
    }
//    this.getDiffs = function (from, to, amount) {
//        var x, y;
//        if (Math.abs(from.x - to.x) < comConst.eps && Math.abs(from.y - to.y) < comConst.eps) {
//            return to;
//        }
//        if (Math.abs(to.x - from.x) > Math.abs(to.y - from.y)) {
//            x = from.x + amount;
//            if (x > to.x) {
//                x = to.x;
//            }
//            y = amount * (to.y - from.y) / (to.x - from.x) + from.y;
//        } else {
//            if (y > to.y) {
//                y = to.y;
//            }
//            y = from.y + amount;
//            x = amount * (to.x - from.x) / (to.y - from.y) + from.x;
//        }
////        if (this.value == 11) debugger;
//        return new State(x, y);
//    }
//    this.animateMoveTo = function animation (ctx, endPosition, gObj) {
//        if (!root.isMoving) {
//            root.isMoving = true;
//        }
//        
//        animId = requestAnimFrame ( function () {
//            animation(ctx, endPosition, gObj);
//        });
//        
//        diff = root.getDiffs(root.pos, endPosition, comConst.CARD_INSER_ANIM_SPEED);
//        
//        if (Math.abs(diff.x - endPosition.x) > comConst.eps || Math.abs(diff.y - endPosition.y) > comConst.eps) {
//            root.pos.x = diff.x;
//            root.pos.y = diff.y;
//        } else {
//            if (animId !== null) {
////                gObj.cards.map(function(el) {
////                    el.setPosition(endPosition.x, endPosition.y);
////                });
//                cancelAnimationFrame(animId);
//                root.isMoving = false;
//                animId = null;
//            }
//        }
//        gObj.drawBG(ctx);
//        gObj.freeCell.draw(ctx);
//        gObj.DOM.draw(ctx);
////        gObj.cards.map(function(el) {
////            el.draw(ctx);
////        });
//        root.draw(ctx);
//        //root.draw(ctx);
//        
//    }
    this.initAnimation = function (startPosition, endPosition) {
        animationPos.startPos = startPosition;
        animationPos.endPos = endPosition;
        if (Math.abs(endPosition.x - startPosition.x) > Math.abs(endPosition.y - startPosition.y)) {
            animationPos.diff = 0;
        } else {
            animationPos.diff = 1;
        }
        animationPos.animFrame = 0;
        if (!this.isMoving) {
            this.isMoving = true;
        }
        this.setPosition(startPosition.x, startPosition.y);
    }
    this.updateAnimation = function () {
        var diff = this.getDiffs(comConst.CARD_INSER_ANIM_SPEED);
        if (!diff) {
            this.isMoving = false;
        } else {
            animationPos.animFrame++;
            this.pos = diff;
        }
    }
    this.calcState = function setPosition (column, row) {
        return new State(((comConst.CANV_WIDTH - 8 * comConst.CARD_WIDTH) / 9) * (column + 1) + comConst.CARD_WIDTH * column, comConst.CARD_AREA_TOP + row * comConst.CARD_VERT_MARGIN);
    }
    this.state = this.calcState(column, row);
//    this.pos = new State(this.state.x, this.state.y);
    
//    this.linkContext = function (context) {
//        this.ctx = context;
//    }
}

function Cards (context) {
    var cardList = (function () {
        var list = [],
            i, j;
        for (j = 0; j < 4; j++) {
            for (i = 0; i < 13; i++) {
                Array.prototype.push.call(list, new Card(j, i + 2, (i + (j * 13)) % 8, ((i + (j * 13)) / 8) ^ 0));
            }
        }
        
        return list;
    })(),
        root = this;
    
    function changeCards (card1, card2) {
        var tmp = card1;
        card1 = card2;
        card2 = tmp;
    }

    this.ctx = context;
    this.cards = [
        [], [], [], [], [], [], [], []
    ];
    this.generateSequence = function () {
        for (var i = 0; i < 52 * 52; i++) {
            changeCards(cardList[getRandomInt(0, 51)], cardList[getRandomInt(0, 51)]);
        }
        for (var i = 0; i < 52; i++) {
            console.log(cardList[i].lear + '' + cardList[i].value + ", ");
        }
    }
    this.draw = function (ctx) {
        for (var i = 0; i < cardList.length; i++) {
            cardList[i].draw(ctx);
        }
    }
//    this.animateNestInsert = function (ctx, start, gObj) {
//        var i,
//            card;
//        for (i = 0; i < 13; i++) {
//            card = cardList[i];
//            card.setPosition(start.x, start.y);
//            card.animateMoveTo(ctx, card.calcState(card.column, card.row), gObj)
//        }
//    }
    this.updateCardsMove = function () {
        for (var i = 0; i < cardList.length; i++) {
            cardList[i].updateAnimation();
        }
    }
    this.updateMoveToNest = function updateAndRedraw (gObj) {
            requestAnimationFrame(function () {
                updateAndRedraw(gObj);
            });
            
            gObj.drawBG(root.ctx);
            gObj.freeCell.draw(root.ctx);
            gObj.DOM.draw(root.ctx);
            for (var i = 0; i < cardList.length; i++) {
                if (cardList[i].isMoving) {  
                    cardList[i].updateAnimation();
                }
                cardList[i].draw(root.ctx);
            }
    }
    this.moveToNests = function (from, gObj) {
        var i,
            cardsLength = cardList.length;
        for (i = 0; i < cardsLength; i++) {
            cardList[i].initAnimation(from, cardList[i].calcState(cardList[i].column, cardList[i].row));
        }
        
        this.updateMoveToNest(gObj);
    }
    
    this.map = function (callback) {
        cardList.map(callback);
    }

}

function utils () {
    this.lear = {
        hearts      : 1,
        diamonds    : 2,
        clubs       : 3,
        spades      : 4
    },
    this.value = {
        two     : 2,
        three   : 3,
        four    : 4,
        five    : 5,
        six     : 6,
        seven   : 7,
        eight   : 8,
        nine    : 9,
        ten     : 10,
        jack    : 11,
        queen   : 12,
        king    : 13,
        ace     : 14
    }
}

//ctx.save();
//    ctx.beginPath();
//    ctx.fillStyle = 'red';
//    ctx.arc(150,75,50, 0, Math.PI * 2, false)
//    ctx.closePath();
//    ctx.fill();
//
//    ctx.beginPath();
//    ctx.arc(150,75,50, 0, Math.PI * 2, false);
//    ctx.clip();
//
//    ctx.beginPath();
//    //ctx.strokeStyle = 'black';
//    ctx.lineWidth = 5;
//    ctx.shadowBlur = 15;
//    ctx.shadowColor = 'black';
//    //ctx.shadowOffsetX = 0;
//    //ctx.shadowOffsetY = 0;
//    ctx.arc(150,75,50 + 3, 0, Math.PI * 2, false);
//    ctx.stroke();
//ctx.restore();