# 再帰と畳み込み 練習問題 パート3

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Folds/Exercises3.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Folds/Exercises3.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

本節の練習問題では、さまざまなデータ型に対する `Foldable` を実装します。できる限りインターフェースの 6 つの関数すべてを手動で実装してみてください。

1. `Crud i` に対する `Foldable` を実装してください：

   ```idris
   data Crud : (i : Type) -> (a : Type) -> Type where
     Create : (value : a) -> Crud i a
     Update : (id : i) -> (value : a) -> Crud i a
     Read   : (id : i) -> Crud i a
     Delete : (id : i) -> Crud i a
   ```

2. `Response e i` に対する `Foldable` を実装してください：

   ```idris
   data Response : (e, i, a : Type) -> Type where
     Created : (id : i) -> (value : a) -> Response e i a
     Updated : (id : i) -> (value : a) -> Response e i a
     Found   : (values : List a) -> Response e i a
     Deleted : (id : i) -> Response e i a
     Error   : (err : e) -> Response e i a
   ```

3. `List01` に対する `Foldable` を実装してください。`toList`、`foldMap`、`foldl` の実装には末尾再帰を使用してください。

   ```idris
   data List01 : (nonEmpty : Bool) -> Type -> Type where
     Nil  : List01 False a
     (::) : a -> List01 False a -> List01 ne a
   ```

4. `Tree`（ローズツリー）に対する `Foldable` を実装してください。末尾再帰にする必要はありませんが、`assert_smaller` や `assert_total` を使わずに全域性チェッカーを通す必要があります。

   ヒント: 実装が正しいかどうかは、`treeToVect` の結果に対して同じ畳み込みを実行し、結果が一致するかどうかでテストできます。

5. `Functor` や `Applicative` と同様に、`Foldable` も合成可能です：2つの畳み込み可能なコンテナ型の直積および合成は、再び畳み込み可能になります。`Comp` と `Product` に対する `Foldable` を実装してこれを証明してください：

   ```idris
   record Comp (f,g : Type -> Type) (a : Type) where
     constructor MkComp
     unComp  : f (g a)

   record Product (f,g : Type -> Type) (a : Type) where
     constructor MkProduct
     fst : f a
     snd : g a
   ```

