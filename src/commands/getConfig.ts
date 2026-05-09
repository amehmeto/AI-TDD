import { existsSync, readFileSync } from 'fs'
import { parse as iniParse } from 'ini'
import { outro } from '@clack/prompts'
import {
  CONFIG_KEYS,
  ConfigType,
  configValidators,
  DEFAULT_MODEL,
} from 'src/commands/config.ts'
import { join as pathJoin } from 'path/posix'
import { homedir } from 'os'

const configPath = pathJoin(homedir(), '.aitdd', 'config')

export const getConfig = (): ConfigType | null => {
  const defaults = {
    [CONFIG_KEYS.RUN_TESTS]: null,
    [CONFIG_KEYS.OPENAI_API_KEY]: null,
    [CONFIG_KEYS.MODEL]: DEFAULT_MODEL,
    [CONFIG_KEYS.LANGUAGE]: 'en',
  }

  const configFromEnv = {
    [CONFIG_KEYS.OPENAI_API_KEY]: process.env.OPENAI_API_KEY,
    [CONFIG_KEYS.MODEL]: process.env.MODEL || defaults.MODEL,
    [CONFIG_KEYS.LANGUAGE]: process.env.LANGUAGE || defaults.LANGUAGE,
    [CONFIG_KEYS.RUN_TESTS]: process.env.RUN_TESTS || null,
  }

  const configExists = existsSync(configPath)
  if (!configExists) return configFromEnv

  const configFile = readFileSync(configPath, 'utf8')
  const config = iniParse(configFile)

  for (const configKey of Object.keys(config)) {
    if (
      !config[configKey] ||
      ['null', 'undefined'].includes(config[configKey])
    ) {
      config[configKey] = defaults[configKey as CONFIG_KEYS]

      continue
    }

    try {
      const validator = configValidators[configKey as CONFIG_KEYS]
      const validValue = validator(
        config[configKey] ?? configFromEnv[configKey as CONFIG_KEYS],
        config,
      )

      config[configKey] = validValue
    } catch (error) {
      outro(
        `'${configKey}' name is invalid, it should be either '${configKey.toUpperCase()}' or it doesn't exist.`,
      )
      outro(
        `Manually fix the '.env' file or global '~/.aitdd/config' config file.`,
      )
      process.exit(1)
    }
  }

  return config
}
