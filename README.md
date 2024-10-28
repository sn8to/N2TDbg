# N2TDbg

Welcome to N2TDbg! This is a project to allow students and other Nand2Tetris users
to run their code locally in a browser.

## Description

N2TDbg is a browser debugging tool designed for the [Nand2Tetris](https://www.nand2tetris.org/)
course. It provides a user-friendly interface for debugging .hdl and .asm files while working
in each project folder.

## Features

> [!NOTE]
> Most of the features below likely have not been implemented yet. This is just a list of planned
> features until I have the time to complete them.

- Create or import `.hdl` files and test the chip design with your own inputs
- Create or import `.asm` files and execute the program at real speed or slower
- Import `.tst` files to run tests and show more detailed information about failures
- Provide proper syntax highlighting and documentation when hovering over `.hdl` or `.asm` code

## Usage

To use N2TDbg, you have two options. The first option is to use the hosted
version at https://sn8to.github.io/N2TDbg. If you would rather host it
yourself, you can follow the local installation instructions below.

## Local Installation / Development

To install N2TDbg locally, follow these steps:

0. Ensure you have Node.js installed, and Yarn is preferred but any other
   package manager will geberally work fine
1. Clone the repository: `git clone https://github.com/sn8to/N2TDbg.git`
2. Install the build dependencies: `yarn` (or your preference)
3. Run the build script to create a `dist/` folder with the website files:
   `yarn build` (or your preference)
4. For live-restart in development, you can also start a dev server with
   hot-reloading using the `yarn dev` command

## Contributing

Contributions are welcome! If you have any ideas, suggestions, or bug reports,
please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.
See the [LICENSE](LICENSE) file for more details.
