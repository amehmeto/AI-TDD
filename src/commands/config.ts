import { intro, outro } from '@clack/prompts'
import { command } from 'cleye'
import { homedir } from 'os'
import { join as pathJoin } from 'path'
import { getI18nLocal } from '../i18n'
import { outroError } from '../utils/prompts'
import { COMMANDS } from './enums'
import { getConfig } from 'src/commands/getConfig.ts'
import { setConfig } from 'src/commands/setConfig.ts'

export enum CONFIG_KEYS {
  OPENAI_API_KEY = 'OPENAI_API_KEY',
  MODEL = 'MODEL',
  RUN_TESTS = 'RUN_TESTS',
  LANGUAGE = 'LANGUAGE',
}

export const DEFAULT_MODEL = 'gpt-4-1106-preview'
export const DEFAULT_MODEL_TOKEN_LIMIT = 100_000

enum CONFIG_COMMAND_MODES {
  get = 'get',
  set = 'set',
}

const validateConfig = (
  key: string,
  condition: any,
  validationMessage: string,
) => {
  if (!condition) {
    outroError(`Unsupported config key ${key}: ${validationMessage}`)

    process.exit(1)
  }
}

export const configValidators = {
  [CONFIG_KEYS.OPENAI_API_KEY](value: any, config?: any) {
    validateConfig(CONFIG_KEYS.OPENAI_API_KEY, value, 'Cannot be empty')
    validateConfig(
      CONFIG_KEYS.OPENAI_API_KEY,
      value.startsWith('sk-'),
      'Must start with "sk-"',
    )

    return value
  },

  [CONFIG_KEYS.LANGUAGE](value: any) {
    validateConfig(
      CONFIG_KEYS.LANGUAGE,
      getI18nLocal(value),
      `${value} is not supported yet`,
    )

    return getI18nLocal(value)
  },

  [CONFIG_KEYS.RUN_TESTS](value: any) {
    validateConfig(
      CONFIG_KEYS.RUN_TESTS,
      typeof value === 'string',
      `${value} is not of type string`,
    )

    return value
  },

  [CONFIG_KEYS.MODEL](value: any) {
    validateConfig(
      CONFIG_KEYS.MODEL,
      [
        DEFAULT_MODEL,
        'gpt-4',
        'gpt-3.5-turbo',
        'gpt-3.5-turbo-16k',
        'gpt-3.5-turbo-0613',
      ].includes(value),
      `${value} is not supported yet, 'gpt-4-1106-preview' (default), 'gpt-4', or 'gpt-3.5-turbo'`,
    )

    return value
  },
}

export type ConfigType = {
  [key in CONFIG_KEYS]?: any
}

export const configCommand = command(
  {
    name: COMMANDS.config,
    parameters: ['<mode>', '<key>', '<values...>'],
  },
  async (argv) => {
    console.log('WESH ALORS')
    intro('aitdd — config')
    try {
      const { mode, key, values } = argv._

      if (mode === CONFIG_COMMAND_MODES.get) {
        const config = getConfig() || {}
        for (const key of values) {
          outro(`${key}=${config[key as keyof typeof config]}`)
        }
      } else if (mode === CONFIG_COMMAND_MODES.set) {
        await setConfig(key, values.join(' '))
      } else {
        throw new Error(
          `Unsupported mode: ${mode}. Valid modes are: "set" and "get"`,
        )
      }
    } catch (error) {
      outroError(error as string)
      process.exit(1)
    }
  },
)
