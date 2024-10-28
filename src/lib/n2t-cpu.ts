export interface N2TCPUInstructionA {
  type: 'A';
  v: number;
}

export interface N2TCPUInstructionC {
  type: 'C';
  a: number;
  c: number;
  d: number;
  j: number;
}

export type N2TCPUInstruction = N2TCPUInstructionA | N2TCPUInstructionC;

export interface N2TCPUConstructorProps {
  RAM?: Uint8Array;
}

export class N2TInstructionParser {
  allocatedSymbols: { [key: string]: number } = {
    // Keyword symbols
    'SP':     0,
    'LCL':    1,
    'ARG':    2,
    'THIS':   3,
    'THAT':   4,
    'SCREEN': 16384,
    'KBD':    24576,
    // Shortcut symbols
    'R0':     0,
    'R1':     1,
    'R2':     2,
    'R3':     3,
    'R4':     4,
    'R5':     5,
    'R6':     6,
    'R7':     7,
    'R8':     8,
    'R9':     9,
    'R10':    10,
    'R11':    11,
    'R12':    12,
    'R13':    13,
    'R14':    14,
    'R15':    15,
  };
  nextSymbolAllocation: number = 16;

  constructor() {}

  /**
   * Allocates a symbol name and returns the address, or returns the address of an existing symbol
   * @param symbol - The symbol to allocate or get the address of if already allocated
   * @returns {number} - The address of the symbol
   */
  allocateOrGetSymbol(symbol: string): number {
    if (this.allocatedSymbols[symbol]) return this.allocatedSymbols[symbol];

    const newAddress = this.nextSymbolAllocation;
    this.allocatedSymbols[symbol] = newAddress;
    this.nextSymbolAllocation++;
    return newAddress;
  }

  /**
   * Takes a binary instruction and returns an object with the instruction type and relevant data
   * @param instruction - The 16-bit binary representation of the instruction
   * @returns {N2TCPUInstruction} - The parsed instruction data
   */
  static instructionBinarySplit(instruction: number): N2TCPUInstruction {
    if (instruction >= 1 << 16) throw new RangeError('Instruction value overflow');

    if (instruction >> 15 == 0) {
      return {
        type: 'A',
        v: instruction & ~(1 << 15),
      };
    } else {
      return {
        type: 'C',
        a: (instruction >> 12) & 0b1,
        c: (instruction >> 6) & 0b111111,
        d: (instruction >> 3) & 0b111,
        j: instruction & 0b111,
      };
    }
  }

  /**
   * Converts a human-readable string representation of an instruction to a 16-bit binary representation
   * Must be called as an instance method to keep track of variables for A-instructions
   * @param instruction - The human-readable string representation of the instruction
   * @returns {number} - The 16-bit binary representation of the instruction as an integer
   */
  instructionStringToBin(instruction: string): number {
    if (instruction.startsWith('@')) {
      const strA = instruction.slice(1);
      let intA;
      if (strA.match(/^\d+$/)) intA = parseInt(strA);
      else if (strA.match(/^[a-zA-Z_]+$/)) intA = this.allocateOrGetSymbol(strA);
      else throw new SyntaxError('Cannot parse A-instruction target');

      if (intA >= 1 << 15) throw new RangeError('A-instruction value out of range');
      
      return intA;
    } else {
      // Split C-instruction into its separate parts (dest=comp;jump)
      const destIdx = instruction.indexOf('=');
      const jumpIdx = instruction.indexOf(';');

      const dest = destIdx == -1 ? null : instruction.slice(0, destIdx);
      const comp = instruction.slice(destIdx + 1, jumpIdx == -1 ? instruction.length : jumpIdx);
      const jump = jumpIdx == -1 ? null : instruction.slice(jumpIdx + 1);

      // This could probably be better?
      const compBits = {
        '0': 0b0101010,
        '1': 0b0111111,
        '-1': 0b0111010,
        'D': 0b0001100,
        'A': 0b0110000,
        '!D': 0b0001101,
        '!A': 0b0110001,
        '-D': 0b0001111,
        '-A': 0b0110011,
        'D+1': 0b0011111,
        'A+1': 0b0110111,
        'D-1': 0b0001110,
        'A-1': 0b0110010,
        'D+A': 0b0000010,
        'D-A': 0b0010011,
        'A-D': 0b0000111,
        'D&A': 0b0000000,
        'D|A': 0b0010101,
        'M': 0b1110000,
        '!M': 0b1110001,
        '-M': 0b1110011,
        'M+1': 0b1110111,
        'M-1': 0b1110010,
        'D+M': 0b1000010,
        'D-M': 0b1010011,
        'M-D': 0b1000111,
        'D&M': 0b1000000,
        'D|M': 0b1010101,
      }[comp];

      // Validate instruction
      if (!compBits) throw new SyntaxError('Cannot parse C-instruction computation');
      if (dest && !dest.match(/^[ADM]+$/)) throw new SyntaxError('Cannot parse C-instruction destination');
      if (jump && !jump.match(/^(JGT|JEQ|JGE|JLT|JNE|JLE|JMP)$/)) throw new SyntaxError('Cannot parse C-instruction jump');

      // Convert dest and jump to binary
      let destBin = 0;
      if (dest?.includes('A')) destBin |= 0b100;
      if (dest?.includes('D')) destBin |= 0b010;
      if (dest?.includes('M')) destBin |= 0b001;

      let jumpBin = 0;
      if (jump) {
        jumpBin = {
          JGT: 0b001,
          JEQ: 0b010,
          JGE: 0b011,
          JLT: 0b100,
          JNE: 0b101,
          JLE: 0b110,
          JMP: 0b111,
        }[jump] ?? 0;
      }

      // Now we can combine everything into a single number
      return 0b111 << 13 | compBits << 6 | destBin << 3 | jumpBin;
    }
  }
}

