// Based on https://github.com/ethereumjs/ethereumjs-monorepo/blob/master/packages/vm/examples/run-solidity-contract/README.md
import { join } from 'path'
import { readFileSync } from 'fs'

const solc = require('solc')

/**
 * This function creates the input for the Solidity compiler.
 *
 * For more info about it, go to https://solidity.readthedocs.io/en/v0.5.10/using-the-compiler.html#compiler-input-and-output-json-description
 */
function getSolcInput() {
  return {
    language: 'Solidity',
    sources: {
      'contracts/UniV3Fees.sol': {
        content: readFileSync(join(__dirname, 'contracts', 'UniV3Fees.sol'), 'utf8'),
      },
      // If more contracts were to be compiled, they should have their own entries here
    },
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      evmVersion: 'petersburg',
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode'],
        },
      },
    },
  }
}

/**
 * This function compiles all the contracts in `contracts/` and returns the Solidity Standard JSON
 * output. If the compilation fails, it returns `undefined`.
 *
 * To learn about the output format, go to https://solidity.readthedocs.io/en/v0.5.10/using-the-compiler.html#compiler-input-and-output-json-description
 */
function compileContracts() {
  const input = getSolcInput()
  const output = JSON.parse(solc.compile(JSON.stringify(input)))

  let compilationFailed = false

  if (output.errors) {
    for (const error of output.errors) {
      if (error.severity === 'error') {
        console.error(error.formattedMessage)
        compilationFailed = true
      } else {
        console.warn(error.formattedMessage)
      }
    }
  }

  if (compilationFailed) {
    return undefined
  }

  return output
}

function getUniV3FeesBytecode(solcOutput: any): any {
  return solcOutput.contracts['contracts/UniV3Fees.sol'].UniV3Fees.evm.bytecode.object
}

async function main() {
  console.log('Compiling...')

  const solcOutput = compileContracts()
  if (solcOutput === undefined) {
    throw new Error('Compilation failed')
  } else {
    console.log('Compiled the contract')
  }

  const bytecode = getUniV3FeesBytecode(solcOutput)

  console.log('Contract bytecode:', bytecode)
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
