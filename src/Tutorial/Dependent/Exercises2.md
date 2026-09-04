# 依存型 練習問題 パート2

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Dependent/Exercises2.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Dependent/Exercises2.md)  
> 🤖 **翻訳:** Gemini 3.8 Flash

1. 関数 `a -> a` を受け取り、`Vect n a` の位置 `k < n` にある要素を更新する関数 `update` を実装してください。

2. `Vect n a` の位置 `k <= n` に `a` 型の値を挿入する関数 `insert` を実装してください。`k` は新しく挿入された値のインデックスであり、以下の関係が成り立つことに注意してください：

   ```repl
   index k (insert k v vs) = v
   ```

3. ベクトル内の指定されたインデックスにある要素を削除する関数 `delete` を実装してください。

   これは練習問題 1 や 2 よりも難易度が高いです。ベクトルが1要素短くなることを型に正しく表現する必要があります。

4. `Fin` を使って `List` に対する安全なインデックスアクセスを実装することもできます。`safeIndexList` の型と実装を考えてみてください。

   ヒント: どこから始めればよいかわからない場合は、`fromList` の型を参考にしてください。また、`index` とは引数の順序を変える必要があるかもしれません。

5. `Fin n` を対応する自然数に変換する関数 `finToNat` を実装し、これを使用して `k <= n` を満たす `Vect n a` の先頭 `k` 個の要素を取り出す関数 `take` を宣言・実装してください。

6. `k <= n` を満たす自然数 `n` から値 `k` を減算する関数 `minus` を実装してください。

7. 練習問題 6 の `minus` を使用して、`k <= n` を満たす `Vect n a` から先頭 `k` 個の要素を削除（スキップ）する関数 `drop` を宣言・実装してください。

8. `Vect n a` を位置 `k <= n` で分割し、ベクトルの接頭辞（prefix）と接尾辞（suffix）をペアにまとめて返す関数 `splitAt` を実装してください。

   ヒント: 実装内で `take` と `drop` を使用してください。

ヒント: `Fin n` が `n` より真に小さい値からなるため、`Fin (S n)` は `n` 以下の値から構成されます。

補足: 関数 `take`, `drop`, `splitAt` は、正しく全域性が証明可能であるものの、型を指定するのが少々煩雑です。次のセクションで見るように、これらの型をより簡潔に宣言する別の方法が存在します。