/**
 * Executes an ALU operation with the given inputs and control bits
 * @param x ALU input x
 * @param y ALU input y
 * @param zx ALU zero-x
 * @param nx ALU negate-x
 * @param zy ALU zero-y
 * @param ny ALU negate-y
 * @param f ALU function
 * @param no ALU negate output
 * @returns The result of the ALU operation
 */
export function N2TALU(x: number, y: number, zx: boolean, nx: boolean, zy: boolean, ny: boolean, f: boolean, no: boolean): number {
  console.log('ALU execution', { x, y, zx, nx, zy, ny, f, no });
  if (x >= 1 << 16 || y >= 1 << 16) throw new RangeError('ALU input out of range');
  const x_ = zx ? 0 : x;
  const y_ = zy ? 0 : y;
  const x__ = nx ? ~x_ : x_;
  const y__ = ny ? ~y_ : y_;
  const out = f ? x__ & y__ : x__ | y__;
  return no ? ~out : out;
}

export class N2TCPU {
  parser: N2TInstructionParser;
  // CPU registers
  A: number;
  D: number;
  PC: number;
  // 16-bit registers for RAM and ROM
  RAM: Uint8Array;
  ROM: Uint16Array;
  

  constructor({ RAM }: N2TCPUConstructorProps = {}) {
    // Initialize the instruction parser
    this.parser = new N2TInstructionParser();
    // Initialize registers
    this.A = 0;
    this.D = 0;
    this.PC = 0;
    // Initialize RAM and ROM
    this.RAM = RAM ?? new Uint8Array(2 ** 16);
    this.ROM = new Uint16Array(2 ** 16);
  }

  tick(): void {
    console.log('CPU tick started', { PC: this.PC, instruction: this.ROM[this.PC] });
    this.executeInstruction(this.ROM[this.PC]);
  }

  executeInstruction(instruction: number): void {
    let instP = N2TInstructionParser.instructionBinarySplit(instruction);
    if (instP.type == 'A') {
      this.A = instP.v;
      this.PC++;
    } else {
      const destBin = instP.d;
      const compBin = instP.c;
      const jumpBin = instP.j;

      // Emulating an ALU for this is so dumb but it's better than a massive switch statement
      let compVal = N2TALU(
        this.D, (destBin & 0b100) ? this.RAM[this.A] : this.A,
        (destBin & 0b100) != 0,
        (destBin & 0b010) != 0,
        (destBin & 0b001) != 0,
        (compBin & 0b100000) != 0,
        (compBin & 0b010000) != 0,
        (compBin & 0b001000) != 0
      );

      if (destBin) {
        if (destBin & 0b100) this.A = compVal;
        if (destBin & 0b010) this.D = compVal;
        if (destBin & 0b001) this.RAM[this.A] = compVal;
      }

      // This is Good Enough[tm]
      const shouldJump = [
        false,        // 0b000; (never jump)
        compVal > 0,  // 0b001; JGT (jump if greater than)
        compVal == 0, // 0b010; JEQ (jump if equal)
        compVal >= 0, // 0b011; JGE (jump if greater than or equal)
        compVal < 0,  // 0b100; JLT (jump if less than)
        compVal != 0, // 0b101; JNE (jump if not equal)
        compVal <= 0, // 0b110; JLE (jump if less than or equal)
        true,         // 0b111; JMP (unconditional jump)
      ][jumpBin] ?? false;
      if (shouldJump) this.PC = this.A;
      else this.PC++;
    }

    console.log('CPU tick completed', {
      instruction: {
        raw: instruction.toString(2).padStart(16, '0'),
        parsed: instP,
      },
      registers: {
        A: this.A,
        D: this.D,
        M: this.RAM[this.A],
        PC: this.PC,
      }
    });
  }

  setInstruction(instruction: string, address: number): void {
    this.ROM[address] = this.parser.instructionStringToBin(instruction);
  }
}