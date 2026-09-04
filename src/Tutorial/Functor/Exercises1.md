# Functor 練習問題 パート1

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Functor/Exercises1.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Functor/Exercises1.md)  
> 🤖 **翻訳:** Gemini 3.8 Flash

1. `Maybe`, `List`, `List1`, `Vect n`, `Either e`, `Pair a` に対する独自の `Functor'` 実装を記述してください。

2. Functor のペアに対する名前付き `Functor` 実装を記述してください（`Product` に対して実装したものと同様です）。

3. データ型 `Identity`（*base* の `Control.Monad.Identity` から利用可能）に対する `Functor` を実装してください：

   ```idris
   record Identity a where
     constructor Id
     value : a
   ```

4. 少し珍しい例です：`Const e`（*base* の `Control.Applicative.Const` から利用可能）に対する `Functor` を実装してください。第2型パラメータが実行時に一切使われず、その型の値が存在しないことに戸惑うかもしれません。このような型は **幽霊型（ファントム型 / phantom types）** と呼ばれることがあります。値に追加の型情報を付与してタグ付けするのに非常に有用です。

   惑わされる必要はありません。可能な実装は1通りしかありません。いつものように、迷ったらホールを使ってコンパイラに導いてもらいましょう。

   ```idris
   record Const (e,a : Type) where
     constructor MkConst
     value : e
   ```

5. 以下はデータストアにおける CRUD 操作（Create, Read, Update, Delete）を記述する直和型です：

   ```idris
   data Crud : (i : Type) -> (a : Type) -> Type where
     Create : (value : a) -> Crud i a
     Update : (id : i) -> (value : a) -> Crud i a
     Read   : (id : i) -> Crud i a
     Delete : (id : i) -> Crud i a
   ```

   `Crud i` に対する `Functor` を実装してください。

6. 以下はデータサーバーからのレスポンスを記述する直和型です：

   ```idris
   data Response : (e, i, a : Type) -> Type where
     Created : (id : i) -> (value : a) -> Response e i a
     Updated : (id : i) -> (value : a) -> Response e i a
     Found   : (values : List a) -> Response e i a
     Deleted : (id : i) -> Response e i a
     Error   : (err : e) -> Response e i a
   ```

   `Response e i` に対する `Functor` を実装してください。

7. `Validated e` に対する `Functor` を実装してください：

   ```idris
   data Validated : (e,a : Type) -> Type where
     Invalid : (err : e) -> Validated e a
     Valid   : (val : a) -> Validated e a
   ```

