# エフェクトを伴う走査 練習問題 パート2

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Traverse/Exercises2.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Traverse/Exercises2.md)  
> 🤖 **翻訳:** Gemini 3.8 Flash

本節は、State モナドへの理解を深めるための 2 つの発展的な練習問題で構成されています。第 1 問では状態付き計算の典型例である擬似乱数生成を扱い、第 2 問では状態の値だけでなく状態の **型** も変化させることができるインデックス付き State モナドを扱います。

1. 以下は単純な擬似乱数生成器の実装です：

   ```idris
   rnd : Bits64 -> Bits64
   rnd seed = fromInteger
            $ (437799614237992725 * cast seed) `mod` 2305843009213693951
   ```

   前の乱数から次の乱数を計算していくため、これは状態付き計算そのものです：

   ```idris
   Gen : Type -> Type
   Gen = State Bits64
   ```

   01. `rnd` を使って `bits64` を実装してください。現在の状態を返し、その後 `rnd` を呼び出して状態を更新します。

       ```idris
       bits64 : Gen Bits64
       ```

   02. `[0, upper]` の範囲の乱数を生成する `range64` を実装してください。

       ```idris
       range64 : (upper : Bits64) -> Gen Bits64
       ```

       同様に、`[min a b, max a b]` の範囲の乱数を生成する `interval64`、および任意の整数型に対する `interval` を実装してください：

       ```idris
       interval64 : (a,b : Bits64) -> Gen Bits64

       interval : Num n => Cast n Bits64 => (a,b : n) -> Gen n
       ```

   03. ランダムな真偽値（`Bool`）を生成するジェネレータを実装してください。

   04. `Fin n` の乱数ジェネレータを実装してください。ヒント: `Data.Fin.natToFin` を参照してください。

   05. ベクトルからランダムに要素を 1 つ選択するジェネレータを実装してください。

   06. `vect` および `list` を実装してください。

       ```idris
       vect : {n : _} -> Gen a -> Gen (Vect n a)

       list : Gen Nat -> Gen a -> Gen (List a)
       ```

       これらを用いてジェネレータを REPL でテストするための `testGen` を実装してください：

       ```idris
       testGen : Bits64 -> Gen a -> Vect 10 a
       ```

   07. `choice` を実装してください：

       ```idris
       choice : {n : _} -> Vect (S n) (Gen a) -> Gen a
       ```

   08. `either` を実装してください：

       ```idris
       either : Gen a -> Gen b -> Gen (Either a b)
       ```

   09. 印字可能な ASCII 文字（コード 32〜126）のジェネレータを実装してください。

   10. 文字列のジェネレータを実装してください：

       ```idris
       string : Gen Nat -> Gen Char -> Gen String
       ```

   11. `HList` に対するジェネレータ `hlist` を実装してください：

       ```idris
       data HListF : (f : Type -> Type) -> (ts : List Type) -> Type where
         Nil  : HListF f []
         (::) : (x : f t) -> (xs : HLift f ts) -> HListF f (t :: ts)

       hlist : HListF Gen ts -> Gen (HList ts)
       ```

   12. `hlist` を `Gen` だけでなく任意のアプリカティブファンクタで動作するように一般化してください。

2. `State s a` では状態の **値** は変更できますが、状態の **型** を変更することはできません。たとえば、要素を取り出して長さが 1 減るような操作（`uncons`）は通常の `State` では表現できません：

   ```idris
   uncons : Vect (S n) a -> (Vect n a, a)
   uncons (x :: xs) = (xs, x)
   ```

   状態の型が遷移できる **インデックス付き State（Indexed State）** データ型を作成してください。

   1. 入力状態の型と出力状態の型が異なる状態付き計算をカプセル化するデータ型を定義してください。
   2. その型に対する `Functor` を実装してください。
   3. イディオムブラケットで利用可能にするための演算子を実装してください。
   4. do ブロックで利用可能にするための演算子（*bind*）を実装してください。
   5. これらを一般化したインターフェース `IxApplicative` および `IxMonad` を定義し、インスタンスを実装してください。
   6. `get`, `put`, `modify`, `runState`, `evalState`, `execState` をインデックス付き State 型向けに実装してください。
   7. 入力状態と出力状態の型が一致する場合に、通常の `Applicative` および `Monad` のインスタンスになることを示してください。

