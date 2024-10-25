import { Chess, Color, PieceSymbol, Square } from "chess.js";

const chess = new Chess();
if (!chess)
    throw new Error("Failed to create chess instance");

const canvas: (HTMLCanvasElement | null) = document.querySelector("#chessBoard");

const GRID_ROWS = 8;
const GRID_COLS = 8;

if (!canvas) {
    throw new Error("Canvas not found");
}

const ctx = canvas.getContext("2d");
if (!ctx)
    throw new Error("Failed to get 2d context");

//since we have a square board, we can use the width of the canvas as the size of the square as well as the height, no difference
const SQUARE_SIZE = canvas.width / GRID_COLS;

let draggedPiece: { piece: { square: Square; type: PieceSymbol; color: Color } | null, x: number, y: number } | null = null;



interface PiecePaths {
    [key: string]: string;
}

//TODO: better way of naming the piece svg's for lookup
const piecePaths: PiecePaths = {
    "p-b": "images/pawn-b.svg",
    "r-b": "images/rook-b.svg",
    "n-b": "images/knight-b.svg",
    "b-b": "images/bishop-b.svg",
    "q-b": "images/queen-b.svg",
    "k-b": "images/king-b.svg",
    "p-w": "images/pawn-w.svg",
    "r-w": "images/rook-w.svg",
    "n-w": "images/knight-w.svg",
    "b-w": "images/bishop-w.svg",
    "q-w": "images/queen-w.svg",
    "k-w": "images/king-w.svg",
}

const pieceImages: { [key: string]: HTMLImageElement } = {};

// Preload images
const preloadImages = (paths: PiecePaths): Promise<void[]> => {
    const promises = Object.keys(paths).map(key => {
        return new Promise<void>((resolve, reject) => {
            const img = new Image();
            img.src = paths[key];
            img.onload = () => {
                pieceImages[key] = img;
                resolve();
            };
            img.onerror = reject;
        });
    });
    return Promise.all(promises);
};


//utils
const isSquareWhite = (rank: number, file: number) => {
    return rank % 2 === 0 && file % 2 === 0 || rank % 2 !== 0 && file % 2 !== 0
}

const getCoordsFromMove = (square: string) => {
    const x = square.charCodeAt(0) - 97;
    const y = 8 - parseInt(square.charAt(1));
    return { x, y }
}

const getLegalMovesFromSquare = (from: { x: number, y: number }) => {
    return chess.moves({ square: `${String.fromCharCode(97 + from.x)}${8 - from.y}` as Square, verbose: true }).map(move => move.to)
}

const getLegalMovesCoords = (from: { x: number, y: number }): Array<{ x: number, y: number }> => {
    return getLegalMovesFromSquare(from).map(move => getCoordsFromMove(move))
}



//draw logic
const drawLine = (ctx: CanvasRenderingContext2D, from: { x: number, y: number }, to: { x: number, y: number }) => {
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
}

const drawCols = (ctx: CanvasRenderingContext2D) => {
    ctx.moveTo(0, 0);
    ctx.fillStyle = "#000000"

    for (let x = 1; x <= GRID_COLS; ++x) {
        drawLine(ctx, { x: x * SQUARE_SIZE, y: 0 }, { x: x * SQUARE_SIZE, y: ctx.canvas.height });
    }
}

const drawRows = (ctx: CanvasRenderingContext2D) => {
    ctx.moveTo(0, 0);
    ctx.fillStyle = "#000000"

    for (let x = 1; x <= GRID_ROWS; ++x) {
        drawLine(ctx, { x: 0, y: x * SQUARE_SIZE }, { x: ctx.canvas.width, y: x * SQUARE_SIZE });
    }
}

const fillSquare = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, colour: string) => {
    ctx.fillStyle = colour;
    ctx.fillRect(x, y, size, size);
}

const fillSquares = (ctx: CanvasRenderingContext2D, boardSize: number) => {
    const SQUARE_SIZE = ctx.canvas.width / boardSize;
    ctx.moveTo(0, 0);
    for (let rank = 0; rank < boardSize; rank++) {
        for (let file = 0; file < boardSize; file++) {
            if (isSquareWhite(rank, file))
                fillSquare(ctx, rank * SQUARE_SIZE, file * SQUARE_SIZE, SQUARE_SIZE, "#769656")
            else
                fillSquare(ctx, rank * SQUARE_SIZE, file * SQUARE_SIZE, SQUARE_SIZE, "#eeeed2")

        }
    }
}

