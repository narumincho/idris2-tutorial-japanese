# インターフェース 練習問題 パート1

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Interfaces/Exercises1.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Interfaces/Exercises1.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

1. 値のリストの中に、指定された基準値よりも大きい要素が少なくとも1つ含まれている場合にのみ `True` を返す関数 `anyLarger` を実装してください。実装にはインターフェース `Comp` を使用してください。

2. 値のリストの中に、指定された基準値よりも大きい要素 **のみ** が含まれている場合にのみ `True` を返す関数 `allLarger` を実装してください。空リストの場合は自明に True となることに注意してください。実装にはインターフェース `Comp` を使用してください。

3. `Comp` の実装を持つ値のリストから最大の要素を取り出そうとする関数 `maxElem` を実装してください。同様に、最小の要素を取り出そうとする `minElem` も実装してください。戻り値の型を決定する際は、リストが空である可能性を考慮する必要があります。

4. リストや文字列のように連結可能な値のためのインターフェース `Concat` を定義してください。リストと文字列に対する実装を提供してください。

5. `Concat` の実装を持つ要素のリスト内のすべての値を連結する関数 `concatList` を実装してください。戻り値の型にリストが空である可能性を反映させてください。

