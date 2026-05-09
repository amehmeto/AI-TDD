import { getConfig } from 'src/commands/getConfig.ts'
import { writeFileSync } from 'fs'
import { stringify as iniStringify } from 'ini'
import { outroSuccess } from 'src/utils/prompts.ts'
import { CONFIG_KEYS, configValidators } from 'src/commands/config.ts'
import { join as pathJoin } from 'path/posix'
import { homedir } from 'os'

const configPath = pathJoin(homedir(), '.aitdd', 'config')

export const setConfig = (key: string, value: string) => {
  const config = getConfig() || {}

  if (!configValidators.hasOwnProperty(key)) {
    throw new Error(`Unsupported config key: ${key}`)
  }

  let parsedConfigValue

  try {
    parsedConfigValue = JSON.parse(value)
  } catch (error) {
    parsedConfigValue = value
  }

  const validValue = configValidators[key as CONFIG_KEYS](parsedConfigValue)
  config[key as CONFIG_KEYS] = validValue

  writeFileSync(configPath, iniStringify(config), 'utf8')

  outroSuccess('Config successfully set')
}
