const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const getTimestamp = () => {
  return new Date().toLocaleString('en-IN', { 
    timeZone: 'Asia/Kolkata',
    hour12: true 
  });
};

const logger = {
  success: (message, details = '') => {
    console.log(
      `${colors.green}✓ [SUCCESS]${colors.reset} ${colors.bright}${getTimestamp()}${colors.reset} - ${message}`,
      details ? `\n  ${colors.cyan}${details}${colors.reset}` : ''
    );
  },

  error: (message, error = null) => {
    console.error(
      `${colors.red}✗ [ERROR]${colors.reset} ${colors.bright}${getTimestamp()}${colors.reset} - ${message}`
    );
    if (error) {
      console.error(`  ${colors.red}${error.stack || error.message || error}${colors.reset}`);
    }
  },

  warning: (message, details = '') => {
    console.warn(
      `${colors.yellow}⚠ [WARNING]${colors.reset} ${colors.bright}${getTimestamp()}${colors.reset} - ${message}`,
      details ? `\n  ${colors.yellow}${details}${colors.reset}` : ''
    );
  },

  info: (message, details = '') => {
    console.log(
      `${colors.blue}ℹ [INFO]${colors.reset} ${colors.bright}${getTimestamp()}${colors.reset} - ${message}`,
      details ? `\n  ${colors.cyan}${details}${colors.reset}` : ''
    );
  },

  db: (message, details = '') => {
    console.log(
      `${colors.magenta}◉ [DATABASE]${colors.reset} ${colors.bright}${getTimestamp()}${colors.reset} - ${message}`,
      details ? `\n  ${colors.cyan}${details}${colors.reset}` : ''
    );
  },

  auth: (message, details = '') => {
    console.log(
      `${colors.cyan}🔐 [AUTH]${colors.reset} ${colors.bright}${getTimestamp()}${colors.reset} - ${message}`,
      details ? `\n  ${colors.cyan}${details}${colors.reset}` : ''
    );
  },

  email: (message, details = '') => {
    console.log(
      `${colors.magenta}📧 [EMAIL]${colors.reset} ${colors.bright}${getTimestamp()}${colors.reset} - ${message}`,
      details ? `\n  ${colors.cyan}${details}${colors.reset}` : ''
    );
  },

  upload: (message, details = '') => {
    console.log(
      `${colors.blue}📤 [UPLOAD]${colors.reset} ${colors.bright}${getTimestamp()}${colors.reset} - ${message}`,
      details ? `\n  ${colors.cyan}${details}${colors.reset}` : ''
    );
  },

  server: (message, details = '') => {
    console.log(
      `${colors.green}🚀 [SERVER]${colors.reset} ${colors.bright}${getTimestamp()}${colors.reset} - ${message}`,
      details ? `\n  ${colors.cyan}${details}${colors.reset}` : ''
    );
  }
};

module.exports = logger;
