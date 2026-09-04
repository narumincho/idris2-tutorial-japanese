# 関数 パート2

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Functions2.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Functions2.md)  
> 🤖 **翻訳:** Gemini 3.8 Flash

ここまで、Haskell などの純粋で強い静的型付けを持つ関数型言語と共通する Idris のコア機能について学んできました：（高階）関数、代数的データ型、パターンマッチ、パラメータ多相（ジェネリックな型と関数）、アドホック多相（インターフェースと制約付き関数）。

本章では、Idris の関数とその型を本格的に解き明かしていきます。暗黙の引数、名前付き引数、消去（erasure）と多重度（quantities）について学びます。しかしその前に、1行には収まらない複雑な関数を実装するのに役立つ `let` 束縛と `where` ブロックについて見ていきましょう。それでは始めましょう！

```idris
module Tutorial.Functions2

%default total
```

<!-- vi: filetype=idris2:syntax=markdown
-->
