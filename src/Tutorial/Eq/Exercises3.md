# 命題的等値性 練習問題 パート3

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Eq/Exercises3.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Eq/Exercises3.md)  
> 🤖 **翻訳:** Gemini 3.8 Flash

1. 空でない `Void` のベクトルが存在し得ないことを、`Uninhabited` の実装として示してください。

2. 練習問題 1 を、任意の要素を持たない（`Uninhabited` な）要素型に対して一般化してください。

3. `a = b` が成り立たないなら、`b = a` も成り立たないことを示してください。

4. `a = b` が成り立ち、かつ `b = c` が成り立たないなら、`a = c` も成り立たないことを示してください。

5. `Crud i a` に対して可能な限り一般的な形で `Uninhabited` を実装してください：

   ```idris
   data Crud : (i : Type) -> (a : Type) -> Type where
     Create : (value : a) -> Crud i a
     Update : (id : i) -> (value : a) -> Crud i a
     Read   : (id : i) -> Crud i a
     Delete : (id : i) -> Crud i a
   ```

6. `ColType` に対する `DecEq` を実装してください。

7. 練習問題 6 のような実装は、コンストラクタの数の 2 乗に比例するパターンマッチが必要になります。これを簡略化するテクニックを試してください：

   1. 各 `ColType` の値に一意な自然数を割り当てる関数 `ctNat` を実装する。
   2. `ctNat` が単射（injective）であることを証明する。
   3. `ctNat` の結果に対して `decEq` を呼び出すことで、わずか数行で `DecEq ColType` を実装する。

