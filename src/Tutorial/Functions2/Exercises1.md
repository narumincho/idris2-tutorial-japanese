# 関数 パート2 練習問題

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Functions2/Exercises1.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Functions2/Exercises1.md)  
> 🤖 **翻訳:** Gemini 3.8 Flash

本節の練習問題は、純粋関数型コードを書く経験を深めるためのものです。場合によっては `let` 式や `where` ブロックを使用すると便利ですが、必ずしも必須ではありません。

練習問題 4 は極めて重要です。`traverseList` は、*Prelude* で利用可能な最も強力で汎用性の高い関数の1つである `traverse`（型を調べてみてください！）の特化バージョンです。

1. *base* の `Data.List` モジュールは `find` および `elem` 関数をエクスポートしています。それらの型を調べ、`handleRequest` の実装で使用してください。これにより `where` ブロックを完全に排除できるはずです。

2. `handleRequest` をリファクタリングして `Either` を使用し、`handleRequest : DB -> Request -> Either Failure Album` となるようにしてください。ここで `Failure` は以下のように定義されます：

   ```idris
   data Failure : Type where
     UnknownUser : Email -> Failure
     InvalidPassword : Failure
     AccessDenied : Email -> Album -> Failure
   ```

   ヒント: ネストした `case` 式が役立つかもしれません。

3. DNA 鎖に現れる4つの [核酸塩基](https://ja.wikipedia.org/wiki/%E5%A1%A9%E5%9F%BA_(%E5%8C%96%E5%AD%A6)) を列挙する列挙型を定義してください。また、塩基のリストに対する型エイリアス `DNA` を定義してください。1つの文字（`Char` 型）を塩基に変換する関数 `readBase` を宣言・実装してください。実装では `'A'`, `'a'` のような文字リテラルを使用できます。この関数はパースに失敗する可能性があるため、結果の型を適切に設定してください。

4. 失敗する可能性のある関数を用いて、リスト内のすべての値を変換しようとする以下の関数を実装してください。すべての変換が成功した場合にのみ、変換された値のリストを元の順序で保持する `Just` を返すようにします。

   ```idris
   traverseList : (a -> Maybe b) -> List a -> Maybe (List b)
   ```

   関数が正しく動作することは、次のテストで確認できます: `traverseList Just [1,2,3] = Just [1,2,3]`。

5. 練習問題 3 と 4 で定義した関数や型を使用して、関数 `readDNA : String -> Maybe DNA` を実装してください。*Prelude* の `unpack` 関数も必要になります。

6. DNA 鎖の相補鎖を計算する関数 `complement : DNA -> DNA` を実装してください。

