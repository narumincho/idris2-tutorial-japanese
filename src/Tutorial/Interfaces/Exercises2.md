# インターフェース 練習問題 パート2

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Interfaces/Exercises2.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Interfaces/Exercises2.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

1. ペア（`Pair`）に対してインターフェース `Equals`、`Comp`、`Concat`、および `Empty` を実装してください。必要に応じて実装に制約を付けてください（複数の制約は他の関数の引数と同様に順次指定できることに注意してください: `Comp a => Comp b => Comp (a,b)`）。

2. 以下は二分木の実装です。この型に対してインターフェース `Equals` と `Concat` を実装してください。

   ```idris
   data Tree : Type -> Type where
     Leaf : a -> Tree a
     Node : Tree a -> Tree a -> Tree a
   ```

