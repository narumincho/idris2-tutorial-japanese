# Functor 練習問題 パート2

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Functor/Exercises2.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Functor/Exercises2.md)  
> 🤖 **翻訳:** Gemini 3.8 Flash

01. `Either e` と `Identity` に対する `Applicative'` を実装してください。

02. `Vect n` に対する `Applicative'` を実装してください。注意: `pure` を実装するためには、実行時に長さが判明している必要があります。これは、インターフェース実装に非消去の暗黙引数として渡すことで実現できます：

    ```idris
    implementation {n : _} -> Applicative' (Vect n) where
    ```

03. `e` が `Monoid` 制約を持つ `Pair e` に対する `Applicative'` を実装してください。

04. `e` が `Monoid` 制約を持つ `Const e` に対する `Applicative` を実装してください。

05. `e` が `Semigroup` 制約を持つ `Validated e` に対する `Applicative` を実装してください。これにより、*apply* の実装で両方が `Invalid` の場合に `(<+>)` を使ってエラーを蓄積（集約）できるようになります。

06. `CSVError` に `CSVError -> CSVError -> CSVError` 型のデータコンストラクタを追加し、それを使って `CSVError` に対する `Semigroup` を実装してください。

07. CSV パーサーおよびすべての関連関数をリファクタリングして、`Either` の代わりに `Validated` を返すように変更してください（これは練習問題 6 が解けている場合に機能します）。

    注目すべき点：`Validated` でもアプリカティブ構文がそのまま使えるため、既存のコードの変更はごくわずかで済みます。そしてこの変更により、CSV パーサーに **エラーの蓄積（error accumulation）** 機能が追加されます。REPL での実行例は以下の通りです：

    ```repl
    Solutions.Functor> hdecode [Bool,Nat,Gender] 1 "t,12,f"
    Valid [True, 12, Female]
    Solutions.Functor> hdecode [Bool,Nat,Gender] 1 "o,-12,f"
    Invalid (App (FieldError 1 1 "o") (FieldError 1 2 "-12"))
    Solutions.Functor> hdecode [Bool,Nat,Gender] 1 "o,-12,foo"
    Invalid (App (FieldError 1 1 "o")
      (App (FieldError 1 2 "-12") (FieldError 1 3 "foo")))
    ```

    Applicative Functor とヘテロジニアスリストの真価をご覧ください：わずか数行のコードで、エラー蓄積機能を備えた純粋で型安全かつ全域的な CSV 行パーサーが完成しました！

08. せっかく本章でヘテロジニアスリストを導入したので、少し発展的な実験をしてみましょう。

    この練習問題は、型レベルプログラミングのスキルを磨くためのものです。ヒントは最小限にしてあります。関数に期待される挙動、それを型でどう表現するか、そしてどう実装するかを自分で考えてみてください。型が正しく精密であれば、実装はほぼ自然に導かれます。

    1. `HList` に対する `head` を実装してください。
    2. `HList` に対する `tail` を実装してください。
    3. `HList` に対する `(++)` を実装してください。
    4. `HList` に対する `index` を実装してください。
    5. Idris プロジェクトの一部である *contrib* パッケージは、ヘテロジニアスベクトルのデータ型 `Data.HVect.HVect` を提供しています。`HList` との違いは、型のリストではなく型のベクトルでインデックス付けされている点だけです。独自の `HVect` 実装と、関数 `head`, `tail`, `(++)`, `index` を書いてください。
    6. さらなる挑戦として、`Vect m (HVect ts)` を転置する関数を実装してみてください。
       （行列表現のテーブルを行のベクトルから列のタプルに変換するのに役立ちます。）

09. `Comp f g` に対する `Applicative` を実装することで、2つの Applicative Functor の合成が再び Applicative Functor になることを示してください。

10. `Prod f g` に対する `Applicative` を実装することで、2つの Applicative Functor の直積（プロダクト）が再び Applicative Functor になることを示してください。