const drawPieceImage = (ctx: CanvasRenderingContext2D, piece: { square: Square; type: PieceSymbol; color: Color }, x: number, y: number) => {
    const img = pieceImages[`${piece.type}-${piece.color}`];
    if (!img)
        return
    ctx.drawImage(img, x, y, SQUARE_SIZE, SQUARE_SIZE);
}

const drawPieces = (ctx: CanvasRenderingContext2D, position: ({
    square: Square;
    type: PieceSymbol;
    color: Color;
} | null)[][]) => {
    if (!position)
        throw new Error("Position is null");
    for (let i = 0; i < position.length; i++) {
        for (let j = 0; j < position[i].length; j++) {
            const piece = position[i][j];
            if (piece) {
                drawPieceImage(ctx, piece, j * SQUARE_SIZE, i * SQUARE_SIZE);
            }

        }
    }
}

const drawBoard = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    drawCols(ctx);
    drawRows(ctx);
    fillSquares(ctx, 8)
    drawPieces(ctx, chess.board())
    //TODO: think about whether to highlight squares on danger or move made (kinda like chesscom)
}

const drawCircle = (ctx: CanvasRenderingContext2D, r: number, at: { x: number, y: number }) => {
    ctx.fillStyle = 'rgb(0, 0, 0, 0.5)'
    ctx.beginPath()
    ctx.arc(at.x, at.y, r, 0, 2 * Math.PI)
    ctx.fill()
}

const drawLegalMove = (ctx: CanvasRenderingContext2D, from: { x: number, y: number }, to: { x: number, y: number }) => {
    ctx.fillStyle = 'rgb(0, 0, 0, 0.3)'
    ctx.fillRect(to.x * SQUARE_SIZE, to.y * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
    const centeredCoords: { x: number, y: number } = { x: to.x * SQUARE_SIZE + SQUARE_SIZE / 2, y: to.y * SQUARE_SIZE + SQUARE_SIZE / 2 }
    drawCircle(ctx, SQUARE_SIZE / 6, { x: centeredCoords.x, y: centeredCoords.y })
}

const drawLegalMoves = (ctx: CanvasRenderingContext2D, from: { x: number, y: number }) => {
    const legalMoveCoords: Array<{ x: number, y: number }> = getLegalMovesCoords(from)
    legalMoveCoords.map(move => drawLegalMove(ctx, from, move))
}



//handlers
const handleDraggedPiecePickup = (clientX: number, clientY: number) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((clientX - rect.left) / SQUARE_SIZE);
    const y = Math.floor((clientY - rect.top) / SQUARE_SIZE);
    draggedPiece = { piece: chess.board()[y][x], x, y };
}

const handleDraggedPieceDrop = (dropX: number, dropY: number) => {
    if (draggedPiece) {
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((dropX - rect.left) / SQUARE_SIZE);
        const y = Math.floor((dropY - rect.top) / SQUARE_SIZE);
        const from = `${String.fromCharCode(97 + draggedPiece.x)}${8 - draggedPiece.y}`;
        const to = `${String.fromCharCode(97 + x)}${8 - y}`;
        chess.move({ from, to });
        draggedPiece = null;
    }
}


//preloading images, cause otherwise they won't be available on draw
preloadImages(piecePaths).then(() => {
    drawBoard(ctx)
}).catch(error => {
    console.error("Failed to load images", error);
});



//events
addEventListener('mousedown', ({ clientX, clientY }) => {
    handleDraggedPiecePickup(clientX, clientY);
    if (draggedPiece) {
        drawLegalMoves(ctx, { x: draggedPiece.x, y: draggedPiece.y });
    }
})

//TODO: Implement dragging behaviour of pieces

addEventListener('mouseup', ({ clientX, clientY }) => {
    if (draggedPiece) {
        handleDraggedPieceDrop(clientX, clientY);
        drawBoard(ctx);
    }
})