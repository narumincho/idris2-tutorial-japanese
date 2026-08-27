# おわりに

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Functor/Conclusion.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Functor/Conclusion.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

- `Functor`, `Applicative`, `Monad` インターフェースは、`Type -> Type` 型の型コンストラクタを扱う際に頻出するプログラミングパターンを抽象化します。このようなデータ型は「文脈を持つ値（values in a context）」や「エフェクトを伴う計算（effectful computations）」とも呼ばれます。
- `Functor` は、内部構造を変えずに文脈内の値に純粋関数をマップ（適用）することを可能にします。
- `Applicative` は、複数のエフェクトフルな計算に対して多引数関数を適用し、純粋な値を文脈に持ち上げることを可能にします。
- `Monad` は、中間結果に基づいて後続の計算を動的に決定しながらエフェクトフルな計算を順次連鎖させることを可能にします。
- `Monad` と異なり、`Functor` と `Applicative` は合成可能です：2つの Functor / Applicative の直積や合成は、再び Functor / Applicative になります。
- Idris は本章のインターフェースに対する糖衣構文を提供しています：`Applicative` にはイディオムブラケット `[| ... |]`、`Monad` には *do ブロック* と bang 演算子 `!` です。

## 次のステップ

次の章では、再帰、全域性チェック、そしてコンテナ型を集約するためのインターフェース `Foldable` について詳しく学びます。

