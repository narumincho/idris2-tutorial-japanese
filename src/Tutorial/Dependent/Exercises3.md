# 依存型 練習問題 パート3

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Dependent/Exercises3.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Dependent/Exercises3.md)  
> 🤖 **翻訳:** Gemini 3.8 Flash

1. 以下は `List` のリストを平坦化（flatten）する関数宣言です：

   ```idris
   flattenList : List (List a) -> List a
   ```

   `flattenList` を実装し、ベクトルのベクトルを平坦化する同様の関数 `flattenVect` を宣言・実装してください。

2. 前節の練習問題の `take'` と `splitAt'` を、`drop'` で示したテクニック（加算の型レベル計算）を使って実装してください。

3. `m x n` 行列（`Vect m (Vect n a)` として表現）を `n x m` 行列に転置する関数 `transpose` を実装してください。

   補足: これは少し歯ごたえのある問題ですが、ぜひ挑戦してみてください。いつものように、行き詰まったらホールを活用しましょう！

   実際の動作例は以下のようになります：

   ```repl
   Solutions.Dependent> transpose [[1,2,3],[4,5,6]]
   [[1, 4], [2, 5], [3, 6]]
   ```

