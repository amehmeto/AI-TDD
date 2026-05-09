import { describe, expect, mock, test } from 'bun:test'
import { getConfig } from 'src/commands/getConfig.ts'
import { existsSync } from 'fs'

const existsSyncMock = mock(existsSync)

describe('getConfig', () => {
  test('getConfig - config file does not exist', () => {
    existsSyncMock.mockReturnValue(false)

    const config = getConfig()

    expect(config).toEqual({
      RUN_TESTS: null,
      OPENAI_API_KEY: undefined,
      MODEL: 'gpt-4-1106-preview',
      LANGUAGE: 'en',
    })
  })
})
