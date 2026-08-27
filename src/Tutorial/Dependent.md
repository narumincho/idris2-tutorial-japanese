# 依存型

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Dependent.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Dependent.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

値から型を計算し、型を関数の引数として渡し、関数の結果として型を返す能力——要するに **依存型付き言語 (dependently typed language)** であることは、Idris の最も際立った特徴の1つです。Haskell などの言語における高度な型レベル拡張の多く（そしてそれ以上のこと）が、依存型によって一挙に扱えるようになります。

```idris
module Tutorial.Dependent

%default total
```

以下の関数を考えてみましょう：

```idris
bogusMapList : (a -> b) -> List a -> List b
bogusMapList _ _ = []

bogusZipList : (a -> b -> c) -> List a -> List b -> List c
bogusZipList _ _ _ = []
```

これらの実装は型チェックを通過しますが、明らかにライブラリの利用者が期待する動作ではありません。最初の例では、要素を破棄したり順序を変えたりすることなく、リスト内のすべての値に関数引数を適用することを期待します。2つ目の例はより厄介です。2つのリスト引数は長さが異なる可能性があります。その場合、短い方のリストと同じ長さのリストを返すべきでしょうか？ 空リストを返すべきでしょうか？ あるいは、多くのユースケースでは2つのリストが同じ長さであることを前提とするべきではないでしょうか？ そのような事前条件を型としてどのように記述できるでしょうか？

<!-- vi: filetype=idris2:syntax=markdown
-->
