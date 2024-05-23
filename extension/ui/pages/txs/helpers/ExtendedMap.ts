class ExtendedMap<K, V> {
  constructor(private source: Map<K, V>) {}

  map<RK, RV>(callback: (key: K, value: V) => [RK, RV]): ExtendedMap<RK, RV> {
    const resultMap = new Map<RK, RV>()
    for (const [key, value] of this.source.entries()) {
      resultMap.set(...callback(key, value))
    }
    return new ExtendedMap(resultMap)
  }

  filter(callback: (key: K, value: V) => boolean): ExtendedMap<K, V> {
    const resultMap = new Map<K, V>()
    for (const [key, value] of this.source.entries()) {
      if (!callback(key, value)) continue
      resultMap.set(key, value)
    }
    return new ExtendedMap(resultMap)
  }

  sort(compareFunction: (a: [K, V], b: [K, V]) => number): ExtendedMap<K, V> {
    const sortedEntries = Array.from(this.source.entries()).sort(compareFunction)
    const resultMap = new Map(sortedEntries)
    return new ExtendedMap(resultMap)
  }

  toMap(): Map<K, V> {
    return this.source
  }
}

export default ExtendedMap
