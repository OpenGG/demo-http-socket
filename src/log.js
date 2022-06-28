import chalk from 'chalk'
const Log = (prefix, color = 'blue' ) => {
  return (...msg) => {
    console.log(chalk[color](`${prefix}: ${msg[0]}`), ...msg.slice(1))
  }
}

export default Log