import { expect, test } from 'vitest'

// 1. モデル名のテスト
test('モデル名が空ではないことを確認する', () => {
  const modelName = 'Air Jordan 1'
  expect(modelName.length).toBeGreaterThan(0)
})

// 2. 価格のテスト（新しく追加）
test('価格は数字である必要がある', () => {
  const price = 24200
  expect(typeof price).toBe('number')
})