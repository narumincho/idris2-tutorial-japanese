# プリミティブ 練習問題 パート1

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Prim/Exercises1.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Prim/Exercises1.md)  
> 🤖 **翻訳:** Gemini 3.8 Flash

この練習問題では、文字列を消費・変換するためのいくつかのユーティリティ関数を実装します。ここでは期待される型シグネチャを明示していませんので、ご自身で考えて定義してください。

1. 文字列に対する `map`、`filter`、`mapMaybe` に類似した関数を実装してください。これらの戻り値の型は常に文字列（`String`）であるべきです。

2. 文字列に対する `foldl` および `foldMap` に類似した関数を実装してください。

3. 文字列に対する `traverse` に類似した関数を実装してください。戻り値の型はエフェクトでラップされた文字列であるべきです。

4. 文字列に対する bind 演算子（`>>=`）を実装してください。戻り値の型は再び文字列であるべきです。

