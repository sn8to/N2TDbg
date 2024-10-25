function luminance(r: number, g: number, b: number) {
  let [lumR, lumG, lumB] = [r, g, b].map(component => {
      let proportion = component / 255;

      return proportion <= 0.03928
          ? proportion / 12.92
          : Math.pow((proportion + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * lumR + 0.7152 * lumG + 0.0722 * lumB;
}

function contrastRatio(luminance1: number, luminance2: number) {
  let lighterLum = Math.max(luminance1, luminance2);
  let darkerLum = Math.min(luminance1, luminance2);

  return (lighterLum + 0.05) / (darkerLum + 0.05);
}

function checkContrast(color1: string, color2: string) {
  let [luminance1, luminance2] = [color1, color2].map(color => {
      /* Remove the leading hash sign if it exists */
      color = color.startsWith("#") ? color.slice(1) : color;

      let r = parseInt(color.slice(0, 2), 16);
      let g = parseInt(color.slice(2, 4), 16);
      let b = parseInt(color.slice(4, 6), 16);

      return luminance(r, g, b);
  });

  return contrastRatio(luminance1, luminance2);
}

function findBestContrast(bgColor: string) {
  const whiteContrast = checkContrast(bgColor, '#ffffff');
  const blackContrast = checkContrast(bgColor, '#000000');

  return whiteContrast > blackContrast ? '#ffffff' : '#000000';
}

export default class Logger {
  /** The name of the `Logger` instance. */
  name: string;
  /** The color used for styling logs output by this `Logger` instance. */
  color: string;
  /** Whether or not this `Logger` instance is enabled, if not then logs will not be output. */
  enabled: boolean;
  /** The contrasting text color used for styling logs output by this `Logger` instance. */
  _contrast: string;

  /**
   * Creates a new `Logger` instance which can output styled logs to the browser console.
   * @param name {string} The name of the `Logger` instance.
   * @param color {string} The color used for styling logs output by this `Logger` instance.
   */
  constructor(name: string, color: string, enabled?: boolean) {
    this.name = name;
    this.color = color;
    this.enabled = enabled ?? process.env.NODE_ENV === 'development';
    this._contrast = findBestContrast(color);
    
    if (name !== 'LoggerConstructor') {
      const ratio = checkContrast(this.color, this._contrast);
      if (ratio < 7) {
        new Logger('LoggerConstructor', '#ffff00').warn(
          `The color provided for the "${name}" logger is not sufficiently contrasting (${this._contrast} == ${ratio}, must be >= 7).`
        );
      }
    }
  }

  _log(type: string, ...args: any[]) {
    // todo: tell typescript what `console` is
    // @ts-ignore
    if (this.enabled) console[type](`%c ${this.name} `, `background-color:${this.color};color:${this._contrast};border-radius:0.4em;`, ...args);
  }

  setEnabled(newEnable: boolean) {
    this.enabled = newEnable;
  }

  log = this._log.bind(this, 'log');
  warn = this._log.bind(this, 'warn');
  error = this._log.bind(this, 'error');
  trace = this._log.bind(this, 'trace');
  debug = this._log.bind(this, 'debug');
}