import ExtendedMap from "./ExtendedMap"

describe("ExtendedMap", () => {
  const testMap = new Map<number, number>([
    [1, 2],
    [2, 4],
    [3, 6],
    [4, 8],
    [5, 10],
  ])

  test("map", () => {
    const input = new ExtendedMap(testMap).map((key, value) => [key * 2, value * 2]).toMap()
    const output = new Map<number, number>([
      [2, 4],
      [4, 8],
      [6, 12],
      [8, 16],
      [10, 20],
    ])

    expect(input).toEqual(output)
  })

  test("filter", () => {
    const input = new ExtendedMap(testMap).filter((key) => key % 2 === 0).toMap()
    const output = new Map<number, number>([
      [2, 4],
      [4, 8],
    ])

    expect(input).toEqual(output)
  })

  test("sort", () => {
    const input = new ExtendedMap(testMap).sort(([, aValue], [, bValue]) => bValue - aValue).toMap()
    const output = new Map<number, number>([
      [5, 10],
      [4, 8],
      [3, 6],
      [2, 4],
      [1, 2],
    ])

    expect(input).toEqual(output)
  })
})
