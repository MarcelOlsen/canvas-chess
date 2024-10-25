# CANVAS CHESS

This project is a simple interactive chess board built using TypeScript, and the `chess.js` library. It uses HTML5 Canvas for rendering the chessboard and pieces.

## Prerequisites

- Node.js (>=14.x)
- Yarn (or npm) -> i've used yarn, so i also recommend that

## Installation

1. Clone the repository

2. Install the dependencies:
   ```sh
   yarn install
   ```
   or if you are using npm:
   ```sh
   npm install
   ```

## Building the Project

To build the project, run:

```sh
yarn build
```

or if you are using npm:

```sh
npm run build
```

This will compile the TypeScript files and bundle the JavaScript files using Webpack.

## Development

For development, you can use `nodemon` to watch for changes and automatically rebuild the project. To start the development server, run:

```sh
yarn dev
```

or if you are using npm:

```sh
npm run dev
```

This will compile the TypeScript files, bundle the JavaScript files, and serve the project using `serve`. The project will be available at `http://localhost:3000`.

## Usage

1. Open `http://localhost:3000` in your web browser.
2. You should see a chessboard rendered on the canvas.
3. You can interact with the chessboard by dragging and dropping pieces (rendering the piece while dragging is yet to be implemented).

## Project Structure

- `src/`: Contains the TypeScript source files.
- `public/`: Contains the static files, including the HTML file and the bundled JavaScript file.
- `dist/`: Contains the compiled JavaScript files.
- `nodemon.json`: Configuration file for `nodemon`.
- `webpack.config.js`: Configuration file for Webpack.
- `package.json`: Project metadata and dependencies.

## License

This project is licensed under the MIT License.
