# エフェクトを伴う走査 練習問題 パート1

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Traverse/Exercises1.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Traverse/Exercises1.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

1. `Traversable` が `Functor` を制約（親インターフェース）に持つのは興味深い点です。`map` を `traverse` を使って実装することで、すべての `Traversable` が自動的に `Functor` になることを証明してください。

   ヒント: `Control.Monad.Identity` を思い出してください。

2. 同様に、`foldMap` を `traverse` を使って実装することで、すべての `Traversable` が `Foldable` になることを証明してください。

   ヒント: `Control.Applicative.Const` を思い出してください。

3. 慣れるために、`List1`, `Either e`, `Maybe` に対する `Traversable'` を実装してください。

4. `List01 ne` に対する `Traversable` を実装してください：

   ```idris
   data List01 : (nonEmpty : Bool) -> Type -> Type where
     Nil  : List01 False a
     (::) : a -> List01 False a -> List01 ne a
   ```

5. ローズツリーに対する `Traversable` を実装してください。全域性チェッカーをごまかさずに通すようにしてください。

   ```idris
   record Tree a where
     constructor Node
     value  : a
     forest : List (Tree a)
   ```

6. `Crud i` に対する `Traversable` を実装してください：

   ```idris
   data Crud : (i : Type) -> (a : Type) -> Type where
     Create : (value : a) -> Crud i a
     Update : (id : i) -> (value : a) -> Crud i a
     Read   : (id : i) -> Crud i a
     Delete : (id : i) -> Crud i a
   ```

7. `Response e i` に対する `Traversable` を実装してください：

   ```idris
   data Response : (e, i, a : Type) -> Type where
     Created : (id : i) -> (value : a) -> Response e i a
     Updated : (id : i) -> (value : a) -> Response e i a
     Found   : (values : List a) -> Response e i a
     Deleted : (id : i) -> Response e i a
     Error   : (err : e) -> Response e i a
   ```

8. `Functor`, `Applicative`, `Foldable` と同様に、`Traversable` も合成可能です。`Comp` と `Product` に対する `Traversable` を実装してこれを証明してください：

   ```idris
   record Comp (f,g : Type -> Type) (a : Type) where
     constructor MkComp
     unComp  : f (g a)

   record Product (f,g : Type -> Type) (a : Type) where
     constructor MkProduct
     fst : f a
     snd : g a
   ```

